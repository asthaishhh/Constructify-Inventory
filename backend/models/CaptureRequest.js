import mongoose from "mongoose";

const CaptureRequestSchema = new mongoose.Schema(
  {
    deviceId: { type: String, default: "esp32cam-1", index: true },
    status: {
      type: String,
      enum: ["pending", "claimed", "resolved", "failed", "completed"],
      default: "pending",
      index: true,
    },
    requestedAt: { type: Date, default: () => new Date(), index: true },
    claimedAt: { type: Date },
    completedAt: { type: Date },
    resolvedAt: { type: Date },
    completedRecordId: { type: mongoose.Schema.Types.ObjectId, ref: "DetectionRecord" },
  },
  { timestamps: true }
);

const CaptureRequest = mongoose.model("CaptureRequest", CaptureRequestSchema);

export default CaptureRequest;
