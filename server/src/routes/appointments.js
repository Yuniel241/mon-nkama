import express from "express";
import crypto from "crypto";
import Appointment from "../models/Appointment.js";
import Notification from "../models/Notification.js";
import Listing from "../models/Listing.js";
import { protect } from "../middleware/auth.js";

const router = express.Router();

const parseAppointmentSlot = (date, heure) => {
  const normalizedDate = new Date(date);
  if (Number.isNaN(normalizedDate.getTime()) || !heure) return null;
  const [hours, minutes] = heure.split(":");
  if (hours == null || minutes == null) return null;
  const start = new Date(normalizedDate);
  start.setHours(Number(hours), Number(minutes), 0, 0);
  const end = new Date(start.getTime() + 60 * 60 * 1000);
  return { start, end };
};

const isOverlapping = (slotA, slotB) => {
  return slotA.start < slotB.end && slotB.start < slotA.end;
};

const dayRangeForDate = (date) => {
  const startOfDay = new Date(date);
  startOfDay.setHours(0, 0, 0, 0);
  const endOfDay = new Date(startOfDay);
  endOfDay.setDate(endOfDay.getDate() + 1);
  return { $gte: startOfDay, $lt: endOfDay };
};

router.get("/", protect, async (req, res) => {
  const mesLogements = await Listing.find({ proprietaire: req.user._id }).select("_id");
  const rdvs = await Appointment.find({
    $or: [{ utilisateur: req.user._id }, { logement: { $in: mesLogements.map((l) => l._id) } }],
  })
    .populate({ path: "logement", populate: { path: "proprietaire", select: "nom prenom telephone" } })
    .sort({ date: 1, heure: 1 });
  res.json(rdvs);
});

router.post("/", protect, async (req, res) => {
  try {
    const { logement, date, heure } = req.body;
    if (!logement || !date || !heure) {
      return res.status(400).json({ message: "Date et heure sont obligatoires." });
    }

    const slot = parseAppointmentSlot(date, heure);
    if (!slot) {
      return res.status(400).json({ message: "Format de date ou d'heure invalide." });
    }

    const logementDoc = await Listing.findById(logement);
    if (!logementDoc) return res.status(404).json({ message: "Logement introuvable" });
    const ownerId = logementDoc.proprietaire?._id ? logementDoc.proprietaire._id : logementDoc.proprietaire;
    if (String(ownerId) === String(req.user._id)) {
      return res.status(403).json({ message: "Vous ne pouvez pas réserver une visite sur votre propre logement." });
    }
    if (!req.user?.abonnement || !["visite", "boost"].includes(req.user.abonnement)) {
      return res.status(403).json({ message: "Accès refusé : vous devez souscrire un pass visite pour programmer une visite." });
    }

    const existingAppointments = await Appointment.find({
      logement,
      date: dayRangeForDate(date),
      statut: { $in: ["en_attente", "confirmee"] },
    });

    for (const appointment of existingAppointments) {
      const existingSlot = parseAppointmentSlot(appointment.date, appointment.heure);
      if (existingSlot && isOverlapping(slot, existingSlot)) {
        return res.status(409).json({
          message: `Créneau indisponible : une visite est déjà programmée le ${new Date(appointment.date).toLocaleDateString("fr-FR")} à ${appointment.heure}.`,
        });
      }
    }

    const qrCode = crypto.randomBytes(8).toString("hex").toUpperCase();
    const rdv = await Appointment.create({
      utilisateur: req.user._id,
      logement,
      date,
      heure,
      qrCode,
      statut: "en_attente",
    });
    await Notification.create({
      utilisateur: logementDoc.proprietaire,
      type: "confirmation_visite",
      message: `Nouvelle demande de visite pour "${logementDoc.titre}"`,
    });
    res.status(201).json(rdv);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.put("/:id/valider", protect, async (req, res) => {
  const rdv = await Appointment.findById(req.params.id).populate("logement");
  if (!rdv) return res.status(404).json({ message: "Rendez-vous introuvable" });
  if (String(rdv.logement.proprietaire) !== String(req.user._id)) {
    return res.status(403).json({ message: "Action non autorisée" });
  }

  const slot = parseAppointmentSlot(rdv.date, rdv.heure);
  if (!slot) return res.status(400).json({ message: "Créneau de visite invalide." });

  const existingConfirmed = await Appointment.find({
    logement: rdv.logement._id,
    _id: { $ne: rdv._id },
    statut: "confirmee",
    date: dayRangeForDate(rdv.date),
  });

  for (const appointment of existingConfirmed) {
    const existingSlot = parseAppointmentSlot(appointment.date, appointment.heure);
    if (existingSlot && isOverlapping(slot, existingSlot)) {
      return res.status(409).json({ message: `Impossible de confirmer : conflit avec une visite confirmée le ${new Date(appointment.date).toLocaleDateString("fr-FR")} à ${appointment.heure}.` });
    }
  }

  const updated = await Appointment.findByIdAndUpdate(req.params.id, { statut: "confirmee" }, { new: true });
  await Notification.create({
    utilisateur: updated.utilisateur,
    type: "confirmation_visite",
    message: `Votre visite pour "${rdv.logement.titre}" a été confirmée.`,
  });
  res.json(updated);
});

router.put("/:id/rejeter", protect, async (req, res) => {
  const rdv = await Appointment.findById(req.params.id).populate("logement");
  if (!rdv) return res.status(404).json({ message: "Rendez-vous introuvable" });
  if (String(rdv.logement.proprietaire) !== String(req.user._id)) {
    return res.status(403).json({ message: "Action non autorisée" });
  }
  const updated = await Appointment.findByIdAndUpdate(req.params.id, { statut: "annulee" }, { new: true });
  await Notification.create({
    utilisateur: updated.utilisateur,
    type: "systeme",
    message: `Votre visite pour "${rdv.logement.titre}" a été refusée.`,
  });
  res.json(updated);
});

router.put("/:id/annuler", protect, async (req, res) => {
  const rdv = await Appointment.findById(req.params.id);
  if (!rdv) return res.status(404).json({ message: "Rendez-vous introuvable" });
  if (String(rdv.utilisateur) !== String(req.user._id)) {
    return res.status(403).json({ message: "Action non autorisée" });
  }
  const updated = await Appointment.findByIdAndUpdate(req.params.id, { statut: "annulee" }, { new: true });
  res.json(updated);
});

export default router;
