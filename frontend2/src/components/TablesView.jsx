import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import apiClient from "../api/apiClient";
import toast from "react-hot-toast";
import { FiPlus, FiPrinter, FiDownload, FiTrash2, FiGrid } from "react-icons/fi";


const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

const TablesView = () => {
  const [tables, setTables] = useState([]);
  const [newTableNumber, setNewTableNumber] = useState("");
  const [qrCodeData, setQrCodeData] = useState(null);
  const [selectedTableId, setSelectedTableId] = useState(null);

  useEffect(() => {
    fetchTables();
  }, []);

  const fetchTables = async () => {
    try {
      const res = await apiClient.get('/tables');
      setTables(res.data);
    } catch (err) {
      toast.error("Failed to load tables");
    }
  };

  const handleAddTable = async (e) => {
    e.preventDefault();
    if (!newTableNumber) return;

    try {
      await apiClient.post('/tables', { tableNumber: newTableNumber });
      toast.success("Table added!");
      setNewTableNumber("");
      fetchTables();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to add table");
    }
  };

  const handleGenerateQR = async (tableId) => {
    try {
      setSelectedTableId(tableId);
      const res = await apiClient.get(`/tables/${tableId}/qr`);
      setQrCodeData(res.data);
    } catch (err) {
      toast.error("Failed to generate QR");
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-6"
    >
      {/* Header */}
      <motion.div variants={fadeUp} initial="hidden" animate="show">
        <h1 className="font-japanese text-5xl font-bold text-[var(--color-navy)] tracking-wide">
          Tables & QR Codes
        </h1>
        <p className="text-[var(--color-navy)]/60 mt-2 text-sm font-medium">
          Add tables and generate dynamic QR codes for ordering
        </p>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: Table List */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-[var(--color-navy)] rounded-2xl border border-white/5 shadow-lg p-6"
        >
          <h3 className="font-japanese text-3xl font-bold text-white tracking-wide mb-4">Your Tables</h3>

          <form onSubmit={handleAddTable} className="flex gap-2 mb-6">
            <input
              type="text"
              placeholder="Table Number (e.g. 1, VIP)"
              value={newTableNumber}
              onChange={(e) => setNewTableNumber(e.target.value)}
              className="flex-1 px-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:outline-none focus:border-[var(--color-accent)] focus:ring-2 focus:ring-[var(--color-accent)]/20 transition-all text-sm text-white placeholder-white/40"
            />
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.97 }}
              type="submit"
              className="px-5 py-3 bg-[var(--color-accent)] hover:bg-[var(--color-accent)]/90 text-white font-bold rounded-xl flex items-center gap-2 text-sm shadow-lg"
            >
              <FiPlus size={18} /> Add
            </motion.button>
          </form>

          <div className="space-y-2 max-h-[400px] overflow-y-auto">
            {tables.map((table, i) => (
              <motion.div
                key={table._id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                onClick={() => handleGenerateQR(table._id)}
                className={`flex items-center justify-between p-4 rounded-xl cursor-pointer transition-all duration-200 group ${
                  selectedTableId === table._id
                    ? "bg-[var(--color-accent)]/20 border-2 border-[var(--color-accent)]/50"
                    : "bg-white/5 border border-transparent hover:border-white/10 hover:bg-white/10"
                }`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm ${
                      selectedTableId === table._id
                        ? "bg-[var(--color-accent)] text-white"
                        : "bg-white/10 text-white border border-white/5 group-hover:border-white/20"
                    }`}
                  >
                    {table.tableNumber}
                  </div>
                  <div>
                    <h4 className="font-semibold text-white/90 text-sm">
                      Table {table.tableNumber}
                    </h4>
                    <p className="text-[11px] text-white/50">Click to view QR</p>
                  </div>
                </div>
                <FiGrid
                  size={18}
                  className={`transition-colors ${
                    selectedTableId === table._id
                      ? "text-[var(--color-accent)]"
                      : "text-white/30 group-hover:text-white/50"
                  }`}
                />
              </motion.div>
            ))}
            {tables.length === 0 && (
              <div className="text-center py-10 text-white/40">
                <FiGrid size={32} className="mx-auto mb-3 text-white/20" />
                <p className="text-sm">No tables added yet</p>
              </div>
            )}
          </div>
        </motion.div>

        {/* Right: QR Preview */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-[var(--color-navy)] rounded-2xl border border-white/5 shadow-lg p-6 flex flex-col items-center justify-center min-h-[400px]"
        >
          {qrCodeData ? (
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: "spring", stiffness: 200, damping: 20 }}
              className="text-center"
            >
              <h3 className="font-japanese text-3xl font-bold text-white tracking-wide mb-6">
                Scan to Order
              </h3>
              <div className="p-4 bg-white rounded-3xl shadow-xl border border-white/10 inline-block mb-6">
                <img
                  src={qrCodeData.qrDataUrl}
                  alt="QR Code"
                  className="w-56 h-56 rounded-2xl"
                />
              </div>
              <a
                href={qrCodeData.url}
                target="_blank"
                rel="noopener noreferrer"
                className="block text-xs text-blue-300 hover:text-blue-200 bg-blue-500/20 p-3 rounded-xl break-all max-w-[280px] mx-auto mb-6 font-mono hover:underline transition-colors"
                title="Click to open menu in new tab"
              >
                {qrCodeData.url}
              </a>
              <a
                href={qrCodeData.qrDataUrl}
                download="table-qr.png"
                className="inline-flex items-center gap-2 px-6 py-3 bg-[var(--color-accent)] hover:bg-[var(--color-accent)]/90 text-white font-bold rounded-xl transition-all text-sm shadow-lg"
              >
                <FiDownload /> Download QR
              </a>
            </motion.div>
          ) : (
            <div className="text-center text-white/30">
              <div className="w-24 h-24 bg-white/5 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <FiPrinter size={40} className="text-white/20" />
              </div>
              <p className="text-white/50 text-sm">
                Select a table to view its QR Code
              </p>
            </div>
          )}
        </motion.div>
      </div>
    </motion.div>
  );
};

export default TablesView;
