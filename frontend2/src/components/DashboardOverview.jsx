import React, { useEffect, useRef } from "react";
import { motion } from "framer-motion";
import gsap from "gsap";
import {
  FiShoppingBag,
  FiTrendingUp,
  FiUsers,
  FiDollarSign,
  FiArrowUp,
  FiArrowDown,
  FiCoffee,
  FiClock,
} from "react-icons/fi";

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.08 },
  },
};

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } },
};

const DashboardOverview = ({ orders = [] }) => {
  const statsRef = useRef([]);
  const chartRef = useRef(null);

  const todayOrders = orders.filter((o) => {
    const today = new Date();
    const orderDate = new Date(o.createdAt);
    return orderDate.toDateString() === today.toDateString();
  });

  const todayRevenue = todayOrders
    .filter((o) => o.status === "completed")
    .reduce((acc, o) => acc + o.totalAmount, 0);

  const pendingCount = todayOrders.filter((o) => o.status === "pending").length;
  const completedCount = todayOrders.filter(
    (o) => o.status === "completed"
  ).length;

  const stats = [
    {
      label: "Today's Revenue",
      value: `₹${todayRevenue.toLocaleString()}`,
      icon: FiDollarSign,
      change: "+12%",
      positive: true,
      iconColor: "text-emerald-500",
      iconBg: "bg-emerald-50",
    },
    {
      label: "Total Orders",
      value: todayOrders.length,
      icon: FiShoppingBag,
      change: `${pendingCount} pending`,
      positive: null,
      iconColor: "text-[var(--color-cream)]",
      iconBg: "bg-[var(--color-cream)]/10",
    },
    {
      label: "Completed",
      value: completedCount,
      icon: FiTrendingUp,
      change: `${todayOrders.length > 0 ? Math.round((completedCount / todayOrders.length) * 100) : 0}%`,
      positive: true,
      iconColor: "text-blue-500",
      iconBg: "bg-blue-50",
    },
    {
      label: "Avg Order Value",
      value: `₹${completedCount > 0 ? Math.round(todayRevenue / completedCount) : 0}`,
      icon: FiUsers,
      change: "per order",
      positive: null,
      iconColor: "text-rose-500",
      iconBg: "bg-rose-50",
    },
  ];

  // Animate stat numbers on mount
  useEffect(() => {
    statsRef.current.forEach((el, i) => {
      if (el) {
        gsap.fromTo(
          el,
          { innerText: 0 },
          {
            duration: 1.2,
            delay: i * 0.15,
            ease: "power2.out",
          }
        );
      }
    });
  }, []);

  // Animate chart bars
  useEffect(() => {
    if (chartRef.current) {
      const bars = chartRef.current.querySelectorAll(".chart-bar");
      gsap.fromTo(
        bars,
        { scaleY: 0, transformOrigin: "bottom" },
        {
          scaleY: 1,
          duration: 0.8,
          stagger: 0.05,
          ease: "elastic.out(1, 0.5)",
          delay: 0.4,
        }
      );
    }
  }, []);

  // Generate hourly order data for chart
  const hourlyData = Array.from({ length: 12 }, (_, i) => {
    const hour = i + 8; // 8 AM to 8 PM
    const count = todayOrders.filter((o) => {
      const h = new Date(o.createdAt).getHours();
      return h === hour;
    }).length;
    return { hour: `${hour > 12 ? hour - 12 : hour}${hour >= 12 ? "PM" : "AM"}`, count };
  });

  const maxCount = Math.max(...hourlyData.map((d) => d.count), 1);

  // Recent orders (last 5)
  const recentOrders = [...todayOrders]
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .slice(0, 5);

  // Top selling items
  const itemCounts = {};
  todayOrders.forEach((o) => {
    o.items.forEach((item) => {
      const key = item.name || "Unknown";
      itemCounts[key] = (itemCounts[key] || 0) + item.qty;
    });
  });
  const topItems = Object.entries(itemCounts)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5);

  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="show"
      className="space-y-8"
    >
      {/* Page Title */}
      <motion.div variants={fadeUp} className="flex items-center justify-between">
        <div>
          <h1 className="font-japanese text-5xl font-bold text-[var(--color-navy)] tracking-wide">
            Dashboard
          </h1>
          <p className="text-[var(--color-navy)]/60 mt-2 text-sm font-medium">
            Welcome back! Here's what's happening today.
          </p>
        </div>
        <div className="hidden sm:flex items-center gap-2 bg-[var(--color-navy)] px-4 py-2.5 rounded-xl shadow-md">
          <FiClock size={16} className="text-[var(--color-accent)]" />
          <span className="text-sm font-medium text-white/90">
            {new Date().toLocaleDateString("en-US", {
              weekday: "long",
              month: "short",
              day: "numeric",
            })}
          </span>
        </div>
      </motion.div>

      {/* Stats Grid */}
      <motion.div
        variants={fadeUp}
        className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5"
      >
        {stats.map((stat, i) => {
          const Icon = stat.icon;
          return (
            <motion.div
              key={stat.label}
              whileHover={{ y: -2, transition: { duration: 0.2 } }}
              className="bg-[var(--color-navy)] rounded-2xl p-5 shadow-lg border border-white/5"
            >
              <div className="flex items-center justify-between mb-3">
                <div
                  className={`w-10 h-10 ${stat.iconBg} rounded-xl flex items-center justify-center`}
                >
                  <Icon size={20} className={stat.iconColor} />
                </div>
                {stat.positive !== null && (
                  <span
                    className={`flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-md ${
                      stat.positive
                        ? "bg-emerald-50 text-emerald-600"
                        : "bg-red-50 text-red-500"
                    }`}
                  >
                    {stat.positive ? (
                      <FiArrowUp size={11} />
                    ) : (
                      <FiArrowDown size={11} />
                    )}
                    {stat.change}
                  </span>
                )}
                {stat.positive === null && (
                  <span className="text-[11px] font-medium text-white/60 px-2 py-0.5 bg-white/10 rounded-md">
                    {stat.change}
                  </span>
                )}
              </div>
              <p
                ref={(el) => (statsRef.current[i] = el)}
                className="font-japanese text-4xl font-bold text-white tracking-wide"
              >
                {stat.value}
              </p>
              <p className="text-xs text-white/50 mt-2 font-medium uppercase tracking-wider">
                {stat.label}
              </p>
            </motion.div>
          );
        })}
      </motion.div>

      {/* Charts + Trending Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Hourly Orders Chart */}
        <motion.div
          variants={fadeUp}
          className="lg:col-span-2 bg-[var(--color-navy)] rounded-2xl p-6 shadow-lg border border-white/5"
        >
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="font-japanese text-2xl font-bold text-white tracking-wide">
                Order Activity
              </h3>
              <p className="text-white/50 text-sm mt-1">Hourly breakdown today</p>
            </div>
            <div className="flex gap-2">
              {["Today", "Week", "Month"].map((t, i) => (
                <button
                  key={t}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                    i === 0
                      ? "bg-[var(--color-accent)] text-white shadow-sm"
                      : "text-white/40 hover:text-white hover:bg-white/10"
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          <div
            ref={chartRef}
            className="flex items-end gap-2 h-[200px] px-2"
          >
            {hourlyData.map((d, i) => (
              <div
                key={i}
                className="flex-1 flex flex-col items-center justify-end gap-2"
              >
                <span className="text-[11px] font-bold text-white/50">
                  {d.count || ""}
                </span>
                <div
                  className="chart-bar w-full rounded-t-lg bg-[var(--color-cream)] min-h-[4px] transition-all hover:opacity-80"
                  style={{
                    height: `${Math.max((d.count / maxCount) * 160, 4)}px`,
                  }}
                />
                <span className="text-[10px] text-white/40 font-medium">
                  {d.hour}
                </span>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Trending Items */}
        <motion.div
          variants={fadeUp}
          className="bg-[var(--color-navy)] rounded-2xl p-6 shadow-lg border border-white/5"
        >
          <h3 className="font-japanese text-2xl font-bold text-white tracking-wide mb-1">
            Trending Items
          </h3>
          <p className="text-white/50 text-sm mb-5 mt-1">
            Top selling items today
          </p>

          {topItems.length > 0 ? (
            <div className="space-y-4">
              {topItems.map(([name, qty], i) => (
                <motion.div
                  key={name}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 + i * 0.1 }}
                  className="flex items-center gap-3"
                >
                  <span className="w-7 h-7 bg-[var(--color-accent)]/20 rounded-lg flex items-center justify-center text-xs font-bold text-[var(--color-accent)]">
                    #{i + 1}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-white/90 truncate">
                      {name}
                    </p>
                    <div className="mt-1 h-1.5 bg-white/10 rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{
                          width: `${(qty / topItems[0][1]) * 100}%`,
                        }}
                        transition={{ duration: 0.8, delay: 0.5 + i * 0.1 }}
                        className="h-full bg-[var(--color-cream)] rounded-full"
                      />
                    </div>
                  </div>
                  <span className="text-sm font-bold text-white/60">
                    {qty}x
                  </span>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-8 text-gray-300">
              <FiCoffee size={40} />
              <p className="text-sm mt-3 text-gray-400">No orders yet today</p>
            </div>
          )}
        </motion.div>
      </div>

      {/* Recent Orders */}
      <motion.div
        variants={fadeUp}
        className="bg-[var(--color-navy)] rounded-2xl shadow-lg border border-white/5 overflow-hidden"
      >
        <div className="p-6 pb-4 flex items-center justify-between">
          <div>
            <h3 className="font-japanese text-2xl font-bold text-white tracking-wide">
              Recent Orders
            </h3>
            <p className="text-white/50 text-sm mt-1">Latest activity</p>
          </div>
        </div>

        {recentOrders.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-white/5 border-b border-white/10">
                <tr className="text-left text-white/40 font-medium text-xs uppercase tracking-wider">
                  <th className="px-6 py-3">Order</th>
                  <th className="px-6 py-3">Table</th>
                  <th className="px-6 py-3">Items</th>
                  <th className="px-6 py-3">Amount</th>
                  <th className="px-6 py-3">Status</th>
                  <th className="px-6 py-3">Time</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {recentOrders.map((order, i) => (
                  <motion.tr
                    key={order._id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.1 * i }}
                    className="hover:bg-white/5 transition-colors"
                  >
                    <td className="px-6 py-4 font-mono text-xs font-bold text-[var(--color-accent)]">
                      {order.orderNumber}
                    </td>
                    <td className="px-6 py-4">
                      <span className="font-bold text-white/90">
                        {order.tableNumber}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-white/60 max-w-[200px] truncate">
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
                          order.status === "pending"
                            ? "bg-amber-500/20 text-amber-400"
                            : order.status === "approved"
                            ? "bg-blue-500/20 text-blue-400"
                            : order.status === "completed"
                            ? "bg-emerald-500/20 text-emerald-400"
                            : "bg-red-500/20 text-red-400"
                        }`}
                      >
                        {order.status.toUpperCase()}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-white/40 text-xs">
                      {new Date(order.createdAt).toLocaleTimeString([], {
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
          <div className="p-12 text-center text-white/30">
            <FiShoppingBag size={40} className="mx-auto mb-3" />
            <p className="text-white/40">No orders today yet</p>
          </div>
        )}
      </motion.div>
    </motion.div>
  );
};

export default DashboardOverview;
