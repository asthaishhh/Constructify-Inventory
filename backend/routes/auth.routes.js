import express from "express";

import { signup, login, me, registerCompany, getCompanyProfile } from "../controllers/auth.controller.js";
import authenticateToken from "../middleware/auth.js";
import upload from "../middleware/upload.js";

const router = express.Router();

router.post("/signup", signup);
router.post("/register-company", upload.single("logo"), registerCompany);
router.post("/login", login);
router.get("/me", authenticateToken, me);
router.get("/company-profile", authenticateToken, getCompanyProfile);

export default router;
