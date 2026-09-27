import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  Gamepad2,
  Heart,
  Package,
  Trophy,
  Clock,
  ShoppingBag,
  ExternalLink,
  User,
  Mail,
} from "lucide-react";

import { api } from "../services/api";

export default function Dashboard() {
  const [user, setUser] = useState(null);
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    Promise.all([
      api.get("/auth/me"),
      api.get("/orders/mine"),
    ])
      .then(([u, o]) => {
        setUser(u.data.user);
        setOrders(Array.isArray(o.data) ? o.data : []);
      })
      .catch((error) => {
        console.error("Dashboard loading error:", error);
      });
  }, []);

  /*
   * =========================================================
   * BUILD PURCHASED GAME LIBRARY
   * =========================================================
   */

  const purchasedGames = useMemo(() => {
    const games = [];
    const seen = new Set();

    orders.forEach((order) => {
      const items = Array.isArray(order?.items)
        ? order.items
        : [];

      items.forEach((item) => {
        const gameId =
          item?.game ||
          item?._id ||
          item?.id;

        const title = item?.title || "Unknown Game";

        const uniqueKey = String(gameId || title);

        if (seen.has(uniqueKey)) {
          return;
        }

        seen.add(uniqueKey);

        games.push({
          id: gameId,
          title,
          image: item?.image || "",
          price: Number(item?.price || 0),
          qty: Number(item?.qty || 1),
        });
      });
    });

    return games;
  }, [orders]);

  /*
   * =========================================================
   * LOADING
   * =========================================================
   */

  if (!user) {
    return (
      <div className="p-20 text-center">
        Loading...
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-12">

      {/* =====================================================
          HEADER
      ===================================================== */}

      <p className="text-sm uppercase tracking-widest text-neon">
        PLAYER CONTROL CENTER
      </p>

      <h1 className="font-display text-4xl font-bold">
        Welcome, {user.name}
      </h1>

      {/* =====================================================
          STAT CARDS
      ===================================================== */}

      <div className="mt-8 grid grid-cols-2 gap-4 md:grid-cols-4">

        {/* PROFILE */}

        <Link
          to="/profile"
          className="group block"
        >
          <div className="glass relative h-full overflow-hidden rounded-2xl p-5 transition-all duration-300 group-hover:-translate-y-1 group-hover:border-neon/40 group-hover:bg-white/[0.04]">

            <div className="pointer-events-none absolute -right-10 -top-10 h-24 w-24 rounded-full bg-neon/10 opacity-0 blur-2xl transition duration-300 group-hover:opacity-100" />

            <div className="relative flex items-center justify-between">

              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-neon/10 text-neon transition duration-300 group-hover:scale-110">
                <User size={20} />
              </div>

              <ArrowRight
                size={17}
                className="text-zinc-700 transition-all duration-300 group-hover:translate-x-1 group-hover:text-neon"
              />

            </div>

            <p className="relative mt-4 text-xs uppercase tracking-wider text-zinc-500 transition group-hover:text-zinc-300">
              Profile
            </p>

            <p className="relative mt-2 truncate text-xl font-bold transition group-hover:text-neon">
              {user.name}
            </p>

            <div className="relative mt-2 flex items-center gap-1.5 text-[11px] text-zinc-600 transition group-hover:text-zinc-400">
              <Mail size={12} />
              <span className="truncate">
                {user.email}
              </span>
            </div>

            <p className="relative mt-2 text-[10px] uppercase tracking-wider text-zinc-700 opacity-0 transition group-hover:text-neon group-hover:opacity-100">
              Open Profile →
            </p>

          </div>
        </Link>

        {/* WISHLIST */}

        <Stat
          to="/wishlist"
          icon={<Heart size={20} />}
          label="Wishlist"
          value={user.wishlist?.length || 0}
        />

        {/* ORDERS */}

        <Stat
          to="/orders"
          icon={<Package size={20} />}
          label="Orders"
          value={orders.length}
        />

        {/* PLAY TIME */}

        <Stat
          to="/achievements"
          icon={<Clock size={20} />}
          label="Play Time"
          value={`${user.stats?.hoursPlayed || 0}h`}
        />

      </div>

      {/* =====================================================
          MY GAME LIBRARY
      ===================================================== */}

      <section className="mt-8">

        <div className="glass overflow-hidden rounded-2xl">

          {/* HEADER */}

          <div className="flex flex-col gap-4 border-b border-white/10 p-6 sm:flex-row sm:items-center sm:justify-between">

            <div className="flex items-center gap-3">

              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-neon/10 text-neon">
                <ShoppingBag size={22} />
              </div>

              <div>

                <h2 className="text-xl font-bold">
                  My Game Library
                </h2>

                <p className="mt-1 text-sm text-zinc-500">
                  Games you have purchased from NEXORA
                </p>

              </div>

            </div>

            <Link
              to="/store"
              className="group inline-flex items-center gap-2 text-sm text-zinc-400 transition hover:text-neon"
            >
              Browse Store

              <ArrowRight
                size={16}
                className="transition-transform group-hover:translate-x-1"
              />
            </Link>

          </div>

          {/* =================================================
              EMPTY LIBRARY
          ================================================= */}

          {purchasedGames.length === 0 ? (

            <div className="p-10 text-center">

              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-white/5 text-zinc-600">
                <Gamepad2 size={30} />
              </div>

              <h3 className="mt-5 text-lg font-semibold">
                Your library is empty
              </h3>

              <p className="mx-auto mt-2 max-w-md text-sm text-zinc-500">
                You haven't purchased any games yet. Explore the
                NEXORA store and build your gaming library.
              </p>

              <Link
                to="/store"
                className="group mt-6 inline-flex items-center gap-2 rounded-lg border border-neon/20 bg-neon/10 px-5 py-3 text-sm font-semibold text-neon transition-all duration-200 hover:border-neon/50 hover:bg-neon hover:text-black"
              >
                <ShoppingBag size={17} />

                Browse Games

                <ArrowRight
                  size={16}
                  className="transition-transform duration-200 group-hover:translate-x-1"
                />
              </Link>

            </div>

          ) : (

            /* =================================================
               PURCHASED GAME CARDS
            ================================================= */

            <div className="grid gap-4 p-6 sm:grid-cols-2 lg:grid-cols-3">

              {purchasedGames.map((game, index) => {

                const hasGameId = Boolean(game.id);

                return (
                  <div
                    key={`${game.id || game.title}-${index}`}
                    className="group overflow-hidden rounded-xl border border-white/10 bg-white/[0.025] transition-all duration-300 hover:-translate-y-1 hover:border-neon/40 hover:bg-white/[0.05]"
                  >

                    {/* GAME IMAGE */}

                    {hasGameId ? (
                      <Link
                        to={`/game/${game.id}`}
                        className="block"
                      >

                        <div className="relative h-44 overflow-hidden bg-zinc-900">

                          {game.image ? (
                            <img
                              src={game.image}
                              alt={game.title}
                              className="h-full w-full object-cover transition duration-500 group-hover:scale-110"
                            />
                          ) : (
                            <div className="flex h-full items-center justify-center text-zinc-700">
                              <Gamepad2 size={45} />
                            </div>
                          )}

                          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent" />

                          <span className="absolute bottom-3 left-3 rounded-full border border-neon/20 bg-black/70 px-3 py-1 text-xs font-semibold text-neon backdrop-blur-md">
                            OWNED
                          </span>

                          <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 backdrop-blur-[2px] transition duration-300 group-hover:opacity-100">

                            <span className="flex items-center gap-2 rounded-lg border border-neon/30 bg-black/80 px-4 py-2 text-sm font-semibold text-neon">
                              View Details
                              <ExternalLink size={15} />
                            </span>

                          </div>

                        </div>

                      </Link>
                    ) : (
                      <div className="relative h-44 overflow-hidden bg-zinc-900">

                        {game.image ? (
                          <img
                            src={game.image}
                            alt={game.title}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <div className="flex h-full items-center justify-center text-zinc-700">
                            <Gamepad2 size={45} />
                          </div>
                        )}

                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent" />

                        <span className="absolute bottom-3 left-3 rounded-full border border-neon/20 bg-black/70 px-3 py-1 text-xs font-semibold text-neon">
                          OWNED
                        </span>

                      </div>
                    )}

                    {/* GAME INFORMATION */}

                    <div className="p-4">

                      {hasGameId ? (
                        <Link
                          to={`/game/${game.id}`}
                          className="block"
                        >

                          <div className="flex items-start justify-between gap-3">

                            <h3 className="truncate font-bold transition group-hover:text-neon">
                              {game.title}
                            </h3>

                            <Gamepad2
                              size={18}
                              className="shrink-0 text-neon"
                            />

                          </div>

                        </Link>
                      ) : (
                        <div className="flex items-start justify-between gap-3">

                          <h3 className="truncate font-bold">
                            {game.title}
                          </h3>

                          <Gamepad2
                            size={18}
                            className="shrink-0 text-neon"
                          />

                        </div>
                      )}

                      <div className="mt-4 grid grid-cols-2 gap-4">

                        <div>

                          <p className="text-[11px] uppercase tracking-wider text-zinc-600">
                            Quantity
                          </p>

                          <p className="mt-2 text-sm font-medium">
                            {game.qty}
                          </p>

                        </div>

                        <div className="text-right">

                          <p className="text-[11px] uppercase tracking-wider text-zinc-600">
                            Purchased
                          </p>

                          <p className="mt-2 text-lg font-bold text-neon">
                            ₹
                            {game.price.toLocaleString("en-IN")}
                          </p>

                        </div>

                      </div>

                      {hasGameId ? (
                        <Link
                          to={`/game/${game.id}`}
                          className="group/button mt-4 flex w-full items-center justify-center gap-2 rounded-lg border border-neon/20 bg-neon/10 px-4 py-2.5 text-sm font-semibold text-neon transition-all duration-200 hover:border-neon/50 hover:bg-neon hover:text-black"
                        >
                          View Game Details

                          <ArrowRight
                            size={15}
                            className="transition-transform group-hover/button:translate-x-1"
                          />
                        </Link>
                      ) : (
                        <div className="mt-4 flex w-full items-center justify-center rounded-lg border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-zinc-500">
                          Purchased Game
                        </div>
                      )}

                    </div>

                  </div>
                );
              })}

            </div>

          )}

        </div>

      </section>

      {/* =====================================================
          LOWER DASHBOARD
      ===================================================== */}

      <div className="mt-8 grid gap-6 md:grid-cols-2">

        {/* RECENTLY PLAYED */}

        <div className="glass rounded-2xl p-6 transition duration-300 hover:border-neon/30">

          <div className="flex items-center gap-3">

            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-neon/10 text-neon">
              <Gamepad2 size={20} />
            </div>

            <h2 className="font-bold">
              Recently Played
            </h2>

          </div>

          <p className="mt-4 text-sm text-zinc-500">
            Your latest game activity will appear here when you
            open game pages.
          </p>

          <Link
            to="/store"
            className="group mt-6 inline-flex items-center gap-2 rounded-lg border border-neon/20 bg-neon/10 px-4 py-2.5 text-sm font-semibold text-neon transition-all duration-200 hover:border-neon/50 hover:bg-neon hover:text-black"
          >
            Explore Games

            <ArrowRight
              size={16}
              className="transition-transform duration-200 group-hover:translate-x-1"
            />
          </Link>

        </div>

        {/* ACHIEVEMENTS */}

        <div className="glass rounded-2xl p-6 transition duration-300 hover:border-neon/30">

          <div className="flex items-center gap-3">

            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-neon/10 text-neon">
              <Trophy size={20} />
            </div>

            <h2 className="font-bold">
              Achievements
            </h2>

          </div>

          <div className="mt-4 flex flex-wrap gap-2">

            {(user.achievements || []).map((a) => (
              <span
                key={a}
                className="rounded-full bg-neon/10 px-3 py-2 text-xs text-neon"
              >
                🏆 {a}
              </span>
            ))}

            {(user.achievements || []).length === 0 && (
              <p className="text-sm text-zinc-500">
                No achievements unlocked yet.
              </p>
            )}

          </div>

          <Link
            to="/achievements"
            className="group mt-6 inline-flex items-center gap-2 rounded-lg border border-neon/20 bg-neon/10 px-4 py-2.5 text-sm font-semibold text-neon transition-all duration-200 hover:border-neon/50 hover:bg-neon hover:text-black"
          >
            View Achievements

            <ArrowRight
              size={16}
              className="transition-transform duration-200 group-hover:translate-x-1"
            />
          </Link>

        </div>

      </div>

    </div>
  );
}

/* =========================================================
   CLICKABLE STAT CARD
========================================================= */

function Stat({
  to,
  icon,
  label,
  value,
}) {
  return (
    <Link
      to={to}
      className="group block"
    >
      <div className="glass relative h-full overflow-hidden rounded-2xl p-5 transition-all duration-300 group-hover:-translate-y-1 group-hover:border-neon/40 group-hover:bg-white/[0.04]">

        <div className="pointer-events-none absolute -right-10 -top-10 h-24 w-24 rounded-full bg-neon/10 opacity-0 blur-2xl transition duration-300 group-hover:opacity-100" />

        <div className="relative flex items-center justify-between">

          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-neon/10 text-neon transition duration-300 group-hover:scale-110">
            {icon}
          </div>

          <ArrowRight
            size={17}
            className="text-zinc-700 transition-all duration-300 group-hover:translate-x-1 group-hover:text-neon"
          />

        </div>

        <p className="relative mt-4 text-xs uppercase tracking-wider text-zinc-500 transition group-hover:text-zinc-300">
          {label}
        </p>

        <p className="relative mt-2 text-3xl font-bold transition group-hover:text-neon">
          {value}
        </p>

        <p className="relative mt-2 text-[10px] uppercase tracking-wider text-zinc-700 opacity-0 transition group-hover:text-neon group-hover:opacity-100">
          Open →
        </p>

      </div>
    </Link>
  );
}