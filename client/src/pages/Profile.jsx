import { Link } from "react-router-dom";
import {
  ArrowRight,
  Award,
  Clock,
  Gamepad2,
  Heart,
  Mail,
  Package,
  Shield,
  User,
  Zap,
} from "lucide-react";

import { useAuth } from "../context/AuthContext";

export default function Profile() {
  const { user } = useAuth();

  const gamesPurchased = user?.purchasedGames?.length || 0;
  const wishlist = user?.wishlist?.length || 0;
  const hoursPlayed = user?.stats?.hoursPlayed || 0;

  return (
    <div className="relative min-h-screen overflow-hidden">

      {/* =====================================================
          ANIMATION STYLES
      ===================================================== */}

      <style>{`
        @keyframes profileFloat {
          0%, 100% {
            transform: translateY(0px);
          }

          50% {
            transform: translateY(-12px);
          }
        }

        @keyframes characterFloat {
          0%, 100% {
            transform: translateY(0px) rotate(0deg);
          }

          50% {
            transform: translateY(-14px) rotate(1deg);
          }
        }

        @keyframes neonPulse {
          0%, 100% {
            opacity: .45;
            transform: scale(1);
          }

          50% {
            opacity: .8;
            transform: scale(1.12);
          }
        }

        @keyframes scan {
          0% {
            transform: translateY(-100%);
          }

          100% {
            transform: translateY(500%);
          }
        }

        @keyframes particle {
          0%, 100% {
            opacity: .2;
            transform: translateY(0);
          }

          50% {
            opacity: .9;
            transform: translateY(-20px);
          }
        }

        .profile-float {
          animation: profileFloat 6s ease-in-out infinite;
        }

        .character-float {
          animation: characterFloat 5s ease-in-out infinite;
        }

        .neon-pulse {
          animation: neonPulse 4s ease-in-out infinite;
        }

        .scan-line {
          animation: scan 5s linear infinite;
        }

        .particle {
          animation: particle 3s ease-in-out infinite;
        }
      `}</style>

      {/* =====================================================
          BACKGROUND
      ===================================================== */}

      <div className="pointer-events-none absolute inset-0 overflow-hidden">

        <div className="absolute left-[-150px] top-20 h-[450px] w-[450px] rounded-full bg-purple-600/10 blur-[150px]" />

        <div className="absolute right-[-100px] top-40 h-[500px] w-[500px] rounded-full bg-lime-400/10 blur-[150px]" />

        <div className="neon-pulse absolute left-1/2 top-1/2 h-96 w-96 -translate-x-1/2 -translate-y-1/2 rounded-full bg-lime-400/5 blur-[130px]" />

        {/* Floating particles */}

        <span className="particle absolute left-[15%] top-[25%] h-1 w-1 rounded-full bg-neon" />
        <span className="particle absolute left-[30%] top-[70%] h-1.5 w-1.5 rounded-full bg-purple-400" />
        <span className="particle absolute right-[25%] top-[20%] h-1 w-1 rounded-full bg-neon" />
        <span className="particle absolute right-[12%] top-[65%] h-1.5 w-1.5 rounded-full bg-neon" />

      </div>

      {/* =====================================================
          MAIN
      ===================================================== */}

      <div className="relative mx-auto max-w-6xl px-4 py-12">

        {/* HEADER */}

        <div className="mb-8">
          <p className="text-sm uppercase tracking-[.3em] text-neon">
            PLAYER IDENTITY
          </p>

          <h1 className="mt-2 font-display text-5xl font-bold">
            Profile
          </h1>

          <p className="mt-2 text-zinc-500">
            Your NEXORA player identity and gaming statistics.
          </p>
        </div>

        {/* =================================================
            PROFILE HERO
        ================================================= */}

        <div className="grid overflow-hidden rounded-3xl border border-white/10 bg-white/[0.025] lg:grid-cols-[1.05fr_.95fr]">

          {/* LEFT */}

          <div className="relative p-7 md:p-10">

            {/* Top status */}

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs uppercase tracking-widest text-zinc-500">
                <span className="h-2 w-2 animate-pulse rounded-full bg-neon" />
                Online Player
              </div>

              <div className="flex items-center gap-2 rounded-full border border-neon/20 bg-neon/5 px-3 py-1.5 text-xs font-bold text-neon">
                <Shield size={13} />
                {user?.role?.toUpperCase() || "USER"}
              </div>
            </div>

            {/* Avatar */}

            <div className="mt-10 flex items-center gap-6">

              <div className="profile-float relative">

                <div className="absolute -inset-3 rounded-full bg-neon/20 blur-xl" />

                <div className="relative flex h-28 w-28 items-center justify-center rounded-full border border-neon/40 bg-gradient-to-br from-lime-400/20 via-black to-purple-500/20 shadow-[0_0_40px_rgba(163,255,18,.15)]">

                  <div className="flex h-20 w-20 items-center justify-center rounded-full border border-white/10 bg-black/60">
                    <Gamepad2
                      size={40}
                      className="text-neon"
                    />
                  </div>

                </div>

              </div>

              <div>
                <p className="text-xs uppercase tracking-widest text-zinc-600">
                  Player Name
                </p>

                <h2 className="mt-1 text-3xl font-bold">
                  {user?.name || "Player One"}
                </h2>

                <p className="mt-2 flex items-center gap-2 text-sm text-zinc-500">
                  <Mail size={14} />
                  {user?.email || "player@nexora.dev"}
                </p>
              </div>

            </div>

            {/* Level */}

            <div className="mt-10">

              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs uppercase tracking-widest text-zinc-600">
                    Player Level
                  </p>

                  <p className="mt-1 text-xl font-bold">
                    LEVEL 01
                  </p>
                </div>

                <div className="text-right">
                  <p className="text-xs text-zinc-600">
                    XP
                  </p>

                  <p className="font-bold text-neon">
                    250 / 500
                  </p>
                </div>
              </div>

              <div className="mt-3 h-2 overflow-hidden rounded-full bg-white/5">
                <div className="h-full w-1/2 rounded-full bg-neon shadow-[0_0_12px_rgba(163,255,18,.7)]" />
              </div>

              <p className="mt-2 text-xs text-zinc-600">
                250 XP until the next level
              </p>

            </div>

            {/* Action buttons */}

            <div className="mt-8 flex flex-wrap gap-3">

              <Link
                to="/dashboard"
                className="btn btn-primary group"
              >
                Dashboard

                <ArrowRight
                  size={16}
                  className="transition-transform group-hover:translate-x-1"
                />
              </Link>

              <Link
                to="/orders"
                className="btn btn-ghost group"
              >
                My Orders

                <ArrowRight
                  size={16}
                  className="transition-transform group-hover:translate-x-1"
                />
              </Link>

            </div>

          </div>

          {/* =================================================
              CHARACTER SIDE
          ================================================= */}

          <div className="relative min-h-[480px] overflow-hidden border-t border-white/5 bg-gradient-to-br from-purple-950/30 via-black to-lime-950/20 lg:border-l lg:border-t-0">

            {/* Character glow */}

            <div className="absolute left-1/2 top-1/2 h-72 w-72 -translate-x-1/2 -translate-y-1/2 rounded-full bg-lime-400/10 blur-[100px]" />

            <div className="absolute right-10 top-10 h-32 w-32 rounded-full bg-purple-500/10 blur-[70px]" />

            {/* Grid */}

            <div
              className="absolute inset-0 opacity-20"
              style={{
                backgroundImage:
                  "linear-gradient(rgba(163,255,18,.12) 1px, transparent 1px), linear-gradient(90deg, rgba(163,255,18,.12) 1px, transparent 1px)",
                backgroundSize: "40px 40px",
              }}
            />

            {/* Scan line */}

            <div className="scan-line absolute left-0 right-0 h-px bg-gradient-to-r from-transparent via-lime-400/50 to-transparent" />

            {/* Character */}

            <div className="character-float absolute inset-0 flex items-center justify-center">

              <div className="relative mt-5">

                {/* Character glow */}

                <div className="absolute left-1/2 top-1/2 h-64 w-64 -translate-x-1/2 -translate-y-1/2 rounded-full bg-lime-400/10 blur-[80px]" />

                {/* Character body */}

                <div className="relative flex flex-col items-center">

                  {/* Head */}

                  <div className="relative z-20 h-32 w-28 rounded-[45%] border-2 border-lime-300/60 bg-gradient-to-br from-zinc-800 via-zinc-950 to-black shadow-[0_0_35px_rgba(163,255,18,.25)]">

                    {/* Helmet */}

                    <div className="absolute left-3 right-3 top-5 h-10 rounded-full border border-lime-400/30 bg-lime-400/5" />

                    {/* Visor */}

                    <div className="absolute left-3 top-12 h-7 w-22 overflow-hidden rounded-lg border border-lime-400/40 bg-black/80">
                      <div className="h-full w-full bg-gradient-to-r from-transparent via-lime-400/30 to-transparent" />
                    </div>

                    {/* Eye glow */}

                    <div className="absolute left-8 top-[66px] h-1.5 w-8 rounded-full bg-lime-400 shadow-[0_0_10px_rgba(163,255,18,.9)]" />

                    <div className="absolute right-8 top-[66px] h-1.5 w-8 rounded-full bg-lime-400 shadow-[0_0_10px_rgba(163,255,18,.9)]" />

                  </div>

                  {/* Neck */}

                  <div className="relative z-10 -mt-2 h-8 w-14 border-x border-lime-400/30 bg-zinc-900" />

                  {/* Body */}

                  <div className="relative z-10 -mt-2 h-48 w-48 rounded-t-[55px] border-2 border-lime-400/40 bg-gradient-to-br from-zinc-800 via-zinc-950 to-black shadow-[0_0_40px_rgba(163,255,18,.15)]">

                    {/* Chest armor */}

                    <div className="absolute left-1/2 top-8 h-24 w-24 -translate-x-1/2 rounded-2xl border border-lime-400/30 bg-lime-400/5">

                      <div className="absolute left-1/2 top-1/2 h-8 w-8 -translate-x-1/2 -translate-y-1/2 rounded-full border border-lime-400/60 bg-lime-400/10 shadow-[0_0_20px_rgba(163,255,18,.4)]" />

                    </div>

                    {/* Shoulder lights */}

                    <div className="absolute -left-3 top-8 h-12 w-6 rounded-full border border-lime-400/30 bg-lime-400/10" />

                    <div className="absolute -right-3 top-8 h-12 w-6 rounded-full border border-lime-400/30 bg-lime-400/10" />

                  </div>

                  {/* Arms */}

                  <div className="absolute -left-16 top-40 h-32 w-8 rotate-[12deg] rounded-full border border-lime-400/30 bg-zinc-900" />

                  <div className="absolute -right-16 top-40 h-32 w-8 -rotate-[12deg] rounded-full border border-lime-400/30 bg-zinc-900" />

                </div>

              </div>

            </div>

            {/* Character label */}

            <div className="absolute bottom-6 left-6 right-6 rounded-2xl border border-white/10 bg-black/60 p-4 backdrop-blur-xl">

              <div className="flex items-center justify-between">

                <div>
                  <p className="text-[10px] uppercase tracking-widest text-neon">
                    NEXORA OPERATIVE
                  </p>

                  <p className="mt-1 font-bold">
                    {user?.name || "PLAYER ONE"}
                  </p>
                </div>

                <Zap
                  size={22}
                  className="text-neon"
                />

              </div>

            </div>

          </div>
        </div>

        {/* =================================================
            PLAYER STATS
        ================================================= */}

        <div className="mt-6 grid grid-cols-2 gap-4 md:grid-cols-4">

          <ProfileStat
            icon={<Gamepad2 size={20} />}
            label="Games"
            value={gamesPurchased}
            to="/orders"
          />

          <ProfileStat
            icon={<Package size={20} />}
            label="Orders"
            value="View"
            to="/orders"
          />

          <ProfileStat
            icon={<Heart size={20} />}
            label="Wishlist"
            value={wishlist}
            to="/wishlist"
          />

          <ProfileStat
            icon={<Clock size={20} />}
            label="Play Time"
            value={`${hoursPlayed}h`}
            to="/achievements"
          />

        </div>

        {/* =================================================
            PLAYER INFORMATION
        ================================================= */}

        <div className="mt-6 grid gap-6 md:grid-cols-2">

          <div className="glass rounded-2xl p-6">

            <div className="flex items-center gap-3">
              <User
                size={19}
                className="text-neon"
              />

              <h2 className="font-bold">
                Player Information
              </h2>
            </div>

            <div className="mt-6 space-y-5">

              <Info
                label="PLAYER NAME"
                value={user?.name}
              />

              <Info
                label="EMAIL"
                value={user?.email}
              />

              <Info
                label="ACCOUNT TYPE"
                value={user?.role?.toUpperCase()}
              />

            </div>

          </div>

          <div className="glass rounded-2xl p-6">

            <div className="flex items-center gap-3">
              <Award
                size={19}
                className="text-neon"
              />

              <h2 className="font-bold">
                Player Progress
              </h2>
            </div>

            <p className="mt-5 text-sm text-zinc-500">
              Keep purchasing games, building your wishlist and
              completing achievements to increase your NEXORA
              player level.
            </p>

            <Link
              to="/achievements"
              className="group mt-6 inline-flex items-center gap-2 text-sm font-semibold text-neon"
            >
              View Achievements

              <ArrowRight
                size={16}
                className="transition-transform group-hover:translate-x-1"
              />
            </Link>

          </div>

        </div>

      </div>
    </div>
  );
}

/* =========================================================
   PROFILE STAT
========================================================= */

function ProfileStat({
  icon,
  label,
  value,
  to,
}) {
  return (
    <Link
      to={to}
      className="group"
    >
      <div className="glass rounded-2xl p-5 transition-all duration-300 group-hover:-translate-y-1 group-hover:border-neon/40">

        <div className="flex items-center justify-between">

          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-neon/10 text-neon transition group-hover:scale-110">
            {icon}
          </div>

          <ArrowRight
            size={16}
            className="text-zinc-700 transition group-hover:translate-x-1 group-hover:text-neon"
          />

        </div>

        <p className="mt-4 text-xs uppercase tracking-widest text-zinc-600">
          {label}
        </p>

        <p className="mt-1 text-2xl font-bold transition group-hover:text-neon">
          {value}
        </p>

      </div>
    </Link>
  );
}

/* =========================================================
   INFORMATION ROW
========================================================= */

function Info({
  label,
  value,
}) {
  return (
    <div>
      <p className="text-[10px] uppercase tracking-widest text-zinc-600">
        {label}
      </p>

      <p className="mt-1 font-semibold">
        {value || "Not available"}
      </p>
    </div>
  );
}