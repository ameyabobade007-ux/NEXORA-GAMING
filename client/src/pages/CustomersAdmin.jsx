import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";

import {
  ArrowLeft,
  CalendarDays,
  CheckCircle2,
  ChevronRight,
  Gamepad2,
  Mail,
  Package,
  RefreshCw,
  Search,
  ShoppingCart,
  Users,
  IndianRupee,
  X,
  Eye,
} from "lucide-react";

import { api } from "../services/api";

export default function CustomersAdmin() {
  const [customers, setCustomers] = useState([]);
  const [orders, setOrders] = useState([]);

  const [search, setSearch] = useState("");
  const [activeFilter, setActiveFilter] = useState("all");

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [selectedCustomer, setSelectedCustomer] =
    useState(null);

  const [customerOrders, setCustomerOrders] =
    useState([]);

  const [loadingHistory, setLoadingHistory] =
    useState(false);

  // =========================================================
  // LOAD CUSTOMERS + ORDERS
  // =========================================================

  async function loadCustomers() {
    try {
      setLoading(true);
      setError("");

      const [customersResponse, ordersResponse] =
        await Promise.all([
          api.get("/admin/customers"),
          api.get("/orders"),
        ]);

      const customerData =
        customersResponse?.data;

      const orderData =
        ordersResponse?.data;

      let customerList = [];

      if (Array.isArray(customerData)) {
        customerList = customerData;
      } else if (
        Array.isArray(customerData?.customers)
      ) {
        customerList =
          customerData.customers;
      } else if (
        Array.isArray(customerData?.users)
      ) {
        customerList = customerData.users;
      } else if (
        Array.isArray(customerData?.data)
      ) {
        customerList = customerData.data;
      }

      const orderList =
        Array.isArray(orderData)
          ? orderData
          : Array.isArray(orderData?.orders)
            ? orderData.orders
            : [];

      setCustomers(customerList);
      setOrders(orderList);
    } catch (err) {
      console.error(
        "Customer Management error:",
        err
      );

      setError(
        err?.response?.data?.message ||
          "Unable to load customer data."
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadCustomers();
  }, []);

  // =========================================================
  // HELPERS
  // =========================================================

  function getCustomerId(customer) {
    return (
      customer?._id ||
      customer?.id ||
      customer?.userId ||
      ""
    );
  }

  function getOrderCustomerId(order) {
    if (
      typeof order?.user === "object" &&
      order?.user?._id
    ) {
      return String(order.user._id);
    }

    if (order?.user) {
      return String(order.user);
    }

    return String(
      order?.userId ||
        order?.customerId ||
        ""
    );
  }

  function getCustomerName(customer) {
    return (
      customer?.name ||
      customer?.fullName ||
      "Customer"
    );
  }

  function getCustomerEmail(customer) {
    return (
      customer?.email ||
      "No email available"
    );
  }

  function getOrderItems(order) {
    if (Array.isArray(order?.items)) {
      return order.items;
    }

    if (Array.isArray(order?.products)) {
      return order.products;
    }

    if (Array.isArray(order?.games)) {
      return order.games;
    }

    return [];
  }

  function getItemQuantity(item) {
    const quantity =
      item?.qty ??
      item?.quantity ??
      item?.count ??
      1;

    return Number(quantity) || 1;
  }

  function getItemTitle(item) {
    return (
      item?.title ||
      item?.name ||
      item?.gameTitle ||
      item?.productName ||
      item?.game?.title ||
      item?.product?.title ||
      "Game"
    );
  }

  function getItemPrice(item) {
    return Number(
      item?.price ??
        item?.unitPrice ??
        item?.game?.price ??
        item?.product?.price ??
        0
    );
  }

  function getOrderTotal(order) {
    return Number(order?.total || 0);
  }

  function getCustomerOrders(customer) {
    const customerId = String(
      getCustomerId(customer)
    );

    const customerEmail =
      getCustomerEmail(customer).toLowerCase();

    return orders.filter((order) => {
      const orderCustomerId =
        getOrderCustomerId(order);

      if (
        orderCustomerId &&
        orderCustomerId === customerId
      ) {
        return true;
      }

      const orderEmail =
        (
          order?.user?.email ||
          order?.billing?.email ||
          order?.email ||
          ""
        ).toLowerCase();

      return (
        orderEmail &&
        orderEmail === customerEmail
      );
    });
  }

  function getCustomerStats(customer) {
    const customerOrders =
      getCustomerOrders(customer);

    let gamesPurchased = 0;
    let spending = 0;

    customerOrders.forEach((order) => {
      spending += getOrderTotal(order);

      const items = getOrderItems(order);

      items.forEach((item) => {
        gamesPurchased +=
          getItemQuantity(item);
      });
    });

    // If backend already provides these values,
    // use them when there are no matching orders.
    if (
      gamesPurchased === 0 &&
      Number(customer?.gamesPurchased) > 0
    ) {
      gamesPurchased = Number(
        customer.gamesPurchased
      );
    }

    if (
      spending === 0 &&
      Number(customer?.spent) > 0
    ) {
      spending = Number(
        customer.spent
      );
    }

    if (
      spending === 0 &&
      Number(customer?.totalSpent) > 0
    ) {
      spending = Number(
        customer.totalSpent
      );
    }

    return {
      orders: customerOrders.length,
      games: gamesPurchased,
      spent: spending,
    };
  }

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

  // =========================================================
  // CUSTOMER STATISTICS
  // =========================================================

  const customerRows = useMemo(() => {
    return customers.map((customer) => {
      const stats =
        getCustomerStats(customer);

      return {
        ...customer,
        computedOrders: stats.orders,
        computedGames: stats.games,
        computedSpent: stats.spent,
      };
    });
  }, [customers, orders]);

  const totalCustomers =
    customerRows.length;

  const totalOrders = orders.length;

  const totalGamesPurchased =
    customerRows.reduce(
      (sum, customer) =>
        sum +
        Number(
          customer.computedGames || 0
        ),
      0
    );

  const totalSpending =
    customerRows.reduce(
      (sum, customer) =>
        sum +
        Number(
          customer.computedSpent || 0
        ),
      0
    );

  // =========================================================
  // FILTER COUNTS
  // =========================================================

  const customersWithOrders =
    customerRows.filter(
      (customer) =>
        customer.computedOrders > 0
    );

  const customersWithGames =
    customerRows.filter(
      (customer) =>
        customer.computedGames > 0
    );

  const customersWithSpending =
    customerRows.filter(
      (customer) =>
        customer.computedSpent > 0
    );

  // =========================================================
  // CARD DESCRIPTIONS
  // =========================================================

  const filterInfo = {
    all: {
      title: "All Customers",
      description:
        "Showing every registered customer in the NEXORA customer database.",
      count: totalCustomers,
    },

    customers: {
      title: "All Customers",
      description:
        "Total number of registered customers in NEXORA.",
      count: totalCustomers,
    },

    orders: {
      title: "Customers With Orders",
      description:
        "Customers who have placed at least one order.",
      count:
        customersWithOrders.length,
    },

    games: {
      title: "Customers With Purchases",
      description:
        "Customers who have purchased at least one game.",
      count:
        customersWithGames.length,
    },

    spending: {
      title: "Customers With Spending",
      description:
        "Customers who have completed purchases and have recorded spending.",
      count:
        customersWithSpending.length,
    },
  };

  // =========================================================
  // FILTER CUSTOMER LIST
  // =========================================================

  const filteredCustomers = useMemo(() => {
    const searchText =
      search.toLowerCase().trim();

    let result = [...customerRows];

    if (activeFilter === "orders") {
      result = result.filter(
        (customer) =>
          customer.computedOrders > 0
      );
    }

    if (activeFilter === "games") {
      result = result.filter(
        (customer) =>
          customer.computedGames > 0
      );
    }

    if (activeFilter === "spending") {
      result = result
        .filter(
          (customer) =>
            customer.computedSpent > 0
        )
        .sort(
          (a, b) =>
            b.computedSpent -
            a.computedSpent
        );
    }

    if (searchText) {
      result = result.filter((customer) => {
        const name =
          getCustomerName(
            customer
          ).toLowerCase();

        const email =
          getCustomerEmail(
            customer
          ).toLowerCase();

        return (
          name.includes(searchText) ||
          email.includes(searchText)
        );
      });
    }

    return result;
  }, [
    customerRows,
    search,
    activeFilter,
  ]);

  // =========================================================
  // CARD CLICK
  // =========================================================

  function handleCardClick(filter) {
    if (activeFilter === filter) {
      setActiveFilter("all");
    } else {
      setActiveFilter(filter);
    }
  }

  // =========================================================
  // OPEN CUSTOMER
  // =========================================================

  async function openCustomer(customer) {
    setSelectedCustomer(customer);

    try {
      setLoadingHistory(true);

      const customerId =
        getCustomerId(customer);

      if (customerId) {
        const response =
          await api.get("/orders");

        const data =
          Array.isArray(response?.data)
            ? response.data
            : [];

        const customerOrders =
          data.filter((order) => {
            const orderCustomerId =
              getOrderCustomerId(
                order
              );

            const orderEmail =
              (
                order?.user?.email ||
                order?.billing?.email ||
                order?.email ||
                ""
              ).toLowerCase();

            return (
              String(
                orderCustomerId
              ) === String(customerId) ||
              orderEmail ===
                getCustomerEmail(
                  customer
                ).toLowerCase()
            );
          });

        setCustomerOrders(
          customerOrders
        );
      }
    } catch (err) {
      console.error(
        "Customer history error:",
        err
      );

      setCustomerOrders(
        getCustomerOrders(
          customer
        )
      );
    } finally {
      setLoadingHistory(false);
    }
  }

  function closeCustomer() {
    setSelectedCustomer(null);
    setCustomerOrders([]);
  }

  // =========================================================
  // PAGE
  // =========================================================

  return (
    <div className="min-h-screen bg-[#050505] px-4 py-6 text-white md:px-8">

      <div className="mx-auto max-w-7xl">

        {/* =================================================
            HEADER
        ================================================= */}

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

                <span className="h-2 w-2 rounded-full bg-lime-400" />

                <span className="text-xs font-semibold uppercase tracking-[0.3em] text-lime-400">
                  NEXORA ADMIN
                </span>

              </div>

              <h1 className="text-3xl font-black md:text-4xl">
                Customer Management
              </h1>

              <p className="mt-2 text-sm text-gray-400">
                Manage customers and view their complete purchase history.
              </p>

            </div>

          </div>

          <button
            onClick={loadCustomers}
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

            {loading
              ? "Refreshing..."
              : "Refresh"}

          </button>

        </div>

        {/* =================================================
            ERROR
        ================================================= */}

        {error && (
          <div className="mb-6 rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-300">
            {error}
          </div>
        )}

        {/* =================================================
            STAT CARDS
        ================================================= */}

        <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">

          <CustomerStatCard
            title="Total Customers"
            value={totalCustomers}
            icon={<Users size={21} />}
            active={
              activeFilter === "all" ||
              activeFilter === "customers"
            }
            onClick={() =>
              handleCardClick(
                "customers"
              )
            }
            description="Registered users"
          />

          <CustomerStatCard
            title="Total Orders"
            value={totalOrders}
            icon={<ShoppingCart size={21} />}
            active={
              activeFilter === "orders"
            }
            onClick={() =>
              handleCardClick(
                "orders"
              )
            }
            description={`${customersWithOrders.length} customers with orders`}
          />

          <CustomerStatCard
            title="Games Purchased"
            value={totalGamesPurchased}
            icon={<Gamepad2 size={21} />}
            active={
              activeFilter === "games"
            }
            onClick={() =>
              handleCardClick(
                "games"
              )
            }
            description={`${customersWithGames.length} customers with purchases`}
          />

          <CustomerStatCard
            title="Customer Spending"
            value={formatCurrency(
              totalSpending
            )}
            icon={<IndianRupee size={21} />}
            active={
              activeFilter === "spending"
            }
            onClick={() =>
              handleCardClick(
                "spending"
              )
            }
            description={`${customersWithSpending.length} customers with spending`}
          />

        </div>

        {/* =================================================
            ACTIVE FILTER INFORMATION
        ================================================= */}

        <div className="mb-6 rounded-2xl border border-lime-400/20 bg-lime-400/[0.04] p-5">

          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">

            <div className="flex items-start gap-3">

              <div className="rounded-xl bg-lime-400/10 p-3 text-lime-400">

                {activeFilter ===
                "orders" ? (
                  <ShoppingCart
                    size={21}
                  />
                ) : activeFilter ===
                  "games" ? (
                  <Gamepad2
                    size={21}
                  />
                ) : activeFilter ===
                  "spending" ? (
                  <IndianRupee
                    size={21}
                  />
                ) : (
                  <Users size={21} />
                )}

              </div>

              <div>

                <p className="text-xs uppercase tracking-[0.25em] text-lime-400">
                  Customer Overview
                </p>

                <h2 className="mt-1 text-lg font-bold">
                  {
                    filterInfo[
                      activeFilter
                    ]?.title
                  }
                </h2>

                <p className="mt-1 max-w-3xl text-sm leading-6 text-gray-400">
                  {
                    filterInfo[
                      activeFilter
                    ]?.description
                  }
                </p>

              </div>

            </div>

            <div className="rounded-xl border border-lime-400/20 bg-black/20 px-4 py-3">

              <p className="text-xs text-gray-500">
                Current Selection
              </p>

              <p className="mt-1 text-xl font-black text-lime-400">
                {
                  filterInfo[
                    activeFilter
                  ]?.count || 0
                }
              </p>

            </div>

          </div>

        </div>

        {/* =================================================
            SEARCH
        ================================================= */}

        <div className="mb-6">

          <div className="mb-2 flex items-center justify-between">

            <h2 className="text-sm font-semibold">
              Search Customers
            </h2>

            <span className="text-xs text-gray-600">
              {filteredCustomers.length} results
            </span>

          </div>

          <div className="relative">

            <Search
              size={20}
              className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-500"
            />

            <input
              type="text"
              value={search}
              onChange={(e) =>
                setSearch(
                  e.target.value
                )
              }
              placeholder="Search by customer name or email..."
              className="w-full rounded-2xl border border-white/10 bg-white/[0.03] py-4 pl-14 pr-5 text-sm text-white outline-none transition placeholder:text-gray-600 focus:border-lime-400/50 focus:bg-white/[0.05]"
            />

            {search && (
              <button
                onClick={() =>
                  setSearch("")
                }
                className="absolute right-4 top-1/2 -translate-y-1/2 rounded-lg p-2 text-gray-500 transition hover:bg-white/5 hover:text-white"
              >
                <X size={17} />
              </button>
            )}

          </div>

        </div>

        {/* =================================================
            CUSTOMER TABLE
        ================================================= */}

        <div className="overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03]">

          <div className="grid grid-cols-12 border-b border-white/10 px-6 py-4 text-xs uppercase tracking-wider text-gray-500">

            <div className="col-span-3">
              Customer
            </div>

            <div className="col-span-3">
              Email
            </div>

            <div className="col-span-2">
              Joined
            </div>

            <div className="col-span-1 text-center">
              Orders
            </div>

            <div className="col-span-1 text-center">
              Games
            </div>

            <div className="col-span-2 text-right">
              Spent
            </div>

          </div>

          {loading ? (

            <div className="flex min-h-[300px] items-center justify-center">

              <div className="text-center">

                <RefreshCw
                  size={30}
                  className="mx-auto mb-3 animate-spin text-lime-400"
                />

                <p className="text-gray-400">
                  Loading customers...
                </p>

              </div>

            </div>

          ) : filteredCustomers.length ===
            0 ? (

            <div className="flex min-h-[300px] items-center justify-center">

              <div className="text-center">

                <Users
                  size={42}
                  className="mx-auto mb-3 text-gray-700"
                />

                <p className="text-lg font-semibold text-gray-400">
                  No customers found
                </p>

                <p className="mt-1 text-sm text-gray-600">
                  Try another search or customer filter.
                </p>

              </div>

            </div>

          ) : (

            <div className="divide-y divide-white/5">

              {filteredCustomers.map(
                (customer) => (

                  <button
                    type="button"
                    key={
                      getCustomerId(
                        customer
                      )
                    }
                    onClick={() =>
                      openCustomer(
                        customer
                      )
                    }
                    className="group grid w-full grid-cols-12 items-center px-6 py-5 text-left transition hover:bg-lime-400/[0.03]"
                  >

                    {/* CUSTOMER */}

                    <div className="col-span-3 flex min-w-0 items-center gap-3">

                      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-lime-400/20 bg-lime-400/10 text-lime-400">

                        <Users
                          size={19}
                        />

                      </div>

                      <div className="min-w-0">

                        <p className="truncate font-bold">
                          {
                            getCustomerName(
                              customer
                            )
                          }
                        </p>

                        <p className="mt-1 text-xs text-gray-600">
                          View customer
                        </p>

                      </div>

                    </div>

                    {/* EMAIL */}

                    <div className="col-span-3 min-w-0">

                      <div className="flex items-center gap-2 text-sm text-gray-400">

                        <Mail
                          size={15}
                          className="shrink-0 text-gray-600"
                        />

                        <span className="truncate">
                          {
                            getCustomerEmail(
                              customer
                            )
                          }
                        </span>

                      </div>

                    </div>

                    {/* JOINED */}

                    <div className="col-span-2">

                      <div className="flex items-center gap-2 text-sm text-gray-400">

                        <CalendarDays
                          size={15}
                          className="text-gray-600"
                        />

                        {formatDate(
                          customer.createdAt ||
                            customer.joinedAt
                        )}

                      </div>

                    </div>

                    {/* ORDERS */}

                    <div className="col-span-1 flex justify-center">

                      <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-sm font-semibold">

                        {
                          customer.computedOrders
                        }

                      </span>

                    </div>

                    {/* GAMES */}

                    <div className="col-span-1 flex justify-center">

                      <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-sm font-semibold">

                        {
                          customer.computedGames
                        }

                      </span>

                    </div>

                    {/* SPENT */}

                    <div className="col-span-2 flex items-center justify-end gap-3">

                      <span className="font-black text-lime-400">

                        {formatCurrency(
                          customer.computedSpent
                        )}

                      </span>

                      <ChevronRight
                        size={18}
                        className="text-gray-600 transition group-hover:translate-x-1 group-hover:text-lime-400"
                      />

                    </div>

                  </button>

                )
              )}

            </div>

          )}

        </div>

      </div>

      {/* =================================================
          CUSTOMER HISTORY MODAL
      ================================================= */}

      {selectedCustomer && (
        <CustomerHistoryModal
          customer={
            selectedCustomer
          }
          orders={customerOrders}
          loading={loadingHistory}
          onClose={
            closeCustomer
          }
        />
      )}

    </div>
  );
}

/* =========================================================
   CUSTOMER STAT CARD
========================================================= */

function CustomerStatCard({
  title,
  value,
  icon,
  active,
  onClick,
  description,
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`group w-full rounded-2xl border p-5 text-left transition-all duration-200 hover:-translate-y-1 ${
        active
          ? "border-lime-400/60 bg-lime-400/[0.10] shadow-[0_0_25px_rgba(163,230,53,0.08)]"
          : "border-white/10 bg-white/[0.03] hover:border-lime-400/30 hover:bg-white/[0.05]"
      }`}
    >

      <div className="mb-4 flex items-center justify-between">

        <div
          className={`flex h-11 w-11 items-center justify-center rounded-xl ${
            active
              ? "bg-lime-400/20 text-lime-300"
              : "bg-lime-400/10 text-lime-400"
          }`}
        >
          {icon}
        </div>

        <span
          className={`text-[10px] font-semibold uppercase tracking-wider ${
            active
              ? "text-lime-400"
              : "text-gray-700"
          }`}
        >
          {active
            ? "Selected"
            : "View"}
        </span>

      </div>

      <p className="text-sm text-gray-500">
        {title}
      </p>

      <p className="mt-1 text-3xl font-black">
        {value}
      </p>

      <p className="mt-2 text-xs text-gray-600">
        {description}
      </p>

      <p className="mt-3 text-[11px] text-gray-700 transition group-hover:text-gray-400">
        Click to view
      </p>

    </button>
  );
}

/* =========================================================
   CUSTOMER HISTORY MODAL
========================================================= */

function CustomerHistoryModal({
  customer,
  orders,
  loading,
  onClose,
}) {
  const customerName =
    customer?.name ||
    customer?.fullName ||
    "Customer";

  const customerEmail =
    customer?.email ||
    "No email available";

  const totalOrders =
    orders.length;

  const gamesPurchased =
    orders.reduce(
      (total, order) => {
        const items =
          Array.isArray(
            order?.items
          )
            ? order.items
            : [];

        return (
          total +
          items.reduce(
            (sum, item) =>
              sum +
              Number(
                item?.qty ??
                  item?.quantity ??
                  1
              ),
            0
          )
        );
      },
      0
    );

  const totalSpent =
    orders.reduce(
      (total, order) =>
        total +
        Number(
          order?.total || 0
        ),
      0
    );

  function formatCurrency(value) {
    return `₹${Number(
      value || 0
    ).toLocaleString("en-IN")}`;
  }

  function formatDate(date) {
    if (!date) {
      return "Unavailable";
    }

    return new Date(
      date
    ).toLocaleDateString(
      "en-IN",
      {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm">

      <div className="max-h-[90vh] w-full max-w-5xl overflow-hidden rounded-2xl border border-white/10 bg-[#0b0b0b] shadow-2xl">

        {/* HEADER */}

        <div className="flex items-center justify-between border-b border-white/10 p-5">

          <div>

            <p className="text-xs uppercase tracking-[0.25em] text-lime-400">
              Customer Purchase History
            </p>

            <h2 className="mt-1 text-2xl font-black">
              {customerName}
            </h2>

            <p className="mt-1 text-sm text-gray-500">
              {customerEmail}
            </p>

          </div>

          <button
            onClick={onClose}
            className="rounded-xl border border-white/10 p-2 text-gray-400 transition hover:bg-white/5 hover:text-white"
          >
            <X size={21} />
          </button>

        </div>

        {/* CUSTOMER STATS */}

        <div className="grid grid-cols-1 gap-3 border-b border-white/10 p-5 sm:grid-cols-3">

          <MiniCustomerStat
            title="Orders"
            value={totalOrders}
            icon={
              <ShoppingCart
                size={18}
              />
            }
          />

          <MiniCustomerStat
            title="Games Purchased"
            value={gamesPurchased}
            icon={
              <Gamepad2
                size={18}
              />
            }
          />

          <MiniCustomerStat
            title="Total Spending"
            value={formatCurrency(
              totalSpent
            )}
            icon={
              <IndianRupee
                size={18}
              />
            }
          />

        </div>

        {/* HISTORY */}

        <div className="max-h-[60vh] overflow-y-auto p-5">

          <div className="mb-4 flex items-center justify-between">

            <div>

              <h3 className="text-lg font-bold">
                Order History
              </h3>

              <p className="text-sm text-gray-500">
                Every order associated with this customer.
              </p>

            </div>

            <Eye
              size={20}
              className="text-lime-400"
            />

          </div>

          {loading ? (

            <div className="flex min-h-[220px] items-center justify-center">

              <RefreshCw
                size={28}
                className="animate-spin text-lime-400"
              />

            </div>

          ) : orders.length ===
            0 ? (

            <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-10 text-center">

              <Package
                size={38}
                className="mx-auto mb-3 text-gray-700"
              />

              <p className="font-semibold text-gray-400">
                No orders found
              </p>

              <p className="mt-1 text-sm text-gray-600">
                This customer has no recorded orders.
              </p>

            </div>

          ) : (

            <div className="space-y-4">

              {orders.map(
                (order) => (

                  <div
                    key={order._id}
                    className="rounded-2xl border border-white/10 bg-white/[0.03] p-5"
                  >

                    <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">

                      <div>

                        <p className="font-bold">
                          Order #
                          {order._id?.slice(
                            -8
                          )}
                        </p>

                        <p className="mt-1 text-xs text-gray-500">
                          {formatDate(
                            order.createdAt
                          )}
                        </p>

                      </div>

                      <div className="text-left sm:text-right">

                        <p className="text-xs text-gray-500">
                          Order Total
                        </p>

                        <p className="font-black text-lime-400">
                          {formatCurrency(
                            order.total
                          )}
                        </p>

                      </div>

                    </div>

                    {/* ORDER DETAILS */}

                    <div className="mb-4 grid gap-3 sm:grid-cols-3">

                      <div className="rounded-xl border border-white/10 bg-black/20 p-3">

                        <p className="text-xs text-gray-600">
                          Payment
                        </p>

                        <p className="mt-1 text-sm font-semibold">
                          {order.paymentMethod ||
                            "Online Payment"}
                        </p>

                      </div>

                      <div className="rounded-xl border border-white/10 bg-black/20 p-3">

                        <p className="text-xs text-gray-600">
                          Status
                        </p>

                        <p
                          className={`mt-1 text-sm font-semibold ${
                            order.status ===
                            "Cancelled"
                              ? "text-red-400"
                              : order.status ===
                                "Completed"
                                ? "text-lime-400"
                                : "text-cyan-400"
                          }`}
                        >
                          {order.status ||
                            "Processing"}
                        </p>

                      </div>

                      <div className="rounded-xl border border-white/10 bg-black/20 p-3">

                        <p className="text-xs text-gray-600">
                          Items
                        </p>

                        <p className="mt-1 text-sm font-semibold">
                          {Array.isArray(
                            order.items
                          )
                            ? order.items.length
                            : 0}
                        </p>

                      </div>

                    </div>

                    {/* GAMES */}

                    <div className="space-y-2">

                      {Array.isArray(
                        order.items
                      ) &&
                      order.items.length >
                        0 ? (
                        order.items.map(
                          (
                            item,
                            index
                          ) => (

                            <div
                              key={
                                item._id ||
                                index
                              }
                              className="flex items-center justify-between rounded-xl border border-white/10 bg-black/20 p-3"
                            >

                              <div className="flex items-center gap-3">

                                <div className="rounded-lg bg-lime-400/10 p-2 text-lime-400">

                                  <Gamepad2
                                    size={
                                      16
                                    }
                                  />

                                </div>

                                <div>

                                  <p className="text-sm font-semibold">
                                    {item.title ||
                                      item.name ||
                                      "Game"}
                                  </p>

                                  <p className="text-xs text-gray-600">
                                    Quantity:{" "}
                                    {item.qty ||
                                      item.quantity ||
                                      1}
                                  </p>

                                </div>

                              </div>

                              <p className="text-sm font-semibold text-gray-300">
                                {formatCurrency(
                                  item.price
                                )}
                              </p>

                            </div>

                          )
                        )
                      ) : (
                        <p className="text-sm text-gray-600">
                          No game details available.
                        </p>
                      )}

                    </div>

                  </div>

                )
              )}

            </div>

          )}

        </div>

      </div>

    </div>
  );
}

/* =========================================================
   MINI CUSTOMER STAT
========================================================= */

function MiniCustomerStat({
  title,
  value,
  icon,
}) {
  return (
    <div className="rounded-xl border border-white/10 bg-white/[0.03] p-4">

      <div className="mb-2 flex h-9 w-9 items-center justify-center rounded-lg bg-lime-400/10 text-lime-400">
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