import { useEffect, useState } from "react";
import { api } from "../services/api";
export default function Compare() {
  const [games, setGames] = useState([]);
  const [ids, setIds] = useState(["", "", ""]);
  useEffect(() => {
    api.get("/games").then((r) => setGames(r.data));
  }, []);
  const selected = ids
    .map((id) => games.find((g) => g._id === id))
    .filter(Boolean);
  return (
    <div className="mx-auto max-w-7xl px-4 py-12">
      <p className="text-sm uppercase tracking-widest text-neon">
        DECISION ENGINE
      </p>
      <h1 className="font-display text-4xl font-bold">Game Comparison</h1>
      <p className="mt-2 text-zinc-500">
        Compare up to three games side by side.
      </p>
      <div className="mt-8 grid gap-3 md:grid-cols-3">
        {ids.map((id, i) => (
          <select
            key={i}
            value={id}
            onChange={(e) => {
              const n = [...ids];
              n[i] = e.target.value;
              setIds(n);
            }}
            className="input"
          >
            <option value="">Select Game {i + 1}</option>
            {games.map((g) => (
              <option key={g._id} value={g._id}>
                {g.title}
              </option>
            ))}
          </select>
        ))}
      </div>
      {selected.length > 0 && (
        <div className="mt-10 overflow-x-auto">
          <table className="w-full min-w-[700px] overflow-hidden rounded-2xl border border-white/10 text-left">
            <thead>
              <tr className="bg-white/5">
                <th className="p-4">Feature</th>
                {selected.map((g) => (
                  <th className="p-4" key={g._id}>
                    {g.title}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {[
                ["Price", (g) => `₹${g.price.toLocaleString()}`],
                ["Rating", (g) => `⭐ ${g.rating.toFixed(1)}`],
                ["Genre", (g) => g.genre],
                ["Platform", (g) => g.platform.join(", ")],
                ["CPU", (g) => g.recommended.cpu],
                ["GPU", (g) => g.recommended.gpu],
                ["RAM", (g) => `${g.recommended.ram} GB`],
                ["Storage", (g) => `${g.recommended.storage} GB`],
              ].map(([k, fn]) => (
                <tr className="border-t border-white/5" key={k}>
                  <td className="p-4 text-zinc-500">{k}</td>
                  {selected.map((g) => (
                    <td className="p-4" key={g._id}>
                      {fn(g)}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
