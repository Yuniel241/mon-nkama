import express from "express";
import Conversation from "../models/Conversation.js";
import Notification from "../models/Notification.js";
import { protect } from "../middleware/auth.js";

const router = express.Router();

// Liste des conversations de l'utilisateur
router.get("/", protect, async (req, res) => {
  const conversations = await Conversation.find({ participants: req.user._id })
    .populate("participants", "nom prenom photoProfil")
    .populate("logement", "titre photos")
    .sort({ updatedAt: -1 });
  res.json(conversations);
});

// Démarrer ou récupérer une conversation avec un autre utilisateur
router.post("/start", protect, async (req, res) => {
  const { destinataireId, logementId } = req.body;
  let conversation = await Conversation.findOne({
    participants: { $all: [req.user._id, destinataireId] },
    logement: logementId || null,
  });
  if (!conversation) {
    conversation = await Conversation.create({
      participants: [req.user._id, destinataireId],
      logement: logementId || undefined,
      messages: [],
    });
  }
  res.json(conversation);
});

// Envoyer un message
router.post("/:conversationId", protect, async (req, res) => {
  const { contenu, type, fichierUrl } = req.body;
  const conversation = await Conversation.findById(req.params.conversationId);
  if (!conversation) return res.status(404).json({ message: "Conversation introuvable" });
  conversation.messages.push({
    expediteur: req.user._id,
    contenu,
    type: type || "texte",
    fichierUrl: fichierUrl || "",
  });
  await conversation.save();
  const destinataire = conversation.participants.find((p) => String(p) !== String(req.user._id));
  if (destinataire) {
    await Notification.create({
      utilisateur: destinataire,
      type: "message",
      message: `Nouveau message reçu dans votre conversation.`,
    });
  }
  res.json(conversation);
});

router.get("/:conversationId", protect, async (req, res) => {
  const conversation = await Conversation.findById(req.params.conversationId).populate(
    "participants",
    "nom prenom photoProfil"
  );
  res.json(conversation);
});

export default router;
