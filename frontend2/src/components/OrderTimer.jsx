import React, { useState, useEffect } from "react";
import { FiClock } from "react-icons/fi";

const OrderTimer = ({ startTime }) => {
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    const calculateElapsed = () => {
      const now = new Date();
      const start = new Date(startTime);
      const diffMins = Math.floor((now - start) / 60000);
      setElapsed(diffMins);
    };

    calculateElapsed();

    const interval = setInterval(calculateElapsed, 1000);

    return () => clearInterval(interval);
  }, [startTime]);

  let colorClass = "text-green-600 bg-green-100";
  let label = "On Time";

  if (elapsed >= 10 && elapsed < 15) {
    colorClass = "text-amber-700 bg-amber-100";
    label = "Warning";
  } else if (elapsed >= 15) {
    colorClass = "text-red-600 bg-red-100 animate-pulse";
    label = "Late";
  }

  return (
    <div
      className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-bold ${colorClass}`}
    >
      <FiClock size={14} />
      <span>{elapsed} min</span>
      <span className="opacity-70">• {label}</span>
    </div>
  );
};

export default OrderTimer;
