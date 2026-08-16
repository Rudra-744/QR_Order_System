import React, { useEffect, useState, useRef, useCallback } from "react";
import { useSearchParams } from "react-router-dom";
import { v4 as uuidv4 } from "uuid";
import { useMenu, usePlaceOrder, useOrderStatus } from "../api/queries";
import apiClient from "../api/apiClient";
import { AnimatePresence, motion } from "framer-motion";
import { Toaster, toast } from "react-hot-toast";
import { useCart } from "../hooks/useCart";
import { useActiveOrders } from "../hooks/useActiveOrders";

// Custom Components
import MenuHeader from "../components/customer/MenuHeader";
import CategoryNav from "../components/customer/CategoryNav";
import MenuItemCard from "../components/customer/MenuItemCard";
import ItemDetailView from "../components/customer/ItemDetailView";
import OrderStatusOverlay from "../components/customer/OrderStatusOverlay";
import CartOverlay from "../components/customer/CartOverlay";
import { Helmet } from "react-helmet-async";
import SkeletonCard from "../components/ui/SkeletonCard";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

const Menu = () => {
  const [searchParams] = useSearchParams();
  const tableNumber = searchParams.get("table");
  const restaurantId = searchParams.get("restaurantId");

  const { data: menu = [], isLoading: isMenuLoading, isError: isMenuError, error: menuError } = useMenu(restaurantId);
  const placeOrderMutation = usePlaceOrder();
  const idempotencyKeyRef = useRef(uuidv4());
  
  const { cart, addToCart, removeFromCart, clearCart } = useCart(restaurantId, tableNumber, menu);
  const { activeOrderIds, addOrderId, clearOrders } = useActiveOrders(restaurantId, tableNumber);

  const [activeCategory, setActiveCategory] = useState("All");
  const [selectedItem, setSelectedItem] = useState(null);
  const [isCartOpen, setIsCartOpen] = useState(false);

  // Track the status of the most recently placed order for the overlay
  const [currentOrderStatus, setCurrentOrderStatus] = useState(null);
  const [currentOrderId, setCurrentOrderId] = useState(null);
  const [note, setNote] = useState("");
  const [showOrderOverlay, setShowOrderOverlay] = useState(false);

  const { data: polledOrder, refetch: checkStatusManually } = useOrderStatus(currentOrderId, idempotencyKeyRef.current);

  useEffect(() => {
    // Also if we have active orders from a previous session, we could fetch their statuses.
    // For simplicity, we just resume tracking if they exist.
    if (activeOrderIds.length > 0 && !currentOrderId) {
      const lastOrderId = activeOrderIds[activeOrderIds.length - 1];
      setCurrentOrderId(lastOrderId);
      setCurrentOrderStatus("pending"); // assume pending until polledOrder fetches
    }
  }, [activeOrderIds, currentOrderId]);

  useEffect(() => {
    if (polledOrder?.status) {
      if (polledOrder.status === "approved" && currentOrderStatus !== "approved" && navigator.vibrate) {
        navigator.vibrate([200, 100, 200]);
      }
      setCurrentOrderStatus(polledOrder.status);
    }
  }, [polledOrder?.status, currentOrderStatus]);

  const handleAddToCart = useCallback((item) => {
    addToCart(item);
    toast.success(`${item.name} added to cart!`);
  }, [addToCart]);

  const placeOrder = () => {
    if (!navigator.onLine) {
      toast.error("You are offline. Please reconnect to the internet to place your order.", { id: 'offline-block' });
      return;
    }
    if (!tableNumber || !restaurantId) {
      toast.error("Invalid QR code!");
      return;
    }
    
    const cartItems = Object.values(cart);

    const payload = {
      restaurantId,
      tableNumber: parseInt(tableNumber),
      items: cartItems.map((i) => ({
        itemId: i._id,
        name: i.name,
        qty: i.qty,
      })),
      note: note,
    };

    placeOrderMutation.mutate(
      { data: payload, idempotencyKey: idempotencyKeyRef.current },
      {
        onSuccess: (res) => {
          setCurrentOrderId(res._id);
          addOrderId(res._id);
          setCurrentOrderStatus("pending");
          setShowOrderOverlay(true);
          clearCart();
          setIsCartOpen(false);
          setNote("");
          idempotencyKeyRef.current = uuidv4();
        },
        onError: (err) => {
          const message = err.response?.data?.message || "Failed to place order. Please try again.";
          toast.error(message, { id: 'order-fail' });
        }
      }
    );
  };

  const categories = ["All", ...new Set(menu.map((i) => i.category))];
  const filteredMenu =
    activeCategory === "All"
      ? menu
      : menu.filter((i) => i.category === activeCategory);

  const cartItemCount = Object.values(cart).reduce((sum, item) => sum + item.qty, 0);

  if (isMenuError) {
    const is404 = menuError?.response?.status === 404 || menuError?.response?.status === 400;
    if (is404) {
      return (
        <div className="h-screen flex flex-col items-center justify-center bg-[#ece4d8] p-6 text-center">
          <h2 className="text-2xl font-bold text-red-600 mb-2">Invalid QR Code</h2>
          <p className="text-gray-600 font-medium">This restaurant or table could not be found. Please scan a valid QR code.</p>
        </div>
      );
    }
    return (
      <div className="h-screen flex flex-col items-center justify-center bg-[#ece4d8] p-6 text-center">
        <h2 className="text-2xl font-bold text-red-600 mb-2">Oops, something went wrong.</h2>
        <p className="text-gray-600 mb-6 font-medium">We couldn't load the menu. Please check your connection and try again.</p>
        <button onClick={() => window.location.reload()} className="px-6 py-3 bg-[#334877] text-white font-bold rounded-xl active:scale-95 transition-transform">
          Retry
        </button>
      </div>
    );
  }

  if (isMenuLoading) {
    return (
      <div className="min-h-screen bg-[#ece4d8] font-sans relative p-6 pt-24">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 sm:gap-6">
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
        </div>
      </div>
    );
  }

  if (!menu.length) {
    return (
      <div className="h-screen flex items-center justify-center bg-[#ece4d8]">
        <p className="mt-4 text-[#334877] font-japanese text-2xl font-bold">No menu items found.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#ece4d8] font-sans relative overflow-x-hidden">
      <Helmet>
        <title>Rimi - Premium QR Dining Menu</title>
        <meta name="description" content="Browse our premium menu and order directly from your phone. Enjoy seamless, contactless dining with Rimi." />
        <meta property="og:title" content="Rimi - Premium QR Dining Menu" />
        <meta property="og:description" content="Browse our premium menu and order directly from your phone. Enjoy seamless, contactless dining with Rimi." />
      </Helmet>
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
      <main className="px-6 py-6 pb-32 min-h-[60vh]">
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.2 }}
            className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 sm:gap-6 max-w-7xl mx-auto"
          >
            {filteredMenu.map((item, index) => (
              <MenuItemCard 
                key={item._id} 
                item={item} 
                onClick={setSelectedItem}
                delay={index * 0.03}
                isPriority={index < 2}
              />
            ))}
          </motion.div>
      </main>

      {/* 4. Detail View Overlay */}
      <AnimatePresence>
        {selectedItem && (
          <ItemDetailView 
            item={selectedItem}
            onBack={() => setSelectedItem(null)}
            onAddToCart={(itemWithQty) => {
              handleAddToCart(itemWithQty);
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
        addToCart={handleAddToCart}
        removeFromCart={removeFromCart}
        placeOrder={placeOrder}
        note={note}
        setNote={setNote}
        isPlacingOrder={placeOrderMutation.isPending}
      />

      {/* 6. Order Status Overlay */}
      <AnimatePresence>
        {showOrderOverlay && currentOrderStatus && (
          <OrderStatusOverlay 
            status={currentOrderStatus}
            checkStatusManually={checkStatusManually}
            onOrderMore={() => {
              setShowOrderOverlay(false);
            }}
            onBackToMenu={() => {
              setShowOrderOverlay(false);
            }}
          />
        )}
      </AnimatePresence>
      <Toaster position="top-center" />
    </div>
  );
};

export default Menu;
