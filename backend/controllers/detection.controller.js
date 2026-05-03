import DetectionRecord from "../models/DetectionRecord.js";

// Brick weight (per single brick) configurable via env BRICK_WEIGHT (number)
const BRICK_WEIGHT = Number(process.env.BRICK_WEIGHT ?? 2.5);
// ESP command URL and external detector URL
const ESP_COMMAND_URL = process.env.ESP_COMMAND_URL || process.env.ESP_BASE_URL || null;
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

export async function reportRecord(req, res, next) {
  try {
    // Expecting { rawWeight, detectedCount, detectorResponse?, espResponse?, source? }
    const { rawWeight, detectedCount, detectorResponse, espResponse, source } = req.body || {};

    const brickWeightUsed = Number(process.env.BRICK_WEIGHT ?? BRICK_WEIGHT) || BRICK_WEIGHT;
    const numericRaw = rawWeight != null ? Number(rawWeight) : undefined;
    const numericDetected = detectedCount != null ? Number(detectedCount) : undefined;

    const calculatedCount = numericRaw != null && brickWeightUsed > 0 ? Math.round(numericRaw / brickWeightUsed) : undefined;

    const record = new DetectionRecord({
      rawWeight: numericRaw,
      detectedCount: numericDetected,
      calculatedCount,
      brickWeightUsed,
      detectorResponse,
      espResponse,
      source: source || "esp",
    });

    await record.save();
    return res.status(201).json({ success: true, record });
  } catch (err) {
    next(err);
  }
}

// Trigger ESP to capture image + weight, then run detector and save
export async function triggerEsp(req, res, next) {
  try {
    if (!ESP_COMMAND_URL) return res.status(400).json({ error: "ESP_COMMAND_URL not configured on server" });

    // Send capture command to ESP
    const espResp = await fetch(ESP_COMMAND_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ command: "capture" }),
    });

    if (!espResp.ok) {
      const text = await espResp.text();
      return res.status(502).json({ error: "ESP command failed", details: text });
    }

    const espJson = await espResp.json();

    // Expect espJson to contain weight and either image (base64) or imageUrl
    const rawWeight = espJson.weight ?? espJson.rawWeight ?? espJson.wt;

    let detectorResult = null;
    if (espJson.image) {
      // base64 image expected
      const b = Buffer.from(espJson.image, "base64");
      detectorResult = await runDetectorWithImage(b, "capture.jpg");
    } else if (espJson.imageUrl) {
      try {
        const fetchRes = await fetch(espJson.imageUrl);
        if (fetchRes.ok) {
          const ab = await fetchRes.arrayBuffer();
          const buf = Buffer.from(ab);
          detectorResult = await runDetectorWithImage(buf, "capture.jpg");
        }
      } catch (err) {
        console.warn("Failed fetching imageUrl from ESP:", err && err.message);
      }
    }

    const detectedCount = detectorResult?.count ?? espJson.detectedCount ?? espJson.detected ?? undefined;

    const brickWeightUsed = Number(process.env.BRICK_WEIGHT ?? BRICK_WEIGHT) || BRICK_WEIGHT;
    const numericRaw = rawWeight != null ? Number(rawWeight) : undefined;
    const calculatedCount = numericRaw != null && brickWeightUsed > 0 ? Math.round(numericRaw / brickWeightUsed) : undefined;

    const record = new DetectionRecord({
      rawWeight: numericRaw,
      detectedCount,
      calculatedCount,
      brickWeightUsed,
      detectorResponse: detectorResult,
      espResponse: espJson,
      source: "esp",
    });

    await record.save();

    return res.status(201).json({ success: true, record });
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
