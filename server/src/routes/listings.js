import express from "express";
import Listing from "../models/Listing.js";
import Notification from "../models/Notification.js";
import User from "../models/User.js";
import { protect, isAdmin } from "../middleware/auth.js";
import { uploadListingPhotos } from "../middleware/upload.js";
import jwt from "jsonwebtoken";

const router = express.Router();

// Helper: Check if user has active locataire subscription
const hasActiveSubscription = (user) => {
  if (!user) return false;
  return user.abonnementLocataire && 
    user.abonnementLocataire !== "aucun" &&
    user.dateFinAbonnementLocataire &&
    new Date(user.dateFinAbonnementLocataire) > new Date();
};

// Helper: Get user from token if available
const getUserFromToken = (authHeader) => {
  try {
    if (!authHeader || !authHeader.startsWith("Bearer ")) return null;
    const token = authHeader.split(" ")[1];
    if (!token) return null;
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    return decoded;
  } catch (err) {
    return null;
  }
};

// Helper: Remove sensitive fields for non-subscribed users
const sanitizeProprietaire = (proprietaire, userSubscribed) => {
  const data = proprietaire.toObject ? proprietaire.toObject() : proprietaire;
  if (!userSubscribed) {
    delete data.telephone;
  }
  return data;
};

// GET /api/listings - recherche + filtres (public)
router.get("/", async (req, res) => {
  try {
    const {
      q,
      province,
      ville,
      quartier,
      budgetMin,
      budgetMax,
      pieces,
      type,
      meuble,
      internet,
      parking,
      climatisation,
      cuisineEquipee,
      animauxAutorises,
      disponibleImmediatement,
      premium,
      sort,
      page = 1,
      limit = 12,
    } = req.query;

    const filtre = { statut: "verifiee" };

    if (q) filtre.$text = { $search: q };
    if (province) filtre.province = new RegExp(province, "i");
    if (ville) filtre.ville = new RegExp(ville, "i");
    if (quartier) filtre.quartier = new RegExp(quartier, "i");
    if (type) filtre.type = type;
    if (pieces) filtre.pieces = { $gte: Number(pieces) };
    if (budgetMin || budgetMax) {
      filtre.prix = {};
      if (budgetMin) filtre.prix.$gte = Number(budgetMin);
      if (budgetMax) filtre.prix.$lte = Number(budgetMax);
    }
    if (meuble === "true") filtre.meuble = true;
    if (internet === "true") filtre.internet = true;
    if (parking === "true") filtre.parking = true;
    if (climatisation === "true") filtre.climatisation = true;
    if (cuisineEquipee === "true") filtre.cuisineEquipee = true;
    if (animauxAutorises === "true") filtre.animauxAutorises = true;
    if (disponibleImmediatement === "true") filtre.disponibleImmediatement = true;
    if (premium === "true") filtre.premium = true;

    let sortOption = { premium: -1, createdAt: -1 };
    if (sort === "prix_asc") sortOption = { prix: 1 };
    if (sort === "prix_desc") sortOption = { prix: -1 };
    if (sort === "recent") sortOption = { createdAt: -1 };

    const skip = (Number(page) - 1) * Number(limit);
    
    // Get current user from token if available
    const decodedUser = getUserFromToken(req.headers.authorization);
    let currentUser = null;
    if (decodedUser) {
      currentUser = await User.findById(decodedUser.id);
    }
    const userHasActiveSubscription = hasActiveSubscription(currentUser);

    const [logements, total] = await Promise.all([
      Listing.find(filtre)
        .populate("proprietaire", "nom prenom telephone photoProfil verifie note")
        .sort(sortOption)
        .skip(skip)
        .limit(Number(limit)),
      Listing.countDocuments(filtre),
    ]);

    // Sanitize sensitive data for non-subscribed users
    const sanitizedLogements = logements.map(logement => {
      const logementObj = logement.toObject ? logement.toObject() : logement;
      if (logementObj.proprietaire) {
        logementObj.proprietaire = sanitizeProprietaire(logementObj.proprietaire, userHasActiveSubscription);
      }
      return logementObj;
    });

    res.json({ logements: sanitizedLogements, total, page: Number(page), pages: Math.ceil(total / limit) });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/listings/mine - annonces du bailleur connecté
router.get("/mine", protect, async (req, res) => {
  const logements = await Listing.find({ proprietaire: req.user._id }).sort({ createdAt: -1 });
  res.json(logements);
});

// GET /api/listings/:id
router.get("/:id", async (req, res) => {
  try {
    const logement = await Listing.findByIdAndUpdate(
      req.params.id,
      { $inc: { vues: 1 } },
      { new: true }
    ).populate("proprietaire", "nom prenom telephone photoProfil verifie note nombreAvis");
    if (!logement) return res.status(404).json({ message: "Logement introuvable" });
    
    // Get current user from token if available
    const decodedUser = getUserFromToken(req.headers.authorization);
    let currentUser = null;
    if (decodedUser) {
      currentUser = await User.findById(decodedUser.id);
    }
    const userHasActiveSubscription = hasActiveSubscription(currentUser);

    // Sanitize sensitive data
    const logementObj = logement.toObject ? logement.toObject() : logement;
    if (logementObj.proprietaire) {
      logementObj.proprietaire = sanitizeProprietaire(logementObj.proprietaire, userHasActiveSubscription);
    }
    
    res.json(logementObj);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/listings - créer une annonce (propriétaire)
router.post("/", protect, uploadListingPhotos.array("photos", 10), async (req, res) => {
  try {
    if (!["proprietaire", "admin"].includes(req.user.role)) {
      return res.status(403).json({ message: "Seuls les bailleurs peuvent publier une annonce" });
    }

    // Vérifier si le propriétaire a un abonnement actif
    const now = new Date();
    const hasActiveSubscription = req.user.abonnementProprietaire && 
      req.user.abonnementProprietaire !== "aucun" &&
      req.user.dateFinAbonnementProprietaire &&
      new Date(req.user.dateFinAbonnementProprietaire) > now;

    if (!hasActiveSubscription && req.user.role !== "admin") {
      return res.status(403).json({ 
        message: "Vous devez avoir un abonnement propriétaire actif pour publier une annonce",
        redirect: "/paiements"
      });
    }

    // Restrictions selon le pack
    const pack = req.user.abonnementProprietaire;
    const typeAnnonce = req.body.type;
    
    const typesAutorisesParPack = {
      standard: ["chambre"],
      premium: ["chambre", "studio", "maison"],
      golden: ["chambre", "studio", "appartement", "maison"]
    };

    if (pack !== "aucun" && typesAutorisesParPack[pack] && !typesAutorisesParPack[pack].includes(typeAnnonce)) {
      return res.status(403).json({ 
        message: `Avec le pack ${pack}, vous pouvez seulement publier: ${typesAutorisesParPack[pack].join(", ")}`,
        typesAutorises: typesAutorisesParPack[pack]
      });
    }

    const photos = (req.files || []).map((f) => `/uploads/listings/${f.filename}`);
    if (photos.length === 0) {
      return res.status(400).json({ message: "Au moins une photo est obligatoire" });
    }
    if (photos.length > 10) {
      return res.status(400).json({ message: "Vous pouvez ajouter jusqu'à 10 images maximum" });
    }
    const data = { 
      ...req.body, 
      photos, 
      proprietaire: req.user._id,
      packProprietaire: pack
    };
    ["meuble", "internet", "parking", "climatisation", "cuisineEquipee", "animauxAutorises", "disponibleImmediatement"].forEach((k) => {
      if (data[k] !== undefined) data[k] = data[k] === "true" || data[k] === true;
    });
    const logement = await Listing.create(data);
    res.status(201).json(logement);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// PUT /api/listings/:id
router.put("/:id", protect, uploadListingPhotos.array("photos", 10), async (req, res) => {
  try {
    const logement = await Listing.findById(req.params.id);
    if (!logement) return res.status(404).json({ message: "Logement introuvable" });
    if (String(logement.proprietaire) !== String(req.user._id) && req.user.role !== "admin") {
      return res.status(403).json({ message: "Action non autorisée" });
    }
    const data = { ...req.body };
    ["meuble", "internet", "parking", "climatisation", "cuisineEquipee", "animauxAutorises", "disponibleImmediatement"].forEach((k) => {
      if (data[k] !== undefined) data[k] = data[k] === "true" || data[k] === true;
    });
    if (req.files && req.files.length > 0) {
      data.photos = [...logement.photos, ...req.files.map((f) => `/uploads/listings/${f.filename}`)];
    }
    Object.assign(logement, data);
    await logement.save();
    res.json(logement);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// DELETE /api/listings/:id
router.delete("/:id", protect, async (req, res) => {
  const logement = await Listing.findById(req.params.id);
  if (!logement) return res.status(404).json({ message: "Logement introuvable" });
  if (String(logement.proprietaire) !== String(req.user._id) && req.user.role !== "admin") {
    return res.status(403).json({ message: "Action non autorisée" });
  }
  await logement.deleteOne();
  res.json({ message: "Annonce supprimée" });
});

// PUT /api/listings/:id/valider (admin)
router.put("/:id/valider", protect, isAdmin, async (req, res) => {
  const logement = await Listing.findByIdAndUpdate(
    req.params.id,
    { statut: "verifiee" },
    { new: true }
  );
  if (logement) {
    await Notification.create({
      utilisateur: logement.proprietaire,
      type: "systeme",
      message: `Votre annonce "${logement.titre}" a été vérifiée et publiée.`,
      lien: `/logement/${logement._id}`,
    });
  }
  res.json(logement);
});

// PUT /api/listings/:id/rejeter (admin)
router.put("/:id/rejeter", protect, isAdmin, async (req, res) => {
  const { motif } = req.body;
  const logement = await Listing.findByIdAndUpdate(
    req.params.id,
    { statut: "rejetee", motifRejet: motif || "Non conforme" },
    { new: true }
  );
  if (logement) {
    await Notification.create({
      utilisateur: logement.proprietaire,
      type: "systeme",
      message: `Votre annonce "${logement.titre}" a été rejetée: ${motif || "Non conforme"}`,
    });
  }
  res.json(logement);
});

export default router;
