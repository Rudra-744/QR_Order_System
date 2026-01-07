import React, { useState, useEffect } from "react";
import { FiClock } from "react-icons/fi";

const OrderTimer = ({ startTime }) => {
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    // Har minute update karo
    const interval = setInterval(() => {
      const now = new Date();
      const start = new Date(startTime);
      const diffMins = Math.floor((now - start) / 60000);
      setElapsed(diffMins);
    }, 60000); // 1 minute interval

    // Initial calculation
    const now = new Date();
    const start = new Date(startTime);
    setElapsed(Math.floor((now - start) / 60000));

    return () => clearInterval(interval);
  }, [startTime]);

  // Color Logic
  let colorClass = "text-green-600 bg-green-100";
  if (elapsed > 10) colorClass = "text-yellow-700 bg-yellow-100";
  if (elapsed > 20) colorClass = "text-red-700 bg-red-100 animate-pulse";

  return (
    <div
      className={`flex items-center gap-1 px-2 py-1 rounded-md text-xs font-bold ${colorClass}`}
    >
      <FiClock />
      <span>{elapsed} min ago</span>
    </div>
  );
};

export default OrderTimer;
