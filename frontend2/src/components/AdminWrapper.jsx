import React from "react";
import { SocketProvider } from "../context/SocketContext";
import Dashboard from "../pages/Dashboard";

const AdminWrapper = () => {
  return (
    <SocketProvider>
      <Dashboard />
    </SocketProvider>
  );
};

export default AdminWrapper;
