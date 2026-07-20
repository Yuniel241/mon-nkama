import mongoose from "mongoose";

const favoriteSchema = new mongoose.Schema(
  {
    utilisateur: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    logement: { type: mongoose.Schema.Types.ObjectId, ref: "Listing", required: true },
  },
  { timestamps: true }
);

favoriteSchema.index({ utilisateur: 1, logement: 1 }, { unique: true });

export default mongoose.model("Favorite", favoriteSchema);
