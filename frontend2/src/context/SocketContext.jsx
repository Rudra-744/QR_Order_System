import React, { createContext, useMemo, useContext } from "react";
import { io } from "socket.io-client";

const SocketContext = createContext(null);

export const useSocket = () => {
  return useContext(SocketContext);
};

export const SocketProvider = ({ children }) => {
  // 🔥 FIX: 'withCredentials' hata diya hai.
  // Backend pe origin: "*" hai, isliye ye hataana zaroori hai.
  const socket = useMemo(
    () =>
      io("https://barry-corporations-salem-pike.trycloudflare.com", {
        transports: ["websocket"],
      }),
    []
  );

  return (
    <SocketContext.Provider value={socket}>{children}</SocketContext.Provider>
  );
};
