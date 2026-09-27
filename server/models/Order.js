import mongoose from "mongoose";

const itemSchema = new mongoose.Schema(
  {
    game: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Game",
    },

    title: String,

    price: Number,

    qty: Number,

    image: String,
  },
  {
    _id: false,
  }
);

const orderSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    items: [itemSchema],

    total: {
      type: Number,
      required: true,
    },

    paymentMethod: {
      type: String,
      default: "Demo UPI",
    },

    status: {
      type: String,

      enum: [
        "Processing",
        "Confirmed",
        "Activated",
        "Completed",
        "Cancelled",
      ],

      default: "Processing",
    },

    billing: {
      name: String,
      email: String,
      address: String,
      city: String,
      state: String,
      pincode: String,
    },

    hiddenFromCustomer: {
      type: Boolean,
      default: false,
    },
  },

  {
    timestamps: true,
  }
);

export default mongoose.model(
  "Order",
  orderSchema
);