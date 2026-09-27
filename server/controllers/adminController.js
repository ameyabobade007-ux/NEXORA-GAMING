import Game from "../models/Game.js";
import Order from "../models/Order.js";
import User from "../models/User.js";

export async function stats(req, res) {
  const [games, users, orders] = await Promise.all([
    Game.countDocuments(),
    User.countDocuments({ role: "user" }),
    Order.find(),
  ]);

  const revenue = orders
    .filter((o) => o.status !== "Cancelled")
    .reduce((s, o) => s + o.total, 0);

  const sales = {};

  orders.forEach((o) => {
    o.items.forEach((i) => {
      sales[i.title] = (sales[i.title] || 0) + i.qty;
    });
  });

  const best = Object.entries(sales)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([title, qty]) => ({
      title,
      qty,
    }));

  res.json({
    games,
    users,
    orders: orders.length,
    revenue,
    best,
  });
}

/* -----------------------------------------
   CUSTOMER MANAGEMENT
----------------------------------------- */

export async function customers(req, res) {
  try {
    const users = await User.find({ role: "user" })
      .select("-password")
      .sort({ createdAt: -1 })
      .lean();

    const orders = await Order.find().select("user total status").lean();

    const customerData = users.map((user) => {
      const userOrders = orders.filter(
        (order) => String(order.user) === String(user._id),
      );

      const validOrders = userOrders.filter(
        (order) => order.status !== "Cancelled",
      );

      const totalSpent = validOrders.reduce(
        (sum, order) => sum + Number(order.total || 0),
        0,
      );

      return {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        createdAt: user.createdAt,
        purchasedGames: user.purchasedGames?.length || 0,
        orders: userOrders.length,
        totalSpent,
      };
    });

    res.json(customerData);
  } catch (error) {
    console.error("Customer management error:", error);

    res.status(500).json({
      message: error.message || "Could not load customers",
    });
  }
}
