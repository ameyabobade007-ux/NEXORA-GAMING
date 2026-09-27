import { Link, useNavigate } from "react-router-dom";
import {
  Search,
  ShoppingCart,
  Heart,
  UserRound,
  Gamepad2,
  Menu,
  X,
  ClipboardList,
} from "lucide-react";
import { useEffect, useState } from "react";
import { api } from "../services/api";
import { useAuth } from "../context/AuthContext";

export default function Navbar() {
  const { user, logout } = useAuth();

  const [q, setQ] = useState("");
  const [results, setResults] = useState([]);
  const [open, setOpen] = useState(false);

  const nav = useNavigate();

  useEffect(() => {
    const t = setTimeout(() => {
      if (q.length > 1) {
        api
          .get("/games", { params: { q } })
          .then((r) => setResults(r.data.slice(0, 5)));
      } else {
        setResults([]);
      }
    }, 250);

    return () => clearTimeout(t);
  }, [q]);

  const closeMobileMenu = () => {
    setOpen(false);
  };

  return (
    <header className="sticky top-0 z-50 border-b border-white/5 bg-black/80 backdrop-blur-xl">
      <div className="mx-auto flex h-[72px] max-w-7xl items-center gap-5 px-4">
        {/* LOGO */}
        <Link
          to="/"
          className="flex items-center gap-2 font-display text-xl"
        >
          <span className="rounded-lg bg-neon p-2 text-black">
            <Gamepad2 size={20} />
          </span>

          NEXORA
        </Link>

        {/* DESKTOP NAVIGATION */}
        <nav className="hidden items-center gap-5 text-sm text-zinc-400 lg:flex">
          <Link to="/store" className="transition hover:text-white">
            Store
          </Link>

          <Link to="/compare" className="transition hover:text-white">
            Compare
          </Link>

          <Link
            to="/compatibility"
            className="transition hover:text-white"
          >
            Compatibility
          </Link>

          {user && (
            <Link
              to="/orders"
              className="flex items-center gap-1.5 transition hover:text-white"
            >
              <ClipboardList size={15} />
              My Orders
            </Link>
          )}

          <Link
            to="/achievements"
            className="transition hover:text-white"
          >
            Achievements
          </Link>
        </nav>

        {/* SEARCH */}
        <div className="relative ml-auto hidden w-72 md:block">
          <div className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3">
            <Search size={17} />

            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  nav("/store");
                  setQ("");
                  setResults([]);
                }
              }}
              placeholder="Search games..."
              className="w-full bg-transparent py-2 text-sm outline-none"
            />
          </div>

          {/* SEARCH RESULTS */}
          {results.length > 0 && (
            <div className="absolute top-12 w-full rounded-xl border border-white/10 bg-[#101014] p-2 shadow-2xl">
              {results.map((g) => (
                <Link
                  onClick={() => {
                    setQ("");
                    setResults([]);
                  }}
                  key={g._id}
                  to={`/game/${g._id}`}
                  className="flex gap-3 rounded-lg p-2 hover:bg-white/5"
                >
                  <img
                    src={g.image}
                    alt={g.title}
                    className="h-10 w-14 rounded object-cover"
                  />

                  <div>
                    <p className="text-sm font-semibold">
                      {g.title}
                    </p>

                    <p className="text-xs text-zinc-500">
                      ₹{Number(g.price || 0).toLocaleString("en-IN")}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* RIGHT SIDE */}
        <div className="flex items-center gap-2">
          {/* WISHLIST */}
          <Link
            to="/wishlist"
            className="hidden rounded-lg p-2 transition hover:bg-white/5 sm:block"
            title="Wishlist"
          >
            <Heart size={19} />
          </Link>

          {/* MY ORDERS ICON */}
          {user && (
            <Link
              to="/orders"
              className="hidden rounded-lg p-2 transition hover:bg-white/5 sm:block lg:hidden"
              title="My Orders"
            >
              <ClipboardList size={19} />
            </Link>
          )}

          {/* CART */}
          <Link
            to="/cart"
            className="rounded-lg p-2 transition hover:bg-white/5"
            title="Cart"
          >
            <ShoppingCart size={19} />
          </Link>

          {/* USER */}
          {user ? (
            <div className="hidden items-center gap-2 sm:flex">
              <Link
                to={user.role === "admin" ? "/admin" : "/dashboard"}
                className="rounded-lg p-2 transition hover:bg-white/5"
                title="Dashboard"
              >
                <UserRound size={19} />
              </Link>

              <button
                onClick={logout}
                className="text-xs text-zinc-500 transition hover:text-white"
              >
                Logout
              </button>
            </div>
          ) : (
            <Link
              to="/login"
              className="btn btn-primary px-4 py-2 text-sm"
            >
              Login
            </Link>
          )}

          {/* MOBILE MENU BUTTON */}
          <button
            className="p-2 lg:hidden"
            onClick={() => setOpen(!open)}
            aria-label="Toggle menu"
          >
            {open ? <X /> : <Menu />}
          </button>
        </div>
      </div>

      {/* MOBILE MENU */}
      {open && (
        <div className="border-t border-white/5 p-4 lg:hidden">
          <div className="grid gap-1 text-sm">
            <Link
              to="/store"
              onClick={closeMobileMenu}
              className="rounded-lg p-3 transition hover:bg-white/5"
            >
              Store
            </Link>

            <Link
              to="/compare"
              onClick={closeMobileMenu}
              className="rounded-lg p-3 transition hover:bg-white/5"
            >
              Compare
            </Link>

            <Link
              to="/compatibility"
              onClick={closeMobileMenu}
              className="rounded-lg p-3 transition hover:bg-white/5"
            >
              Compatibility
            </Link>

            {user && (
              <>
                <Link
                  to="/orders"
                  onClick={closeMobileMenu}
                  className="flex items-center gap-2 rounded-lg p-3 font-medium text-lime-400 transition hover:bg-white/5"
                >
                  <ClipboardList size={17} />
                  My Orders
                </Link>

                <Link
                  to="/wishlist"
                  onClick={closeMobileMenu}
                  className="flex items-center gap-2 rounded-lg p-3 transition hover:bg-white/5"
                >
                  <Heart size={17} />
                  Wishlist
                </Link>
              </>
            )}

            <Link
              to="/achievements"
              onClick={closeMobileMenu}
              className="rounded-lg p-3 transition hover:bg-white/5"
            >
              Achievements
            </Link>

            {user && (
              <Link
                to={user.role === "admin" ? "/admin" : "/dashboard"}
                onClick={closeMobileMenu}
                className="flex items-center gap-2 rounded-lg p-3 transition hover:bg-white/5"
              >
                <UserRound size={17} />
                Dashboard
              </Link>
            )}

            {!user && (
              <Link
                to="/login"
                onClick={closeMobileMenu}
                className="btn btn-primary mt-2 text-center"
              >
                Login
              </Link>
            )}
          </div>
        </div>
      )}
    </header>
  );
}