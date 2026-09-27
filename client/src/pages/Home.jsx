import { Link } from "react-router-dom";
import {
  ArrowRight,
  CheckCircle,
  Gamepad2,
  Zap,
} from "lucide-react";
import { useEffect, useState } from "react";
import { api } from "../services/api";
import GameCard from "../components/GameCard";

function getFreshImageUrl(url, updatedAt) {
  if (!url) return "";
  const separator = url.includes("?") ? "&" : "?";
  return `${url}${separator}v=${encodeURIComponent(updatedAt || Date.now())}`;
}

export default function Home() {
  const [games, setGames] = useState([]);
  const [time, setTime] = useState(4 * 3600 + 21 * 60 + 37);

  // Featured game slider
  const [featuredIndex, setFeaturedIndex] = useState(0);
  const [featuredVisible, setFeaturedVisible] = useState(true);

  useEffect(() => {
    api.get("/games", { params: { _t: Date.now() } }).then((r) =>
      setGames(r.data)
    );

    const t = setInterval(() => {
      setTime((x) => (x > 0 ? x - 1 : 0));
    }, 1000);

    return () => clearInterval(t);
  }, []);

  // =========================================================
  // FEATURED GAME AUTO SLIDER
  // Changes every 7 seconds
  // =========================================================

  useEffect(() => {
    if (games.length <= 1) return;

    const slider = setInterval(() => {
      // Fade out
      setFeaturedVisible(false);

      // Change game after fade starts
      setTimeout(() => {
        setFeaturedIndex((current) => (current + 1) % games.length);
        setFeaturedVisible(true);
      }, 350);
    }, 7000);

    return () => clearInterval(slider);
  }, [games]);

  const h = String(Math.floor(time / 3600)).padStart(2, "0");
  const m = String(Math.floor((time % 3600) / 60)).padStart(2, "0");
  const s = String(time % 60).padStart(2, "0");

  const featuredGame = games[featuredIndex] || games[0];

  return (
    <div className="overflow-hidden">
      {/* =====================================================
          ANIMATION STYLES
      ===================================================== */}

      <style>{`
        @keyframes heroText {
          0% {
            opacity: 0;
            transform: translateX(-70px);
          }
          100% {
            opacity: 1;
            transform: translateX(0);
          }
        }

        @keyframes heroImage {
          0% {
            opacity: 0;
            transform: translateX(70px) scale(0.92);
          }
          100% {
            opacity: 1;
            transform: translateX(0) scale(1);
          }
        }

        @keyframes imageFloat {
          0%, 100% {
            transform: translateY(0px) scale(1);
          }
          50% {
            transform: translateY(-8px) scale(1.015);
          }
        }

        @keyframes neonPulse {
          0%, 100% {
            text-shadow:
              0 0 5px rgba(163,255,18,.3),
              0 0 15px rgba(163,255,18,.2);
          }

          50% {
            text-shadow:
              0 0 10px rgba(163,255,18,.8),
              0 0 30px rgba(163,255,18,.5),
              0 0 50px rgba(163,255,18,.25);
          }
        }

        @keyframes glowMove {
          0%, 100% {
            transform: translate(0, 0) scale(1);
            opacity: .45;
          }

          50% {
            transform: translate(30px, -20px) scale(1.15);
            opacity: .7;
          }
        }

        @keyframes cardReveal {
          0% {
            opacity: 0;
            transform: translateY(40px);
          }

          100% {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes buttonReveal {
          0% {
            opacity: 0;
            transform: translateY(20px);
          }

          100% {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes lineReveal {
          0% {
            width: 0;
            opacity: 0;
          }

          100% {
            width: 100%;
            opacity: 1;
          }
        }

        .hero-text {
          animation: heroText 1s cubic-bezier(.16,1,.3,1) forwards;
        }

        .hero-image {
          animation: heroImage 1.2s cubic-bezier(.16,1,.3,1) forwards;
        }

        .floating-image {
          animation: imageFloat 6s ease-in-out infinite;
        }

        .neon-pulse {
          animation: neonPulse 2.5s ease-in-out infinite;
        }

        .glow-orb {
          animation: glowMove 7s ease-in-out infinite;
        }

        .feature-card {
          animation: cardReveal .9s cubic-bezier(.16,1,.3,1) forwards;
        }

        .hero-button {
          animation: buttonReveal .8s cubic-bezier(.16,1,.3,1) forwards;
        }

        .hero-line {
          animation: lineReveal 1.5s ease-out forwards;
        }

        .delay-1 {
          animation-delay: .15s;
          opacity: 0;
        }

        .delay-2 {
          animation-delay: .3s;
          opacity: 0;
        }

        .delay-3 {
          animation-delay: .45s;
          opacity: 0;
        }

        .delay-4 {
          animation-delay: .6s;
          opacity: 0;
        }

        .delay-5 {
          animation-delay: .75s;
          opacity: 0;
        }

        .delay-6 {
          animation-delay: .9s;
          opacity: 0;
        }

        .game-image {
          transition:
            transform .8s cubic-bezier(.16,1,.3,1),
            filter .5s ease;
        }

        .game-image:hover {
          transform: scale(1.06);
          filter: brightness(1.12);
        }

        .featured-transition {
          transition:
            opacity .35s ease,
            transform .35s ease;
        }

        .featured-visible {
          opacity: 1;
          transform: scale(1);
        }

        .featured-hidden {
          opacity: 0;
          transform: scale(1.03);
        }
      `}</style>

      {/* =====================================================
          HERO SECTION
      ===================================================== */}

      <section className="relative min-h-[700px] overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_30%,rgba(139,92,246,.24),transparent_35%),radial-gradient(circle_at_20%_80%,rgba(163,255,18,.12),transparent_30%)]" />

        <div className="glow-orb absolute -left-32 top-40 h-72 w-72 rounded-full bg-lime-400/10 blur-[120px]" />

        <div className="glow-orb absolute right-10 top-20 h-96 w-96 rounded-full bg-purple-500/10 blur-[140px]" />

        <div className="mx-auto grid max-w-7xl items-center gap-10 px-4 py-20 md:grid-cols-2 md:py-28">

          {/* =================================================
              LEFT CONTENT
          ================================================= */}

          <div className="relative z-10 hero-text">
            <p className="delay-1 hero-button mb-4 text-sm font-bold uppercase tracking-[.35em] text-neon">
              The next level starts here
            </p>

            <div className="hero-line mb-6 h-[2px] max-w-[320px] bg-gradient-to-r from-lime-400 to-transparent" />

            <h1 className="font-display text-5xl font-extrabold leading-tight md:text-7xl">
              <span className="delay-2 hero-button block">
                PLAY.
              </span>

              <span className="delay-3 hero-button neon-pulse block text-neon">
                COMPARE.
              </span>

              <span className="delay-4 hero-button block">
                CONQUER.
              </span>
            </h1>

            <p className="delay-5 hero-button mt-6 max-w-xl text-lg leading-relaxed text-zinc-400">
              Discover premium games, compare system requirements, build your
              wishlist and manage every purchase from one futuristic gaming
              platform.
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                to="/store"
                className="delay-6 hero-button group btn btn-primary"
              >
                <span className="relative z-10 flex items-center gap-2">
                  Explore Games
                  <ArrowRight
                    size={18}
                    className="transition-transform duration-300 group-hover:translate-x-1"
                  />
                </span>
              </Link>

              <Link
                to="/compatibility"
                className="delay-6 hero-button group btn btn-ghost"
              >
                <span className="flex items-center gap-2">
                  Check My PC
                  <ArrowRight
                    size={17}
                    className="transition-transform duration-300 group-hover:translate-x-1"
                  />
                </span>
              </Link>
            </div>

            <div className="delay-6 hero-button mt-8 flex flex-wrap gap-5 text-xs text-zinc-500">
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 animate-pulse rounded-full bg-lime-400" />
                LIVE STORE
              </div>

              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-lime-400" />
                100% SECURE
              </div>

              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-purple-400" />
                GAMING HUB
              </div>
            </div>
          </div>

          {/* =================================================
              RIGHT FEATURED GAME SLIDER
          ================================================= */}

          <div className="relative z-10 hero-image">
            <div className="relative">

              <div className="absolute -inset-5 rounded-[35px] bg-lime-400/10 blur-2xl" />

              <div className="glow floating-image relative overflow-hidden rounded-3xl border border-white/10 bg-white/5 p-2">

                {/* FEATURED IMAGE */}

                <div
                  className={`featured-transition ${
                    featuredVisible
                      ? "featured-visible"
                      : "featured-hidden"
                  }`}
                >
                  <div className="relative overflow-hidden rounded-2xl">

                    <img
                      src={getFreshImageUrl(
                        featuredGame?.image || featuredGame?.banner,
                        featuredGame?.updatedAt
                      )}
                      alt={
                        featuredGame?.title ||
                        "Featured Game"
                      }
                      className="game-image h-[360px] w-full object-cover opacity-90 md:h-[470px]"
                    />

                    <div className="absolute inset-0 bg-gradient-to-t from-black via-black/10 to-transparent" />

                    <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 to-transparent" />

                  </div>

                  {/* FEATURED GAME INFO */}

                  <div className="absolute inset-x-8 bottom-8 rounded-2xl border border-white/10 bg-black/75 p-5 backdrop-blur-xl transition duration-500 hover:border-lime-400/30">

                    <div className="flex items-center justify-between">

                      <p className="text-xs uppercase tracking-widest text-neon">
                        Featured Game
                      </p>

                      <span className="flex items-center gap-2 text-xs text-lime-400">
                        <span className="h-2 w-2 animate-pulse rounded-full bg-lime-400" />
                        LIVE
                      </span>

                    </div>

                    <h2 className="mt-2 text-2xl font-bold">
                      {featuredGame?.title ||
                        "NEXORA Universe"}
                    </h2>

                    <div className="mt-3 h-[2px] overflow-hidden rounded-full bg-white/10">
                      <div className="h-full w-2/3 bg-lime-400 shadow-[0_0_12px_rgba(163,255,18,.8)]" />
                    </div>

                  </div>
                </div>

                {/* SLIDER INDICATORS */}

                {games.length > 1 && (
                  <div className="absolute bottom-4 right-4 z-20 flex gap-1.5">
                    {games.slice(0, 8).map((game, index) => (
                      <button
                        key={game._id}
                        type="button"
                        onClick={() => {
                          setFeaturedVisible(false);

                          setTimeout(() => {
                            setFeaturedIndex(index);
                            setFeaturedVisible(true);
                          }, 350);
                        }}
                        className={`h-1.5 rounded-full transition-all duration-300 ${
                          index === featuredIndex
                            ? "w-6 bg-lime-400 shadow-[0_0_8px_rgba(163,255,18,.8)]"
                            : "w-1.5 bg-white/30 hover:bg-white/60"
                        }`}
                        aria-label={`Show ${
                          game.title
                        }`}
                      />
                    ))}
                  </div>
                )}

              </div>
            </div>
          </div>
        </div>

        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-black to-transparent" />
      </section>

      {/* =====================================================
          FLASH SALE
      ===================================================== */}

      <section className="mx-auto max-w-7xl px-4 py-8">
        <div className="glass flex flex-col gap-5 rounded-2xl p-5 transition duration-300 hover:border-lime-400/30 md:flex-row md:items-center md:justify-between">
          <div>
            <div className="flex items-center gap-2 text-neon">
              <Zap size={18} />
              FLASH SALE
            </div>

            <h2 className="mt-1 text-2xl font-bold">
              Up to 70% off selected titles
            </h2>
          </div>

          <div className="font-display text-3xl tracking-widest text-neon">
            {h}:{m}:{s}
          </div>

          <Link
            to="/store"
            className="btn btn-primary group"
          >
            Shop Sale
            <ArrowRight
              size={17}
              className="transition-transform group-hover:translate-x-1"
            />
          </Link>
        </div>
      </section>

      {/* =====================================================
          FEATURED GAMES
      ===================================================== */}

      <section className="mx-auto max-w-7xl px-4 py-16">
        <div className="mb-8 flex items-end justify-between">
          <div>
            <p className="text-sm uppercase tracking-widest text-neon">
              Curated for you
            </p>

            <h2 className="font-display text-3xl font-bold">
              Featured Games
            </h2>
          </div>

          <Link
            to="/store"
            className="group flex items-center gap-1 text-sm text-zinc-400 transition hover:text-white"
          >
            View all
            <ArrowRight
              size={15}
              className="transition-transform group-hover:translate-x-1"
            />
          </Link>
        </div>

        <div className="grid grid-auto gap-5">
          {games.slice(0, 4).map((g) => (
            <GameCard key={g._id} game={g} />
          ))}
        </div>
      </section>

      {/* =====================================================
          FEATURE CARDS
      ===================================================== */}

      <section className="border-y border-white/5 bg-white/[.02]">
        <div className="mx-auto grid max-w-7xl gap-5 px-4 py-14 md:grid-cols-3">

          <Feature
            to="/dashboard"
            icon={<Gamepad2 />}
            title="Smart Gaming Dashboard"
            text="Track purchases, wishlist, orders and recently played games."
          />

          <Feature
            to="/compatibility"
            icon={<CheckCircle />}
            title="PC Compatibility"
            text="Check CPU, GPU, RAM and storage requirements before buying."
          />

          <Feature
            to="/store"
            icon={<Zap />}
            title="Live Store Experience"
            text="Search instantly, watch flash sales and manage stock in real time."
          />

        </div>
      </section>
    </div>
  );
}

/* =========================================================
   FEATURE CARD
========================================================= */

function Feature({ to, icon, title, text }) {
  return (
    <Link
      to={to}
      className="feature-card group block rounded-2xl focus:outline-none focus:ring-2 focus:ring-neon/70"
    >
      <div className="glass h-full rounded-2xl p-6 transition duration-300 group-hover:-translate-y-2 group-hover:border-neon/40 group-hover:bg-white/[.05]">

        <div className="mb-4 inline-flex rounded-xl bg-neon/10 p-3 text-neon transition duration-300 group-hover:scale-110 group-hover:rotate-3 group-hover:bg-neon/15">
          {icon}
        </div>

        <div className="flex items-start justify-between gap-4">
          <h3 className="text-lg font-bold transition group-hover:text-neon">
            {title}
          </h3>

          <ArrowRight
            size={20}
            className="mt-1 shrink-0 text-zinc-600 transition duration-300 group-hover:translate-x-2 group-hover:text-neon"
          />
        </div>

        <p className="mt-2 text-sm text-zinc-500">
          {text}
        </p>

        <p className="mt-5 text-xs font-semibold uppercase tracking-wider text-zinc-600 transition group-hover:text-neon">
          Explore →
        </p>
      </div>
    </Link>
  );
}