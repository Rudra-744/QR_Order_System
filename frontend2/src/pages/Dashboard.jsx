import React, { useEffect, useState } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { useSocket } from '../context/SocketContext';
import { FiCheck, FiX, FiCoffee, FiSettings, FiClock, FiChevronUp, FiChevronDown, FiActivity } from 'react-icons/fi';
import OrderTimer from '../components/OrderTimer';
import MenuManager from '../components/MenuManager';

const API_URL = 'http://localhost:5000/api';

const Dashboard = () => {
  const [orders, setOrders] = useState([]);
  const [showHistory, setShowHistory] = useState(false);
  const [showMenuManager, setShowMenuManager] = useState(false);
  const socket = useSocket();

  // 1. Initial Fetch
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

  // 2. Real-time Socket Listener
  useEffect(() => {
    if (!socket) return;

    socket.on('order:new', (newOrder) => {
      setOrders(prev => {
        // Prevent duplicate cards
        if (prev.find(o => o._id === newOrder._id)) return prev;
        return [newOrder, ...prev];
      });
      toast.success(`New Order: Table ${newOrder.tableNumber} 🔔`);
    });

    socket.on('order:update', (updatedOrder) => {
      setOrders(prev => prev.map(o => o._id === updatedOrder._id ? updatedOrder : o));
    });

    return () => {
      socket.off('order:new');
      socket.off('order:update');
    };
  }, [socket]);

  // 3. Status Action Handler
  const handleStatus = async (id, status) => {
    // Optimistic Update
    setOrders(prev => prev.map(o => o._id === id ? { ...o, status } : o));

    try {
      await axios.put(`${API_URL}/admin/orders/${id}/status`, { status });
      toast.success(`Order ${status}`);
    } catch (err) {
      toast.error("Failed to update");
      fetchOrders();
    }
  };

  // --- SECTIONS ---
  const pendingOrders = orders.filter(o => o.status === 'pending');
  const acceptedOrders = orders.filter(o => o.status === 'approved');
  const rejectedOrders = orders.filter(o => o.status === 'rejected');
  const completedOrders = orders.filter(o => o.status === 'completed');

  // Combine for History
  const historyList = [...completedOrders, ...rejectedOrders];

  return (
    <div className="min-h-screen bg-brand-50 pb-24">
      
      {/* HEADER */}
      <nav className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-brand-100 px-6 py-4 flex justify-between items-center shadow-sm">
        <div className="flex items-center gap-3">
          <div className="p-2">
            <img src="./public/logo.png" alt="Logo" className="w-10 h-10" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900 leading-none">Mrs Jha Kitchen</h1>
            <span className="text-xs text-gray-500 font-medium">Admin Dashboard</span>
          </div>
        </div>
        <button 
          onClick={() => setShowMenuManager(true)}
          className="bg-gray-900 text-white px-5 py-2.5 rounded-xl font-bold text-sm hover:bg-gray-800 transition-all shadow-md flex items-center gap-2"
        >
          <FiSettings /> Menu
        </button>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-8 space-y-10">
        
        {/* 🟡 SECTION 1: WAITING ORDERS */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 rounded-full bg-yellow-500 animate-pulse"></div>
            <h2 className="text-lg font-bold text-gray-800">Waiting for Confirmation ({pendingOrders.length})</h2>
          </div>

          {pendingOrders.length === 0 ? (
            <div className="bg-white border-2 border-dashed border-gray-200 rounded-2xl p-8 text-center text-gray-400 font-medium">
              No new orders pending
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {pendingOrders.map(order => (
                <div key={order._id} className="bg-white rounded-2xl shadow-sm border-2 border-yellow-400 overflow-hidden flex flex-col relative">
                  <div className="absolute top-0 right-0 bg-yellow-400 text-yellow-900 text-xs font-bold px-3 py-1 rounded-bl-xl">NEW</div>
                  
                  {/* Card Header */}
                  <div className="p-5 border-b border-gray-50 bg-yellow-50/30">
                    <div className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Table</div>
                    <div className="flex justify-between items-center">
                      <div className="text-3xl font-bold text-gray-800">{order.tableNumber}</div>
                      <OrderTimer startTime={order.createdAt} />
                    </div>
                  </div>

                  {/* Items */}
                  <div className="p-5 flex-1 space-y-3">
                    {order.items.map((item, idx) => (
                      <div key={idx} className="flex justify-between items-start text-sm">
                        <span className="font-bold text-gray-700">
                          <span className="text-brand-600 mr-2">{item.qty}x</span>
                          {/* Fallback if name is missing */}
                          {item.name || "Item"} 
                        </span>
                        <span className="text-gray-400 font-medium">₹{item.price ? item.price * item.qty : ''}</span>
                      </div>
                    ))}
                    {order.note && (
                      <div className="bg-yellow-50 text-yellow-800 text-xs p-3 rounded-lg border border-yellow-100 italic mt-3">
                        📝 "{order.note}"
                      </div>
                    )}
                  </div>

                  {/* Footer & Actions */}
                  <div className="p-4 bg-gray-50 border-t border-gray-100 flex gap-3">
                    <button 
                      onClick={() => handleStatus(order._id, 'rejected')}
                      className="flex-1 py-3 bg-white text-red-500 font-bold rounded-xl border border-gray-200 hover:bg-red-50 hover:border-red-200 transition-all shadow-sm"
                    >
                      Reject
                    </button>
                    <button 
                      onClick={() => handleStatus(order._id, 'approved')}
                      className="flex-1 py-3 bg-gray-900 text-white font-bold rounded-xl hover:bg-gray-800 active:scale-95 transition-all shadow-lg shadow-gray-900/20"
                    >
                      Accept
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* 🟢 SECTION 2: ACCEPTED / PREPARING */}
        <div className="space-y-4">
           <div className="flex items-center gap-2">
            <div className="h-3 w-3 rounded-full bg-green-500"></div>
            <h2 className="text-lg font-bold text-gray-800">Kitchen Preparing ({acceptedOrders.length})</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {acceptedOrders.map(order => (
              <div key={order._id} className="bg-white rounded-2xl shadow-sm border border-green-200 overflow-hidden opacity-90 hover:opacity-100 transition-opacity">
                 <div className="p-4 border-b border-gray-50 flex justify-between items-center bg-green-50/30">
                    <div>
                      <span className="text-xs font-bold text-green-600 uppercase">Preparing</span>
                      <div className="text-xl font-bold text-gray-800">Table {order.tableNumber}</div>
                    </div>
                    <div className="h-8 w-8 bg-green-100 rounded-full flex items-center justify-center text-green-600">
                      <FiActivity />
                    </div>
                  </div>
                  <div className="p-4 space-y-2">
                    {order.items.map((item, idx) => (
                      <div key={idx} className="text-sm font-medium text-gray-600">
                        {item.qty}x {item.name || "Item"}
                      </div>
                    ))}
                  </div>
                  <div className="px-4 pb-4 pt-0">
                     <button 
                        onClick={() => handleStatus(order._id, 'completed')}
                        className="w-full py-2 bg-green-500 text-white font-bold rounded-lg text-sm hover:bg-green-600 transition-colors"
                      >
                        Mark Done
                      </button>
                  </div>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* 📜 SECTION 4: HISTORY (Bottom Sheet) */}
      <div className={`fixed bottom-0 left-0 right-0 bg-white shadow-[0_-4px_20px_rgba(0,0,0,0.1)] border-t border-gray-200 transition-transform duration-300 z-50 ${showHistory ? 'translate-y-0' : 'translate-y-[calc(100%-60px)]'}`}>
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
               <p className="text-xs text-gray-500">{historyList.length} Orders Completed/Rejected</p>
             </div>
          </div>
          <div className="font-bold text-xl text-gray-800">
            ₹{historyList.reduce((acc, curr) => acc + curr.totalAmount, 0)}
          </div>
        </button>
        
        {/* Scrollable List */}
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
              {historyList.map(order => (
                <tr key={order._id} className="bg-white">
                  <td className="py-3 pl-2 text-gray-500">
                    {new Date(order.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                  </td>
                  <td className="py-3 font-bold text-gray-800">{order.tableNumber}</td>
                  <td className="py-3 text-gray-600 max-w-[200px] truncate">
                    {order.items.map(i => `${i.qty}x ${i.name || "Item"}`).join(', ')}
                  </td>
                  <td className="py-3 font-bold">₹{order.totalAmount}</td>
                  <td className="py-3">
                    <span className={`px-2 py-1 rounded text-xs font-bold ${
                      order.status === 'completed' ? 'bg-gray-100 text-gray-600' : 'bg-red-50 text-red-500'
                    }`}>
                      {order.status.toUpperCase()}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {showMenuManager && <MenuManager onClose={() => setShowMenuManager(false)} />}
    </div>
  );
};

export default Dashboard;