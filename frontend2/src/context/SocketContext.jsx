import React, { createContext, useContext, useEffect, useRef, useState } from "react";
import { io } from "socket.io-client";

const SocketContext = createContext(null);

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || "http://localhost:5000";

export const useSocket = () => {
  return useContext(SocketContext);
};

export const SocketProvider = ({ children }) => {
  const socketRef = useRef(null);
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    // Read the JWT token that AuthContext stores in localStorage
    const token = localStorage.getItem("token");

    const newSocket = io(SOCKET_URL, {
      transports: ["websocket"],
      // Pass JWT in the handshake auth payload so the server can
      // authenticate the socket for join_restaurant (Fix 1)
      auth: { token: token || "" },
    });

    socketRef.current = newSocket;
    setSocket(newSocket);

    return () => {
      newSocket.disconnect();
    };
  }, []);

  return (
    <SocketContext.Provider value={socket}>{children}</SocketContext.Provider>
  );
};
