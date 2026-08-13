import React from 'react';
import { FiShoppingBag } from 'react-icons/fi';
import { motion } from 'framer-motion';

const MenuHeader = ({ cartCount, onCartClick }) => {
  return (
    <header className="sticky top-0 z-40 bg-[var(--color-cream)]/90 backdrop-blur-md px-6 py-4 flex justify-between items-center">
      <h1 className="font-japanese text-4xl text-[var(--color-navy)] font-bold tracking-wide">rimi</h1>

      <motion.div 
        whileTap={{ scale: 0.9 }}
        onClick={onCartClick}
        className="relative cursor-pointer w-10 h-10 flex items-center justify-center rounded-full border-2 border-[var(--color-navy)] text-[var(--color-navy)]"
      >
        <FiShoppingBag size={18} />
        {cartCount > 0 && (
          <motion.div 
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-[var(--color-accent)] text-white text-xs font-bold flex items-center justify-center rounded-full"
          >
            {cartCount}
          </motion.div>
        )}
      </motion.div>
    </header>
  );
};

export default MenuHeader;
