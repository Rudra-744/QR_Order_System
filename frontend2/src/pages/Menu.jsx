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

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

const Menu = () => {
  const [searchParams] = useSearchParams();
  const tableNumber = searchParams.get("table");

  const [menu, setMenu] = useState([]);
  const [cart, setCart] = useState({});
  const [activeCategory, setActiveCategory] = useState("All");

  const [orderStatus, setOrderStatus] = useState(null);
  const [orderId, setOrderId] = useState(null);

  const orderIdRef = useRef(null);

  const [note, setNote] = useState("");
  const socket = useSocket();

  useEffect(() => {
    orderIdRef.current = orderId;
  }, [orderId]);

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

  useEffect(() => {
    if (!socket || !tableNumber) return;

    const joinRoom = () => {
      socket.emit("join_table", tableNumber);
    };

    joinRoom();
    socket.on("connect", joinRoom);

    const handleStatusUpdate = (updatedOrder) => {
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

  const checkStatusManually = async () => {
    if (!orderId) return;
    try {
      const res = await axios.get(`${API_URL}/orders/${orderId}`);
      setOrderStatus(res.data.status);
    } catch (e) {}
  };

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
        0,
      );

      const payload = {
        tableNumber: parseInt(tableNumber),
        items: cartItems.map((i) => ({
          itemId: i._id,
          name: i.name,
          price: i.price,
          qty: i.qty,
        })),
        note: note,
        totalAmount: totalAmount,
      };

      const res = await axios.post(`${API_URL}/orders`, payload);

      setOrderId(res.data._id);
      orderIdRef.current = res.data._id;
      setOrderStatus("pending");
      setCart({});
    } catch (err) {
      alert("Failed to place order.");
    }
  };

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

  if (orderStatus) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center bg-gray-50">
        <div className="bg-white p-8 rounded-2xl shadow-xl max-w-sm w-full relative">
          {orderStatus === "pending" && (
            <div
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 cursor-pointer"
              onClick={checkStatusManually}
              title="Refresh Status"
            >
              <FiRefreshCw />
            </div>
          )}

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

  return (
    <div className="min-h-screen pb-24 bg-gray-50">
      <header className="sticky top-0 z-10 bg-white/95 backdrop-blur-sm border-b border-gray-100 px-4 shadow-sm flex justify-between items-center">
        <div className="flex items-center gap-3">
          <img
            src="/RIMI_logo-removebg-preview.png"
            alt="Logo"
            className="w-25 h-25 rounded-lg"
          />
          <div>
            <h1 className="font-bold text-lg text-gray-800 leading-tight">
              RIMI
            </h1>
            <span className="text-xs text-gray-400">Menu</span>
          </div>
        </div>
        <div className="bg-gray-100 text-gray-800 px-3 py-1 rounded-full text-xs font-bold uppercase">
          Table {tableNumber || "?"}
        </div>
      </header>

      <div className="sticky top-[70px] z-10 bg-gray-50/95 backdrop-blur-sm py-3 overflow-x-auto no-scrollbar flex gap-2 px-4 snap-x snap-mandatory">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`whitespace-nowrap px-5 py-2.5 rounded-full text-sm font-bold transition-all snap-start ${
              activeCategory === cat
                ? "bg-gradient-to-r from-gray-800 to-gray-900 text-white shadow-lg"
                : "bg-white text-gray-600 border border-gray-200 shadow-sm active:scale-95"
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      <div className="px-4 space-y-3 mt-3 pb-4">
        {filteredMenu.map((item) => {
          const qty = cart[item._id]?.qty || 0;
          return (
            <div
              key={item._id}
              className="bg-white p-4 rounded-2xl shadow-md border border-gray-100 flex justify-between items-center gap-4 active:scale-[0.98] transition-transform"
            >
              {item.imageUrl && (
                <img
                  src={item.imageUrl}
                  alt={item.name}
                  className="w-20 h-20 rounded-xl object-cover flex-shrink-0"
                />
              )}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1 flex-wrap">
                  <h3 className="font-bold text-gray-800 text-base truncate">
                    {item.name}
                  </h3>
                  {item.isBestseller && (
                    <span className="bg-yellow-100 text-yellow-700 text-[10px] font-bold px-2 py-0.5 rounded-full">
                      ⭐ BEST
                    </span>
                  )}
                  {item.isVeg !== false && (
                    <span className="w-4 h-4 border-2 border-green-600 rounded flex items-center justify-center shrink-0">
                      <span className="w-2 h-2 bg-green-600 rounded-full"></span>
                    </span>
                  )}
                </div>
                <p className="text-lg font-bold text-gray-900">₹{item.price}</p>
                <p className="text-xs text-gray-400 mt-0.5 line-clamp-1">
                  {item.description || item.category}
                </p>
              </div>
              <div className="flex-shrink-0">
                {!item.isAvailable ? (
                  <div className="text-red-500 text-xs font-bold bg-red-50 px-4 py-2 rounded-xl">
                    SOLD OUT
                  </div>
                ) : qty === 0 ? (
                  <button
                    onClick={() => addToCart(item)}
                    className="bg-gradient-to-r from-green-500 to-green-600 text-white px-6 py-2.5 rounded-xl text-sm font-bold shadow-lg shadow-green-500/30 active:scale-95 transition-transform"
                  >
                    ADD
                  </button>
                ) : (
                  <div className="flex items-center bg-gradient-to-r from-green-500 to-green-600 rounded-xl shadow-lg shadow-green-500/30">
                    <button
                      onClick={() => removeFromCart(item._id)}
                      className="p-3 text-white active:bg-green-700 rounded-l-xl transition-colors"
                    >
                      <FiMinus size={18} />
                    </button>
                    <span className="text-white font-bold px-3 text-base min-w-[32px] text-center">
                      {qty}
                    </span>
                    <button
                      onClick={() => addToCart(item)}
                      className="p-3 text-white active:bg-green-700 rounded-r-xl transition-colors"
                    >
                      <FiPlus size={18} />
                    </button>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {Object.values(cart).length > 0 && (
        <div className="fixed bottom-0 left-0 right-0 z-20 p-4 bg-gradient-to-t from-gray-100 to-transparent pt-8">
          <div className="bg-white p-3 rounded-t-2xl border border-gray-100 shadow-lg">
            <input
              type="text"
              placeholder="Any special request? (e.g. Less spicy)"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500"
            />
          </div>
          <div
            className="bg-gradient-to-r from-gray-800 to-gray-900 text-white p-4 rounded-b-2xl shadow-2xl flex justify-between items-center cursor-pointer active:scale-[0.98] transition-transform"
            onClick={placeOrder}
          >
            <div className="flex flex-col">
              <span className="text-xs text-gray-400 uppercase font-semibold tracking-wide">
                {Object.values(cart).reduce((a, b) => a + b.qty, 0)} Items
              </span>
              <span className="font-bold text-xl">
                ₹{Object.values(cart).reduce((a, b) => a + b.price * b.qty, 0)}
              </span>
            </div>
            <button className="flex items-center gap-2 bg-gradient-to-r from-green-500 to-green-600 text-white px-6 py-3 rounded-xl font-bold text-sm shadow-lg shadow-green-500/30 active:scale-95 transition-transform">
              Place Order <FiShoppingBag size={18} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Menu;
