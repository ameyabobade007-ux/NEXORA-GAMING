import "dotenv/config";
import mongoose from "mongoose";
import bcrypt from "bcryptjs";

import { connectDB } from "../config/db.js";
import User from "../models/User.js";
import Game from "../models/Game.js";

const games = [
  [
    "Cyberpunk 2077",
    "Action RPG",
    "2999",
    20,
    "https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=1200&q=80",
  ],
  [
    "Grand Theft Auto V",
    "Open World",
    "1499",
    30,
    "https://images.unsplash.com/photo-1605901309584-818e25960a8f?auto=format&fit=crop&w=1200&q=80",
  ],
  [
    "Red Dead Redemption 2",
    "Adventure",
    "2499",
    18,
    "https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&w=1200&q=80",
  ],
  [
    "Elden Ring",
    "RPG",
    "3499",
    12,
    "https://images.unsplash.com/photo-1511512578047-dfb367046420?auto=format&fit=crop&w=1200&q=80",
  ],
  [
    "Forza Horizon 5",
    "Racing",
    "2499",
    25,
    "https://images.unsplash.com/photo-1511512578047-dfb367046420?auto=format&fit=crop&w=1200&q=80",
  ],
  [
    "Hogwarts Legacy",
    "Adventure RPG",
    "2799",
    16,
    "https://images.unsplash.com/photo-1538481199705-c710c4e965fc?auto=format&fit=crop&w=1200&q=80",
  ],
  [
    "Valorant",
    "FPS",
    "0",
    50,
    "https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=1200&q=80",
  ],
  [
    "The Witcher 3",
    "RPG",
    "999",
    22,
    "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=1200&q=80",
  ],
];

const adminEmail = process.env.ADMIN_EMAIL;
const adminPassword = process.env.ADMIN_PASSWORD;

if (!adminEmail || !adminPassword) {
  throw new Error(
    "ADMIN_EMAIL and ADMIN_PASSWORD must be defined in server/.env",
  );
}

await connectDB();

await Game.deleteMany({});
await User.deleteMany({});

for (let i = 0; i < games.length; i++) {
  const [title, genre, price, stock, image] = games[i];

  await Game.create({
    title,
    slug: title.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
    genre,
    price: Number(price),
    stock,
    image,
    banner: image,
    rating: 4.3 + (i % 6) / 10,
    featured: i < 5,
    sale: i < 4,
    platform: ["PC", "PlayStation", "Xbox"],
    developer: "NEXORA Studios",
    publisher: "NEXORA Publishing",
    description: `Experience ${title}, a premium ${genre} experience built for players who want cinematic gameplay and unforgettable worlds.`,
    minimum: {
      cpu: "Intel Core i5",
      gpu: "GTX 1060",
      ram: 8,
      storage: 70,
    },
    recommended: {
      cpu: "Intel Core i7",
      gpu: "RTX 3060",
      ram: 16,
      storage: 100,
    },
  });
}

await User.create({
  name: "Admin",
  email: adminEmail,
  password: await bcrypt.hash(adminPassword, 10),
  role: "admin",
});

console.log("Seed complete");

await mongoose.connection.close();