import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import gsap from "gsap";
import toast from "react-hot-toast";
import {
  FiX,
  FiToggleLeft,
  FiToggleRight,
  FiPlus,
  FiImage,
  FiStar,
  FiPackage,
  FiTag,
  FiFileText,
  FiCheck,
  FiChevronDown,
  FiTrash2,
  FiEdit2,
} from "react-icons/fi";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

const MenuManager = ({ onClose }) => {
  const [items, setItems] = useState([]);
  const [activeCategory, setActiveCategory] = useState("All");
  const [showAddForm, setShowAddForm] = useState(false);
  const [useCustomCategory, setUseCustomCategory] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [editingItem, setEditingItem] = useState(null);
  const [newItem, setNewItem] = useState({
    name: "",
    price: "",
    category: "",
    imageUrl: "",
    description: "",
    isBestseller: false,
  });

  const panelRef = useRef(null);
  const backdropRef = useRef(null);

  const fetchMenu = async () => {
    setIsLoading(true);
    try {
      const res = await axios.get(`${API_URL}/menu`);
      setItems(res.data);
    } catch (error) {
      console.error("Failed to fetch menu");
    }
    setIsLoading(false);
  };

  const handleClose = () => {
    const tl = gsap.timeline({ onComplete: onClose });
    tl.to(panelRef.current, { x: "100%", duration: 0.4, ease: "power3.inOut" }, 0);
    tl.to(backdropRef.current, { opacity: 0, duration: 0.3, ease: "power2.out" }, 0);
  };

  useEffect(() => {
    fetchMenu();
    gsap.set(panelRef.current, { x: "100%" });
    gsap.set(backdropRef.current, { opacity: 0 });
    const tl = gsap.timeline();
    tl.to(backdropRef.current, { opacity: 1, duration: 0.3, ease: "power2.out" }, 0);
    tl.to(panelRef.current, { x: "0%", duration: 0.5, ease: "power4.out" }, 0.05);
  }, []);

  const toggleItem = async (id, currentStatus) => {
    const newStatus = !currentStatus;
    setItems((prev) =>
      prev.map((i) => (i._id === id ? { ...i, isAvailable: newStatus } : i))
    );
    try {
      await axios.put(`${API_URL}/menu/${id}/availability`, { isAvailable: newStatus });
    } catch (err) {
      alert("Failed to update status");
      fetchMenu();
    }
  };

  const deleteItem = (id, name) => {
    toast.custom(
      (t) => (
        <div
          className={`${
            t.visible ? "animate-enter" : "animate-leave"
          } max-w-sm w-full bg-white shadow-xl rounded-2xl pointer-events-auto ring-1 ring-black/5 overflow-hidden`}
        >
          <div className="p-5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-red-50 rounded-xl flex items-center justify-center">
                <FiTrash2 className="text-red-500" size={20} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-gray-900">Delete Item?</p>
                <p className="text-xs text-gray-500 truncate">"{name}"</p>
              </div>
            </div>
            <div className="mt-4 flex gap-2">
              <button
                onClick={() => toast.dismiss(t.id)}
                className="flex-1 px-4 py-2.5 text-sm font-medium text-gray-700 bg-gray-100 rounded-xl hover:bg-gray-200 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={async () => {
                  toast.dismiss(t.id);
                  try {
                    await axios.delete(`${API_URL}/menu/${id}`);
                    setItems((prev) => prev.filter((i) => i._id !== id));
                    toast.success(`Deleted "${name}"`);
                  } catch (err) {
                    toast.error("Failed to delete");
                    fetchMenu();
                  }
                }}
                className="flex-1 px-4 py-2.5 text-sm font-medium text-white bg-red-500 rounded-xl hover:bg-red-600 transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      ),
      { duration: Infinity, position: "top-center" }
    );
  };

  const addNewItem = async () => {
    if (!newItem.name || !newItem.price || !newItem.category) {
      toast.error("Name, Price, and Category are required!");
      return;
    }
    try {
      await axios.post(`${API_URL}/menu`, { ...newItem, price: Number(newItem.price) });
      toast.success(`"${newItem.name}" added to menu!`);
      setNewItem({ name: "", price: "", category: "", imageUrl: "", description: "", isBestseller: false });
      setShowAddForm(false);
      setUseCustomCategory(false);
      fetchMenu();
    } catch (err) {
      toast.error("Failed to add item");
    }
  };

  const startEdit = (item) => {
    setEditingItem(item);
    setNewItem({
      name: item.name,
      price: item.price.toString(),
      category: item.category,
      imageUrl: item.imageUrl || "",
      description: item.description || "",
      isBestseller: item.isBestseller || false,
    });
    setShowAddForm(true);
  };

  const updateItem = async () => {
    if (!newItem.name || !newItem.price || !newItem.category) {
      toast.error("Name, Price, and Category are required!");
      return;
    }
    try {
      await axios.put(`${API_URL}/menu/${editingItem._id}`, { ...newItem, price: Number(newItem.price) });
      toast.success(`"${newItem.name}" updated!`);
      setNewItem({ name: "", price: "", category: "", imageUrl: "", description: "", isBestseller: false });
      setEditingItem(null);
      setShowAddForm(false);
      fetchMenu();
    } catch (err) {
      toast.error("Failed to update item");
    }
  };

  const categories = ["All", ...new Set(items.map((i) => i.category))];
  const filteredItems =
    activeCategory === "All" ? items : items.filter((i) => i.category === activeCategory);

  const getCategoryEmoji = (cat) => {
    const lowerCat = cat.toLowerCase();
    if (lowerCat.includes("all")) return "✨";
    if (lowerCat.includes("laphing")) return "🍜";
    if (lowerCat.includes("momos")) return "🥟";
    if (lowerCat.includes("noodles") || lowerCat.includes("chowmein")) return "🍝";
    if (lowerCat.includes("beverage") || lowerCat.includes("drink") || lowerCat.includes("shake")) return "🥤";
    if (lowerCat.includes("dessert") || lowerCat.includes("cake")) return "🍰";
    if (lowerCat.includes("sides") || lowerCat.includes("fries")) return "🍟";
    if (lowerCat.includes("pizza") || lowerCat.includes("burger")) return "🍕";
    return "🍴";
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      {/* Backdrop */}
      <div
        ref={backdropRef}
        className="absolute inset-0 bg-black/20 backdrop-blur-sm"
        onClick={handleClose}
      />

      {/* Panel */}
      <div
        ref={panelRef}
        className="relative w-full max-w-lg h-full bg-[var(--color-navy)] shadow-xl flex flex-col overflow-hidden text-white"
      >
        {/* Header */}
        <div className="p-6 pb-4 border-b border-white/10">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="font-japanese text-3xl font-bold tracking-wide">Menu Manager</h2>
              <p className="text-white/50 text-sm mt-1">{items.length} items in menu</p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => {
                  if (showAddForm) {
                    setShowAddForm(false);
                    setEditingItem(null);
                    setNewItem({ name: "", price: "", category: "", imageUrl: "", description: "", isBestseller: false });
                  } else {
                    setShowAddForm(true);
                    setEditingItem(null);
                    setNewItem({ name: "", price: "", category: "", imageUrl: "", description: "", isBestseller: false });
                  }
                }}
                className={`p-2.5 rounded-xl transition-all shadow-lg ${
                  showAddForm
                    ? "bg-red-500/20 text-red-400 border border-red-500/50 rotate-45"
                    : "bg-[var(--color-accent)] text-white hover:bg-[var(--color-accent)]/90"
                }`}
              >
                <FiPlus size={20} className="transition-transform" />
              </button>
              <button
                onClick={handleClose}
                className="p-2.5 bg-white/5 text-white/50 rounded-xl hover:bg-white/10 hover:text-white transition-colors"
              >
                <FiX size={20} />
              </button>
            </div>
          </div>
        </div>

        {/* Add/Edit Form */}
        <div
          className={`overflow-hidden transition-all duration-400 ease-out ${
            showAddForm ? "max-h-[500px] opacity-100" : "max-h-0 opacity-0"
          }`}
        >
          <div className="mx-5 my-4 p-5 bg-white/5 border border-white/10 rounded-2xl shadow-inner">
            <h3 className="font-bold text-white flex items-center gap-2 mb-4 text-sm">
              <div className="p-1.5 bg-[var(--color-accent)]/20 text-[var(--color-accent)] rounded-lg">
                {editingItem ? <FiEdit2 size={14} /> : <FiPackage size={14} />}
              </div>
              {editingItem ? "Edit Menu Item" : "Add New Menu Item"}
            </h3>

            {/* Name */}
            <div className="relative mb-3">
              <FiTag className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/40" size={14} />
              <input
                type="text"
                placeholder="Item Name"
                value={newItem.name}
                onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
                className="w-full pl-10 pr-4 py-3 bg-black/20 border border-white/10 rounded-xl text-sm text-white placeholder-white/30 focus:outline-none focus:border-[var(--color-accent)] focus:ring-2 focus:ring-[var(--color-accent)]/20 transition-all"
              />
            </div>

            {/* Price & Category */}
            <div className="flex gap-2 mb-3">
              <div className="relative w-28">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/40 text-sm">₹</span>
                <input
                  type="number"
                  placeholder="Price"
                  value={newItem.price}
                  onChange={(e) => setNewItem({ ...newItem, price: e.target.value })}
                  className="w-full pl-8 pr-3 py-3 bg-black/20 border border-white/10 rounded-xl text-sm text-white placeholder-white/30 focus:outline-none focus:border-[var(--color-accent)] focus:ring-2 focus:ring-[var(--color-accent)]/20 transition-all"
                />
              </div>

              {!useCustomCategory ? (
                <div className="flex-1 relative">
                  <select
                    value={newItem.category}
                    onChange={(e) => {
                      if (e.target.value === "__NEW__") {
                        setUseCustomCategory(true);
                        setNewItem({ ...newItem, category: "" });
                      } else {
                        setNewItem({ ...newItem, category: e.target.value });
                      }
                    }}
                    className="w-full px-3.5 py-3 bg-black/20 border border-white/10 rounded-xl text-sm text-white appearance-none focus:outline-none focus:border-[var(--color-accent)] focus:ring-2 focus:ring-[var(--color-accent)]/20 transition-all cursor-pointer [&>option]:bg-[var(--color-navy)]"
                  >
                    <option value="">Select Category</option>
                    {categories
                      .filter((c) => c !== "All")
                      .map((cat) => (
                        <option key={cat} value={cat}>
                          {getCategoryEmoji(cat)} {cat}
                        </option>
                      ))}
                    <option value="__NEW__">➕ New Category</option>
                  </select>
                  <FiChevronDown className="absolute right-3.5 top-1/2 -translate-y-1/2 text-white/40 pointer-events-none" size={14} />
                </div>
              ) : (
                <div className="flex-1 flex gap-2">
                  <input
                    type="text"
                    placeholder="New Category"
                    value={newItem.category}
                    onChange={(e) => setNewItem({ ...newItem, category: e.target.value })}
                    className="flex-1 px-3.5 py-3 bg-black/20 border border-[var(--color-accent)]/50 rounded-xl text-sm text-white placeholder-white/30 focus:outline-none focus:border-[var(--color-accent)] focus:ring-2 focus:ring-[var(--color-accent)]/20 transition-all"
                  />
                  <button
                    onClick={() => setUseCustomCategory(false)}
                    className="px-2.5 text-white/40 hover:text-white/80"
                  >
                    ✕
                  </button>
                </div>
              )}
            </div>

            {/* Image URL */}
            <div className="relative mb-3">
              <FiImage className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/40" size={14} />
              <input
                type="text"
                placeholder="Image URL (optional)"
                value={newItem.imageUrl}
                onChange={(e) => setNewItem({ ...newItem, imageUrl: e.target.value })}
                className="w-full pl-10 pr-4 py-3 bg-black/20 border border-white/10 rounded-xl text-sm text-white placeholder-white/30 focus:outline-none focus:border-[var(--color-accent)] focus:ring-2 focus:ring-[var(--color-accent)]/20 transition-all"
              />
            </div>

            {/* Description */}
            <div className="relative mb-4">
              <FiFileText className="absolute left-3.5 top-3.5 text-white/40" size={14} />
              <textarea
                placeholder="Description (optional)"
                value={newItem.description}
                onChange={(e) => setNewItem({ ...newItem, description: e.target.value })}
                className="w-full pl-10 pr-4 py-3 bg-black/20 border border-white/10 rounded-xl text-sm text-white placeholder-white/30 focus:outline-none focus:border-[var(--color-accent)] focus:ring-2 focus:ring-[var(--color-accent)]/20 transition-all resize-none h-20 custom-scrollbar"
              />
            </div>

            {/* Actions */}
            <div className="flex items-center justify-between">
              <button
                onClick={() => setNewItem({ ...newItem, isBestseller: !newItem.isBestseller })}
                className={`flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                  newItem.isBestseller
                    ? "bg-amber-400 text-white"
                    : "bg-white/5 text-white/50 hover:bg-white/10 hover:text-white"
                }`}
              >
                <FiStar size={13} className={newItem.isBestseller ? "fill-white" : ""} />
                Bestseller
              </button>
              <button
                onClick={editingItem ? updateItem : addNewItem}
                className="flex items-center gap-1.5 px-5 py-2.5 bg-[var(--color-accent)] text-white rounded-xl font-semibold text-sm hover:bg-[var(--color-accent)]/90 active:scale-95 transition-all shadow-lg"
              >
                <FiCheck size={16} />
                {editingItem ? "Update" : "Add Item"}
              </button>
            </div>
          </div>
        </div>

        {/* Category Tabs */}
        <div className="px-5 pb-3">
          <div className="flex gap-1.5 overflow-x-auto no-scrollbar pb-1">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`whitespace-nowrap px-4 py-2.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 ${
                  activeCategory === cat
                    ? "bg-[var(--color-accent)] text-white shadow-md"
                    : "bg-white/5 text-white/60 hover:bg-white/10 hover:text-white"
                }`}
              >
                <span>{getCategoryEmoji(cat)}</span>
                <span>{cat}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Items List */}
        <div className="flex-1 overflow-y-auto px-5 pb-6 custom-scrollbar">
          {isLoading ? (
            <div className="space-y-3">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="bg-white/5 rounded-2xl p-5 animate-pulse">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 bg-white/10 rounded-xl" />
                    <div className="flex-1">
                      <div className="h-4 bg-white/10 rounded-full w-32 mb-2" />
                      <div className="h-3 bg-white/10 rounded-full w-20" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-2">
              {filteredItems.map((item) => (
                <div
                  key={item._id}
                  className={`group rounded-2xl transition-all border ${
                    item.isAvailable
                      ? "bg-white/5 border-white/10 hover:border-white/20 hover:shadow-sm"
                      : "bg-red-500/10 border-red-500/20"
                  }`}
                >
                  <div className="p-4 flex items-center gap-3.5">
                    {/* Image */}
                    {item.imageUrl ? (
                      <img
                        src={item.imageUrl}
                        alt={item.name}
                        className="w-14 h-14 rounded-xl object-cover ring-2 ring-gray-100"
                      />
                    ) : (
                      <div className="w-14 h-14 rounded-xl bg-[var(--color-accent)]/20 flex items-center justify-center text-2xl">
                        {getCategoryEmoji(item.category)}
                      </div>
                    )}

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3
                          className={`font-semibold text-sm truncate ${
                            item.isAvailable ? "text-white/90" : "text-red-400"
                          }`}
                        >
                          {item.name}
                        </h3>
                        {item.isBestseller && (
                          <span className="px-2 py-0.5 bg-amber-400 text-white text-[10px] font-bold rounded-md flex items-center gap-0.5">
                            <FiStar size={9} className="fill-white" /> BEST
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-[var(--color-accent)] font-bold text-sm">₹{item.price}</span>
                        <span
                          className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-md ${
                            item.isAvailable
                              ? "bg-emerald-500/20 text-emerald-400"
                              : "bg-red-500/20 text-red-400"
                          }`}
                        >
                          {item.isAvailable ? "● In Stock" : "● Sold Out"}
                        </span>
                      </div>
                    </div>

                    {/* Toggle */}
                    <button
                      onClick={() => toggleItem(item._id, item.isAvailable)}
                      className={`p-1.5 rounded-lg transition-colors ${
                        item.isAvailable ? "text-emerald-400 hover:bg-emerald-500/20" : "text-white/30 hover:bg-white/10 hover:text-white"
                      }`}
                    >
                      {item.isAvailable ? <FiToggleRight size={24} /> : <FiToggleLeft size={24} />}
                    </button>

                    {/* Edit */}
                    <button
                      onClick={() => startEdit(item)}
                      className="p-1.5 rounded-lg text-white/30 hover:bg-white/10 hover:text-white transition-colors"
                    >
                      <FiEdit2 size={16} />
                    </button>

                    {/* Delete */}
                    <button
                      onClick={() => deleteItem(item._id, item.name)}
                      className="p-1.5 rounded-lg text-white/30 hover:bg-red-500/20 hover:text-red-400 transition-colors"
                    >
                      <FiTrash2 size={16} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MenuManager;
