import { Router } from "express";
import {
  list,
  get,
  create,
  update,
  remove,
  wishlist,
} from "../controllers/gameController.js";
import { protect, adminOnly } from "../middleware/auth.js";
const r = Router();
r.get("/", list);
r.get("/:id", get);
r.post("/", protect, adminOnly, create);
r.put("/:id", protect, adminOnly, update);
r.delete("/:id", protect, adminOnly, remove);
r.post("/:id/wishlist", protect, wishlist);
export default r;
