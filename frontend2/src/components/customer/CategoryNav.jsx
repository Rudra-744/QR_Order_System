import React, { useRef, useEffect } from 'react';
import { motion } from 'framer-motion';

// Custom Vector SVG Illustrations
const SvgAll = () => <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/></svg>;
const SvgNoodles = () => <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M7 10h10"/><path d="M4 14h16c0 4.418-3.582 8-8 8s-8-3.582-8-8z"/><path d="M9 10V4"/><path d="M15 10V4"/><path d="M12 10V4"/></svg>;
const SvgRice = () => <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 21a9 9 0 0 0 9-9H3a9 9 0 0 0 9 9Z"/><path d="M8 8c0-2.5 1.5-4 4-4s4 1.5 4 4"/><path d="M12 4v4"/></svg>;
const SvgDrink = () => <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 8h12l-1.5 13H7.5L6 8Z"/><path d="M8 3v5"/><path d="M16 3v5"/><path d="M12 3v5"/></svg>;
const SvgCake = () => <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 7v7"/><path d="M8 7v7"/><path d="M16 7v7"/><path d="M3 14h18v4a3 3 0 0 1-3 3H6a3 3 0 0 1-3-3v-4Z"/><path d="M3 14c0-2.5 4-4 9-4s9 1.5 9 4"/></svg>;
const SvgBurger = () => <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 14h16v3a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2v-3Z"/><path d="M4 10h16c0-3.314-3.582-6-8-6s-8 2.686-8 6Z"/><path d="M4 12h16"/></svg>;
const SvgDefault = () => <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 21a9 9 0 0 0 9-9H3a9 9 0 0 0 9 9Z"/><path d="M12 3v9"/><path d="M8 6v6"/><path d="M16 6v6"/></svg>;

const getCategoryIcon = (cat) => {
  const lower = cat.toLowerCase();
  if (lower.includes('all')) return SvgAll;
  if (lower.includes('noodle') || lower.includes('chowmein') || lower.includes('laphing')) return SvgNoodles;
  if (lower.includes('rice') || lower.includes('biryani')) return SvgRice;
  if (lower.includes('beverage') || lower.includes('drink') || lower.includes('shake') || lower.includes('coffee')) return SvgDrink;
  if (lower.includes('dessert') || lower.includes('cake') || lower.includes('sweet')) return SvgCake;
  if (lower.includes('burger') || lower.includes('pizza') || lower.includes('sandwich')) return SvgBurger;
  return SvgDefault;
};

const CategoryNav = ({ categories, activeCategory, onSelectCategory }) => {
  const scrollRef = useRef(null);

  useEffect(() => {
    if (scrollRef.current) {
      const activeEl = scrollRef.current.querySelector('[aria-selected="true"]');
      if (activeEl) {
        const container = scrollRef.current;
        const scrollLeft = activeEl.offsetLeft - (container.clientWidth / 2) + (activeEl.clientWidth / 2);
        container.scrollTo({ left: scrollLeft, behavior: 'smooth' });
      }
    }
  }, [activeCategory]);

  return (
    <div className="w-full relative z-30">
      {/* Deep Blue Icon Navigation */}
      <div className="bg-[#334877] text-white/70 overflow-x-auto no-scrollbar pt-2 pb-3 rounded-b-3xl shadow-md">
        <div 
          ref={scrollRef}
          className="flex min-w-max lg:min-w-full lg:justify-center px-6 py-2 gap-8 items-center"
        >
          {categories.map((cat) => {
            const Icon = getCategoryIcon(cat);
            const isActive = activeCategory === cat;
            return (
              <button 
                key={cat} 
                onClick={() => onSelectCategory(cat)}
                className={`flex flex-col items-center justify-center cursor-pointer transition-colors relative outline-none ${isActive ? 'text-white' : 'hover:text-white/90'}`}
                role="tab"
                aria-selected={isActive}
              >
                <div className="mb-2 transition-transform duration-300 transform active:scale-95">
                  <Icon />
                </div>
                <span className="text-[11px] font-bold tracking-wide whitespace-nowrap">{cat}</span>
                {isActive && (
                  <motion.div 
                    layoutId="mainNavIndicator" 
                    className="h-1 w-full bg-white mt-1.5 rounded-full absolute -bottom-3" 
                  />
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default CategoryNav;
