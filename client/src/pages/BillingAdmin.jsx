import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowLeft,
  Receipt,
  Search,
  RefreshCw,
  UserRound,
  CalendarDays,
  CreditCard,
  IndianRupee,
  Gamepad2,
  X,
  Printer,
  CheckCircle2,
  Clock,
  Truck,
  XCircle,
  Eye,
} from "lucide-react";

import { api } from "../services/api";

export default function BillingAdmin() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [selectedOrder, setSelectedOrder] = useState(null);

  const loadOrders = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get("/orders");

      const data = response?.data;

      if (Array.isArray(data)) {
        setOrders(data);
      } else if (Array.isArray(data?.orders)) {
        setOrders(data.orders);
      } else {
        setOrders([]);
      }
    } catch (err) {
      console.error("Billing error:", err);

      setError(
        err.response?.data?.message || "Unable to load billing information.",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOrders();
  }, []);

  const filteredOrders = useMemo(() => {
    const query = search.trim().toLowerCase();

    if (!query) return orders;

    return orders.filter((order) => {
      const invoice = String(order._id || order.orderId || "").toLowerCase();

      const name = String(
        order.billing?.name || order.user?.name || "",
      ).toLowerCase();

      const email = String(
        order.billing?.email || order.user?.email || "",
      ).toLowerCase();

      return (
        invoice.includes(query) || name.includes(query) || email.includes(query)
      );
    });
  }, [orders, search]);

  const totalRevenue = orders
    .filter((order) => String(order.status || "").toLowerCase() !== "cancelled")
    .reduce((sum, order) => sum + Number(order.total || 0), 0);

  const cancelledOrders = orders.filter(
    (order) => String(order.status || "").toLowerCase() === "cancelled",
  ).length;

  const formatDate = (date) => {
    if (!date) return "N/A";

    const parsed = new Date(date);

    if (Number.isNaN(parsed.getTime())) {
      return "N/A";
    }

    return parsed.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const formatDateTime = (date) => {
    if (!date) return "N/A";

    const parsed = new Date(date);

    if (Number.isNaN(parsed.getTime())) {
      return "N/A";
    }

    return parsed.toLocaleString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getInvoiceNumber = (order, index) => {
    const rawId = order?._id || order?.orderId || `ORDER${index + 1}`;

    return `NEX-${String(rawId).slice(-8).toUpperCase()}`;
  };

  const getCustomerName = (order) => {
    return order?.billing?.name || order?.user?.name || "Customer";
  };

  const getCustomerEmail = (order) => {
    return order?.billing?.email || order?.user?.email || "N/A";
  };

  const getStatusClass = (status) => {
    const value = String(status || "").toLowerCase();

    if (value === "delivered") {
      return "border-emerald-500/20 bg-emerald-500/10 text-emerald-400";
    }

    if (value === "shipped") {
      return "border-blue-500/20 bg-blue-500/10 text-blue-400";
    }

    if (value === "processing") {
      return "border-yellow-500/20 bg-yellow-500/10 text-yellow-400";
    }

    if (value === "cancelled" || value === "canceled") {
      return "border-red-500/20 bg-red-500/10 text-red-400";
    }

    return "border-zinc-500/20 bg-zinc-500/10 text-zinc-300";
  };

  const getStatusIcon = (status) => {
    const value = String(status || "").toLowerCase();

    if (value === "delivered") {
      return <CheckCircle2 size={14} />;
    }

    if (value === "shipped") {
      return <Truck size={14} />;
    }

    if (value === "cancelled" || value === "canceled") {
      return <XCircle size={14} />;
    }

    return <Clock size={14} />;
  };

  const openInvoice = (order, index) => {
    setSelectedOrder({
      ...order,
      invoiceNumber: getInvoiceNumber(order, index),
    });
  };

  const printInvoice = () => {
    window.print();
  };

  if (loading) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-20">
        <div className="glass rounded-2xl p-12 text-center">
          <RefreshCw size={36} className="mx-auto animate-spin text-lime-400" />

          <h2 className="mt-5 text-xl font-semibold">Loading invoices...</h2>

          <p className="mt-2 text-sm text-zinc-400">
            Fetching billing information.
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-12">
        <Link
          to="/admin"
          className="mb-6 inline-flex items-center gap-2 text-sm text-zinc-400 hover:text-white"
        >
          <ArrowLeft size={17} />
          Back to Admin Dashboard
        </Link>

        <div className="glass rounded-2xl p-12 text-center">
          <XCircle size={44} className="mx-auto text-red-400" />

          <h1 className="mt-5 text-2xl font-bold">Could not load invoices</h1>

          <p className="mt-3 text-zinc-400">{error}</p>

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

  return (
    <div className="mx-auto max-w-7xl px-4 py-12">
      {/* HEADER */}
      <div className="flex flex-col justify-between gap-5 md:flex-row md:items-center">
        <div>
          <Link
            to="/admin"
            className="mb-4 inline-flex items-center gap-2 text-sm text-zinc-400 hover:text-white"
          >
            <ArrowLeft size={17} />
            Back to Admin Dashboard
          </Link>

          <div className="flex items-center gap-3">
            <div className="rounded-xl border border-lime-400/20 bg-lime-400/10 p-3">
              <Receipt size={25} className="text-lime-400" />
            </div>

            <div>
              <h1 className="font-display text-4xl font-bold">
                Billing & Invoices
              </h1>

              <p className="mt-1 text-zinc-400">
                Manage customer invoices and billing records.
              </p>
            </div>
          </div>
        </div>

        <button
          onClick={loadOrders}
          className="btn inline-flex items-center gap-2"
        >
          <RefreshCw size={17} />
          Refresh
        </button>
      </div>

      {/* STATS */}
      <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          icon={<Receipt size={21} />}
          label="Total Invoices"
          value={orders.length}
        />

        <StatCard
          icon={<IndianRupee size={21} />}
          label="Total Revenue"
          value={`₹${totalRevenue.toLocaleString("en-IN")}`}
        />

        <StatCard
          icon={<CheckCircle2 size={21} />}
          label="Valid Invoices"
          value={orders.length - cancelledOrders}
        />

        <StatCard
          icon={<XCircle size={21} />}
          label="Cancelled"
          value={cancelledOrders}
        />
      </div>

      {/* SEARCH */}
      <div className="mt-8">
        <div className="mb-2 flex items-center justify-between px-1">
          <label className="text-sm font-medium text-zinc-300">
            Search Invoices
          </label>

          <span className="text-xs text-zinc-600">
            {filteredOrders.length} results
          </span>
        </div>

        <div className="flex h-14 items-center overflow-hidden rounded-2xl border border-white/10 bg-[#0d0d11] transition focus-within:border-lime-400/40">
          <div className="flex h-full w-14 shrink-0 items-center justify-center border-r border-white/10">
            <Search size={20} className="text-zinc-500" />
          </div>

          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by invoice, customer name or email..."
            className="h-full min-w-0 flex-1 bg-transparent px-5 text-sm text-white outline-none placeholder:text-zinc-600"
          />
        </div>
      </div>

      {/* INVOICE TABLE */}
      <div className="mt-6">
        {filteredOrders.length === 0 ? (
          <div className="glass rounded-2xl p-12 text-center">
            <Receipt size={45} className="mx-auto text-zinc-600" />

            <h2 className="mt-5 text-xl font-semibold">No invoices found</h2>
          </div>
        ) : (
          <div className="glass overflow-hidden rounded-2xl">
            <div className="hidden border-b border-white/10 px-6 py-4 text-xs uppercase tracking-wider text-zinc-500 lg:grid lg:grid-cols-[1fr_1.3fr_1fr_0.9fr_0.8fr_100px] lg:gap-4">
              <span>Invoice</span>
              <span>Customer</span>
              <span>Date</span>
              <span>Payment</span>
              <span>Total</span>
              <span>Action</span>
            </div>

            <div className="divide-y divide-white/5">
              {filteredOrders.map((order, index) => (
                <div
                  key={order?._id || order?.orderId || index}
                  className="p-5 transition hover:bg-white/[0.03] lg:grid lg:grid-cols-[1fr_1.3fr_1fr_0.9fr_0.8fr_100px] lg:items-center lg:gap-4 lg:px-6"
                >
                  {/* INVOICE */}
                  <div>
                    <p className="font-mono text-sm font-semibold text-lime-400">
                      {getInvoiceNumber(order, index)}
                    </p>

                    <p className="mt-1 text-xs text-zinc-600">
                      #{String(order?._id || order?.orderId || "").slice(-8)}
                    </p>
                  </div>

                  {/* CUSTOMER */}
                  <div className="mt-4 flex items-center gap-3 lg:mt-0">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white/5">
                      <UserRound size={17} className="text-zinc-500" />
                    </div>

                    <div className="min-w-0">
                      <p className="truncate font-medium">
                        {getCustomerName(order)}
                      </p>

                      <p className="truncate text-xs text-zinc-500">
                        {getCustomerEmail(order)}
                      </p>
                    </div>
                  </div>

                  {/* DATE */}
                  <div className="mt-4 flex items-center gap-2 text-sm text-zinc-400 lg:mt-0">
                    <CalendarDays size={15} className="text-zinc-600" />

                    {formatDate(order.createdAt)}
                  </div>

                  {/* PAYMENT */}
                  <div className="mt-4 flex items-center gap-2 text-sm text-zinc-400 lg:mt-0">
                    <CreditCard size={15} className="text-zinc-600" />

                    {order.paymentMethod || "Demo Payment"}
                  </div>

                  {/* TOTAL */}
                  <div className="mt-4 lg:mt-0">
                    <p className="font-semibold">
                      ₹{Number(order.total || 0).toLocaleString("en-IN")}
                    </p>

                    <span
                      className={`mt-1 inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] ${getStatusClass(
                        order.status,
                      )}`}
                    >
                      {getStatusIcon(order.status)}

                      {order.status || "Pending"}
                    </span>
                  </div>

                  {/* ACTION */}
                  <div className="mt-4 lg:mt-0">
                    <button
                      type="button"
                      onClick={() => openInvoice(order, index)}
                      className="btn inline-flex w-full items-center justify-center gap-2 text-sm"
                    >
                      <Eye size={16} />
                      View
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* INVOICE PREVIEW */}
      {selectedOrder && (
        <InvoiceModal
          order={selectedOrder}
          onClose={() => setSelectedOrder(null)}
          onPrint={printInvoice}
          formatDateTime={formatDateTime}
          getCustomerName={getCustomerName}
          getCustomerEmail={getCustomerEmail}
          getStatusClass={getStatusClass}
          getStatusIcon={getStatusIcon}
        />
      )}
    </div>
  );
}

/* =========================================
   INVOICE MODAL
========================================= */

function InvoiceModal({
  order,
  onClose,
  onPrint,
  formatDateTime,
  getCustomerName,
  getCustomerEmail,
  getStatusClass,
  getStatusIcon,
}) {
  const items = Array.isArray(order?.items) ? order.items : [];

  const total = Number(order?.total || 0);

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm">
      <div className="flex max-h-[92vh] w-full max-w-4xl flex-col overflow-hidden rounded-3xl border border-white/10 bg-[#101014] shadow-2xl">
        {/* MODAL TOP BAR */}
        <div className="flex shrink-0 items-center justify-between border-b border-white/10 bg-[#101014] p-5">
          <div>
            <h2 className="text-lg font-bold">Invoice Preview</h2>

            <p className="mt-1 text-xs text-zinc-500">{order.invoiceNumber}</p>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onPrint}
              className="btn btn-primary inline-flex items-center gap-2"
            >
              <Printer size={17} />
              Print
            </button>

            <button
              type="button"
              onClick={onClose}
              className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 text-zinc-400 transition hover:bg-white/10 hover:text-white"
            >
              <X size={19} />
            </button>
          </div>
        </div>

        {/* INVOICE CONTENT */}
        <div className="overflow-y-auto">
          <div id="nexora-invoice" className="bg-[#101014] p-8 md:p-12">
            {/* HEADER */}
            <div className="flex flex-col justify-between gap-8 border-b border-white/10 pb-8 md:flex-row">
              <div>
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-lime-400 text-black">
                    <Gamepad2 size={25} />
                  </div>

                  <div>
                    <h1 className="text-3xl font-black">NEXORA</h1>

                    <p className="text-xs uppercase tracking-[0.3em] text-zinc-500">
                      Gaming Store
                    </p>
                  </div>
                </div>
              </div>

              <div className="text-left md:text-right">
                <p className="text-xs uppercase tracking-[0.2em] text-zinc-500">
                  Invoice
                </p>

                <p className="mt-2 text-2xl font-bold text-lime-400">
                  {order.invoiceNumber}
                </p>

                <p className="mt-2 text-sm text-zinc-500">
                  {formatDateTime(order.createdAt)}
                </p>
              </div>
            </div>

            {/* BILLING */}
            <div className="grid gap-8 border-b border-white/10 py-8 md:grid-cols-2">
              <div>
                <p className="text-xs uppercase tracking-wider text-zinc-500">
                  Bill To
                </p>

                <h3 className="mt-2 text-lg font-bold">
                  {getCustomerName(order)}
                </h3>

                <p className="mt-1 text-sm text-zinc-400">
                  {getCustomerEmail(order)}
                </p>

                {order.billing?.address && (
                  <p className="mt-3 max-w-md text-sm leading-6 text-zinc-500">
                    {order.billing.address}

                    {order.billing.city && `, ${order.billing.city}`}

                    {order.billing.state && `, ${order.billing.state}`}

                    {order.billing.pincode && ` - ${order.billing.pincode}`}
                  </p>
                )}
              </div>

              <div className="md:text-right">
                <p className="text-xs uppercase tracking-wider text-zinc-500">
                  Payment
                </p>

                <div className="mt-3 flex items-center gap-2 md:justify-end">
                  <CreditCard size={16} className="text-zinc-500" />

                  <span className="text-sm">
                    {order.paymentMethod || "Demo Payment"}
                  </span>
                </div>

                <div className="mt-3 flex md:justify-end">
                  <span
                    className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs ${getStatusClass(
                      order.status,
                    )}`}
                  >
                    {getStatusIcon(order.status)}

                    {order.status || "Pending"}
                  </span>
                </div>
              </div>
            </div>

            {/* GAMES */}
            <div className="py-8">
              <div className="mb-5 flex items-center justify-between">
                <h3 className="text-lg font-bold">Purchased Games</h3>

                <span className="text-sm text-zinc-500">
                  {items.length} item
                  {items.length === 1 ? "" : "s"}
                </span>
              </div>

              {items.length === 0 ? (
                <div className="rounded-xl border border-white/10 p-6 text-center text-sm text-zinc-500">
                  No item information available.
                </div>
              ) : (
                <div className="overflow-hidden rounded-xl border border-white/10">
                  <div className="grid grid-cols-[1fr_70px_100px_110px] gap-3 bg-white/5 px-4 py-3 text-xs uppercase tracking-wider text-zinc-500">
                    <span>Game</span>

                    <span className="text-center">Qty</span>

                    <span className="text-right">Price</span>

                    <span className="text-right">Total</span>
                  </div>

                  {items.map((item, index) => {
                    const price = Number(item?.price || 0);

                    const qty = Number(item?.qty || 1);

                    return (
                      <div
                        key={item?._id || item?.game || index}
                        className="grid grid-cols-[1fr_70px_100px_110px] items-center gap-3 border-t border-white/5 px-4 py-4"
                      >
                        <div className="flex min-w-0 items-center gap-3">
                          {item?.image ? (
                            <img
                              src={item.image}
                              alt={item.title || "Game"}
                              className="hidden h-10 w-10 rounded-lg object-cover sm:block"
                            />
                          ) : (
                            <div className="hidden h-10 w-10 items-center justify-center rounded-lg bg-white/5 sm:flex">
                              <Gamepad2 size={18} className="text-zinc-600" />
                            </div>
                          )}

                          <span className="truncate text-sm font-medium">
                            {item?.title || "Game"}
                          </span>
                        </div>

                        <span className="text-center text-sm text-zinc-400">
                          {qty}
                        </span>

                        <span className="text-right text-sm text-zinc-400">
                          ₹{price.toLocaleString("en-IN")}
                        </span>

                        <span className="text-right text-sm font-semibold">
                          ₹{(price * qty).toLocaleString("en-IN")}
                        </span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* TOTAL */}
            <div className="flex justify-end border-t border-white/10 pt-6">
              <div className="w-full max-w-sm">
                <div className="flex justify-between text-sm text-zinc-500">
                  <span>Subtotal</span>

                  <span>₹{total.toLocaleString("en-IN")}</span>
                </div>

                <div className="mt-3 flex justify-between text-sm text-zinc-500">
                  <span>Tax</span>

                  <span>Included</span>
                </div>

                <div className="mt-4 flex justify-between border-t border-white/10 pt-4">
                  <span className="text-lg font-bold">Grand Total</span>

                  <span className="text-2xl font-bold text-lime-400">
                    ₹{total.toLocaleString("en-IN")}
                  </span>
                </div>
              </div>
            </div>

            {/* FOOTER */}
            <div className="mt-10 border-t border-white/10 pt-6 text-center">
              <p className="text-sm font-semibold">
                Thank you for choosing NEXORA.
              </p>

              <p className="mt-2 text-xs text-zinc-600">
                This is a computer-generated invoice.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ icon, label, value }) {
  return (
    <div className="glass rounded-2xl p-5">
      <div className="flex items-center justify-between">
        <div className="rounded-xl border border-lime-400/20 bg-lime-400/10 p-2.5 text-lime-400">
          {icon}
        </div>
      </div>

      <p className="mt-5 text-sm text-zinc-500">{label}</p>

      <p className="mt-1 text-2xl font-bold">{value}</p>
    </div>
  );
}
