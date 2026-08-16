import React, { useEffect, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useOrders } from "../api/queries";
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
import { useSearchParams } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import SkeletonCard from "../components/ui/SkeletonCard";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

const Dashboard = () => {
  const queryClient = useQueryClient();
  const { data: orders = [], isLoading, isError } = useOrders();
  const [searchParams, setSearchParams] = useSearchParams();
  const activeView = searchParams.get("view") || "overview";
  const [showMenuPanel, setShowMenuPanel] = useState(false);
  const socket = useSocket();
  const { user } = useAuth();
  useEffect(() => {
    if (!socket || !user?.restaurantId) return;

    // ── FIX: join room immediately if already connected, else wait for connect
    const joinRoom = () => {
      socket.emit("join_restaurant", user.restaurantId);
    };

    const handleConnect = () => {
      joinRoom();
      queryClient.invalidateQueries({ queryKey: ['orders'] });
    };

    if (socket.connected) {
      joinRoom(); // already connected — join right away
    }
    socket.on("connect", handleConnect); // join on (re)connect

    const handleNewOrder = (newOrder) => {
      queryClient.setQueryData(['orders'], (prev = []) => {
        if (prev.find((o) => o._id === newOrder._id)) return prev;
        return [newOrder, ...prev];
      });
    };

    const handleUpdateOrder = (updatedOrder) => {
      queryClient.setQueryData(['orders'], (prev = []) =>
        prev.map((o) => (o._id === updatedOrder._id ? updatedOrder : o))
      );
    };

    socket.on("order:created", handleNewOrder);

    // ── FIX: backend emits specific events per status, not just "order:update"
    socket.on("order:update", handleUpdateOrder);
    socket.on("order:accepted", handleUpdateOrder);
    socket.on("order:preparing", handleUpdateOrder);
    socket.on("order:ready", handleUpdateOrder);
    socket.on("order:completed", handleUpdateOrder);
    socket.on("order:cancelled", handleUpdateOrder);

    return () => {
      socket.off("connect", handleConnect);
      socket.off("order:created", handleNewOrder);
      socket.off("order:update", handleUpdateOrder);
      socket.off("order:accepted", handleUpdateOrder);
      socket.off("order:preparing", handleUpdateOrder);
      socket.off("order:ready", handleUpdateOrder);
      socket.off("order:completed", handleUpdateOrder);
      socket.off("order:cancelled", handleUpdateOrder);
    };
  }, [socket, user]);

  const pendingCount = orders.filter((o) => o.status === "pending").length;

  const handleViewChange = (view) => {
    setSearchParams({ view });
  };

  const renderView = () => {
    switch (activeView) {
      case "overview":
        return <DashboardOverview orders={orders} />;
      case "orders":
        return (
          <LiveOrders
            orders={orders}
          />
        );
      case "tables":
        return <TablesView />;
      case "menu":
        return <MenuManager />;
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
    <div className="flex h-screen overflow-hidden" style={{ background: "#f4f5f7" }}>
      <Helmet>
        <title>Rimi Dashboard - Manage Orders & Menu</title>
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>
      {/* Sidebar */}
      <Sidebar
        activeView={activeView}
        setActiveView={handleViewChange}
        pendingCount={pendingCount}
      />

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto custom-scrollbar">
        {/* Page Content */}
        <div className="px-6 lg:px-8 py-6">
          {isError ? (
            <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4 text-red-500">
                <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-red-600 mb-2">Failed to load dashboard data</h2>
              <p className="text-gray-500 mb-6">Please check your connection or try again.</p>
              <button onClick={() => window.location.reload()} className="px-6 py-2 bg-[var(--color-navy)] text-white rounded-lg active:scale-95 transition-transform">
                Retry Connection
              </button>
            </div>
          ) : isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <SkeletonCard />
              <SkeletonCard />
              <SkeletonCard />
            </div>
          ) : (
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
          )}
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
