import jwt from "jsonwebtoken";
import User from "../models/User.js";

export const protect = async (req, res, next) => {
  try {
    const header = req.headers.authorization;
    if (!header || !header.startsWith("Bearer ")) {
      return res.status(401).json({ message: "Non autorisé, token manquant" });
    }
    const token = header.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).select("-motDePasse");
    if (!user) return res.status(401).json({ message: "Utilisateur introuvable" });
    if (user.statut === "suspendu") {
      return res.status(403).json({ message: "Compte suspendu" });
    }
    req.user = user;
    next();
  } catch (err) {
    return res.status(401).json({ message: "Token invalide ou expiré" });
  }
};

export const isAdmin = (req, res, next) => {
  if (req.user?.role !== "admin") {
    return res.status(403).json({ message: "Accès réservé à l'administrateur" });
  }
  next();
};

export const isOwnerOrAdmin = (getOwnerId) => async (req, res, next) => {
  try {
    const ownerId = await getOwnerId(req);
    if (req.user.role === "admin" || String(ownerId) === String(req.user._id)) {
      return next();
    }
    return res.status(403).json({ message: "Action non autorisée" });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};
