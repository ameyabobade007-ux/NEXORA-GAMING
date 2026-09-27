import { Link } from "react-router-dom";
import { Heart, ShoppingCart, Star } from "lucide-react";
import { api } from "../services/api";
import { useState } from "react";

export default function GameCard({ game, onCart }) {
  const [liked, setLiked] = useState(false);

  const stock = Number(game.stock ?? 0);
  const outOfStock = stock <= 0;
  const lowStock = stock > 0 && stock <= 5;

  const add = async () => {
    if (localStorage.getItem("nexora_token")) {
      try {
        await api.post(`/games/${game._id}/wishlist`);
        setLiked((x) => !x);
      } catch {}
    }
  };

  const handleCart = (e) => {
    e.preventDefault();
    e.stopPropagation();

    // Do not allow adding an out-of-stock game
    if (outOfStock) {
      return;
    }

    onCart?.(game);
  };

  return (
    <div className="card group">
      <Link to={`/game/${game._id}`}>
        <div className="relative h-48 overflow-hidden">
          <img
            src={game.image}
            alt={game.title}
            className={`h-full w-full object-cover transition duration-500 group-hover:scale-110 ${
              outOfStock ? "grayscale opacity-60" : ""
            }`}
          />

          <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />

          {/* GENRE */}
          <span className="absolute left-3 top-3 rounded-full bg-black/70 px-2 py-1 text-xs">
            {game.genre}
          </span>

          {/* OUT OF STOCK BADGE */}
          {outOfStock && (
            <span className="absolute bottom-3 left-3 rounded-full border border-red-400/30 bg-red-500/20 px-3 py-1 text-xs font-bold text-red-300 backdrop-blur-md">
              OUT OF STOCK
            </span>
          )}

          {/* LOW STOCK BADGE */}
          {lowStock && (
            <span className="absolute bottom-3 left-3 rounded-full border border-yellow-400/30 bg-yellow-500/20 px-3 py-1 text-xs font-bold text-yellow-300 backdrop-blur-md">
              ONLY {stock} LEFT
            </span>
          )}

          {/* WISHLIST */}
          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              add();
            }}
            className="absolute right-3 top-3 rounded-full bg-black/70 p-2 transition hover:bg-black"
          >
            <Heart
              size={16}
              className={liked ? "fill-neon text-neon" : ""}
            />
          </button>
        </div>
      </Link>

      <div className="p-4">
        <div className="mb-2 flex items-center justify-between gap-3">
          <h3 className="truncate font-bold">{game.title}</h3>

          <span className="flex shrink-0 items-center gap-1 text-xs">
            <Star
              size={13}
              className="fill-yellow-400 text-yellow-400"
            />
            {Number(game.rating || 0).toFixed(1)}
          </span>
        </div>

        <p className="mb-4 line-clamp-2 text-xs text-zinc-500">
          {game.description}
        </p>

        <div className="flex items-center justify-between gap-3">
          <div>
            <strong className="text-lg">
              {game.price === 0
                ? "FREE"
                : `₹${Number(game.price).toLocaleString("en-IN")}`}
            </strong>

            {/* STOCK INFORMATION */}
            {outOfStock ? (
              <p className="mt-1 text-xs font-semibold text-red-400">
                Currently unavailable
              </p>
            ) : lowStock ? (
              <p className="mt-1 text-xs font-semibold text-yellow-400">
                Only {stock} left
              </p>
            ) : (
              <p className="mt-1 text-xs text-zinc-600">
                In stock
              </p>
            )}
          </div>

          {/* ADD TO CART / OUT OF STOCK */}
          <button
            onClick={handleCart}
            disabled={outOfStock}
            className={`flex items-center gap-1 px-3 py-2 text-xs ${
              outOfStock
                ? "cursor-not-allowed rounded-lg border border-red-500/20 bg-red-500/10 text-red-400 opacity-80"
                : "btn btn-primary"
            }`}
          >
            <ShoppingCart size={14} />

            {outOfStock ? "Out of Stock" : "Add"}
          </button>
        </div>
      </div>
    </div>
  );
}