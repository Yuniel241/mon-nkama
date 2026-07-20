import mongoose from "mongoose";

const appointmentSchema = new mongoose.Schema(
  {
    utilisateur: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    logement: { type: mongoose.Schema.Types.ObjectId, ref: "Listing", required: true },
    date: { type: Date, required: true },
    heure: { type: String, required: true },
    statut: {
      type: String,
      enum: ["en_attente", "confirmee", "annulee", "terminee"],
      default: "en_attente",
    },
    qrCode: { type: String, default: "" },
  },
  { timestamps: true }
);

export default mongoose.model("Appointment", appointmentSchema);
