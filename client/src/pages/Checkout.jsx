import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  CheckCircle2,
  CreditCard,
  MapPin,
  Package,
  ShoppingBag,
  Truck,
} from "lucide-react";

import { api } from "../services/api";

export default function Checkout() {
  const nav = useNavigate();

  const cart = JSON.parse(localStorage.getItem("nexora_cart") || "[]");

  const total = cart.reduce(
    (sum, item) => sum + Number(item.price || 0) * Number(item.qty || 1),
    0,
  );

  const [form, setForm] = useState({
    name: "",
    email: "",
    address: "",
    city: "",
    state: "Maharashtra",
    pincode: "",
    paymentMethod: "Demo UPI",
  });

  const [error, setError] = useState("");
  const [placingOrder, setPlacingOrder] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState(false);
  const [orderId, setOrderId] = useState("");

  function updateField(field, value) {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));
  }

  async function submitOrder(event) {
    event.preventDefault();

    if (!cart.length) {
      setError("Your cart is empty.");
      return;
    }

    try {
      setPlacingOrder(true);
      setError("");

      const response = await api.post("/orders", {
        items: cart,
        billing: form,
        paymentMethod: form.paymentMethod,
      });

      /*
       * Get the order ID from the backend response.
       * Different backend implementations may return:
       * response.data._id
       * response.data.order._id
       * response.data.id
       */

      const createdOrder = response?.data?.order || response?.data;

      const createdOrderId = createdOrder?._id || createdOrder?.id || "";

      setOrderId(createdOrderId);

      // Clear cart only after successful order creation.
      localStorage.removeItem("nexora_cart");

      // Show success screen instead of immediately navigating.
      setOrderSuccess(true);
    } catch (err) {
      console.error("Order placement error:", err);

      setError(
        err?.response?.data?.message ||
          "Could not place your order. Please try again.",
      );
    } finally {
      setPlacingOrder(false);
    }
  }

  /* =========================================
     ORDER SUCCESS SCREEN
  ========================================= */

  if (orderSuccess) {
    return (
      <div className="min-h-[80vh] bg-[#050505] px-4 py-12 text-white">
        <div className="mx-auto flex max-w-3xl items-center justify-center">
          <div className="w-full overflow-hidden rounded-3xl border border-lime-400/20 bg-white/[0.03] shadow-2xl">
            {/* SUCCESS HEADER */}

            <div className="border-b border-white/10 px-6 py-10 text-center md:px-10">
              <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-lime-400/10">
                <CheckCircle2 size={52} className="text-lime-400" />
              </div>

              <p className="text-xs font-bold uppercase tracking-[0.35em] text-lime-400">
                NEXORA GAMING
              </p>

              <h1 className="mt-3 text-3xl font-black md:text-4xl">
                Order Placed Successfully!
              </h1>

              <p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-gray-400">
                Your game purchase has been successfully recorded. You can view
                the complete order details from your Orders section.
              </p>
            </div>

            {/* ORDER INFORMATION */}

            <div className="grid gap-4 p-6 md:grid-cols-3 md:p-8">
              <SuccessInfo
                icon={<Package size={20} />}
                title="Order Status"
                value="Confirmed"
              />

              <SuccessInfo
                icon={<CreditCard size={20} />}
                title="Payment"
                value={form.paymentMethod}
              />

              <SuccessInfo
                icon={<ShoppingBag size={20} />}
                title="Amount"
                value={`₹${total.toLocaleString("en-IN")}`}
              />
            </div>

            {/* ORDER ID */}

            {orderId && (
              <div className="mx-6 rounded-2xl border border-white/10 bg-black/30 p-5 text-center md:mx-8">
                <p className="text-xs uppercase tracking-[0.25em] text-gray-500">
                  Order ID
                </p>

                <p className="mt-2 break-all font-mono text-sm font-bold text-lime-400">
                  #{orderId}
                </p>
              </div>
            )}

            {/* DELIVERY MESSAGE */}

            <div className="mx-6 mt-5 rounded-2xl border border-white/10 bg-white/[0.02] p-5 md:mx-8">
              <div className="flex gap-4">
                <div className="rounded-xl bg-lime-400/10 p-3">
                  <Truck size={22} className="text-lime-400" />
                </div>

                <div>
                  <h3 className="font-bold">Your purchase is ready</h3>

                  <p className="mt-1 text-sm leading-6 text-gray-500">
                    Your order has been added to your account. Check your Orders
                    page for the latest status.
                  </p>
                </div>
              </div>
            </div>

            {/* ACTIONS */}

            <div className="flex flex-col gap-3 p-6 md:flex-row md:p-8">
              <Link
                to="/orders"
                className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-lime-400 px-5 py-3 font-bold text-black transition hover:bg-lime-300"
              >
                <Package size={18} />
                View My Orders
              </Link>

              <Link
                to="/store"
                className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/5 px-5 py-3 font-bold text-white transition hover:border-lime-400/40 hover:bg-lime-400/10"
              >
                <ShoppingBag size={18} />
                Continue Shopping
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  /* =========================================
     EMPTY CART
  ========================================= */

  if (!cart.length) {
    return (
      <div className="flex min-h-[70vh] items-center justify-center px-4 text-white">
        <div className="text-center">
          <ShoppingBag size={50} className="mx-auto mb-5 text-gray-600" />

          <h1 className="text-2xl font-bold">No items to checkout</h1>

          <p className="mt-2 text-sm text-gray-500">
            Your cart is currently empty.
          </p>

          <Link
            to="/store"
            className="mt-6 inline-flex items-center gap-2 rounded-xl bg-lime-400 px-5 py-3 font-bold text-black hover:bg-lime-300"
          >
            <ShoppingBag size={18} />
            Browse Games
          </Link>
        </div>
      </div>
    );
  }

  /* =========================================
     CHECKOUT PAGE
  ========================================= */

  return (
    <div className="min-h-screen bg-[#050505] px-4 py-10 text-white md:px-8">
      <div className="mx-auto max-w-6xl">
        {/* HEADER */}

        <div className="mb-8">
          <Link
            to="/cart"
            className="mb-5 inline-flex items-center gap-2 text-sm text-gray-500 transition hover:text-lime-400"
          >
            <ArrowLeft size={16} />
            Back to Cart
          </Link>

          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-lime-400">
            NEXORA CHECKOUT
          </p>

          <h1 className="mt-2 text-4xl font-black">Checkout</h1>

          <p className="mt-2 text-sm text-gray-500">
            Complete your details and place your game order.
          </p>
        </div>

        {/* FORM */}

        <form
          onSubmit={submitOrder}
          className="grid gap-6 md:grid-cols-[1fr_380px]"
        >
          {/* BILLING */}

          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6">
            <div className="mb-6 flex items-center gap-3">
              <div className="rounded-xl bg-lime-400/10 p-3">
                <MapPin size={22} className="text-lime-400" />
              </div>

              <div>
                <h2 className="font-bold">Billing Information</h2>

                <p className="text-xs text-gray-500">
                  Enter your purchase details
                </p>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              {/* NAME */}

              <input
                className="input"
                placeholder="Full name"
                required
                value={form.name}
                onChange={(e) => updateField("name", e.target.value)}
              />

              {/* EMAIL */}

              <input
                className="input"
                placeholder="Email"
                type="email"
                required
                value={form.email}
                onChange={(e) => updateField("email", e.target.value)}
              />

              {/* ADDRESS */}

              <input
                className="input md:col-span-2"
                placeholder="Address"
                required
                value={form.address}
                onChange={(e) => updateField("address", e.target.value)}
              />

              {/* CITY */}

              <input
                className="input"
                placeholder="City"
                required
                value={form.city}
                onChange={(e) => updateField("city", e.target.value)}
              />

              {/* STATE */}

              <input
                className="input"
                placeholder="State"
                required
                value={form.state}
                onChange={(e) => updateField("state", e.target.value)}
              />

              {/* PINCODE */}

              <input
                className="input"
                placeholder="Pincode"
                required
                inputMode="numeric"
                pattern="[0-9]{6}"
                maxLength={6}
                value={form.pincode}
                onChange={(e) =>
                  updateField("pincode", e.target.value.replace(/\D/g, ""))
                }
              />

              {/* PAYMENT */}

              <select
                className="input"
                value={form.paymentMethod}
                onChange={(e) => updateField("paymentMethod", e.target.value)}
              >
                <option>Demo UPI</option>

                <option>Demo Card</option>

                <option>Cash on Delivery</option>
              </select>
            </div>

            {/* ERROR */}

            {error && (
              <div className="mt-5 rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-400">
                {error}
              </div>
            )}
          </div>

          {/* ORDER SUMMARY */}

          <div className="h-fit rounded-2xl border border-white/10 bg-white/[0.03] p-6">
            <div className="mb-5 flex items-center gap-3">
              <div className="rounded-xl bg-lime-400/10 p-3">
                <ShoppingBag size={22} className="text-lime-400" />
              </div>

              <div>
                <h2 className="font-bold">Order Summary</h2>

                <p className="text-xs text-gray-500">
                  {cart.length} item
                  {cart.length !== 1 ? "s" : ""}
                </p>
              </div>
            </div>

            {/* CART ITEMS */}

            <div className="space-y-4">
              {cart.map((item, index) => (
                <div
                  className="flex items-center justify-between gap-4"
                  key={item.game || item._id || item.id || index}
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold">
                      {item.title}
                    </p>

                    <p className="mt-1 text-xs text-gray-500">
                      ₹{Number(item.price || 0).toLocaleString("en-IN")} ×{" "}
                      {item.qty || 1}
                    </p>
                  </div>

                  <p className="shrink-0 text-sm font-semibold">
                    ₹
                    {(
                      Number(item.price || 0) * Number(item.qty || 1)
                    ).toLocaleString("en-IN")}
                  </p>
                </div>
              ))}
            </div>

            {/* TOTAL */}

            <div className="mt-6 border-t border-white/10 pt-5">
              <div className="flex items-center justify-between">
                <span className="text-gray-400">Total</span>

                <strong className="text-2xl font-black text-lime-400">
                  ₹{total.toLocaleString("en-IN")}
                </strong>
              </div>

              <button
                type="submit"
                disabled={placingOrder}
                className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-lime-400 px-5 py-3 font-bold text-black transition hover:bg-lime-300 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {placingOrder ? (
                  <>
                    <RefreshIcon />
                    Placing Order...
                  </>
                ) : (
                  <>
                    <CheckCircle2 size={18} />
                    Place Demo Order
                  </>
                )}
              </button>

              <p className="mt-3 text-center text-[11px] text-gray-600">
                This is a demo payment system for the NEXORA project.
              </p>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

/* =========================================
   SUCCESS INFO
========================================= */

function SuccessInfo({ icon, title, value }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
      <div className="mb-3 text-lime-400">{icon}</div>

      <p className="text-xs text-gray-500">{title}</p>

      <p className="mt-1 truncate text-sm font-bold">{value}</p>
    </div>
  );
}

/* =========================================
   LOADING ICON
========================================= */

function RefreshIcon() {
  return (
    <svg className="h-5 w-5 animate-spin" viewBox="0 0 24 24" fill="none">
      <circle
        cx="12"
        cy="12"
        r="9"
        stroke="currentColor"
        strokeWidth="3"
        opacity="0.25"
      />

      <path
        d="M21 12a9 9 0 0 0-9-9"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
      />
    </svg>
  );
}
