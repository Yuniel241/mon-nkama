import express from "express";
import Favorite from "../models/Favorite.js";
import { protect } from "../middleware/auth.js";

const router = express.Router();

router.get("/", protect, async (req, res) => {
  const favoris = await Favorite.find({ utilisateur: req.user._id }).populate({
    path: "logement",
    populate: { path: "proprietaire", select: "nom prenom telephone" },
  });
  res.json(favoris.filter((f) => f.logement));
});

router.post("/:logementId", protect, async (req, res) => {
  try {
    const fav = await Favorite.create({ utilisateur: req.user._id, logement: req.params.logementId });
    res.status(201).json(fav);
  } catch (err) {
    if (err.code === 11000) return res.status(400).json({ message: "Déjà dans les favoris" });
    res.status(500).json({ message: err.message });
  }
});

router.delete("/:logementId", protect, async (req, res) => {
  await Favorite.findOneAndDelete({ utilisateur: req.user._id, logement: req.params.logementId });
  res.json({ message: "Retiré des favoris" });
});

export default router;
