import express from "express";
import {
  reportRecord,
  triggerEsp,
  listRecords,
  latestRecord,
} from "../controllers/detection.controller.js";

const router = express.Router();

// POST from ESP or other clients with rawWeight and detectedCount
router.post("/report", reportRecord);

// Trigger ESP to take a picture, fetch weight, run detector, and store
router.post("/trigger-esp", triggerEsp);

// List recent records
router.get("/", listRecords);

// Get latest record
router.get("/latest", latestRecord);

export default router;
