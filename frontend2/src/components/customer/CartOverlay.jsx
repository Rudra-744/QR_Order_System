import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiX, FiMinus, FiPlus, FiTrash2 } from 'react-icons/fi';

const CartOverlay = ({ isOpen, onClose, cart, removeFromCart, addToCart, placeOrder, note, setNote, isPlacingOrder }) => {
  const cartItems = Object.values(cart);
  const totalAmount = cartItems.reduce((acc, item) => acc + item.price * item.qty, 0);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
          />

          {/* Cart Drawer */}
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed bottom-0 left-0 right-0 h-[85vh] bg-[var(--color-cream)] rounded-t-[40px] z-50 flex flex-col overflow-hidden shadow-2xl"
          >
            {/* Header */}
            <div className="flex justify-between items-center p-6 border-b border-gray-200">
              <h2 className="font-japanese text-3xl font-bold text-[var(--color-navy)]">Your Order</h2>
              <button onClick={onClose} className="p-3 text-gray-500 hover:text-gray-800 bg-white rounded-full shadow-sm">
                <FiX size={24} />
              </button>
            </div>

            {/* Cart Items */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {cartItems.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-gray-400">
                  <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                    <FiTrash2 size={32} />
                  </div>
                  <p className="font-medium text-lg">Your tray is empty</p>
                </div>
              ) : (
                cartItems.map((item) => (
                  <div key={item._id} className={`flex gap-4 items-center bg-white p-4 rounded-2xl shadow-sm border ${item.priceChanged ? 'border-amber-400 bg-amber-50/30' : 'border-gray-100'}`}>
                    <div className="w-20 h-20 bg-gray-100 rounded-full flex-shrink-0 flex items-center justify-center overflow-hidden border border-gray-200">
                      <img 
                        src={item.imageUrl || "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?q=80&w=800&auto=format&fit=crop"} 
                        alt={item.name} 
                        className="w-full h-full object-cover" 
                      />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-bold text-[var(--color-navy)] text-lg leading-tight mb-1">{item.name}</h3>
                      <div className="flex flex-col">
                        <p className="text-[var(--color-accent)] font-semibold">₹{item.price * item.qty}</p>
                        {item.priceChanged && (
                          <span className="text-amber-600 text-xs font-bold mt-1 bg-amber-100 px-2 py-0.5 rounded w-max">
                            ⚠️ Price updated from ₹{item.oldPrice}
                          </span>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between h-11 bg-gray-50 rounded-full min-w-[100px] px-1 border border-gray-100 shadow-inner">
                      <button onClick={() => removeFromCart(item._id)} className="text-[var(--color-navy)] p-3 active:scale-90 flex items-center justify-center">
                        <FiMinus size={16} />
                      </button>
                      <span className="font-bold text-sm w-4 text-center">{item.qty}</span>
                      <button onClick={() => addToCart(item)} className="text-[var(--color-navy)] p-3 active:scale-90 flex items-center justify-center">
                        <FiPlus size={16} />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Footer */}
            {cartItems.length > 0 && (
              <div className="bg-white p-6 rounded-t-3xl shadow-[0_-10px_40px_rgba(0,0,0,0.05)] border-t border-gray-100">
                <div className="mb-4">
                  <input
                    type="text"
                    placeholder="Add a note for the chef..."
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]/20"
                  />
                </div>
                <div className="flex justify-between items-center mb-6">
                  <span className="text-gray-500 font-medium">Total</span>
                  <span className="font-japanese text-4xl font-bold text-[var(--color-navy)]">₹{totalAmount}</span>
                </div>
                <button
                  onClick={placeOrder}
                  disabled={isPlacingOrder}
                  className={`w-full text-white font-japanese text-2xl font-bold py-4 rounded-full shadow-lg transition-transform ${isPlacingOrder ? 'bg-gray-400 cursor-not-allowed' : 'bg-[var(--color-navy)] active:scale-95'}`}
                >
                  {isPlacingOrder ? (
                    <span className="flex items-center justify-center gap-3">
                      <div className="w-6 h-6 border-4 border-white border-t-transparent rounded-full animate-spin"></div>
                      Placing Order...
                    </span>
                  ) : 'Place Order'}
                </button>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default CartOverlay;
