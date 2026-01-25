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
  FiDollarSign,
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
  const [editingItem, setEditingItem] = useState(null); // For editing
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
    const tl = gsap.timeline({
      onComplete: onClose,
    });

    tl.to(
      panelRef.current,
      {
        x: "100%",
        duration: 0.4,
        ease: "power3.inOut",
      },
      0,
    );

    tl.to(
      backdropRef.current,
      {
        opacity: 0,
        duration: 0.3,
        ease: "power2.out",
      },
      0,
    );
  };

  useEffect(() => {
    fetchMenu();

    gsap.set(panelRef.current, { x: "100%" });
    gsap.set(backdropRef.current, { opacity: 0 });

    const tl = gsap.timeline();

    tl.to(
      backdropRef.current,
      {
        opacity: 1,
        duration: 0.3,
        ease: "power2.out",
      },
      0,
    );

    tl.to(
      panelRef.current,
      {
        x: "0%",
        duration: 0.5,
        ease: "power4.out",
      },
      0.05,
    );
  }, []);

  const toggleItem = async (id, currentStatus) => {
    const newStatus = !currentStatus;
    setItems((prev) =>
      prev.map((i) => (i._id === id ? { ...i, isAvailable: newStatus } : i)),
    );
    try {
      await axios.put(`${API_URL}/menu/${id}/availability`, {
        isAvailable: newStatus,
      });
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
          } max-w-sm w-full bg-white shadow-2xl rounded-3xl pointer-events-auto ring-1 ring-black/5 overflow-hidden`}
        >
          <div className="p-6">
            {/* Icon */}
            <div className="flex items-center gap-4">
              <div className="flex-shrink-0 w-12 h-12 bg-red-100 rounded-2xl flex items-center justify-center">
                <FiTrash2 className="text-red-500" size={24} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-base font-bold text-gray-900">
                  Delete Item?
                </p>
                <p className="text-sm text-gray-500 truncate">"{name}"</p>
              </div>
            </div>

            {/* Buttons */}
            <div className="mt-5 flex gap-3">
              <button
                onClick={() => toast.dismiss(t.id)}
                className="flex-1 px-4 py-3 text-sm font-semibold text-gray-700 bg-gray-100 rounded-2xl hover:bg-gray-200 active:scale-95 transition-all"
              >
                Cancel
              </button>
              <button
                onClick={async () => {
                  toast.dismiss(t.id);
                  try {
                    await axios.delete(`${API_URL}/menu/${id}`);
                    setItems((prev) => prev.filter((i) => i._id !== id));
                    toast.success(`Deleted "${name}"`, {
                      icon: "🗑️",
                      style: {
                        background: "#fff",
                        color: "#333",
                        fontWeight: "600",
                        borderRadius: "16px",
                        padding: "16px 20px",
                      },
                    });
                  } catch (err) {
                    toast.error("Failed to delete", {
                      style: {
                        background: "#fff",
                        color: "#ef4444",
                        fontWeight: "600",
                        borderRadius: "16px",
                      },
                    });
                    fetchMenu();
                  }
                }}
                className="flex-1 px-4 py-3 text-sm font-semibold text-white bg-gradient-to-r from-red-500 to-rose-500 rounded-2xl hover:from-red-600 hover:to-rose-600 shadow-lg shadow-red-200 active:scale-95 transition-all"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      ),
      {
        duration: Infinity,
        position: "top-center",
      },
    );
  };

  const addNewItem = async () => {
    if (!newItem.name || !newItem.price || !newItem.category) {
      toast.error("Name, Price, and Category are required!", {
        style: {
          background: "#fff",
          color: "#ef4444",
          fontWeight: "600",
          borderRadius: "16px",
        },
      });
      return;
    }
    try {
      await axios.post(`${API_URL}/menu`, {
        ...newItem,
        price: Number(newItem.price),
      });
      toast.success(`"${newItem.name}" added to menu!`, {
        icon: "✅",
        style: {
          background: "#fff",
          color: "#333",
          fontWeight: "600",
          borderRadius: "16px",
          padding: "16px 20px",
        },
      });
      setNewItem({
        name: "",
        price: "",
        category: "",
        imageUrl: "",
        description: "",
        isBestseller: false,
      });
      setShowAddForm(false);
      setUseCustomCategory(false);
      fetchMenu();
    } catch (err) {
      toast.error("Failed to add item", {
        style: {
          background: "#fff",
          color: "#ef4444",
          fontWeight: "600",
          borderRadius: "16px",
        },
      });
    }
  };

  // Start editing an item
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

  // Update existing item
  const updateItem = async () => {
    if (!newItem.name || !newItem.price || !newItem.category) {
      toast.error("Name, Price, and Category are required!", {
        style: {
          background: "#fff",
          color: "#ef4444",
          fontWeight: "600",
          borderRadius: "16px",
        },
      });
      return;
    }
    try {
      await axios.put(`${API_URL}/menu/${editingItem._id}`, {
        ...newItem,
        price: Number(newItem.price),
      });
      toast.success(`"${newItem.name}" updated!`, {
        icon: "✅",
        style: {
          background: "#fff",
          color: "#333",
          fontWeight: "600",
          borderRadius: "16px",
          padding: "16px 20px",
        },
      });
      setNewItem({
        name: "",
        price: "",
        category: "",
        imageUrl: "",
        description: "",
        isBestseller: false,
      });
      setEditingItem(null);
      setShowAddForm(false);
      fetchMenu();
    } catch (err) {
      toast.error("Failed to update item", {
        style: {
          background: "#fff",
          color: "#ef4444",
          fontWeight: "600",
          borderRadius: "16px",
        },
      });
    }
  };

  const categories = ["All", ...new Set(items.map((i) => i.category))];

  const filteredItems =
    activeCategory === "All"
      ? items
      : items.filter((i) => i.category === activeCategory);

  const getCategoryEmoji = (cat) => {
    const lowerCat = cat.toLowerCase();
    if (lowerCat.includes("all")) return "✨";
    if (lowerCat.includes("laphing")) return "🍜";
    if (lowerCat.includes("momos")) return "🥟";
    if (lowerCat.includes("noodles") || lowerCat.includes("chowmein"))
      return "🍝";
    if (
      lowerCat.includes("beverage") ||
      lowerCat.includes("drink") ||
      lowerCat.includes("shake")
    )
      return "🥤";
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
        className="absolute inset-0 bg-black/30 backdrop-blur-sm"
        onClick={handleClose}
      />

      {/* Panel */}
      <div
        ref={panelRef}
        className="relative w-full max-w-lg h-full bg-white shadow-2xl flex flex-col overflow-hidden"
      >
        {/* Decorative gradient background */}
        <div className="absolute top-0 left-0 right-0 h-40 bg-gradient-to-br from-violet-100 via-purple-50 to-pink-100" />

        {/* Header */}
        <div className="relative z-10 p-6 pb-4">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-2xl font-bold text-gray-800 tracking-tight">
                Menu Manager
              </h2>
              <p className="text-gray-500 text-sm mt-1">
                {items.length} items in menu
              </p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => {
                  if (showAddForm) {
                    setShowAddForm(false);
                    setEditingItem(null);
                    setNewItem({
                      name: "",
                      price: "",
                      category: "",
                      imageUrl: "",
                      description: "",
                      isBestseller: false,
                    });
                  } else {
                    setShowAddForm(true);
                    setEditingItem(null);
                    setNewItem({
                      name: "",
                      price: "",
                      category: "",
                      imageUrl: "",
                      description: "",
                      isBestseller: false,
                    });
                  }
                }}
                className={`p-3 rounded-2xl font-medium transition-all duration-300 ${
                  showAddForm
                    ? "bg-red-100 text-red-500 rotate-45"
                    : "bg-emerald-500 text-white hover:bg-emerald-600 hover:scale-105"
                }`}
              >
                <FiPlus
                  size={22}
                  className="transition-transform duration-300"
                />
              </button>
              <button
                onClick={handleClose}
                className="p-3 bg-gray-100 text-gray-600 rounded-2xl hover:bg-gray-200 transition-all duration-300 hover:rotate-90"
              >
                <FiX size={22} />
              </button>
            </div>
          </div>
        </div>

        {/* Add New Item Form */}
        <div
          className={`relative z-10 overflow-hidden transition-all duration-500 ease-out ${
            showAddForm ? "max-h-[500px] opacity-100" : "max-h-0 opacity-0"
          }`}
        >
          <div className="mx-6 mb-4 p-5 bg-gradient-to-br from-emerald-50 to-green-50 border border-emerald-200 rounded-3xl shadow-sm">
            <h3 className="font-bold text-emerald-700 flex items-center gap-2 mb-4">
              <div className="p-2 bg-emerald-100 rounded-xl">
                {editingItem ? <FiEdit2 size={16} /> : <FiPackage size={16} />}
              </div>
              {editingItem ? "Edit Menu Item" : "Add New Menu Item"}
            </h3>

            {/* Item Name */}
            <div className="relative mb-3">
              <FiTag className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Item Name"
                value={newItem.name}
                onChange={(e) =>
                  setNewItem({ ...newItem, name: e.target.value })
                }
                className="w-full pl-11 pr-4 py-3.5 bg-white border border-gray-200 rounded-2xl text-gray-800 placeholder-gray-400 focus:outline-none focus:border-emerald-400 focus:ring-4 focus:ring-emerald-100 transition-all duration-300"
              />
            </div>

            {/* Price & Category Row */}
            <div className="flex gap-3 mb-3">
              <div className="relative w-28">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-medium">
                  ₹
                </span>
                <input
                  type="number"
                  placeholder="Price"
                  value={newItem.price}
                  onChange={(e) =>
                    setNewItem({ ...newItem, price: e.target.value })
                  }
                  className="w-full pl-9 pr-3 py-3.5 bg-white border border-gray-200 rounded-2xl text-gray-800 placeholder-gray-400 focus:outline-none focus:border-emerald-400 focus:ring-4 focus:ring-emerald-100 transition-all duration-300"
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
                    className="w-full px-4 py-3.5 bg-white border border-gray-200 rounded-2xl text-gray-800 appearance-none focus:outline-none focus:border-emerald-400 focus:ring-4 focus:ring-emerald-100 transition-all duration-300 cursor-pointer"
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
                  <FiChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                </div>
              ) : (
                <div className="flex-1 flex gap-2">
                  <input
                    type="text"
                    placeholder="New Category"
                    value={newItem.category}
                    onChange={(e) =>
                      setNewItem({ ...newItem, category: e.target.value })
                    }
                    className="flex-1 px-4 py-3.5 bg-emerald-50 border border-emerald-300 rounded-2xl text-emerald-700 placeholder-emerald-400 focus:outline-none focus:ring-4 focus:ring-emerald-100 transition-all duration-300"
                  />
                  <button
                    onClick={() => setUseCustomCategory(false)}
                    className="px-3 text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    ✕
                  </button>
                </div>
              )}
            </div>

            {/* Image URL */}
            <div className="relative mb-3">
              <FiImage className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Image URL (optional)"
                value={newItem.imageUrl}
                onChange={(e) =>
                  setNewItem({ ...newItem, imageUrl: e.target.value })
                }
                className="w-full pl-11 pr-4 py-3.5 bg-white border border-gray-200 rounded-2xl text-gray-800 placeholder-gray-400 focus:outline-none focus:border-emerald-400 focus:ring-4 focus:ring-emerald-100 transition-all duration-300"
              />
            </div>

            {/* Description */}
            <div className="relative mb-4">
              <FiFileText className="absolute left-4 top-4 text-gray-400" />
              <textarea
                placeholder="Description (optional)"
                value={newItem.description}
                onChange={(e) =>
                  setNewItem({ ...newItem, description: e.target.value })
                }
                className="w-full pl-11 pr-4 py-3.5 bg-white border border-gray-200 rounded-2xl text-gray-800 placeholder-gray-400 focus:outline-none focus:border-emerald-400 focus:ring-4 focus:ring-emerald-100 transition-all duration-300 resize-none h-20"
              />
            </div>

            {/* Actions Row */}
            <div className="flex items-center justify-between">
              <button
                onClick={() =>
                  setNewItem({
                    ...newItem,
                    isBestseller: !newItem.isBestseller,
                  })
                }
                className={`flex items-center gap-2 px-4 py-3 rounded-2xl text-sm font-semibold transition-all duration-300 ${
                  newItem.isBestseller
                    ? "bg-amber-400 text-white"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                <FiStar className={newItem.isBestseller ? "fill-white" : ""} />
                Bestseller
              </button>
              <button
                onClick={editingItem ? updateItem : addNewItem}
                className="flex items-center gap-2 px-6 py-3 bg-emerald-500 text-white rounded-2xl font-bold text-sm hover:bg-emerald-600 active:scale-95 transition-all duration-300"
              >
                <FiCheck size={18} />
                {editingItem ? "Update" : "Add Item"}
              </button>
            </div>
          </div>
        </div>

        {/* Category Tabs */}
        <div className="relative z-10 px-6 pb-4">
          <div className="flex gap-2 overflow-x-auto no-scrollbar pb-2">
            {categories.map((cat, index) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                style={{ animationDelay: `${index * 50}ms` }}
                className={`whitespace-nowrap px-5 py-3 rounded-2xl text-sm font-semibold transition-all duration-300 animate-fade-in-up flex items-center gap-2 ${
                  activeCategory === cat
                    ? "bg-violet-500 text-white"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                <span>{getCategoryEmoji(cat)}</span>
                <span>{cat}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Items List */}
        <div className="relative z-10 flex-1 overflow-y-auto px-6 pb-6">
          {isLoading ? (
            // Skeleton Loading
            <div className="space-y-3">
              {[1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className="bg-gray-100 rounded-3xl p-5 animate-pulse"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 bg-gray-200 rounded-2xl" />
                    <div className="flex-1">
                      <div className="h-5 bg-gray-200 rounded-full w-32 mb-2" />
                      <div className="h-4 bg-gray-200 rounded-full w-20" />
                    </div>
                    <div className="w-14 h-7 bg-gray-200 rounded-full" />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-3">
              {filteredItems.map((item, index) => (
                <div
                  key={item._id}
                  style={{ animationDelay: `${index * 50}ms` }}
                  className={`group relative overflow-hidden rounded-3xl transition-all duration-300 animate-fade-in-up hover:shadow-xl hover:scale-[1.02] active:scale-[0.98] ${
                    item.isAvailable
                      ? "bg-white border border-gray-100 shadow-sm hover:shadow-violet-100"
                      : "bg-red-50 border border-red-200"
                  }`}
                >
                  <div className="p-5 flex items-center gap-4">
                    {/* Image or Icon */}
                    {item.imageUrl ? (
                      <img
                        src={item.imageUrl}
                        alt={item.name}
                        className="w-16 h-16 rounded-2xl object-cover ring-4 ring-gray-100"
                      />
                    ) : (
                      <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-violet-100 to-purple-100 flex items-center justify-center text-3xl shadow-inner">
                        {getCategoryEmoji(item.category)}
                      </div>
                    )}

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3
                          className={`font-bold text-lg truncate ${
                            item.isAvailable ? "text-gray-800" : "text-red-700"
                          }`}
                        >
                          {item.name}
                        </h3>
                        {item.isBestseller && (
                          <span className="px-2.5 py-1 bg-gradient-to-r from-amber-400 to-orange-400 text-white text-[10px] font-bold rounded-full flex items-center gap-1 shadow-sm">
                            <FiStar size={10} className="fill-white" /> BEST
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-3 mt-1.5">
                        <span className="text-emerald-600 font-bold text-lg">
                          ₹{item.price}
                        </span>
                        <span
                          className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                            item.isAvailable
                              ? "bg-green-100 text-green-600"
                              : "bg-red-100 text-red-600"
                          }`}
                        >
                          {item.isAvailable ? "● In Stock" : "● Sold Out"}
                        </span>
                      </div>
                    </div>

                    {/* Toggle */}
                    <button
                      onClick={() => toggleItem(item._id, item.isAvailable)}
                      className={`p-2 rounded-2xl transition-all duration-300 ${
                        item.isAvailable
                          ? "text-emerald-500 hover:bg-emerald-50"
                          : "text-gray-400 hover:bg-gray-100"
                      }`}
                    >
                      {item.isAvailable ? (
                        <FiToggleRight
                          size={32}
                          className="transition-transform hover:scale-110"
                        />
                      ) : (
                        <FiToggleLeft
                          size={32}
                          className="transition-transform hover:scale-110"
                        />
                      )}
                    </button>

                    {/* Edit */}
                    <button
                      onClick={() => startEdit(item)}
                      className="p-2 rounded-2xl text-blue-400 hover:bg-blue-50 hover:text-blue-500 transition-all duration-300"
                      title="Edit item"
                    >
                      <FiEdit2
                        size={20}
                        className="transition-transform hover:scale-110"
                      />
                    </button>

                    {/* Delete */}
                    <button
                      onClick={() => deleteItem(item._id, item.name)}
                      className="p-2 rounded-2xl text-red-400 hover:bg-red-50 hover:text-red-500 transition-all duration-300"
                      title="Delete item"
                    >
                      <FiTrash2
                        size={20}
                        className="transition-transform hover:scale-110"
                      />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Bottom Gradient Fade */}
        <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-white to-transparent pointer-events-none z-20" />
      </div>

      {/* Custom Animations */}
      <style>{`
        @keyframes fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes slide-in-right {
          from { transform: translateX(100%); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
        @keyframes fade-in-up {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in {
          animation: fade-in 0.3s ease-out forwards;
        }
        .animate-slide-in-right {
          animation: slide-in-right 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
        .animate-fade-in-up {
          animation: fade-in-up 0.5s ease-out forwards;
          opacity: 0;
        }
      `}</style>
    </div>
  );
};

export default MenuManager;
