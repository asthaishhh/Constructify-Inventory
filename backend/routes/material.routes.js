
// export default router;
import express from "express";
import Material from "../models/Material.js";
import authenticateToken from "../middleware/auth.js";
import authorizeRoles from "../middleware/authorize.js";

const router = express.Router();

const getCompanyIdFromReq = (req) => String(req?.user?.companyId || "").trim();

/* -------------------------
   🔐 Require Login for all
--------------------------*/
router.use(authenticateToken);

/* -------------------------
   ✅ GET all materials
   (admin + user can view)
--------------------------*/
router.get("/", authorizeRoles("admin", "user"), async (req, res) => {
  try {
    const companyId = getCompanyIdFromReq(req);
    if (!companyId) return res.status(403).json({ message: "Company context missing in token" });

    const materials = await Material.find({ companyId }).sort({ createdAt: -1 });
    res.json(materials);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

/* -------------------------
   ✅ POST new material
   (admin only)
--------------------------*/
router.post("/", authorizeRoles("admin"), async (req, res) => {
  try {
    const companyId = getCompanyIdFromReq(req);
    if (!companyId) return res.status(403).json({ message: "Company context missing in token" });

    const saved = await Material.create({ ...req.body, companyId });
    res.status(201).json(saved);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

/* -------------------------
   ✅ PUT update material
   (admin only)
--------------------------*/
router.put("/:id", authorizeRoles("admin"), async (req, res) => {
  try {
    const companyId = getCompanyIdFromReq(req);
    if (!companyId) return res.status(403).json({ message: "Company context missing in token" });

    const updated = await Material.findOneAndUpdate(
      { _id: req.params.id, companyId },
      req.body,
      { new: true }
    );

    if (!updated) {
      return res.status(404).json({ message: "Material not found" });
    }

    res.json(updated);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

/* -------------------------
   ✅ DELETE material
   (admin only)
--------------------------*/
router.delete("/:id", authorizeRoles("admin"), async (req, res) => {
  try {
    const companyId = getCompanyIdFromReq(req);
    if (!companyId) return res.status(403).json({ message: "Company context missing in token" });

    const deleted = await Material.findOneAndDelete({ _id: req.params.id, companyId });

    if (!deleted) {
      return res.status(404).json({ message: "Material not found" });
    }

    res.json({ message: "Material deleted" });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

export default router;