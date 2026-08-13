import React, { useEffect, useState, useRef } from "react";
import { useSearchParams } from "react-router-dom";
import axios from "axios";
import { v4 as uuidv4 } from "uuid";
import { useSocket } from "../context/SocketContext";
import { AnimatePresence, motion } from "framer-motion";

// Custom Components
import MenuHeader from "../components/customer/MenuHeader";
import CategoryNav from "../components/customer/CategoryNav";
import MenuItemCard from "../components/customer/MenuItemCard";
import ItemDetailView from "../components/customer/ItemDetailView";
import OrderStatusOverlay from "../components/customer/OrderStatusOverlay";
import CartOverlay from "../components/customer/CartOverlay";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

const Menu = () => {
  const [searchParams] = useSearchParams();
  const tableNumber = searchParams.get("table");
  const restaurantId = searchParams.get("restaurantId");

  const [menu, setMenu] = useState([]);
  const [cart, setCart] = useState({});
  const [activeCategory, setActiveCategory] = useState("All");
  const [selectedItem, setSelectedItem] = useState(null);
  const [isCartOpen, setIsCartOpen] = useState(false);

  const [orderStatus, setOrderStatus] = useState(null);
  const [orderId, setOrderId] = useState(null);
  const [note, setNote] = useState("");

  const orderIdRef = useRef(null);
  const socket = useSocket();

  useEffect(() => {
    orderIdRef.current = orderId;
  }, [orderId]);

  useEffect(() => {
    const fetchMenu = async () => {
      if (!restaurantId) return;
      try {
        const res = await axios.get(`${API_URL}/menu?restaurantId=${restaurantId}`);
        setMenu(res.data);
      } catch (err) {
        console.error("Menu fetch error", err);
      }
    };
    fetchMenu();
  }, [restaurantId]);

  useEffect(() => {
    if (!socket || !tableNumber || !restaurantId) return;

    const joinRoom = () => {
      socket.emit("join_table_restaurant", { restaurantId, tableNumber });
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
  }, [socket, tableNumber, restaurantId]);

  const checkStatusManually = async () => {
    if (!orderId) return;
    try {
      const res = await axios.get(`${API_URL}/orders/${orderId}`);
      setOrderStatus(res.data.status);
    } catch (e) {
      console.error(e);
    }
  };

  const addToCart = (item) => {
    setCart((prev) => ({
      ...prev,
      [item._id]: { ...item, qty: (prev[item._id]?.qty || 0) + (item.qty || 1) },
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
        restaurantId,
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

      const idempotencyKey = uuidv4();

      const res = await axios.post(`${API_URL}/orders`, payload, {
        headers: { "Idempotency-Key": idempotencyKey },
      });

      setOrderId(res.data._id);
      orderIdRef.current = res.data._id;
      setOrderStatus("pending");
      setCart({});
      setIsCartOpen(false);
    } catch (err) {
      alert("Failed to place order.");
    }
  };

  const categories = ["All", ...new Set(menu.map((i) => i.category))];
  const filteredMenu =
    activeCategory === "All"
      ? menu
      : menu.filter((i) => i.category === activeCategory);

  const cartItemCount = Object.values(cart).reduce((sum, item) => sum + item.qty, 0);

  if (!menu.length) {
    return (
      <div className="h-screen flex items-center justify-center bg-[var(--color-cream)]">
        <div className="animate-pulse flex flex-col items-center">
          <div className="w-16 h-16 border-4 border-[var(--color-navy)] border-t-transparent rounded-full animate-spin"></div>
          <p className="mt-4 text-[var(--color-navy)] font-japanese text-2xl font-bold">Loading Menu...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--color-cream)] font-sans relative overflow-x-hidden">
      {/* 1. Header */}
      <MenuHeader 
        cartCount={cartItemCount} 
        onCartClick={() => setIsCartOpen(true)} 
      />

      {/* 2. Navigation */}
      <CategoryNav 
        categories={categories}
        activeCategory={activeCategory}
        onSelectCategory={setActiveCategory}
      />

      {/* 3. Main Grid */}
      <main className="px-6 py-6 pb-32">
        <AnimatePresence mode="wait">
          <motion.div 
            key={activeCategory}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="grid grid-cols-2 gap-4"
          >
            {filteredMenu.map((item, index) => (
              <MenuItemCard 
                key={item._id} 
                item={item} 
                onClick={setSelectedItem}
                delay={index * 0.03}
              />
            ))}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* 4. Detail View Overlay */}
      <AnimatePresence>
        {selectedItem && (
          <ItemDetailView 
            item={selectedItem}
            onBack={() => setSelectedItem(null)}
            onAddToCart={(itemWithQty) => {
              addToCart(itemWithQty);
              setSelectedItem(null);
            }}
          />
        )}
      </AnimatePresence>

      {/* 5. Cart Overlay */}
      <CartOverlay
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        cart={cart}
        addToCart={addToCart}
        removeFromCart={removeFromCart}
        placeOrder={placeOrder}
        note={note}
        setNote={setNote}
      />

      {/* 6. Order Status Overlay */}
      <AnimatePresence>
        {orderStatus && (
          <OrderStatusOverlay 
            status={orderStatus}
            checkStatusManually={checkStatusManually}
            onOrderMore={() => {
              setOrderStatus(null);
              setOrderId(null);
              orderIdRef.current = null;
              setNote("");
            }}
            onBackToMenu={() => {
              setOrderStatus(null);
              setCart({});
            }}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default Menu;
