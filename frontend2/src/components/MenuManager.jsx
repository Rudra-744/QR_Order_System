/**
 * MenuManager — Full D.CC-style 3-view Menu Management
 *
 * View 1: MENU LIST — cards grid (Spring Menu, Main Menu, etc.)
 *         Click card → goes to View 2
 *         "..." → Menu Details (View 2) | Delete Menu
 *         "+ Add Menu" → creates a new named menu group
 *
 * View 2: MENU DETAIL — 3-panel layout
 *         Left: Dish Categories list + "+ New Category"
 *         Center: Items in selected category + Edit/Delete per item
 *         Right: "+ Add Dish" | Dish Sorting
 *
 * View 3: ADD / EDIT PRODUCT — full form
 *         Category, Image URL, Name, Description, Price, Bestseller
 *         Cancel → back to View 2
 *
 * Backend: menuGroup field on MenuItem (default "Main Menu")
 */

import React, { useEffect, useState, useCallback, useRef } from "react";
import apiClient from "../api/apiClient";
import toast from "react-hot-toast";
import { useAuth } from "../context/AuthContext";
import {
  FiPlus, FiArrowLeft, FiEdit2, FiTrash2,
  FiMoreHorizontal, FiGrid, FiList, FiToggleLeft,
  FiToggleRight, FiUploadCloud, FiStar, FiChevronDown,
  FiX, FiCheck, FiAlignJustify,
} from "react-icons/fi";

const FONT = "'Manrope', system-ui, sans-serif";

// ─── TOGGLE ──────────────────────────────────────────────────────────────────
const Toggle = ({ checked, onChange, size = "md" }) => {
  const w = size === "sm" ? 32 : 40;
  const h = size === "sm" ? 18 : 22;
  const dot = size === "sm" ? 12 : 16;
  const gap = size === "sm" ? 3 : 3;
  return (
    <button
      onClick={onChange}
      role="switch"
      aria-checked={checked}
      style={{
        width: w, height: h, borderRadius: 999, border: "none",
        background: checked ? "#334877" : "#d1d5db",
        position: "relative", cursor: "pointer", flexShrink: 0,
        transition: "background 0.2s",
      }}
    >
      <span style={{
        position: "absolute", top: gap,
        left: checked ? w - dot - gap : gap,
        width: dot, height: dot, borderRadius: 999,
        background: "#fff", transition: "left 0.18s",
        boxShadow: "0 1px 3px rgba(0,0,0,0.2)",
      }} />
    </button>
  );
};

// ─── THREE-DOT DROPDOWN ───────────────────────────────────────────────────────
const Dots = ({ items }) => {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  useEffect(() => {
    const h = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);
  return (
    <div ref={ref} style={{ position: "relative" }}>
      <button
        onClick={() => setOpen(p => !p)}
        style={{ width: 32, height: 32, borderRadius: 8, border: "1px solid #e5e7eb", background: "#fff", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: "#9ca3af" }}
      >
        <FiMoreHorizontal size={15} />
      </button>
      {open && (
        <div style={{
          position: "absolute", right: 0, top: 38, zIndex: 999,
          background: "#fff", borderRadius: 12, boxShadow: "0 8px 30px rgba(0,0,0,0.12)",
          border: "1px solid #f0f0f0", minWidth: 150, overflow: "hidden",
        }}>
          {items.map((it, i) => (
            <button
              key={i}
              onClick={() => { it.action(); setOpen(false); }}
              style={{
                display: "flex", alignItems: "center", gap: 8,
                width: "100%", padding: "11px 16px", border: "none",
                background: "transparent", cursor: "pointer",
                fontSize: 14, fontWeight: 700,
                color: it.danger ? "#ef4444" : "#374151",
                fontFamily: FONT, textAlign: "left",
                borderTop: i > 0 ? "1px solid #f0f0f0" : "none",
              }}
              onMouseEnter={e => e.currentTarget.style.background = it.danger ? "#fef2f2" : "#f9fafb"}
              onMouseLeave={e => e.currentTarget.style.background = "transparent"}
            >
              {it.icon && <it.icon size={13} />}
              {it.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

// ─── INPUT / TEXTAREA ─────────────────────────────────────────────────────────
const Field = ({ label, required, children }) => (
  <div style={{ marginBottom: 20 }}>
    <label style={{ display: "block", fontSize: 14, fontWeight: 700, color: "#374151", marginBottom: 8, fontFamily: FONT }}>
      {label} {required && <span style={{ color: "#ef4444" }}>*</span>}
    </label>
    {children}
  </div>
);

const Input = ({ style = {}, ...props }) => (
  <input
    {...props}
    style={{
      width: "100%", boxSizing: "border-box",
      padding: "11px 14px", borderRadius: 10,
      border: "1px solid #e5e7eb", fontSize: 15,
      fontFamily: FONT, color: "#111", outline: "none",
      background: "#fff",
      ...style,
    }}
    onFocus={e => e.target.style.borderColor = "#334877"}
    onBlur={e => e.target.style.borderColor = "#e5e7eb"}
  />
);

const Textarea = ({ style = {}, ...props }) => (
  <textarea
    {...props}
    style={{
      width: "100%", boxSizing: "border-box",
      padding: "11px 14px", borderRadius: 10,
      border: "1px solid #e5e7eb", fontSize: 15,
      fontFamily: FONT, color: "#111", outline: "none",
      resize: "none",
      ...style,
    }}
    onFocus={e => e.target.style.borderColor = "#334877"}
    onBlur={e => e.target.style.borderColor = "#e5e7eb"}
  />
);

// ─── ADD / EDIT PRODUCT FORM (View 3) ────────────────────────────────────────
const ProductForm = ({ item, menuGroup, categories, onSave, onBack }) => {
  const [form, setForm] = useState({
    name: item?.name || "",
    price: item?.price?.toString() || "",
    category: item?.category || categories[0] || "",
    imageUrl: item?.imageUrl || "",
    description: item?.description || "",
    isBestseller: item?.isBestseller || false,
    menuGroup: item?.menuGroup || menuGroup,
  });
  const [newCat, setNewCat] = useState(false);
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (!form.name.trim()) { toast.error("Product name required"); return; }
    if (!form.price) { toast.error("Price required"); return; }
    if (!form.category.trim()) { toast.error("Category required"); return; }
    setSaving(true);
    await onSave({ ...form, price: Number(form.price) });
    setSaving(false);
  };

  return (
    <div style={{ height: "100%", display: "flex", flexDirection: "column", fontFamily: FONT, background: "#fff" }}>
      {/* Back nav */}
      <div style={{ padding: "18px 28px", borderBottom: "1px solid #f0f0f0", display: "flex", alignItems: "center", gap: 10 }}>
        <button onClick={onBack} style={{ display: "flex", alignItems: "center", gap: 6, background: "none", border: "none", cursor: "pointer", color: "#6b7280", fontSize: 14, fontWeight: 700, fontFamily: FONT }}>
          <FiArrowLeft size={15} /> Back to Menu Details
        </button>
      </div>

      <div style={{ flex: 1, overflowY: "auto", padding: "28px" }}>
        <h2 style={{ fontWeight: 900, fontSize: 21, color: "#111", margin: "0 0 28px", fontFamily: FONT }}>
          {item ? "Edit Product" : "Add Product"}
        </h2>

        <div style={{ maxWidth: 580 }}>
          {/* Category */}
          <Field label="Category" required>
            {!newCat ? (
              <div style={{ position: "relative" }}>
                <select
                  value={form.category}
                  onChange={e => {
                    if (e.target.value === "__NEW__") { setNewCat(true); setForm({ ...form, category: "" }); }
                    else setForm({ ...form, category: e.target.value });
                  }}
                  style={{ width: "100%", padding: "11px 36px 11px 14px", borderRadius: 10, border: "1px solid #e5e7eb", fontSize: 15, fontFamily: FONT, appearance: "none", outline: "none", background: "#fff", boxSizing: "border-box", color: "#111" }}
                >
                  {categories.map(c => <option key={c} value={c}>{c}</option>)}
                  <option value="__NEW__">+ Add New Category</option>
                </select>
                <FiChevronDown size={14} style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", color: "#9ca3af", pointerEvents: "none" }} />
              </div>
            ) : (
              <div style={{ display: "flex", gap: 8 }}>
                <Input
                  autoFocus
                  placeholder="Enter category name..."
                  value={form.category}
                  onChange={e => setForm({ ...form, category: e.target.value })}
                />
                <button onClick={() => setNewCat(false)} style={{ padding: "0 14px", borderRadius: 10, border: "1px solid #e5e7eb", background: "#fff", cursor: "pointer" }}>
                  <FiX size={14} color="#9ca3af" />
                </button>
              </div>
            )}
          </Field>

          {/* Product Image */}
          <Field label="Product Image">
            <div
              style={{
                border: "2px dashed #e5e7eb", borderRadius: 12,
                padding: "32px 20px", textAlign: "center",
                cursor: "pointer", background: "#fafafa",
                transition: "border-color 0.2s",
              }}
              onMouseEnter={e => e.currentTarget.style.borderColor = "#334877"}
              onMouseLeave={e => e.currentTarget.style.borderColor = "#e5e7eb"}
            >
              {form.imageUrl ? (
                <div>
                  <img src={form.imageUrl} alt="preview" style={{ width: 100, height: 100, objectFit: "cover", borderRadius: 10, margin: "0 auto 12px", display: "block", border: "1px solid #e5e7eb" }} />
                  <Input
                    placeholder="Image URL..."
                    value={form.imageUrl}
                    onChange={e => setForm({ ...form, imageUrl: e.target.value })}
                    style={{ textAlign: "center", fontSize: 13 }}
                  />
                </div>
              ) : (
                <div>
                  <FiUploadCloud size={28} color="#334877" style={{ margin: "0 auto 10px", display: "block" }} />
                  <p style={{ fontWeight: 800, fontSize: 15, color: "#374151", margin: "0 0 4px" }}>Upload Image</p>
                  <p style={{ fontSize: 13, color: "#9ca3af", margin: "0 0 14px" }}>Drag & drop or paste an image URL below</p>
                  <Input
                    placeholder="Paste image URL here..."
                    value={form.imageUrl}
                    onChange={e => setForm({ ...form, imageUrl: e.target.value })}
                    style={{ textAlign: "center", fontSize: 13 }}
                  />
                </div>
              )}
            </div>
          </Field>

          {/* Product Name */}
          <Field label="Product Name" required>
            <Input
              placeholder="e.g. Spring Rolls"
              value={form.name}
              onChange={e => setForm({ ...form, name: e.target.value })}
            />
          </Field>

          {/* Description */}
          <Field label="Description">
            <Textarea
              placeholder="Please enter a description"
              value={form.description}
              onChange={e => setForm({ ...form, description: e.target.value })}
              rows={4}
            />
          </Field>

          {/* Price */}
          <Field label="Price" required>
            <div style={{ position: "relative" }}>
              <span style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", color: "#9ca3af", fontSize: 15, fontWeight: 700 }}>₹</span>
              <Input
                type="number"
                placeholder="0.00"
                value={form.price}
                onChange={e => setForm({ ...form, price: e.target.value })}
                style={{ paddingLeft: 30 }}
              />
            </div>
          </Field>

          {/* Bestseller toggle */}
          <Field label="Bestseller">
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <Toggle checked={form.isBestseller} onChange={() => setForm({ ...form, isBestseller: !form.isBestseller })} />
              <span style={{ fontSize: 14, color: form.isBestseller ? "#b45309" : "#9ca3af", fontWeight: 700 }}>
                {form.isBestseller ? "Marked as Bestseller" : "Not a bestseller"}
              </span>
            </div>
          </Field>
        </div>
      </div>

      {/* Footer Actions */}
      <div style={{ padding: "16px 28px", borderTop: "1px solid #f0f0f0", display: "flex", gap: 12, justifyContent: "flex-end" }}>
        <button
          onClick={onBack}
          style={{ padding: "11px 28px", borderRadius: 10, border: "1px solid #e5e7eb", background: "#fff", fontSize: 15, fontWeight: 700, cursor: "pointer", fontFamily: FONT, color: "#374151" }}
        >
          Cancel
        </button>
        <button
          onClick={handleSave}
          disabled={saving}
          style={{
            padding: "11px 32px", borderRadius: 10, border: "none",
            background: saving ? "#d1d5db" : "#334877",
            color: "#fff", fontSize: 15, fontWeight: 800,
            cursor: saving ? "not-allowed" : "pointer", fontFamily: FONT,
          }}
        >
          {saving ? "Saving..." : item ? "Save Changes" : "Save Menu"}
        </button>
      </div>
    </div>
  );
};

// ─── MENU DETAIL (View 2) ─────────────────────────────────────────────────────
const MenuDetail = ({ menuGroup, items, allCategories, onBack, onAddProduct, onEditProduct, onDeleteProduct, onToggleProduct, onAddCategory, onDeleteCategory }) => {
  const [activeCat, setActiveCat] = useState(null);
  const [editCatName, setEditCatName] = useState(null);
  const [newCatInput, setNewCatInput] = useState(false);
  const [newCatName, setNewCatName] = useState("");

  const categories = [...new Set(items.map(i => i.category || "Uncategorized"))];
  const selectedCat = activeCat || categories[0] || null;
  const catItems = items.filter(i => (i.category || "Uncategorized") === selectedCat);

  const [activeTab, setActiveTab] = useState("Menu Editing");

  const handleAddCategory = () => {
    if (!newCatName.trim()) return;
    onAddCategory(newCatName.trim());
    setNewCatInput(false);
    setNewCatName("");
    setActiveCat(newCatName.trim());
  };

  return (
    <div style={{ height: "100%", display: "flex", flexDirection: "column", fontFamily: FONT, background: "#f4f5f7" }}>
      {/* Header */}
      <div style={{ background: "#fff", borderBottom: "1px solid #e5e7eb", padding: "18px 28px" }}>
        <button onClick={onBack} style={{ display: "flex", alignItems: "center", gap: 6, background: "none", border: "none", cursor: "pointer", color: "#6b7280", fontSize: 14, fontWeight: 700, fontFamily: FONT, marginBottom: 10 }}>
          <FiArrowLeft size={14} /> Back to Menu List
        </button>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <h1 style={{ fontWeight: 900, fontSize: 22, color: "#111", margin: 0, fontFamily: FONT }}>{menuGroup}</h1>
          <div style={{ display: "flex", gap: 10 }}>
            <span style={{ fontSize: 13, color: "#9ca3af", fontWeight: 600, alignSelf: "center" }}>All changes saved</span>
            <button
              style={{ padding: "9px 20px", borderRadius: 10, border: "1px solid #334877", background: "#fff", color: "#334877", fontSize: 14, fontWeight: 800, cursor: "pointer", display: "flex", alignItems: "center", gap: 6, fontFamily: FONT }}
            >
              Publish Menu
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div style={{ display: "flex", gap: 2, marginTop: 16, borderBottom: "1px solid #e5e7eb" }}>
          {["Menu Editing", "Preview", "Settings"].map((t) => (
            <button
              key={t}
              onClick={() => setActiveTab(t)}
              style={{
                padding: "10px 20px", border: "none", background: "none",
                cursor: "pointer", fontSize: 14, fontWeight: 700,
                color: activeTab === t ? "#334877" : "#9ca3af",
                borderBottom: activeTab === t ? "2px solid #334877" : "2px solid transparent",
                fontFamily: FONT, transition: "all 0.15s",
              }}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      {/* Body */}
      {activeTab === "Menu Editing" && (
        <div style={{ flex: 1, display: "flex", overflow: "hidden", padding: "16px", gap: 14 }}>
          {/* LEFT: Categories */}
          <div style={{ width: 220, flexShrink: 0, background: "#fff", borderRadius: 14, border: "1px solid #e5e7eb", display: "flex", flexDirection: "column", overflow: "hidden" }}>
          <div style={{ padding: "16px 16px 12px", borderBottom: "1px solid #f0f0f0" }}>
            <h3 style={{ fontWeight: 900, fontSize: 15, color: "#111", margin: 0, fontFamily: FONT }}>Dish Categories</h3>
          </div>
          <div style={{ flex: 1, overflowY: "auto", padding: "8px 8px" }}>
            {categories.map(cat => (
              <div
                key={cat}
                style={{
                  display: "flex", alignItems: "center", gap: 8,
                  padding: "10px 10px", borderRadius: 10, cursor: "pointer",
                  background: selectedCat === cat ? "#f0f3f8" : "transparent",
                  marginBottom: 2,
                }}
                onClick={() => setActiveCat(cat)}
              >
                <FiAlignJustify size={12} color="#d1d5db" style={{ flexShrink: 0 }} />
                <span style={{ flex: 1, fontSize: 14, fontWeight: selectedCat === cat ? 700 : 500, color: selectedCat === cat ? "#334877" : "#374151", fontFamily: FONT }}>
                  {cat}
                </span>
                <div style={{ position: "relative" }}>
                  <Dots items={[
                    { label: "Edit", icon: FiEdit2, action: () => setEditCatName(cat) },
                    { label: "Delete", icon: FiTrash2, danger: true, action: () => onDeleteCategory(cat) },
                  ]} />
                </div>
              </div>
            ))}
          </div>
          {/* New Category */}
          <div style={{ padding: "10px 10px 12px", borderTop: "1px solid #f0f0f0" }}>
            {newCatInput ? (
              <div style={{ display: "flex", gap: 6 }}>
                <input
                  autoFocus
                  placeholder="Category name..."
                  value={newCatName}
                  onChange={e => setNewCatName(e.target.value)}
                  onKeyDown={e => e.key === "Enter" && handleAddCategory()}
                  style={{ flex: 1, padding: "8px 10px", borderRadius: 8, border: "1px solid #334877", fontSize: 13, outline: "none", fontFamily: FONT }}
                />
                <button onClick={handleAddCategory} style={{ padding: "0 8px", borderRadius: 8, border: "none", background: "#334877", color: "#fff", cursor: "pointer" }}>
                  <FiCheck size={13} />
                </button>
                <button onClick={() => { setNewCatInput(false); setNewCatName(""); }} style={{ padding: "0 6px", borderRadius: 8, border: "1px solid #e5e7eb", background: "#fff", cursor: "pointer" }}>
                  <FiX size={13} color="#9ca3af" />
                </button>
              </div>
            ) : (
              <button
                onClick={() => setNewCatInput(true)}
                style={{ display: "flex", alignItems: "center", gap: 6, width: "100%", padding: "9px 10px", borderRadius: 10, border: "1px dashed #334877", background: "#fff", color: "#334877", fontSize: 13, fontWeight: 800, cursor: "pointer", fontFamily: FONT }}
              >
                <FiPlus size={13} /> New Category
              </button>
            )}
          </div>
        </div>

        {/* CENTER: Items */}
        <div style={{ flex: 1, display: "flex", flexDirection: "column", background: "#fff", borderRadius: 14, border: "1px solid #e5e7eb", overflow: "hidden" }}>
          {selectedCat ? (
            <>
              <div style={{ padding: "16px 20px", borderBottom: "1px solid #f0f0f0", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div>
                  <h3 style={{ fontWeight: 900, fontSize: 16, color: "#111", margin: "0 0 2px", fontFamily: FONT }}>{selectedCat}</h3>
                  <p style={{ fontSize: 13, color: "#9ca3af", margin: 0, fontWeight: 600 }}>{catItems.length} items · Visible to customers</p>
                </div>
              </div>
              <div style={{ flex: 1, overflowY: "auto", padding: "12px 16px" }}>
                {catItems.length === 0 ? (
                  <div style={{ textAlign: "center", padding: "48px 20px", color: "#d1d5db" }}>
                    <p style={{ fontSize: 14, fontWeight: 700 }}>No items in this category yet</p>
                    <button onClick={() => onAddProduct(selectedCat)} style={{ marginTop: 12, padding: "9px 18px", borderRadius: 10, border: "1px dashed #334877", background: "#fff", color: "#334877", fontSize: 14, fontWeight: 800, cursor: "pointer", fontFamily: FONT, display: "inline-flex", alignItems: "center", gap: 6 }}>
                      <FiPlus size={13} /> Add First Dish
                    </button>
                  </div>
                ) : catItems.map(item => (
                  <div
                    key={item._id}
                    style={{
                      display: "flex", gap: 16, padding: "16px",
                      background: "#fff", borderRadius: 12,
                      border: "1px solid #e5e7eb", marginBottom: 12,
                      boxShadow: "0 1px 2px rgba(0,0,0,0.02)"
                    }}
                  >
                    {/* Image */}
                    <div style={{ width: 80, height: 80, borderRadius: 10, overflow: "hidden", flexShrink: 0, background: "#f3f4f6" }}>
                      <img 
                        src={item.imageUrl || "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80"} 
                        alt={item.name} 
                        loading="lazy"
                        decoding="async"
                        style={{ width: "100%", height: "100%", objectFit: "cover", transform: "translateZ(0)" }} 
                      />
                    </div>

                    {/* Info */}
                    <div style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
                      <div>
                        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                          <span style={{ fontWeight: 800, fontSize: 16, color: "#111", fontFamily: FONT }}>{item.name}</span>
                          {item.isBestseller && (
                            <span style={{ fontSize: 10, fontWeight: 900, background: "#fef3c7", color: "#b45309", padding: "2px 6px", borderRadius: 4, border: "1px solid #fde68a" }}>BEST</span>
                          )}
                        </div>
                        <p style={{ fontSize: 14, color: "#6b7280", margin: "4px 0 0", fontWeight: 500, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
                          {item.description || "No description provided."}
                        </p>
                      </div>
                      <span style={{ fontWeight: 900, fontSize: 16, color: "#111", marginTop: 8 }}>₹{item.price}</span>
                    </div>

                    {/* Actions */}
                    <div style={{ display: "flex", flexDirection: "column", justifyContent: "space-between", alignItems: "flex-end", flexShrink: 0, minWidth: 140 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <span style={{ fontSize: 13, color: "#6b7280", fontWeight: 600 }}>Sales Status:</span>
                        <Toggle size="sm" checked={item.isAvailable} onChange={() => onToggleProduct(item._id, item.isAvailable)} />
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                        <button
                          onClick={() => onEditProduct(item)}
                          style={{ background: "none", border: "none", cursor: "pointer", fontSize: 14, fontWeight: 700, color: "#6b7280", fontFamily: FONT }}
                          onMouseEnter={e => e.currentTarget.style.color = "#111"}
                          onMouseLeave={e => e.currentTarget.style.color = "#6b7280"}
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => onDeleteProduct(item._id, item.name)}
                          style={{ background: "none", border: "none", cursor: "pointer", fontSize: 14, fontWeight: 700, color: "#ef4444", fontFamily: FONT }}
                          onMouseEnter={e => e.currentTarget.style.color = "#b91c1c"}
                          onMouseLeave={e => e.currentTarget.style.color = "#ef4444"}
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", color: "#d1d5db", fontSize: 15, fontWeight: 700 }}>
              Select a category to view items
            </div>
          )}
        </div>

        {/* RIGHT: Actions */}
        <div style={{ width: 180, flexShrink: 0, display: "flex", flexDirection: "column", gap: 10 }}>
          <button
            onClick={() => onAddProduct(selectedCat)}
            style={{ display: "flex", alignItems: "center", gap: 8, padding: "12px 16px", borderRadius: 12, border: "1px solid #e5e7eb", background: "#fff", fontSize: 14, fontWeight: 800, cursor: "pointer", color: "#374151", fontFamily: FONT, boxShadow: "0 1px 3px rgba(0,0,0,0.05)" }}
          >
            <FiPlus size={14} /> Add Dish
          </button>
          <button
            style={{ display: "flex", alignItems: "center", gap: 8, padding: "12px 16px", borderRadius: 12, border: "1px solid #e5e7eb", background: "#fff", fontSize: 14, fontWeight: 800, cursor: "pointer", color: "#374151", fontFamily: FONT, boxShadow: "0 1px 3px rgba(0,0,0,0.05)" }}
          >
            <FiList size={14} /> Dish Sorting
          </button>
        </div>
        </div>
      )}

      {activeTab === "Preview" && (
        <div style={{ flex: 1, overflowY: "auto", padding: "24px 28px", WebkitOverflowScrolling: "touch" }}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: 20 }}>
            {items.map(item => (
              <div key={item._id} style={{ background: "#fff", borderRadius: 16, border: "1px solid #e5e7eb", overflow: "hidden", padding: 12, transform: "translateZ(0)", willChange: "transform" }}>
                <div style={{ width: "100%", height: 160, borderRadius: 10, background: "#f3f4f6", overflow: "hidden", marginBottom: 12 }}>
                  <img 
                    src={item.imageUrl || "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80"} 
                    alt={item.name} 
                    loading="lazy"
                    decoding="async"
                    style={{ width: "100%", height: "100%", objectFit: "cover" }} 
                  />
                </div>
                <h4 style={{ fontWeight: 800, fontSize: 15, color: "#111", margin: "0 0 8px", fontFamily: FONT, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                  {item.name}
                </h4>
                <div style={{ fontWeight: 900, fontSize: 16, color: "#111" }}>
                  ₹{item.price}
                </div>
              </div>
            ))}
            {items.length === 0 && (
              <div style={{ gridColumn: "1 / -1", textAlign: "center", padding: "60px 20px", color: "#9ca3af", fontWeight: 700 }}>
                No items added to this menu yet.
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

// ─── MENU LIST (View 1) ───────────────────────────────────────────────────────
const MenuList = ({ menuGroups, onOpen, onAdd, onDelete, onToggle }) => {
  const [viewMode, setViewMode] = useState("grid");
  const [addingMenu, setAddingMenu] = useState(false);
  const [newMenuName, setNewMenuName] = useState("");

  const handleAdd = () => {
    if (!newMenuName.trim()) return;
    onAdd(newMenuName.trim());
    setNewMenuName("");
    setAddingMenu(false);
  };

  return (
    <div style={{ height: "100%", display: "flex", flexDirection: "column", fontFamily: FONT, background: "#f4f5f7" }}>
      {/* Header */}
      <div style={{ background: "#fff", borderBottom: "1px solid #e5e7eb", padding: "20px 28px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <h1 style={{ fontWeight: 900, fontSize: 22, color: "#111", margin: 0, fontFamily: FONT }}>Menus</h1>
              <span style={{ background: "#f3f4f6", color: "#6b7280", fontSize: 12, fontWeight: 800, padding: "3px 10px", borderRadius: 999 }}>
                {menuGroups.length} Menus
              </span>
            </div>
            <p style={{ fontSize: 13, color: "#9ca3af", marginTop: 4, fontWeight: 600 }}>
              Manage the menus and dishes in your store
            </p>
          </div>
          <button
            onClick={() => setAddingMenu(true)}
            style={{ display: "flex", alignItems: "center", gap: 8, padding: "10px 20px", borderRadius: 10, border: "none", background: "#334877", color: "#fff", fontSize: 14, fontWeight: 800, cursor: "pointer", boxShadow: "0 2px 8px rgba(51,72,119,0.2)", fontFamily: FONT }}
          >
            <FiPlus size={15} /> Add Menu
          </button>
        </div>

        {/* Add Menu inline input */}
        {addingMenu && (
          <div style={{ marginTop: 14, display: "flex", gap: 10, maxWidth: 400 }}>
            <input
              autoFocus
              placeholder="e.g. Continental, Breakfast Menu..."
              value={newMenuName}
              onChange={e => setNewMenuName(e.target.value)}
              onKeyDown={e => e.key === "Enter" && handleAdd()}
              style={{ flex: 1, padding: "10px 14px", borderRadius: 10, border: "1px solid #334877", fontSize: 15, fontFamily: FONT, outline: "none" }}
            />
            <button onClick={handleAdd} style={{ padding: "10px 18px", borderRadius: 10, border: "none", background: "#334877", color: "#fff", fontSize: 14, fontWeight: 800, cursor: "pointer", fontFamily: FONT }}>
              Create
            </button>
            <button onClick={() => { setAddingMenu(false); setNewMenuName(""); }} style={{ padding: "10px 12px", borderRadius: 10, border: "1px solid #e5e7eb", background: "#fff", cursor: "pointer" }}>
              <FiX size={14} color="#9ca3af" />
            </button>
          </div>
        )}
      </div>

      {/* Toolbar */}
      <div style={{ padding: "14px 28px", display: "flex", justifyContent: "flex-end", gap: 4 }}>
        {[{ icon: FiGrid, mode: "grid" }, { icon: FiList, mode: "list" }].map(({ icon: Icon, mode }) => (
          <button
            key={mode}
            onClick={() => setViewMode(mode)}
            style={{ width: 34, height: 34, borderRadius: 8, border: "1px solid #e5e7eb", background: viewMode === mode ? "#334877" : "#fff", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: viewMode === mode ? "#fff" : "#9ca3af" }}
          >
            <Icon size={14} />
          </button>
        ))}
      </div>

      {/* Cards */}
      <div style={{ flex: 1, overflowY: "auto", padding: "0 28px 28px" }}>
        {menuGroups.length === 0 ? (
          <div style={{ background: "#fff", borderRadius: 16, border: "1px solid #e5e7eb", padding: "60px 20px", textAlign: "center" }}>
            <p style={{ fontSize: 15, fontWeight: 800, color: "#374151", marginBottom: 8 }}>No menus yet</p>
            <p style={{ fontSize: 13, color: "#9ca3af", marginBottom: 20 }}>Create your first menu to get started</p>
            <button onClick={() => setAddingMenu(true)} style={{ padding: "10px 24px", borderRadius: 10, border: "none", background: "#334877", color: "#fff", fontSize: 14, fontWeight: 800, cursor: "pointer", fontFamily: FONT }}>
              + Add Menu
            </button>
          </div>
        ) : (
          <div style={{
            display: "grid",
            gridTemplateColumns: viewMode === "grid" ? "repeat(2, 1fr)" : "1fr",
            gap: 16,
          }}>
            {menuGroups.map(({ name, items }) => {
              const cats = [...new Set(items.map(i => i.category || "Uncategorized"))];
              const enabled = items.filter(i => i.isAvailable).length;
              return (
                <div
                  key={name}
                  style={{ background: "#fff", borderRadius: 16, border: "1px solid #e5e7eb", overflow: "visible", boxShadow: "0 1px 4px rgba(0,0,0,0.04)" }}
                >
                  {/* Top section */}
                  <div style={{ padding: "20px 20px 0" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                      <div style={{ flex: 1 }}>
                        <h3 style={{ fontWeight: 900, fontSize: 17, color: "#111", margin: "0 0 4px", fontFamily: FONT }}>{name}</h3>
                        <p style={{ fontSize: 13, color: "#9ca3af", margin: 0 }}>
                          {items.length} items · {cats.length} {cats.length === 1 ? "category" : "categories"} · Published
                        </p>
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <button
                          onClick={() => onOpen(name)}
                          style={{ display: "flex", alignItems: "center", gap: 5, padding: "6px 14px", borderRadius: 8, border: "1px solid #e5e7eb", background: "#fff", fontSize: 13, fontWeight: 800, cursor: "pointer", color: "#374151", fontFamily: FONT }}
                        >
                          <FiEdit2 size={11} /> Edit
                        </button>
                        <span style={{ background: "#fff1ee", color: "#e05a2b", fontSize: 12, fontWeight: 800, padding: "4px 10px", borderRadius: 999 }}>
                          {items.length} Dishes
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Divider */}
                  <div style={{ margin: "16px 0 0", height: 1, background: "#f3f4f6" }} />

                  {/* Status + Dots */}
                  <div style={{ padding: "14px 20px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <span style={{ fontSize: 14, fontWeight: 700, color: "#6b7280" }}>Status:</span>
                      <Toggle checked={enabled > 0} onChange={() => onToggle(name)} />
                    </div>
                    <Dots items={[
                      { label: "Menu Details", action: () => onOpen(name) },
                      { label: "Delete Menu", icon: FiTrash2, danger: true, action: () => onDelete(name) },
                    ]} />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

// ─── ROOT COMPONENT ───────────────────────────────────────────────────────────
const MenuManager = () => {
  const { user } = useAuth();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  // view: "list" | "detail" | "product"
  const [view, setView] = useState("list");
  const [activeMenu, setActiveMenu] = useState(null);   // menu group name
  const [editingItem, setEditingItem] = useState(null); // item for edit, null for add
  const [addForCat, setAddForCat] = useState(null);     // pre-selected category for add

  const fetchMenu = useCallback(async () => {
    if (!user?.restaurantId) return;
    setLoading(true);
    try {
      const res = await apiClient.get(`/menu?restaurantId=${user.restaurantId}`);
      setItems(res.data || []);
    } catch {
      toast.error("Failed to load menu");
    }
    setLoading(false);
  }, [user]);

  useEffect(() => { fetchMenu(); }, [fetchMenu]);

  // Group items by menuGroup
  const groupItemsByMenu = () => {
    const map = {};
    items.forEach(item => {
      const g = item.menuGroup || "Main Menu";
      if (!map[g]) map[g] = [];
      map[g].push(item);
    });
    return Object.entries(map).map(([name, items]) => ({ name, items }));
  };

  const menuGroups = groupItemsByMenu();
  const activeMenuItems = activeMenu
    ? (menuGroups.find(m => m.name === activeMenu)?.items || [])
    : [];
  const activeMenuCategories = [...new Set(activeMenuItems.map(i => i.category || "Uncategorized"))];

  // ── handlers ────────────────────────────────────────────────────────────────
  const openMenu = (name) => { setActiveMenu(name); setView("detail"); };

  const addMenu = (name) => {
    // Just sets active menu — items added under it will create it
    setActiveMenu(name);
    setView("detail");
    toast.success(`Menu "${name}" created`);
  };

  const deleteMenu = (name) => {
    toast.custom(t => (
      <div style={{ background: "#fff", borderRadius: 14, padding: 20, boxShadow: "0 8px 30px rgba(0,0,0,0.12)", minWidth: 280, fontFamily: FONT }}>
        <p style={{ fontWeight: 800, fontSize: 15, color: "#111", marginBottom: 6 }}>Delete menu "{name}"?</p>
        <p style={{ fontSize: 13, color: "#9ca3af", marginBottom: 16 }}>All items in this menu will also be deleted.</p>
        <div style={{ display: "flex", gap: 8 }}>
          <button onClick={() => toast.dismiss(t.id)} style={{ flex: 1, padding: "9px 0", borderRadius: 8, border: "1px solid #e5e7eb", background: "#fff", fontSize: 14, fontWeight: 700, cursor: "pointer" }}>Cancel</button>
          <button onClick={async () => {
            toast.dismiss(t.id);
            const toDelete = items.filter(i => (i.menuGroup || "Main Menu") === name);
            await Promise.all(toDelete.map(i => apiClient.delete(`/menu/${i._id}`).catch(() => { })));
            setItems(prev => prev.filter(i => (i.menuGroup || "Main Menu") !== name));
            toast.success(`Deleted "${name}"`);
          }} style={{ flex: 1, padding: "9px 0", borderRadius: 8, border: "none", background: "#ef4444", color: "#fff", fontSize: 14, fontWeight: 800, cursor: "pointer" }}>Delete</button>
        </div>
      </div>
    ), { duration: Infinity, position: "top-center" });
  };

  const saveProduct = async (formData) => {
    try {
      const payload = { ...formData, restaurantId: user.restaurantId, menuGroup: activeMenu };
      if (editingItem) {
        await apiClient.put(`/menu/${editingItem._id}`, payload);
        toast.success(`Updated "${formData.name}"`);
      } else {
        await apiClient.post("/menu", payload);
        toast.success(`Added "${formData.name}"`);
      }
      setEditingItem(null);
      setView("detail");
      fetchMenu();
    } catch {
      toast.error("Failed to save");
    }
  };

  const deleteProduct = (id, name) => {
    toast.custom(t => (
      <div style={{ background: "#fff", borderRadius: 14, padding: 20, boxShadow: "0 8px 30px rgba(0,0,0,0.12)", minWidth: 280, fontFamily: FONT }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 14 }}>
          <div style={{ width: 36, height: 36, borderRadius: 10, background: "#fef2f2", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <FiTrash2 size={16} color="#ef4444" />
          </div>
          <div>
            <p style={{ fontWeight: 800, fontSize: 15, color: "#111", margin: 0 }}>Delete dish?</p>
            <p style={{ fontSize: 13, color: "#6b7280", margin: 0 }}>"{name}"</p>
          </div>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <button onClick={() => toast.dismiss(t.id)} style={{ flex: 1, padding: "9px 0", borderRadius: 8, border: "1px solid #e5e7eb", background: "#fff", fontSize: 14, fontWeight: 700, cursor: "pointer", fontFamily: FONT }}>Cancel</button>
          <button onClick={async () => {
            toast.dismiss(t.id);
            try {
              await apiClient.delete(`/menu/${id}`);
              setItems(prev => prev.filter(i => i._id !== id));
              toast.success(`Deleted "${name}"`);
            } catch { toast.error("Failed"); fetchMenu(); }
          }} style={{ flex: 1, padding: "9px 0", borderRadius: 8, border: "none", background: "#ef4444", color: "#fff", fontSize: 14, fontWeight: 800, cursor: "pointer", fontFamily: FONT }}>Delete</button>
        </div>
      </div>
    ), { duration: Infinity, position: "top-center" });
  };

  const toggleProduct = async (id, current) => {
    setItems(prev => prev.map(i => i._id === id ? { ...i, isAvailable: !current } : i));
    try { await apiClient.put(`/menu/${id}/availability`, { isAvailable: !current }); }
    catch { fetchMenu(); }
  };

  // ── Render ───────────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100%", fontFamily: FONT, color: "#9ca3af", fontSize: 15, fontWeight: 700 }}>
        Loading menus...
      </div>
    );
  }

  if (view === "product") {
    return (
      <ProductForm
        item={editingItem}
        menuGroup={activeMenu}
        categories={activeMenuCategories}
        onSave={saveProduct}
        onBack={() => { setEditingItem(null); setView("detail"); }}
      />
    );
  }

  if (view === "detail") {
    return (
      <MenuDetail
        menuGroup={activeMenu}
        items={activeMenuItems}
        allCategories={activeMenuCategories}
        onBack={() => setView("list")}
        onAddProduct={(cat) => { setEditingItem(null); setAddForCat(cat); setView("product"); }}
        onEditProduct={(item) => { setEditingItem(item); setView("product"); }}
        onDeleteProduct={deleteProduct}
        onToggleProduct={toggleProduct}
        onAddCategory={(cat) => {
          // Category is created when first item is added with that category
          toast.success(`Category "${cat}" ready — add a dish to it`);
        }}
        onDeleteCategory={(cat) => {
          toast.custom(t => (
            <div style={{ background: "#fff", borderRadius: 14, padding: 20, boxShadow: "0 8px 30px rgba(0,0,0,0.12)", minWidth: 280, fontFamily: FONT }}>
              <p style={{ fontWeight: 800, fontSize: 15, margin: "0 0 6px" }}>Delete category "{cat}"?</p>
              <p style={{ fontSize: 13, color: "#9ca3af", margin: "0 0 16px" }}>All items in this category will be removed.</p>
              <div style={{ display: "flex", gap: 8 }}>
                <button onClick={() => toast.dismiss(t.id)} style={{ flex: 1, padding: "9px 0", borderRadius: 8, border: "1px solid #e5e7eb", background: "#fff", fontSize: 14, fontWeight: 700, cursor: "pointer" }}>Cancel</button>
                <button onClick={async () => {
                  toast.dismiss(t.id);
                  const toDelete = activeMenuItems.filter(i => i.category === cat);
                  await Promise.all(toDelete.map(i => apiClient.delete(`/menu/${i._id}`).catch(() => { })));
                  setItems(prev => prev.filter(i => !(i.category === cat && (i.menuGroup || "Main Menu") === activeMenu)));
                  toast.success(`Category "${cat}" deleted`);
                }} style={{ flex: 1, padding: "9px 0", borderRadius: 8, border: "none", background: "#ef4444", color: "#fff", fontSize: 14, fontWeight: 800, cursor: "pointer" }}>Delete</button>
              </div>
            </div>
          ), { duration: Infinity, position: "top-center" });
        }}
      />
    );
  }

  return (
    <MenuList
      menuGroups={menuGroups}
      onOpen={openMenu}
      onAdd={addMenu}
      onDelete={deleteMenu}
      onToggle={() => { }}
    />
  );
};

export default MenuManager;
