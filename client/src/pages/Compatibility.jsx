import { useEffect, useMemo, useState } from "react";
import {
  CheckCircle,
  XCircle,
  AlertTriangle,
  Cpu,
  Monitor,
  MemoryStick,
  HardDrive,
} from "lucide-react";
import { api } from "../services/api";

export default function Compatibility() {
  const [games, setGames] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [gameId, setGameId] = useState("");
  const [cpu, setCpu] = useState("Intel Core i5");
  const [gpu, setGpu] = useState("RTX 3060");
  const [ram, setRam] = useState("16");
  const [storage, setStorage] = useState("500");

  const [result, setResult] = useState(null);

  useEffect(() => {
    loadGames();
  }, []);

  async function loadGames() {
    try {
      setLoading(true);
      setError("");

      const response = await api.get("/games");

      const data = Array.isArray(response.data)
        ? response.data
        : response.data.games || [];

      setGames(data);

      if (data.length > 0) {
        setGameId(data[0]._id);
      }
    } catch (err) {
      console.error("Compatibility games error:", err);
      setError(
        "Unable to load games. Make sure the NEXORA backend is running on port 5000.",
      );
    } finally {
      setLoading(false);
    }
  }

  const selectedGame = useMemo(() => {
    return games.find((game) => game._id === gameId);
  }, [games, gameId]);

  function checkCompatibility() {
    if (!selectedGame) {
      setResult(null);
      return;
    }

    const minimum = selectedGame.minimum || {};

    const userRam = Number(ram);
    const requiredRam = Number(minimum.ram || 8);

    const userStorage = Number(storage);
    const requiredStorage = Number(minimum.storage || 50);

    const cpuText = cpu.toLowerCase();
    const gpuText = gpu.toLowerCase();

    const cpuPass =
      cpuText.includes("i5") ||
      cpuText.includes("i7") ||
      cpuText.includes("i9") ||
      cpuText.includes("ryzen 5") ||
      cpuText.includes("ryzen 7") ||
      cpuText.includes("ryzen 9");

    const gpuPass =
      gpuText.includes("rtx") ||
      gpuText.includes("gtx") ||
      gpuText.includes("rx");

    const ramPass = userRam >= requiredRam;
    const storagePass = userStorage >= requiredStorage;

    let score = 0;

    if (cpuPass) score += 25;
    if (gpuPass) score += 25;
    if (ramPass) score += 25;
    if (storagePass) score += 25;

    let status;

    if (score === 100) {
      status = "excellent";
    } else if (score >= 75) {
      status = "good";
    } else if (score >= 50) {
      status = "playable";
    } else {
      status = "notRecommended";
    }

    setResult({
      score,
      status,
      cpuPass,
      gpuPass,
      ramPass,
      storagePass,
      requiredRam,
      requiredStorage,
    });
  }

  return (
    <main className="mx-auto max-w-6xl px-4 py-12">
      {/* HEADER */}
      <section>
        <p className="text-sm font-semibold uppercase tracking-[0.3em] text-neon">
          HARDWARE LAB
        </p>

        <h1 className="mt-2 font-display text-4xl font-bold md:text-5xl">
          PC Compatibility Checker
        </h1>

        <p className="mt-3 max-w-2xl text-zinc-400">
          Enter your PC specifications and check whether your system can run
          your favorite games.
        </p>
      </section>

      {/* ERROR */}
      {error && (
        <div className="mt-8 flex items-start gap-3 rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-red-300">
          <AlertTriangle className="mt-0.5 shrink-0" size={20} />
          <div>
            <p className="font-semibold">Could not load games</p>
            <p className="mt-1 text-sm">{error}</p>

            <button
              onClick={loadGames}
              className="mt-3 rounded-lg bg-red-500/20 px-4 py-2 text-sm hover:bg-red-500/30"
            >
              Retry
            </button>
          </div>
        </div>
      )}

      {/* MAIN GRID */}
      <div className="mt-10 grid gap-6 lg:grid-cols-2">
        {/* PC CONFIGURATION */}
        <section className="glass rounded-2xl p-6">
          <div className="mb-6">
            <h2 className="text-xl font-bold">Your PC</h2>

            <p className="mt-1 text-sm text-zinc-500">
              Enter your hardware configuration.
            </p>
          </div>

          <div className="space-y-5">
            {/* CPU */}
            <label className="block">
              <div className="mb-2 flex items-center gap-2 text-sm font-medium text-zinc-300">
                <Cpu size={17} />
                CPU
              </div>

              <input
                className="input w-full"
                value={cpu}
                onChange={(e) => setCpu(e.target.value)}
                placeholder="Intel Core i5"
              />
            </label>

            {/* GPU */}
            <label className="block">
              <div className="mb-2 flex items-center gap-2 text-sm font-medium text-zinc-300">
                <Monitor size={17} />
                GPU
              </div>

              <input
                className="input w-full"
                value={gpu}
                onChange={(e) => setGpu(e.target.value)}
                placeholder="RTX 3060"
              />
            </label>

            {/* RAM */}
            <label className="block">
              <div className="mb-2 flex items-center gap-2 text-sm font-medium text-zinc-300">
                <MemoryStick size={17} />
                RAM
              </div>

              <select
                className="input w-full"
                value={ram}
                onChange={(e) => setRam(e.target.value)}
              >
                <option value="4">4 GB</option>
                <option value="8">8 GB</option>
                <option value="16">16 GB</option>
                <option value="32">32 GB</option>
                <option value="64">64 GB</option>
              </select>
            </label>

            {/* STORAGE */}
            <label className="block">
              <div className="mb-2 flex items-center gap-2 text-sm font-medium text-zinc-300">
                <HardDrive size={17} />
                Available Storage
              </div>

              <select
                className="input w-full"
                value={storage}
                onChange={(e) => setStorage(e.target.value)}
              >
                <option value="50">50 GB</option>
                <option value="100">100 GB</option>
                <option value="250">250 GB</option>
                <option value="500">500 GB</option>
                <option value="1000">1 TB</option>
                <option value="2000">2 TB</option>
              </select>
            </label>

            {/* GAME */}
            <label className="block">
              <div className="mb-2 text-sm font-medium text-zinc-300">
                Select Game
              </div>

              <select
                className="input w-full"
                value={gameId}
                onChange={(e) => {
                  setGameId(e.target.value);
                  setResult(null);
                }}
              >
                {loading && <option value="">Loading games...</option>}

                {!loading && games.length === 0 && (
                  <option value="">No games available</option>
                )}

                {games.map((game) => (
                  <option value={game._id} key={game._id}>
                    {game.title}
                  </option>
                ))}
              </select>
            </label>

            <button
              onClick={checkCompatibility}
              disabled={!selectedGame || loading}
              className="btn btn-primary w-full disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading ? "Loading..." : "Check Compatibility"}
            </button>
          </div>
        </section>

        {/* RESULT */}
        <section className="glass min-h-[500px] rounded-2xl p-6">
          {!result ? (
            <div className="flex h-full min-h-[450px] flex-col items-center justify-center text-center">
              <div className="mb-5 rounded-full bg-white/5 p-6">🖥️</div>

              <h2 className="text-2xl font-bold">Ready to Test</h2>

              <p className="mt-2 max-w-sm text-sm text-zinc-500">
                Select a game, enter your PC specifications and click "Check
                Compatibility".
              </p>

              {selectedGame && (
                <div className="mt-8 rounded-xl border border-white/10 bg-white/[0.03] p-5 text-left">
                  <p className="text-xs uppercase tracking-widest text-zinc-500">
                    Selected Game
                  </p>

                  <p className="mt-1 font-semibold">{selectedGame.title}</p>

                  <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
                    <div>
                      <span className="text-zinc-500">Required RAM</span>

                      <p>{selectedGame.minimum?.ram || 8} GB</p>
                    </div>

                    <div>
                      <span className="text-zinc-500">Storage</span>

                      <p>{selectedGame.minimum?.storage || 50} GB</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="flex h-full min-h-[450px] flex-col items-center justify-center text-center">
              {/* ICON */}
              {result.status === "excellent" || result.status === "good" ? (
                <CheckCircle size={75} className="text-neon" />
              ) : result.status === "playable" ? (
                <AlertTriangle size={75} className="text-yellow-400" />
              ) : (
                <XCircle size={75} className="text-red-400" />
              )}

              {/* STATUS */}
              <h2
                className={`mt-6 text-3xl font-bold ${
                  result.status === "excellent" || result.status === "good"
                    ? "text-neon"
                    : result.status === "playable"
                      ? "text-yellow-400"
                      : "text-red-400"
                }`}
              >
                {result.status === "excellent"
                  ? "EXCELLENT"
                  : result.status === "good"
                    ? "YOUR PC CAN RUN IT"
                    : result.status === "playable"
                      ? "PLAYABLE"
                      : "NOT RECOMMENDED"}
              </h2>

              <p className="mt-2 text-zinc-400">{selectedGame?.title}</p>

              {/* SCORE */}
              <div className="mt-8">
                <p className="text-5xl font-black">{result.score}%</p>

                <p className="mt-1 text-xs uppercase tracking-widest text-zinc-500">
                  Compatibility Score
                </p>
              </div>

              {/* CHECKS */}
              <div className="mt-8 w-full max-w-md space-y-3">
                <CheckRow label="CPU" passed={result.cpuPass} />

                <CheckRow label="GPU" passed={result.gpuPass} />

                <CheckRow
                  label={`RAM — ${result.requiredRam} GB required`}
                  passed={result.ramPass}
                />

                <CheckRow
                  label={`Storage — ${result.requiredStorage} GB required`}
                  passed={result.storagePass}
                />
              </div>
            </div>
          )}
        </section>
      </div>

      {/* INFORMATION */}
      <section className="mt-8 glass rounded-2xl p-6">
        <h2 className="text-xl font-bold">
          How the compatibility checker works
        </h2>

        <p className="mt-2 text-sm leading-6 text-zinc-500">
          NEXORA compares your entered CPU, GPU, RAM and available storage
          against the selected game's minimum system requirements. The result is
          converted into a compatibility score to give you a quick idea of
          whether the game is suitable for your PC.
        </p>
      </section>
    </main>
  );
}

function CheckRow({ label, passed }) {
  return (
    <div className="flex items-center justify-between rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3">
      <span className="text-sm text-zinc-300">{label}</span>

      {passed ? (
        <CheckCircle size={20} className="text-neon" />
      ) : (
        <XCircle size={20} className="text-red-400" />
      )}
    </div>
  );
}
