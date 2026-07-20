import mongoose from "mongoose";

const messageSchema = new mongoose.Schema(
  {
    expediteur: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    contenu: { type: String, default: "" },
    type: { type: String, enum: ["texte", "photo", "document", "position"], default: "texte" },
    fichierUrl: { type: String, default: "" },
    date: { type: Date, default: Date.now },
    lu: { type: Boolean, default: false },
  },
  { _id: true }
);

const conversationSchema = new mongoose.Schema(
  {
    participants: [{ type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }],
    logement: { type: mongoose.Schema.Types.ObjectId, ref: "Listing" },
    messages: [messageSchema],
  },
  { timestamps: true }
);

export default mongoose.model("Conversation", conversationSchema);
