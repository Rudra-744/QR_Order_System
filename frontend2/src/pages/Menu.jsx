import React, { useEffect, useState, useRef } from "react";
import { useSearchParams } from "react-router-dom";
import axios from "axios";
import { useSocket } from "../context/SocketContext";
import {
  FiMinus,
  FiPlus,
  FiShoppingBag,
  FiClock,
  FiCheckCircle,
  FiXCircle,
  FiRefreshCw,
} from "react-icons/fi";

const API_URL = "https://barry-corporations-salem-pike.trycloudflare.com/api";

const Menu = () => {
  const [searchParams] = useSearchParams();
  const tableNumber = searchParams.get("table");

  const [menu, setMenu] = useState([]);
  const [cart, setCart] = useState({});
  const [activeCategory, setActiveCategory] = useState("All");

  const [orderStatus, setOrderStatus] = useState(null);
  const [orderId, setOrderId] = useState(null);

  // 👇 MAGIC FIX: Ref bana rahe hain taaki Socket hamesha latest ID padhe
  const orderIdRef = useRef(null);

  const [note, setNote] = useState("");
  const socket = useSocket();

  // 1. Ref ko State ke saath sync rakho
  useEffect(() => {
    orderIdRef.current = orderId;
  }, [orderId]);

  // 2. Menu Fetch Karo
  useEffect(() => {
    const fetchMenu = async () => {
      try {
        const res = await axios.get(`${API_URL}/menu`);
        setMenu(res.data);
      } catch (err) {
        console.error("Menu fetch error", err);
      }
    };
    fetchMenu();
  }, []);

  // 3. SOCKET LISTENER & POLLING FALLBACK
  useEffect(() => {
    if (!socket || !tableNumber) return;

    const joinRoom = () => {
      socket.emit("join_table", tableNumber);
    };

    // Join immediately
    joinRoom();

    // Re-join on connect (fixes refresh/network issues)
    socket.on("connect", joinRoom);

    const handleStatusUpdate = (updatedOrder) => {
      // Check ID match
      if (
        orderIdRef.current &&
        String(updatedOrder._id) === String(orderIdRef.current)
      ) {
        setOrderStatus(updatedOrder.status);

        if (updatedOrder.status === "approved" && navigator.vibrate) {
          navigator.vibrate([200, 100, 200]);
        }
      }
    };

    socket.on("order:update", handleStatusUpdate);

    return () => {
      socket.off("connect", joinRoom);
      socket.off("order:update", handleStatusUpdate);
    };
  }, [socket, tableNumber]);

  // 4. Manual Check Button (Remains as a backup for the user)
  // Polling removed as per request. Relying on Socket.io.

  // 5. Manual Check Button (Optimization)
  const checkStatusManually = async () => {
    if (!orderId) return;
    try {
      const res = await axios.get(`${API_URL}/orders/${orderId}`);
      setOrderStatus(res.data.status);
    } catch (e) {
      // Silent fail for manual check
    }
  };

  // 5. Place Order Logic
  const addToCart = (item) => {
    setCart((prev) => ({
      ...prev,
      [item._id]: { ...item, qty: (prev[item._id]?.qty || 0) + 1 },
    }));
  };

  const removeFromCart = (itemId) => {
    setCart((prev) => {
      const newCart = { ...prev };
      if (newCart[itemId].qty > 1) {
        newCart[itemId].qty -= 1;
      } else {
        delete newCart[itemId];
      }
      return newCart;
    });
  };

  const placeOrder = async () => {
    if (!tableNumber) return alert("Please scan a valid QR code!");
    try {
      const cartItems = Object.values(cart);
      const totalAmount = cartItems.reduce(
        (acc, item) => acc + item.price * item.qty,
        0
      );

      const payload = {
        tableNumber: parseInt(tableNumber),
        items: cartItems.map((i) => ({
          itemId: i._id,
          name: i.name, // Name bhejna zaroori hai dashboard ke liye
          price: i.price,
          qty: i.qty,
        })),
        note: note,
        totalAmount: totalAmount,
      };

      const res = await axios.post(`${API_URL}/orders`, payload);

      // Update State AUR Ref dono set kar rahe hain
      setOrderId(res.data._id);
      orderIdRef.current = res.data._id;
      setOrderStatus("pending");
      setCart({});
    } catch (err) {
      alert("Failed to place order.");
    }
  };

  // --- UI RENDER ---
  const categories = ["All", ...new Set(menu.map((i) => i.category))];
  const filteredMenu =
    activeCategory === "All"
      ? menu
      : menu.filter((i) => i.category === activeCategory);

  if (!menu.length)
    return (
      <div className="h-screen flex items-center justify-center text-gray-500">
        Loading Menu...
      </div>
    );

  // STATUS SCREEN (Waiting / Accepted / Rejected)
  if (orderStatus) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center bg-gray-50">
        <div className="bg-white p-8 rounded-2xl shadow-xl max-w-sm w-full relative">
          {/* Refresh Button (Agar atak jaye toh) */}
          {orderStatus === "pending" && (
            <div
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 cursor-pointer"
              onClick={checkStatusManually}
              title="Refresh Status"
            >
              <FiRefreshCw />
            </div>
          )}

          {/* WAITING UI */}
          {orderStatus === "pending" && (
            <>
              <div className="bg-yellow-100 p-4 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-4 animate-pulse">
                <FiClock size={40} className="text-yellow-600" />
              </div>
              <h2 className="text-2xl font-bold mb-2">Order Sent!</h2>
              <p className="text-gray-500">
                Restaurant confirmation ka wait kar rahe hain...
              </p>
              <p className="text-xs text-gray-400 mt-8">
                Do not close this page.
              </p>
            </>
          )}

          {/* ACCEPTED UI */}
          {orderStatus === "approved" && (
            <>
              <div className="bg-green-100 p-4 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-4 animate-bounce">
                <FiCheckCircle size={40} className="text-green-600" />
              </div>
              <h2 className="text-2xl font-bold mb-2 text-gray-800">
                Order Accepted! ✅
              </h2>
              <p className="text-gray-500">Khana ban raha hai.</p>
              <div className="mt-4 bg-green-50 text-green-700 py-2 rounded-lg font-bold text-sm">
                Kitchen is Preparing... 👨‍🍳
              </div>
              <button
                onClick={() => {
                  setOrderStatus(null);
                  setOrderId(null);
                  orderIdRef.current = null;
                  setNote("");
                }}
                className="mt-6 px-6 py-2 bg-gray-900 text-white rounded-lg font-bold shadow-lg w-full"
              >
                Order More Items
              </button>
            </>
          )}

          {/* REJECTED UI */}
          {orderStatus === "rejected" && (
            <>
              <div className="bg-red-100 p-4 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-4">
                <FiXCircle size={40} className="text-red-600" />
              </div>
              <h2 className="text-2xl font-bold mb-2 text-gray-800">
                Order Rejected ❌
              </h2>
              <p className="text-gray-500">
                Sorry, hum ye order nahi le sakte.
              </p>
              <button
                onClick={() => {
                  setOrderStatus(null);
                  setCart({});
                }}
                className="mt-6 px-6 py-2 bg-gray-900 text-white rounded-lg font-bold shadow-lg"
              >
                Back to Menu
              </button>
            </>
          )}
        </div>
      </div>
    );
  }

  // MENU SCREEN
  return (
    <div className="min-h-screen pb-24 bg-gray-50">
      <header className="sticky top-0 z-10 bg-white/95 backdrop-blur-sm border-b border-gray-100 px-4 py-3 shadow-sm flex justify-between items-center">
        <div className="flex items-center gap-3">
          <img
            src="./public/logo.png"
            alt="Logo"
            className="w-10 h-10 rounded-lg"
          />
          <div>
            <h1 className="font-bold text-lg text-gray-800 leading-tight">
              Mrs Jha <span className="text-brand-600">Kitchen</span>
            </h1>
            <span className="text-xs text-gray-400">Menu</span>
          </div>
        </div>
        <div className="bg-gray-100 text-gray-800 px-3 py-1 rounded-full text-xs font-bold uppercase">
          Table {tableNumber || "?"}
        </div>
      </header>

      {/* Categories */}
      <div className="sticky top-[55px] z-10 bg-gray-50 py-3 overflow-x-auto no-scrollbar flex gap-3 px-4">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`whitespace-nowrap px-4 py-2 rounded-full text-sm font-bold transition-all shadow-sm ${
              activeCategory === cat
                ? "bg-gray-900 text-white"
                : "bg-white text-gray-700 border border-gray-200"
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Items */}
      <div className="px-4 space-y-4 mt-2">
        {filteredMenu.map((item) => {
          const qty = cart[item._id]?.qty || 0;
          return (
            <div
              key={item._id}
              className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex justify-between items-start"
            >
              <div className="flex-1 pr-4">
                <h3 className="font-bold text-gray-800">{item.name}</h3>
                <p className="text-gray-900 font-bold">₹{item.price}</p>
                <p className="text-xs text-gray-400 mt-1">{item.category}</p>
              </div>
              <div className="flex flex-col items-end">
                {!item.isAvailable ? (
                  <div className="text-red-500 text-xs font-bold bg-red-50 px-3 py-1.5 rounded-lg opacity-80">
                    SOLD OUT
                  </div>
                ) : qty === 0 ? (
                  <button
                    onClick={() => addToCart(item)}
                    className="bg-white text-green-600 border border-green-200 px-5 py-1.5 rounded-lg text-sm font-bold shadow-sm"
                  >
                    ADD
                  </button>
                ) : (
                  <div className="flex items-center bg-green-600 rounded-lg shadow-md">
                    <button
                      onClick={() => removeFromCart(item._id)}
                      className="p-2 text-white"
                    >
                      <FiMinus size={14} />
                    </button>
                    <span className="text-white font-bold px-2 text-sm">
                      {qty}
                    </span>
                    <button
                      onClick={() => addToCart(item)}
                      className="p-2 text-white"
                    >
                      <FiPlus size={14} />
                    </button>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Cart Footer */}
      {Object.values(cart).length > 0 && (
        <div className="fixed bottom-4 left-4 right-4 z-20">
          <div className="bg-white p-3 rounded-t-xl border-b border-gray-100 shadow-lg">
            <input
              type="text"
              placeholder="Cooking Note? (e.g. Less Spicy)"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none"
            />
          </div>
          <div
            className="bg-gray-900 text-white p-4 rounded-xl shadow-2xl flex justify-between items-center cursor-pointer"
            onClick={placeOrder}
          >
            <div className="flex flex-col">
              <span className="text-xs text-gray-400 uppercase font-semibold">
                {Object.values(cart).length} Items
              </span>
              <span className="font-bold text-lg">
                Total ₹
                {Object.values(cart).reduce((a, b) => a + b.price * b.qty, 0)}
              </span>
            </div>
            <button className="flex items-center gap-2 bg-green-500 text-white px-5 py-2 rounded-lg font-bold text-sm">
              Place Order <FiShoppingBag />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Menu;
