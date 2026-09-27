import { useEffect, useState } from "react";
import { api } from "../services/api";
import GameCard from "../components/GameCard";
export default function Wishlist() {
  const [games, setGames] = useState([]);
  const [user, setUser] = useState(null);
  useEffect(() => {
    api.get("/auth/me").then(async (r) => {
      setUser(r.data.user);
      const all = (await api.get("/games")).data;
      setGames(all.filter((g) => r.data.user.wishlist?.includes(g._id)));
    });
  }, []);
  return (
    <div className="mx-auto max-w-7xl px-4 py-12">
      <h1 className="font-display text-4xl font-bold">Wishlist</h1>
      <p className="mt-2 text-zinc-500">Saved games for later.</p>
      <div className="mt-8 grid grid-auto gap-5">
        {games.map((g) => (
          <GameCard key={g._id} game={g} />
        ))}
      </div>
      {user && !games.length && (
        <p className="mt-8 text-zinc-500">Your wishlist is empty.</p>
      )}
    </div>
  );
}
