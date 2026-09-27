import { Router } from "express";

import { stats, customers } from "../controllers/adminController.js";

import { protect, adminOnly } from "../middleware/auth.js";

const r = Router();

/* Admin Dashboard */
r.get("/stats", protect, adminOnly, stats);

/* Customer Management */
r.get("/customers", protect, adminOnly, customers);

export default r;
