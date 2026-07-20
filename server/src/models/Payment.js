import mongoose from "mongoose";

const paymentSchema = new mongoose.Schema(
  {
    utilisateur: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    montant: { type: Number, required: true },
    methode: { type: String, enum: ["airtel_money", "moov_money", "carte_bancaire"], required: true },
    numeroContact: { type: String, default: "" }, // numéro de téléphone ou carte
    type: { type: String, enum: ["locataire", "proprietaire"], default: "locataire" }, // type d'abonnement
    plan: {
      type: String,
      enum: [
        "standard",
        "premium",
        "golden",
        // anciens plans
        "pass_starter",
        "pass_pro",
        "pass_premium",
        "annonce_standard",
        "boost_recherche",
      ],
      required: true,
    },
    statut: { type: String, enum: ["en_attente", "en_traitement", "reussi", "echoue"], default: "en_attente" },
    reference: { type: String, default: "" },
    dateDebut: { type: Date, default: null },
    dateFin: { type: Date, default: null },
    dureeJours: { type: Number, default: 30 }, // durée de l'abonnement
  },
  { timestamps: true }
);

export default mongoose.model("Payment", paymentSchema);
