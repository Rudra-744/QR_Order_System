import React, { useEffect, useState } from "react";
import axios from "axios";
import { Toaster } from "react-hot-toast";
import { useSocket } from "../context/SocketContext";
import Sidebar from "../components/Sidebar";
import DashboardOverview from "../components/DashboardOverview";
import LiveOrders from "../components/LiveOrders";
import MenuManager from "../components/MenuManager";
import TablesView from "../components/TablesView";
import OrderHistory from "../components/OrderHistory";
import { useAuth } from "../context/AuthContext";
import { motion, AnimatePresence } from "framer-motion";
import { FiBarChart2, FiSettings, FiCoffee } from "react-icons/fi";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

const Dashboard = () => {
  const [orders, setOrders] = useState([]);
  const [activeView, setActiveView] = useState("overview");
  const [showMenuPanel, setShowMenuPanel] = useState(false);
  const socket = useSocket();
  const { user } = useAuth();

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const res = await axios.get(`${API_URL}/orders`);
      setOrders(res.data.data || res.data);
    } catch (err) {
      console.error("Fetch error", err);
    }
  };

  // Socket listeners for global state
  useEffect(() => {
    if (!socket || !user?.restaurantId) return;

    socket.emit("join_restaurant", user.restaurantId);

    const handleNewOrder = (newOrder) => {
      setOrders((prev) => {
        if (prev.find((o) => o._id === newOrder._id)) return prev;
        return [newOrder, ...prev];
      });
    };

    const handleUpdateOrder = (updatedOrder) => {
      setOrders((prev) =>
        prev.map((o) => (o._id === updatedOrder._id ? updatedOrder : o))
      );
    };

    socket.on("order:created", handleNewOrder);
    socket.on("order:update", handleUpdateOrder);

    return () => {
      socket.off("order:created", handleNewOrder);
      socket.off("order:update", handleUpdateOrder);
    };
  }, [socket, user]);

  const pendingCount = orders.filter((o) => o.status === "pending").length;

  // Handle menu view specially - it opens as a panel overlay
  const handleViewChange = (view) => {
    if (view === "menu") {
      setShowMenuPanel(true);
    } else {
      setActiveView(view);
    }
  };

  const renderView = () => {
    switch (activeView) {
      case "overview":
        return <DashboardOverview orders={orders} />;
      case "orders":
        return (
          <LiveOrders
            orders={orders}
            setOrders={setOrders}
            fetchOrders={fetchOrders}
          />
        );
      case "tables":
        return <TablesView />;
      case "history":
        return <OrderHistory orders={orders} />;
      case "analytics":
        return (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center justify-center min-h-[60vh] text-center"
          >
            <div className="w-24 h-24 bg-[var(--color-accent)]/10 rounded-3xl flex items-center justify-center mb-6">
              <FiBarChart2 size={40} className="text-[var(--color-accent)]" />
            </div>
            <h2 className="font-japanese text-3xl font-bold text-[var(--color-navy)] mb-2">
              Analytics Coming Soon
            </h2>
            <p className="text-gray-400 max-w-md">
              Advanced analytics with revenue graphs, customer insights, and
              peak hour analysis will be available in the next update.
            </p>
          </motion.div>
        );
      case "settings":
        return (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center justify-center min-h-[60vh] text-center"
          >
            <div className="w-24 h-24 bg-[var(--color-navy)]/5 rounded-3xl flex items-center justify-center mb-6">
              <FiSettings size={40} className="text-[var(--color-navy)]/50" />
            </div>
            <h2 className="font-japanese text-3xl font-bold text-[var(--color-navy)] mb-2">
              Settings Coming Soon
            </h2>
            <p className="text-gray-400 max-w-md">
              Customize your restaurant name, logo, currency, and notification
              preferences.
            </p>
          </motion.div>
        );
      default:
        return <DashboardOverview orders={orders} />;
    }
  };

  return (
    <div className="flex h-screen bg-[var(--color-cream)] overflow-hidden">
      {/* Sidebar */}
      <Sidebar
        activeView={activeView}
        setActiveView={handleViewChange}
        pendingCount={pendingCount}
      />

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto custom-scrollbar">
        {/* Top Bar */}
        <div className="sticky top-0 z-30 bg-[var(--color-cream)]/80 backdrop-blur-xl border-b border-[var(--color-navy)]/10 px-6 lg:px-10 py-4">
          <div className="flex items-center justify-between">
            <div className="lg:hidden" /> {/* spacer for mobile menu button */}
            <div className="flex items-center gap-3 ml-auto">
              <div className="hidden sm:flex items-center gap-2 bg-white px-4 py-2 rounded-xl border border-gray-100 shadow-sm">
                <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                <span className="text-xs font-medium text-gray-500">
                  Live
                </span>
              </div>
              <div className="w-9 h-9 bg-[var(--color-navy)] rounded-xl flex items-center justify-center text-[var(--color-cream)] font-bold text-sm">
                <FiCoffee size={18} />
              </div>
            </div>
          </div>
        </div>

        {/* Page Content */}
        <div className="px-6 lg:px-10 py-8">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeView}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.25 }}
            >
              {renderView()}
            </motion.div>
          </AnimatePresence>
        </div>
      </main>

      {/* Menu Manager Panel (slides from right) */}
      {showMenuPanel && (
        <MenuManager onClose={() => setShowMenuPanel(false)} />
      )}
    </div>
  );
};

export default Dashboard;
