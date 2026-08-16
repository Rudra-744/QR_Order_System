import { useState, useEffect, useCallback } from 'react';

export const useCart = (restaurantId, tableNumber, menu) => {
  const cartKey = `qr_cart_${restaurantId}_${tableNumber}`;

  const [cart, setCart] = useState(() => {
    if (!restaurantId || !tableNumber) return {};
    try {
      const stored = localStorage.getItem(cartKey);
      return stored ? JSON.parse(stored) : {};
    } catch (e) {
      console.error("Failed to parse cart from local storage", e);
      return {};
    }
  });

  // Sync with menu changes
  useEffect(() => {
    if (!menu || menu.length === 0 || !restaurantId || !tableNumber) return;

    setCart((prevCart) => {
      let hasChanges = false;
      const updatedCart = { ...prevCart };
      const menuMap = new Map(menu.map(item => [item._id, item]));

      for (const itemId in updatedCart) {
        const cartItem = updatedCart[itemId];
        const menuItem = menuMap.get(itemId);

        // Remove item if no longer in menu or not available
        if (!menuItem || !menuItem.isAvailable) {
          delete updatedCart[itemId];
          hasChanges = true;
          continue;
        }

        // Detect price changes
        if (cartItem.price !== menuItem.price) {
          updatedCart[itemId] = {
            ...cartItem,
            price: menuItem.price, // update to authoritative price
            oldPrice: cartItem.price,
            priceChanged: true, // flag for UI warning
          };
          hasChanges = true;
        } else if (cartItem.priceChanged && cartItem.price === menuItem.price && !cartItem.oldPrice) {
           // Clear flag if it somehow matches again (e.g. reverted on backend)
           updatedCart[itemId] = { ...cartItem, priceChanged: false };
           delete updatedCart[itemId].oldPrice;
           hasChanges = true;
        }
      }

      if (hasChanges) {
        try {
          localStorage.setItem(cartKey, JSON.stringify(updatedCart));
        } catch (e) {
           // Handle quota exceeded
        }
        return updatedCart;
      }
      return prevCart;
    });
  }, [menu, restaurantId, tableNumber, cartKey]);

  const addToCart = useCallback((item) => {
    setCart((prev) => {
      // Clear the priceChanged flag when user modifies the item, acknowledging it
      const existing = prev[item._id];
      const newCart = {
        ...prev,
        [item._id]: {
          ...item,
          qty: (existing?.qty || 0) + (item.qty || 1),
          priceChanged: false,
          oldPrice: undefined
        },
      };
      localStorage.setItem(cartKey, JSON.stringify(newCart));
      return newCart;
    });
  }, [cartKey]);

  const removeFromCart = useCallback((itemId) => {
    setCart((prev) => {
      const newCart = { ...prev };
      if (newCart[itemId] && newCart[itemId].qty > 1) {
        newCart[itemId].qty -= 1;
        newCart[itemId].priceChanged = false; // user interaction acknowledges
      } else {
        delete newCart[itemId];
      }
      localStorage.setItem(cartKey, JSON.stringify(newCart));
      return newCart;
    });
  }, [cartKey]);

  const clearCart = useCallback(() => {
    setCart({});
    localStorage.removeItem(cartKey);
  }, [cartKey]);

  return { cart, addToCart, removeFromCart, clearCart };
};
