import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowLeft,
  Package,
  ShoppingBag,
  Clock,
  CheckCircle2,
  Gamepad2,
  XCircle,
  RefreshCw,
  Circle,
  FileText,
  Eye,
  Printer,
  MapPin,
  CreditCard,
  CalendarDays,
  ChevronDown,
  ChevronUp,
  Trash2,
} from "lucide-react";
import { api } from "../services/api";

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [expandedOrder, setExpandedOrder] = useState(null);
  const [cancelOrderId, setCancelOrderId] = useState(null);
  const [cancellingOrderId, setCancellingOrderId] = useState(null);
  const [removingOrderId, setRemovingOrderId] = useState(null);

  const loadOrders = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get("/orders/mine");
      const data = response?.data;

      if (Array.isArray(data)) {
        setOrders(data);
      } else if (Array.isArray(data?.orders)) {
        setOrders(data.orders);
      } else {
        setOrders([]);
      }
    } catch (err) {
      console.error("Failed to load orders:", err);

      setError(
        err.response?.data?.message ||
          "Unable to load your orders. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOrders();
  }, []);

  // ==========================================
  // STATUS HELPERS
  // ==========================================

  const normalizeStatus = (status) => {
    const value = String(status || "").toLowerCase();

    if (value === "cancelled" || value === "canceled") {
      return "cancelled";
    }

    if (value === "completed" || value === "delivered") {
      return "completed";
    }

    if (value === "activated") {
      return "activated";
    }

    if (value === "confirmed") {
      return "confirmed";
    }

    return "processing";
  };

  const getStatusIcon = (status) => {
    const value = normalizeStatus(status);

    if (value === "completed") {
      return <CheckCircle2 size={18} />;
    }

    if (value === "activated") {
      return <Gamepad2 size={18} />;
    }

    if (value === "cancelled") {
      return <XCircle size={18} />;
    }

    if (value === "confirmed") {
      return <CheckCircle2 size={18} />;
    }

    if (value === "processing") {
      return <Package size={18} />;
    }

    return <Clock size={18} />;
  };

  const getStatusClass = (status) => {
    const value = normalizeStatus(status);

    if (value === "completed") {
      return "bg-emerald-500/10 text-emerald-400 border-emerald-500/20";
    }

    if (value === "activated") {
      return "bg-purple-500/10 text-purple-400 border-purple-500/20";
    }

    if (value === "cancelled") {
      return "bg-red-500/10 text-red-400 border-red-500/20";
    }

    if (value === "confirmed") {
      return "bg-cyan-500/10 text-cyan-400 border-cyan-500/20";
    }

    if (value === "processing") {
      return "bg-yellow-500/10 text-yellow-400 border-yellow-500/20";
    }

    return "bg-zinc-500/10 text-zinc-300 border-zinc-500/20";
  };

  // ==========================================
  // ORDER TIMELINE
  // ==========================================

  const timelineSteps = [
    {
      key: "processing",
      title: "Order Placed",
      description: "Your order has been received.",
      icon: Package,
    },
    {
      key: "confirmed",
      title: "Confirmed",
      description: "Your order has been confirmed.",
      icon: CheckCircle2,
    },
    {
      key: "activated",
      title: "Activated",
      description: "Your game has been activated in your library.",
      icon: Gamepad2,
    },
    {
      key: "completed",
      title: "Completed",
      description: "Your order has been completed.",
      icon: CheckCircle2,
    },
  ];

  const getTimelineIndex = (status) => {
    const value = normalizeStatus(status);

    if (value === "processing") return 0;
    if (value === "confirmed") return 1;
    if (value === "activated") return 2;
    if (value === "completed") return 3;

    return 0;
  };

  const renderTimeline = (status) => {
    const normalizedStatus = normalizeStatus(status);

    if (normalizedStatus === "cancelled") {
      return (
        <div className="border-t border-white/10 px-5 py-6">
          <div className="rounded-2xl border border-red-500/20 bg-red-500/[0.04] p-5">
            <div className="flex items-center gap-4">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-red-500/30 bg-red-500/10 text-red-400">
                <XCircle size={22} />
              </div>

              <div>
                <p className="font-semibold text-red-400">
                  Order Cancelled
                </p>

                <p className="mt-1 text-sm text-zinc-500">
                  This order has been cancelled and the inventory has been
                  restored.
                </p>
              </div>
            </div>
          </div>
        </div>
      );
    }

    const currentIndex = getTimelineIndex(normalizedStatus);

    return (
      <div className="border-t border-white/10 px-5 py-6">
        <div className="mb-5 flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-lime-400">
              Order Progress
            </p>

            <h3 className="mt-1 text-sm font-semibold text-white">
              Track your purchase
            </h3>
          </div>

          <span className="text-xs text-zinc-500">
            Step {currentIndex + 1} of {timelineSteps.length}
          </span>
        </div>

        {/* Desktop Timeline */}
        <div className="hidden md:block">
          <div className="relative">
            <div className="absolute left-[7%] right-[7%] top-6 h-[2px] bg-white/10" />

            <div
              className="absolute left-[7%] top-6 h-[2px] bg-lime-400 transition-all duration-700"
              style={{
                width:
                  currentIndex === 0
                    ? "0%"
                    : `${(currentIndex / (timelineSteps.length - 1)) * 86}%`,
              }}
            />

            <div className="relative grid grid-cols-4">
              {timelineSteps.map((step, index) => {
                const Icon = step.icon;
                const completed = index <= currentIndex;
                const active = index === currentIndex;

                return (
                  <div
                    key={step.key}
                    className="flex flex-col items-center text-center"
                  >
                    <div
                      className={`relative z-10 flex h-12 w-12 items-center justify-center rounded-full border transition-all duration-500 ${
                        completed
                          ? "border-lime-400 bg-lime-400 text-black shadow-[0_0_25px_rgba(163,230,53,0.25)]"
                          : "border-white/10 bg-zinc-900 text-zinc-600"
                      } ${
                        active
                          ? "scale-110 ring-4 ring-lime-400/10"
                          : ""
                      }`}
                    >
                      {completed ? (
                        <Icon size={19} />
                      ) : (
                        <Circle size={15} />
                      )}
                    </div>

                    <p
                      className={`mt-3 text-sm font-semibold ${
                        completed ? "text-white" : "text-zinc-600"
                      }`}
                    >
                      {step.title}
                    </p>

                    <p className="mt-1 max-w-[150px] text-xs text-zinc-600">
                      {step.description}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Mobile Timeline */}
        <div className="md:hidden">
          <div className="space-y-0">
            {timelineSteps.map((step, index) => {
              const Icon = step.icon;
              const completed = index <= currentIndex;
              const active = index === currentIndex;
              const isLast = index === timelineSteps.length - 1;

              return (
                <div key={step.key} className="flex gap-4">
                  <div className="flex flex-col items-center">
                    <div
                      className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full border transition-all ${
                        completed
                          ? "border-lime-400 bg-lime-400 text-black"
                          : "border-white/10 bg-zinc-900 text-zinc-600"
                      } ${
                        active
                          ? "ring-4 ring-lime-400/10"
                          : ""
                      }`}
                    >
                      {completed ? (
                        <Icon size={17} />
                      ) : (
                        <Circle size={13} />
                      )}
                    </div>

                    {!isLast && (
                      <div
                        className={`min-h-12 w-[2px] ${
                          index < currentIndex
                            ? "bg-lime-400"
                            : "bg-white/10"
                        }`}
                      />
                    )}
                  </div>

                  <div className="pb-6">
                    <p
                      className={`text-sm font-semibold ${
                        completed ? "text-white" : "text-zinc-600"
                      }`}
                    >
                      {step.title}
                    </p>

                    <p className="mt-1 text-xs text-zinc-500">
                      {step.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  };

  // ==========================================
  // HELPERS
  // ==========================================

  const formatDate = (date) => {
    if (!date) return "Date unavailable";

    try {
      return new Date(date).toLocaleString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return "Date unavailable";
    }
  };

  const getOrderId = (order) => {
    return order?._id || order?.id || order?.orderId || "N/A";
  };

  const getOrderTotal = (order) => {
    return Number(
      order.total ||
        order.amount ||
        (order.items || []).reduce(
          (sum, item) =>
            sum +
            Number(item.price || 0) * Number(item.qty || 1),
          0,
        ),
    );
  };

  const canCustomerCancel = (status) => {
    const value = normalizeStatus(status);
    return value === "processing" || value === "confirmed";
  };

  const cancelCustomerOrder = async () => {
    if (!cancelOrderId || cancellingOrderId) return;

    try {
      setCancellingOrderId(cancelOrderId);
      setError("");

      await api.post(`/orders/${cancelOrderId}/cancel`);

      setCancelOrderId(null);
      setExpandedOrder(null);
      await loadOrders();
    } catch (err) {
      console.error("Failed to cancel order:", err);
      setError(
        err.response?.data?.message ||
          "Unable to cancel this order. Please try again.",
      );
    } finally {
      setCancellingOrderId(null);
    }
  };

  const toggleDetails = (orderId) => {
    setExpandedOrder((current) =>
      current === orderId ? null : orderId,
    );
  };

  const removeCancelledOrder = async (order) => {
    const orderId = getOrderId(order);

    if (orderId === "N/A" || normalizeStatus(order?.status) !== "cancelled") {
      return;
    }

    const confirmed = window.confirm(
      "Remove this cancelled order from your order list? This only removes the order from your history."
    );

    if (!confirmed) return;

    try {
      setRemovingOrderId(orderId);
      setError("");

      await api.delete(`/orders/${orderId}`);

      setOrders((current) =>
        current.filter((item) => getOrderId(item) !== orderId),
      );
      setExpandedOrder(null);
    } catch (err) {
      console.error("Failed to remove cancelled order:", err);
      setError(
        err.response?.data?.message ||
          "Unable to remove this cancelled order. Please try again.",
      );
    } finally {
      setRemovingOrderId(null);
    }
  };

  // ==========================================
  // PRINT INVOICE
  // ==========================================

  const printInvoice = (order) => {
    const orderId = getOrderId(order);
    const total = getOrderTotal(order);

    const billing = order.billing || {};

    const items = (order.items || [])
      .map(
        (item) => `
          <tr>
            <td>${item.title || "Game"}</td>
            <td>${item.qty || 1}</td>
            <td>₹${Number(item.price || 0).toLocaleString("en-IN")}</td>
            <td>₹${(
              Number(item.price || 0) * Number(item.qty || 1)
            ).toLocaleString("en-IN")}</td>
          </tr>
        `,
      )
      .join("");

    const invoiceWindow = window.open(
      "",
      "_blank",
      "width=900,height=700",
    );

    if (!invoiceWindow) {
      alert("Please allow pop-ups to print the invoice.");
      return;
    }

    invoiceWindow.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>NEXORA Invoice - ${orderId}</title>

        <style>
          * {
            box-sizing: border-box;
          }

          body {
            font-family: Arial, sans-serif;
            margin: 0;
            padding: 40px;
            color: #18181b;
            background: #ffffff;
          }

          .invoice {
            max-width: 850px;
            margin: auto;
          }

          .header {
            display: flex;
            justify-content: space-between;
            border-bottom: 2px solid #18181b;
            padding-bottom: 25px;
            margin-bottom: 30px;
          }

          .brand {
            font-size: 28px;
            font-weight: 800;
            letter-spacing: 2px;
          }

          .invoice-title {
            text-align: right;
          }

          .invoice-title h1 {
            margin: 0;
            font-size: 28px;
          }

          .muted {
            color: #71717a;
            font-size: 13px;
          }

          .grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 30px;
            margin-bottom: 30px;
          }

          .box h3 {
            margin-bottom: 8px;
            font-size: 13px;
            text-transform: uppercase;
          }

          .box p {
            margin: 4px 0;
          }

          table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 20px;
          }

          th {
            text-align: left;
            background: #f4f4f5;
            padding: 12px;
            font-size: 13px;
          }

          td {
            padding: 12px;
            border-bottom: 1px solid #e4e4e7;
            font-size: 14px;
          }

          .total {
            margin-top: 25px;
            margin-left: auto;
            width: 280px;
          }

          .total-row {
            display: flex;
            justify-content: space-between;
            padding: 7px 0;
          }

          .grand {
            border-top: 2px solid #18181b;
            margin-top: 8px;
            padding-top: 12px;
            font-size: 20px;
            font-weight: 800;
          }

          .footer {
            margin-top: 50px;
            border-top: 1px solid #e4e4e7;
            padding-top: 20px;
            text-align: center;
            color: #71717a;
            font-size: 12px;
          }

          @media print {
            body {
              padding: 20px;
            }
          }
        </style>
      </head>

      <body>
        <div class="invoice">

          <div class="header">
            <div>
              <div class="brand">NEXORA</div>
              <div class="muted">Gaming Marketplace</div>
            </div>

            <div class="invoice-title">
              <h1>INVOICE</h1>
              <div class="muted">Order #${orderId}</div>
              <div class="muted">${formatDate(order.createdAt)}</div>
            </div>
          </div>

          <div class="grid">

            <div class="box">
              <h3>Billing Information</h3>
              <p><strong>${billing.name || "Customer"}</strong></p>
              <p>${billing.email || "N/A"}</p>
              <p>${billing.address || "N/A"}</p>
              <p>
                ${billing.city || ""}
                ${billing.state || ""}
                ${billing.pincode || ""}
              </p>
            </div>

            <div class="box">
              <h3>Payment Information</h3>
              <p>
                <strong>Method:</strong>
                ${order.paymentMethod || "Demo Payment"}
              </p>

              <p>
                <strong>Status:</strong>
                ${order.status || "Processing"}
              </p>
            </div>

          </div>

          <table>
            <thead>
              <tr>
                <th>Game</th>
                <th>Qty</th>
                <th>Price</th>
                <th>Total</th>
              </tr>
            </thead>

            <tbody>
              ${items}
            </tbody>
          </table>

          <div class="total">
            <div class="total-row">
              <span>Subtotal</span>
              <strong>₹${total.toLocaleString("en-IN")}</strong>
            </div>

            <div class="total-row">
              <span>Tax</span>
              <strong>Included</strong>
            </div>

            <div class="total-row grand">
              <span>Grand Total</span>
              <strong>₹${total.toLocaleString("en-IN")}</strong>
            </div>
          </div>

          <div class="footer">
            Thank you for shopping with NEXORA.<br />
            This is a computer-generated invoice.
          </div>

        </div>

        <script>
          window.onload = function() {
            window.print();
          };
        </script>

      </body>
      </html>
    `);

    invoiceWindow.document.close();
  };

  // ==========================================
  // LOADING
  // ==========================================

  if (loading) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-20">
        <div className="glass rounded-2xl p-12 text-center">
          <RefreshCw
            size={34}
            className="mx-auto animate-spin text-lime-400"
          />

          <h2 className="mt-5 text-xl font-semibold">
            Loading your orders...
          </h2>

          <p className="mt-2 text-sm text-zinc-400">
            Please wait while we fetch your order history.
          </p>
        </div>
      </div>
    );
  }

  // ==========================================
  // ERROR
  // ==========================================

  if (error) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-12">
        <Link
          to="/"
          className="mb-6 inline-flex items-center gap-2 text-sm text-zinc-400 transition hover:text-white"
        >
          <ArrowLeft size={17} />
          Back to Home
        </Link>

        <div className="glass rounded-2xl p-12 text-center">
          <XCircle size={42} className="mx-auto text-red-400" />

          <h1 className="mt-5 text-2xl font-bold">
            Could not load orders
          </h1>

          <p className="mx-auto mt-3 max-w-md text-zinc-400">
            {error}
          </p>

          <button
            onClick={loadOrders}
            className="btn btn-primary mt-6 inline-flex items-center gap-2"
          >
            <RefreshCw size={17} />
            Try Again
          </button>
        </div>
      </div>
    );
  }

  // ==========================================
  // MAIN PAGE
  // ==========================================

  return (
    <div className="mx-auto max-w-6xl px-4 py-12">
      {/* Header */}
      <div className="flex flex-col justify-between gap-5 md:flex-row md:items-center">
        <div>
          <Link
            to="/"
            className="mb-4 inline-flex items-center gap-2 text-sm text-zinc-400 transition hover:text-white"
          >
            <ArrowLeft size={17} />
            Back to Store
          </Link>

          <h1 className="font-display text-4xl font-bold">
            My Orders
          </h1>

          <p className="mt-2 text-zinc-400">
            Track and view all your NEXORA purchases.
          </p>
        </div>

        <button
          onClick={loadOrders}
          className="btn inline-flex items-center justify-center gap-2"
        >
          <RefreshCw size={17} />
          Refresh
        </button>
      </div>

      {/* Empty State */}
      {orders.length === 0 ? (
        <div className="glass mt-10 rounded-2xl p-14 text-center">
          <ShoppingBag
            size={52}
            className="mx-auto text-zinc-600"
          />

          <h2 className="mt-6 text-2xl font-bold">
            No orders yet
          </h2>

          <p className="mx-auto mt-3 max-w-md text-zinc-400">
            You haven't purchased any games yet. Explore the NEXORA
            store and start building your gaming library.
          </p>

          <Link
            to="/store"
            className="btn btn-primary mt-7 inline-flex items-center gap-2"
          >
            <ShoppingBag size={18} />
            Browse Games
          </Link>
        </div>
      ) : (
        <div className="mt-10 space-y-5">
          {orders.map((order, index) => {
            const orderId = getOrderId(order);
            const total = getOrderTotal(order);
            const isExpanded = expandedOrder === orderId;
            const billing = order.billing || {};

            return (
              <div
                key={orderId !== "N/A" ? orderId : index}
                className="glass overflow-hidden rounded-2xl"
              >
                {/* Order Header */}
                <div className="flex flex-col gap-4 border-b border-white/10 p-5 md:flex-row md:items-center md:justify-between">
                  <div>
                    <p className="text-xs uppercase tracking-wider text-zinc-500">
                      Order ID
                    </p>

                    <p className="mt-1 break-all font-mono text-sm text-zinc-200">
                      {orderId}
                    </p>

                    <p className="mt-2 text-sm text-zinc-500">
                      {formatDate(order.createdAt)}
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center gap-3">
                    <span
                      className={`inline-flex items-center gap-2 rounded-full border px-3 py-2 text-xs font-medium ${getStatusClass(
                        order.status,
                      )}`}
                    >
                      {getStatusIcon(order.status)}
                      {order.status || "Processing"}
                    </span>

                    <span className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm">
                      {order.paymentMethod || "Demo Payment"}
                    </span>
                  </div>
                </div>

                {/* Status Timeline */}
                {renderTimeline(order.status)}

                {/* Products */}
                <div className="border-t border-white/10 p-5">
                  <div className="mb-4 flex items-center gap-2">
                    <ShoppingBag
                      size={17}
                      className="text-lime-400"
                    />

                    <h3 className="font-semibold">
                      Purchased Games
                    </h3>
                  </div>

                  <div className="space-y-4">
                    {(order.items || []).map((item, itemIndex) => (
                      <div
                        key={`${item.game || item._id || itemIndex}`}
                        className="flex items-center gap-4 rounded-xl border border-white/5 bg-white/[0.02] p-3"
                      >
                        <div className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-zinc-900">
                          {item.image ? (
                            <img
                              src={item.image}
                              alt={item.title || "Game"}
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            <Package
                              size={24}
                              className="text-zinc-600"
                            />
                          )}
                        </div>

                        <div className="min-w-0 flex-1">
                          <h3 className="truncate font-semibold">
                            {item.title || "Game"}
                          </h3>

                          <p className="mt-1 text-sm text-zinc-500">
                            Quantity: {item.qty || 1}
                          </p>
                        </div>

                        <div className="text-right">
                          <p className="font-semibold">
                            ₹
                            {(
                              Number(item.price || 0) *
                              Number(item.qty || 1)
                            ).toLocaleString("en-IN")}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Total + Details */}
                  <div className="mt-5 flex flex-col gap-4 border-t border-white/10 pt-5 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <span className="text-zinc-400">
                        Order Total
                      </span>

                      <strong className="ml-4 text-2xl text-lime-400">
                        ₹{total.toLocaleString("en-IN")}
                      </strong>
                    </div>

                    {canCustomerCancel(order.status) && (
                      <button
                        type="button"
                        onClick={() => setCancelOrderId(orderId)}
                        disabled={cancellingOrderId === orderId}
                        className="inline-flex items-center justify-center gap-2 rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-2 text-sm font-semibold text-red-400 transition hover:bg-red-500/20 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        <XCircle size={17} />
                        Cancel Order
                      </button>
                    )}

                    {normalizeStatus(order.status) === "cancelled" && (
                      <button
                        type="button"
                        onClick={() => removeCancelledOrder(order)}
                        disabled={removingOrderId === orderId}
                        className="inline-flex items-center justify-center gap-2 rounded-lg border border-red-500/25 bg-red-500/10 px-4 py-2 text-sm font-semibold text-red-400 transition hover:bg-red-500/15 hover:text-red-300 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        <Trash2 size={17} />
                        {removingOrderId === orderId ? "Removing..." : "Remove Order"}
                      </button>
                    )}

                    <button
                      onClick={() => toggleDetails(orderId)}
                      className="btn inline-flex items-center justify-center gap-2"
                    >
                      {isExpanded ? (
                        <>
                          <ChevronUp size={17} />
                          Hide Details
                        </>
                      ) : (
                        <>
                          <Eye size={17} />
                          View Details
                        </>
                      )}
                    </button>
                  </div>
                </div>

                {/* ======================================
                    ORDER DETAILS / INVOICE
                ====================================== */}

                {isExpanded && (
                  <div className="border-t border-white/10 bg-black/20 p-5">
                    {/* Details Header */}
                    <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                      <div>
                        <div className="flex items-center gap-2">
                          <FileText
                            size={19}
                            className="text-lime-400"
                          />

                          <h2 className="text-lg font-bold">
                            Order Details
                          </h2>
                        </div>

                        <p className="mt-1 text-sm text-zinc-500">
                          Complete invoice information for this purchase.
                        </p>
                      </div>

                      <div className="flex flex-wrap gap-3">
                        {normalizeStatus(order.status) === "cancelled" && (
                          <button
                            type="button"
                            onClick={() => removeCancelledOrder(order)}
                            disabled={removingOrderId === orderId}
                            className="inline-flex items-center justify-center gap-2 rounded-lg border border-red-500/25 bg-red-500/10 px-4 py-2 text-sm font-semibold text-red-400 transition hover:bg-red-500/15 hover:text-red-300 disabled:cursor-not-allowed disabled:opacity-50"
                          >
                            <Trash2 size={17} />
                            {removingOrderId === orderId ? "Removing..." : "Remove Cancelled Order"}
                          </button>
                        )}

                        <button
                          onClick={() => printInvoice(order)}
                          className="btn btn-primary inline-flex items-center justify-center gap-2"
                        >
                          <Printer size={17} />
                          Print Invoice
                        </button>
                      </div>
                    </div>

                    {/* Information Cards */}
                    <div className="grid gap-4 md:grid-cols-3">
                      {/* Order Info */}
                      <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-4">
                        <div className="flex items-center gap-2 text-lime-400">
                          <CalendarDays size={17} />
                          <span className="text-xs font-semibold uppercase tracking-wider">
                            Order Information
                          </span>
                        </div>

                        <div className="mt-4 space-y-3">
                          <div>
                            <p className="text-xs text-zinc-600">
                              Order ID
                            </p>

                            <p className="mt-1 break-all font-mono text-xs text-zinc-300">
                              {orderId}
                            </p>
                          </div>

                          <div>
                            <p className="text-xs text-zinc-600">
                              Date
                            </p>

                            <p className="mt-1 text-sm text-zinc-300">
                              {formatDate(order.createdAt)}
                            </p>
                          </div>

                          <div>
                            <p className="text-xs text-zinc-600">
                              Status
                            </p>

                            <span
                              className={`mt-1 inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs ${getStatusClass(
                                order.status,
                              )}`}
                            >
                              {getStatusIcon(order.status)}
                              {order.status || "Processing"}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Payment */}
                      <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-4">
                        <div className="flex items-center gap-2 text-lime-400">
                          <CreditCard size={17} />

                          <span className="text-xs font-semibold uppercase tracking-wider">
                            Payment
                          </span>
                        </div>

                        <div className="mt-4 space-y-3">
                          <div>
                            <p className="text-xs text-zinc-600">
                              Payment Method
                            </p>

                            <p className="mt-1 text-sm text-zinc-300">
                              {order.paymentMethod ||
                                "Demo Payment"}
                            </p>
                          </div>

                          <div>
                            <p className="text-xs text-zinc-600">
                              Payment Status
                            </p>

                            <p
                              className={`mt-1 text-sm font-semibold ${
                                normalizeStatus(order.status) ===
                                "cancelled"
                                  ? "text-red-400"
                                  : "text-emerald-400"
                              }`}
                            >
                              {normalizeStatus(order.status) ===
                              "cancelled"
                                ? "Cancelled"
                                : "Processed"}
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Billing */}
                      <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-4">
                        <div className="flex items-center gap-2 text-lime-400">
                          <MapPin size={17} />

                          <span className="text-xs font-semibold uppercase tracking-wider">
                            Billing Address
                          </span>
                        </div>

                        <div className="mt-4 text-sm leading-6 text-zinc-300">
                          <p className="font-semibold">
                            {billing.name || "Customer"}
                          </p>

                          <p className="text-zinc-500">
                            {billing.email || "N/A"}
                          </p>

                          <p className="mt-2">
                            {billing.address || "N/A"}
                          </p>

                          <p>
                            {billing.city || ""}
                            {billing.city && billing.state
                              ? ", "
                              : ""}
                            {billing.state || ""}
                          </p>

                          <p>{billing.pincode || ""}</p>
                        </div>
                      </div>
                    </div>

                    {/* Invoice Table */}
                    <div className="mt-6 overflow-hidden rounded-2xl border border-white/10">
                      <div className="border-b border-white/10 bg-white/[0.03] p-4">
                        <h3 className="font-semibold">
                          Invoice Summary
                        </h3>
                      </div>

                      <div className="overflow-x-auto">
                        <table className="w-full min-w-[600px]">
                          <thead>
                            <tr className="border-b border-white/10 text-left text-xs uppercase tracking-wider text-zinc-500">
                              <th className="px-4 py-4">
                                Game
                              </th>

                              <th className="px-4 py-4">
                                Quantity
                              </th>

                              <th className="px-4 py-4">
                                Unit Price
                              </th>

                              <th className="px-4 py-4 text-right">
                                Total
                              </th>
                            </tr>
                          </thead>

                          <tbody>
                            {(order.items || []).map(
                              (item, itemIndex) => (
                                <tr
                                  key={`invoice-${item.game || itemIndex}`}
                                  className="border-b border-white/5"
                                >
                                  <td className="px-4 py-4">
                                    <div className="flex items-center gap-3">
                                      <div className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-zinc-900">
                                        {item.image ? (
                                          <img
                                            src={item.image}
                                            alt={
                                              item.title || "Game"
                                            }
                                            className="h-full w-full object-cover"
                                          />
                                        ) : (
                                          <Package
                                            size={18}
                                            className="text-zinc-600"
                                          />
                                        )}
                                      </div>

                                      <span className="font-medium">
                                        {item.title || "Game"}
                                      </span>
                                    </div>
                                  </td>

                                  <td className="px-4 py-4 text-sm text-zinc-400">
                                    {item.qty || 1}
                                  </td>

                                  <td className="px-4 py-4 text-sm text-zinc-400">
                                    ₹
                                    {Number(
                                      item.price || 0,
                                    ).toLocaleString("en-IN")}
                                  </td>

                                  <td className="px-4 py-4 text-right font-semibold">
                                    ₹
                                    {(
                                      Number(item.price || 0) *
                                      Number(item.qty || 1)
                                    ).toLocaleString("en-IN")}
                                  </td>
                                </tr>
                              ),
                            )}
                          </tbody>
                        </table>
                      </div>

                      {/* Invoice Total */}
                      <div className="flex justify-end border-t border-white/10 p-5">
                        <div className="w-full max-w-sm space-y-3">
                          <div className="flex justify-between text-sm text-zinc-500">
                            <span>Subtotal</span>
                            <span>
                              ₹{total.toLocaleString("en-IN")}
                            </span>
                          </div>

                          <div className="flex justify-between text-sm text-zinc-500">
                            <span>Tax / Charges</span>
                            <span>Included</span>
                          </div>

                          <div className="flex justify-between border-t border-white/10 pt-3 text-lg font-bold">
                            <span>Grand Total</span>

                            <span className="text-lime-400">
                              ₹{total.toLocaleString("en-IN")}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Cancelled Notice */}
                    {normalizeStatus(order.status) ===
                      "cancelled" && (
                      <div className="mt-5 rounded-xl border border-red-500/20 bg-red-500/5 p-4">
                        <div className="flex gap-3">
                          <XCircle
                            size={20}
                            className="shrink-0 text-red-400"
                          />

                          <div>
                            <p className="font-semibold text-red-400">
                              Order Cancelled
                            </p>

                            <p className="mt-1 text-sm text-zinc-500">
                              This order was cancelled by the store.
                              The purchased game stock has been restored
                              to inventory.
                            </p>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Invoice Footer */}
                    <div className="mt-6 flex flex-col gap-3 border-t border-white/10 pt-5 text-xs text-zinc-600 sm:flex-row sm:items-center sm:justify-between">
                      <span>
                        NEXORA Gaming Marketplace
                      </span>

                      <span>
                        Thank you for shopping with NEXORA.
                      </span>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
      {cancelOrderId && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl border border-white/10 bg-[#111114] p-6 shadow-2xl">
            <div className="flex h-12 w-12 items-center justify-center rounded-full border border-red-500/30 bg-red-500/10 text-red-400">
              <XCircle size={24} />
            </div>

            <h2 className="mt-5 text-xl font-bold text-white">
              Cancel this order?
            </h2>

            <p className="mt-2 text-sm leading-6 text-zinc-400">
              Are you sure you want to cancel this order? The purchased game
              stock will be returned to inventory. This action cannot be
              undone.
            </p>

            <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={() => setCancelOrderId(null)}
                disabled={Boolean(cancellingOrderId)}
                className="rounded-lg border border-white/10 bg-white/5 px-5 py-2.5 text-sm font-semibold text-zinc-300 transition hover:bg-white/10 disabled:opacity-50"
              >
                Keep Order
              </button>

              <button
                type="button"
                onClick={cancelCustomerOrder}
                disabled={Boolean(cancellingOrderId)}
                className="inline-flex items-center justify-center gap-2 rounded-lg bg-red-500 px-5 py-2.5 text-sm font-bold text-white transition hover:bg-red-400 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {cancellingOrderId ? (
                  <>
                    <RefreshCw size={17} className="animate-spin" />
                    Cancelling...
                  </>
                ) : (
                  <>
                    <XCircle size={17} />
                    Yes, Cancel Order
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}