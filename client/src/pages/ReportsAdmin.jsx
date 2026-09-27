import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import {
  BarChart3,
  TrendingUp,
  ShoppingCart,
  IndianRupee,
  Package,
  Users,
  Gamepad2,
  RefreshCw,
  ArrowUpRight,
  AlertTriangle,
  CheckCircle2,
} from "lucide-react";

import { api } from "../services/api";

const COLORS = ["#a3e635", "#22d3ee", "#a78bfa", "#fb7185", "#fbbf24"];

export default function ReportsAdmin() {
  const navigate = useNavigate();

  const [orders, setOrders] = useState([]);
  const [games, setGames] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState("all");
  const [selectedStatus, setSelectedStatus] = useState(null);
  const [selectedSalesDay, setSelectedSalesDay] = useState(null);

  async function loadReports() {
    try {
      setLoading(true);

      const [ordersRes, gamesRes, customersRes] = await Promise.all([
        api.get("/orders"),
        api.get("/games"),
        api.get("/admin/customers"),
      ]);

      setOrders(Array.isArray(ordersRes.data) ? ordersRes.data : []);
      setGames(Array.isArray(gamesRes.data) ? gamesRes.data : []);
      setCustomers(Array.isArray(customersRes.data) ? customersRes.data : []);
    } catch (error) {
      console.error("Reports loading error:", error);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadReports();
  }, []);

  /* =========================================================
     FILTER ORDERS
  ========================================================= */

  const filteredOrders = useMemo(() => {
    if (period === "all") {
      return orders;
    }

    const now = new Date();

    const days = period === "7" ? 7 : period === "30" ? 30 : 90;

    const startDate = new Date(now);
    startDate.setDate(now.getDate() - days);

    return orders.filter((order) => {
      const date = new Date(order.createdAt);

      if (Number.isNaN(date.getTime())) {
        return false;
      }

      return date >= startDate;
    });
  }, [orders, period]);

  /* =========================================================
     COMPLETED ORDERS
  ========================================================= */

  const completedOrders = filteredOrders.filter(
    (order) => String(order.status || "").toLowerCase() !== "cancelled",
  );

  /* =========================================================
     REVENUE
  ========================================================= */

  const revenue = completedOrders.reduce(
    (sum, order) => sum + Number(order.total || 0),
    0,
  );

  const totalOrders = filteredOrders.length;

  const averageOrderValue =
    completedOrders.length > 0 ? revenue / completedOrders.length : 0;

  /* =========================================================
     NORMALIZE ORDER ITEMS
     
     This handles different possible backend structures:
     
     order.items
     order.products
     order.games
     order.cart
     ========================================================= */

  function getOrderItems(order) {
    const possibleItems =
      order?.items || order?.products || order?.games || order?.cart || [];

    if (Array.isArray(possibleItems)) {
      return possibleItems;
    }

    if (possibleItems && typeof possibleItems === "object") {
      return Object.values(possibleItems);
    }

    return [];
  }

  /* =========================================================
     NORMALIZE QUANTITY
  ========================================================= */

  function getItemQuantity(item) {
    const quantity =
      item?.quantity ?? item?.qty ?? item?.count ?? item?.units ?? item?.amount;

    const parsed = Number(quantity);

    return Number.isFinite(parsed) && parsed > 0 ? parsed : 1;
  }

  /* =========================================================
     NORMALIZE GAME TITLE
  ========================================================= */

  function getItemTitle(item) {
    return (
      item?.title ||
      item?.name ||
      item?.gameTitle ||
      item?.productName ||
      item?.game?.title ||
      item?.product?.title ||
      item?.game?.name ||
      item?.product?.name ||
      "Game"
    );
  }

  /* =========================================================
     NORMALIZE ITEM PRICE
  ========================================================= */

  function getItemPrice(item) {
    const price =
      item?.price ??
      item?.unitPrice ??
      item?.game?.price ??
      item?.product?.price ??
      0;

    const parsed = Number(price);

    return Number.isFinite(parsed) ? parsed : 0;
  }

  /* =========================================================
     TOTAL GAMES SOLD
  ========================================================= */

  const totalUnitsSold = completedOrders.reduce((orderTotal, order) => {
    const items = getOrderItems(order);

    const itemTotal = items.reduce(
      (sum, item) => sum + getItemQuantity(item),
      0,
    );

    return orderTotal + itemTotal;
  }, 0);

  /* =========================================================
     SALES BY DAY
  ========================================================= */

  const salesByDay = useMemo(() => {
    const map = {};

    completedOrders.forEach((order) => {
      const date = new Date(order.createdAt);

      if (Number.isNaN(date.getTime())) {
        return;
      }

      const key = date.toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
      });

      if (!map[key]) {
        map[key] = {
          date: key,
          revenue: 0,
          orders: 0,
        };
      }

      map[key].revenue += Number(order.total || 0);
      map[key].orders += 1;
    });

    return Object.values(map).slice(-14);
  }, [completedOrders]);

  /* =========================================================
     BEST SELLING GAMES
  ========================================================= */

  const bestSellingGames = useMemo(() => {
    const map = {};

    completedOrders.forEach((order) => {
      const items = getOrderItems(order);

      items.forEach((item) => {
        const title = getItemTitle(item);
        const quantity = getItemQuantity(item);
        const price = getItemPrice(item);

        if (!map[title]) {
          map[title] = {
            title,
            units: 0,
            revenue: 0,
          };
        }

        map[title].units += quantity;
        map[title].revenue += price * quantity;
      });
    });

    return Object.values(map)
      .sort((a, b) => b.units - a.units)
      .slice(0, 6);
  }, [completedOrders]);

  /* =========================================================
     ORDER STATUS
  ========================================================= */

  const orderStatusData = useMemo(() => {
    const statusMap = {};

    filteredOrders.forEach((order) => {
      const rawStatus = String(order?.status || "Pending").trim();
      const status =
        rawStatus.charAt(0).toUpperCase() + rawStatus.slice(1).toLowerCase();

      statusMap[status] = (statusMap[status] || 0) + 1;
    });

    return Object.entries(statusMap).map(([name, value]) => ({
      name,
      value,
    }));
  }, [filteredOrders]);

  const selectedStatusOrders = useMemo(() => {
    if (!selectedStatus) return [];

    return filteredOrders.filter((order) => {
      const rawStatus = String(order?.status || "Pending").trim();
      const status =
        rawStatus.charAt(0).toUpperCase() + rawStatus.slice(1).toLowerCase();

      return status === selectedStatus;
    });
  }, [filteredOrders, selectedStatus]);

  /* =========================================================
     INVENTORY
  ========================================================= */

  const inventoryData = useMemo(() => {
    return [...games]
      .sort((a, b) => Number(b.stock || 0) - Number(a.stock || 0))
      .slice(0, 8)
      .map((game) => ({
        name:
          game.title?.length > 14
            ? `${game.title.substring(0, 14)}...`
            : game.title,

        stock: Number(game.stock || 0),
      }));
  }, [games]);

  /* =========================================================
     INVENTORY STATS
  ========================================================= */

  const lowStock = games.filter(
    (game) => Number(game.stock || 0) > 0 && Number(game.stock || 0) <= 5,
  ).length;

  const outOfStock = games.filter(
    (game) => Number(game.stock || 0) <= 0,
  ).length;

  /* =========================================================
     CURRENCY
  ========================================================= */

  function formatCurrency(value) {
    return `₹${Number(value || 0).toLocaleString("en-IN")}`;
  }

  /* =========================================================
     LOADING
  ========================================================= */

  if (loading) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center bg-[#07090d] text-white">
        <div className="text-center">
          <RefreshCw className="w-10 h-10 animate-spin mx-auto text-lime-400 mb-4" />

          <p className="text-zinc-400">Loading reports...</p>
        </div>
      </div>
    );
  }

  /* =========================================================
     PAGE
  ========================================================= */

  return (
    <div className="min-h-screen bg-[#07090d] text-white px-4 sm:px-6 lg:px-8 py-8">
      <div className="max-w-7xl mx-auto">
        {/* HEADER */}

        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-5 mb-8">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-11 h-11 rounded-2xl bg-lime-400/10 border border-lime-400/20 flex items-center justify-center">
                <BarChart3 className="w-6 h-6 text-lime-400" />
              </div>

              <div>
                <h1 className="text-3xl font-black tracking-tight">
                  Reports & Analytics
                </h1>

                <p className="text-zinc-500 text-sm">
                  Business performance and gaming store insights
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <select
              value={period}
              onChange={(e) => setPeriod(e.target.value)}
              className="bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-3 text-sm outline-none focus:border-lime-400"
            >
              <option value="all">All Time</option>

              <option value="7">Last 7 Days</option>

              <option value="30">Last 30 Days</option>

              <option value="90">Last 90 Days</option>
            </select>

            <button
              onClick={loadReports}
              className="flex items-center gap-2 px-4 py-3 rounded-xl bg-zinc-900 border border-zinc-800 hover:border-lime-400 transition"
            >
              <RefreshCw className="w-4 h-4" />
              Refresh
            </button>
          </div>
        </div>

        {/* KPI CARDS */}

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <ReportCard
            title="Total Revenue"
            value={formatCurrency(revenue)}
            icon={<IndianRupee />}
            description={`${completedOrders.length} completed orders`}
            actionLabel="View Billing"
            onClick={() => navigate("/admin/billing")}
          />

          <ReportCard
            title="Total Orders"
            value={totalOrders}
            icon={<ShoppingCart />}
            description={`${totalUnitsSold} games sold`}
            actionLabel="View Orders"
            onClick={() => navigate("/admin/orders")}
          />

          <ReportCard
            title="Average Order"
            value={formatCurrency(averageOrderValue)}
            icon={<TrendingUp />}
            description="Average completed order"
            actionLabel="View Orders"
            onClick={() => navigate("/admin/orders")}
          />

          <ReportCard
            title="Customers"
            value={customers.length}
            icon={<Users />}
            description="Registered customers"
            actionLabel="View Customers"
            onClick={() => navigate("/admin/customers")}
          />
        </div>

        {/* SALES PERFORMANCE */}

        <section className="bg-zinc-900/70 border border-zinc-800 rounded-3xl p-5 sm:p-6 mb-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-bold">Sales Performance</h2>

              <p className="text-zinc-500 text-sm">
                Revenue and orders over time
              </p>
            </div>

            <TrendingUp className="text-lime-400" />
          </div>

          <div className="h-[340px]">
            {salesByDay.length > 0 ? (
              salesByDay.length === 1 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={salesByDay}
                    margin={{
                      top: 20,
                      right: 30,
                      left: 10,
                      bottom: 10,
                    }}
                    onClick={(state) => {
                      const point = state?.activePayload?.[0]?.payload;

                      if (point) {
                        setSelectedSalesDay(point);
                      }
                    }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />

                    <XAxis
                      dataKey="date"
                      stroke="#71717a"
                      fontSize={12}
                      tickLine={false}
                    />

                    <YAxis
                      yAxisId="revenue"
                      orientation="left"
                      stroke="#a3e635"
                      fontSize={12}
                      tickFormatter={(value) => `₹${value}`}
                      tickLine={false}
                      axisLine={{ stroke: "#3f3f46" }}
                    />

                    <YAxis
                      yAxisId="orders"
                      orientation="right"
                      stroke="#22d3ee"
                      fontSize={12}
                      allowDecimals={false}
                      tickLine={false}
                      axisLine={{ stroke: "#3f3f46" }}
                    />

                    <Tooltip
                      contentStyle={{
                        background: "#111318",
                        border: "1px solid #27272a",
                        borderRadius: "12px",
                        color: "#fff",
                      }}
                      formatter={(value, name) =>
                        name === "revenue"
                          ? [formatCurrency(value), "Revenue"]
                          : [
                              `${value} order${Number(value) === 1 ? "" : "s"}`,
                              "Orders",
                            ]
                      }
                    />

                    <Legend />

                    <Bar
                      yAxisId="revenue"
                      dataKey="revenue"
                      name="Revenue"
                      fill="#a3e635"
                      radius={[8, 8, 0, 0]}
                      barSize={70}
                      onClick={(data) => {
                        if (data?.payload) {
                          setSelectedSalesDay(data.payload);
                        }
                      }}
                    />

                    <Bar
                      yAxisId="orders"
                      dataKey="orders"
                      name="Orders"
                      fill="#22d3ee"
                      radius={[8, 8, 0, 0]}
                      barSize={40}
                      onClick={(data) => {
                        if (data?.payload) {
                          setSelectedSalesDay(data.payload);
                        }
                      }}
                    />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart
                    data={salesByDay}
                    margin={{
                      top: 10,
                      right: 20,
                      left: 10,
                      bottom: 5,
                    }}
                    onClick={(state) => {
                      const point = state?.activePayload?.[0]?.payload;

                      if (point) {
                        setSelectedSalesDay(point);
                      }
                    }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />

                    <XAxis
                      dataKey="date"
                      stroke="#71717a"
                      fontSize={12}
                      tickLine={false}
                    />

                    <YAxis
                      yAxisId="revenue"
                      orientation="left"
                      stroke="#a3e635"
                      fontSize={12}
                      tickFormatter={(value) => `₹${value}`}
                      tickLine={false}
                      axisLine={{ stroke: "#3f3f46" }}
                    />

                    <YAxis
                      yAxisId="orders"
                      orientation="right"
                      stroke="#22d3ee"
                      fontSize={12}
                      allowDecimals={false}
                      tickLine={false}
                      axisLine={{ stroke: "#3f3f46" }}
                    />

                    <Tooltip
                      contentStyle={{
                        background: "#111318",
                        border: "1px solid #27272a",
                        borderRadius: "12px",
                        color: "#fff",
                      }}
                      labelStyle={{
                        color: "#fff",
                        marginBottom: "6px",
                      }}
                      formatter={(value, name) =>
                        name === "revenue"
                          ? [formatCurrency(value), "Revenue"]
                          : [
                              `${value} order${Number(value) === 1 ? "" : "s"}`,
                              "Orders",
                            ]
                      }
                    />

                    <Legend />

                    <Line
                      yAxisId="revenue"
                      type="monotone"
                      dataKey="revenue"
                      name="Revenue"
                      stroke="#a3e635"
                      strokeWidth={3}
                      dot={{
                        r: 5,
                        fill: "#a3e635",
                        stroke: "#fff",
                        strokeWidth: 2,
                      }}
                      activeDot={{
                        r: 8,
                        onClick: (_, payload) => {
                          if (payload?.payload) {
                            setSelectedSalesDay(payload.payload);
                          }
                        },
                      }}
                    />

                    <Line
                      yAxisId="orders"
                      type="monotone"
                      dataKey="orders"
                      name="Orders"
                      stroke="#22d3ee"
                      strokeWidth={3}
                      dot={{
                        r: 5,
                        fill: "#22d3ee",
                        stroke: "#fff",
                        strokeWidth: 2,
                      }}
                      activeDot={{
                        r: 8,
                        onClick: (_, payload) => {
                          if (payload?.payload) {
                            setSelectedSalesDay(payload.payload);
                          }
                        },
                      }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              )
            ) : (
              <EmptyChart message="No sales data available yet" />
            )}
          </div>

          <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="rounded-2xl border border-lime-400/20 bg-lime-400/5 p-4">
              <p className="text-xs uppercase tracking-wider text-zinc-500">
                Revenue
              </p>
              <p className="mt-1 text-xl font-bold text-lime-400">
                {formatCurrency(
                  salesByDay.reduce(
                    (sum, day) => sum + Number(day.revenue || 0),
                    0,
                  ),
                )}
              </p>
            </div>

            <div className="rounded-2xl border border-cyan-400/20 bg-cyan-400/5 p-4">
              <p className="text-xs uppercase tracking-wider text-zinc-500">
                Orders
              </p>
              <p className="mt-1 text-xl font-bold text-cyan-400">
                {salesByDay.reduce(
                  (sum, day) => sum + Number(day.orders || 0),
                  0,
                )}
              </p>
            </div>

            <div className="rounded-2xl border border-zinc-800 bg-black/20 p-4">
              <p className="text-xs uppercase tracking-wider text-zinc-500">
                Sales Days
              </p>
              <p className="mt-1 text-xl font-bold text-white">
                {salesByDay.length}
              </p>
            </div>
          </div>

          {salesByDay.length === 1 && (
            <p className="mt-3 text-center text-xs text-zinc-600">
              All current sales are on the same date, so the chart shows one
              data point.
            </p>
          )}
        </section>

        {/* TWO COLUMN */}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* BEST SELLING */}

          <section className="bg-zinc-900/70 border border-zinc-800 rounded-3xl p-5 sm:p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-xl font-bold">Best-Selling Games</h2>

                <p className="text-zinc-500 text-sm">
                  Games generating the most sales
                </p>
              </div>

              <Gamepad2 className="text-lime-400" />
            </div>

            {bestSellingGames.length > 0 ? (
              <div className="space-y-3">
                {bestSellingGames.map((game, index) => (
                  <div
                    key={game.title}
                    className="flex items-center justify-between gap-4 bg-black/20 border border-zinc-800 rounded-2xl p-4"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-9 h-9 rounded-xl bg-lime-400/10 text-lime-400 flex items-center justify-center font-bold">
                        {index + 1}
                      </div>

                      <div className="min-w-0">
                        <p className="font-semibold truncate">{game.title}</p>

                        <p className="text-xs text-zinc-500">
                          {game.units} units sold
                        </p>
                      </div>
                    </div>

                    <p className="font-bold text-lime-400 whitespace-nowrap">
                      {formatCurrency(game.revenue)}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <EmptyChart message="No games sold yet" />
            )}
          </section>

          {/* ORDER STATUS */}

          <section className="bg-zinc-900/70 border border-zinc-800 rounded-3xl p-5 sm:p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-xl font-bold">Order Statistics</h2>

                <p className="text-zinc-500 text-sm">
                  Current order distribution
                </p>
              </div>

              <ShoppingCart className="text-cyan-400" />
            </div>

            <div className="h-[260px]">
              {orderStatusData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={orderStatusData}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      outerRadius={90}
                      label={({ name, value }) => `${name}: ${value}`}
                      labelLine
                      onClick={(entry) => {
                        if (entry?.name) {
                          setSelectedStatus(entry.name);
                        }
                      }}
                    >
                      {orderStatusData.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={COLORS[index % COLORS.length]}
                          stroke="#18181b"
                          strokeWidth={2}
                          style={{ cursor: "pointer" }}
                        />
                      ))}
                    </Pie>

                    <Tooltip
                      contentStyle={{
                        background: "#111318",
                        border: "1px solid #27272a",
                        borderRadius: "12px",
                        color: "#fff",
                      }}
                      formatter={(value, name) => [
                        `${value} order${Number(value) === 1 ? "" : "s"}`,
                        name,
                      ]}
                    />

                    <Legend
                      wrapperStyle={{
                        cursor: "pointer",
                        paddingTop: "8px",
                      }}
                      onClick={(entry) => {
                        if (entry?.value) {
                          setSelectedStatus(entry.value);
                        }
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <EmptyChart message="No orders available" />
              )}
            </div>

            {orderStatusData.length > 0 && (
              <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 gap-2">
                {orderStatusData.map((status, index) => (
                  <button
                    key={status.name}
                    type="button"
                    onClick={() => setSelectedStatus(status.name)}
                    className="flex items-center justify-between rounded-xl border border-zinc-800 bg-black/20 px-3 py-2 text-left transition hover:border-lime-400/50 hover:bg-lime-400/5"
                  >
                    <span className="flex items-center gap-2 text-xs text-zinc-300">
                      <span
                        className="h-2.5 w-2.5 rounded-full"
                        style={{
                          background: COLORS[index % COLORS.length],
                        }}
                      />
                      {status.name}
                    </span>
                    <span className="font-bold text-white">{status.value}</span>
                  </button>
                ))}
              </div>
            )}

            <p className="mt-3 text-center text-[11px] text-zinc-600">
              Click a status in the chart or below to view its orders.
            </p>
          </section>
        </div>

        {/* INVENTORY */}

        <section className="bg-zinc-900/70 border border-zinc-800 rounded-3xl p-5 sm:p-6 mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
            <div>
              <h2 className="text-xl font-bold">Inventory Performance</h2>

              <p className="text-zinc-500 text-sm">
                Current stock levels across your game catalog
              </p>
            </div>

            <div className="flex gap-3">
              <MiniStatus
                icon={<Package />}
                label="Products"
                value={games.length}
              />

              <MiniStatus
                icon={<AlertTriangle />}
                label="Low Stock"
                value={lowStock}
              />

              <MiniStatus
                icon={<CheckCircle2 />}
                label="Out"
                value={outOfStock}
              />
            </div>
          </div>

          <div className="h-[300px]">
            {inventoryData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={inventoryData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />

                  <XAxis dataKey="name" stroke="#71717a" fontSize={11} />

                  <YAxis stroke="#71717a" fontSize={12} />

                  <Tooltip
                    contentStyle={{
                      background: "#111318",
                      border: "1px solid #27272a",
                      borderRadius: "12px",
                    }}
                  />

                  <Bar dataKey="stock" fill="#a3e635" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <EmptyChart message="No inventory data available" />
            )}
          </div>
        </section>

        {/* BUSINESS SUMMARY */}

        <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <SummaryCard
            icon={<ArrowUpRight />}
            title="Sales Activity"
            value={`${totalUnitsSold} units`}
            text="Total games sold in the selected period."
          />

          <SummaryCard
            icon={<Users />}
            title="Customer Base"
            value={`${customers.length}`}
            text="Customers currently registered with NEXORA."
          />

          <SummaryCard
            icon={<Package />}
            title="Catalog"
            value={`${games.length} games`}
            text={`${lowStock} products need stock attention.`}
          />
        </section>

        {selectedSalesDay && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
            <div className="w-full max-w-md rounded-3xl border border-zinc-800 bg-[#0d0f13] shadow-2xl">
              <div className="flex items-center justify-between border-b border-zinc-800 p-5">
                <div>
                  <p className="text-xs uppercase tracking-[0.2em] text-lime-400">
                    Sales Details
                  </p>
                  <h3 className="mt-1 text-xl font-bold text-white">
                    {selectedSalesDay.date}
                  </h3>
                </div>

                <button
                  type="button"
                  onClick={() => setSelectedSalesDay(null)}
                  className="rounded-xl border border-zinc-800 px-3 py-2 text-sm text-zinc-400 transition hover:border-zinc-600 hover:text-white"
                >
                  Close
                </button>
              </div>

              <div className="grid grid-cols-2 gap-3 p-5">
                <div className="rounded-2xl border border-lime-400/20 bg-lime-400/5 p-4">
                  <p className="text-xs text-zinc-500">Revenue</p>
                  <p className="mt-1 text-2xl font-bold text-lime-400">
                    {formatCurrency(selectedSalesDay.revenue)}
                  </p>
                </div>

                <div className="rounded-2xl border border-cyan-400/20 bg-cyan-400/5 p-4">
                  <p className="text-xs text-zinc-500">Orders</p>
                  <p className="mt-1 text-2xl font-bold text-cyan-400">
                    {selectedSalesDay.orders}
                  </p>
                </div>
              </div>

              <div className="px-5 pb-5">
                <button
                  type="button"
                  onClick={() => {
                    setSelectedSalesDay(null);
                    navigate("/admin/orders");
                  }}
                  className="w-full rounded-xl bg-lime-400 px-4 py-3 text-sm font-bold text-black transition hover:bg-lime-300"
                >
                  View All Orders
                </button>
              </div>
            </div>
          </div>
        )}

        {selectedStatus && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
            <div className="w-full max-w-3xl max-h-[85vh] overflow-hidden rounded-3xl border border-zinc-800 bg-[#0d0f13] shadow-2xl">
              <div className="flex items-center justify-between border-b border-zinc-800 p-5">
                <div>
                  <p className="text-xs uppercase tracking-[0.2em] text-lime-400">
                    Order Status
                  </p>
                  <h3 className="mt-1 text-xl font-bold text-white">
                    {selectedStatus} Orders
                  </h3>
                  <p className="mt-1 text-sm text-zinc-500">
                    {selectedStatusOrders.length} order
                    {selectedStatusOrders.length === 1 ? "" : "s"} in this
                    status
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => setSelectedStatus(null)}
                  className="rounded-xl border border-zinc-800 px-3 py-2 text-sm text-zinc-400 transition hover:border-zinc-600 hover:text-white"
                >
                  Close
                </button>
              </div>

              <div className="max-h-[65vh] overflow-y-auto p-5">
                {selectedStatusOrders.length > 0 ? (
                  <div className="space-y-3">
                    {selectedStatusOrders.map((order) => (
                      <div
                        key={order._id}
                        className="rounded-2xl border border-zinc-800 bg-black/20 p-4"
                      >
                        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                          <div>
                            <p className="font-semibold text-white">
                              Order #{order._id?.slice(-8) || "N/A"}
                            </p>
                            <p className="mt-1 text-xs text-zinc-500">
                              {order.user?.email || order.email || "Customer"}
                            </p>
                          </div>

                          <div className="text-left sm:text-right">
                            <p className="font-bold text-lime-400">
                              {formatCurrency(order.total)}
                            </p>
                            <p className="mt-1 text-xs text-zinc-500">
                              {order.createdAt
                                ? new Date(order.createdAt).toLocaleString(
                                    "en-IN",
                                  )
                                : "Date unavailable"}
                            </p>
                          </div>
                        </div>

                        {getOrderItems(order).length > 0 && (
                          <div className="mt-3 border-t border-zinc-800 pt-3">
                            {getOrderItems(order).map((item, itemIndex) => (
                              <div
                                key={`${order._id}-${itemIndex}`}
                                className="flex items-center justify-between gap-3 py-1.5 text-sm"
                              >
                                <span className="truncate text-zinc-300">
                                  {getItemTitle(item)}
                                  <span className="ml-2 text-xs text-zinc-600">
                                    × {getItemQuantity(item)}
                                  </span>
                                </span>
                                <span className="whitespace-nowrap text-zinc-400">
                                  {formatCurrency(
                                    getItemPrice(item) * getItemQuantity(item),
                                  )}
                                </span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <EmptyChart message="No orders found for this status." />
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

/* =========================================================
   COMPONENTS
========================================================= */

function ReportCard({ title, value, icon, description, actionLabel, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="group w-full text-left bg-zinc-900/70 border border-zinc-800 rounded-3xl p-5 hover:border-lime-400/50 hover:bg-zinc-900 transition-all duration-200 cursor-pointer focus:outline-none focus:ring-2 focus:ring-lime-400/40"
    >
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="text-sm text-zinc-500">{title}</p>

          <h3 className="text-2xl font-black mt-2">{value}</h3>

          <p className="text-xs text-zinc-600 mt-2">{description}</p>

          <div className="flex items-center gap-1 mt-4 text-xs font-semibold text-lime-400 opacity-80 group-hover:opacity-100 transition">
            {actionLabel}
            <ArrowUpRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
          </div>
        </div>

        <div className="shrink-0 w-11 h-11 rounded-2xl bg-lime-400/10 border border-lime-400/20 flex items-center justify-center text-lime-400 group-hover:bg-lime-400/15 transition">
          {React.cloneElement(icon, {
            size: 20,
          })}
        </div>
      </div>
    </button>
  );
}

function MiniStatus({ icon, label, value }) {
  return (
    <div className="bg-black/20 border border-zinc-800 rounded-xl px-3 py-2 flex items-center gap-2">
      <span className="text-lime-400">
        {React.cloneElement(icon, {
          size: 15,
        })}
      </span>

      <div>
        <p className="text-[10px] text-zinc-500 uppercase">{label}</p>

        <p className="font-bold text-sm">{value}</p>
      </div>
    </div>
  );
}

function SummaryCard({ icon, title, value, text }) {
  return (
    <div className="bg-zinc-900/70 border border-zinc-800 rounded-3xl p-5">
      <div className="flex items-center gap-3 mb-3">
        <div className="w-10 h-10 rounded-xl bg-lime-400/10 text-lime-400 flex items-center justify-center">
          {React.cloneElement(icon, {
            size: 19,
          })}
        </div>

        <h3 className="font-bold">{title}</h3>
      </div>

      <p className="text-2xl font-black text-lime-400">{value}</p>

      <p className="text-xs text-zinc-500 mt-2">{text}</p>
    </div>
  );
}

function EmptyChart({ message }) {
  return (
    <div className="h-full flex items-center justify-center text-zinc-600">
      {message}
    </div>
  );
}
