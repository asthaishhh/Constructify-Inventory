import express from "express";
import {
  reportRecord,
  triggerEsp,
  nextRequest,
  listRecords,
  latestRecord,
} from "../controllers/detection.controller.js";

const router = express.Router();

// POST from ESP or other clients with rawWeight and detectedCount
router.post("/report", reportRecord);

// Trigger ESP to take a picture, fetch weight, run detector, and store
router.post("/trigger-esp", triggerEsp);

// ESP polls this to see whether it should capture a new image
router.get("/next-request", nextRequest);

// List recent records
router.get("/", listRecords);

// Get latest record
router.get("/latest", latestRecord);

export default router;
