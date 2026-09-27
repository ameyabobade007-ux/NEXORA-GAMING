import { useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  CheckCircle2,
  Lock,
  X,
  Trophy,
} from "lucide-react";

import { useAuth } from "../context/AuthContext";

export default function Achievements() {
  const { user } = useAuth();

  const [selected, setSelected] = useState(null);

  const all = [
    {
      name: "First Purchase",
      desc: "Purchase your first game.",
      requirement: "Complete your first game purchase.",
      icon: "🏆",
      route: "/orders",
      button: "View My Orders",
    },
    {
      name: "Game Collector",
      desc: "Own 10 games.",
      requirement: "Own or purchase at least 10 games.",
      icon: "🎯",
      route: "/orders",
      button: "View My Orders",
    },
    {
      name: "Hardcore Gamer",
      desc: "Purchase 25 games.",
      requirement: "Purchase at least 25 games.",
      icon: "🔥",
      route: "/orders",
      button: "View My Orders",
    },
    {
      name: "Elite Player",
      desc: "Spend ₹10,000.",
      requirement: "Spend a total of ₹10,000 on NEXORA purchases.",
      icon: "💎",
      route: "/orders",
      button: "View My Orders",
    },
    {
      name: "Wishlist Master",
      desc: "Add 20 games to wishlist.",
      requirement: "Add at least 20 games to your wishlist.",
      icon: "❤️",
      route: "/wishlist",
      button: "Open Wishlist",
    },
    {
      name: "Early Adopter",
      desc: "Create your NEXORA account.",
      requirement: "Create your NEXORA account.",
      icon: "⚡",
      route: "/profile",
      button: "View Profile",
    },
  ];

  const unlockedAchievements = user?.achievements || [];

  const unlockedCount = all.filter((achievement) =>
    unlockedAchievements.includes(achievement.name),
  ).length;

  return (
    <div className="mx-auto max-w-6xl px-4 py-12">

      {/* HEADER */}

      <p className="text-sm uppercase tracking-widest text-neon">
        PLAYER PROGRESSION
      </p>

      <div className="mt-1 flex flex-col justify-between gap-4 md:flex-row md:items-end">
        <div>
          <h1 className="font-display text-4xl font-bold">
            Achievements
          </h1>

          <p className="mt-2 text-sm text-zinc-500">
            Complete challenges and build your NEXORA gaming legacy.
          </p>
        </div>

        {/* Progress */}

        <div className="rounded-xl border border-white/10 bg-white/[0.03] px-5 py-3">
          <div className="flex items-center gap-3">
            <Trophy
              size={20}
              className="text-neon"
            />

            <div>
              <p className="text-[10px] uppercase tracking-widest text-zinc-600">
                Progress
              </p>

              <p className="text-sm font-bold">
                {unlockedCount} / {all.length} Unlocked
              </p>
            </div>
          </div>

          <div className="mt-2 h-1.5 w-40 overflow-hidden rounded-full bg-white/10">
            <div
              className="h-full rounded-full bg-neon transition-all duration-500"
              style={{
                width: `${(unlockedCount / all.length) * 100}%`,
              }}
            />
          </div>
        </div>
      </div>

      {/* ACHIEVEMENTS */}

      <div className="mt-8 grid gap-4 md:grid-cols-3">
        {all.map((achievement) => {
          const unlocked = unlockedAchievements.includes(
            achievement.name,
          );

          return (
            <button
              key={achievement.name}
              type="button"
              onClick={() => setSelected(achievement)}
              className="group text-left"
            >
              <div
                className={`glass relative h-full rounded-2xl border p-6 transition-all duration-300 ${
                  unlocked
                    ? "border-neon/30 hover:-translate-y-2 hover:border-neon/60"
                    : "border-white/10 hover:-translate-y-1 hover:border-white/20"
                }`}
              >

                {/* Status */}

                <div className="flex items-start justify-between">
                  <div
                    className={`flex h-14 w-14 items-center justify-center rounded-2xl text-4xl ${
                      unlocked
                        ? "bg-neon/10"
                        : "bg-white/5 grayscale"
                    }`}
                  >
                    {achievement.icon}
                  </div>

                  {unlocked ? (
                    <div className="flex items-center gap-1 rounded-full bg-neon/10 px-2.5 py-1 text-[10px] font-bold text-neon">
                      <CheckCircle2 size={12} />
                      UNLOCKED
                    </div>
                  ) : (
                    <div className="flex items-center gap-1 rounded-full bg-white/5 px-2.5 py-1 text-[10px] font-bold text-zinc-600">
                      <Lock size={11} />
                      LOCKED
                    </div>
                  )}
                </div>

                {/* Text */}

                <h2 className="mt-5 font-bold transition-colors group-hover:text-neon">
                  {achievement.name}
                </h2>

                <p className="mt-2 text-sm text-zinc-500">
                  {achievement.desc}
                </p>

                {/* Click indicator */}

                <div className="mt-6 flex items-center justify-between border-t border-white/5 pt-4">
                  <span
                    className={`text-xs font-bold uppercase tracking-wider ${
                      unlocked
                        ? "text-neon"
                        : "text-zinc-600"
                    }`}
                  >
                    {unlocked
                      ? "Completed"
                      : "View Details"}
                  </span>

                  <ArrowRight
                    size={16}
                    className="text-zinc-600 transition-all group-hover:translate-x-1 group-hover:text-neon"
                  />
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {/* MODAL */}

      {selected && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 px-4 backdrop-blur-sm"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) {
              setSelected(null);
            }
          }}
        >
          <div className="w-full max-w-md rounded-2xl border border-white/10 bg-[#101014] p-6 shadow-2xl">

            {/* Modal Header */}

            <div className="flex items-start justify-between">
              <div
                className={`flex h-16 w-16 items-center justify-center rounded-2xl text-4xl ${
                  unlockedAchievements.includes(selected.name)
                    ? "bg-neon/10"
                    : "bg-white/5"
                }`}
              >
                {selected.icon}
              </div>

              <button
                type="button"
                onClick={() => setSelected(null)}
                className="rounded-lg p-2 text-zinc-500 transition hover:bg-white/5 hover:text-white"
              >
                <X size={20} />
              </button>
            </div>

            <h2 className="mt-6 text-2xl font-bold">
              {selected.name}
            </h2>

            <p className="mt-2 text-sm text-zinc-500">
              {selected.desc}
            </p>

            {/* Status */}

            <div
              className={`mt-6 rounded-xl border p-4 ${
                unlockedAchievements.includes(selected.name)
                  ? "border-neon/20 bg-neon/5"
                  : "border-white/10 bg-white/[0.03]"
              }`}
            >
              <div className="flex items-center gap-3">
                {unlockedAchievements.includes(selected.name) ? (
                  <CheckCircle2
                    size={22}
                    className="text-neon"
                  />
                ) : (
                  <Lock
                    size={22}
                    className="text-zinc-600"
                  />
                )}

                <div>
                  <p
                    className={`text-sm font-bold ${
                      unlockedAchievements.includes(selected.name)
                        ? "text-neon"
                        : "text-zinc-400"
                    }`}
                  >
                    {unlockedAchievements.includes(selected.name)
                      ? "Achievement Unlocked"
                      : "Achievement Locked"}
                  </p>

                  <p className="mt-1 text-xs text-zinc-600">
                    {unlockedAchievements.includes(selected.name)
                      ? "You have completed this achievement."
                      : "Complete the requirement to unlock it."}
                  </p>
                </div>
              </div>
            </div>

            {/* Requirement */}

            <div className="mt-4 rounded-xl border border-white/5 bg-white/[0.02] p-4">
              <p className="text-xs uppercase tracking-widest text-zinc-600">
                Requirement
              </p>

              <p className="mt-2 text-sm text-zinc-300">
                {selected.requirement}
              </p>
            </div>

            {/* Buttons */}

            <div className="mt-6 flex gap-3">

              <button
                type="button"
                onClick={() => setSelected(null)}
                className="flex-1 rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-semibold text-zinc-300 transition hover:bg-white/10"
              >
                Close
              </button>

              <Link
                to={selected.route}
                onClick={() => setSelected(null)}
                className="btn btn-primary flex flex-1 items-center justify-center gap-2"
              >
                {selected.button}
                <ArrowRight size={16} />
              </Link>

            </div>
          </div>
        </div>
      )}
    </div>
  );
}