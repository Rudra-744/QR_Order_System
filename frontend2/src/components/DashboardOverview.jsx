import React, { useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { useTables } from "../api/queries";
import {
  FiShoppingBag,
  FiTrendingUp,
  FiUsers,
  FiClock,
  FiBell,
  FiSettings,
  FiCheckCircle,
  FiArrowUpRight,
  FiCalendar,
} from "react-icons/fi";

// ─── FOOD IMAGES for activity cards (placeholder food photos) ─────────────────
const FOOD_IMGS = [
  "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=80&h=80&fit=crop",
  "https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=80&h=80&fit=crop",
  "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=80&h=80&fit=crop",
  "https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?w=80&h=80&fit=crop",
];

// ─── STATUS BADGE ─────────────────────────────────────────────────────────────
const StatusBadge = ({ status }) => {
  const map = {
    completed: { bg: "#d1fae5", color: "#065f46", label: "Completed" },
    pending:   { bg: "#fff7ed", color: "#c2410c", label: "Pending" },
    approved:  { bg: "#eff6ff", color: "#1d4ed8", label: "Approved" },
    preparing: { bg: "#fef3c7", color: "#b45309", label: "Preparing" },
    ready:     { bg: "#ecfdf5", color: "#047857", label: "Ready" },
    cancelled: { bg: "#fef2f2", color: "#b91c1c", label: "Cancelled" },
  };
  const s = map[status] || { bg: "#f3f4f6", color: "#374151", label: status };
  return (
    <span style={{
      background: s.bg, color: s.color,
      padding: "4px 10px", borderRadius: 999,
      fontSize: 12, fontWeight: 800, whiteSpace: "nowrap",
    }}>
      {s.label}
    </span>
  );
};

// ─── STRIPED PROGRESS BAR (exact D.CC style) ─────────────────────────────────
const StripedBar = ({ pct, color }) => (
  <div style={{ width: "100%", height: 10, background: "#f0f0f0", borderRadius: 6, overflow: "hidden" }}>
    <motion.div
      initial={{ width: 0 }}
      animate={{ width: `${pct}%` }}
      transition={{ duration: 1.2, ease: "easeOut" }}
      style={{
        height: "100%",
        borderRadius: 6,
        background: color,
        backgroundImage:
          "repeating-linear-gradient(45deg, rgba(255,255,255,0.25) 0px, rgba(255,255,255,0.25) 4px, transparent 4px, transparent 8px)",
      }}
    />
  </div>
);

// ─── CARD WRAPPER ─────────────────────────────────────────────────────────────
const Card = ({ children, style = {} }) => (
  <div style={{
    background: "#fff", borderRadius: 16,
    boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
    padding: 24, ...style
  }}>
    {children}
  </div>
);

// ─── SECTION LABEL ────────────────────────────────────────────────────────────
const SectionLabel = ({ children }) => (
  <span style={{ fontSize: 13, color: "#aaa", fontWeight: 700 }}>{children}</span>
);

// ─── MAIN COMPONENT ───────────────────────────────────────────────────────────
const DashboardOverview = ({ orders = [] }) => {
  const chartRef = useRef(null);
  const { data: tables = [] } = useTables();

  const today = new Date();
  const todayOrders = orders.filter(
    (o) => new Date(o.createdAt).toDateString() === today.toDateString()
  );

  const todayRevenue = todayOrders
    .filter((o) => o.status === "completed")
    .reduce((acc, o) => acc + (o.totalAmount || 0), 0);

  const pendingCount    = todayOrders.filter((o) => o.status === "pending").length;
  const inProgressCount = todayOrders.filter((o) => ["approved","preparing","ready"].includes(o.status)).length;
  const completedCount  = todayOrders.filter((o) => o.status === "completed").length;
  const totalToday      = todayOrders.length || 1;

  const availableTables = tables.filter(
    (t) => t.status !== "occupied" && t.status !== "payment_pending"
  ).length;

  // ── Hourly chart data ────────────────────────────────────────────────────────
  const months = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
  const monthlyData = Array.from({ length: 9 }, (_, i) => {
    const m = (today.getMonth() - 8 + i + 12) % 12;
    const rev = orders
      .filter((o) => new Date(o.createdAt).getMonth() === m && o.status === "completed")
      .reduce((a, b) => a + (b.totalAmount || 0), 0);
    return { label: months[m], rev, isCurrent: m === today.getMonth() };
  });
  const maxRev = Math.max(...monthlyData.map((d) => d.rev), 500);

  // ── Recent activity ──────────────────────────────────────────────────────────
  const recentActivity = [...todayOrders]
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .slice(0, 4);

  // ── Top Dishes ───────────────────────────────────────────────────────────────
  const itemCounts = {};
  orders.forEach((o) =>
    o.items?.forEach((item) => {
      const k = item.name || "Unknown";
      itemCounts[k] = (itemCounts[k] || 0) + (item.qty || 1);
    })
  );
  const topItems = Object.entries(itemCounts).sort(([,a],[,b]) => b-a).slice(0, 8);
  const maxQty = topItems[0]?.[1] || 1;

  return (
    <div style={{ display: "flex", gap: 20, height: "100%", paddingBottom: 24 }}>
      {/* ── LEFT + CENTER (3 cols) ───────────────────────────────────────────── */}
      <div style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column", gap: 20 }}>

        {/* TOP HEADER */}
        <Card style={{ padding: "18px 24px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12 }}>
            <div>
              <h1 style={{ fontWeight: 900, fontSize: 22, color: "#1a1a2e", margin: 0, lineHeight: 1.2 }}>Dashboard</h1>
              <p style={{ fontSize: 13, color: "#aaa", marginTop: 2, fontWeight: 600 }}>Welcome back!</p>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <button style={{ padding: "8px 18px", borderRadius: 10, border: "1px solid #e5e7eb", background: "#fff", fontSize: 14, fontWeight: 700, color: "#333", cursor: "pointer" }}>
                Subscription
              </button>
              <button style={{ padding: "8px 18px", borderRadius: 10, border: "1px solid #e5e7eb", background: "#fff", fontSize: 14, fontWeight: 700, color: "#333", cursor: "pointer" }}>
                Analytics
              </button>
              <div style={{ position: "relative" }}>
                <button style={{ width: 36, height: 36, borderRadius: 999, border: "1px solid #e5e7eb", background: "#fff", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: "#555" }}>
                  <FiBell size={16} />
                </button>
                {pendingCount > 0 && (
                  <span style={{ position: "absolute", top: -2, right: -2, width: 16, height: 16, background: "#334877", borderRadius: 999, border: "2px solid #f4f5f7", fontSize: 8, color: "#fff", fontWeight: 900, display: "flex", alignItems: "center", justifyContent: "center" }}>
                    {pendingCount}
                  </span>
                )}
              </div>
              <button style={{ width: 36, height: 36, borderRadius: 999, border: "1px solid #e5e7eb", background: "#fff", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: "#555" }}>
                <FiSettings size={16} />
              </button>
              <div style={{ width: 36, height: 36, borderRadius: 999, overflow: "hidden", border: "2px solid #e5e7eb" }}>
                <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=admin" alt="user" style={{ width: "100%", height: "100%" }} />
              </div>
            </div>
          </div>
        </Card>

        {/* STAT CARDS ROW */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16 }}>
          {/* Pending Orders */}
          <Card>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 }}>
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 4 }}>
                  <span style={{ fontSize: 17 }}>🛒</span>
                  <SectionLabel>Pending Orders</SectionLabel>
                </div>
                <div style={{ fontSize: 36, fontWeight: 900, color: "#1a1a2e", lineHeight: 1 }}>{String(pendingCount).padStart(2, "0")}</div>
              </div>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
              <SectionLabel>Total {totalToday}</SectionLabel>
              <span style={{ fontSize: 13, fontWeight: 800, color: "#555" }}>
                {Math.round((pendingCount / totalToday) * 100)}%
              </span>
            </div>
            <StripedBar pct={Math.round((pendingCount / totalToday) * 100)} color="#f5c518" />
          </Card>

          {/* Orders in Progress */}
          <Card>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 }}>
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 4 }}>
                  <span style={{ fontSize: 17 }}>📈</span>
                  <SectionLabel>Orders in Progress</SectionLabel>
                </div>
                <div style={{ fontSize: 36, fontWeight: 900, color: "#1a1a2e", lineHeight: 1 }}>{String(inProgressCount).padStart(2, "0")}</div>
              </div>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
              <SectionLabel>Total {totalToday}</SectionLabel>
              <span style={{ fontSize: 13, fontWeight: 800, color: "#555" }}>
                {Math.round((inProgressCount / totalToday) * 100)}%
              </span>
            </div>
            <StripedBar pct={Math.round((inProgressCount / totalToday) * 100)} color="#4ade80" />
          </Card>

          {/* Available Tables */}
          <Card>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 }}>
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 4 }}>
                  <span style={{ fontSize: 17 }}>🍽</span>
                  <SectionLabel>Available Tables</SectionLabel>
                </div>
                <div style={{ fontSize: 36, fontWeight: 900, color: "#1a1a2e", lineHeight: 1 }}>{String(availableTables).padStart(2, "0")}</div>
              </div>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
              <SectionLabel>Total Tables {tables.length}</SectionLabel>
              <span style={{ fontSize: 13, fontWeight: 800, color: "#555" }}>
                {tables.length > 0 ? Math.round((availableTables / tables.length) * 100) : 0}% Booked
              </span>
            </div>
            <StripedBar pct={tables.length > 0 ? Math.round(((tables.length - availableTables) / tables.length) * 100) : 0} color="#fb923c" />
          </Card>
        </div>

        {/* CHART ROW */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 280px", gap: 16 }}>
          {/* Total Revenue Chart */}
          <Card>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 4 }}>
              <div>
                <div style={{ fontWeight: 900, fontSize: 17, color: "#1a1a2e" }}>Total Revenue</div>
                <div style={{ fontSize: 13, color: "#aaa", fontWeight: 600, marginTop: 2 }}>Sales Overview</div>
              </div>
              <button style={{ display: "flex", alignItems: "center", gap: 6, padding: "6px 12px", borderRadius: 8, border: "1px solid #e5e7eb", background: "#fff", fontSize: 13, fontWeight: 700, color: "#555", cursor: "pointer" }}>
                <FiCalendar size={12} /> This Month ▾
              </button>
            </div>

            {/* Bar Chart */}
            <div style={{ display: "flex", alignItems: "flex-end", gap: 0, height: 200, marginTop: 20, position: "relative" }}>
              {/* Y-axis labels */}
              <div style={{ display: "flex", flexDirection: "column", justifyContent: "space-between", height: "100%", marginRight: 10, paddingBottom: 24 }}>
                {["1k","800","600","400","200","0"].map((l) => (
                  <span key={l} style={{ fontSize: 11, color: "#ccc", fontWeight: 700, lineHeight: 1 }}>{l}</span>
                ))}
              </div>

              {/* Bars */}
              <div style={{ flex: 1, display: "flex", alignItems: "flex-end", gap: 6, height: "100%" }} ref={chartRef}>
                {monthlyData.map((d, i) => {
                  const h = Math.max((d.rev / maxRev) * 160, 6);
                  return (
                    <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "flex-end", gap: 4, height: "100%" }}>
                      {d.isCurrent && d.rev > 0 && (
                        <div style={{
                          background: "#1a1a2e", color: "#fff",
                          fontSize: 11, fontWeight: 800,
                          padding: "4px 8px", borderRadius: 8,
                          whiteSpace: "nowrap", marginBottom: 4,
                          display: "flex", alignItems: "center", gap: 4,
                        }}>
                          <span style={{ color: "#ff6b35", fontSize: 13 }}>●</span> ₹ {d.rev.toLocaleString()}
                        </div>
                      )}
                      <motion.div
                        initial={{ height: 0 }}
                        animate={{ height: h }}
                        transition={{ duration: 0.8, delay: i * 0.06, ease: "easeOut" }}
                        style={{
                          width: "100%",
                          borderRadius: "6px 6px 0 0",
                          background: d.isCurrent
                            ? "#334877"
                            : "#f0f0f0",
                          backgroundImage: d.isCurrent
                            ? "repeating-linear-gradient(45deg,rgba(255,255,255,0.15) 0,rgba(255,255,255,0.15) 4px,transparent 4px,transparent 8px)"
                            : "none",
                          flexShrink: 0,
                        }}
                      />
                      <span style={{ fontSize: 11, color: d.isCurrent ? "#334877" : "#ccc", fontWeight: d.isCurrent ? 700 : 500 }}>
                        {d.label}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </Card>

          {/* Business Data */}
          <Card style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div style={{ fontWeight: 900, fontSize: 17, color: "#1a1a2e" }}>Business Data</div>
              <button style={{ display: "flex", alignItems: "center", gap: 6, padding: "4px 10px", borderRadius: 8, border: "1px solid #e5e7eb", background: "#fff", fontSize: 12, fontWeight: 700, color: "#555", cursor: "pointer" }}>
                <FiCalendar size={11} /> This Week ▾
              </button>
            </div>

            {/* Customers */}
            <div style={{ background: "#e8ecf4", borderRadius: 12, padding: "14px 16px", position: "relative" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ fontSize: 13, color: "#aaa", fontWeight: 700 }}>Number of Customers</span>
                <FiArrowUpRight size={14} color="#aaa" />
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 6 }}>
                <FiUsers size={16} color="#555" />
                <span style={{ fontSize: 24, fontWeight: 900, color: "#1a1a2e" }}>{todayOrders.length * 2 + completedCount}</span>
              </div>
            </div>

            {/* Total Orders */}
            <div style={{ background: "#fff8f5", borderRadius: 12, padding: "14px 16px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ fontSize: 13, color: "#aaa", fontWeight: 700 }}>Total Orders</span>
                <FiArrowUpRight size={14} color="#aaa" />
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 6 }}>
                <FiShoppingBag size={16} color="#555" />
                <span style={{ fontSize: 24, fontWeight: 900, color: "#1a1a2e" }}>{todayOrders.length}</span>
              </div>
            </div>

            {/* Average Order */}
            <div style={{ background: "#f0fdf4", borderRadius: 12, padding: "14px 16px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ fontSize: 13, color: "#aaa", fontWeight: 700 }}>Average Order Values</span>
                <FiArrowUpRight size={14} color="#aaa" />
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 4, marginTop: 6 }}>
                <span style={{ fontSize: 19, fontWeight: 800, color: "#16a34a" }}>₹</span>
                <span style={{ fontSize: 24, fontWeight: 900, color: "#1a1a2e" }}>
                  {completedCount > 0 ? Math.round(todayRevenue / completedCount).toLocaleString() : 0}
                </span>
              </div>
            </div>
          </Card>
        </div>

        {/* BOTTOM ROW: Recent Activity + Top Dishes */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
          {/* Recent Activity */}
          <Card>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
              <div style={{ fontWeight: 900, fontSize: 17, color: "#1a1a2e" }}>Recent Activity</div>
              <button style={{ background: "none", border: "none", cursor: "pointer", color: "#aaa" }}>
                <FiArrowUpRight size={18} />
              </button>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              {recentActivity.length > 0 ? recentActivity.map((order, i) => (
                <div key={order._id} style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <div style={{ width: 44, height: 44, borderRadius: 999, overflow: "hidden", flexShrink: 0, background: "#f0f0f0" }}>
                    <img
                      src={FOOD_IMGS[i % FOOD_IMGS.length]}
                      alt="food"
                      style={{ width: "100%", height: "100%", objectFit: "cover" }}
                    />
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 800, fontSize: 14, color: "#1a1a2e" }}>Status Changed</div>
                    <div style={{ fontSize: 12, color: "#aaa", fontWeight: 600, marginTop: 2, display: "flex", alignItems: "center", gap: 6 }}>
                      <span>₹ {order.totalAmount}</span>
                      <span>#{order.orderNumber}</span>
                      <FiClock size={10} />
                      <span>
                        {Math.round((Date.now() - new Date(order.createdAt)) / 60000)} min ago
                      </span>
                    </div>
                  </div>
                  <StatusBadge status={order.status} />
                </div>
              )) : (
                <div style={{ textAlign: "center", color: "#ccc", fontSize: 14, fontWeight: 700, padding: "24px 0" }}>
                  No activity today
                </div>
              )}
            </div>
          </Card>

          {/* Top Dishes */}
          <Card>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
              <div style={{ fontWeight: 900, fontSize: 17, color: "#1a1a2e" }}>Top Dishes</div>
              <button style={{ display: "flex", alignItems: "center", gap: 6, padding: "5px 12px", borderRadius: 8, border: "1px solid #e5e7eb", background: "#fff", fontSize: 12, fontWeight: 700, color: "#555", cursor: "pointer" }}>
                <FiCalendar size={11} /> This Month ▾
              </button>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              {topItems.length > 0 ? topItems.map(([name, qty], i) => {
                const pct = Math.round((qty / maxQty) * 100);
                return (
                  <div key={name} style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <div style={{ width: 32, height: 32, borderRadius: 8, overflow: "hidden", flexShrink: 0, background: "#f0f0f0" }}>
                      <img
                        src={FOOD_IMGS[i % FOOD_IMGS.length]}
                        alt="dish"
                        style={{ width: "100%", height: "100%", objectFit: "cover" }}
                      />
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                        <span style={{ fontSize: 13, fontWeight: 800, color: "#1a1a2e", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: "60%" }}>{name}</span>
                        <span style={{ fontSize: 13, fontWeight: 800, color: "#555", flexShrink: 0 }}>{qty}</span>
                      </div>
                      {/* Striped bar with arrow tip */}
                      <div style={{ position: "relative", display: "flex", alignItems: "center", gap: 4 }}>
                        <div style={{ flex: 1, height: 8, background: "#dde4f0", borderRadius: 4, overflow: "hidden" }}>
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${pct}%` }}
                            transition={{ duration: 1, delay: 0.3 + i * 0.07, ease: "easeOut" }}
                            style={{
                              height: "100%",
                              background: "linear-gradient(90deg, #6b84c2, #334877)",
                              backgroundImage: "repeating-linear-gradient(45deg,rgba(255,255,255,0.2) 0,rgba(255,255,255,0.2) 3px,transparent 3px,transparent 6px)",
                              borderRadius: 4,
                            }}
                          />
                        </div>
                        {/* Arrow indicator */}
                        <div style={{
                          width: 16, height: 16, background: "#334877",
                          borderRadius: 4, display: "flex", alignItems: "center",
                          justifyContent: "center", flexShrink: 0,
                        }}>
                          <span style={{ color: "#fff", fontSize: 8, fontWeight: 900 }}>▶</span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              }) : (
                <div style={{ textAlign: "center", color: "#ccc", fontSize: 14, fontWeight: 700, padding: "24px 0" }}>
                  No dishes yet
                </div>
              )}
            </div>
          </Card>
        </div>
      </div>

      {/* ── RIGHT SIDEBAR (STORES / TABLES) ─────────────────────────────────── */}
      <div style={{ width: 220, flexShrink: 0, display: "flex", flexDirection: "column", gap: 12 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingBottom: 4 }}>
          <span style={{ fontWeight: 900, fontSize: 17, color: "#1a1a2e" }}>Tables</span>
          <FiArrowUpRight size={16} color="#aaa" />
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 12, overflowY: "auto", flex: 1 }}>
          {tables.length > 0 ? tables.map((table, i) => {
            const isOccupied = table.status === "occupied" || table.status === "payment_pending";
            const imgs = [
              "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=300&h=150&fit=crop",
              "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=300&h=150&fit=crop",
              "https://images.unsplash.com/photo-1552566626-52f8b828add9?w=300&h=150&fit=crop",
              "https://images.unsplash.com/photo-1559339352-11d035aa65de?w=300&h=150&fit=crop",
            ];
            return (
              <div key={table._id} style={{
                borderRadius: 14,
                overflow: "hidden",
                position: "relative",
                height: 100,
                cursor: "pointer",
              }}>
                {/* Background image */}
                <img
                  src={imgs[i % imgs.length]}
                  alt="store"
                  style={{ width: "100%", height: "100%", objectFit: "cover" }}
                />
                {/* Dark overlay */}
                <div style={{
                  position: "absolute", inset: 0,
                  background: "linear-gradient(180deg, rgba(0,0,0,0.2) 0%, rgba(0,0,0,0.55) 100%)",
                }} />
                {/* Content */}
                <div style={{
                  position: "absolute", inset: 0, padding: "10px 12px",
                  display: "flex", flexDirection: "column", justifyContent: "space-between",
                }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                    <span style={{ color: "#fff", fontWeight: 800, fontSize: 14 }}>
                      Table {table.tableNumber}
                    </span>
                    <span style={{
                      background: isOccupied ? "#334877" : "#22c55e",
                      color: "#fff", fontSize: 10, fontWeight: 900,
                      padding: "2px 7px", borderRadius: 999,
                    }}>
                      {isOccupied ? "● Busy" : "● Open"}
                    </span>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
                    <span style={{ fontSize: 13 }}>📍</span>
                    <span style={{ color: "rgba(255,255,255,0.8)", fontSize: 12, fontWeight: 600 }}>
                      {isOccupied ? "Occupied" : "Available"}
                    </span>
                  </div>
                </div>
              </div>
            );
          }) : (
            <div style={{
              padding: "40px 20px", textAlign: "center",
              background: "#fff", borderRadius: 14,
              color: "#ccc", fontSize: 14, fontWeight: 700,
            }}>
              No tables added yet
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DashboardOverview;
