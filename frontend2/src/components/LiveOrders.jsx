import React, { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import gsap from "gsap";
import { useQueryClient } from "@tanstack/react-query";
import apiClient from "../api/apiClient";
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

const LiveOrders = ({ orders }) => {
  const socket = useSocket();
  const queryClient = useQueryClient();
  const bellRef = useRef(null);

  useEffect(() => {
    if (!socket) return;

    const handleNewOrder = (newOrder) => {
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

    socket.on("order:created", handleNewOrder);

    return () => {
      socket.off("order:created", handleNewOrder);
    };
  }, [socket]);

  const handleStatus = async (id, status) => {
    // Optimistic update
    queryClient.setQueryData(['orders'], (prev = []) =>
      prev.map((o) => (o._id === id ? { ...o, status } : o))
    );
    try {
      await apiClient.put(`/admin/orders/${id}/status`, { status }, { silent: true });
      toast.success(`Order ${status}`);
    } catch (err) {
      toast.error("Failed to update status");
      queryClient.invalidateQueries({ queryKey: ['orders'] });
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
          <h1 className="font-sans text-3xl font-bold text-[var(--color-navy)] tracking-tight">
            Live Orders
          </h1>
          <motion.div
            ref={bellRef}
            className="relative"
            style={{ transformOrigin: "top center" }}
          >
            <FiBell size={24} className="text-gray-400" />
            {pendingOrders.length > 0 && (
              <motion.span
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center border-2 border-white"
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
          <div className="w-2 h-6 bg-[var(--color-accent)] rounded-full" />
          <h2 className="font-sans text-xl font-bold text-gray-900 tracking-tight">New Orders</h2>
          {pendingOrders.length > 0 && (
            <span className="bg-orange-50 text-[var(--color-accent)] text-sm font-bold px-3 py-1 rounded-full animate-pulse">
              {pendingOrders.length}
            </span>
          )}
        </div>

        {pendingOrders.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-white border border-gray-100 shadow-sm rounded-2xl p-16 text-center"
          >
            <div className="w-16 h-16 bg-gray-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <FiCoffee className="text-gray-300" size={32} />
            </div>
            <p className="text-gray-500 font-bold text-lg">
              No pending orders
            </p>
            <p className="text-gray-400 text-sm mt-1 font-medium">
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
                  className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-300 group"
                >
                  {/* Card Header */}
                  <div className="p-5 border-b border-gray-50">
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">
                          Table
                        </span>
                        <div className="font-sans text-3xl text-gray-900 font-bold tracking-tight">
                          {order.tableNumber}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <OrderTimer startTime={order.createdAt} />
                        <span className="bg-orange-50 text-[var(--color-accent)] text-[10px] font-bold px-2.5 py-1 rounded-lg">
                          NEW
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Items */}
                  <div className="p-5 space-y-3">
                    {order.items.map((item, idx) => (
                      <div
                        key={idx}
                        className="flex justify-between items-center text-sm"
                      >
                        <div className="flex items-center gap-3">
                          <span className="w-6 h-6 bg-gray-50 rounded flex items-center justify-center text-xs font-bold text-gray-600">
                            {item.qty}
                          </span>
                          <span className="font-bold text-gray-800">
                            {item.name || "Item"}
                          </span>
                        </div>
                        <span className="text-gray-500 font-bold">
                          ₹{item.price ? item.price * item.qty : ""}
                        </span>
                      </div>
                    ))}
                    {order.note && (
                      <div className="bg-orange-50 text-[var(--color-accent)] text-sm p-3 rounded-xl mt-3 font-medium">
                        📝 {order.note}
                      </div>
                    )}
                    <div className="flex justify-between items-center pt-4 border-t border-gray-50 mt-2">
                      <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                        Total
                      </span>
                      <span className="font-sans font-bold text-gray-900 text-2xl">
                        ₹{order.totalAmount}
                      </span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="p-4 bg-gray-50/50 flex gap-3 border-t border-gray-50">
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.97 }}
                      onClick={() => handleStatus(order._id, "rejected")}
                      className="flex-1 py-2.5 text-red-500 font-bold rounded-xl border border-red-100 bg-white hover:bg-red-50 transition-all text-sm flex items-center justify-center gap-2"
                    >
                      <FiX size={16} /> Reject
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.97 }}
                      onClick={() => handleStatus(order._id, "approved")}
                      className="flex-1 py-2.5 bg-[var(--color-accent)] text-white font-bold rounded-xl hover:bg-orange-600 transition-all text-sm flex items-center justify-center gap-2 shadow-sm"
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
        <div className="flex items-center gap-3 mb-5 mt-8">
          <div className="w-2 h-6 bg-emerald-500 rounded-full" />
          <h2 className="font-sans text-xl font-bold text-gray-900 tracking-tight">
            Kitchen Preparing
          </h2>
          {acceptedOrders.length > 0 && (
            <span className="bg-emerald-50 text-emerald-600 text-sm font-bold px-3 py-1 rounded-full">
              {acceptedOrders.length}
            </span>
          )}
        </div>

        {acceptedOrders.length === 0 ? (
          <div className="bg-white border border-gray-100 rounded-2xl p-10 text-center shadow-sm">
            <p className="text-gray-400 font-bold">
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
                  className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-300"
                >
                  <div className="p-5 flex justify-between items-center border-b border-gray-50">
                    <div>
                      <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">
                        Table
                      </span>
                      <div className="font-sans text-3xl text-gray-900 font-bold tracking-tight">
                        {order.tableNumber}
                      </div>
                    </div>
                    <OrderTimer
                      startTime={order.updatedAt || order.createdAt}
                    />
                  </div>

                  <div className="p-5">
                    <div className="space-y-3">
                      {order.items.map((item, idx) => (
                        <div
                          key={idx}
                          className="flex items-center gap-3 text-sm"
                        >
                          <span className="w-6 h-6 bg-emerald-50 rounded flex items-center justify-center text-xs font-bold text-emerald-600">
                            {item.qty}
                          </span>
                          <span className="font-bold text-gray-800">
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
                      className="w-full py-3 bg-emerald-500 text-white font-bold rounded-xl hover:bg-emerald-600 transition-all text-sm flex items-center justify-center gap-2 shadow-sm"
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
