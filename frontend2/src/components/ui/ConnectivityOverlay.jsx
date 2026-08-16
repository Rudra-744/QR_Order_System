import React from 'react';
import { FiWifiOff } from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';

export const ConnectivityOverlay = () => {
  const [isOnline, setIsOnline] = React.useState(navigator.onLine);

  React.useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const isBrowserOffline = !isOnline;

  return (
    <AnimatePresence>
      {isBrowserOffline && (
        <motion.div
          initial={{ y: -50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -50, opacity: 0 }}
          className="fixed top-0 left-0 w-full z-[100] p-4 flex justify-center pointer-events-none"
        >
          <div className="bg-red-500 text-white px-6 py-3 rounded-full shadow-lg flex items-center gap-3 pointer-events-auto">
            <FiWifiOff size={20} />
            <span className="font-medium text-sm">You are offline. Orders cannot be placed.</span>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default ConnectivityOverlay;
