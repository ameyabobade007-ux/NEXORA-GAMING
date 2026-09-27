import mongoose from "mongoose";
const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true, lowercase: true },
    password: { type: String, required: true },
    role: { type: String, enum: ["user", "admin"], default: "user" },
    wishlist: [{ type: mongoose.Schema.Types.ObjectId, ref: "Game" }],
    recentlyPlayed: [{ type: mongoose.Schema.Types.ObjectId, ref: "Game" }],
    purchasedGames: [{ type: mongoose.Schema.Types.ObjectId, ref: "Game" }],
    achievements: [{ type: String }],
    stats: { hoursPlayed: { type: Number, default: 0 } },
  },
  { timestamps: true },
);
export default mongoose.model("User", userSchema);
