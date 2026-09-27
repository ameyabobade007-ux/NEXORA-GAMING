import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/User.js";
const token = (u) =>
  jwt.sign({ id: u._id }, process.env.JWT_SECRET, { expiresIn: "7d" });
export async function register(req, res) {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password)
      return res.status(400).json({ message: "All fields required" });
    if (await User.findOne({ email }))
      return res.status(409).json({ message: "Email already registered" });
    const user = await User.create({
      name,
      email,
      password: await bcrypt.hash(password, 10),
      achievements: ["Early Adopter"],
    });
    res.status(201).json({ token: token(user), user: safe(user) });
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
}
export async function login(req, res) {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user || !(await bcrypt.compare(password, user.password)))
      return res.status(401).json({ message: "Invalid email or password" });
    res.json({ token: token(user), user: safe(user) });
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
}
export async function me(req, res) {
  res.json({ user: safe(req.user) });
}
function safe(u) {
  return {
    _id: u._id,
    name: u.name,
    email: u.email,
    role: u.role,
    wishlist: u.wishlist,
    achievements: u.achievements,
    recentlyPlayed: u.recentlyPlayed,
    purchasedGames: u.purchasedGames,
    stats: u.stats,
  };
}
