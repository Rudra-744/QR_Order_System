import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";
import axios from "axios";
import { SocketProvider } from "./context/SocketContext"; // 👈 1. IMPORT THIS

// Global Config
axios.defaults.withCredentials = true;

createRoot(document.getElementById("root")).render(
  <StrictMode>
    {/* 👇 2. WRAP YOUR APP HERE */}
    <SocketProvider>
      <App />
    </SocketProvider>
  </StrictMode>
);
