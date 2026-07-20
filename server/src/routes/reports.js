import express from "express";
import Report from "../models/Report.js";
import { protect, isAdmin } from "../middleware/auth.js";

const router = express.Router();

router.post("/", protect, async (req, res) => {
  const { logement, utilisateurSignale, motif, details } = req.body;
  const report = await Report.create({
    utilisateur: req.user._id,
    logement,
    utilisateurSignale,
    motif,
    details,
  });
  res.status(201).json(report);
});

router.get("/", protect, isAdmin, async (req, res) => {
  const reports = await Report.find()
    .populate("utilisateur", "nom prenom email")
    .populate("logement", "titre")
    .populate("utilisateurSignale", "nom prenom email")
    .sort({ createdAt: -1 });
  res.json(reports);
});

router.put("/:id", protect, isAdmin, async (req, res) => {
  const { statut } = req.body;
  const report = await Report.findByIdAndUpdate(req.params.id, { statut }, { new: true });
  res.json(report);
});

export default router;
