import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";

import {
  ArrowLeft,
  Boxes,
  Minus,
  Package,
  Plus,
  RefreshCw,
  Search,
  AlertTriangle,
  XCircle,
  CheckCircle2,
} from "lucide-react";

import { api } from "../services/api";

export default function InventoryAdmin() {
  const [games, setGames] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState(null);
  const [error, setError] = useState("");

  // =========================
  // INVENTORY FILTER
  // =========================

  const [activeFilter, setActiveFilter] = useState("all");

  // =========================
  // LOAD INVENTORY
  // =========================

  async function loadInventory() {
    try {
      setLoading(true);
      setError("");

      const response = await api.get("/games");

      setGames(response.data || []);
    } catch (err) {
      console.error(err);

      setError(
        err?.response?.data?.message ||
          "Unable to load inventory."
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadInventory();
  }, []);

  // =========================
  // UPDATE STOCK
  // =========================

  async function updateStock(gameId, newStock) {
    if (newStock < 0) {
      newStock = 0;
    }

    try {
      setSavingId(gameId);

      await api.put(`/games/${gameId}`, {
        stock: newStock,
      });

      setGames((currentGames) =>
        currentGames.map((game) =>
          game._id === gameId
            ? { ...game, stock: newStock }
            : game
        )
      );
    } catch (err) {
      console.error(err);

      alert(
        err?.response?.data?.message ||
          "Unable to update stock."
      );
    } finally {
      setSavingId(null);
    }
  }

  // =========================
  // INCREASE STOCK
  // =========================

  function increaseStock(game) {
    const currentStock = Number(game.stock || 0);

    updateStock(game._id, currentStock + 1);
  }

  // =========================
  // DECREASE STOCK
  // =========================

  function decreaseStock(game) {
    const currentStock = Number(game.stock || 0);

    if (currentStock <= 0) return;

    updateStock(game._id, currentStock - 1);
  }

  // =========================
  // STATISTICS
  // =========================

  const totalProducts = games.length;

  const totalStock = games.reduce(
    (total, game) =>
      total + Number(game.stock || 0),
    0
  );

  const lowStock = games.filter(
    (game) =>
      Number(game.stock || 0) > 0 &&
      Number(game.stock || 0) <= 5
  ).length;

  const outOfStock = games.filter(
    (game) =>
      Number(game.stock || 0) === 0
  ).length;

  const inStock = games.filter(
    (game) =>
      Number(game.stock || 0) > 5
  ).length;

  // =========================
  // FILTER DESCRIPTION
  // =========================

  const filterInfo = {
    all: {
      title: "All Products",
      description:
        "Showing every game currently available in your NEXORA catalog.",
      count: totalProducts,
    },

    products: {
      title: "All Products",
      description:
        "Total number of gaming products currently listed in your catalog.",
      count: totalProducts,
    },

    units: {
      title: "Total Units",
      description:
        "Total number of game copies currently available across all products.",
      count: totalStock,
    },

    inStock: {
      title: "In Stock Products",
      description:
        "Games with more than 5 units available. These products have healthy stock levels.",
      count: inStock,
    },

    lowStock: {
      title: "Low Stock Products",
      description:
        "Games with 1 to 5 units remaining. These products may need restocking soon.",
      count: lowStock,
    },

    outOfStock: {
      title: "Out of Stock Products",
      description:
        "Games with 0 units available. Customers cannot purchase these until stock is added.",
      count: outOfStock,
    },
  };

  // =========================
  // FILTER GAMES
  // =========================

  const filteredGames = useMemo(() => {
    const searchText = search
      .toLowerCase()
      .trim();

    let result = games;

    // Inventory category filter
    if (activeFilter === "inStock") {
      result = result.filter(
        (game) =>
          Number(game.stock || 0) > 5
      );
    }

    if (activeFilter === "lowStock") {
      result = result.filter((game) => {
        const stock = Number(game.stock || 0);

        return stock > 0 && stock <= 5;
      });
    }

    if (activeFilter === "outOfStock") {
      result = result.filter(
        (game) =>
          Number(game.stock || 0) === 0
      );
    }

    // Search filter
    if (searchText) {
      result = result.filter((game) =>
        `${game.title || ""} ${
          game.genre || ""
        } ${game.platform || ""}`
          .toLowerCase()
          .includes(searchText)
      );
    }

    return result;
  }, [games, search, activeFilter]);

  // =========================
  // CARD CLICK
  // =========================

  function handleFilterClick(filter) {
    if (activeFilter === filter) {
      setActiveFilter("all");
    } else {
      setActiveFilter(filter);
    }
  }

  // =========================
  // PAGE
  // =========================

  return (
    <div className="min-h-screen bg-[#050505] px-4 py-6 text-white md:px-8">
      <div className="mx-auto max-w-7xl">

        {/* ================= HEADER ================= */}

        <div className="mb-8 flex flex-col gap-5 md:flex-row md:items-center md:justify-between">

          <div className="flex items-start gap-4">

            <Link
              to="/admin"
              className="mt-1 rounded-xl border border-white/10 bg-white/5 p-3 transition hover:border-lime-400/40 hover:bg-lime-400/10"
            >
              <ArrowLeft size={20} />
            </Link>

            <div>

              <div className="mb-2 flex items-center gap-2">

                <span className="h-2 w-2 rounded-full bg-lime-400" />

                <span className="text-xs font-semibold uppercase tracking-[0.3em] text-lime-400">
                  NEXORA ADMIN
                </span>

              </div>

              <h1 className="text-3xl font-black md:text-4xl">
                Inventory Management
              </h1>

              <p className="mt-2 text-sm text-gray-400">
                Monitor and manage game stock in real time.
              </p>

            </div>
          </div>

          <button
            onClick={loadInventory}
            disabled={loading}
            className="flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/5 px-5 py-3 text-sm font-semibold transition hover:border-lime-400/40 hover:bg-lime-400/10 disabled:opacity-50"
          >
            <RefreshCw
              size={17}
              className={
                loading
                  ? "animate-spin"
                  : ""
              }
            />

            Refresh Inventory
          </button>

        </div>

        {/* ================= ERROR ================= */}

        {error && (
          <div className="mb-6 flex items-center gap-3 rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-300">

            <XCircle size={20} />

            {error}

          </div>
        )}

        {/* ================= STATISTICS ================= */}

        <div className="mb-6 grid grid-cols-2 gap-4 md:grid-cols-5">

          {/* PRODUCTS */}

          <StatCard
            title="Products"
            value={totalProducts}
            icon={<Boxes size={20} />}
            active={
              activeFilter === "products" ||
              activeFilter === "all"
            }
            onClick={() =>
              handleFilterClick("products")
            }
          />

          {/* TOTAL UNITS */}

          <StatCard
            title="Total Units"
            value={totalStock}
            icon={<Package size={20} />}
            active={
              activeFilter === "units"
            }
            onClick={() =>
              handleFilterClick("units")
            }
          />

          {/* IN STOCK */}

          <StatCard
            title="In Stock"
            value={inStock}
            icon={<CheckCircle2 size={20} />}
            active={
              activeFilter === "inStock"
            }
            onClick={() =>
              handleFilterClick("inStock")
            }
          />

          {/* LOW STOCK */}

          <StatCard
            title="Low Stock"
            value={lowStock}
            icon={<AlertTriangle size={20} />}
            active={
              activeFilter === "lowStock"
            }
            onClick={() =>
              handleFilterClick("lowStock")
            }
          />

          {/* OUT OF STOCK */}

          <StatCard
            title="Out of Stock"
            value={outOfStock}
            icon={<XCircle size={20} />}
            active={
              activeFilter === "outOfStock"
            }
            onClick={() =>
              handleFilterClick("outOfStock")
            }
          />

        </div>

        {/* ================= ACTIVE FILTER INFO ================= */}

        <div className="mb-6 rounded-2xl border border-lime-400/20 bg-lime-400/[0.04] p-5">

          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">

            <div className="flex items-start gap-3">

              <div className="rounded-xl bg-lime-400/10 p-3 text-lime-400">

                {activeFilter === "lowStock" ? (
                  <AlertTriangle size={21} />
                ) : activeFilter === "outOfStock" ? (
                  <XCircle size={21} />
                ) : activeFilter === "inStock" ? (
                  <CheckCircle2 size={21} />
                ) : (
                  <Package size={21} />
                )}

              </div>

              <div>

                <p className="text-xs uppercase tracking-[0.25em] text-lime-400">
                  Inventory Overview
                </p>

                <h2 className="mt-1 text-lg font-bold">
                  {filterInfo[
                    activeFilter
                  ]?.title || "All Products"}
                </h2>

                <p className="mt-1 max-w-3xl text-sm leading-6 text-gray-400">
                  {filterInfo[
                    activeFilter
                  ]?.description}
                </p>

              </div>

            </div>

            <div className="rounded-xl border border-lime-400/20 bg-black/20 px-4 py-3">

              <p className="text-xs text-gray-500">
                Current Selection
              </p>

              <p className="mt-1 text-xl font-black text-lime-400">
                {filterInfo[
                  activeFilter
                ]?.count || 0}
              </p>

            </div>

          </div>

        </div>

        {/* ================= SEARCH ================= */}

        <div className="mb-6 rounded-2xl border border-white/10 bg-white/[0.03] p-4">

          <div className="relative">

            <Search
              size={19}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500"
            />

            <input
              type="text"
              value={search}
              onChange={(e) =>
                setSearch(e.target.value)
              }
              placeholder="Search games, genres or platforms..."
              className="w-full rounded-xl border border-white/10 bg-black/30 py-3 pl-11 pr-4 text-sm text-white outline-none transition placeholder:text-gray-600 focus:border-lime-400/50"
            />

          </div>

        </div>

        {/* ================= INVENTORY TABLE ================= */}

        <div className="overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03]">

          <div className="border-b border-white/10 p-5">

            <div className="flex items-center gap-3">

              <div className="rounded-xl bg-lime-400/10 p-3 text-lime-400">
                <Boxes size={22} />
              </div>

              <div>

                <h2 className="text-xl font-bold">
                  Product Inventory
                </h2>

                <p className="text-sm text-gray-500">
                  {filteredGames.length} products displayed
                </p>

              </div>

            </div>

          </div>

          {/* ================= LOADING ================= */}

          {loading ? (
            <div className="flex min-h-[300px] items-center justify-center">

              <div className="text-center">

                <RefreshCw
                  size={30}
                  className="mx-auto mb-3 animate-spin text-lime-400"
                />

                <p className="text-gray-400">
                  Loading inventory...
                </p>

              </div>

            </div>

          ) : filteredGames.length === 0 ? (

            /* ================= EMPTY ================= */

            <div className="flex min-h-[300px] items-center justify-center">

              <div className="px-5 text-center">

                <Boxes
                  size={40}
                  className="mx-auto mb-3 text-gray-700"
                />

                <p className="text-gray-400">
                  No products found.
                </p>

                <p className="mt-2 text-xs text-gray-600">
                  Try another search or select a different inventory category.
                </p>

              </div>

            </div>

          ) : (

            /* ================= PRODUCTS ================= */

            <div className="divide-y divide-white/5">

              {filteredGames.map((game) => {

                const stock = Number(
                  game.stock || 0
                );

                const isOutOfStock =
                  stock === 0;

                const isLowStock =
                  stock > 0 &&
                  stock <= 5;

                return (

                  <div
                    key={game._id}
                    className="p-5 transition hover:bg-white/[0.02]"
                  >

                    <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">

                      {/* PRODUCT */}

                      <div className="flex min-w-0 items-center gap-4">

                        <img
                          src={game.image}
                          alt={game.title}
                          className="h-16 w-16 rounded-xl object-cover"
                          onError={(e) => {
                            e.currentTarget.style.display =
                              "none";
                          }}
                        />

                        <div className="min-w-0">

                          <h3 className="truncate font-bold">
                            {game.title}
                          </h3>

                          <div className="mt-1 flex flex-wrap gap-2 text-xs text-gray-500">

                            <span>
                              {game.genre ||
                                "Gaming"}
                            </span>

                            {game.platform && (
                              <>
                                <span>•</span>

                                <span>
                                  {game.platform}
                                </span>
                              </>
                            )}

                          </div>

                          <p className="mt-2 text-sm text-lime-400">
                            ₹
                            {Number(
                              game.price || 0
                            ).toLocaleString(
                              "en-IN"
                            )}
                          </p>

                        </div>

                      </div>

                      {/* STOCK STATUS + CONTROLS */}

                      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">

                        <StockStatus
                          stock={stock}
                        />

                        <div className="flex items-center rounded-xl border border-white/10 bg-black/30">

                          <button
                            onClick={() =>
                              decreaseStock(
                                game
                              )
                            }
                            disabled={
                              stock === 0 ||
                              savingId ===
                                game._id
                            }
                            className="p-3 text-gray-400 transition hover:bg-red-400/10 hover:text-red-400 disabled:cursor-not-allowed disabled:opacity-30"
                            title="Decrease stock"
                          >
                            <Minus size={17} />
                          </button>

                          <div className="min-w-[60px] border-x border-white/10 px-4 py-2 text-center">

                            <p className="text-lg font-black">
                              {stock}
                            </p>

                            <p className="text-[10px] uppercase tracking-wider text-gray-600">
                              units
                            </p>

                          </div>

                          <button
                            onClick={() =>
                              increaseStock(
                                game
                              )
                            }
                            disabled={
                              savingId ===
                              game._id
                            }
                            className="p-3 text-gray-400 transition hover:bg-lime-400/10 hover:text-lime-400 disabled:cursor-not-allowed disabled:opacity-30"
                            title="Increase stock"
                          >
                            <Plus size={17} />
                          </button>

                        </div>

                        {savingId ===
                          game._id && (
                          <RefreshCw
                            size={17}
                            className="animate-spin text-lime-400"
                          />
                        )}

                      </div>

                    </div>

                  </div>

                );
              })}

            </div>

          )}

        </div>

        {/* ================= INFO ================= */}

        <div className="mt-6 rounded-2xl border border-lime-400/10 bg-lime-400/[0.03] p-5">

          <div className="flex gap-3">

            <AlertTriangle
              size={20}
              className="mt-0.5 shrink-0 text-lime-400"
            />

            <div>

              <h3 className="font-semibold">
                Inventory Control
              </h3>

              <p className="mt-1 text-sm leading-6 text-gray-500">
                Use the + and − buttons to update
                product stock. Changes are saved
                directly to the NEXORA database.
              </p>

              <div className="mt-3 grid gap-2 text-xs text-gray-500 md:grid-cols-2">

                <p>
                  <span className="font-semibold text-lime-400">
                    In Stock:
                  </span>{" "}
                  More than 5 units
                </p>

                <p>
                  <span className="font-semibold text-yellow-400">
                    Low Stock:
                  </span>{" "}
                  1–5 units
                </p>

                <p>
                  <span className="font-semibold text-red-400">
                    Out of Stock:
                  </span>{" "}
                  0 units
                </p>

                <p>
                  <span className="font-semibold text-white">
                    Total Units:
                  </span>{" "}
                  Sum of all available copies
                </p>

              </div>

            </div>

          </div>

        </div>

      </div>
    </div>
  );
}

/* =========================================================
   STAT CARD
========================================================= */

function StatCard({
  title,
  value,
  icon,
  active,
  onClick,
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`group w-full rounded-2xl border p-4 text-left transition-all duration-200 hover:-translate-y-1 ${
        active
          ? "border-lime-400/60 bg-lime-400/[0.10] shadow-[0_0_25px_rgba(163,230,53,0.08)]"
          : "border-white/10 bg-white/[0.03] hover:border-lime-400/30 hover:bg-white/[0.05]"
      }`}
    >

      <div className="mb-3 flex items-center justify-between">

        <div
          className={`flex h-10 w-10 items-center justify-center rounded-xl ${
            active
              ? "bg-lime-400/20 text-lime-300"
              : "bg-lime-400/10 text-lime-400"
          }`}
        >
          {icon}
        </div>

        <span
          className={`text-[10px] font-semibold uppercase tracking-wider ${
            active
              ? "text-lime-400"
              : "text-gray-700"
          }`}
        >
          {active ? "Selected" : "View"}
        </span>

      </div>

      <p className="text-xs text-gray-500">
        {title}
      </p>

      <p className="mt-1 text-2xl font-black">
        {value}
      </p>

      <p className="mt-2 text-[11px] text-gray-600 transition group-hover:text-gray-400">
        Click to view
      </p>

    </button>
  );
}

/* =========================================================
   STOCK STATUS
========================================================= */

function StockStatus({ stock }) {

  if (stock === 0) {
    return (
      <span className="inline-flex items-center justify-center gap-2 rounded-full bg-red-400/10 px-4 py-2 text-xs font-bold text-red-400">
        <XCircle size={14} />
        Out of Stock
      </span>
    );
  }

  if (stock <= 5) {
    return (
      <span className="inline-flex items-center justify-center gap-2 rounded-full bg-yellow-400/10 px-4 py-2 text-xs font-bold text-yellow-400">
        <AlertTriangle size={14} />
        Low Stock
      </span>
    );
  }

  return (
    <span className="inline-flex items-center justify-center gap-2 rounded-full bg-lime-400/10 px-4 py-2 text-xs font-bold text-lime-400">
      <CheckCircle2 size={14} />
      In Stock
    </span>
  );
}