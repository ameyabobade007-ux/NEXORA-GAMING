import Game from "../models/Game.js";
import User from "../models/User.js";
export async function list(req, res) {
  // Game data changes from the admin panel must be visible immediately.
  res.set("Cache-Control", "no-store, no-cache, must-revalidate, proxy-revalidate");
  res.set("Pragma", "no-cache");
  res.set("Expires", "0");

  const q = req.query.q;
  const filter = q ? { title: { $regex: q, $options: "i" } } : {};
  const games = await Game.find(filter).sort({ featured: -1, createdAt: -1 });
  res.json(games);
}
export async function get(req, res) {
  const game = await Game.findById(req.params.id);
  if (!game) return res.status(404).json({ message: "Game not found" });
  if (req.user) {
    await User.findByIdAndUpdate(req.user._id, {
      $pull: { recentlyPlayed: game._id },
    });
    await User.findByIdAndUpdate(req.user._id, {
      $push: { recentlyPlayed: { $each: [game._id], $slice: -5 } },
    });
  }
  res.json(game);
}
export async function create(req, res) {
  const game = await Game.create(req.body);
  res.status(201).json(game);
}
export async function update(req, res) {
  const game = await Game.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });
  res.json(game);
}
export async function remove(req, res) {
  await Game.findByIdAndDelete(req.params.id);
  res.json({ message: "Game deleted" });
}
export async function wishlist(req, res) {
  const id = req.params.id;
  const u = await User.findById(req.user._id);
  const has = u.wishlist.some((x) => x.toString() === id);
  u.wishlist = has
    ? u.wishlist.filter((x) => x.toString() !== id)
    : [...u.wishlist, id];
  await u.save();
  res.json({ wishlist: u.wishlist, added: !has });
}
