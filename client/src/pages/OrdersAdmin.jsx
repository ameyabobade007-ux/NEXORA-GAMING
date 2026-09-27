import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";

import {
  ArrowLeft,
  CalendarDays,
  CheckCircle2,
  Clock3,
  Eye,
  Gamepad2,
  Package,
  RefreshCw,
  Search,
  ShoppingCart,
  XCircle,
  Trash2,
} from "lucide-react";

import { api } from "../services/api";

const STATUSES = [
  "Processing",
  "Confirmed",
  "Activated",
  "Completed",
  "Cancelled",
];

export default function OrdersAdmin() {
  const [orders, setOrders] = useState([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [updatingId, setUpdatingId] = useState(null);
  const [removingId, setRemovingId] = useState(null);
  const [selectedOrder, setSelectedOrder] = useState(null);

  async function loadOrders() {
    try {
      setLoading(true);
      setError("");

      const response = await api.get("/orders");

      setOrders(
        Array.isArray(response.data)
          ? response.data
          : []
      );
    } catch (err) {
      console.error("Orders error:", err);

      setError(
        err?.response?.data?.message ||
          "Unable to load orders."
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadOrders();
  }, []);

  // =========================================================
  // UPDATE ORDER STATUS
  // =========================================================

  async function updateOrderStatus(orderId, status) {
    try {
      setUpdatingId(orderId);

      await api.put(`/orders/${orderId}`, {
        status,
      });

      setOrders((currentOrders) =>
        currentOrders.map((order) =>
          order._id === orderId
            ? { ...order, status }
            : order
        )
      );

      setSelectedOrder((currentOrder) =>
        currentOrder?._id === orderId
          ? { ...currentOrder, status }
          : currentOrder
      );
    } catch (err) {
      console.error(err);

      alert(
        err?.response?.data?.message ||
          "Unable to update order status."
      );
    } finally {
      setUpdatingId(null);
    }
  }

  // =========================================================
  // REMOVE CANCELLED ORDER - ADMIN
  // =========================================================

  async function removeCancelledOrder(order) {
    if (order.status !== "Cancelled") {
      return;
    }

    const confirmed = window.confirm(
      `Remove cancelled order #${order._id?.slice(
        -8
      )} from Admin Orders?\n\nThis will permanently delete this order from the database.`
    );

    if (!confirmed) {
      return;
    }

    try {
      setRemovingId(order._id);

      await api.delete(
        `/orders/${order._id}/admin-remove`
      );

      setOrders((currentOrders) =>
        currentOrders.filter(
          (item) => item._id !== order._id
        )
      );

      setSelectedOrder((currentOrder) =>
        currentOrder?._id === order._id
          ? null
          : currentOrder
      );
    } catch (err) {
      console.error(
        "Remove order error:",
        err
      );

      alert(
        err?.response?.data?.message ||
          "Unable to remove cancelled order."
      );
    } finally {
      setRemovingId(null);
    }
  }

  // =========================================================
  // FILTER ORDERS
  // =========================================================

  const filteredOrders = useMemo(() => {
    const searchText = search
      .toLowerCase()
      .trim();

    return orders.filter((order) => {
      const customer =
        order.user?.email ||
        order.user?.name ||
        order.email ||
        order.name ||
        "";

      const orderId = order._id || "";

      const matchesSearch =
        !searchText ||
        customer
          .toLowerCase()
          .includes(searchText) ||
        orderId
          .toLowerCase()
          .includes(searchText);

      const matchesStatus =
        statusFilter === "All" ||
        (order.status || "Processing") ===
          statusFilter;

      return (
        matchesSearch && matchesStatus
      );
    });
  }, [orders, search, statusFilter]);

  // =========================================================
  // STATISTICS
  // =========================================================

  const totalOrders = orders.length;

  const totalRevenue = orders.reduce(
    (total, order) =>
      total + Number(order.total || 0),
    0
  );

  const processingOrders = orders.filter(
    (order) =>
      order.status === "Processing"
  ).length;

  const confirmedOrders = orders.filter(
    (order) =>
      order.status === "Confirmed"
  ).length;

  const activatedOrders = orders.filter(
    (order) =>
      order.status === "Activated"
  ).length;

  const completedOrders = orders.filter(
    (order) =>
      order.status === "Completed"
  ).length;

  const cancelledOrders = orders.filter(
    (order) =>
      order.status === "Cancelled"
  ).length;

  function formatCurrency(value) {
    return `₹${Number(
      value || 0
    ).toLocaleString("en-IN")}`;
  }

  function formatDate(date) {
    if (!date) {
      return "Date unavailable";
    }

    return new Date(date).toLocaleDateString(
      "en-IN",
      {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }
    );
  }

  return (
    <div className="min-h-screen bg-[#050505] px-4 py-6 text-white md:px-8">
      <div className="mx-auto max-w-7xl">

        {/* HEADER */}

        <div className="mb-8 flex flex-col gap-5 md:flex-row md:items-center md:justify-between">

          <div className="flex items-start gap-4">

            <Link
              to="/admin"
              className="mt-1 rounded-xl border border-white/10 bg-white/5 p-3 transition hover:border-lime-400/40 hover:bg-lime-400/10"
            >
              <ArrowLeft size={20} />
            </Link>

            <div>

              <div className="mb-2 flex items-center gap-2">

                <span className="h-2 w-2 animate-pulse rounded-full bg-lime-400" />

                <span className="text-xs font-semibold uppercase tracking-[0.3em] text-lime-400">
                  NEXORA ADMIN
                </span>

              </div>

              <h1 className="text-3xl font-black md:text-4xl">
                Order Management
              </h1>

              <p className="mt-2 text-sm text-gray-400">
                Monitor customer orders and manage
                order status.
              </p>

            </div>

          </div>

          <button
            onClick={loadOrders}
            disabled={loading}
            className="flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/5 px-5 py-3 text-sm font-semibold transition hover:border-lime-400/40 hover:bg-lime-400/10 disabled:opacity-50"
          >
            <RefreshCw
              size={17}
              className={
                loading
                  ? "animate-spin"
                  : ""
              }
            />

            Refresh Orders
          </button>

        </div>

        {/* ERROR */}

        {error && (
          <div className="mb-6 rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-300">
            {error}
          </div>
        )}

        {/* STATISTICS */}

        <div className="mb-8 grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-7">

          <StatCard
            title="Total Orders"
            value={totalOrders}
            icon={<ShoppingCart size={19} />}
          />

          <StatCard
            title="Revenue"
            value={formatCurrency(
              totalRevenue
            )}
            icon={<Package size={19} />}
          />

          <StatCard
            title="Processing"
            value={processingOrders}
            icon={<Clock3 size={19} />}
          />

          <StatCard
            title="Confirmed"
            value={confirmedOrders}
            icon={<CheckCircle2 size={19} />}
          />

          <StatCard
            title="Activated"
            value={activatedOrders}
            icon={<Gamepad2 size={19} />}
          />

          <StatCard
            title="Completed"
            value={completedOrders}
            icon={<CheckCircle2 size={19} />}
          />

          <StatCard
            title="Cancelled"
            value={cancelledOrders}
            icon={<XCircle size={19} />}
          />

        </div>

        {/* SEARCH + FILTER */}

        <div className="mb-6 rounded-2xl border border-white/10 bg-white/[0.03] p-4">

          <div className="flex flex-col gap-4 lg:flex-row">

            <div className="relative flex-1">

              <Search
                size={19}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500"
              />

              <input
                type="text"
                value={search}
                onChange={(e) =>
                  setSearch(e.target.value)
                }
                placeholder="Search by order ID or customer..."
                className="w-full rounded-xl border border-white/10 bg-black/30 py-3 pl-11 pr-4 text-sm text-white outline-none transition placeholder:text-gray-600 focus:border-lime-400/50"
              />

            </div>

            <div className="flex flex-wrap gap-2">

              {[
                "All",
                ...STATUSES,
              ].map((status) => (
                <button
                  key={status}
                  onClick={() =>
                    setStatusFilter(status)
                  }
                  className={`rounded-xl px-4 py-3 text-xs font-semibold transition ${
                    statusFilter === status
                      ? "bg-lime-400 text-black"
                      : "border border-white/10 bg-white/5 text-gray-400 hover:border-lime-400/30 hover:text-white"
                  }`}
                >
                  {status}
                </button>
              ))}

            </div>

          </div>

        </div>

        {/* ORDERS */}

        <div className="overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03]">

          <div className="border-b border-white/10 p-5">

            <div className="flex items-center gap-3">

              <div className="rounded-xl bg-lime-400/10 p-3 text-lime-400">
                <ShoppingCart size={22} />
              </div>

              <div>

                <h2 className="text-xl font-bold">
                  Customer Orders
                </h2>

                <p className="text-sm text-gray-500">
                  {filteredOrders.length} orders displayed
                </p>

              </div>

            </div>

          </div>

          {/* LOADING */}

          {loading ? (

            <div className="flex min-h-[350px] items-center justify-center">

              <div className="text-center">

                <RefreshCw
                  size={32}
                  className="mx-auto mb-3 animate-spin text-lime-400"
                />

                <p className="text-gray-400">
                  Loading orders...
                </p>

              </div>

            </div>

          ) : filteredOrders.length === 0 ? (

            /* EMPTY */

            <div className="flex min-h-[350px] items-center justify-center">

              <div className="text-center">

                <ShoppingCart
                  size={45}
                  className="mx-auto mb-4 text-gray-700"
                />

                <p className="text-lg font-semibold text-gray-400">
                  No orders found
                </p>

                <p className="mt-1 text-sm text-gray-600">
                  Try changing your search or filter.
                </p>

              </div>

            </div>

          ) : (

            /* ORDER LIST */

            <div className="divide-y divide-white/5">

              {filteredOrders.map((order) => {

                const customerName =
                  order.user?.name ||
                  order.name ||
                  "Customer";

                const customerEmail =
                  order.user?.email ||
                  order.email ||
                  "No email available";

                const status =
                  order.status ||
                  "Processing";

                const isCancelled =
                  status === "Cancelled";

                const isRemoving =
                  removingId === order._id;

                return (
                  <div
                    key={order._id}
                    className="p-5 transition hover:bg-white/[0.02]"
                  >

                    <div className="flex flex-col gap-5 xl:flex-row xl:items-center xl:justify-between">

                      {/* ORDER INFORMATION */}

                      <div className="min-w-0">

                        <div className="flex flex-wrap items-center gap-3">

                          <h3 className="font-bold">
                            Order #
                            {order._id?.slice(-8)}
                          </h3>

                          <StatusBadge
                            status={status}
                          />

                        </div>

                        <div className="mt-2 flex flex-wrap gap-x-5 gap-y-2 text-xs text-gray-500">

                          <span className="flex items-center gap-1.5">
                            <CalendarDays size={14} />
                            {formatDate(
                              order.createdAt
                            )}
                          </span>

                          <span>
                            👤 {customerName}
                          </span>

                          <span>
                            {customerEmail}
                          </span>

                        </div>

                        <div className="mt-4 flex flex-wrap gap-2">

                          {order.items?.length > 0 ? (
                            order.items.map(
                              (item, index) => (
                                <span
                                  key={
                                    item._id ||
                                    index
                                  }
                                  className="rounded-lg border border-white/10 bg-black/30 px-3 py-2 text-xs text-gray-400"
                                >
                                  {item.title ||
                                    item.name ||
                                    "Game"}{" "}
                                  ×{" "}
                                  {item.qty ||
                                    item.quantity ||
                                    1}
                                </span>
                              )
                            )
                          ) : (
                            <span className="text-xs text-gray-600">
                              No item details available
                            </span>
                          )}

                        </div>

                      </div>

                      {/* ACTIONS */}

                      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">

                        <div className="text-left sm:text-right">

                          <p className="text-xs text-gray-500">
                            Order Total
                          </p>

                          <p className="text-xl font-black text-lime-400">
                            {formatCurrency(
                              order.total
                            )}
                          </p>

                        </div>

                        {/* STATUS SELECT */}

                        <select
                          value={status}
                          disabled={
                            updatingId ===
                              order._id ||
                            isRemoving
                          }
                          onChange={(e) =>
                            updateOrderStatus(
                              order._id,
                              e.target.value
                            )
                          }
                          className="rounded-xl border border-white/10 bg-[#111] px-4 py-3 text-sm text-white outline-none transition focus:border-lime-400 disabled:opacity-50"
                        >

                          {STATUSES.map(
                            (itemStatus) => (
                              <option
                                key={
                                  itemStatus
                                }
                                value={
                                  itemStatus
                                }
                              >
                                {itemStatus}
                              </option>
                            )
                          )}

                        </select>

                        {/* DETAILS */}

                        <button
                          onClick={() =>
                            setSelectedOrder(
                              order
                            )
                          }
                          disabled={isRemoving}
                          className="flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-semibold transition hover:border-lime-400/40 hover:bg-lime-400/10 disabled:opacity-50"
                        >
                          <Eye size={17} />
                          Details
                        </button>

                        {/* REMOVE CANCELLED */}

                        {isCancelled && (
                          <button
                            onClick={() =>
                              removeCancelledOrder(
                                order
                              )
                            }
                            disabled={
                              isRemoving
                            }
                            className="flex items-center justify-center gap-2 rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm font-semibold text-red-400 transition hover:border-red-400/50 hover:bg-red-500/20 disabled:opacity-50"
                          >

                            {isRemoving ? (
                              <RefreshCw
                                size={17}
                                className="animate-spin"
                              />
                            ) : (
                              <Trash2
                                size={17}
                              />
                            )}

                            {isRemoving
                              ? "Removing..."
                              : "Remove"}

                          </button>
                        )}

                      </div>

                    </div>

                  </div>
                );
              })}

            </div>

          )}

        </div>

      </div>

      {/* ORDER DETAILS MODAL */}

      {selectedOrder && (
        <OrderDetailsModal
          order={selectedOrder}
          onClose={() =>
            setSelectedOrder(null)
          }
          onStatusChange={
            updateOrderStatus
          }
          onRemove={
            removeCancelledOrder
          }
          updating={
            updatingId ===
            selectedOrder._id
          }
          removing={
            removingId ===
            selectedOrder._id
          }
        />
      )}

    </div>
  );
}

/* =========================================================
   STAT CARD
========================================================= */

function StatCard({
  title,
  value,
  icon,
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4 transition hover:-translate-y-1 hover:border-lime-400/30">

      <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-lime-400/10 text-lime-400">
        {icon}
      </div>

      <p className="text-xs text-gray-500">
        {title}
      </p>

      <p className="mt-1 text-xl font-black">
        {value}
      </p>

    </div>
  );
}

/* =========================================================
   STATUS BADGE
========================================================= */

function StatusBadge({ status }) {
  const styles = {
    Processing:
      "bg-blue-400/10 text-blue-400",

    Confirmed:
      "bg-cyan-400/10 text-cyan-400",

    Activated:
      "bg-purple-400/10 text-purple-400",

    Completed:
      "bg-lime-400/10 text-lime-400",

    Cancelled:
      "bg-red-400/10 text-red-400",
  };

  return (
    <span
      className={`rounded-full px-3 py-1 text-[11px] font-bold ${
        styles[status] ||
        "bg-white/10 text-gray-400"
      }`}
    >
      {status}
    </span>
  );
}

/* =========================================================
   ORDER DETAILS MODAL
========================================================= */

function OrderDetailsModal({
  order,
  onClose,
  onStatusChange,
  onRemove,
  updating,
  removing,
}) {
  const customerName =
    order.user?.name ||
    order.name ||
    "Customer";

  const customerEmail =
    order.user?.email ||
    order.email ||
    "No email available";

  const status =
    order.status || "Processing";

  function formatCurrency(value) {
    return `₹${Number(
      value || 0
    ).toLocaleString("en-IN")}`;
  }

  function formatDate(date) {
    if (!date) {
      return "Unavailable";
    }

    return new Date(date).toLocaleString(
      "en-IN",
      {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      }
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm">

      <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl border border-white/10 bg-[#0b0b0b] shadow-2xl">

        {/* MODAL HEADER */}

        <div className="flex items-center justify-between border-b border-white/10 p-5">

          <div>

            <p className="text-xs uppercase tracking-[0.25em] text-lime-400">
              Order Details
            </p>

            <h2 className="mt-1 text-xl font-bold">
              #{order._id?.slice(-8)}
            </h2>

          </div>

          <button
            onClick={onClose}
            className="rounded-xl border border-white/10 p-2 text-gray-400 transition hover:bg-white/5 hover:text-white"
          >
            <XCircle size={21} />
          </button>

        </div>

        {/* CUSTOMER */}

        <div className="border-b border-white/10 p-5">

          <h3 className="mb-3 font-semibold">
            Customer
          </h3>

          <div className="rounded-xl border border-white/10 bg-white/[0.03] p-4">

            <p className="font-semibold">
              {customerName}
            </p>

            <p className="mt-1 text-sm text-gray-500">
              {customerEmail}
            </p>

          </div>

        </div>

        {/* ORDER INFORMATION */}

        <div className="border-b border-white/10 p-5">

          <h3 className="mb-3 font-semibold">
            Order Information
          </h3>

          <div className="grid gap-3 sm:grid-cols-2">

            <InfoRow
              label="Order ID"
              value={
                order._id || "N/A"
              }
            />

            <InfoRow
              label="Order Date"
              value={formatDate(
                order.createdAt
              )}
            />

            <InfoRow
              label="Payment"
              value={
                order.paymentMethod ||
                "Online Payment"
              }
            />

            <InfoRow
              label="Status"
              value={status}
            />

          </div>

        </div>

        {/* PURCHASED GAMES */}

        <div className="border-b border-white/10 p-5">

          <h3 className="mb-3 font-semibold">
            Purchased Games
          </h3>

          <div className="space-y-3">

            {order.items?.length > 0 ? (
              order.items.map(
                (item, index) => (
                  <div
                    key={
                      item._id ||
                      index
                    }
                    className="flex items-center justify-between rounded-xl border border-white/10 bg-white/[0.03] p-4"
                  >

                    <div>

                      <p className="font-semibold">
                        {item.title ||
                          item.name ||
                          "Game"}
                      </p>

                      <p className="mt-1 text-xs text-gray-500">
                        Quantity:{" "}
                        {item.qty ||
                          item.quantity ||
                          1}
                      </p>

                    </div>

                    <p className="font-semibold text-lime-400">
                      {formatCurrency(
                        item.price || 0
                      )}
                    </p>

                  </div>
                )
              )
            ) : (
              <p className="text-sm text-gray-500">
                No item details available.
              </p>
            )}

          </div>

        </div>

        {/* TOTAL */}

        <div className="border-b border-white/10 p-5">

          <div className="flex items-center justify-between">

            <span className="text-gray-400">
              Order Total
            </span>

            <span className="text-2xl font-black text-lime-400">
              {formatCurrency(
                order.total
              )}
            </span>

          </div>

        </div>

        {/* STATUS CONTROL */}

        <div className="p-5">

          <label className="mb-2 block text-sm font-semibold">
            Update Order Status
          </label>

          <select
            value={status}
            disabled={
              updating || removing
            }
            onChange={(e) =>
              onStatusChange(
                order._id,
                e.target.value
              )
            }
            className="w-full rounded-xl border border-white/10 bg-[#111] px-4 py-3 text-sm text-white outline-none focus:border-lime-400 disabled:opacity-50"
          >

            {STATUSES.map(
              (itemStatus) => (
                <option
                  key={itemStatus}
                  value={itemStatus}
                >
                  {itemStatus}
                </option>
              )
            )}

          </select>

          {/* REMOVE CANCELLED */}

          {status === "Cancelled" && (
            <button
              onClick={() =>
                onRemove(order)
              }
              disabled={
                updating || removing
              }
              className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm font-semibold text-red-400 transition hover:border-red-400/50 hover:bg-red-500/20 disabled:opacity-50"
            >

              {removing ? (
                <RefreshCw
                  size={17}
                  className="animate-spin"
                />
              ) : (
                <Trash2 size={17} />
              )}

              {removing
                ? "Removing Order..."
                : "Remove Cancelled Order"}

            </button>
          )}

        </div>

      </div>

    </div>
  );
}

/* =========================================================
   INFO ROW
========================================================= */

function InfoRow({
  label,
  value,
}) {
  return (
    <div className="rounded-xl border border-white/10 bg-white/[0.03] p-3">

      <p className="text-xs text-gray-500">
        {label}
      </p>

      <p className="mt-1 break-all text-sm font-semibold">
        {value}
      </p>

    </div>
  );
}