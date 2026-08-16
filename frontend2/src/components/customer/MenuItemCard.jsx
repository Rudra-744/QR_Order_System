import React, { memo } from 'react';
import { motion } from 'framer-motion';
import { FiArrowRight } from 'react-icons/fi';

const MenuItemCard = memo(({ item, onClick, delay = 0, isPriority = false }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: Math.min(delay, 0.2), ease: "easeOut" }}
      whileHover={{ y: -2 }}
      whileTap={{ scale: 0.98 }}
      onClick={() => onClick(item)}
      className="bg-[#334877] rounded-[1.5rem] p-2 flex flex-col h-full relative cursor-pointer shadow-sm border border-[#334877]/10"
    >
      {/* Top Labels */}
      <div className="flex justify-between items-start z-10 mb-1 px-1 pt-1">
        <span className="text-white/90 text-[8px] font-bold tracking-widest uppercase bg-black/20 px-2 py-0.5 rounded">
          {item.isAvailable ? 'Available' : 'Sold Out'}
        </span>
        <span className="text-white font-bold text-xs bg-black/20 px-1.5 py-0.5 rounded">
          ₹{item.price}
        </span>
      </div>

      {/* Circular Image */}
      <div className="relative w-full aspect-square mb-2 flex items-center justify-center">
        <div className="absolute inset-0 bg-white/5 rounded-full scale-75" />
        <img
          src={item.imageUrl || "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?q=80&w=400&auto=format&fit=crop"}
          alt={item.name}
          width="150"
          height="150"
          loading={isPriority ? "eager" : "lazy"}
          fetchpriority={isPriority ? "high" : "auto"}
          decoding="async"
          className="w-[85%] h-[85%] object-cover rounded-full shadow-lg z-10 border border-white/10"
        />
      </div>

      {/* Content */}
      <div className="mt-auto bg-[#ece4d8] -mx-2 -mb-2 p-3 pt-4 rounded-t-[1.5rem] rounded-b-[1.3rem] flex flex-col flex-1">
        <h3 className="font-japanese text-lg text-[#334877] font-bold mb-1 leading-tight line-clamp-2 min-h-[2.5rem]">
          {item.name}
        </h3>
        <p className="text-[#334877]/60 text-[10px] line-clamp-2 leading-relaxed font-medium mb-2">
          {item.description || 'Delicious freshly made asian cuisine with authentic spices.'}
        </p>
        <div className="mt-auto flex justify-end">
          <FiArrowRight className="text-[#d8684d]" size={16} />
        </div>
      </div>
    </motion.div>
  );
});

export default MenuItemCard;
