import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
export default function Cart() {
  const [cart, setCart] = useState(
    JSON.parse(localStorage.getItem("nexora_cart") || "[]"),
  );
  const nav = useNavigate();
  const update = (c) => {
    setCart(c);
    localStorage.setItem("nexora_cart", JSON.stringify(c));
  };
  const total = cart.reduce((s, i) => s + i.price * i.qty, 0);
  return (
    <div className="mx-auto max-w-5xl px-4 py-12">
      <h1 className="font-display text-4xl font-bold">Your Cart</h1>
      {!cart.length ? (
        <div className="glass mt-8 rounded-2xl p-10 text-center">
          <p className="text-zinc-500">Your cart is empty.</p>
          <Link to="/store" className="btn btn-primary mt-5">
            Browse Games
          </Link>
        </div>
      ) : (
        <div className="mt-8 grid gap-6 md:grid-cols-[1fr_320px]">
          <div className="grid gap-3">
            {cart.map((i) => (
              <div className="glass flex gap-4 rounded-2xl p-4" key={i.game}>
                <img
                  src={i.image}
                  className="h-24 w-32 rounded-xl object-cover"
                />
                <div className="flex-1">
                  <h3 className="font-bold">{i.title}</h3>
                  <p className="mt-2 text-zinc-400">
                    ₹{i.price.toLocaleString()}
                  </p>
                  <div className="mt-3 flex gap-2">
                    <button
                      onClick={() =>
                        update(
                          cart.map((x) =>
                            x.game === i.game
                              ? { ...x, qty: Math.max(1, x.qty - 1) }
                              : x,
                          ),
                        )
                      }
                      className="rounded bg-white/5 px-3"
                    >
                      −
                    </button>
                    <span>{i.qty}</span>
                    <button
                      onClick={() =>
                        update(
                          cart.map((x) =>
                            x.game === i.game ? { ...x, qty: x.qty + 1 } : x,
                          ),
                        )
                      }
                      className="rounded bg-white/5 px-3"
                    >
                      +
                    </button>
                    <button
                      onClick={() =>
                        update(cart.filter((x) => x.game !== i.game))
                      }
                      className="ml-3 text-xs text-red-400"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="glass h-fit rounded-2xl p-6">
            <p className="text-sm text-zinc-500">Total</p>
            <div className="mt-2 text-3xl font-bold">
              ₹{total.toLocaleString()}
            </div>
            <button
              onClick={() => nav("/checkout")}
              className="btn btn-primary mt-5 w-full"
            >
              Proceed to Checkout
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
