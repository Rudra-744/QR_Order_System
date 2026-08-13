import React from 'react';
import { motion } from 'framer-motion';
import { FiClock, FiCheckCircle, FiXCircle, FiRefreshCw } from 'react-icons/fi';

const OrderStatusOverlay = ({ status, checkStatusManually, onOrderMore, onBackToMenu }) => {
  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="fixed inset-0 z-50 flex flex-col items-center justify-center p-6 text-center bg-[var(--color-navy)]"
    >
      <div className="bg-[var(--color-cream)] p-8 rounded-3xl shadow-2xl max-w-sm w-full relative border-4 border-white/10">
        {status === "pending" && (
          <div
            className="absolute top-4 right-4 text-gray-400 hover:text-[var(--color-accent)] cursor-pointer"
            onClick={checkStatusManually}
            title="Refresh Status"
          >
            <FiRefreshCw />
          </div>
        )}

        {status === "pending" && (
          <motion.div
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", bounce: 0.5 }}
          >
            <div className="bg-[var(--color-navy)]/10 p-4 rounded-full w-24 h-24 flex items-center justify-center mx-auto mb-6 animate-pulse">
              <FiClock size={48} className="text-[var(--color-navy)]" />
            </div>
            <h2 className="font-japanese text-4xl font-bold mb-2 text-[var(--color-navy)]">Order Sent!</h2>
            <p className="text-gray-500 font-medium">Waiting for restaurant confirmation...</p>
            <p className="text-xs text-gray-400 mt-8">Please do not close this page.</p>
          </motion.div>
        )}

        {status === "approved" && (
          <motion.div
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", bounce: 0.5 }}
          >
            <motion.div 
              animate={{ y: [0, -10, 0] }}
              transition={{ repeat: Infinity, duration: 2 }}
              className="bg-emerald-100 p-4 rounded-full w-24 h-24 flex items-center justify-center mx-auto mb-6"
            >
              <FiCheckCircle size={48} className="text-emerald-500" />
            </motion.div>
            <h2 className="font-japanese text-4xl font-bold mb-2 text-[var(--color-navy)]">Order Accepted!</h2>
            <p className="text-gray-500 font-medium">Your food is being prepared.</p>
            <div className="mt-6 bg-emerald-50 text-emerald-700 py-3 rounded-xl font-bold text-sm">
              Kitchen is Preparing... 👨‍🍳
            </div>
            <button
              onClick={onOrderMore}
              className="mt-8 px-6 py-3 bg-[var(--color-navy)] text-white rounded-xl font-bold shadow-lg w-full active:scale-95 transition-transform"
            >
              Order More Items
            </button>
          </motion.div>
        )}

        {status === "rejected" && (
          <motion.div
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", bounce: 0.5 }}
          >
            <div className="bg-red-100 p-4 rounded-full w-24 h-24 flex items-center justify-center mx-auto mb-6">
              <FiXCircle size={48} className="text-red-500" />
            </div>
            <h2 className="font-japanese text-4xl font-bold mb-2 text-[var(--color-navy)]">Order Rejected</h2>
            <p className="text-gray-500 font-medium">Sorry, we cannot fulfill this order right now.</p>
            <button
              onClick={onBackToMenu}
              className="mt-8 px-6 py-3 bg-[var(--color-navy)] text-white rounded-xl font-bold shadow-lg w-full active:scale-95 transition-transform"
            >
              Back to Menu
            </button>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
};

export default OrderStatusOverlay;
