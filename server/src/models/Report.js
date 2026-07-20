import mongoose from "mongoose";

const reportSchema = new mongoose.Schema(
  {
    utilisateur: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    logement: { type: mongoose.Schema.Types.ObjectId, ref: "Listing" },
    utilisateurSignale: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    motif: { type: String, required: true },
    details: { type: String, default: "" },
    statut: { type: String, enum: ["nouveau", "traite", "ignore"], default: "nouveau" },
  },
  { timestamps: true }
);

export default mongoose.model("Report", reportSchema);
