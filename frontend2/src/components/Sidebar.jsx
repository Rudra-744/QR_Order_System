import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import gsap from "gsap";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import {
  FiGrid,
  FiShoppingBag,
  FiCoffee,
  FiSettings,
  FiLogOut,
  FiMenu,
  FiX,
  FiBarChart2,
  FiClock,
  FiLayers,
} from "react-icons/fi";

const navItems = [
  { id: "overview", label: "Dashboard", icon: FiGrid, section: "Menu" },
  { id: "orders", label: "Orders", icon: FiShoppingBag, badge: true, section: "Menu" },
  { id: "tables", label: "Tables", icon: FiLayers, section: "Menu" },
  { id: "menu", label: "Menus", icon: FiCoffee, section: "Menu" },
  { id: "history", label: "Order History", icon: FiClock, section: "Menu" },
  { id: "analytics", label: "Analytics", icon: FiBarChart2, section: "Menu" },
  { id: "settings", label: "Settings", icon: FiSettings, section: "Others" },
];

const Sidebar = ({ activeView, setActiveView, pendingCount = 0 }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);
  const logoRef = useRef(null);

  useEffect(() => {
    if (logoRef.current) {
      gsap.fromTo(
        logoRef.current,
        { scale: 0.8, opacity: 0 },
        { scale: 1, opacity: 1, duration: 0.6, ease: "back.out(1.7)" }
      );
    }
  }, []);

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  const menuItems = navItems.filter((i) => i.section === "Menu");
  const otherItems = navItems.filter((i) => i.section === "Others");

  const sidebarContent = (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="px-5 pt-6 pb-4">
        <div ref={logoRef} className="flex items-center gap-3">
          <div className="w-10 h-10 glass rounded-xl flex items-center justify-center">
            <FiCoffee className="text-[var(--color-accent)]" size={20} />
          </div>
          <h1 className="font-japanese text-3xl font-bold text-white tracking-wide pt-1">
            OrderFlow
          </h1>
        </div>
      </div>

      {/* Store Selector */}
      <div className="mx-4 mb-5">
        <div className="flex items-center gap-3 px-3 py-3 bg-white/5 rounded-xl border border-white/10">
          <div className="w-8 h-8 glass rounded-lg flex items-center justify-center text-[var(--color-accent)] font-bold text-xs">
            {user?.username?.charAt(0)?.toUpperCase() || "R"}
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-white text-sm truncate">
              {user?.username || "Restaurant"}
            </p>
            <p className="text-[11px] text-emerald-400 font-medium">● Open</p>
          </div>
        </div>
      </div>

      {/* Navigation - Menu Section */}
      <nav className="flex-1 px-3 overflow-y-auto custom-scrollbar">
        <p className="px-3 mb-2 text-[11px] font-semibold text-white/40 uppercase tracking-wider">
          Menu
        </p>
        <div className="space-y-0.5">
          {menuItems.map((item, index) => {
            const Icon = item.icon;
            const isActive = activeView === item.id;

            return (
              <motion.button
                key={item.id}
                initial={{ opacity: 0, x: -15 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.04 }}
                onClick={() => {
                  setActiveView(item.id);
                  setMobileOpen(false);
                }}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 ${
                  isActive
                    ? "glass text-white"
                    : "text-white/50 hover:text-white/80 hover:bg-white/5"
                }`}
              >
                <Icon size={18} className="flex-shrink-0" />
                <span className="truncate">{item.label}</span>
                {item.badge && pendingCount > 0 && (
                  <span
                    className={`ml-auto min-w-[20px] h-[20px] flex items-center justify-center rounded-full text-[10px] font-bold ${
                      isActive
                        ? "bg-white/20 text-white"
                        : "bg-white/15 text-white/80"
                    }`}
                  >
                    {pendingCount}
                  </span>
                )}
              </motion.button>
            );
          })}
        </div>

        {/* Others Section */}
        <p className="px-3 mt-6 mb-2 text-[11px] font-semibold text-white/40 uppercase tracking-wider">
          Others
        </p>
        <div className="space-y-0.5">
          {otherItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeView === item.id;

            return (
              <button
                key={item.id}
                onClick={() => {
                  setActiveView(item.id);
                  setMobileOpen(false);
                }}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 ${
                  isActive
                    ? "glass text-white"
                    : "text-white/50 hover:text-white/80 hover:bg-white/5"
                }`}
              >
                <Icon size={18} className="flex-shrink-0" />
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>
      </nav>

      {/* Footer - User & Logout */}
      <div className="p-3 mt-auto border-t border-white/10">
        <div className="flex items-center gap-3 px-3 py-2">
          <div className="w-9 h-9 bg-white/10 rounded-xl flex items-center justify-center">
            <img
              src={`https://api.dicebear.com/7.x/initials/svg?seed=${user?.username || "U"}&backgroundColor=d8684d&textColor=ffffff`}
              alt="avatar"
              className="w-9 h-9 rounded-xl"
            />
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-white text-sm truncate">
              {user?.username || "Admin"}
            </p>
            <p className="text-[11px] text-white/50">Admin</p>
          </div>
          <button
            onClick={handleLogout}
            className="p-2 rounded-lg text-white/40 hover:text-red-400 hover:bg-red-500/10 transition-all"
            title="Logout"
          >
            <FiLogOut size={16} />
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
        className="fixed top-4 left-4 z-[60] lg:hidden p-2.5 bg-[var(--color-navy)] text-white rounded-xl shadow-md border border-white/10"
      >
        {mobileOpen ? <FiX size={20} /> : <FiMenu size={20} />}
      </button>

      {/* Mobile Overlay */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setMobileOpen(false)}
            className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 lg:hidden"
          />
        )}
      </AnimatePresence>

      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex flex-col h-screen bg-[var(--color-navy)] border-r border-white/5 w-[240px] flex-shrink-0">
        {sidebarContent}
      </aside>

      {/* Mobile Sidebar */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.aside
            initial={{ x: "-100%" }}
            animate={{ x: 0 }}
            exit={{ x: "-100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed inset-y-0 left-0 z-50 w-[260px] bg-[var(--color-navy)] shadow-xl lg:hidden"
          >
            {sidebarContent}
          </motion.aside>
        )}
      </AnimatePresence>
    </>
  );
};

export default Sidebar;
