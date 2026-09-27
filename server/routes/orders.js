import { Router } from "express";

import {
  create,
  mine,
  all,
  update,
  cancelOrder,
  removeCancelledOrder,
  removeCancelledOrderAdmin,
} from "../controllers/orderController.js";

import {
  protect,
  adminOnly,
} from "../middleware/auth.js";

const r = Router();

// =========================================================
// CUSTOMER
// =========================================================

// Customer creates an order
r.post("/", protect, create);

// Customer's own orders
r.get("/mine", protect, mine);

// Customer cancels their own order
r.post(
  "/:id/cancel",
  protect,
  cancelOrder
);

// Customer hides a cancelled order
// from their own order history
r.delete(
  "/:id",
  protect,
  removeCancelledOrder
);

// =========================================================
// ADMIN
// =========================================================

// Admin gets all orders
r.get(
  "/",
  protect,
  adminOnly,
  all
);

// Admin updates order status
r.put(
  "/:id",
  protect,
  adminOnly,
  update
);

// Admin permanently removes
// a cancelled order
r.delete(
  "/:id/admin-remove",
  protect,
  adminOnly,
  removeCancelledOrderAdmin
);

export default r;