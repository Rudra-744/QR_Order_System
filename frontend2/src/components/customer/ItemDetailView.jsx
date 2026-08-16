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
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-[#ece4d8] sm:bg-black/50 sm:backdrop-blur-sm flex justify-center sm:items-center overflow-hidden"
    >
      <motion.div
        initial={{ y: '100%', scale: 0.9 }}
        animate={{ y: 0, scale: 1 }}
        exit={{ y: '100%', scale: 0.9 }}
        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
        className="w-full h-full sm:max-w-md sm:h-[90vh] sm:max-h-[850px] sm:rounded-[2.5rem] bg-[#ece4d8] flex flex-col shadow-2xl overflow-hidden relative"
      >
        {/* Top Header */}
        <div className="flex justify-between items-center px-6 py-4">
          <button onClick={onBack} className="text-[#d8684d] p-4 -ml-4 active:scale-95 transition-transform">
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
          className="relative w-full flex-1 min-h-[20vh] max-h-[35vh] mx-auto flex items-center justify-center p-4 mt-2"
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
          <div className="px-8 mt-2 flex justify-between items-center z-20 flex-shrink-0">
            <h2 className="font-japanese text-3xl sm:text-4xl text-[#334877] font-bold line-clamp-2 pr-4">{item.name}</h2>
            <motion.button 
              whileTap={{ scale: 1.5 }}
              onClick={() => setIsLiked(!isLiked)}
              className={`p-4 -mr-4 flex-shrink-0 ${isLiked ? 'text-[#d8684d] fill-[#d8684d]' : 'text-[#d8684d]'}`}
            >
              <FiHeart size={24} fill={isLiked ? 'currentColor' : 'none'} />
            </motion.button>
          </div>

          {/* Bottom Info Sheet */}
          <motion.div 
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="mt-6 flex-1 w-full bg-[#334877] rounded-t-[40px] px-8 pt-8 pb-10 flex flex-col text-[#ece4d8] relative"
          >
            {/* Bleed element to prevent ANY subpixel gaps at the bottom */}
            <div className="absolute top-[99%] left-0 right-0 h-[50vh] bg-[#334877] -z-10" />
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
              <span className="font-japanese text-4xl sm:text-5xl font-bold">₹{item.price}</span>
            </div>

            {/* Controls */}
            <div className="flex items-center gap-4 mt-auto">
              {/* Quantity Selector */}
              <div className="flex items-center justify-between border border-white/30 rounded-full w-32 bg-white/5">
                <button onClick={() => setQty(Math.max(1, qty - 1))} className="text-white/70 hover:text-white p-3 flex-1 flex justify-center active:bg-white/10 rounded-l-full transition-colors">
                  <FiMinus size={18} />
                </button>
                <span className="font-semibold text-lg w-6 text-center">{qty}</span>
                <button onClick={() => setQty(qty + 1)} className="text-white/70 hover:text-white p-3 flex-1 flex justify-center active:bg-white/10 rounded-r-full transition-colors">
                  <FiPlus size={18} />
                </button>
              </div>

              {/* Order Button */}
              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={handleOrder}
                className="flex-1 bg-[#ece4d8] text-[#334877] font-japanese text-xl sm:text-2xl font-bold py-3 rounded-full shadow-lg"
              >
                order
              </motion.button>
            </div>
          </motion.div>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default ItemDetailView;
