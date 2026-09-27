import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import {
  AlertTriangle,
  BarChart3,
  Boxes,
  Gamepad2,
  LayoutDashboard,
  Package,
  Receipt,
  RefreshCw,
  ShoppingCart,
  Trash2,
  TrendingUp,
  Users,
} from "lucide-react";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

import { api } from "../services/api";

export default function Admin() {
  const [stats, setStats] = useState({
    revenue: 0,
    orders: 0,
    customers: 0,
    products: 0,
    inventory: 0,
    lowStock: 0,
    outOfStock: 0,
  });

  const [games, setGames] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // =========================
  // LOAD ADMIN DATA
  // =========================

  async function loadAdminData() {
    try {
      setLoading(true);
      setError("");

      const [gamesResponse, ordersResponse] = await Promise.all([
        api.get("/games"),
        api.get("/orders"),
      ]);

      const gamesData = gamesResponse.data || [];
      const ordersData = ordersResponse.data || [];

      setGames(gamesData);
      setOrders(ordersData);

      const revenue = ordersData.reduce(
        (total, order) => total + Number(order.total || 0),
        0,
      );

      const inventory = gamesData.reduce(
        (total, game) => total + Number(game.stock || 0),
        0,
      );

      const lowStock = gamesData.filter(
        (game) => Number(game.stock || 0) > 0 && Number(game.stock || 0) <= 5,
      ).length;

      const outOfStock = gamesData.filter(
        (game) => Number(game.stock || 0) === 0,
      ).length;

      const uniqueCustomers = new Set(
        ordersData
          .map((order) => order.user?._id || order.user?.email || order.email)
          .filter(Boolean),
      );

      setStats({
        revenue,
        orders: ordersData.length,
        customers: Math.max(uniqueCustomers.size, 1),
        products: gamesData.length,
        inventory,
        lowStock,
        outOfStock,
      });
    } catch (err) {
      console.error("Admin data error:", err);

      setError(
        err?.response?.data?.message || "Unable to load admin dashboard data.",
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadAdminData();
  }, []);

  // =========================
  // UPDATE ORDER
  // =========================

  async function updateOrderStatus(orderId, status) {
    try {
      await api.put(`/orders/${orderId}`, {
        status,
      });

      await loadAdminData();
    } catch (err) {
      console.error(err);
      alert("Unable to update order status.");
    }
  }

  // =========================
  // DELETE GAME
  // =========================

  async function deleteGame(gameId) {
    const confirmed = window.confirm(
      "Are you sure you want to delete this game?",
    );

    if (!confirmed) return;

    try {
      await api.delete(`/games/${gameId}`);

      await loadAdminData();
    } catch (err) {
      console.error(err);
      alert("Unable to delete game.");
    }
  }

  // =========================
  // CHART DATA
  // =========================

  const chartData = games.slice(0, 7).map((game) => ({
    name:
      game.title?.length > 12
        ? `${game.title.substring(0, 12)}...`
        : game.title,

    stock: Number(game.stock || 0),
  }));

  // =========================
  // CURRENCY
  // =========================

  function formatCurrency(value) {
    return `₹${Number(value || 0).toLocaleString("en-IN")}`;
  }

  // =========================
  // PAGE
  // =========================

  return (
    <div className="min-h-screen bg-[#050505] px-4 py-6 text-white md:px-8">
      <div className="mx-auto max-w-7xl">
        {/* ================= HEADER ================= */}

        <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <div className="mb-2 flex items-center gap-2">
              <span className="h-2 w-2 animate-pulse rounded-full bg-lime-400" />

              <span className="text-xs font-semibold uppercase tracking-[0.3em] text-lime-400">
                Business Control
              </span>
            </div>

            <h1 className="text-3xl font-black tracking-tight md:text-4xl">
              NEXORA ADMIN
            </h1>

            <p className="mt-2 text-sm text-gray-400">
              Manage your gaming store, products, orders and business data.
            </p>
          </div>

          <button
            onClick={loadAdminData}
            disabled={loading}
            className="flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/5 px-5 py-3 text-sm font-semibold transition hover:border-lime-400/40 hover:bg-lime-400/10 disabled:opacity-50"
          >
            <RefreshCw size={17} className={loading ? "animate-spin" : ""} />
            Refresh Data
          </button>
        </div>

        {/* ================= ADMIN NAVIGATION ================= */}

        <div className="mb-8 rounded-2xl border border-white/10 bg-white/[0.03] p-4 shadow-2xl backdrop-blur-xl">
          <div className="mb-5">
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-lime-400">
              NEXORA ADMIN
            </p>

            <h2 className="mt-1 text-xl font-bold">Management Center</h2>
          </div>

          {/* 7 management modules */}
          <div className="grid grid-cols-2 gap-3 md:grid-cols-4 lg:grid-cols-7">
            {/* DASHBOARD */}

            <Link
              to="/admin"
              className="group rounded-xl border border-lime-400/30 bg-lime-400/10 p-4 transition duration-300 hover:-translate-y-1 hover:bg-lime-400/20"
            >
              <LayoutDashboard
                size={22}
                className="text-lime-400 transition group-hover:scale-110"
              />

              <p className="mt-3 font-semibold">Dashboard</p>

              <p className="text-xs text-gray-400">Overview</p>
            </Link>

            {/* PRODUCTS */}

            <Link
              to="/admin/products"
              className="group rounded-xl border border-white/10 bg-white/[0.03] p-4 transition duration-300 hover:-translate-y-1 hover:border-lime-400/40 hover:bg-lime-400/10"
            >
              <Gamepad2
                size={22}
                className="text-lime-400 transition group-hover:scale-110"
              />

              <p className="mt-3 font-semibold">Products</p>

              <p className="text-xs text-gray-400">Manage games</p>
            </Link>

            {/* INVENTORY */}

            <Link
              to="/admin/inventory"
              className="group rounded-xl border border-white/10 bg-white/[0.03] p-4 transition duration-300 hover:-translate-y-1 hover:border-lime-400/40 hover:bg-lime-400/10"
            >
              <Boxes
                size={22}
                className="text-lime-400 transition group-hover:scale-110"
              />

              <p className="mt-3 font-semibold">Inventory</p>

              <p className="text-xs text-gray-400">Stock control</p>
            </Link>

            {/* ORDERS */}

            <Link
              to="/admin/orders"
              className="group rounded-xl border border-white/10 bg-white/[0.03] p-4 transition duration-300 hover:-translate-y-1 hover:border-lime-400/40 hover:bg-lime-400/10"
            >
              <ShoppingCart
                size={22}
                className="text-lime-400 transition group-hover:scale-110"
              />

              <p className="mt-3 font-semibold">Orders</p>

              <p className="text-xs text-gray-400">Order management</p>
            </Link>

            {/* CUSTOMERS */}

            <Link
              to="/admin/customers"
              className="group rounded-xl border border-white/10 bg-white/[0.03] p-4 transition duration-300 hover:-translate-y-1 hover:border-lime-400/40 hover:bg-lime-400/10"
            >
              <Users
                size={22}
                className="text-lime-400 transition group-hover:scale-110"
              />

              <p className="mt-3 font-semibold">Customers</p>

              <p className="text-xs text-gray-400">User management</p>
            </Link>

            {/* BILLING */}

            <Link
              to="/admin/billing"
              className="group rounded-xl border border-white/10 bg-white/[0.03] p-4 transition duration-300 hover:-translate-y-1 hover:border-lime-400/40 hover:bg-lime-400/10"
            >
              <Receipt
                size={22}
                className="text-lime-400 transition group-hover:scale-110"
              />

              <p className="mt-3 font-semibold">Billing</p>

              <p className="text-xs text-gray-400">Invoices</p>
            </Link>

            {/* REPORTS */}

            <Link
              to="/admin/reports"
              className="group rounded-xl border border-white/10 bg-white/[0.03] p-4 transition duration-300 hover:-translate-y-1 hover:border-lime-400/40 hover:bg-lime-400/10"
            >
              <BarChart3
                size={22}
                className="text-lime-400 transition group-hover:scale-110"
              />

              <p className="mt-3 font-semibold">Reports</p>

              <p className="text-xs text-gray-400">Analytics</p>
            </Link>
          </div>
        </div>

        {/* ================= ERROR ================= */}

        {error && (
          <div className="mb-6 rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-300">
            {error}
          </div>
        )}

        {/* ================= STAT CARDS ================= */}

        <div className="mb-8 grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-7">
          <StatCard
            title="Revenue"
            value={formatCurrency(stats.revenue)}
            icon={<TrendingUp size={19} />}
          />

          <StatCard
            title="Orders"
            value={stats.orders}
            icon={<ShoppingCart size={19} />}
          />

          <StatCard
            title="Customers"
            value={stats.customers}
            icon={<Users size={19} />}
          />

          <StatCard
            title="Products"
            value={stats.products}
            icon={<Gamepad2 size={19} />}
          />

          <StatCard
            title="Inventory"
            value={stats.inventory}
            icon={<Package size={19} />}
          />

          <StatCard
            title="Low Stock"
            value={stats.lowStock}
            icon={<AlertTriangle size={19} />}
          />

          <StatCard
            title="Out Stock"
            value={stats.outOfStock}
            icon={<Boxes size={19} />}
          />
        </div>

        {/* ================= INVENTORY STATUS ================= */}

        <div className="mb-8 grid gap-5 md:grid-cols-3">
          <InfoCard
            title="Inventory Status"
            value={`${stats.inventory} Units`}
            description="Total available stock"
            icon={<Package size={22} />}
          />

          <InfoCard
            title="Low Stock"
            value={`${stats.lowStock} Products`}
            description="Products needing attention"
            icon={<AlertTriangle size={22} />}
          />

          <InfoCard
            title="Out of Stock"
            value={`${stats.outOfStock} Products`}
            description="Currently unavailable"
            icon={<Boxes size={22} />}
          />
        </div>

        {/* ================= CHART + INVENTORY ================= */}

        <div className="mb-8 grid gap-6 lg:grid-cols-2">
          {/* CHART */}

          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
            <div className="mb-6">
              <p className="text-xs uppercase tracking-[0.25em] text-gray-500">
                Inventory Analytics
              </p>

              <h2 className="mt-1 text-xl font-bold">Product Stock</h2>
            </div>

            <div className="h-[300px]">
              {chartData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData}>
                    <XAxis
                      dataKey="name"
                      tick={{
                        fill: "#888",
                        fontSize: 11,
                      }}
                    />

                    <YAxis
                      tick={{
                        fill: "#888",
                        fontSize: 11,
                      }}
                    />

                    <Tooltip
                      contentStyle={{
                        background: "#111",
                        border: "1px solid #333",
                        borderRadius: "12px",
                        color: "#fff",
                      }}
                    />

                    <Bar dataKey="stock" fill="#a3e635" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex h-full items-center justify-center text-gray-500">
                  No inventory data available.
                </div>
              )}
            </div>
          </div>

          {/* INVENTORY LIST */}

          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
            <div className="mb-5 flex items-center justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.25em] text-gray-500">
                  Live Inventory
                </p>

                <h2 className="mt-1 text-xl font-bold">Games</h2>
              </div>

              <Link
                to="/admin/products"
                className="rounded-lg bg-lime-400 px-3 py-2 text-xs font-bold text-black transition hover:bg-lime-300"
              >
                Manage
              </Link>
            </div>

            <div className="max-h-[330px] space-y-3 overflow-y-auto pr-1">
              {games.length === 0 ? (
                <p className="py-10 text-center text-gray-500">
                  No games found.
                </p>
              ) : (
                games.map((game) => (
                  <div
                    key={game._id}
                    className="flex items-center justify-between rounded-xl border border-white/5 bg-black/20 p-3"
                  >
                    <div className="flex min-w-0 items-center gap-3">
                      <img
                        src={game.image}
                        alt={game.title}
                        className="h-12 w-12 rounded-lg object-cover"
                        onError={(e) => {
                          e.currentTarget.style.display = "none";
                        }}
                      />

                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold">
                          {game.title}
                        </p>

                        <p className="text-xs text-gray-500">
                          {game.genre || "Gaming"}
                        </p>
                      </div>
                    </div>

                    <StockBadge stock={game.stock} />
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* ================= LOW STOCK ================= */}

        {stats.lowStock > 0 && (
          <div className="mb-8 rounded-2xl border border-yellow-400/20 bg-yellow-400/5 p-5">
            <div className="mb-4 flex items-center gap-3">
              <div className="rounded-xl bg-yellow-400/10 p-3">
                <AlertTriangle size={22} className="text-yellow-400" />
              </div>

              <div>
                <h2 className="font-bold">Low Stock Alert</h2>

                <p className="text-xs text-gray-400">
                  These products may need restocking.
                </p>
              </div>
            </div>

            <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
              {games
                .filter(
                  (game) =>
                    Number(game.stock || 0) > 0 && Number(game.stock || 0) <= 5,
                )
                .map((game) => (
                  <div
                    key={game._id}
                    className="rounded-xl border border-yellow-400/10 bg-black/20 p-4"
                  >
                    <p className="font-semibold">{game.title}</p>

                    <p className="mt-1 text-sm text-yellow-400">
                      Only {game.stock} left
                    </p>
                  </div>
                ))}
            </div>
          </div>
        )}

        {/* ================= PRODUCT MANAGEMENT ================= */}

        <div className="mb-8 rounded-2xl border border-white/10 bg-white/[0.03] p-5">
          <div className="mb-5 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.25em] text-gray-500">
                Catalog
              </p>

              <h2 className="mt-1 text-xl font-bold">Product Management</h2>
            </div>

            <Link
              to="/admin/products"
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-lime-400 px-5 py-3 text-sm font-bold text-black transition hover:bg-lime-300"
            >
              <Gamepad2 size={18} />
              Manage Products
            </Link>
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {games.slice(0, 6).map((game) => (
              <div
                key={game._id}
                className="overflow-hidden rounded-xl border border-white/10 bg-black/20"
              >
                <div className="flex gap-4 p-4">
                  <img
                    src={game.image}
                    alt={game.title}
                    className="h-20 w-20 rounded-lg object-cover"
                    onError={(e) => {
                      e.currentTarget.style.display = "none";
                    }}
                  />

                  <div className="min-w-0 flex-1">
                    <h3 className="truncate font-bold">{game.title}</h3>

                    <p className="mt-1 text-xs text-gray-500">
                      {game.genre || "Gaming"}
                    </p>

                    <p className="mt-2 text-sm text-lime-400">
                      {formatCurrency(game.price)}
                    </p>

                    <p className="mt-1 text-xs text-gray-500">
                      Stock: {game.stock ?? 0}
                    </p>
                  </div>
                </div>

                <div className="flex border-t border-white/10">
                  <Link
                    to="/admin/products"
                    className="flex-1 px-4 py-3 text-center text-xs font-semibold text-lime-400 transition hover:bg-lime-400/10"
                  >
                    Edit
                  </Link>

                  <button
                    onClick={() => deleteGame(game._id)}
                    className="flex items-center justify-center gap-1 border-l border-white/10 px-4 py-3 text-xs font-semibold text-red-400 transition hover:bg-red-400/10"
                  >
                    <Trash2 size={14} />
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ================= RECENT ORDERS ================= */}

        <div className="mb-8 rounded-2xl border border-white/10 bg-white/[0.03] p-5">
          <div className="mb-5">
            <p className="text-xs uppercase tracking-[0.25em] text-gray-500">
              Sales
            </p>

            <h2 className="mt-1 text-xl font-bold">Recent Orders</h2>
          </div>

          {orders.length === 0 ? (
            <div className="rounded-xl border border-white/5 bg-black/20 py-12 text-center">
              <ShoppingCart size={35} className="mx-auto mb-3 text-gray-600" />

              <p className="text-gray-400">No orders yet.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {orders.slice(0, 8).map((order) => (
                <div
                  key={order._id}
                  className="flex flex-col gap-4 rounded-xl border border-white/5 bg-black/20 p-4 md:flex-row md:items-center md:justify-between"
                >
                  <div>
                    <p className="font-semibold">
                      Order #{order._id?.slice(-8)}
                    </p>

                    <p className="mt-1 text-xs text-gray-500">
                      {order.user?.email || order.email || "Customer"}
                    </p>
                  </div>

                  <div className="flex items-center gap-4">
                    <p className="font-bold text-lime-400">
                      {formatCurrency(order.total)}
                    </p>

                    <select
                      value={order.status || "Pending"}
                      onChange={(e) =>
                        updateOrderStatus(order._id, e.target.value)
                      }
                      className="rounded-lg border border-white/10 bg-[#111] px-3 py-2 text-xs text-white outline-none focus:border-lime-400"
                    >
                      <option value="Pending">Pending</option>

                      <option value="Processing">Processing</option>

                      <option value="Shipped">Shipped</option>

                      <option value="Delivered">Delivered</option>

                      <option value="Cancelled">Cancelled</option>
                    </select>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* ================= FOOTER CARDS ================= */}

        <div className="grid gap-4 md:grid-cols-3">
          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
            <Gamepad2 size={22} className="mb-3 text-lime-400" />

            <h3 className="font-bold">Product Management</h3>

            <p className="mt-2 text-sm text-gray-500">
              Add, edit, delete and manage your gaming products.
            </p>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
            <ShoppingCart size={22} className="mb-3 text-lime-400" />

            <h3 className="font-bold">Order Processing</h3>

            <p className="mt-2 text-sm text-gray-500">
              Monitor customer orders and update their status.
            </p>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
            <BarChart3 size={22} className="mb-3 text-lime-400" />

            <h3 className="font-bold">Business Analytics</h3>

            <p className="mt-2 text-sm text-gray-500">
              Track revenue, products, inventory and sales.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ========================================= */
/* STAT CARD */
/* ========================================= */

function StatCard({ title, value, icon }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4 transition hover:-translate-y-1 hover:border-lime-400/30">
      <div className="mb-3 flex items-center justify-between">
        <div className="rounded-lg bg-lime-400/10 p-2 text-lime-400">
          {icon}
        </div>
      </div>

      <p className="text-xs text-gray-500">{title}</p>

      <p className="mt-1 text-xl font-black">{value}</p>
    </div>
  );
}

/* ========================================= */
/* INFO CARD */
/* ========================================= */

function InfoCard({ title, value, description, icon }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
      <div className="mb-4 flex items-center gap-3">
        <div className="rounded-xl bg-lime-400/10 p-3 text-lime-400">
          {icon}
        </div>

        <div>
          <p className="text-xs text-gray-500">{title}</p>

          <p className="text-xl font-black">{value}</p>
        </div>
      </div>

      <p className="text-sm text-gray-500">{description}</p>
    </div>
  );
}

/* ========================================= */
/* STOCK BADGE */
/* ========================================= */

function StockBadge({ stock }) {
  const quantity = Number(stock || 0);

  if (quantity === 0) {
    return (
      <span className="rounded-full bg-red-400/10 px-3 py-1 text-xs font-semibold text-red-400">
        Out of Stock
      </span>
    );
  }

  if (quantity <= 5) {
    return (
      <span className="rounded-full bg-yellow-400/10 px-3 py-1 text-xs font-semibold text-yellow-400">
        {quantity} left
      </span>
    );
  }

  return (
    <span className="rounded-full bg-lime-400/10 px-3 py-1 text-xs font-semibold text-lime-400">
      {quantity} in stock
    </span>
  );
}
