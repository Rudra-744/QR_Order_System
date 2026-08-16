import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import {
  FiGrid,
  FiShoppingBag,
  FiCoffee,
  FiSettings,
  FiMenu,
  FiX,
  FiBarChart2,
  FiClock,
  FiLayers,
  FiHelpCircle,
  FiChevronDown,
  FiMoreVertical,
} from "react-icons/fi";

const navItems = [
  { id: "overview", label: "Dashboard", icon: FiGrid, section: "Menu" },
  { id: "orders", label: "Orders", icon: FiShoppingBag, badge: true, section: "Menu" },
  { id: "tables", label: "Tables", icon: FiLayers, section: "Menu" },
  { id: "menu", label: "Kitchen", icon: FiCoffee, section: "Menu" },
  { id: "history", label: "Menus", icon: FiMenu, section: "Menu" },
  { id: "analytics", label: "Analytics", icon: FiBarChart2, section: "Menu" },
  { id: "help", label: "Help", icon: FiHelpCircle, section: "Others" },
  { id: "settings", label: "Settings", icon: FiSettings, section: "Others" },
];

const Sidebar = ({ activeView, setActiveView, pendingCount = 0 }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  const menuItems = navItems.filter((i) => i.section === "Menu");
  const otherItems = navItems.filter((i) => i.section === "Others");

  const sidebarContent = (
    <div className="flex flex-col h-full" style={{ background: "#fff", borderRight: "1px solid #f0f0f0" }}>
      {/* Brand Logo — exact D.CC style */}
      <div className="flex items-center gap-3 px-5 py-6">
        <span style={{ fontFamily: 'Rink, sans-serif', fontSize: 36, color: "#1a1a2e", lineHeight: 1, letterSpacing: 1, fontWeight: 800 }}>
          rimi
        </span>
      </div>

      {/* Store Selector */}
      <div className="px-4 mb-5">
        <p style={{ fontSize: 12, fontWeight: 800, color: "#aaa", textTransform: "uppercase", letterSpacing: 1, paddingLeft: 4, marginBottom: 6 }}>
          Store
        </p>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            background: "#fafafa",
            border: "1px solid #eee",
            borderRadius: 10,
            padding: "10px 12px",
            cursor: "pointer",
          }}
        >
          <div
            style={{
              width: 32,
              height: 32,
              borderRadius: 8,
              overflow: "hidden",
              background: "#eee",
              flexShrink: 0,
            }}
          >
            <img
              src={`https://images.unsplash.com/photo-1567521464027-f127ff144326?w=64&h=64&fit=crop`}
              alt="store"
              style={{ width: "100%", height: "100%", objectFit: "cover" }}
            />
          </div>
          <span style={{ flex: 1, fontWeight: 800, fontSize: 14, color: "#1a1a2e", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
            {user?.username || "Restaurant"}
          </span>
          <FiChevronDown size={14} color="#aaa" />
        </div>
      </div>

      {/* Nav */}
      <nav style={{ flex: 1, padding: "0 12px", overflowY: "auto" }}>
        <p style={{ fontSize: 12, fontWeight: 800, color: "#aaa", textTransform: "uppercase", letterSpacing: 1, paddingLeft: 4, marginBottom: 8 }}>
          Menu
        </p>
        <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
          {menuItems.map((item, index) => {
            const Icon = item.icon;
            const isActive = activeView === item.id;
            return (
              <motion.button
                key={item.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.04 }}
                onClick={() => { setActiveView(item.id); setMobileOpen(false); }}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                  padding: "10px 14px",
                  borderRadius: 10,
                  border: "none",
                  cursor: "pointer",
                  fontSize: 14,
                  fontWeight: 700,
                  width: "100%",
                  textAlign: "left",
                  transition: "all 0.15s",
                  background: isActive
                    ? "#334877"
                    : "transparent",
                  color: isActive ? "#fff" : "#555",
                  boxShadow: isActive ? "0 4px 12px rgba(51,72,119,0.25)" : "none",
                }}
              >
                <Icon size={17} strokeWidth={isActive ? 2.5 : 2} style={{ flexShrink: 0 }} />
                <span style={{ flex: 1 }}>{item.label}</span>
                {item.badge && pendingCount > 0 && (
                  <span
                    style={{
                      minWidth: 20,
                      height: 20,
                      borderRadius: 999,
                      background: isActive ? "rgba(255,255,255,0.25)" : "#334877",
                      color: "#fff",
                      fontSize: 11,
                      fontWeight: 900,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    {pendingCount}
                  </span>
                )}
              </motion.button>
            );
          })}
        </div>

        <p style={{ fontSize: 12, fontWeight: 800, color: "#aaa", textTransform: "uppercase", letterSpacing: 1, paddingLeft: 4, marginTop: 24, marginBottom: 8 }}>
          Others
        </p>
        <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
          {otherItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeView === item.id;
            return (
              <button
                key={item.id}
                onClick={() => { if (item.id !== "help") setActiveView(item.id); setMobileOpen(false); }}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                  padding: "10px 14px",
                  borderRadius: 10,
                  border: "none",
                  cursor: "pointer",
                  fontSize: 14,
                  fontWeight: 700,
                  width: "100%",
                  textAlign: "left",
                  transition: "all 0.15s",
                  background: isActive ? "#334877" : "transparent",
                  color: isActive ? "#fff" : "#555",
                  boxShadow: isActive ? "0 4px 12px rgba(51,72,119,0.25)" : "none",
                }}
              >
                <Icon size={17} strokeWidth={2} style={{ flexShrink: 0 }} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>
      </nav>

      {/* User Profile Footer — exact D.CC */}
      <div style={{ padding: "12px 16px", borderTop: "1px solid #f0f0f0" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ position: "relative", flexShrink: 0 }}>
            <img
              src={`https://api.dicebear.com/7.x/initials/svg?seed=${user?.username || "A"}&backgroundColor=334877&textColor=ffffff`}
              alt="avatar"
              style={{ width: 38, height: 38, borderRadius: 999 }}
            />
            <div
              style={{
                position: "absolute",
                bottom: 0,
                right: 0,
                width: 10,
                height: 10,
                background: "#22c55e",
                borderRadius: 999,
                border: "2px solid #fff",
              }}
            />
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <p style={{ fontWeight: 800, fontSize: 14, color: "#1a1a2e", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
              {user?.username || "Admin"}
            </p>
            <p style={{ fontSize: 12, color: "#aaa", fontWeight: 600 }}>Admin</p>
          </div>
          <button
            onClick={handleLogout}
            style={{ padding: 6, borderRadius: 8, border: "none", background: "transparent", cursor: "pointer", color: "#aaa" }}
            title="Logout"
          >
            <FiMoreVertical size={16} />
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile Toggle */}
      <button
        onClick={() => setMobileOpen(!mobileOpen)}
        style={{
          position: "fixed", top: 16, left: 16, zIndex: 60,
          padding: "10px", background: "#fff", border: "1px solid #eee",
          borderRadius: 10, cursor: "pointer", display: "none",
        }}
        className="lg:!hidden"
      >
        {mobileOpen ? <FiX size={20} /> : <FiMenu size={20} />}
      </button>

      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={() => setMobileOpen(false)}
            style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.3)", zIndex: 40 }}
            className="lg:hidden"
          />
        )}
      </AnimatePresence>

      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex flex-col" style={{ width: 220, flexShrink: 0, height: "100vh" }}>
        {sidebarContent}
      </aside>

      {/* Mobile Sidebar */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.aside
            initial={{ x: "-100%" }} animate={{ x: 0 }} exit={{ x: "-100%" }}
            transition={{ type: "spring", damping: 20, stiffness: 200 }}
            style={{ position: "fixed", inset: 0, left: 0, top: 0, bottom: 0, width: 240, zIndex: 50 }}
            className="lg:hidden"
          >
            {sidebarContent}
          </motion.aside>
        )}
      </AnimatePresence>
    </>
  );
};

export default Sidebar;
