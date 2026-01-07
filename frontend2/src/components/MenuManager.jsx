import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { FiX, FiToggleLeft, FiToggleRight } from 'react-icons/fi';

const API_URL = 'http://localhost:5000/api';

const MenuManager = ({ onClose }) => {
  const [items, setItems] = useState([]);
  const [activeCategory, setActiveCategory] = useState('All');

  useEffect(() => {
    fetchMenu();
  }, []);

  const fetchMenu = async () => {
    try {
      const res = await axios.get(`${API_URL}/menu`);
      setItems(res.data);
    } catch (err) {
      console.error("Failed to fetch menu");
    }
  };

  const toggleItem = async (id, currentStatus) => {
    const newStatus = !currentStatus;
    setItems(prev => prev.map(i => i._id === id ? { ...i, isAvailable: newStatus } : i));
    try {
      await axios.put(`${API_URL}/menu/${id}/availability`, { isAvailable: newStatus });
    } catch (err) {
      alert("Failed to update status");
      fetchMenu();
    }
  };

  const categories = ["All", ...new Set(items.map(i => i.category))];

  const filteredItems = activeCategory === 'All' 
    ? items 
    : items.filter(i => i.category === activeCategory);

  // 👇 EMOJI HELPER FUNCTION 👇
  const getCategoryEmoji = (cat) => {
    const lowerCat = cat.toLowerCase();
    if (lowerCat.includes('all')) return '✨';
    if (lowerCat.includes('laphing')) return '🍜';
    if (lowerCat.includes('momos')) return '🥟';
    if (lowerCat.includes('noodles') || lowerCat.includes('chowmein')) return '🍝';
    if (lowerCat.includes('beverage') || lowerCat.includes('drink') || lowerCat.includes('shake')) return '🥤';
    if (lowerCat.includes('dessert') || lowerCat.includes('cake')) return '🍰';
    if (lowerCat.includes('sides') || lowerCat.includes('fries')) return '🍟';
    if (lowerCat.includes('pizza') || lowerCat.includes('burger')) return '🍕';
    return '🍴'; // Default
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60] flex justify-end">
      <div className="bg-white w-full max-w-md h-full shadow-2xl flex flex-col animate-slide-in">
        
        <div className="p-6 pb-2 flex justify-between items-center bg-white z-10">
          <h2 className="text-xl font-bold text-brand-900">Manage Stock</h2>
          <button onClick={onClose} className="p-2 bg-gray-100 rounded-full hover:bg-gray-200 transition-colors">
            <FiX size={20} />
          </button>
        </div>

        {/* 👇 UPDATED CATEGORY TABS 👇 */}
        <div className="px-6 py-2 overflow-x-auto no-scrollbar flex gap-2 border-b border-gray-100 mb-2">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`whitespace-nowrap px-4 py-2 rounded-full text-sm font-bold transition-all border flex items-center gap-2 ${
                activeCategory === cat 
                  ? 'bg-brand-500 text-white border-brand-500 shadow-md transform scale-105' 
                  : 'bg-white text-gray-600 border-gray-200 hover:bg-brand-50 hover:border-brand-200'
              }`}
            >
              <span>{getCategoryEmoji(cat)}</span>
              <span>{cat}</span>
            </button>
          ))}
        </div>

        <div className="flex-1 overflow-y-auto p-6 pt-2 space-y-4">
          {filteredItems.map(item => (
            <div 
              key={item._id} 
              className={`flex justify-between items-center p-4 border rounded-xl shadow-sm transition-all duration-300 
                ${item.isAvailable ? 'bg-white border-gray-100' : 'bg-red-50 border-red-100'}`}
            >
              <div>
                <h3 className={`font-bold ${item.isAvailable ? 'text-gray-800' : 'text-red-800'}`}>
                  {item.name}
                </h3>
                <p className={`text-[10px] font-bold uppercase tracking-wider mt-1 
                  ${item.isAvailable ? 'text-green-600' : 'text-red-500'}`}>
                  {item.isAvailable ? '● In Stock' : '● Sold Out'}
                </p>
              </div>
              
              <button 
                onClick={() => toggleItem(item._id, item.isAvailable)}
                className={`text-4xl transition-all active:scale-90 hover:opacity-80 
                  ${item.isAvailable ? 'text-green-500' : 'text-gray-400'}`}
              >
                {item.isAvailable ? <FiToggleRight /> : <FiToggleLeft />}
              </button>
            </div>
          ))}
        </div>

      </div>
    </div>
  );
};

export default MenuManager;