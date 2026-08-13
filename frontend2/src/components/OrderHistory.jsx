import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import axios from "axios";
import {
  FiClock,
  FiDollarSign,
  FiShoppingBag,
  FiFilter,
  FiDownload,
} from "react-icons/fi";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.05 } },
};

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

const OrderHistory = ({ orders = [] }) => {
  const [filter, setFilter] = useState("all");

  const historyOrders = orders
    .filter((o) => o.status === "completed" || o.status === "rejected")
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  const filtered =
    filter === "all"
      ? historyOrders
      : historyOrders.filter((o) => o.status === filter);

  const totalRevenue = historyOrders
    .filter((o) => o.status === "completed")
    .reduce((a, o) => a + o.totalAmount, 0);

  const completedCount = historyOrders.filter(
    (o) => o.status === "completed"
  ).length;
  const rejectedCount = historyOrders.filter(
    (o) => o.status === "rejected"
  ).length;

  // CSV export
  const exportCSV = () => {
    const headers = ["Order#,Table,Items,Total,Status,Time"];
    const rows = filtered.map(
      (o) =>
        `${o.orderNumber},${o.tableNumber},"${o.items.map((i) => `${i.qty}x ${i.name}`).join("; ")}",${o.totalAmount},${o.status},${new Date(o.createdAt).toLocaleString()}`
    );
    const csv = [headers, ...rows].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `orders_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
  };

  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="show"
      className="space-y-6"
    >
      {/* Header */}
      <motion.div variants={fadeUp} className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="font-japanese text-5xl font-bold text-[var(--color-navy)] tracking-wide">
            Order History
          </h1>
          <p className="text-[var(--color-navy)]/60 mt-2 text-sm font-medium">
            Review past orders and export data
          </p>
        </div>
        <button
          onClick={exportCSV}
          className="flex items-center gap-2 px-5 py-2.5 bg-[var(--color-navy)] border border-transparent rounded-xl text-sm font-semibold text-white hover:bg-[var(--color-navy)]/90 transition-all shadow-md"
        >
          <FiDownload size={16} className="text-[var(--color-accent)]" /> Export CSV
        </button>
      </motion.div>

      {/* Quick Stats */}
      <motion.div variants={fadeUp} className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-[var(--color-navy)] rounded-2xl p-5 border border-white/5 shadow-lg">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-emerald-500/20 rounded-xl flex items-center justify-center">
              <FiDollarSign className="text-emerald-400" size={20} />
            </div>
            <div>
              <p className="font-japanese text-4xl font-bold text-white tracking-wide">
                ₹{totalRevenue.toLocaleString()}
              </p>
              <p className="text-xs text-white/50 font-medium uppercase tracking-wider mt-1">
                Total Revenue
              </p>
            </div>
          </div>
        </div>
        <div className="bg-[var(--color-navy)] rounded-2xl p-5 border border-white/5 shadow-lg">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-500/20 rounded-xl flex items-center justify-center">
              <FiShoppingBag className="text-blue-400" size={20} />
            </div>
            <div>
              <p className="font-japanese text-4xl font-bold text-white tracking-wide">
                {completedCount}
              </p>
              <p className="text-xs text-white/50 font-medium uppercase tracking-wider mt-1">Completed</p>
            </div>
          </div>
        </div>
        <div className="bg-[var(--color-navy)] rounded-2xl p-5 border border-white/5 shadow-lg">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-red-500/20 rounded-xl flex items-center justify-center">
              <FiShoppingBag className="text-red-400" size={20} />
            </div>
            <div>
              <p className="font-japanese text-4xl font-bold text-white tracking-wide">
                {rejectedCount}
              </p>
              <p className="text-xs text-white/50 font-medium uppercase tracking-wider mt-1">Rejected</p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Filter */}
      <motion.div variants={fadeUp} className="flex items-center gap-2">
        <FiFilter size={16} className="text-[var(--color-navy)]/40" />
        {["all", "completed", "rejected"].map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              filter === f
                ? "bg-[var(--color-accent)] text-white shadow-sm"
                : "bg-white/50 text-[var(--color-navy)]/60 border border-[var(--color-navy)]/10 hover:bg-white"
            }`}
          >
            {f.charAt(0).toUpperCase() + f.slice(1)}
          </button>
        ))}
      </motion.div>

      {/* Table */}
      <motion.div
        variants={fadeUp}
        className="bg-[var(--color-navy)] rounded-2xl border border-white/5 shadow-lg overflow-hidden"
      >
        {filtered.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-white/5">
                <tr className="text-left text-white/40 font-medium text-xs uppercase tracking-wider border-b border-white/10">
                  <th className="px-6 py-3">Order</th>
                  <th className="px-6 py-3">Table</th>
                  <th className="px-6 py-3">Items</th>
                  <th className="px-6 py-3">Total</th>
                  <th className="px-6 py-3">Status</th>
                  <th className="px-6 py-3">Time</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {filtered.map((order, i) => (
                  <motion.tr
                    key={order._id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.03 }}
                    className="hover:bg-white/5 transition-colors"
                  >
                    <td className="px-6 py-4 font-mono text-xs font-bold text-[var(--color-accent)]">
                      {order.orderNumber}
                    </td>
                    <td className="px-6 py-4 font-bold text-white/90">
                      {order.tableNumber}
                    </td>
                    <td className="px-6 py-4 text-white/60 max-w-[250px] truncate">
                      {order.items
                        .map((i) => `${i.qty}x ${i.name || "Item"}`)
                        .join(", ")}
                    </td>
                    <td className="px-6 py-4 font-bold text-white">
                      ₹{order.totalAmount}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`px-2.5 py-1 rounded-lg text-xs font-bold ${
                          order.status === "completed"
                            ? "bg-emerald-500/20 text-emerald-400"
                            : "bg-red-500/20 text-red-400"
                        }`}
                      >
                        {order.status.toUpperCase()}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-white/40 text-xs">
                      {new Date(order.createdAt).toLocaleString([], {
                        month: "short",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-16 text-center text-white/40">
            <FiClock size={40} className="mx-auto mb-3 text-white/20" />
            <p className="font-medium">No orders found</p>
          </div>
        )}
      </motion.div>
    </motion.div>
  );
};

export default OrderHistory;
