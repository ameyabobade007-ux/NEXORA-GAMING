import mongoose from "mongoose";

const reqSchema = new mongoose.Schema(
  {
    cpu: String,
    gpu: String,
    ram: Number,
    storage: Number,
  },
  { _id: false },
);

const createSlug = (title, id) => {
  const base = String(title || "game")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

  const safeBase = base || "game";

  // Add part of the MongoDB ID so every newly created game
  // gets a unique slug even when titles are similar.
  return `${safeBase}-${String(id).slice(-6)}`;
};

const gameSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },

    slug: {
      type: String,
      unique: true,
    },

    description: String,

    price: {
      type: Number,
      required: true,
    },

    discount: {
      type: Number,
      default: 0,
    },

    genre: String,

    platform: [String],

    developer: String,

    publisher: String,

    rating: {
      type: Number,
      default: 4.5,
    },

    image: String,

    banner: String,

    stock: {
      type: Number,
      default: 10,
    },

    featured: {
      type: Boolean,
      default: false,
    },

    sale: {
      type: Boolean,
      default: false,
    },

    minimum: reqSchema,

    recommended: reqSchema,
  },
  {
    timestamps: true,
  },
);

/*
 * Automatically generate a unique slug whenever a game
 * is created without one.
 */
gameSchema.pre("validate", function (next) {
  if (!this.slug && this.title) {
    this.slug = createSlug(this.title, this._id);
  }

  next();
});

export default mongoose.model("Game", gameSchema);