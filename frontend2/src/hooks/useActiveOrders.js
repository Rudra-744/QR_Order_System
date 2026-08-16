import { useState, useEffect, useCallback } from 'react';

export const useActiveOrders = (restaurantId, tableNumber) => {
  const ordersKey = `qr_orders_${restaurantId}_${tableNumber}`;

  const [activeOrderIds, setActiveOrderIds] = useState(() => {
    if (!restaurantId || !tableNumber) return [];
    try {
      const stored = localStorage.getItem(ordersKey);
      return stored ? JSON.parse(stored) : [];
    } catch (e) {
      console.error("Failed to parse orders from local storage", e);
      return [];
    }
  });

  const addOrderId = useCallback((orderId) => {
    setActiveOrderIds((prev) => {
      if (prev.includes(orderId)) return prev;
      const newOrders = [...prev, orderId];
      localStorage.setItem(ordersKey, JSON.stringify(newOrders));
      return newOrders;
    });
  }, [ordersKey]);

  const removeOrderId = useCallback((orderId) => {
    setActiveOrderIds((prev) => {
      const newOrders = prev.filter(id => id !== orderId);
      localStorage.setItem(ordersKey, JSON.stringify(newOrders));
      return newOrders;
    });
  }, [ordersKey]);

  const clearOrders = useCallback(() => {
    setActiveOrderIds([]);
    localStorage.removeItem(ordersKey);
  }, [ordersKey]);

  return { activeOrderIds, addOrderId, removeOrderId, clearOrders };
};
