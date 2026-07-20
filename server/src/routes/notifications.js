import express from "express";
import Notification from "../models/Notification.js";
import { protect } from "../middleware/auth.js";

const router = express.Router();

router.get("/", protect, async (req, res) => {
  const notifs = await Notification.find({ utilisateur: req.user._id }).sort({ createdAt: -1 });
  res.json(notifs);
});

router.put("/:id/lu", protect, async (req, res) => {
  const notif = await Notification.findOneAndUpdate(
    { _id: req.params.id, utilisateur: req.user._id },
    { lu: true },
    { new: true }
  );
  res.json(notif);
});

router.put("/tout-lire", protect, async (req, res) => {
  await Notification.updateMany({ utilisateur: req.user._id, lu: false }, { lu: true });
  res.json({ message: "Toutes les notifications ont été lues" });
});

export default router;
