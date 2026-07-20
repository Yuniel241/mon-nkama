import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    nom: { type: String, required: true, trim: true },
    prenom: { type: String, required: true, trim: true },
    telephone: { type: String, required: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    motDePasse: { type: String, required: true },
    role: {
      type: String,
      enum: ["locataire", "proprietaire", "admin"],
      default: "locataire",
    },
    // Abonnement pour locataire (recherche)
    abonnementLocataire: {
      type: String,
      enum: ["aucun", "standard", "premium", "golden"],
      default: "aucun",
    },
    dateDebutAbonnementLocataire: { type: Date, default: null },
    dateFinAbonnementLocataire: { type: Date, default: null },
    
    // Abonnement pour propriétaire (publication)
    abonnementProprietaire: {
      type: String,
      enum: ["aucun", "standard", "premium", "golden"],
      default: "aucun",
    },
    dateDebutAbonnementProprietaire: { type: Date, default: null },
    dateFinAbonnementProprietaire: { type: Date, default: null },
    
    // Ancien champ (rétrocompatibilité)
    abonnement: { type: String, default: "aucun" },
    dateDebutAbonnement: { type: Date, default: null },
    dateFinAbonnement: { type: Date, default: null },
    
    photoProfil: { type: String, default: "" },
    verifie: { type: Boolean, default: false }, // identité vérifiée (pour bailleurs)
    statut: { type: String, enum: ["actif", "suspendu"], default: "actif" },
    note: { type: Number, default: 0 },
    nombreAvis: { type: Number, default: 0 },
    langue: { type: String, default: "fr" },
    modeSombre: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export default mongoose.model("User", userSchema);
