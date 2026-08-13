import React, { useState, useEffect } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { FiX, FiPlus, FiPrinter, FiDownload } from "react-icons/fi";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

const TableManager = ({ onClose }) => {
  const [tables, setTables] = useState([]);
  const [newTableNumber, setNewTableNumber] = useState("");
  const [qrCodeData, setQrCodeData] = useState(null);

  useEffect(() => {
    fetchTables();
  }, []);

  const fetchTables = async () => {
    try {
      const res = await axios.get(`${API_URL}/tables`);
      setTables(res.data);
    } catch (err) {
      toast.error("Failed to load tables");
    }
  };

  const handleAddTable = async (e) => {
    e.preventDefault();
    if (!newTableNumber) return;
    
    try {
      await axios.post(`${API_URL}/tables`, { tableNumber: newTableNumber });
      toast.success("Table added successfully");
      setNewTableNumber("");
      fetchTables();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to add table");
    }
  };

  const handleGenerateQR = async (tableId) => {
    try {
      const res = await axios.get(`${API_URL}/tables/${tableId}/qr`);
      setQrCodeData(res.data); // { qrDataUrl, url }
    } catch (err) {
      toast.error("Failed to generate QR Code");
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden shadow-2xl animate-scale-up">
        {/* Header */}
        <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Manage Tables & QR Codes</h2>
            <p className="text-gray-500 text-sm mt-1">Add tables and generate order QR codes</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 bg-gray-100 hover:bg-gray-200 rounded-full transition-colors"
          >
            <FiX size={24} className="text-gray-600" />
          </button>
        </div>

        {/* Content */}
        <div className="flex flex-1 overflow-hidden">
          {/* Left: Table List */}
          <div className="w-1/2 border-r border-gray-100 flex flex-col p-6 overflow-y-auto">
            <form onSubmit={handleAddTable} className="flex gap-2 mb-6">
              <input
                type="text"
                placeholder="Table Number (e.g. 1, T2, VIP-1)"
                value={newTableNumber}
                onChange={(e) => setNewTableNumber(e.target.value)}
                className="flex-1 px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-brand-500"
              />
              <button
                type="submit"
                className="px-4 py-2 bg-brand-900 text-white font-bold rounded-xl flex items-center gap-2 hover:bg-brand-800 transition-colors"
              >
                <FiPlus /> Add
              </button>
            </form>

            <div className="space-y-3">
              {tables.map((table) => (
                <div key={table._id} className="flex items-center justify-between p-4 border border-gray-100 rounded-xl hover:border-gray-300 transition-colors">
                  <div>
                    <h3 className="font-bold text-gray-800 text-lg">Table {table.tableNumber}</h3>
                  </div>
                  <button
                    onClick={() => handleGenerateQR(table._id)}
                    className="px-4 py-2 bg-blue-50 text-blue-600 font-bold rounded-lg hover:bg-blue-100 transition-colors"
                  >
                    View QR
                  </button>
                </div>
              ))}
              {tables.length === 0 && (
                <p className="text-gray-500 text-center py-8">No tables added yet.</p>
              )}
            </div>
          </div>

          {/* Right: QR Code Preview */}
          <div className="w-1/2 bg-gray-50 p-6 flex flex-col items-center justify-center">
            {qrCodeData ? (
              <div className="bg-white p-8 rounded-3xl shadow-xl flex flex-col items-center text-center">
                <h3 className="text-xl font-bold mb-6">Scan to Order</h3>
                <img src={qrCodeData.qrDataUrl} alt="QR Code" className="w-64 h-64 mb-6 border-4 border-gray-100 rounded-2xl" />
                <p className="text-sm text-gray-500 mb-6 bg-gray-50 p-3 rounded-lg break-all max-w-[250px]">
                  {qrCodeData.url}
                </p>
                <div className="flex gap-4">
                  <a
                    href={qrCodeData.qrDataUrl}
                    download="table-qr.png"
                    className="flex items-center gap-2 px-6 py-3 bg-brand-900 text-white font-bold rounded-xl hover:bg-brand-800 transition-colors"
                  >
                    <FiDownload /> Download
                  </a>
                </div>
              </div>
            ) : (
              <div className="text-gray-400 text-center flex flex-col items-center gap-4">
                <div className="w-24 h-24 bg-gray-200 rounded-2xl flex items-center justify-center opacity-50">
                  <FiPrinter size={40} />
                </div>
                <p>Select a table to view its QR Code</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TableManager;
