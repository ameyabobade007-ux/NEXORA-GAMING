import { BrowserRouter, Routes, Route } from "react-router-dom";

import Layout from "./components/Layout";
import Protected from "./components/Protected";

import Home from "./pages/Home";
import Store from "./pages/Store";
import GameDetails from "./pages/GameDetails";
import Compare from "./pages/Compare";
import Compatibility from "./pages/Compatibility";
import Wishlist from "./pages/Wishlist";
import Cart from "./pages/Cart";
import Checkout from "./pages/Checkout";
import Dashboard from "./pages/Dashboard";
import Orders from "./pages/Orders";
import Achievements from "./pages/Achievements";
import Profile from "./pages/Profile";

import Admin from "./pages/Admin";
import ProductsAdmin from "./pages/ProductsAdmin";
import InventoryAdmin from "./pages/InventoryAdmin";
import OrdersAdmin from "./pages/OrdersAdmin";
import CustomersAdmin from "./pages/CustomersAdmin";
import BillingAdmin from "./pages/BillingAdmin";
import ReportsAdmin from "./pages/ReportsAdmin";

import { Login, Register } from "./pages/Auth";

export default function App() {
  return (
    <BrowserRouter>
      <Layout>
        <Routes>
          {/* ================= PUBLIC ================= */}

          <Route path="/" element={<Home />} />
          <Route path="/store" element={<Store />} />
          <Route path="/game/:id" element={<GameDetails />} />
          <Route path="/compare" element={<Compare />} />
          <Route path="/compatibility" element={<Compatibility />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/cart" element={<Cart />} />

          {/* ================= CUSTOMER ================= */}

          <Route
            path="/wishlist"
            element={
              <Protected>
                <Wishlist />
              </Protected>
            }
          />

          <Route
            path="/checkout"
            element={
              <Protected>
                <Checkout />
              </Protected>
            }
          />

          <Route
            path="/dashboard"
            element={
              <Protected>
                <Dashboard />
              </Protected>
            }
          />

          <Route
            path="/orders"
            element={
              <Protected>
                <Orders />
              </Protected>
            }
          />

          <Route
            path="/achievements"
            element={
              <Protected>
                <Achievements />
              </Protected>
            }
          />

          <Route
            path="/profile"
            element={
              <Protected>
                <Profile />
              </Protected>
            }
          />

          {/* ================= ADMIN ONLY ================= */}

          <Route
            path="/admin"
            element={
              <Protected admin>
                <Admin />
              </Protected>
            }
          />

          <Route
            path="/admin/products"
            element={
              <Protected admin>
                <ProductsAdmin />
              </Protected>
            }
          />

          <Route
            path="/admin/inventory"
            element={
              <Protected admin>
                <InventoryAdmin />
              </Protected>
            }
          />

          <Route
            path="/admin/orders"
            element={
              <Protected admin>
                <OrdersAdmin />
              </Protected>
            }
          />

          <Route
            path="/admin/customers"
            element={
              <Protected admin>
                <CustomersAdmin />
              </Protected>
            }
          />

          <Route
            path="/admin/billing"
            element={
              <Protected admin>
                <BillingAdmin />
              </Protected>
            }
          />

          <Route
            path="/admin/reports"
            element={
              <Protected admin>
                <ReportsAdmin />
              </Protected>
            }
          />

          {/* ================= FALLBACK ================= */}

          <Route path="*" element={<Home />} />
        </Routes>
      </Layout>
    </BrowserRouter>
  );
}