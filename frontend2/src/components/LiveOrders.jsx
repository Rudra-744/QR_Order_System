import React, { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import gsap from "gsap";
import axios from "axios";
import toast from "react-hot-toast";
import { useSocket } from "../context/SocketContext";
import OrderTimer from "./OrderTimer";
import {
  FiCheck,
  FiX,
  FiCoffee,
  FiShoppingBag,
  FiBell,
} from "react-icons/fi";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

const orderCardVariants = {
  initial: { opacity: 0, y: 40, scale: 0.95 },
  animate: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { type: "spring", stiffness: 200, damping: 20 },
  },
  exit: {
    opacity: 0,
    scale: 0.9,
    y: -20,
    transition: { duration: 0.3 },
  },
};

const LiveOrders = ({ orders, setOrders, fetchOrders }) => {
  const socket = useSocket();
  const bellRef = useRef(null);

  useEffect(() => {
    if (!socket) return;

    const handleNewOrder = (newOrder) => {
      setOrders((prev) => {
        if (prev.find((o) => o._id === newOrder._id)) return prev;
        return [newOrder, ...prev];
      });
      toast.success(`New Order: Table ${newOrder.tableNumber} 🔔`);

      if (bellRef.current) {
        gsap.fromTo(
          bellRef.current,
          { rotation: -15 },
          {
            rotation: 15,
            duration: 0.1,
            repeat: 5,
            yoyo: true,
            ease: "power1.inOut",
            onComplete: () => gsap.set(bellRef.current, { rotation: 0 }),
          }
        );
      }
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
  }, [socket]);

  const handleStatus = async (id, status) => {
    setOrders((prev) =>
      prev.map((o) => (o._id === id ? { ...o, status } : o))
    );
    try {
      await axios.put(`${API_URL}/admin/orders/${id}/status`, { status });
      toast.success(`Order ${status}`);
    } catch (err) {
      toast.error("Failed to update");
      fetchOrders();
    }
  };

  const pendingOrders = orders.filter((o) => o.status === "pending");
  const acceptedOrders = orders.filter((o) => o.status === "approved");

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-8"
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h1 className="font-japanese text-5xl font-bold text-[var(--color-navy)] tracking-wide">
            Live Orders
          </h1>
          <motion.div
            ref={bellRef}
            className="relative"
            style={{ transformOrigin: "top center" }}
          >
            <FiBell size={24} className="text-[var(--color-cream)]" />
            {pendingOrders.length > 0 && (
              <motion.span
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center"
              >
                {pendingOrders.length}
              </motion.span>
            )}
          </motion.div>
        </div>
        <p className="text-[var(--color-navy)]/60 font-medium text-sm">
          Real-time updates via WebSocket
        </p>
      </div>

      {/* Pending Orders */}
      <section>
        <div className="flex items-center gap-3 mb-5">
          <div className="w-2 h-8 bg-[var(--color-accent)] rounded-full" />
          <h2 className="font-japanese text-3xl font-bold text-[var(--color-navy)] tracking-wide">New Orders</h2>
          {pendingOrders.length > 0 && (
            <span className="bg-amber-100 text-amber-700 text-sm font-bold px-3 py-1 rounded-full animate-pulse">
              {pendingOrders.length}
            </span>
          )}
        </div>

        {pendingOrders.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-[var(--color-navy)] border border-white/10 shadow-lg rounded-2xl p-16 text-center"
          >
            <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4">
              <FiCoffee className="text-white/20" size={36} />
            </div>
            <p className="text-white/80 font-medium text-lg">
              No pending orders
            </p>
            <p className="text-white/40 text-sm mt-1">
              New orders will appear here in real time
            </p>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
            <AnimatePresence mode="popLayout">
              {pendingOrders.map((order) => (
                <motion.div
                  key={order._id}
                  layout
                  variants={orderCardVariants}
                  initial="initial"
                  animate="animate"
                  exit="exit"
                  className="bg-[var(--color-navy)] rounded-2xl border border-white/10 overflow-hidden shadow-lg hover:shadow-[var(--color-accent)]/20 transition-shadow duration-300 group"
                >
                  {/* Card Header */}
                  <div className="p-5 border-b border-white/5">
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="text-[11px] font-bold text-white/40 uppercase tracking-wider">
                          Table
                        </span>
                        <div className="font-japanese text-4xl text-white font-bold -mt-1 tracking-wider">
                          {order.tableNumber}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <OrderTimer startTime={order.createdAt} />
                        <span className="bg-[var(--color-accent)] text-white text-[10px] font-bold px-2.5 py-1 rounded-lg">
                          NEW
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Items */}
                  <div className="p-5 space-y-2.5">
                    {order.items.map((item, idx) => (
                      <div
                        key={idx}
                        className="flex justify-between items-center text-sm"
                      >
                        <div className="flex items-center gap-2.5">
                          <span className="w-7 h-7 bg-[var(--color-accent)]/20 rounded-lg flex items-center justify-center text-xs font-bold text-[var(--color-accent)]">
                            {item.qty}
                          </span>
                          <span className="font-medium text-white/90">
                            {item.name || "Item"}
                          </span>
                        </div>
                        <span className="text-white/60 font-medium">
                          ₹{item.price ? item.price * item.qty : ""}
                        </span>
                      </div>
                    ))}
                    {order.note && (
                      <div className="bg-amber-500/10 text-amber-300 text-sm p-3 rounded-xl mt-3 border border-amber-500/20">
                        📝 {order.note}
                      </div>
                    )}
                    <div className="flex justify-between items-center pt-3 border-t border-white/5 mt-2">
                      <span className="text-xs font-medium text-white/50 uppercase tracking-wider">
                        Total
                      </span>
                      <span className="font-japanese font-bold text-[var(--color-accent)] text-3xl">
                        ₹{order.totalAmount}
                      </span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="p-4 bg-white/5 flex gap-3 border-t border-white/5">
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.97 }}
                      onClick={() => handleStatus(order._id, "rejected")}
                      className="flex-1 py-3 text-red-400 font-semibold rounded-xl border border-white/10 bg-white/5 hover:bg-red-500/20 hover:border-red-500/50 transition-all text-sm flex items-center justify-center gap-2"
                    >
                      <FiX size={16} /> Reject
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.97 }}
                      onClick={() => handleStatus(order._id, "approved")}
                      className="flex-1 py-3 bg-[var(--color-accent)] text-white font-semibold rounded-xl hover:bg-[var(--color-accent)]/90 transition-all text-sm flex items-center justify-center gap-2 shadow-lg"
                    >
                      <FiCheck size={16} /> Accept
                    </motion.button>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </section>

      {/* Preparing Orders */}
      <section>
        <div className="flex items-center gap-3 mb-5">
          <div className="w-2 h-8 bg-emerald-500 rounded-full" />
          <h2 className="font-japanese text-3xl font-bold text-[var(--color-navy)] tracking-wide">
            Kitchen Preparing
          </h2>
          {acceptedOrders.length > 0 && (
            <span className="bg-emerald-100 text-emerald-700 text-sm font-bold px-3 py-1 rounded-full">
              {acceptedOrders.length}
            </span>
          )}
        </div>

        {acceptedOrders.length === 0 ? (
          <div className="bg-[var(--color-navy)] border border-white/10 rounded-2xl p-10 text-center shadow-lg">
            <p className="text-white/40 font-medium">
              No orders being prepared
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
            <AnimatePresence mode="popLayout">
              {acceptedOrders.map((order) => (
                <motion.div
                  key={order._id}
                  layout
                  variants={orderCardVariants}
                  initial="initial"
                  animate="animate"
                  exit="exit"
                  className="bg-[var(--color-navy)] rounded-2xl border border-white/10 overflow-hidden shadow-lg"
                >
                  <div className="p-5 flex justify-between items-center border-b border-white/5">
                    <div>
                      <span className="text-[11px] font-bold text-white/40 uppercase tracking-wider">
                        Table
                      </span>
                      <div className="font-japanese text-4xl text-white font-bold -mt-1 tracking-wider">
                        {order.tableNumber}
                      </div>
                    </div>
                    <OrderTimer
                      startTime={order.updatedAt || order.createdAt}
                    />
                  </div>

                  <div className="p-5">
                    <div className="space-y-2">
                      {order.items.map((item, idx) => (
                        <div
                          key={idx}
                          className="flex items-center gap-2.5 text-sm"
                        >
                          <span className="w-7 h-7 bg-emerald-500/20 rounded-lg flex items-center justify-center text-xs font-bold text-emerald-400">
                            {item.qty}
                          </span>
                          <span className="font-medium text-white/90">
                            {item.name || "Item"}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="p-4 pt-0">
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.97 }}
                      onClick={() => handleStatus(order._id, "completed")}
                      className="w-full py-3 bg-emerald-500 text-white font-semibold rounded-xl hover:bg-emerald-600 transition-all text-sm flex items-center justify-center gap-2"
                    >
                      ✓ Food Ready
                    </motion.button>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </section>
    </motion.div>
  );
};

export default LiveOrders;
