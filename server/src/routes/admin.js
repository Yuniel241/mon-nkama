import express from "express";
import User from "../models/User.js";
import Listing from "../models/Listing.js";
import Payment from "../models/Payment.js";
import Report from "../models/Report.js";
import Appointment from "../models/Appointment.js";
import { protect, isAdmin } from "../middleware/auth.js";

const router = express.Router();
router.use(protect, isAdmin);

// GET /api/admin/dashboard
router.get("/dashboard", async (req, res) => {
  const [nbUtilisateurs, nbLogements, nbProprietaires, nbSignalements, logementsEnAttente, nbVisites] =
    await Promise.all([
      User.countDocuments({ role: { $ne: "admin" } }),
      Listing.countDocuments({ statut: { $ne: "supprimee" } }),
      User.countDocuments({ role: "proprietaire" }),
      Report.countDocuments({ statut: "nouveau" }),
      Listing.countDocuments({ statut: "en_attente" }),
      Appointment.countDocuments(),
    ]);

  const revenusParMois = await Payment.aggregate([
    { $match: { statut: "reussi" } },
    {
      $group: {
        _id: { mois: { $month: "$createdAt" }, annee: { $year: "$createdAt" } },
        total: { $sum: "$montant" },
      },
    },
    { $sort: { "_id.annee": 1, "_id.mois": 1 } },
  ]);

  const revenusTotal = await Payment.aggregate([
    { $match: { statut: "reussi" } },
    { $group: { _id: "$abonnement", total: { $sum: "$montant" }, count: { $sum: 1 } } },
  ]);

  const logementsParType = await Listing.aggregate([
    { $match: { statut: "verifiee" } },
    { $group: { _id: "$type", count: { $sum: 1 } } },
  ]);

  // Statistiques des visites
  const visitesParStatut = await Appointment.aggregate([
    { $group: { _id: "$statut", count: { $sum: 1 } } },
  ]);

  const visitesParMois = await Appointment.aggregate([
    {
      $group: {
        _id: { mois: { $month: "$createdAt" }, annee: { $year: "$createdAt" } },
        total: { $sum: 1 },
      },
    },
    { $sort: { "_id.annee": 1, "_id.mois": 1 } },
  ]);

  // Abonnements actifs
  const abonnementsActifs = await User.aggregate([
    { $match: { abonnement: { $in: ["starter", "pro", "premium"] } } },
    { $group: { _id: "$abonnement", count: { $sum: 1 } } },
  ]);

  res.json({
    nbUtilisateurs,
    nbLogements,
    nbProprietaires,
    nbSignalements,
    logementsEnAttente,
    nbVisites,
    revenusParMois,
    revenusTotal,
    logementsParType,
    visitesParStatut,
    visitesParMois,
    abonnementsActifs,
  });
});

// GET /api/admin/utilisateurs
router.get("/utilisateurs", async (req, res) => {
  const { role, statut } = req.query;
  const filtre = {};
  if (role) filtre.role = role;
  if (statut) filtre.statut = statut;
  const utilisateurs = await User.find(filtre).select("-motDePasse").sort({ createdAt: -1 });
  res.json(utilisateurs);
});

router.put("/utilisateurs/:id/suspendre", async (req, res) => {
  const user = await User.findByIdAndUpdate(req.params.id, { statut: "suspendu" }, { new: true }).select(
    "-motDePasse"
  );
  res.json(user);
});

router.put("/utilisateurs/:id/reactiver", async (req, res) => {
  const user = await User.findByIdAndUpdate(req.params.id, { statut: "actif" }, { new: true }).select(
    "-motDePasse"
  );
  res.json(user);
});

router.put("/utilisateurs/:id/valider", async (req, res) => {
  const user = await User.findByIdAndUpdate(req.params.id, { verifie: true }, { new: true }).select(
    "-motDePasse"
  );
  res.json(user);
});

router.delete("/utilisateurs/:id", async (req, res) => {
  await User.findByIdAndDelete(req.params.id);
  res.json({ message: "Utilisateur supprimé" });
});

// GET /api/admin/logements
router.get("/logements", async (req, res) => {
  const { statut } = req.query;
  const filtre = {};
  if (statut) filtre.statut = statut;
  const logements = await Listing.find(filtre)
    .populate("proprietaire", "nom prenom email telephone")
    .sort({ createdAt: -1 });
  res.json(logements);
});

// GET /api/admin/visites - Lister toutes les visites
router.get("/visites", async (req, res) => {
  try {
    const { statut } = req.query;
    const filtre = {};
    if (statut) filtre.statut = statut;

    const visites = await Appointment.find(filtre)
      .populate("utilisateur", "nom prenom email telephone")
      .populate("logement", "titre adresse prix")
      .sort({ date: -1 });

    res.json(visites);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// PUT /api/admin/visites/:id - Mettre à jour le statut d'une visite
router.put("/visites/:id", async (req, res) => {
  try {
    const { statut } = req.body;
    const visite = await Appointment.findByIdAndUpdate(
      req.params.id,
      { statut },
      { new: true }
    )
      .populate("utilisateur", "nom prenom email telephone")
      .populate("logement", "titre adresse prix");

    res.json(visite);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

export default router;
