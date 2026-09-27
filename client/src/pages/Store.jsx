import { useEffect, useState } from "react";
import { api } from "../services/api";
import GameCard from "../components/GameCard";
export default function Store() {
  const [games, setGames] = useState([]);
  const [q, setQ] = useState("");
  const [genre, setGenre] = useState("All");
  useEffect(() => {
    const t = setTimeout(
      () => api.get("/games", { params: { q } }).then((r) => setGames(r.data)),
      250,
    );
    return () => clearTimeout(t);
  }, [q]);
  const genres = ["All", ...new Set(games.map((g) => g.genre))];
  const filtered =
    genre === "All" ? games : games.filter((g) => g.genre === genre);
  const add = (game) => {
    const cart = JSON.parse(localStorage.getItem("nexora_cart") || "[]");
    const found = cart.find((x) => x.game === game._id);
    if (found) found.qty++;
    else
      cart.push({
        game: game._id,
        title: game.title,
        price: game.price,
        qty: 1,
        image: game.image,
      });
    localStorage.setItem("nexora_cart", JSON.stringify(cart));
    alert("Added to cart");
  };
  return (
    <div className="mx-auto max-w-7xl px-4 py-12">
      <div className="mb-8">
        <p className="text-sm uppercase tracking-widest text-neon">
          NEXORA MARKET
        </p>
        <h1 className="font-display text-4xl font-bold">Game Store</h1>
        <p className="mt-2 text-zinc-500">
          Search, compare and discover your next game.
        </p>
      </div>
      <div className="mb-8 flex flex-col gap-3 md:flex-row">
        <input
          className="input"
          placeholder="Search games while typing..."
          value={q}
          onChange={(e) => setQ(e.target.value)}
        />
        <div className="flex flex-wrap gap-2">
          {genres.map((g) => (
            <button
              key={g}
              onClick={() => setGenre(g)}
              className={`rounded-lg px-4 py-2 text-sm ${genre === g ? "bg-neon text-black" : "bg-white/5 text-zinc-400"}`}
            >
              {g}
            </button>
          ))}
        </div>
      </div>
      <div className="grid grid-auto gap-5">
        {filtered.map((g) => (
          <GameCard key={g._id} game={g} onCart={add} />
        ))}
      </div>
    </div>
  );
}
