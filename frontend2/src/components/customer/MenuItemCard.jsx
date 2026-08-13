import React from 'react';
import { motion } from 'framer-motion';
import { FiArrowRight } from 'react-icons/fi';

const MenuItemCard = ({ item, onClick, delay = 0 }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay, type: "spring", stiffness: 100 }}
      whileHover={{ y: -5 }}
      whileTap={{ scale: 0.98 }}
      onClick={() => onClick(item)}
      className="bg-[var(--color-navy)] rounded-2xl p-4 flex flex-col relative cursor-pointer overflow-hidden shadow-lg"
    >
      {/* Top Labels */}
      <div className="flex justify-between items-start z-10 mb-2">
        <span className="text-white/90 text-[10px] font-medium tracking-wider uppercase bg-white/10 px-2 py-1 rounded-sm backdrop-blur-sm">
          {item.isAvailable ? 'Available' : 'Sold Out'}
        </span>
        <span className="text-white font-bold text-sm bg-white/10 px-2 py-1 rounded-sm backdrop-blur-sm">
          ₹{item.price}
        </span>
      </div>

      {/* Circular Image */}
      <div className="relative w-full aspect-square mb-4 flex items-center justify-center">
        {/* Glow effect behind the bowl */}
        <div className="absolute inset-0 bg-white/5 rounded-full blur-xl scale-75" />
        <img 
          src={item.imageUrl || "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?q=80&w=800&auto=format&fit=crop"} 
          alt={item.name} 
          className="w-[90%] h-[90%] object-cover rounded-full drop-shadow-2xl z-10 border-2 border-[var(--color-navy)]"
        />
      </div>

      {/* Content */}
      <div className="mt-auto bg-[var(--color-cream)] -mx-4 -mb-4 p-4 pt-5 rounded-t-3xl rounded-b-2xl flex flex-col">
        <h3 className="font-japanese text-2xl text-[var(--color-navy)] font-bold mb-1 leading-tight">
          {item.name}
        </h3>
        <p className="text-gray-500 text-xs line-clamp-2 leading-relaxed font-medium">
          {item.description || 'Delicious freshly made asian cuisine with authentic spices.'}
        </p>
        <div className="mt-3 flex justify-end">
          <FiArrowRight className="text-[var(--color-accent)]" size={18} />
        </div>
      </div>
    </motion.div>
  );
};

export default MenuItemCard;
