import React from 'react';
import { FiShoppingBag } from 'react-icons/fi';
import { motion } from 'framer-motion';

const MenuHeader = ({ cartCount, onCartClick }) => {
  return (
    <header className="sticky top-0 z-40 bg-[#334877] text-[#ece4d8] px-6 pt-4 pb-2 flex justify-between items-center">
      <h1 className="text-3xl font-bold tracking-wide" style={{ fontFamily: 'Rink' }}>rimi</h1>

      <motion.div 
        whileTap={{ scale: 0.9 }}
        onClick={onCartClick}
        className="relative cursor-pointer w-12 h-12 flex items-center justify-center rounded-full border-2 border-[#ece4d8]/30"
      >
        <FiShoppingBag size={20} />
        {cartCount > 0 && (
          <motion.div 
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-[#d8684d] text-white text-xs font-bold flex items-center justify-center rounded-full"
          >
            {cartCount}
          </motion.div>
        )}
      </motion.div>
    </header>
  );
};

export default MenuHeader;
