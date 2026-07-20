import mongoose from "mongoose";

const listingSchema = new mongoose.Schema(
  {
    titre: { type: String, required: true, trim: true },
    description: { type: String, required: true },
    type: {
      type: String,
      enum: ["chambre", "studio", "appartement", "maison"],
      required: true,
    },
    prix: { type: Number, required: true },
    province: { type: String, required: true, trim: true },
    ville: { type: String, required: true },
    quartier: { type: String, required: true },
    adresse: { type: String, default: "" },
    pieces: { type: Number, default: 1 },
    sallesDeBain: { type: Number, default: 1 },
    meuble: { type: Boolean, default: false },
    internet: { type: Boolean, default: false },
    parking: { type: Boolean, default: false },
    climatisation: { type: Boolean, default: false },
    cuisineEquipee: { type: Boolean, default: false },
    animauxAutorises: { type: Boolean, default: false },
    disponibleImmediatement: { type: Boolean, default: true },
    photos: [{ type: String }],
    video: { type: String, default: "" },
    visite360: { type: String, default: "" },
    latitude: { type: Number, default: null },
    longitude: { type: Number, default: null },
    proprietaire: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    packProprietaire: {
      type: String,
      enum: ["standard", "premium", "golden"],
      default: "standard",
    },
    statut: {
      type: String,
      enum: ["en_attente", "verifiee", "rejetee", "expiree", "supprimee"],
      default: "en_attente",
    },
    premium: { type: Boolean, default: false },
    vues: { type: Number, default: 0 },
    motifRejet: { type: String, default: "" },
  },
  { timestamps: true }
);

listingSchema.index({ ville: "text", quartier: "text", titre: "text" });

export default mongoose.model("Listing", listingSchema);
