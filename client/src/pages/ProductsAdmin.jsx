import { useEffect, useState } from "react";
import {
  Plus,
  Search,
  Pencil,
  Trash2,
  X,
  Package,
  RefreshCw,
  Gamepad2,
  AlertTriangle,
} from "lucide-react";
import { api } from "../services/api";

const EMPTY_FORM = {
  title: "",
  description: "",
  price: "",
  stock: "",
  genre: "",
  platform: "",
  rating: "",
  image: "",
  discount: "",
  cpu: "",
  gpu: "",
  ram: "",
  storage: "",
};

export default function ProductsAdmin() {
  const [games, setGames] = useState([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");

  const [showModal, setShowModal] = useState(false);
  const [editingGame, setEditingGame] = useState(null);

  const [form, setForm] = useState(EMPTY_FORM);

  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(null);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

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
    } catch (err) {
      console.error("Products loading error:", err);

      setError(
        "Unable to load products. Please check that the backend is running.",
      );
    } finally {
      setLoading(false);
    }
  }

  function openAddModal() {
    setEditingGame(null);
    setForm(EMPTY_FORM);
    setError("");
    setSuccess("");
    setShowModal(true);
  }

  function openEditModal(game) {
    setEditingGame(game);

    setForm({
      title: game.title || "",
      description: game.description || "",
      price: game.price ?? "",
      stock: game.stock ?? "",
      genre: game.genre || "",
      platform: Array.isArray(game.platform)
        ? game.platform.join(", ")
        : game.platform || "",
      rating: game.rating ?? "",
      image: game.image || "",
      discount: game.discount ?? "",
      cpu: game.minimum?.cpu || "",
      gpu: game.minimum?.gpu || "",
      ram: game.minimum?.ram ?? "",
      storage: game.minimum?.storage ?? "",
    });

    setError("");
    setSuccess("");
    setShowModal(true);
  }

  function closeModal() {
    if (saving) return;

    setShowModal(false);
    setEditingGame(null);
    setForm(EMPTY_FORM);
  }

  function handleChange(event) {
    const { name, value } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  }

  async function handleSubmit(event) {
    event.preventDefault();

    if (!form.title.trim()) {
      setError("Game title is required.");
      return;
    }

    if (!form.price || Number(form.price) < 0) {
      setError("Please enter a valid price.");
      return;
    }

    if (form.stock === "" || Number(form.stock) < 0) {
      setError("Please enter a valid stock quantity.");
      return;
    }

    try {
      setSaving(true);
      setError("");

      const payload = {
        title: form.title.trim(),
        description: form.description.trim(),
        price: Number(form.price),
        stock: Number(form.stock),
        genre: form.genre.trim(),
        platform: form.platform
          .split(",")
          .map((item) => item.trim())
          .filter(Boolean),
        rating: Number(form.rating || 0),
        image: form.image.trim(),
        discount: Number(form.discount || 0),

        minimum: {
          cpu: form.cpu.trim(),
          gpu: form.gpu.trim(),
          ram: Number(form.ram || 0),
          storage: Number(form.storage || 0),
        },
      };

      if (editingGame) {
        await api.put(`/games/${editingGame._id}`, payload);

        setSuccess("Game updated successfully.");
      } else {
        await api.post("/games", payload);

        setSuccess("Game added successfully.");
      }

      await loadGames();

      setTimeout(() => {
        setShowModal(false);
        setEditingGame(null);
        setForm(EMPTY_FORM);
        setSuccess("");
      }, 700);
    } catch (err) {
      console.error("Product save error:", err);

      setError(
        err?.response?.data?.message ||
          "Unable to save the game. Please check the server.",
      );
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(game) {
    const confirmed = window.confirm(`Delete "${game.title}" from the store?`);

    if (!confirmed) return;

    try {
      setDeleting(game._id);
      setError("");

      await api.delete(`/games/${game._id}`);

      setGames((previous) => previous.filter((item) => item._id !== game._id));

      setSuccess(`${game.title} was deleted.`);
    } catch (err) {
      console.error("Delete error:", err);

      setError(err?.response?.data?.message || "Unable to delete this game.");
    } finally {
      setDeleting(null);
    }
  }

  const filteredGames = games.filter((game) => {
    const query = search.toLowerCase().trim();

    if (!query) return true;

    return (
      game.title?.toLowerCase().includes(query) ||
      game.genre?.toLowerCase().includes(query) ||
      JSON.stringify(game.platform)?.toLowerCase().includes(query)
    );
  });

  return (
    <main className="mx-auto max-w-7xl px-4 py-10">
      {/* HEADER */}
      <section className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <Gamepad2 size={19} className="text-lime-400" />

            <span className="text-sm font-semibold uppercase tracking-[0.3em] text-lime-400">
              Store Management
            </span>
          </div>

          <h1 className="mt-3 font-display text-4xl font-bold">Products</h1>

          <p className="mt-2 text-zinc-500">
            Manage games, prices, inventory and system requirements.
          </p>
        </div>

        <button
          onClick={openAddModal}
          className="flex items-center justify-center gap-2 rounded-xl bg-lime-400 px-5 py-3 font-semibold text-black transition hover:bg-lime-300"
        >
          <Plus size={19} />
          Add Game
        </button>
      </section>

      {/* SEARCH / TOOLBAR */}
      <section className="glass mt-8 rounded-2xl p-4">
        <div className="flex flex-col gap-3 md:flex-row">
          <div className="relative flex-1">
            <Search
              size={18}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500"
            />

            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search games, genres or platforms..."
              className="input w-full pl-11"
            />
          </div>

          <button
            onClick={loadGames}
            className="flex items-center justify-center gap-2 rounded-xl border border-white/10 px-5 py-3 text-sm transition hover:bg-white/5"
          >
            <RefreshCw size={16} />
            Refresh
          </button>
        </div>
      </section>

      {/* ALERTS */}
      {error && (
        <div className="mt-5 flex items-start gap-3 rounded-xl border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-300">
          <AlertTriangle size={18} className="mt-0.5 shrink-0" />

          <span>{error}</span>
        </div>
      )}

      {success && (
        <div className="mt-5 rounded-xl border border-lime-400/20 bg-lime-400/10 p-4 text-sm text-lime-300">
          {success}
        </div>
      )}

      {/* PRODUCT COUNT */}
      <div className="mt-6 flex items-center justify-between">
        <p className="text-sm text-zinc-500">
          Showing{" "}
          <span className="font-semibold text-zinc-300">
            {filteredGames.length}
          </span>{" "}
          of <span className="font-semibold text-zinc-300">{games.length}</span>{" "}
          games
        </p>
      </div>

      {/* PRODUCTS */}
      <section className="mt-4">
        {loading ? (
          <div className="glass flex min-h-[350px] items-center justify-center rounded-2xl">
            <div className="text-center">
              <RefreshCw
                size={35}
                className="mx-auto animate-spin text-lime-400"
              />

              <p className="mt-4 text-sm text-zinc-500">Loading products...</p>
            </div>
          </div>
        ) : filteredGames.length === 0 ? (
          <div className="glass rounded-2xl p-12 text-center">
            <Package size={45} className="mx-auto text-zinc-600" />

            <h2 className="mt-5 text-xl font-bold">No games found</h2>

            <p className="mt-2 text-sm text-zinc-500">
              Try another search or add a new game.
            </p>

            <button
              onClick={openAddModal}
              className="mt-6 rounded-xl bg-lime-400 px-5 py-3 font-semibold text-black"
            >
              Add Your First Game
            </button>
          </div>
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
            {filteredGames.map((game) => (
              <ProductCard
                key={game._id}
                game={game}
                onEdit={openEditModal}
                onDelete={handleDelete}
                deleting={deleting === game._id}
              />
            ))}
          </div>
        )}
      </section>

      {/* MODAL */}
      {showModal && (
        <GameModal
          form={form}
          editingGame={editingGame}
          saving={saving}
          error={error}
          success={success}
          onChange={handleChange}
          onSubmit={handleSubmit}
          onClose={closeModal}
        />
      )}
    </main>
  );
}

/* ============================================================
   PRODUCT CARD
============================================================ */

function ProductCard({ game, onEdit, onDelete, deleting }) {
  const stock = Number(game.stock || 0);

  const image =
    game.image ||
    game.imageUrl ||
    "https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=900&q=80";

  return (
    <article className="group overflow-hidden rounded-2xl border border-white/10 bg-[#111116] transition duration-300 hover:-translate-y-1 hover:border-lime-400/30">
      {/* IMAGE */}
      <div className="relative h-48 overflow-hidden">
        <img
          src={image}
          alt={game.title}
          className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
          onError={(event) => {
            event.currentTarget.src =
              "https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=900&q=80";
          }}
        />

        <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent" />

        <div className="absolute left-3 top-3 rounded-lg bg-black/70 px-3 py-1.5 text-xs font-semibold backdrop-blur">
          {game.genre || "Game"}
        </div>

        {game.discount > 0 && (
          <div className="absolute right-3 top-3 rounded-lg bg-lime-400 px-3 py-1.5 text-xs font-bold text-black">
            -{game.discount}%
          </div>
        )}
      </div>

      {/* CONTENT */}
      <div className="p-5">
        <h2 className="truncate text-lg font-bold">{game.title}</h2>

        <p className="mt-1 text-xs text-zinc-500">
          {Array.isArray(game.platform)
            ? game.platform.join(" · ")
            : game.platform || "PC"}
        </p>

        <div className="mt-5 flex items-end justify-between">
          <div>
            <p className="text-xs text-zinc-500">Price</p>

            <p className="mt-1 text-lg font-bold text-lime-400">
              ₹{Number(game.price || 0).toLocaleString("en-IN")}
            </p>
          </div>

          <div className="text-right">
            <p className="text-xs text-zinc-500">Rating</p>

            <p className="mt-1 text-sm font-semibold">
              ⭐ {game.rating || "N/A"}
            </p>
          </div>
        </div>

        {/* STOCK */}
        <div className="mt-4 flex items-center justify-between border-t border-white/5 pt-4">
          <span
            className={
              stock <= 0
                ? "text-xs font-semibold text-red-400"
                : stock < 5
                  ? "text-xs font-semibold text-yellow-400"
                  : "text-xs font-semibold text-lime-400"
            }
          >
            {stock <= 0
              ? "OUT OF STOCK"
              : stock < 5
                ? `LOW STOCK · ${stock}`
                : `${stock} units available`}
          </span>
        </div>

        {/* ACTIONS */}
        <div className="mt-4 grid grid-cols-2 gap-2">
          <button
            onClick={() => onEdit(game)}
            className="flex items-center justify-center gap-2 rounded-xl border border-white/10 py-2.5 text-sm transition hover:bg-white/5"
          >
            <Pencil size={15} />
            Edit
          </button>

          <button
            onClick={() => onDelete(game)}
            disabled={deleting}
            className="flex items-center justify-center gap-2 rounded-xl bg-red-500/10 py-2.5 text-sm text-red-300 transition hover:bg-red-500/20 disabled:opacity-50"
          >
            {deleting ? (
              <RefreshCw size={15} className="animate-spin" />
            ) : (
              <Trash2 size={15} />
            )}
            Delete
          </button>
        </div>
      </div>
    </article>
  );
}

/* ============================================================
   GAME MODAL
============================================================ */

function GameModal({
  form,
  editingGame,
  saving,
  error,
  success,
  onChange,
  onSubmit,
  onClose,
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm">
      <div className="max-h-[92vh] w-full max-w-3xl overflow-y-auto rounded-2xl border border-white/10 bg-[#101014] shadow-2xl">
        {/* HEADER */}
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-white/10 bg-[#101014]/95 p-5 backdrop-blur">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.25em] text-lime-400">
              {editingGame ? "Edit Product" : "New Product"}
            </p>

            <h2 className="mt-1 text-2xl font-bold">
              {editingGame ? "Edit Game" : "Add New Game"}
            </h2>
          </div>

          <button
            onClick={onClose}
            className="rounded-xl p-2 text-zinc-400 transition hover:bg-white/5 hover:text-white"
          >
            <X size={21} />
          </button>
        </div>

        {/* FORM */}
        <form onSubmit={onSubmit} className="space-y-6 p-6">
          {error && (
            <div className="rounded-xl border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-300">
              {error}
            </div>
          )}

          {success && (
            <div className="rounded-xl border border-lime-400/20 bg-lime-400/10 p-4 text-sm text-lime-300">
              {success}
            </div>
          )}

          {/* BASIC INFORMATION */}
          <FormSection title="Basic Information">
            <div className="grid gap-4 md:grid-cols-2">
              <Field
                label="Game Title *"
                name="title"
                value={form.title}
                onChange={onChange}
                placeholder="Cyberpunk 2077"
              />

              <Field
                label="Genre"
                name="genre"
                value={form.genre}
                onChange={onChange}
                placeholder="Action RPG"
              />

              <Field
                label="Platform"
                name="platform"
                value={form.platform}
                onChange={onChange}
                placeholder="PC, PlayStation, Xbox"
              />

              <Field
                label="Image URL"
                name="image"
                value={form.image}
                onChange={onChange}
                placeholder="https://..."
              />
            </div>

            <div className="mt-4">
              <label className="text-sm font-medium text-zinc-300">
                Description
              </label>

              <textarea
                name="description"
                value={form.description}
                onChange={onChange}
                rows={4}
                placeholder="Describe the game..."
                className="input mt-2 w-full resize-none"
              />
            </div>
          </FormSection>

          {/* PRICING */}
          <FormSection title="Pricing & Inventory">
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <Field
                label="Price (₹)"
                name="price"
                type="number"
                min="0"
                value={form.price}
                onChange={onChange}
                placeholder="2999"
              />

              <Field
                label="Stock"
                name="stock"
                type="number"
                min="0"
                value={form.stock}
                onChange={onChange}
                placeholder="25"
              />

              <Field
                label="Rating"
                name="rating"
                type="number"
                min="0"
                max="5"
                step="0.1"
                value={form.rating}
                onChange={onChange}
                placeholder="4.5"
              />

              <Field
                label="Discount %"
                name="discount"
                type="number"
                min="0"
                max="100"
                value={form.discount}
                onChange={onChange}
                placeholder="20"
              />
            </div>
          </FormSection>

          {/* SYSTEM REQUIREMENTS */}
          <FormSection title="PC Requirements">
            <div className="grid gap-4 md:grid-cols-2">
              <Field
                label="CPU"
                name="cpu"
                value={form.cpu}
                onChange={onChange}
                placeholder="Intel Core i5-8400"
              />

              <Field
                label="GPU"
                name="gpu"
                value={form.gpu}
                onChange={onChange}
                placeholder="NVIDIA GTX 1060"
              />

              <Field
                label="RAM (GB)"
                name="ram"
                type="number"
                min="0"
                value={form.ram}
                onChange={onChange}
                placeholder="16"
              />

              <Field
                label="Storage (GB)"
                name="storage"
                type="number"
                min="0"
                value={form.storage}
                onChange={onChange}
                placeholder="70"
              />
            </div>
          </FormSection>

          {/* BUTTONS */}
          <div className="flex flex-col-reverse gap-3 border-t border-white/10 pt-5 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={onClose}
              disabled={saving}
              className="rounded-xl border border-white/10 px-6 py-3 text-sm transition hover:bg-white/5 disabled:opacity-50"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={saving}
              className="flex items-center justify-center gap-2 rounded-xl bg-lime-400 px-6 py-3 text-sm font-bold text-black transition hover:bg-lime-300 disabled:opacity-50"
            >
              {saving && <RefreshCw size={16} className="animate-spin" />}

              {saving ? "Saving..." : editingGame ? "Update Game" : "Add Game"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

/* ============================================================
   FORM SECTION
============================================================ */

function FormSection({ title, children }) {
  return (
    <section>
      <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-zinc-400">
        {title}
      </h3>

      {children}
    </section>
  );
}

/* ============================================================
   FORM FIELD
============================================================ */

function Field({
  label,
  name,
  type = "text",
  value,
  onChange,
  placeholder,
  min,
  max,
  step,
}) {
  return (
    <label className="block">
      <span className="text-sm font-medium text-zinc-300">{label}</span>

      <input
        name={name}
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        min={min}
        max={max}
        step={step}
        className="input mt-2 w-full"
      />
    </label>
  );
}
