import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema(
  {
    utilisateur: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    type: {
      type: String,
      enum: ["nouvelle_annonce", "baisse_prix", "confirmation_visite", "annonce_expiree", "message", "systeme"],
      default: "systeme",
    },
    message: { type: String, required: true },
    lu: { type: Boolean, default: false },
    lien: { type: String, default: "" },
  },
  { timestamps: true }
);

export default mongoose.model("Notification", notificationSchema);
