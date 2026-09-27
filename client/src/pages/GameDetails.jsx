import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import {
  ArrowLeft,
  Heart,
  ShoppingCart,
  Star,
  Package,
  Cpu,
  Monitor,
  MemoryStick,
  HardDrive,
  CheckCircle2,
  AlertTriangle,
} from "lucide-react";

import { api } from "../services/api";

export default function GameDetails() {
  const { id } = useParams();

  const [game, setGame] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [liked, setLiked] = useState(false);
  const [adding, setAdding] = useState(false);

  useEffect(() => {
    let mounted = true;

    async function loadGame() {
      try {
        setLoading(true);
        setError("");

        const response = await api.get(`/games/${id}`);

        if (mounted) {
          setGame(response.data);
        }
      } catch (err) {
        console.error("Failed to load game:", err);

        if (mounted) {
          setError(
            err?.response?.data?.message ||
              "Unable to load this game.",
          );
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    }

    if (id) {
      loadGame();
    }

    return () => {
      mounted = false;
    };
  }, [id]);

  /* =========================================================
     LOADING
  ========================================================= */

  if (loading) {
    return (
      <div className="flex min-h-[70vh] items-center justify-center">
        <div className="text-center">
          <div className="mx-auto h-10 w-10 animate-spin rounded-full border-2 border-white/10 border-t-lime-400" />

          <p className="mt-4 text-sm text-zinc-500">
            Loading game...
          </p>
        </div>
      </div>
    );
  }

  /* =========================================================
     ERROR
  ========================================================= */

  if (error || !game) {
    return (
      <div className="mx-auto flex min-h-[70vh] max-w-4xl items-center justify-center px-4">
        <div className="glass w-full rounded-3xl p-10 text-center">
          <Package
            size={48}
            className="mx-auto text-zinc-600"
          />

          <h1 className="mt-5 text-2xl font-bold">
            Game Not Found
          </h1>

          <p className="mt-2 text-sm text-zinc-500">
            {error || "This game is no longer available."}
          </p>

          <Link
            to="/store"
            className="btn btn-primary mt-7 inline-flex items-center gap-2"
          >
            <ArrowLeft size={17} />
            Back to Store
          </Link>
        </div>
      </div>
    );
  }

  /* =========================================================
     NORMALIZE GAME DATA
  ========================================================= */

  const title = game.title || "Untitled Game";

  const description =
    game.description ||
    "Experience an exciting gaming adventure with NEXORA.";

  const genre = game.genre || "Gaming";

  const rating = Number(game.rating || 0);

  const price = Number(game.price || 0);

  const stock = Number(game.stock ?? 0);

  const outOfStock = stock <= 0;

  const lowStock = stock > 0 && stock <= 5;

  /* =========================================================
     IMAGE
  ========================================================= */

  const image =
    game.image ||
    game.cover ||
    game.thumbnail ||
    "https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=1200&q=80";

  const banner =
    game.banner ||
    game.background ||
    game.image ||
    image;

  /* =========================================================
     PLATFORMS
  ========================================================= */

  let platforms = [];

  if (Array.isArray(game.platform)) {
    platforms = game.platform;
  } else if (Array.isArray(game.platforms)) {
    platforms = game.platforms;
  } else if (typeof game.platform === "string") {
    platforms = game.platform
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean);
  } else if (typeof game.platforms === "string") {
    platforms = game.platforms
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean);
  }

  if (platforms.length === 0) {
    platforms = ["PC"];
  }

  /* =========================================================
     REQUIREMENTS
  ========================================================= */

  const minimum =
    game.minimum ||
    game.minRequirements ||
    game.requirements?.minimum ||
    {
      cpu:
        game.cpu ||
        game.requirements?.cpu ||
        "Not specified",

      gpu:
        game.gpu ||
        game.requirements?.gpu ||
        "Not specified",

      ram:
        game.ram ||
        game.requirements?.ram ||
        "Not specified",

      storage:
        game.storage ||
        game.requirements?.storage ||
        "Not specified",
    };

  const recommended =
    game.recommended ||
    game.recommendedRequirements ||
    game.requirements?.recommended ||
    {
      cpu:
        game.recommendedCpu ||
        game.requirements?.recommendedCpu ||
        minimum.cpu ||
        "Not specified",

      gpu:
        game.recommendedGpu ||
        game.requirements?.recommendedGpu ||
        minimum.gpu ||
        "Not specified",

      ram:
        game.recommendedRam ||
        game.requirements?.recommendedRam ||
        minimum.ram ||
        "Not specified",

      storage:
        game.recommendedStorage ||
        game.requirements?.recommendedStorage ||
        minimum.storage ||
        "Not specified",
    };

  /* =========================================================
     ADD TO CART
  ========================================================= */

  const addToCart = () => {
    if (outOfStock || adding) {
      return;
    }

    try {
      setAdding(true);

      const cart = JSON.parse(
        localStorage.getItem("nexora_cart") || "[]",
      );

      const found = cart.find(
        (item) => item.game === game._id,
      );

      if (found) {
        if (found.qty >= stock) {
          alert(`Only ${stock} copy/copies available.`);
          setAdding(false);
          return;
        }

        found.qty += 1;
      } else {
        cart.push({
          game: game._id,
          title: title,
          price: price,
          qty: 1,
          image: image,
        });
      }

      localStorage.setItem(
        "nexora_cart",
        JSON.stringify(cart),
      );

      alert("Added to cart");
    } catch (err) {
      console.error("Cart error:", err);
      alert("Unable to add this game to cart.");
    } finally {
      setAdding(false);
    }
  };

  /* =========================================================
     WISHLIST
  ========================================================= */

  const toggleWishlist = async () => {
    const token = localStorage.getItem("nexora_token");

    if (!token) {
      alert("Please login to use wishlist.");
      return;
    }

    try {
      await api.post(`/games/${game._id}/wishlist`);

      setLiked((current) => !current);
    } catch (err) {
      console.error("Wishlist error:", err);
      alert(
        err?.response?.data?.message ||
          "Unable to update wishlist.",
      );
    }
  };

  /* =========================================================
     CURRENCY
  ========================================================= */

  const formatCurrency = (value) => {
    return `₹${Number(value || 0).toLocaleString("en-IN")}`;
  };

  /* =========================================================
     PAGE
  ========================================================= */

  return (
    <div className="min-h-screen">
      {/* =====================================================
          HERO
      ===================================================== */}

      <section className="relative overflow-hidden border-b border-white/5">
        {/* Background */}
        <div
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage: `url(${banner})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        />

        <div className="absolute inset-0 bg-black/80" />

        <div className="absolute inset-0 bg-gradient-to-r from-black via-black/80 to-transparent" />

        <div className="relative mx-auto max-w-7xl px-4 py-10">
          {/* Back */}
          <Link
            to="/store"
            className="mb-8 inline-flex items-center gap-2 text-sm text-zinc-500 transition hover:text-white"
          >
            <ArrowLeft size={16} />
            Back to Store
          </Link>

          <div className="grid gap-10 md:grid-cols-[1.1fr_.9fr] md:items-center">
            {/* Game Image */}

            <div className="relative">
              <div className="absolute -inset-2 rounded-3xl bg-lime-400/10 blur-2xl" />

              <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-black/40">
                <img
                  src={image}
                  alt={title}
                  className={`h-[420px] w-full object-cover transition duration-700 hover:scale-[1.02] ${
                    outOfStock
                      ? "grayscale opacity-70"
                      : ""
                  }`}
                  onError={(event) => {
                    event.currentTarget.src =
                      "https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=1200&q=80";
                  }}
                />

                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

                {outOfStock && (
                  <div className="absolute left-5 top-5 rounded-full border border-red-400/30 bg-red-500/20 px-4 py-2 text-xs font-bold text-red-300 backdrop-blur-md">
                    OUT OF STOCK
                  </div>
                )}

                {lowStock && (
                  <div className="absolute left-5 top-5 rounded-full border border-yellow-400/30 bg-yellow-500/20 px-4 py-2 text-xs font-bold text-yellow-300 backdrop-blur-md">
                    ONLY {stock} LEFT
                  </div>
                )}
              </div>
            </div>

            {/* Game Information */}

            <div>
              {/* Genre + Rating */}

              <div className="flex flex-wrap items-center gap-3 text-sm">
                <span className="font-semibold text-lime-400">
                  {genre}
                </span>

                <span className="text-zinc-700">
                  •
                </span>

                <span className="flex items-center gap-1 text-yellow-400">
                  <Star
                    size={14}
                    className="fill-yellow-400"
                  />

                  {rating.toFixed(1)}
                </span>
              </div>

              {/* Title */}

              <h1 className="mt-3 font-display text-4xl font-bold leading-tight sm:text-5xl lg:text-6xl">
                {title}
              </h1>

              {/* Description */}

              <p className="mt-5 max-w-2xl text-base leading-7 text-zinc-400">
                {description}
              </p>

              {/* Price + Actions */}

              <div className="mt-8 flex flex-wrap items-center gap-4">
                <span className="text-3xl font-bold">
                  {price === 0
                    ? "FREE"
                    : formatCurrency(price)}
                </span>

                <button
                  onClick={addToCart}
                  disabled={outOfStock || adding}
                  className={`btn btn-primary inline-flex items-center gap-2 ${
                    outOfStock
                      ? "cursor-not-allowed opacity-50"
                      : ""
                  }`}
                >
                  <ShoppingCart size={18} />

                  {outOfStock
                    ? "Out of Stock"
                    : adding
                      ? "Adding..."
                      : "Add to Cart"}
                </button>

                <button
                  onClick={toggleWishlist}
                  className={`btn btn-ghost inline-flex items-center gap-2 ${
                    liked
                      ? "border border-lime-400/30 text-lime-400"
                      : ""
                  }`}
                  title="Wishlist"
                >
                  <Heart
                    size={18}
                    className={
                      liked
                        ? "fill-lime-400 text-lime-400"
                        : ""
                    }
                  />
                </button>
              </div>

              {/* Stock */}

              <div className="mt-5 flex items-center gap-2 text-sm">
                {outOfStock ? (
                  <>
                    <AlertTriangle
                      size={16}
                      className="text-red-400"
                    />

                    <span className="text-red-400">
                      Currently unavailable
                    </span>
                  </>
                ) : lowStock ? (
                  <>
                    <AlertTriangle
                      size={16}
                      className="text-yellow-400"
                    />

                    <span className="text-yellow-400">
                      Only {stock} copies remaining
                    </span>
                  </>
                ) : (
                  <>
                    <CheckCircle2
                      size={16}
                      className="text-lime-400"
                    />

                    <span className="text-lime-400">
                      In stock
                    </span>
                  </>
                )}
              </div>

              {/* Platforms */}

              <div className="mt-7">
                <p className="mb-3 text-xs uppercase tracking-widest text-zinc-600">
                  Available On
                </p>

                <div className="flex flex-wrap gap-2">
                  {platforms.map((platform, index) => (
                    <span
                      key={`${platform}-${index}`}
                      className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs text-zinc-400"
                    >
                      {platform}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =====================================================
          GAME INFORMATION
      ===================================================== */}

      <section className="mx-auto max-w-7xl px-4 py-14">
        <div className="grid gap-6 md:grid-cols-3">
          <InfoCard
            label="Genre"
            value={genre}
          />

          <InfoCard
            label="Rating"
            value={`${rating.toFixed(1)} / 5`}
          />

          <InfoCard
            label="Availability"
            value={
              outOfStock
                ? "Out of Stock"
                : `${stock} in stock`
            }
          />
        </div>
      </section>

      {/* =====================================================
          SYSTEM REQUIREMENTS
      ===================================================== */}

      <section className="mx-auto max-w-7xl px-4 pb-16">
        <div className="mb-8">
          <p className="text-xs uppercase tracking-[0.25em] text-lime-400">
            PC Compatibility
          </p>

          <h2 className="mt-2 font-display text-3xl font-bold">
            System Requirements
          </h2>

          <p className="mt-2 text-sm text-zinc-500">
            Check the hardware requirements before
            installing the game.
          </p>
        </div>

        <div className="grid gap-5 md:grid-cols-2">
          <RequirementCard
            title="Minimum"
            subtitle="Required to run the game"
            requirement={minimum}
          />

          <RequirementCard
            title="Recommended"
            subtitle="For the best gaming experience"
            requirement={recommended}
          />
        </div>

        <Link
          to="/compatibility"
          className="mt-8 inline-flex items-center gap-2 text-sm font-semibold text-lime-400 transition hover:text-lime-300"
        >
          Check this game against my PC
          <span>→</span>
        </Link>
      </section>
    </div>
  );
}

/* =========================================================
   INFORMATION CARD
========================================================= */

function InfoCard({ label, value }) {
  return (
    <div className="glass rounded-2xl border border-white/5 p-5">
      <p className="text-xs uppercase tracking-widest text-zinc-600">
        {label}
      </p>

      <p className="mt-2 text-lg font-bold">
        {value}
      </p>
    </div>
  );
}

/* =========================================================
   REQUIREMENT CARD
========================================================= */

function RequirementCard({
  title,
  subtitle,
  requirement,
}) {
  const r = requirement || {};

  return (
    <div className="glass rounded-2xl border border-white/5 p-6 transition duration-300 hover:border-lime-400/20">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h3 className="text-xl font-bold">
            {title}
          </h3>

          <p className="mt-1 text-xs text-zinc-600">
            {subtitle}
          </p>
        </div>

        <div className="rounded-xl bg-lime-400/10 p-3">
          <Monitor
            size={20}
            className="text-lime-400"
          />
        </div>
      </div>

      <div className="mt-6 space-y-4">
        <RequirementRow
          icon={<Cpu size={17} />}
          label="CPU"
          value={r.cpu}
        />

        <RequirementRow
          icon={<Monitor size={17} />}
          label="GPU"
          value={r.gpu}
        />

        <RequirementRow
          icon={<MemoryStick size={17} />}
          label="RAM"
          value={formatRequirement(r.ram, "GB")}
        />

        <RequirementRow
          icon={<HardDrive size={17} />}
          label="Storage"
          value={formatRequirement(
            r.storage,
            "GB",
          )}
        />
      </div>
    </div>
  );
}

/* =========================================================
   REQUIREMENT ROW
========================================================= */

function RequirementRow({
  icon,
  label,
  value,
}) {
  return (
    <div className="flex items-center gap-4 rounded-xl border border-white/5 bg-white/[0.02] p-4">
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white/5 text-zinc-500">
        {icon}
      </div>

      <div className="min-w-0 flex-1">
        <p className="text-xs uppercase tracking-wider text-zinc-600">
          {label}
        </p>

        <p className="mt-1 break-words text-sm font-medium text-zinc-200">
          {value || "Not specified"}
        </p>
      </div>
    </div>
  );
}

/* =========================================================
   REQUIREMENT FORMATTER
========================================================= */

function formatRequirement(value, suffix) {
  if (
    value === undefined ||
    value === null ||
    value === ""
  ) {
    return "Not specified";
  }

  const text = String(value);

  if (
    text.toLowerCase().includes(
      suffix.toLowerCase(),
    )
  ) {
    return text;
  }

  return `${text} ${suffix}`;
}