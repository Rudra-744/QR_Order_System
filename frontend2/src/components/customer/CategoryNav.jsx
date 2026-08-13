
import React from 'react';
import { motion } from 'framer-motion';
import { GiNoodles, GiBowlOfRice, GiSushis, GiHotSpices, GiCarrot } from 'react-icons/gi';

const mainNavItems = [
  { name: 'Noodles', icon: GiNoodles },
  { name: 'Rice', icon: GiBowlOfRice },
  { name: 'Soup', icon: GiHotSpices },
  { name: 'Salad', icon: GiCarrot },
  { name: 'Sushi', icon: GiSushis },
];

const CategoryNav = ({ categories, activeCategory, onSelectCategory }) => {
  return (
    <div className="flex flex-col w-full">
      {/* Deep Blue Icon Navigation */}
      <div className="bg-[var(--color-navy)] text-white/70 overflow-x-auto no-scrollbar">
        <div className="flex justify-between min-w-max px-4 py-3">
          {mainNavItems.map((item, index) => {
            const Icon = item.icon;
            const isActive = index === 2; // Hardcoding "Soup" as active for the theme look, or we can link it
            return (
              <div 
                key={item.name} 
                className={`flex flex-col items-center justify-center px-4 py-2 cursor-pointer transition-colors ${isActive ? 'text-white' : 'hover:text-white/90'}`}
              >
                <Icon size={26} className="mb-1" />
                <span className="text-xs font-medium tracking-wide">{item.name}</span>
                {isActive && (
                  <motion.div layoutId="mainNavIndicator" className="h-0.5 w-8 bg-white mt-2 rounded-full absolute bottom-3" />
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Secondary Text Navigation (Dynamic Categories) */}
      <div className="overflow-x-auto no-scrollbar pt-6 pb-2 px-4 bg-[var(--color-cream)]">
        <div className="flex gap-2 min-w-max items-center justify-center sm:justify-start">
          {categories.map((cat) => {
            const isActive = activeCategory === cat;
            return (
              <div 
                key={cat}
                onClick={() => onSelectCategory(cat)}
                className="relative cursor-pointer px-5 py-2.5 rounded-full"
              >
                {isActive && (
                  <motion.div 
                    layoutId="categoryIndicator" 
                    className="absolute inset-0 bg-white/60 backdrop-blur-md shadow-sm border border-white/80 rounded-full z-0" 
                  />
                )}
                <span className={`relative z-10 text-sm font-bold transition-colors ${isActive ? 'text-[var(--color-navy)]' : 'text-gray-400 hover:text-gray-600'}`}>
                  {cat}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default CategoryNav;
