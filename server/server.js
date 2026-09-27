import "dotenv/config";
import express from "express";
import cors from "cors";
import morgan from "morgan";
import { connectDB } from "./config/db.js";
import auth from "./routes/auth.js";
import games from "./routes/games.js";
import orders from "./routes/orders.js";
import admin from "./routes/admin.js";
const app = express();
app.use(cors({ origin: process.env.CLIENT_URL || "http://localhost:5173" }));
app.use(express.json());
app.use(morgan("dev"));
app.get("/api/health", (req, res) =>
  res.json({ ok: true, name: "NEXORA API" }),
);
app.use("/api/auth", auth);
app.use("/api/games", games);
app.use("/api/orders", orders);
app.use("/api/admin", admin);
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ message: err.message || "Server error" });
});
const port = process.env.PORT || 5000;
connectDB()
  .then(() =>
    app.listen(port, () =>
      console.log(`API running on http://localhost:${port}`),
    ),
  )
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });
