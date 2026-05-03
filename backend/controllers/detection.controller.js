import DetectionRecord from "../models/DetectionRecord.js";
import CaptureRequest from "../models/CaptureRequest.js";

// Brick weight (per single brick) configurable via env BRICK_WEIGHT (number)
const BRICK_WEIGHT = Number(process.env.BRICK_WEIGHT ?? 2.5);
const DETECTOR_URL = process.env.DETECTOR_URL || process.env.DETECTION_MODEL_URL || null;

// Helper to post image (ArrayBuffer/Buffer/Blob) to detector
async function runDetectorWithImage(imageBuffer, filename = "image.jpg") {
  if (!DETECTOR_URL) return null;
  try {
    // Support both browser-like FormData (Node 18+) and the form-data package (older nodes)
    let res;
    if (typeof globalThis.FormData === "function") {
      const form = new globalThis.FormData();
      let fileValue = imageBuffer;
      try {
        if (typeof Blob === "function" && !(imageBuffer instanceof Blob)) {
          fileValue = new Blob([imageBuffer]);
        }
      } catch (e) {
        // ignore Blob construction errors
      }
      // Append with filename (works in Node 18+ implementations)
      form.append("file", fileValue, filename);
      res = await fetch(DETECTOR_URL, { method: "POST", body: form });
    } else {
      const FormDataNode = (await import("form-data")).default;
      const form = new FormDataNode();
      form.append("file", imageBuffer, { filename });
      res = await fetch(DETECTOR_URL, { method: "POST", body: form, headers: form.getHeaders() });
    }
    if (!res.ok) {
      const text = await res.text();
      throw new Error(`Detector responded ${res.status}: ${text}`);
    }
    const json = await res.json();
    return json;
  } catch (err) {
    console.warn("Detector request failed:", err && err.message);
    return null;
  }
}

function serializeCaptureRequest(request) {
  if (!request) return null;

  const record = request.completedRecordId && typeof request.completedRecordId === "object"
    ? request.completedRecordId
    : null;

  return {
    ...request,
    record,
    isResolved: request.status === "resolved" || request.status === "completed",
  };
}

export async function reportRecord(req, res, next) {
  try {
    // Expecting { rawWeight, detectedCount, detectorResponse?, espResponse?, source? }
    const { rawWeight, detectedCount, detectorResponse, espResponse, source, requestId, image } = req.body || {};

    const brickWeightUsed = Number(process.env.BRICK_WEIGHT ?? BRICK_WEIGHT) || BRICK_WEIGHT;
    const numericRaw = rawWeight != null ? Number(rawWeight) : undefined;
    const detectorPayload = detectorResponse || (image ? await runDetectorWithImage(Buffer.from(image, "base64"), "capture.jpg") : null);
    const numericDetected = detectedCount != null
      ? Number(detectedCount)
      : Number(detectorPayload?.count ?? 0) || undefined;

    const calculatedCount = numericRaw != null && brickWeightUsed > 0 ? Math.round(numericRaw / brickWeightUsed) : undefined;

    const record = new DetectionRecord({
      rawWeight: numericRaw,
      detectedCount: numericDetected,
      calculatedCount,
      brickWeightUsed,
      detectorResponse: detectorPayload,
      espResponse,
      requestId,
      source: source || "esp",
    });

    await record.save();

    if (requestId && /^[a-fA-F0-9]{24}$/.test(String(requestId))) {
      await CaptureRequest.findByIdAndUpdate(requestId, {
        status: "resolved",
        completedAt: new Date(),
        resolvedAt: new Date(),
        completedRecordId: record._id,
      });
    }

    return res.status(201).json({ success: true, record });
  } catch (err) {
    next(err);
  }
}

// Queue a capture request on Render so the ESP can poll and capture a fresh image.
export async function triggerEsp(req, res, next) {
  try {
    // Support two modes:
    // 1) If caller provides `image` (base64) or `imageUrl`, run detector immediately and save a DetectionRecord.
    // 2) Otherwise, create a queued CaptureRequest (ESP will poll /next-request).
    const deviceId = String(req.body?.deviceId || req.query?.deviceId || "esp32cam-1");
    const { image, imageUrl } = req.body || {};

    if (image || imageUrl) {
      // Run detector immediately using provided image (base64) or fetch imageUrl
      let imageBuffer = null;
      try {
        if (image) {
          imageBuffer = Buffer.from(image, "base64");
        } else if (imageUrl) {
          const resp = await fetch(String(imageUrl));
          if (!resp.ok) throw new Error(`Failed to fetch imageUrl: ${resp.status}`);
          const arr = await resp.arrayBuffer();
          imageBuffer = Buffer.from(arr);
        }
      } catch (err) {
        return res.status(400).json({ success: false, error: `Invalid image/imageUrl: ${err.message}` });
      }

      const detectorPayload = imageBuffer ? await runDetectorWithImage(imageBuffer, "trigger.jpg") : null;
      const numericDetected = Number(detectorPayload?.count ?? 0) || undefined;

      const record = new DetectionRecord({
        rawWeight: undefined,
        detectedCount: numericDetected,
        calculatedCount: undefined,
        brickWeightUsed: Number(process.env.BRICK_WEIGHT ?? BRICK_WEIGHT) || BRICK_WEIGHT,
        detectorResponse: detectorPayload,
        espResponse: null,
        requestId: null,
        source: "trigger",
      });

      await record.save();
      return res.status(201).json({ success: true, record, detectorPayload });
    }

    // No image provided: queue a CaptureRequest for ESP to pick up
    const request = await CaptureRequest.create({ deviceId, status: "pending" });
    return res.status(201).json({ success: true, request });
  } catch (err) {
    next(err);
  }
}

// ESP polls this endpoint to claim the next pending capture request.
export async function nextRequest(req, res, next) {
  try {
    const deviceId = String(req.query?.deviceId || "esp32cam-1");
    const request = await CaptureRequest.findOneAndUpdate(
      { deviceId, status: "pending" },
      { status: "claimed", claimedAt: new Date() },
      { sort: { requestedAt: 1 }, new: true }
    ).lean();

    if (!request) {
      return res.json({ success: true, capture: false });
    }

    return res.json({
      success: true,
      capture: true,
      request: {
        id: request._id,
        deviceId: request.deviceId,
        requestedAt: request.requestedAt,
      },
    });
  } catch (err) {
    next(err);
  }
}

export async function getRequestById(req, res, next) {
  try {
    const request = await CaptureRequest.findById(req.params.requestId)
      .populate("completedRecordId")
      .lean();

    if (!request) {
      return res.status(404).json({ success: false, message: "Capture request not found" });
    }

    return res.json({ success: true, request: serializeCaptureRequest(request) });
  } catch (err) {
    next(err);
  }
}

export async function listRecords(req, res, next) {
  try {
    const limit = Math.min(Number(req.query.limit ?? 50), 200);
    const records = await DetectionRecord.find().sort({ createdAt: -1 }).limit(limit).lean();
    res.json({ success: true, records });
  } catch (err) {
    next(err);
  }
}

export async function latestRecord(req, res, next) {
  try {
    const record = await DetectionRecord.findOne().sort({ createdAt: -1 }).lean();
    res.json({ success: true, record });
  } catch (err) {
    next(err);
  }
}
