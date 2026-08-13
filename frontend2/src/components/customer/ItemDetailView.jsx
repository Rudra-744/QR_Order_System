import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { FiArrowLeft, FiHeart, FiMinus, FiPlus } from 'react-icons/fi';

const ItemDetailView = ({ item, onBack, onAddToCart }) => {
  const [qty, setQty] = useState(1);
  const [isLiked, setIsLiked] = useState(false);

  const handleOrder = () => {
    onAddToCart({ ...item, qty });
    onBack();
  };

  return (
    <motion.div
      initial={{ x: '100%' }}
      animate={{ x: 0 }}
      exit={{ x: '100%' }}
      transition={{ type: 'spring', damping: 25, stiffness: 200 }}
      className="fixed inset-0 z-50 bg-[var(--color-cream)] flex flex-col overflow-hidden"
    >
      {/* Top Header */}
      <div className="flex justify-between items-center px-6 py-4">
        <button onClick={onBack} className="text-[var(--color-accent)] p-2 -ml-2">
          <FiArrowLeft size={24} />
        </button>
        <div className="w-8"></div> {/* Spacer for balance */}
        <div className="w-8"></div> {/* Spacer for balance */}
      </div>

      {/* Hero Image */}
      <motion.div 
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.2, type: 'spring' }}
        className="relative w-full flex-1 min-h-[20vh] max-h-[40vh] mx-auto flex items-center justify-center p-4 mt-2"
      >
        <div className="absolute inset-4 bg-black/5 rounded-full blur-2xl" />
        <img 
          src={item.imageUrl || "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?q=80&w=800&auto=format&fit=crop"} 
          alt={item.name} 
          className="w-auto h-full aspect-square object-cover rounded-full drop-shadow-2xl z-10"
        />
      </motion.div>

      <div className="mt-auto w-full flex flex-col">
        {/* Title & Heart */}
        <div className="px-8 mt-4 flex justify-between items-center z-20 flex-shrink-0">
          <h2 className="font-japanese text-4xl text-[var(--color-navy)] font-bold">{item.name}</h2>
          <motion.button 
            whileTap={{ scale: 1.5 }}
            onClick={() => setIsLiked(!isLiked)}
            className={`p-2 ${isLiked ? 'text-[var(--color-accent)] fill-[var(--color-accent)]' : 'text-[var(--color-accent)]'}`}
          >
            <FiHeart size={24} fill={isLiked ? 'currentColor' : 'none'} />
          </motion.button>
        </div>

        {/* Bottom Info Sheet */}
        <motion.div 
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="mt-6 flex-shrink-0 w-full bg-[var(--color-navy)] rounded-t-[40px] px-8 pt-8 pb-16 -mb-8 flex flex-col text-white"
        >
          {/* Mock Stats */}
          <div className="flex items-center gap-6 text-sm text-white/70 font-medium mb-4 border-b border-white/10 pb-4">
            <span>300ml</span>
            <span>359cal</span>
            <span className="ml-auto flex items-center gap-1">
              <FiHeart size={14} /> {isLiked ? 349 : 348}
            </span>
          </div>

          {/* Description */}
          <div className="overflow-y-auto max-h-[15vh] mb-6 pr-2 custom-scrollbar">
            <p className="text-white/80 text-sm leading-relaxed font-light">
              {item.description || "Perfectly warming and energizing dish with authentic flavors and fresh ingredients, crafted for a premium dining experience."}
            </p>
          </div>

          {/* Price Tag */}
          <div className="flex justify-end mb-6">
            <span className="font-japanese text-5xl font-bold">₹{item.price}</span>
          </div>

          {/* Controls */}
          <div className="flex items-center gap-4 mt-auto">
            {/* Quantity Selector */}
            <div className="flex items-center justify-between border border-white/30 rounded-full px-4 py-3 w-32">
              <button onClick={() => setQty(Math.max(1, qty - 1))} className="text-white/70 hover:text-white">
                <FiMinus size={18} />
              </button>
              <span className="font-semibold text-lg">{qty}</span>
              <button onClick={() => setQty(qty + 1)} className="text-white/70 hover:text-white">
                <FiPlus size={18} />
              </button>
            </div>

            {/* Order Button */}
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={handleOrder}
              className="flex-1 bg-[var(--color-cream)] text-[var(--color-navy)] font-japanese text-2xl font-bold py-3 rounded-full shadow-lg"
            >
              order
            </motion.button>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default ItemDetailView;
