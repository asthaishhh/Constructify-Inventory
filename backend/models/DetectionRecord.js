import mongoose from "mongoose";

const DetectionRecordSchema = new mongoose.Schema(
  {
    timestamp: { type: Date, default: () => new Date() },
    rawWeight: { type: Number, required: false },
    detectedCount: { type: Number, required: false },
    calculatedCount: { type: Number, required: false },
    brickWeightUsed: { type: Number, required: false },
    detectorResponse: { type: Object, required: false },
    espResponse: { type: Object, required: false },
    requestId: { type: String, required: false, index: true },
    source: { type: String, enum: ["esp", "manual", "detector"], default: "esp" },
  },
  { timestamps: true }
);

const DetectionRecord = mongoose.model("DetectionRecord", DetectionRecordSchema);

export default DetectionRecord;
