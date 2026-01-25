import React, { useEffect, useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { useSocket } from "../context/SocketContext";
import {
  FiCheck,
  FiX,
  FiCoffee,
  FiSettings,
  FiClock,
  FiChevronUp,
  FiChevronDown,
  FiActivity,
} from "react-icons/fi";
import OrderTimer from "../components/OrderTimer";
import MenuManager from "../components/MenuManager";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

const Dashboard = () => {
  const [orders, setOrders] = useState([]);
  const [showHistory, setShowHistory] = useState(false);
  const [showMenuManager, setShowMenuManager] = useState(false);
  const socket = useSocket();

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const res = await axios.get(`${API_URL}/orders`);
      setOrders(res.data);
    } catch (err) {
      console.error("Fetch error", err);
    }
  };

  useEffect(() => {
    if (!socket) return;

    socket.on("order:new", (newOrder) => {
      setOrders((prev) => {
        if (prev.find((o) => o._id === newOrder._id)) return prev;
        return [newOrder, ...prev];
      });
      toast.success(`New Order: Table ${newOrder.tableNumber} 🔔`);
    });

    socket.on("order:update", (updatedOrder) => {
      setOrders((prev) =>
        prev.map((o) => (o._id === updatedOrder._id ? updatedOrder : o)),
      );
    });

    return () => {
      socket.off("order:new");
      socket.off("order:update");
    };
  }, [socket]);

  const handleStatus = async (id, status) => {
    setOrders((prev) => prev.map((o) => (o._id === id ? { ...o, status } : o)));

    try {
      await axios.put(`${API_URL}/admin/orders/${id}/status`, { status });
      toast.success(`Order ${status}`);
    } catch (err) {
      toast.error("Failed to update");
      fetchOrders();
    }
  };

  const pendingOrders = orders.filter((o) => o.status === "pending");
  const acceptedOrders = orders.filter((o) => o.status === "approved");
  const rejectedOrders = orders.filter((o) => o.status === "rejected");
  const completedOrders = orders.filter((o) => o.status === "completed");
  const historyList = [...completedOrders, ...rejectedOrders];

  return (
    <div className="min-h-screen bg-brand-50 pb-24">
      <nav className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-brand-100 px-6  flex justify-between items-center shadow-sm">
        <div className="flex items-center gap-3">
          <div className="">
            <img
              src="/RIMI_logo-removebg-preview.png"
              alt="Logo"
              className="w-25 h-25"
            />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900 leading-none">
              RIMI
            </h1>
            <span className="text-xs text-gray-500 font-medium">
              Admin Dashboard
            </span>
          </div>
        </div>
        <button
          onClick={() => setShowMenuManager(true)}
          className="bg-gray-900 text-white px-5 py-2.5 rounded-xl font-bold text-sm hover:bg-gray-800 transition-all shadow-md flex items-center gap-2"
        >
          <FiSettings /> Menu
        </button>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-8 pb-8 space-y-8">
        <section>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-2 h-8 bg-amber-400 rounded-full"></div>
              <h2 className="text-xl font-bold text-gray-900">New Orders</h2>
              {pendingOrders.length > 0 && (
                <span className="bg-amber-100 text-amber-700 text-sm font-bold px-3 py-1 rounded-full">
                  {pendingOrders.length}
                </span>
              )}
            </div>
          </div>

          {pendingOrders.length === 0 ? (
            <div className="bg-gray-50 border border-gray-200 rounded-2xl p-12 text-center">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <FiCoffee className="text-gray-400" size={32} />
              </div>
              <p className="text-gray-500 font-medium">No pending orders</p>
              <p className="text-gray-400 text-sm mt-1">
                New orders will appear here
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {pendingOrders.map((order) => (
                <div
                  key={order._id}
                  className="bg-white rounded-2xl border border-gray-200 overflow-hidden hover:border-gray-300 transition-all"
                >
                  <div className="p-5 border-b border-gray-100">
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="text-xs font-medium text-gray-400 uppercase">
                          Table
                        </span>
                        <div className="text-2xl font-bold text-gray-900">
                          {order.tableNumber}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <OrderTimer startTime={order.createdAt} />
                        <span className="bg-amber-400 text-amber-900 text-xs font-bold px-2 py-1 rounded-lg">
                          NEW
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="p-5 space-y-3">
                    {order.items.map((item, idx) => (
                      <div
                        key={idx}
                        className="flex justify-between items-center text-sm"
                      >
                        <div className="flex items-center gap-2">
                          <span className="w-6 h-6 bg-gray-100 rounded-md flex items-center justify-center text-xs font-bold text-gray-600">
                            {item.qty}
                          </span>
                          <span className="font-medium text-gray-800">
                            {item.name || "Item"}
                          </span>
                        </div>
                        <span className="text-gray-400">
                          ₹{item.price ? item.price * item.qty : ""}
                        </span>
                      </div>
                    ))}
                    {order.note && (
                      <div className="bg-amber-50 text-amber-700 text-sm p-3 rounded-xl mt-3">
                        📝 {order.note}
                      </div>
                    )}
                  </div>

                  <div className="p-4 bg-gray-50 flex gap-3">
                    <button
                      onClick={() => handleStatus(order._id, "rejected")}
                      className="flex-1 py-2.5 text-red-500 font-semibold rounded-xl border border-gray-200 bg-white hover:bg-red-50 hover:border-red-200 transition-all text-sm"
                    >
                      Reject
                    </button>
                    <button
                      onClick={() => handleStatus(order._id, "approved")}
                      className="flex-1 py-2.5 bg-gray-900 text-white font-semibold rounded-xl hover:bg-gray-800 transition-all text-sm"
                    >
                      Accept
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        <section>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-2 h-8 bg-emerald-500 rounded-full"></div>
              <h2 className="text-xl font-bold text-gray-900">
                Kitchen Preparing
              </h2>
              {acceptedOrders.length > 0 && (
                <span className="bg-emerald-100 text-emerald-700 text-sm font-bold px-3 py-1 rounded-full">
                  {acceptedOrders.length}
                </span>
              )}
            </div>
          </div>

          {acceptedOrders.length === 0 ? (
            <div className="bg-gray-50 border border-gray-200 rounded-2xl p-8 text-center">
              <p className="text-gray-400 font-medium">
                No orders being prepared
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {acceptedOrders.map((order) => (
                <div
                  key={order._id}
                  className="bg-white rounded-2xl border border-gray-200 overflow-hidden"
                >
                  <div className="p-5 flex justify-between items-center border-b border-gray-100">
                    <div>
                      <span className="text-xs font-medium text-gray-400 uppercase">
                        Table
                      </span>
                      <div className="text-2xl font-bold text-gray-900">
                        {order.tableNumber}
                      </div>
                    </div>
                    <OrderTimer
                      startTime={order.updatedAt || order.createdAt}
                    />
                  </div>

                  <div className="p-5">
                    <div className="space-y-2">
                      {order.items.map((item, idx) => (
                        <div
                          key={idx}
                          className="flex items-center gap-2 text-sm"
                        >
                          <span className="w-6 h-6 bg-gray-100 rounded-md flex items-center justify-center text-xs font-bold text-gray-600">
                            {item.qty}
                          </span>
                          <span className="font-medium text-gray-700">
                            {item.name || "Item"}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="p-4 pt-0">
                    <button
                      onClick={() => handleStatus(order._id, "completed")}
                      className="w-full py-3 bg-emerald-500 text-white font-semibold rounded-xl hover:bg-emerald-600 transition-all text-sm"
                    >
                      ✓ Food Ready
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>

      <div
        className={`fixed bottom-0 left-0 right-0 bg-white shadow-[0_-4px_20px_rgba(0,0,0,0.1)] border-t border-gray-200 transition-transform duration-300 z-50 ${
          showHistory ? "translate-y-0" : "translate-y-[calc(100%-60px)]"
        }`}
      >
        <button
          onClick={() => setShowHistory(!showHistory)}
          className="w-full h-[60px] flex items-center justify-between px-6 bg-white hover:bg-gray-50 transition-colors cursor-pointer"
        >
          <div className="flex items-center gap-3">
            <div className="bg-gray-100 p-2 rounded-lg text-gray-600">
              {showHistory ? <FiChevronDown /> : <FiChevronUp />}
            </div>
            <div>
              <h3 className="font-bold text-gray-800">Today's History</h3>
              <p className="text-xs text-gray-500">
                {historyList.length} Orders Completed/Rejected
              </p>
            </div>
          </div>
          <div className="font-bold text-xl text-gray-800">
            ₹{historyList.reduce((acc, curr) => acc + curr.totalAmount, 0)}
          </div>
        </button>

        <div className="h-[300px] overflow-y-auto p-4 bg-gray-50">
          <table className="w-full text-left text-sm">
            <thead className="text-gray-400 font-medium border-b border-gray-200">
              <tr>
                <th className="pb-3 pl-2">Time</th>
                <th className="pb-3">Table</th>
                <th className="pb-3">Order</th>
                <th className="pb-3">Total</th>
                <th className="pb-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {historyList.map((order) => (
                <tr key={order._id} className="bg-white">
                  <td className="py-3 pl-2 text-gray-500">
                    {new Date(order.createdAt).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </td>
                  <td className="py-3 font-bold text-gray-800">
                    {order.tableNumber}
                  </td>
                  <td className="py-3 text-gray-600 max-w-[200px] truncate">
                    {order.items
                      .map((i) => `${i.qty}x ${i.name || "Item"}`)
                      .join(", ")}
                  </td>
                  <td className="py-3 font-bold">₹{order.totalAmount}</td>
                  <td className="py-3">
                    <span
                      className={`px-2 py-1 rounded text-xs font-bold ${
                        order.status === "completed"
                          ? "bg-gray-100 text-gray-600"
                          : "bg-red-50 text-red-500"
                      }`}
                    >
                      {order.status.toUpperCase()}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {showMenuManager && (
        <MenuManager onClose={() => setShowMenuManager(false)} />
      )}
    </div>
  );
};

export default Dashboard;
