import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/User.js";
import { protect } from "../middleware/auth.js";
import { uploadProfilePhoto } from "../middleware/upload.js";

const router = express.Router();

const generateToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: "30d" });

// POST /api/auth/register
router.post("/register", async (req, res) => {
  try {
    const { nom, prenom, telephone, email, motDePasse, role } = req.body;
    if (!nom || !prenom || !telephone || !email || !motDePasse) {
      return res.status(400).json({ message: "Tous les champs sont obligatoires" });
    }
    const existe = await User.findOne({ email: email.toLowerCase() });
    if (existe) {
      return res.status(400).json({ message: "Un compte existe déjà avec cet email" });
    }
    const hash = await bcrypt.hash(motDePasse, 10);
    const user = await User.create({
      nom,
      prenom,
      telephone,
      email: email.toLowerCase(),
      motDePasse: hash,
      role: ["locataire", "proprietaire"].includes(role) ? role : "locataire",
    });
    const token = generateToken(user._id);
    const { motDePasse: _, ...userSafe } = user.toObject();
    res.status(201).json({ user: userSafe, token });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/auth/login
router.post("/login", async (req, res) => {
  try {
    const { email, motDePasse } = req.body;
    const user = await User.findOne({ email: email?.toLowerCase() });
    if (!user) return res.status(400).json({ message: "Email ou mot de passe incorrect" });
    const match = await bcrypt.compare(motDePasse, user.motDePasse);
    if (!match) return res.status(400).json({ message: "Email ou mot de passe incorrect" });
    if (user.statut === "suspendu") {
      return res.status(403).json({ message: "Votre compte a été suspendu" });
    }
    const token = generateToken(user._id);
    const { motDePasse: _, ...userSafe } = user.toObject();
    res.json({ user: userSafe, token });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/auth/me
router.get("/me", protect, async (req, res) => {
  res.json(req.user);
});

// PUT /api/auth/me
router.put("/me", protect, uploadProfilePhoto.single("photo"), async (req, res) => {
  try {
    const updates = { ...req.body };
    delete updates.motDePasse;
    delete updates.role;
    delete updates.email;
    if (req.file) updates.photoProfil = `/uploads/profiles/${req.file.filename}`;
    const user = await User.findByIdAndUpdate(req.user._id, updates, { new: true }).select(
      "-motDePasse"
    );
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// PUT /api/auth/change-password
router.put("/change-password", protect, async (req, res) => {
  try {
    const { ancienMotDePasse, nouveauMotDePasse } = req.body;
    const user = await User.findById(req.user._id);
    const match = await bcrypt.compare(ancienMotDePasse, user.motDePasse);
    if (!match) return res.status(400).json({ message: "Ancien mot de passe incorrect" });
    user.motDePasse = await bcrypt.hash(nouveauMotDePasse, 10);
    await user.save();
    res.json({ message: "Mot de passe modifié avec succès" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/auth/forgot-password (simulation)
router.post("/forgot-password", async (req, res) => {
  const { email } = req.body;
  const user = await User.findOne({ email: email?.toLowerCase() });
  if (!user) return res.status(404).json({ message: "Aucun compte associé à cet email" });
  // Simulation: en production, envoyer un email/SMS avec un lien de réinitialisation
  res.json({ message: "Un lien de réinitialisation a été envoyé (simulation)." });
});

export default router;
