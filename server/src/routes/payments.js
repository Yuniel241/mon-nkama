import express from "express";
import crypto from "crypto";
import Payment from "../models/Payment.js";
import User from "../models/User.js";
import { protect } from "../middleware/auth.js";

const router = express.Router();

// Configuration des plans d'abonnement
const SUBSCRIPTION_PLANS = {
  // Plans locataires (recherche)
  locataire: {
    standard: {
      nom: "Standard (Chambres)",
      montant: 1500,
      dureeJours: 30,
      description: "Accès aux chambres simples",
    },
    premium: {
      nom: "Premium (Studios & Maisons)",
      montant: 3000,
      dureeJours: 30,
      description: "Géolocalisation, photos HD, studios et maisons",
    },
    golden: {
      nom: "Golden (Haut standing)",
      montant: 5000,
      dureeJours: 30,
      description: "Visites 360°, accompagnement prioritaire, appartements premium",
    },
  },
  // Plans propriétaires (publication)
  proprietaire: {
    standard: {
      nom: "Pack Standard",
      montant: 1500,
      dureeJours: 30,
      description: "Publication basique d'annonces",
    },
    premium: {
      nom: "Pack Premium",
      montant: 3000,
      dureeJours: 30,
      description: "Meilleure visibilité, photos prioritaires",
    },
    golden: {
      nom: "Pack Golden",
      montant: 5000,
      dureeJours: 30,
      description: "Visites 360°, accompagnement prioritaire, visibilité maximale",
    },
  },
};

// GET /api/payments - Récupérer les paiements de l'utilisateur
router.get("/", protect, async (req, res) => {
  try {
    const paiements = await Payment.find({ utilisateur: req.user._id }).sort({ createdAt: -1 });
    res.json(paiements);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/payments/plans/:type - Récupérer les plans disponibles
router.get("/plans/:type", (req, res) => {
  const { type } = req.params;
  if (!["locataire", "proprietaire"].includes(type)) {
    return res.status(400).json({ message: "Type d'abonnement invalide" });
  }
  res.json(SUBSCRIPTION_PLANS[type]);
});

// POST /api/payments/validate - Valider les informations de paiement
router.post("/validate", protect, async (req, res) => {
  try {
    const { numeroContact, methode, type, plan } = req.body;

    if (!numeroContact || numeroContact.trim() === "") {
      return res.status(400).json({ message: "Numéro de contact/carte requis" });
    }

    // Validation du format selon la méthode
    const cleanedContact = numeroContact.replace(/\s/g, "");
    if (methode === "carte_bancaire") {
      const cardRegex = /^\d{13,19}$/;
      if (!cardRegex.test(cleanedContact)) {
        return res.status(400).json({ message: "Numéro de carte invalide" });
      }
    } else {
      const phoneRegex = /^\+?\d{9,13}$/;
      if (!phoneRegex.test(cleanedContact)) {
        return res.status(400).json({ message: "Numéro de téléphone invalide" });
      }
    }

    if (!["locataire", "proprietaire"].includes(type)) {
      return res.status(400).json({ message: "Type d'abonnement invalide" });
    }

    const planConfig = SUBSCRIPTION_PLANS[type][plan];
    if (!planConfig) {
      return res.status(400).json({ message: "Plan d'abonnement invalide" });
    }

    res.json({
      valide: true,
      montant: planConfig.montant,
      nomPlan: planConfig.nom,
      message: "Informations de paiement valides. Cliquez pour confirmer.",
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/payments - Créer un paiement (simulation avec traitement)
router.post("/", protect, async (req, res) => {
  try {
    const { montant, methode, type, plan, numeroContact } = req.body;

    if (!numeroContact) {
      return res.status(400).json({ message: "Numéro de contact requis" });
    }

    if (!["locataire", "proprietaire"].includes(type)) {
      return res.status(400).json({ message: "Type d'abonnement invalide" });
    }

    const planConfig = SUBSCRIPTION_PLANS[type][plan];
    if (!planConfig) {
      return res.status(400).json({ message: "Plan invalide" });
    }

    const reference = "MNK-" + crypto.randomBytes(5).toString("hex").toUpperCase();
    const cleanedContact = numeroContact.replace(/\D/g, "");

    const paiement = await Payment.create({
      utilisateur: req.user._id,
      montant: planConfig.montant,
      methode,
      type,
      plan,
      numeroContact: cleanedContact.slice(-4),
      reference,
      statut: "en_traitement",
      dureeJours: planConfig.dureeJours,
    });

    // Simuler le traitement après 2-3 secondes
    setTimeout(async () => {
      try {
        const statutFinal = Math.random() < 0.95 ? "reussi" : "echoue";

        const dateDebut = new Date();
        const dateFin = new Date(dateDebut.getTime() + paiement.dureeJours * 24 * 60 * 60 * 1000);

        await Payment.findByIdAndUpdate(
          paiement._id,
          {
            statut: statutFinal,
            dateDebut: statutFinal === "reussi" ? dateDebut : null,
            dateFin: statutFinal === "reussi" ? dateFin : null,
          },
          { new: true }
        );

        if (statutFinal === "reussi") {
          if (type === "locataire") {
            await User.findByIdAndUpdate(req.user._id, {
              abonnementLocataire: plan,
              dateDebutAbonnementLocataire: dateDebut,
              dateFinAbonnementLocataire: dateFin,
            });
          } else if (type === "proprietaire") {
            await User.findByIdAndUpdate(req.user._id, {
              abonnementProprietaire: plan,
              dateDebutAbonnementProprietaire: dateDebut,
              dateFinAbonnementProprietaire: dateFin,
            });
          }
        }
      } catch (err) {
        console.error("Erreur lors du traitement du paiement:", err);
      }
    }, 2000);

    res.status(201).json(paiement);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// GET /api/payments/:id - Récupérer le statut d'un paiement
router.get("/:id", protect, async (req, res) => {
  try {
    const paiement = await Payment.findById(req.params.id);
    if (!paiement) {
      return res.status(404).json({ message: "Paiement non trouvé" });
    }
    if (paiement.utilisateur.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Accès refusé" });
    }
    res.json(paiement);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;
