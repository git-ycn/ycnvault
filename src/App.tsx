import React, { useState, useEffect, useContext, createContext, useCallback, memo, useRef, useMemo } from 'react';
import { 
  ArrowRight, Heart, X, Instagram, Facebook, MessageCircle, Mail, 
  Globe, Coins, Share2, ChevronLeft, ChevronRight, RotateCcw, 
  Sun, Moon, ShieldCheck, FileText, RefreshCw, BookOpen, Layers, Zap,
  Search, SlidersHorizontal, ChevronDown, Check
} from 'lucide-react';
import { motion, AnimatePresence, useMotionValue, useTransform, useScroll, useSpring, useMotionValueEvent, animate } from 'motion/react';
import ReactMarkdown from 'react-markdown';
import { DICT } from './translations';
import { PRODUCTS, RECIPES, CARD_DATA } from './data';
import { ARTICLES } from './articles';
import { LegalModal } from './components/LegalModal';
import { SearchModal } from './components/SearchModal';
import { Newsletter } from './components/Newsletter';

const LangContext = createContext<any>(null);
const CurrencyContext = createContext<any>(null);
const ThemeContext = createContext<any>(null);

const TikTokIcon = ({ className = "" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-5.2 1.74 2.89 2.89 0 012.31-4.64 2.93 2.93 0 01.88.13V9.4a6.84 6.84 0 00-1-.05A6.33 6.33 0 005 20.1a6.34 6.34 0 0010.86-4.43v-7a8.16 8.16 0 004.77 1.52v-3.4a4.85 4.85 0 01-1.04-.1z" />
  </svg>
);

const CURRENCIES: Record<string, { symbol: string, rate: number }> = {
  USD: { symbol: '$', rate: 1 },
  EUR: { symbol: '€', rate: 0.93 },
  MAD: { symbol: 'DH', rate: 10.1 }
};

const RevealText = memo(function RevealText({ text, className = "", delay = 0, once = false, isLogo = false, fast = false }: any) {
  const context = useContext(LangContext);
  const isRTL = context?.lang === 'ar';
  const words = text ? text.split(" ") : [];
  
  if (fast) {
    return (
      <motion.div
        key={text}
        initial="hidden"
        whileInView="visible"
        viewport={{ once, amount: 0.2 }}
        variants={{
          hidden: { opacity: 0, y: 15 },
          visible: { 
            opacity: 1, 
            y: 0, 
            transition: { 
              delay, 
              duration: 0.4, 
              ease: "easeOut" 
            } 
          }
        }}
        className={`${className} will-change-transform`}
        dir={isRTL ? 'rtl' : 'ltr'}
      >
        {text}
      </motion.div>
    );
  }

  return (
    <motion.div 
      key={text}
      initial="hidden" 
      whileInView="visible" 
      viewport={{ once, amount: 0.2 }}
      className={`flex flex-wrap justify-center ${className} will-change-transform`}
      dir={isRTL ? 'rtl' : 'ltr'}
    >
      {words.map((word: string, i: number) => (
        <motion.span
          key={i}
          variants={{
            hidden: { opacity: 0, y: 30 },
            visible: { 
              opacity: 1, 
              y: 0, 
              transition: { 
                delay: delay + (i * 0.08),
                duration: 0.8,
                ease: [0.33, 1, 0.68, 1]
              } 
            }
          }}
          className={`${isLogo ? '' : (isRTL ? 'ml-[0.25em]' : 'mr-[0.25em]')}`}
        >
          {word}
        </motion.span>
      ))}
    </motion.div>
  );
});

function useTranslation() {
  const context = useContext(LangContext);
  if (!context) throw new Error("useTranslation must be used within a LangProvider");
  const { lang, setLang } = context;
  const t = (key: string) => DICT[lang]?.[key] || DICT['en']?.[key] || key;
  const isRTL = lang === 'ar';
  return { lang, setLang, t, isRTL };
}

function useCurrency() {
  const context = useContext(CurrencyContext);
  if (!context) return { currency: 'USD', setCurrency: () => {}, formatPrice: (v: number) => v === 0 ? 'FREE' : `$${v.toFixed(2)}`, currencies: ['USD'] };
  const { currency, setCurrency } = context;
  const formatPrice = (usdAmount: number) => {
    if (usdAmount === 0) return 'FREE';
    const cur = CURRENCIES[currency] || CURRENCIES['USD'];
    const converted = usdAmount * cur.rate;
    if (currency === 'MAD') return `${converted.toFixed(2)} ${cur.symbol}`;
    return `${cur.symbol}${converted.toFixed(2)}`;
  };
  return { currency, setCurrency, formatPrice, currencies: Object.keys(CURRENCIES) };
}

function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) return { theme: 'light', toggleTheme: () => {} };
  return context;
}

// Optimized NavBar component with SaaS Styling, Search Trigger, and Theme Switcher
function NavBar({ cartCount, onOpenCart, onOpenSearch, isMenuOpen, setIsMenuOpen }: any) {
  const { scrollY } = useScroll();
  const [isScrolled, setIsScrolled] = useState(false);
  const { lang, setLang, t, isRTL } = useTranslation();
  const { currency, setCurrency, currencies } = useCurrency();
  const { theme, toggleTheme } = useTheme();
  const [showLangs, setShowLangs] = useState(false);
  const [showCurrencies, setShowCurrencies] = useState(false);
  const langRef = useRef<HTMLDivElement>(null);
  const curRef = useRef<HTMLDivElement>(null);

  useMotionValueEvent(scrollY, "change", (latest) => {
    setIsScrolled(latest > 50);
  });

  useEffect(() => {
    if (!showLangs && !showCurrencies) return;
    const handleGlobalClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest('.lang-toggle-btn')) setShowLangs(false);
      if (!target.closest('.cur-toggle-btn')) setShowCurrencies(false);
    };
    window.addEventListener('click', handleGlobalClick);
    return () => window.removeEventListener('click', handleGlobalClick);
  }, [showLangs, showCurrencies]);

  const navItemClass = isScrolled || isMenuOpen
    ? 'border-slate-300/90 dark:border-slate-800 bg-slate-100 dark:bg-slate-900/80 hover:bg-slate-200/90 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-100 shadow-xs'
    : 'border-white/20 bg-white/10 hover:bg-white/20 text-white';

  return (
    <nav 
      className={`fixed w-full top-0 z-[110] px-5 py-3.5 flex justify-between items-center transition-all duration-300 ease-out border-b ${
        isScrolled || isMenuOpen 
          ? 'bg-[#F8FAFC]/95 dark:bg-[#09090B]/95 backdrop-blur-md text-slate-900 dark:text-slate-100 border-slate-200/80 dark:border-slate-800/80 shadow-sm' 
          : 'bg-transparent text-white border-transparent'
      }`}
    >
      <div className="flex items-center gap-3">
        <button 
          onClick={() => setIsMenuOpen(!isMenuOpen)} 
          className={`font-medium text-xs tracking-wider uppercase px-3.5 py-1.5 rounded-lg border transition-all flex items-center gap-2 ${navItemClass}`}
        >
          <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse" />
          {isMenuOpen ? t('close') : t('menu')}
        </button>

        {/* Quick Search Button */}
        <button
          onClick={onOpenSearch}
          className={`hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg border transition-all text-xs font-medium ${navItemClass}`}
          title={t('search')}
        >
          <Search className={`w-3.5 h-3.5 ${isScrolled || isMenuOpen ? 'text-indigo-600 dark:text-indigo-400' : 'text-indigo-300'}`} />
          <span className={isScrolled || isMenuOpen ? 'text-slate-700 dark:text-slate-200' : 'text-white/90'}>{t('search')}...</span>
          <kbd className={`text-[10px] px-1.5 py-0.5 rounded font-mono ${
            isScrolled || isMenuOpen 
              ? 'bg-slate-200 text-slate-700 dark:bg-white/10 dark:text-slate-300' 
              : 'bg-black/30 text-white/80'
          }`}>
            ⌘K
          </kbd>
        </button>
      </div>

      <div className="flex items-center gap-2.5 md:gap-3.5">
        {/* Mobile Search Icon */}
        <button
          onClick={onOpenSearch}
          className={`sm:hidden p-2 rounded-xl border transition-all ${navItemClass}`}
          aria-label={t('search')}
        >
          <Search className="w-4 h-4" />
        </button>

        {/* Language selector */}
        <div className="relative" ref={langRef}>
          <button 
            onClick={(e) => { e.stopPropagation(); setShowLangs(!showLangs); setShowCurrencies(false); }} 
            className="lang-toggle-btn flex items-center gap-1.5 font-semibold text-xs tracking-wider uppercase px-2.5 py-1.5 rounded-lg hover:bg-black/5 dark:hover:bg-white/10 transition-colors"
          >
            <Globe className="w-3.5 h-3.5 opacity-80" /> {lang}
          </button>
          <AnimatePresence>
            {showLangs && (
              <motion.div 
                initial={{ opacity: 0, y: 8, scale: 0.95 }} 
                animate={{ opacity: 1, y: 0, scale: 1 }} 
                exit={{ opacity: 0, y: 8, scale: 0.95 }} 
                transition={{ duration: 0.15 }}
                className="absolute top-full left-1/2 -translate-x-1/2 pt-2 z-50"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="bg-white dark:bg-[#121215] text-slate-900 dark:text-slate-100 py-1.5 rounded-xl shadow-xl border border-slate-200 dark:border-slate-800 flex flex-col w-24 overflow-hidden">
                  {['en', 'fr', 'ar'].map(l => (
                    <button 
                      key={l} 
                      onClick={() => { setLang(l); setShowLangs(false); }} 
                      className={`text-xs tracking-widest uppercase py-2 text-center hover:bg-indigo-50 dark:hover:bg-indigo-950/40 transition-colors ${lang === l ? 'font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50/50 dark:bg-indigo-950/20' : 'text-slate-600 dark:text-slate-400'}`}
                    >
                      {l}
                    </button>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Currency selector */}
        <div className="relative" ref={curRef}>
          <button 
            onClick={(e) => { e.stopPropagation(); setShowCurrencies(!showCurrencies); setShowLangs(false); }} 
            className="cur-toggle-btn flex items-center gap-1.5 font-semibold text-xs tracking-wider uppercase px-2.5 py-1.5 rounded-lg hover:bg-black/5 dark:hover:bg-white/10 transition-colors"
          >
            <Coins className="w-3.5 h-3.5 opacity-80" /> {currency}
          </button>
          <AnimatePresence>
            {showCurrencies && (
              <motion.div 
                initial={{ opacity: 0, y: 8, scale: 0.95 }} 
                animate={{ opacity: 1, y: 0, scale: 1 }} 
                exit={{ opacity: 0, y: 8, scale: 0.95 }} 
                transition={{ duration: 0.15 }}
                className="absolute top-full left-1/2 -translate-x-1/2 pt-2 z-50"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="bg-white dark:bg-[#121215] text-slate-900 dark:text-slate-100 py-1.5 rounded-xl shadow-xl border border-slate-200 dark:border-slate-800 flex flex-col w-24 overflow-hidden">
                  {currencies.map(c => (
                    <button 
                      key={c} 
                      onClick={() => { setCurrency(c); setShowCurrencies(false); }} 
                      className={`text-xs tracking-widest uppercase py-2 text-center hover:bg-indigo-50 dark:hover:bg-indigo-950/40 transition-colors ${currency === c ? 'font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50/50 dark:bg-indigo-950/20' : 'text-slate-600 dark:text-slate-400'}`}
                    >
                      {c}
                    </button>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Theme Toggle Button */}
        <button
          onClick={toggleTheme}
          className={`p-2 rounded-xl border transition-all ${navItemClass}`}
          aria-label={theme === 'dark' ? t('themeLight') : t('themeDark')}
          title={theme === 'dark' ? t('themeLight') : t('themeDark')}
        >
          {theme === 'dark' ? (
            <Sun className="w-4 h-4 text-amber-400" />
          ) : (
            <Moon className="w-4 h-4 text-indigo-600" />
          )}
        </button>
      </div>
    </nav>
  );
}

type SortOptionKey = 'popular' | 'recent' | 'dev_code' | 'mobile_hacks';

interface SortOption {
  key: SortOptionKey;
  labelKey: string;
}

const SORT_OPTIONS: SortOption[] = [
  { key: 'popular', labelKey: 'sortPopular' },
  { key: 'recent', labelKey: 'sortRecent' },
  { key: 'dev_code', labelKey: 'sortDevCode' },
  { key: 'mobile_hacks', labelKey: 'sortMobileHacks' },
];

function CustomSortDropdown({
  selected,
  onSelect,
  t,
  isRTL,
}: {
  selected: SortOptionKey;
  onSelect: (key: SortOptionKey) => void;
  t: (key: string) => string;
  isRTL: boolean;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  const currentOption = SORT_OPTIONS.find((opt) => opt.key === selected) || SORT_OPTIONS[0];

  return (
    <div className="relative inline-block text-left" ref={dropdownRef}>
      {/* Dropdown Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        className="flex items-center justify-between gap-2.5 bg-white dark:bg-[#121215] text-slate-800 dark:text-slate-200 text-xs font-semibold py-2 px-3.5 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-indigo-400 dark:hover:border-indigo-500/60 focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-xs cursor-pointer transition-all duration-200 min-w-[200px]"
      >
        <span className="truncate">{t(currentOption.labelKey)}</span>
        <motion.div
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.2 }}
          className="shrink-0 text-slate-400 dark:text-slate-500"
        >
          <ChevronDown className="w-3.5 h-3.5" />
        </motion.div>
      </button>

      {/* Floating Menu Popover */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -6, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.96 }}
            transition={{ duration: 0.16, ease: [0.16, 1, 0.3, 1] }}
            className={`absolute top-full mt-2 ${isRTL ? 'left-0' : 'right-0'} z-50 w-64 bg-white dark:bg-[#16161b] border border-slate-200/90 dark:border-slate-800 rounded-2xl shadow-xl shadow-slate-900/10 dark:shadow-black/50 p-1.5 backdrop-blur-md origin-top`}
            role="listbox"
          >
            {SORT_OPTIONS.map((opt) => {
              const isSelected = opt.key === selected;
              return (
                <button
                  key={opt.key}
                  type="button"
                  role="option"
                  aria-selected={isSelected}
                  onClick={() => {
                    onSelect(opt.key);
                    setIsOpen(false);
                  }}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-medium transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-indigo-50 dark:bg-indigo-950/70 text-indigo-600 dark:text-indigo-400 font-semibold shadow-xs'
                      : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/70 hover:text-slate-900 dark:hover:text-white'
                  } ${isRTL ? 'text-right' : 'text-left'}`}
                >
                  <span className="truncate">{t(opt.labelKey)}</span>
                  {isSelected && (
                    <Check className={`w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400 shrink-0 ${isRTL ? 'mr-2' : 'ml-2'}`} />
                  )}
                </button>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function ShopSection({ onQuickAdd, onShopNow, onProductClick }: any) {
  const { t, isRTL } = useTranslation();
  const { formatPrice } = useCurrency();
  const [sortBy, setSortBy] = useState<SortOptionKey>('popular');

  const sortedProducts = useMemo(() => {
    if (sortBy === 'recent') {
      return [...PRODUCTS].reverse();
    }
    if (sortBy === 'dev_code') {
      return PRODUCTS.filter((p) => p.id === 'p2' || p.id === 'p3' || p.id === 'p4');
    }
    if (sortBy === 'mobile_hacks') {
      return PRODUCTS.filter((p) => p.id === 'p1');
    }
    // 'popular' default
    return [...PRODUCTS];
  }, [sortBy]);

  return (
    <div
      id="product-grid"
      className="w-full max-w-7xl mx-auto px-4 py-24 flex flex-col items-center z-40 relative"
    >
      <div className="text-center mb-12 max-w-2xl px-4">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200/60 dark:border-indigo-800/60 text-indigo-600 dark:text-indigo-400 text-xs font-semibold uppercase tracking-wider mb-4">
          <Zap className="w-3.5 h-3.5" />
          <span>Curated Hub</span>
        </div>
        <RevealText text={t('shopTitle')} className="font-serif text-4xl md:text-5xl text-slate-900 dark:text-white mb-4 tracking-tight" />
        <RevealText text={t('shopSub')} delay={0.2} className="font-sans text-slate-600 dark:text-slate-400 text-base md:text-lg leading-relaxed" />
      </div>

      {/* Sort Filter Bar */}
      <div className="w-full flex flex-col sm:flex-row items-center justify-between gap-4 mb-8 px-2" dir={isRTL ? 'rtl' : 'ltr'}>
        <div className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
          {sortedProducts.length} {t('categoryProducts')}
        </div>

        <div className="flex items-center gap-2.5">
          <span className="text-xs font-medium text-slate-600 dark:text-slate-400 flex items-center gap-1.5">
            <SlidersHorizontal className="w-3.5 h-3.5 text-indigo-500" />
            <span>{t('sortBy')}:</span>
          </span>
          <CustomSortDropdown
            selected={sortBy}
            onSelect={setSortBy}
            t={t}
            isRTL={isRTL}
          />
        </div>
      </div>

      <motion.div layout className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 w-full">
        <AnimatePresence mode="popLayout">
          {sortedProducts.map((p) => (
            <motion.div
              key={p.id}
              layout
              initial={{ opacity: 0, scale: 0.94 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.94 }}
              transition={{
                layout: { type: "spring", stiffness: 350, damping: 28 },
                opacity: { duration: 0.25 },
                scale: { duration: 0.25 }
              }}
              whileHover={{ y: -6 }}
              className="group relative bg-white dark:bg-[#121215] rounded-3xl p-5 cursor-pointer shadow-sm hover:shadow-xl dark:shadow-none dark:hover:border-indigo-500/50 border border-slate-200/80 dark:border-slate-800/80 transition-all duration-300 flex flex-col will-change-transform transform-gpu"
              onClick={(e: any) => {
                if (e.target.closest('button')) return;
                onProductClick(p);
              }}
            >
              <div className="w-full aspect-[4/5] bg-slate-100 dark:bg-slate-900 rounded-2xl mb-4 overflow-hidden relative transform-gpu">
                <img 
                  src={p.img} 
                  alt={t(p.title_key)} 
                  loading="lazy" 
                  decoding="async" 
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" 
                />
                {p.badge_key && (
                  <div className="absolute top-3 left-3 bg-indigo-600/95 dark:bg-indigo-500/95 text-white font-bold text-[10px] tracking-wider px-2.5 py-1 rounded-full uppercase shadow-md backdrop-blur-md">
                    {t(p.badge_key)}
                  </div>
                )}
                <div className="absolute top-3 right-3 bg-white/90 dark:bg-black/80 backdrop-blur-md px-2.5 py-1 rounded-full text-xs font-bold text-slate-800 dark:text-slate-200 border border-slate-200/50 dark:border-white/10">
                  {formatPrice(p.price)}
                </div>
              </div>
              <div className="flex flex-col items-center text-center flex-1">
                <h4 className="font-bold text-lg text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors leading-snug">
                  {t(p.title_key)}
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1.5 mb-5 leading-relaxed line-clamp-2">
                  {t(p.subtext_key || p.desc_key)}
                </p>
              </div>
              <div className="w-full mt-auto relative z-[60]">
                <motion.button 
                  whileTap={{ scale: 0.96 }} 
                  onClick={(e: any) => { e.stopPropagation(); onShopNow(p, 1); }} 
                  className="w-full py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm shadow-sm hover:shadow-md transition-all flex items-center justify-center gap-2"
                >
                  <span>{t('buyNow')}</span>
                </motion.button>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}

function CartDrawer({ isOpen, onClose, cart, updateQty, onCheckout }: any) {
  const { t } = useTranslation();
  const { formatPrice } = useCurrency();
  const total = cart.reduce((sum: number, item: any) => sum + item.price * item.qty, 0);
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[110]" onClick={onClose} />
          <motion.div initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }} transition={{ type: 'spring', damping: 26, stiffness: 220 }} className="fixed top-0 right-0 h-full w-full max-w-md bg-white dark:bg-[#121215] text-slate-900 dark:text-slate-100 z-[120] shadow-2xl border-l border-slate-200 dark:border-slate-800 flex flex-col">
            <div className="p-6 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center bg-slate-50/50 dark:bg-[#16161a]/60">
              <div className="flex items-center gap-2">
                <Layers className="w-5 h-5 text-indigo-500" />
                <h2 className="font-sans font-bold text-xl">{t('cartTitle')}</h2>
              </div>
              <button onClick={onClose} className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"><X className="w-5 h-5"/></button>
            </div>
            <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-4">
              {cart.map((item: any) => (
                <div key={item.id} className="flex gap-4 items-center p-3 rounded-2xl bg-slate-50 dark:bg-[#18181c] border border-slate-200/60 dark:border-slate-800/60">
                  <img src={item.img} className="w-16 h-16 object-cover rounded-xl" alt="" />
                  <div className="flex-1 min-w-0">
                    <h4 className="font-semibold text-sm text-slate-900 dark:text-white truncate">{t(item.id + '_title')}</h4>
                    <p className="text-xs text-indigo-600 dark:text-indigo-400 font-medium">{formatPrice(item.price)}</p>
                  </div>
                  <div className="flex items-center gap-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-full px-2.5 py-1">
                    <button onClick={() => updateQty(item.id, -1)} className="text-slate-400 hover:text-slate-800 dark:hover:text-white text-sm font-bold">-</button>
                    <span className="font-bold text-xs w-4 text-center">{item.qty}</span>
                    <button onClick={() => updateQty(item.id, 1)} className="text-slate-400 hover:text-slate-800 dark:hover:text-white text-sm font-bold">+</button>
                  </div>
                </div>
              ))}
              {cart.length === 0 && (
                <div className="flex flex-col items-center justify-center my-auto py-12 text-slate-400">
                  <Layers className="w-12 h-12 opacity-30 mb-3" />
                  <p className="text-sm font-medium">{t('cartEmpty')}</p>
                </div>
              )}
            </div>
            <div className="p-6 border-t border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-[#16161a]/80">
              <div className="flex justify-between mb-5 font-semibold text-base">
                <span className="text-slate-600 dark:text-slate-400">{t('cartTotal')}</span>
                <span className="text-slate-900 dark:text-white font-bold">{formatPrice(total)}</span>
              </div>
              <motion.button 
                whileTap={{ scale: 0.98 }} 
                onClick={onCheckout} 
                disabled={cart.length === 0} 
                className="w-full py-3.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold shadow-md hover:shadow-lg transition-all disabled:opacity-50"
              >
                {t('checkout')}
              </motion.button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

function ProductImageCarousel({ images, title }: { images: string[]; title: string }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const { isRTL } = useTranslation();
  const touchStartXRef = useRef<number | null>(null);

  const handleNext = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setCurrentIndex((prev) => (prev + 1) % images.length);
  };

  const handlePrev = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  const handleSelect = (idx: number, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setCurrentIndex(idx);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartXRef.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartXRef.current === null) return;
    const diff = e.changedTouches[0].clientX - touchStartXRef.current;
    if (Math.abs(diff) > 40) {
      if (diff > 0) {
        isRTL ? handleNext() : handlePrev();
      } else {
        isRTL ? handlePrev() : handleNext();
      }
    }
    touchStartXRef.current = null;
  };

  return (
    <div 
      className="w-full md:w-1/2 h-[45vh] md:h-full bg-slate-950 relative flex flex-col justify-between overflow-hidden select-none group"
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      <div className="relative w-full h-full overflow-hidden">
        {images.map((img, idx) => {
          const isActive = currentIndex === idx;
          return (
            <motion.div
              key={idx}
              initial={false}
              animate={{ 
                opacity: isActive ? 1 : 0,
                scale: isActive ? 1 : 1.04,
                zIndex: isActive ? 10 : 1
              }}
              transition={{ 
                duration: 0.55, 
                ease: [0.25, 1, 0.5, 1] 
              }}
              className="absolute inset-0 w-full h-full"
            >
              <img
                src={img}
                alt={`${title} - view ${idx + 1}`}
                className="w-full h-full object-cover"
                draggable={false}
              />
            </motion.div>
          );
        })}

        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20 pointer-events-none z-20" />

        <div className="absolute top-6 left-6 z-30 bg-black/60 backdrop-blur-md text-white/90 text-xs font-semibold px-3.5 py-1.5 rounded-full border border-white/15 flex items-center gap-1.5 shadow-md">
          <span>{currentIndex + 1}</span>
          <span className="text-white/40">/</span>
          <span>{images.length}</span>
        </div>

        {images.length > 1 && (
          <div className="absolute top-6 right-6 z-30 flex gap-2">
            {images.map((img, idx) => (
              <button
                key={idx}
                onClick={(e) => handleSelect(idx, e)}
                className={`w-11 h-11 rounded-xl overflow-hidden border-2 transition-all duration-300 shadow-md ${
                  currentIndex === idx
                    ? 'border-indigo-500 scale-105 ring-2 ring-indigo-500/40'
                    : 'border-white/40 opacity-70 hover:opacity-100 hover:scale-100'
                }`}
                aria-label={`Thumbnail ${idx + 1}`}
              >
                <img src={img} alt="" className="w-full h-full object-cover" />
              </button>
            ))}
          </div>
        )}

        {images.length > 1 && (
          <>
            <button
              onClick={isRTL ? handleNext : handlePrev}
              className="absolute left-4 top-1/2 -translate-y-1/2 z-30 w-10 h-10 rounded-full bg-white/90 hover:bg-white text-slate-900 flex items-center justify-center shadow-xl backdrop-blur-sm transition-all duration-200 opacity-90 group-hover:opacity-100 hover:scale-110 active:scale-95 cursor-pointer"
              aria-label="Previous image"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>

            <button
              onClick={isRTL ? handlePrev : handleNext}
              className="absolute right-4 top-1/2 -translate-y-1/2 z-30 w-10 h-10 rounded-full bg-white/90 hover:bg-white text-slate-900 flex items-center justify-center shadow-xl backdrop-blur-sm transition-all duration-200 opacity-90 group-hover:opacity-100 hover:scale-110 active:scale-95 cursor-pointer"
              aria-label="Next image"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </>
        )}

        {images.length > 1 && (
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-30 flex items-center gap-2 bg-black/60 backdrop-blur-md px-3.5 py-1.5 rounded-full border border-white/15 shadow-lg">
            {images.map((_, idx) => (
              <button
                key={idx}
                onClick={(e) => handleSelect(idx, e)}
                className={`transition-all duration-300 rounded-full ${
                  currentIndex === idx
                    ? 'w-6 h-2 bg-indigo-500'
                    : 'w-2 h-2 bg-white/50 hover:bg-white/90'
                }`}
                aria-label={`Switch to image ${idx + 1}`}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function ProductDetailModal({ product, onClose, onAddToCart, onBuyNow, onProductClick }: any) {
  const { t } = useTranslation();
  const { formatPrice } = useCurrency();
  const [qty, setQty] = useState(1);

  useEffect(() => {
    setQty(1);
  }, [product]);

  const productImages = product.images && product.images.length > 0 ? product.images : [product.img];

  return (
    <motion.div key="product-modal" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0, transition: { duration: 0.3 } }} className="fixed inset-0 z-[140] flex items-center justify-center p-4 md:p-8 bg-black/60 backdrop-blur-md" onClick={onClose}>
       <button onClick={onClose} className="fixed top-6 right-6 md:top-8 md:right-8 z-[150] bg-white/90 dark:bg-slate-900/90 text-slate-900 dark:text-white backdrop-blur-md p-3 rounded-full hover:bg-white transition-colors shadow-lg"><X className="w-5 h-5"/></button>
       <motion.div initial={{ scale: 0.95, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, y: 20, opacity: 0, transition: { duration: 0.3 } }} className="bg-[#F8FAFC] dark:bg-[#121215] text-slate-900 dark:text-slate-100 w-full max-w-6xl h-[92vh] rounded-3xl overflow-hidden flex flex-col relative shadow-2xl border border-slate-200/80 dark:border-slate-800" onClick={e => e.stopPropagation()}>
          <div className="flex flex-col md:flex-row h-full overflow-y-auto">
           <ProductImageCarousel images={productImages} title={t(product.title_key || product.id + '_title')} />
           <div className="w-full md:w-1/2 p-8 md:p-12 lg:p-16 flex flex-col justify-center">
              {product.badge_key && (
                <div className="inline-flex items-center gap-1.5 self-start px-3 py-1 rounded-full bg-indigo-600 dark:bg-indigo-500 text-white font-bold text-[10px] tracking-wider uppercase mb-3 shadow-sm">
                  {t(product.badge_key)}
                </div>
              )}
              <h2 className="font-serif text-3xl md:text-5xl text-slate-900 dark:text-white mb-2">{t(product.title_key || product.id + '_title')}</h2>
              {product.subtext_key && (
                <p className="text-sm font-semibold text-slate-600 dark:text-slate-300 mb-3">{t(product.subtext_key)}</p>
              )}
              <p className="text-xl font-semibold text-indigo-600 dark:text-indigo-400 mb-6">{formatPrice(product.price)}</p>
              
              <div className="flex flex-col gap-4 mb-8">
                {t(product.id + '_desc').split('|').map((part: string, idx: number) => {
                  if (idx === 0) return <p key={idx} className="text-lg font-medium text-slate-800 dark:text-slate-200 leading-relaxed">{part}</p>;
                  if (idx === 1) return (
                    <div key={idx} className="bg-indigo-50/60 dark:bg-indigo-950/30 border border-indigo-100 dark:border-indigo-900/50 p-4 rounded-2xl relative overflow-hidden">
                      <p className="text-[11px] font-bold text-indigo-600 dark:text-indigo-400 mb-1 tracking-wider uppercase flex items-center gap-2">
                        <span className="w-1.5 h-1.5 bg-indigo-500 rounded-full inline-block" />
                        {t('ingredientsLabel') || 'Details'}
                      </p>
                      <p className="text-slate-700 dark:text-slate-300 text-sm leading-relaxed">{part}</p>
                    </div>
                  );
                  if (idx === 2) return <p key={idx} className="text-base italic text-indigo-600 dark:text-indigo-400 font-serif leading-relaxed px-3 border-l-2 border-indigo-500 py-1">{part}</p>;
                  return <p key={idx} className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed">{part}</p>;
                })}
              </div>
              
              <div className="flex w-full mb-8">
                <motion.button whileTap={{ scale: 0.96 }} onClick={() => onBuyNow(product, 1)} className="w-full py-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold transition-all text-base shadow-md flex items-center justify-center gap-2">
                  <span>{t('buyNow')}</span>
                </motion.button>
              </div>
              <div>
                <h4 className="font-bold mb-3 uppercase tracking-wider text-xs text-slate-400">Other Directory Assets</h4>
                <div className="grid grid-cols-3 gap-3">
                   {PRODUCTS.filter(p => p.id !== product.id).slice(0,3).map(p => (
                     <div key={p.id} onClick={() => onProductClick(p)} className="cursor-pointer group">
                       <img src={p.img} alt="" loading="lazy" decoding="async" className="w-full aspect-square object-cover rounded-xl mb-1.5 group-hover:opacity-80 transition-opacity border border-slate-200 dark:border-slate-800" />
                       <p className="text-xs font-semibold truncate text-slate-800 dark:text-slate-200">{t(p.title_key)}</p>
                     </div>
                   ))}
                </div>
              </div>
           </div>
        </div>
     </motion.div>
  </motion.div>
  );
}

function CheckoutModal({ isOpen, onClose, cartTotal, cartInfo, cartItems }: any) {
  const { t, isRTL } = useTranslation();
  const { formatPrice } = useCurrency();
  const [isSuccess, setIsSuccess] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const encode = (data: any) => {
    return Object.keys(data)
      .map(key => encodeURIComponent(key) + "=" + encodeURIComponent(data[key]))
      .join("&");
  }

  const triggerDownloadForItems = (items: any[]) => {
    if (!items || items.length === 0) return;
    items.forEach((item: any) => {
      if (item.downloadUrl) {
        try {
          // Open in background/tab
          window.open(item.downloadUrl, '_blank');
          
          // Also trigger direct anchor download for maximum reliability
          const link = document.createElement('a');
          link.href = item.downloadUrl;
          link.target = '_blank';
          link.rel = 'noopener noreferrer';
          link.download = item.fileName || 'download';
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
        } catch (err) {
          console.error("Download trigger error:", err);
        }
      }
    });
  };

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      await fetch("/", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: encode({
          "form-name": "Tech_Downloads",
          Quantity: cartInfo || "1",
          TotalDue: cartTotal
        })
      });
    } catch (error) {
      console.error(error);
    } finally {
      setIsSubmitting(false);
      setIsSuccess(true);
      triggerDownloadForItems(cartItems);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div key="checkout-modal" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[160] flex items-center justify-center p-4 md:p-8 bg-black/60 backdrop-blur-md">
           <motion.div initial={{ scale: 0.95, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, y: 20 }} className="bg-white dark:bg-[#121215] text-slate-900 dark:text-slate-100 w-full max-w-4xl rounded-3xl overflow-hidden relative shadow-2xl flex flex-col md:flex-row max-h-[90vh] border border-slate-200 dark:border-slate-800">
              <button onClick={() => { setIsSuccess(false); onClose(isSuccess); }} className={`absolute top-6 ${isRTL ? 'left-6' : 'right-6'} text-slate-400 hover:text-slate-900 dark:hover:text-white z-50 bg-slate-100 dark:bg-slate-800 p-2 rounded-full`}><X className="w-5 h-5"/></button>
              
              {isSuccess ? (
              <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="flex flex-col items-center justify-center py-10 md:py-14 w-full px-6 overflow-y-auto">
                <div className="w-20 h-20 bg-emerald-50 dark:bg-emerald-950/50 rounded-full flex items-center justify-center mb-6 relative border border-emerald-200 dark:border-emerald-800">
                  <Check className="w-10 h-10 text-emerald-600 dark:text-emerald-400" />
                </div>
                <h2 className="font-serif text-3xl md:text-4xl mb-2 text-slate-900 dark:text-white text-center">{t('orderSecured')}</h2>
                <p className="text-slate-500 dark:text-slate-400 text-sm text-center max-w-md mb-6">{t('orderWay')}</p>
                
                {cartItems && cartItems.length > 0 && (
                  <div className="w-full max-w-md space-y-3 mb-6">
                    <p className="text-xs font-bold uppercase tracking-wider text-slate-400 text-center">Ready Resource Downloads</p>
                    {cartItems.map((item: any, idx: number) => (
                      <a
                        key={item.id || idx}
                        href={item.downloadUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        download={item.fileName}
                        className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-50 dark:bg-[#16161b] hover:bg-indigo-50 dark:hover:bg-indigo-950/40 border border-slate-200 dark:border-slate-800 hover:border-indigo-400 dark:hover:border-indigo-600 transition-all group"
                      >
                        <div className="flex items-center gap-3 min-w-0 pr-2">
                          <FileText className="w-5 h-5 text-indigo-500 shrink-0" />
                          <div className="truncate text-left">
                            <p className="text-sm font-bold text-slate-900 dark:text-white truncate group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                              {t(item.title_key || item.id + '_title')}
                            </p>
                            <p className="text-[11px] text-slate-400 truncate">{item.fileName || 'Resource File'}</p>
                          </div>
                        </div>
                        <span className="text-xs font-semibold px-3 py-1.5 rounded-xl bg-indigo-600 text-white flex items-center gap-1.5 shrink-0 group-hover:bg-indigo-700 shadow-sm">
                          Download
                        </span>
                      </a>
                    ))}
                  </div>
                )}

                <button
                  onClick={() => { setIsSuccess(false); onClose(true); }}
                  className="px-6 py-2.5 rounded-xl bg-slate-200/80 dark:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs font-bold uppercase tracking-wider hover:bg-slate-300 dark:hover:bg-slate-700 transition-colors"
                >
                  Done
                </button>
              </motion.div>
            ) : (
              <>
                <div className="w-full md:w-[40%] bg-slate-50 dark:bg-[#16161a] p-8 md:p-10 flex flex-col justify-between border-b md:border-b-0 md:border-r border-slate-200 dark:border-slate-800">
                  <div>
                    <h3 className="font-sans font-bold text-xl mb-6">{t('orderSummary')}</h3>
                    <div className="flex justify-between items-center mb-3 text-sm text-slate-600 dark:text-slate-400">
                      <span>{t('subtotal')}</span>
                      <span>{formatPrice(cartTotal)}</span>
                    </div>
                    <div className="flex justify-between items-center mb-3 text-sm text-slate-600 dark:text-slate-400">
                      <span>{t('shipping')}</span>
                      <span className="text-emerald-600 dark:text-emerald-400 font-medium">{t('free')}</span>
                    </div>
                    <div className="flex justify-between items-center mt-6 pt-4 border-t border-slate-200 dark:border-slate-700">
                      <span className="font-medium">{t('totalDue')}</span>
                      <span className="font-bold text-2xl text-indigo-600 dark:text-indigo-400">{formatPrice(cartTotal)}</span>
                    </div>
                  </div>
                  
                  <div className="mt-8 space-y-3 hidden md:block">
                    <div className="flex items-center gap-2.5 text-xs text-slate-500 dark:text-slate-400">
                      <ShieldCheck className="w-4 h-4 text-emerald-500" />
                      {t('secureNote')}
                    </div>
                  </div>
                </div>

                <div className="w-full md:w-[60%] p-8 md:p-10 flex flex-col justify-center">
                  <form name="Tech_Downloads" data-netlify="true" onSubmit={handleSubmit} className="flex flex-col gap-4">
                    <input type="hidden" name="form-name" value="Tech_Downloads" />
                    <input type="hidden" name="Quantity" value={cartInfo || "1"} />
                    <input type="hidden" name="TotalDue" value={cartTotal} />

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">{t('checkoutName')}</label>
                      <input required type="text" placeholder={t('checkoutNamePlaceholder')} className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">{t('checkoutAdd')}</label>
                      <input required type="email" placeholder={t('checkoutAddPlaceholder')} className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                    </div>
                    
                    <motion.button disabled={isSubmitting} whileTap={{ scale: 0.98 }} type="submit" className="w-full py-4 mt-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-base shadow-md transition-all flex items-center justify-center gap-2 uppercase disabled:opacity-70">
                      {isSubmitting ? (t('sending') || 'Processing...') : t('checkoutComplete')}
                      {!isSubmitting && <ArrowRight className={`w-4 h-4 transition-transform ${isRTL ? 'rotate-180' : ''}`} />}
                    </motion.button>
                    <p className="text-center text-[11px] text-slate-400 mt-1">{t('checkoutTerms')}</p>
                  </form>
                </div>
              </>
            )}
         </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

const SwipeCard = memo(({ card, index, isTop, onSwipe }: any) => {
  const { t, isRTL } = useTranslation();
  const x = useMotionValue(0);
  const rotate = useTransform(x, [-200, 200], [-18, 18]);
  
  const likeOpacity = useTransform(x, [20, 90], [0, 1]);
  const nopeOpacity = useTransform(x, [-20, -90], [0, 1]);
  const likeScale = useTransform(x, [20, 90], [0.8, 1.15]);
  const nopeScale = useTransform(x, [-20, -90], [0.8, 1.15]);

  const greenOverlay = useTransform(x, [0, 150], [0, 0.35]);
  const redOverlay = useTransform(x, [0, -150], [0, 0.35]);

  const isSwipingRef = useRef(false);

  const triggerSwipe = useCallback((dir: 'left' | 'right') => {
    if (isSwipingRef.current) return;
    isSwipingRef.current = true;
    const targetX = dir === 'right' ? 700 : -700;
    animate(x, targetX, { duration: 0.28, ease: "easeOut" }).then(() => {
      onSwipe(card.uid, dir);
    });
  }, [card.uid, onSwipe, x]);

  const handleDragEnd = useCallback((_: any, info: any) => {
    const threshold = 70;
    const velocityThreshold = 200;
    if (info.offset.x > threshold || info.velocity.x > velocityThreshold) {
      triggerSwipe('right');
    } else if (info.offset.x < -threshold || info.velocity.x < -velocityThreshold) {
      triggerSwipe('left');
    } else {
      animate(x, 0, { type: "spring", stiffness: 450, damping: 28 });
    }
  }, [triggerSwipe, x]);

  return (
    <motion.div
      className={`absolute w-full max-w-[340px] h-[520px] bg-white dark:bg-[#16161b] rounded-3xl shadow-xl dark:shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden origin-bottom select-none ${
        isTop ? 'cursor-grab active:cursor-grabbing' : 'pointer-events-none'
      }`}
      style={{ 
        x, 
        rotate, 
        zIndex: index + 10,
        touchAction: 'none'
      }}
      drag={isTop ? "x" : false}
      dragConstraints={{ left: 0, right: 0 }}
      dragElastic={0.9}
      dragMomentum={false}
      onDragEnd={handleDragEnd}
      initial={{ scale: 0.8, opacity: 0, y: 50 }}
      animate={{ 
        scale: isTop ? 1 : Math.max(0.86, 0.96 - (4 - index) * 0.04), 
        opacity: 1, 
        y: isTop ? 0 : (4 - index) * 12 
      }}
      exit={{ opacity: 0, scale: 0.88, transition: { duration: 0.2 } }}
      transition={{ type: "spring", stiffness: 320, damping: 26 }}
    >
      <motion.div style={{ opacity: greenOverlay }} className="absolute inset-0 bg-emerald-500 z-10 pointer-events-none" />
      <motion.div style={{ opacity: redOverlay }} className="absolute inset-0 bg-rose-500 z-10 pointer-events-none" />

      <motion.div style={{ opacity: likeOpacity, scale: likeScale }} className="absolute top-12 left-6 z-20 border-[4px] border-emerald-500 text-emerald-500 font-black text-3xl px-3 py-1.5 rounded-xl rotate-[-12deg] tracking-widest pointer-events-none bg-white/95 dark:bg-slate-900/95 shadow-xl">{t('swipeCheck')}</motion.div>
      <motion.div style={{ opacity: nopeOpacity, scale: nopeScale }} className="absolute top-12 right-6 z-20 border-[4px] border-rose-500 text-rose-500 font-black text-3xl px-3 py-1.5 rounded-xl rotate-[12deg] tracking-widest pointer-events-none bg-white/95 dark:bg-slate-900/95 shadow-xl">{t('swipeReject')}</motion.div>

      <div className="h-[70%] w-full relative bg-slate-100 dark:bg-slate-900 pointer-events-none">
        <img src={card.img} alt={t(card.title_key)} loading="lazy" className="w-full h-full object-cover select-none" draggable={false} />
        <div className="absolute inset-0 bg-gradient-to-b from-black/5 to-transparent pointer-events-none"></div>
      </div>
      
      <div className="h-[30%] w-full p-6 flex flex-col justify-center relative bg-white dark:bg-[#16161b]" dir={isRTL ? 'rtl' : 'ltr'}>
        {isTop && (
          <div className="absolute top-0 left-0 right-0 p-6 pointer-events-none w-full flex justify-between z-50">
            <motion.button 
              whileHover={{ scale: 1.12 }}
              whileTap={{ scale: 0.9, rotate: -15 }}
              onClick={(e) => { e.stopPropagation(); triggerSwipe('left'); }}
              className="absolute -top-7 left-6 w-14 h-14 bg-white dark:bg-slate-900 rounded-full shadow-lg border border-slate-100 dark:border-slate-800 flex items-center justify-center text-rose-500 hover:shadow-rose-500/20 transition-all pointer-events-auto cursor-pointer"
              aria-label="Skip"
            >
              <X className="w-7 h-7" strokeWidth={2.5} />
            </motion.button>
            <motion.button 
              whileHover={{ scale: 1.12 }}
              whileTap={{ scale: 0.9, rotate: 15 }}
              onClick={(e) => { e.stopPropagation(); triggerSwipe('right'); }}
              className="absolute -top-7 right-6 w-14 h-14 bg-white dark:bg-slate-900 rounded-full shadow-lg border border-slate-100 dark:border-slate-800 flex items-center justify-center text-emerald-500 hover:shadow-emerald-500/20 transition-all pointer-events-auto cursor-pointer"
              aria-label="Keep"
            >
              <Heart className="w-7 h-7 fill-current" />
            </motion.button>
          </div>
        )}
        <h3 className="font-sans font-bold text-xl text-slate-900 dark:text-white mb-1 leading-tight select-none pointer-events-none">{t(card.title_key)}</h3>
      </div>
    </motion.div>
  );
});

function SwipeSection({ onSwipeComplete, onQuickAdd, onShopNow, onProductClick }: any) {
  const { t } = useTranslation();
  const { formatPrice } = useCurrency();
  const [cards, setCards] = useState(() => CARD_DATA.map(c => ({ ...c, uid: `${c.id}-${Date.now()}` })));
  const [showProducts, setShowProducts] = useState(false);

  const handleSwipe = useCallback((uid: string, dir: 'left' | 'right') => {
    setCards(prev => {
      const remaining = prev.filter(c => c.uid !== uid);
      if (remaining.length === 0) {
        setTimeout(() => setShowProducts(true), 350);
        if (onSwipeComplete) onSwipeComplete();
      }
      return remaining;
    });
  }, [onSwipeComplete]);

  const handleResetDeck = useCallback(() => {
    setCards(CARD_DATA.map(c => ({ ...c, uid: `${c.id}-${Date.now()}` })));
    setShowProducts(false);
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (cards.length === 0) return;
      const topCard = cards[cards.length - 1];
      if (!topCard) return;
      if (e.key === 'ArrowRight') {
        handleSwipe(topCard.uid, 'right');
      } else if (e.key === 'ArrowLeft') {
        handleSwipe(topCard.uid, 'left');
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [cards, handleSwipe]);

  return (
    <section id="swipe-section" className="relative w-full min-h-[85vh] py-16 md:py-24 flex flex-col items-center justify-center border-t border-slate-200/60 dark:border-slate-800/60 z-30 overflow-visible">
      {!showProducts && (
        <div className="text-center mb-12 z-10 px-6">
          <RevealText text={t('swipeTitle')} className="font-serif text-4xl md:text-5xl text-slate-900 dark:text-white mb-3" />
          <RevealText text={t('swipeSub')} delay={0.3} className="font-sans text-slate-500 dark:text-slate-400 uppercase tracking-widest text-xs font-semibold" />
        </div>
      )}

      <div className="relative w-full flex flex-col items-center justify-center h-auto min-h-[520px] overflow-visible" dir="ltr">
        <AnimatePresence mode="wait">
          {!showProducts ? (
            <motion.div 
              key="swipe-deck-container"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="relative w-full max-w-[340px] h-[520px] flex justify-center items-center" 
              dir="ltr"
            >
              {cards.map((card, index) => (
                <SwipeCard 
                  key={card.uid} 
                  card={card} 
                  index={index} 
                  isTop={index === cards.length - 1} 
                  onSwipe={handleSwipe}
                />
              ))}
            </motion.div>
          ) : (
            <motion.div 
              key="completion-products-view"
              initial={{ opacity: 0, y: 25 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.5, ease: "easeOut" }}
              className="relative w-full h-auto min-h-[520px] flex flex-col items-center justify-center z-40 bg-transparent px-4 py-4 md:py-6 overflow-visible"
            >
              {/* 1. Subtext and Swipe Again button on top of the products */}
              <div className="text-center mb-6 max-w-lg px-4 flex flex-col items-center">
                <p className="text-xs md:text-sm font-medium text-slate-600 dark:text-slate-300 leading-relaxed mb-3">
                  {t('wantMoreSub')}
                </p>
                <button 
                  onClick={handleResetDeck}
                  className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-colors bg-slate-200/80 dark:bg-slate-800/90 hover:bg-slate-300 dark:hover:bg-slate-700 px-4 py-2 rounded-full cursor-pointer shadow-xs"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>{t('swipeAgain')}</span>
                </button>
              </div>

              {/* 2. Two Recommended Product Cards */}
              <div className="grid grid-cols-2 gap-3.5 md:gap-6 w-full max-w-2xl px-2 mx-auto mb-2">
                {PRODUCTS.slice(0, 2).map(p => (
                  <div key={p.id} className="bg-white dark:bg-[#121215] p-3.5 md:p-5 rounded-3xl shadow-sm border border-slate-200 dark:border-slate-800 text-center group cursor-pointer hover:shadow-xl transition-all relative flex flex-col h-full overflow-hidden will-change-transform transform-gpu" onClick={(e: any) => {
                    if (e.target.closest('button')) return;
                    onProductClick(p);
                  }}>
                    <div className="w-full aspect-square bg-slate-100 dark:bg-slate-900 rounded-2xl mb-3 overflow-hidden relative">
                      <img src={p.img} alt={t(p.title_key)} loading="lazy" decoding="async" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                      {p.badge_key && (
                        <div className="absolute top-2 left-2 bg-indigo-600/95 dark:bg-indigo-500/95 text-white font-bold text-[9px] tracking-wider px-2 py-0.5 rounded-full uppercase shadow-md">
                          {t(p.badge_key)}
                        </div>
                      )}
                    </div>
                    <div className="flex-1 flex flex-col items-center">
                      <h4 className="font-bold text-sm md:text-base text-slate-900 dark:text-white line-clamp-1">{t(p.title_key)}</h4>
                      <p className="text-[11px] md:text-xs text-slate-400 mt-1 mb-3.5 line-clamp-1">{t(p.subtext_key || p.desc_key)}</p>
                      <div className="mt-auto w-full">
                        <motion.button 
                          whileTap={{ scale: 0.95 }} 
                          onClick={(e: any) => { e.stopPropagation(); onShopNow(p, 1); }} 
                          className="w-full py-2.5 md:py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs transition-colors cursor-pointer shadow-xs"
                        >
                          {t('buyNow')}
                        </motion.button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* 3. "Want more?" section under the product cards */}
              <div className="text-center mt-8 md:mt-10 mb-6 max-w-lg px-4 pt-2">
                <RevealText 
                  text={t('wantMoreTitle')} 
                  className="font-serif text-3xl md:text-5xl font-bold text-slate-900 dark:text-white text-center px-4 mb-2 tracking-tight leading-tight" 
                />
              </div>

              {/* 3. Indicator line instructing to swipe up / scroll down */}
              <a
                href="#shop"
                onClick={(e) => {
                  e.preventDefault();
                  document.getElementById('shop')?.scrollIntoView({ behavior: 'smooth' });
                }}
                className="flex flex-col items-center gap-2 group cursor-pointer text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors mt-2 mb-2"
              >
                <span className="text-[10px] md:text-xs font-bold uppercase tracking-widest text-slate-400 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                  {t('swipeUpMore')}
                </span>
                <div className="flex flex-col items-center gap-0.5">
                  <div className="w-[2px] h-8 bg-gradient-to-b from-indigo-500 via-indigo-400 to-transparent rounded-full animate-pulse" />
                  <ChevronDown className="w-4 h-4 text-indigo-500 animate-bounce" />
                </div>
              </a>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
}

function MenuOverlay({ isOpen, onClose, onProductClick, onRecipesClick, onArticlesClick }: any) {
  const { t, isRTL } = useTranslation();
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
           initial={{ y: '-100%' }}
           animate={{ y: 0 }}
           exit={{ y: '-100%' }}
           transition={{ duration: 0.4, ease: [0.33, 1, 0.68, 1] }}
           className="fixed inset-0 bg-[#F8FAFC] dark:bg-[#09090B] text-slate-900 dark:text-slate-100 z-[90] flex flex-col pt-28 px-6 md:px-12 overflow-y-auto"
        >
           <div className="w-full max-w-2xl mx-auto flex flex-col pt-6 md:pt-10 min-h-full pb-12">
             <motion.h2 
               initial={{ opacity: 0, y: 20 }}
               animate={{ opacity: 1, y: 0 }}
               transition={{ delay: 0.15 }}
               className="text-4xl md:text-6xl font-serif text-slate-900 dark:text-white mb-8 cursor-pointer hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
               onClick={() => {
                 onClose();
                 setTimeout(() => {
                   document.getElementById('product-grid')?.scrollIntoView({ behavior: 'smooth' });
                 }, 100);
               }}
             >
               {t('menuShop')}
             </motion.h2>
             
             <div className="flex flex-col gap-4 ml-4 md:ml-6 mb-12">
               {PRODUCTS.map((p, i) => (
                 <motion.div
                   key={p.id}
                   initial={{ opacity: 0, y: 15 }}
                   animate={{ opacity: 1, y: 0 }}
                   transition={{ delay: 0.2 + i * 0.08 }}
                   onClick={() => { onClose(); onProductClick(p); }}
                   className="flex items-center justify-between group cursor-pointer border-b border-slate-200/60 dark:border-slate-800/60 pb-3"
                 >
                   <div className="flex items-center gap-4">
                     <img src={p.img} alt="" className="w-12 h-12 md:w-16 md:h-16 rounded-xl object-cover shadow-sm group-hover:scale-105 transition-transform" />
                     <span className="text-base md:text-xl font-medium tracking-wide group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">{t(p.title_key)}</span>
                   </div>
                   <ArrowRight className={`text-indigo-500 opacity-0 group-hover:opacity-100 transition-all w-5 h-5 ${isRTL ? 'rotate-180' : ''}`} />
                 </motion.div>
               ))}
             </div>

             <motion.h2 
               initial={{ opacity: 0, y: 20 }}
               animate={{ opacity: 1, y: 0 }}
               transition={{ delay: 0.4 }}
               onClick={() => { onClose(); onRecipesClick(); }}
               className="text-4xl md:text-6xl font-serif text-slate-900 dark:text-white mb-6 cursor-pointer hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
             >
               {t('menuRecipes')}
             </motion.h2>

             <motion.h2 
               initial={{ opacity: 0, y: 20 }}
               animate={{ opacity: 1, y: 0 }}
               transition={{ delay: 0.45 }}
               onClick={() => { onClose(); onArticlesClick(); }}
               className="text-4xl md:text-6xl font-serif text-slate-900 dark:text-white mb-12 cursor-pointer hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
             >
               {t('menuArticles')}
             </motion.h2>

             <motion.div 
               initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }} 
               className="mt-auto pt-6 flex items-center justify-center gap-6 text-slate-500 dark:text-slate-400"
             >
               <a href="#" target="_blank" rel="noopener noreferrer" className="hover:text-indigo-500 transition-all"><TikTokIcon className="w-5 h-5" /></a>
               <a href="#" target="_blank" rel="noopener noreferrer" className="hover:text-indigo-500 transition-all"><Instagram className="w-5 h-5" /></a>
               <a href="#" target="_blank" rel="noopener noreferrer" className="hover:text-indigo-500 transition-all"><Facebook className="w-5 h-5" /></a>
               <a href="#" target="_blank" rel="noopener noreferrer" className="hover:text-indigo-500 transition-all"><MessageCircle className="w-5 h-5" /></a>
               <a href="mailto:hello@techhub.com" className="hover:text-indigo-500 transition-all"><Mail className="w-5 h-5" /></a>
             </motion.div>
           </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function RecipeHero({ onOpenRecipes }: any) {
  const { t, isRTL } = useTranslation();
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"]
  });
  const y = useTransform(scrollYProgress, [0, 1], ["-8%", "8%"]);

  return (
    <section id="guides" ref={ref} className="w-full max-w-7xl mx-auto px-4 pb-24 z-30 relative">
      <motion.div 
        initial={{ opacity: 0, scale: 0.96 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8, ease: [0.33, 1, 0.68, 1] }}
        className="relative w-full aspect-[4/3] md:aspect-[21/9] rounded-3xl md:rounded-[2.5rem] overflow-hidden group cursor-pointer border border-slate-200/80 dark:border-slate-800 shadow-xl" 
        onClick={onOpenRecipes}
      >
        <motion.img 
          style={{ y, scale: 1.15 }}
          src="https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&q=80&w=2000" 
          className="absolute inset-0 w-full h-full object-cover" 
          alt="Integration Guides" 
          loading="lazy"
        />
        <div className="absolute inset-0 bg-slate-950/65 transition-colors duration-500 group-hover:bg-slate-950/75"></div>
        
        <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 border border-indigo-400/30 text-indigo-300 text-xs font-semibold uppercase tracking-wider mb-4">
            <BookOpen className="w-3.5 h-3.5" />
            <span>Practical Knowledge</span>
          </div>
          <RevealText text={t('recHero1')} className="font-serif text-3xl md:text-5xl text-white mb-3 tracking-tight drop-shadow-md" />
          <RevealText text={t('recHero2')} delay={0.2} fast={true} className="font-sans text-slate-300 text-base md:text-lg max-w-md mb-6" />
          
          <motion.button 
            whileTap={{ scale: 0.95 }}
            className="bg-indigo-600 hover:bg-indigo-500 transition-all text-white font-semibold text-base py-3.5 px-8 rounded-full flex items-center justify-center gap-2.5 shadow-lg shadow-indigo-600/30"
            onClick={(e: any) => { e.stopPropagation(); onOpenRecipes(); }}
          >
            <span>{t('recBtn')}</span>
            <ArrowRight className={`w-4 h-4 ${isRTL ? 'rotate-180' : ''}`} />
          </motion.button>
        </div>
      </motion.div>
    </section>
  );
}

function RecipeListModal({ isOpen, onClose, onSelectRecipe }: any) {
  const { t } = useTranslation();
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div 
          initial={{ y: '100%' }} 
          animate={{ y: 0 }} 
          exit={{ y: '100%' }} 
          transition={{ duration: 0.45, ease: [0.33, 1, 0.68, 1] }} 
          className="fixed inset-0 bg-[#F8FAFC] dark:bg-[#09090B] text-slate-900 dark:text-slate-100 z-[120] flex flex-col overflow-y-auto w-full"
        >
          <button onClick={onClose} className="fixed top-6 right-6 z-[130] bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-md hover:bg-slate-100 dark:hover:bg-slate-800 p-3 rounded-full transition-colors border border-slate-200 dark:border-slate-800">
            <X className="w-5 h-5"/>
          </button>
          
          <div className="pt-28 px-6 md:px-12 w-full max-w-7xl mx-auto flex flex-col pb-24">
            <RevealText text={t('recList')} className="font-serif text-4xl md:text-6xl mb-10 text-slate-900 dark:text-white !justify-start" once={true} />
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {RECIPES.map((recipe, i) => (
                <motion.div
                  key={recipe.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.08 + 0.2 }}
                  className="group cursor-pointer flex flex-col bg-white dark:bg-[#121215] rounded-3xl p-5 shadow-sm hover:shadow-xl transition-all border border-slate-200/80 dark:border-slate-800/80 hover:-translate-y-1"
                  onClick={() => onSelectRecipe(recipe)}
                >
                  <div className="w-full aspect-[4/3] bg-slate-100 dark:bg-slate-900 rounded-2xl mb-4 overflow-hidden relative">
                     <img src={recipe.img} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" alt={t(recipe.title_key)} loading="lazy" />
                  </div>
                  <h3 className="font-bold text-xl mb-1.5 text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">{t(recipe.title_key)}</h3>
                  <p className="text-slate-500 dark:text-slate-400 font-sans text-sm leading-relaxed">{t(recipe.desc_key)}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function ArticlesListModal({ isOpen, onClose, onSelectArticle }: any) {
  const { t } = useTranslation();
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div 
          initial={{ y: '100%' }} 
          animate={{ y: 0 }} 
          exit={{ y: '100%' }} 
          transition={{ duration: 0.45, ease: [0.33, 1, 0.68, 1] }} 
          className="fixed inset-0 bg-[#F8FAFC] dark:bg-[#09090B] text-slate-900 dark:text-slate-100 z-[120] flex flex-col overflow-y-auto w-full"
        >
          <button onClick={onClose} className="fixed top-6 right-6 z-[130] bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-md hover:bg-slate-100 dark:hover:bg-slate-800 p-3 rounded-full transition-colors border border-slate-200 dark:border-slate-800">
            <X className="w-5 h-5"/>
          </button>
          
          <div className="pt-28 px-6 md:px-12 w-full max-w-7xl mx-auto flex flex-col pb-24">
            <RevealText text={t('menuArticles')} className="font-serif text-4xl md:text-6xl mb-10 text-slate-900 dark:text-white !justify-start" once={true} />
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {ARTICLES.map((article, i) => (
                <motion.div
                  key={article.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.08 + 0.2 }}
                  className="group cursor-pointer flex flex-col bg-white dark:bg-[#121215] rounded-3xl p-5 shadow-sm hover:shadow-xl transition-all border border-slate-200/80 dark:border-slate-800/80 hover:-translate-y-1"
                  onClick={() => onSelectArticle(article)}
                >
                  <div className="w-full aspect-[4/3] bg-slate-100 dark:bg-slate-900 rounded-2xl mb-4 overflow-hidden relative">
                     <img src={article.img} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" alt={t(article.title_key)} loading="lazy" />
                  </div>
                  <h3 className="font-bold text-xl mb-1.5 text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">{t(article.title_key)}</h3>
                  <p className="text-slate-500 dark:text-slate-400 font-sans text-sm leading-relaxed">{t(article.desc_key)}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function RecipeDetailModal({ recipe, onClose }: any) {
  const { t } = useTranslation();
  return (
    <motion.div 
      key="recipe-detail"
      initial={{ opacity: 0 }} 
      animate={{ opacity: 1 }} 
      exit={{ opacity: 0, transition: { duration: 0.3 } }} 
      transition={{ duration: 0.3 }} 
      className="fixed inset-0 bg-[#F8FAFC] dark:bg-[#09090B] z-[140] flex flex-col md:flex-row h-[100dvh] overflow-hidden"
    >
      <button onClick={onClose} className="absolute top-6 right-6 z-50 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md p-3 rounded-full hover:bg-white dark:hover:bg-slate-800 transition-colors shadow-md border border-slate-200 dark:border-slate-800">
        <X className="w-5 h-5 text-slate-900 dark:text-white"/>
      </button>
      
      <motion.div 
        initial={{ x: -60, opacity: 0 }} 
        animate={{ x: 0, opacity: 1 }} 
        exit={{ x: -60, opacity: 0 }}
        transition={{ duration: 0.4, ease: "easeOut" }} 
        className="w-full md:w-1/2 h-[40vh] md:h-full relative"
      >
        <img src={recipe.img} alt={t(recipe.title_key)} className="w-full h-full object-cover" />
      </motion.div>
      
      <motion.div 
        initial={{ x: 60, opacity: 0 }} 
        animate={{ x: 0, opacity: 1 }} 
        exit={{ x: 60, opacity: 0 }}
        transition={{ duration: 0.4, ease: "easeOut" }} 
        className="w-full md:w-1/2 h-[60vh] md:h-full p-8 md:p-14 lg:p-20 overflow-y-auto bg-white dark:bg-[#121215] text-slate-900 dark:text-slate-100 flex flex-col"
      >
         <h2 className="font-serif text-3xl md:text-5xl text-slate-900 dark:text-white mb-4 leading-tight">{t(recipe.title_key)}</h2>
         <p className="text-base md:text-lg text-slate-600 dark:text-slate-400 font-light mb-10">{t(recipe.desc_key)}</p>
         
         <div className="mb-10">
           <h4 className="font-bold text-xs tracking-widest uppercase text-slate-400 mb-4 flex items-center gap-2">
             <span className="w-6 h-[1px] bg-indigo-500"></span> {t('ingredientsLabel')}
           </h4>
           <ul className="space-y-3">
             {t(`${recipe.id}_ing`).split('|').map((ing: string, i: number) => (
               <li key={i} className="text-base text-slate-800 dark:text-slate-200 border-b border-slate-100 dark:border-slate-800 pb-2.5 flex items-start gap-2.5">
                 <span className="text-indigo-500 font-bold">•</span> {ing}
               </li>
             ))}
           </ul>
         </div>

         <div className="pb-20">
           <h4 className="font-bold text-xs tracking-widest uppercase text-slate-400 mb-4 flex items-center gap-2">
             <span className="w-6 h-[1px] bg-indigo-500"></span> {t('instructionsLabel')}
           </h4>
           <div className="space-y-6">
             {t(`${recipe.id}_inst`).split('|').map((inst: string, i: number) => (
               <div key={i} className="flex gap-4 items-start">
                  <span className="font-serif text-indigo-500 text-2xl md:text-3xl italic opacity-70 block w-8 pt-0.5">0{i+1}</span>
                  <p className="text-base text-slate-800 dark:text-slate-200 leading-relaxed flex-1">{inst}</p>
               </div>
             ))}
           </div>
         </div>
      </motion.div>
    </motion.div>
  );
}

function ArticleDetailModal({ article, onClose }: any) {
  const { t } = useTranslation();
  const scrollRef = useRef(null);

  return (
    <motion.div 
      key="article-detail"
      initial={{ opacity: 0 }} 
      animate={{ opacity: 1 }} 
      exit={{ opacity: 0, transition: { duration: 0.3 } }} 
      transition={{ duration: 0.3 }} 
      className="fixed inset-0 bg-[#F8FAFC] dark:bg-[#09090B] z-[140] flex flex-col md:flex-row h-[100dvh] overflow-hidden"
    >
      <button onClick={onClose} className="absolute top-6 right-6 z-50 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md p-3 rounded-full hover:bg-white dark:hover:bg-slate-800 transition-colors shadow-md border border-slate-200 dark:border-slate-800">
        <X className="w-5 h-5 text-slate-900 dark:text-white"/>
      </button>
      
      <motion.div 
        initial={{ x: -60, opacity: 0 }} 
        animate={{ x: 0, opacity: 1 }} 
        exit={{ x: -60, opacity: 0 }}
        transition={{ duration: 0.4, ease: "easeOut" }} 
        className="w-full md:w-1/2 h-[40vh] md:h-full relative"
      >
        <img 
          src={article.img} 
          alt={t(article.title_key)} 
          className="w-full h-full object-cover" 
        />
      </motion.div>
      
      <motion.div 
        initial={{ x: 60, opacity: 0 }} 
        animate={{ x: 0, opacity: 1 }} 
        exit={{ x: 60, opacity: 0 }}
        transition={{ duration: 0.4, ease: "easeOut" }} 
        className="w-full md:w-1/2 h-[60vh] md:h-full p-8 md:p-14 lg:p-20 overflow-y-auto bg-white dark:bg-[#121215] text-slate-900 dark:text-slate-100 flex flex-col"
        ref={scrollRef}
      >
         <h2 className="font-serif text-3xl md:text-5xl text-slate-900 dark:text-white mb-4 leading-tight">{t(article.title_key)}</h2>
         <p className="text-base md:text-lg text-slate-600 dark:text-slate-400 font-light mb-10">{t(article.desc_key)}</p>
         
         <div className="pb-20 text-slate-700 dark:text-slate-300 leading-relaxed">
            <ReactMarkdown 
              components={{
                h3: ({children}) => <h3 className="text-2xl font-serif text-slate-900 dark:text-white mt-10 mb-4">{children}</h3>,
                p: ({children}) => <p className="mb-4 text-base">{children}</p>,
                ol: ({children}) => <ol className="list-decimal pl-6 mb-6 space-y-2">{children}</ol>,
                ul: ({children}) => <ul className="list-disc pl-6 mb-6 space-y-2">{children}</ul>,
                li: ({children}) => <li className="mb-2">{children}</li>
              }}
            >
              {t(article.content_key)}
            </ReactMarkdown>
            
            <button 
               onClick={async () => {
                 try {
                   await navigator.share({
                     title: t(article.title_key),
                     text: t(article.desc_key),
                     url: window.location.href,
                   });
                 } catch (err) {
                   try {
                     await navigator.clipboard.writeText(window.location.href);
                   } catch (e) {
                     console.error("Clipboard write failed:", e);
                   }
                 }
               }}
             className="mt-10 inline-flex items-center gap-2 text-indigo-600 dark:text-indigo-400 font-semibold text-base hover:underline"
            >
              <Share2 className="w-4 h-4" />
              Share Article
            </button>
         </div>
      </motion.div>
    </motion.div>
  );
}

function Footer({ onOpenRecipes, onOpenArticles, onOpenLegal }: any) {
  const { t, isRTL } = useTranslation();
  return (
    <motion.footer 
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true }}
      transition={{ duration: 0.8 }}
      className="w-full bg-white dark:bg-[#09090B] text-slate-900 dark:text-slate-100 pt-20 pb-12 flex flex-col items-center border-t border-slate-200/80 dark:border-slate-800/80"
    >
      {/* Newsletter Subscription Component */}
      <Newsletter t={t} isRTL={isRTL} />

      <div className="flex flex-col items-center mb-14">
        <h1 className="font-logo text-slate-900 dark:text-white text-5xl md:text-6xl leading-[0.85] tracking-wide lowercase flex flex-col items-center mb-10">
          <RevealText text={t('heroTitle1')} isLogo={true} />
          <RevealText text={t('heroTitle2')} isLogo={true} delay={0.15} />
        </h1>
        
        <nav className="flex flex-col items-center gap-4 text-center">
          {[
            { label: t('footerShop') || 'Browse Resources', id: 'product-grid' },
            { label: t('footerSwipe') || 'Rate Tools', id: 'swipe-section' },
            { label: t('footerRec') || 'Read Guides', id: 'guides' }
          ].map((link, i) => (
            <motion.button 
              key={link.id}
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08 }}
              whileHover={{ scale: 1.04 }}
              onClick={() => {
                if (link.id === 'guides') {
                  const el = document.getElementById('guides');
                  if (el) {
                    el.scrollIntoView({ behavior: 'smooth' });
                  } else {
                    onOpenRecipes();
                  }
                } else {
                  document.getElementById(link.id)?.scrollIntoView({ behavior: 'smooth' });
                }
              }} 
              className="font-sans text-slate-600 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors text-base md:text-lg font-medium tracking-wide"
            >
              {link.label}
            </motion.button>
          ))}
          <motion.button 
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.25 }}
            whileHover={{ scale: 1.04 }}
            onClick={onOpenArticles}
            className="font-sans text-slate-600 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors text-base md:text-lg font-medium tracking-wide"
          >
            {t('menuArticles') || 'Articles'}
          </motion.button>
        </nav>
      </div>

      <div className="flex items-center gap-4 mb-10">
        <a href="#" target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-center text-slate-600 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:border-indigo-500 hover:scale-105 transition-all bg-slate-50 dark:bg-slate-900">
          <TikTokIcon className="w-4 h-4" />
        </a>
        <a href="#" target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-center text-slate-600 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:border-indigo-500 hover:scale-105 transition-all bg-slate-50 dark:bg-slate-900">
          <Instagram className="w-4 h-4" />
        </a>
        <a href="#" target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-center text-slate-600 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:border-indigo-500 hover:scale-105 transition-all bg-slate-50 dark:bg-slate-900">
          <Facebook className="w-4 h-4" />
        </a>
        <a href="#" target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-center text-slate-600 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:border-indigo-500 hover:scale-105 transition-all bg-slate-50 dark:bg-slate-900">
          <MessageCircle className="w-4 h-4" />
        </a>
        <a href="mailto:hello@techhub.com" className="w-10 h-10 rounded-full border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-center text-slate-600 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:border-indigo-500 hover:scale-105 transition-all bg-slate-50 dark:bg-slate-900">
          <Mail className="w-4 h-4" />
        </a>
      </div>

      <motion.button 
        whileTap={{ scale: 0.96 }}
        onClick={() => {
          document.getElementById('product-grid')?.scrollIntoView({ behavior: 'smooth' });
        }}
        className="bg-indigo-600 hover:bg-indigo-700 w-full max-w-xs md:max-w-sm text-white font-bold text-sm py-4 rounded-full tracking-wider shadow-lg shadow-indigo-600/20 hover:shadow-indigo-600/30 transition-all mb-16"
      >
        {t('footerPdfs') || 'pdfs?'}
      </motion.button>

      {/* Functional Legal Policy Links */}
      <div className="w-full flex flex-wrap items-center justify-center gap-3 md:gap-6 text-xs text-slate-500 dark:text-slate-400 max-w-3xl px-6 font-sans">
        <button 
          onClick={() => onOpenLegal('privacy')} 
          className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors font-medium"
        >
          {t('privacyPolicy')}
        </button>
        <span className="text-slate-300 dark:text-slate-700">|</span>
        <button 
          onClick={() => onOpenLegal('terms')} 
          className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors font-medium"
        >
          {t('termsOfService')}
        </button>
        <span className="text-slate-300 dark:text-slate-700">|</span>
        <button 
          onClick={() => onOpenLegal('refund')} 
          className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors font-medium"
        >
          {t('refundPolicy')}
        </button>
      </div>
      <p className="text-[11px] text-slate-400 dark:text-slate-600 mt-4">
        © {new Date().getFullYear()} YCN Vault. All open-source assets freely accessible.
      </p>
    </motion.footer>
  );
}

export default function App() {
  const [lang, setLang] = useState('en');
  const [currency, setCurrency] = useState('USD');
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [cart, setCart] = useState<any[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [cartOpenedFrom, setCartOpenedFrom] = useState<'add'|'nav'|null>(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isRecipeListOpen, setIsRecipeListOpen] = useState(false);
  const [isArticlesListOpen, setIsArticlesListOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const [selectedRecipe, setSelectedRecipe] = useState<any>(null);
  const [selectedArticle, setSelectedArticle] = useState<any>(null);
  const [activeLegal, setActiveLegal] = useState<'privacy' | 'terms' | 'refund' | null>(null);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [checkoutTotal, setCheckoutTotal] = useState(0);
  const [posterUrl, setPosterUrl] = useState('https://images.unsplash.com/photo-1587829741301-dc798b83add3?auto=format&fit=crop&q=80&w=1200');
  const [isVideoLoaded, setIsVideoLoaded] = useState(false);

  // Dynamically swap poster image resolution based on device size
  useEffect(() => {
    const updatePoster = () => {
      const w = window.innerWidth;
      if (w < 640) {
        setPosterUrl('https://images.unsplash.com/photo-1587829741301-dc798b83add3?auto=format&fit=crop&q=75&w=640');
      } else if (w < 1024) {
        setPosterUrl('https://images.unsplash.com/photo-1587829741301-dc798b83add3?auto=format&fit=crop&q=80&w=1200');
      } else {
        setPosterUrl('https://images.unsplash.com/photo-1587829741301-dc798b83add3?auto=format&fit=crop&q=85&w=2000');
      }
    };
    updatePoster();
    window.addEventListener('resize', updatePoster);
    return () => window.removeEventListener('resize', updatePoster);
  }, []);

  // Initialize theme from localStorage or default to light mode
  useEffect(() => {
    try {
      const savedTheme = localStorage.getItem('app-theme') as 'light' | 'dark' | null;
      if (savedTheme) {
        setTheme(savedTheme);
      } else {
        setTheme('light');
      }
    } catch {
      setTheme('light');
    }
  }, []);

  // Keyboard shortcut Cmd+K or Ctrl+K for search
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsSearchOpen(prev => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Update DOM class and localStorage when theme changes
  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    try {
      localStorage.setItem('app-theme', theme);
    } catch {
      // ignore in iframe
    }
  }, [theme]);

  const toggleTheme = useCallback(() => {
    setTheme(prev => prev === 'dark' ? 'light' : 'dark');
  }, []);

  useEffect(() => {
    if (isCartOpen || isCheckoutOpen || isMenuOpen || isSearchOpen || selectedProduct || isRecipeListOpen || selectedRecipe || isArticlesListOpen || selectedArticle || activeLegal) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }
    return () => { document.body.style.overflow = 'auto'; };
  }, [isCartOpen, isCheckoutOpen, isMenuOpen, isSearchOpen, selectedProduct, isRecipeListOpen, selectedRecipe, isArticlesListOpen, selectedArticle, activeLegal]);

  const cartCount = cart.reduce((sum, item) => sum + item.qty, 0);
  const cartTotal = cart.reduce((sum, item) => sum + item.price * item.qty, 0);

  const addToCart = useCallback((product: any, qty: number = 1) => {
    setCart(prev => {
      const existing = prev.find(item => item.id === product.id);
      if (existing) return prev.map(item => item.id === product.id ? { ...item, qty: item.qty + qty } : item);
      return [...prev, { ...product, qty }];
    });
    setSelectedProduct(null);
    setCartOpenedFrom('add');
    setIsCartOpen(true);
  }, []);

  const closeCart = useCallback(() => {
    setIsCartOpen(false);
    if (cartOpenedFrom === 'add') {
      setTimeout(() => {
        document.getElementById('product-grid')?.scrollIntoView({ behavior: 'smooth' });
      }, 300);
    }
  }, [cartOpenedFrom]);

  const updateQty = useCallback((id: string, delta: number) => {
    setCart(prev => prev.map(item => {
      if (item.id === id) {
        const newQty = Math.max(0, item.qty + delta);
        return { ...item, qty: newQty };
      }
      return item;
    }).filter(item => item.qty > 0));
  }, []);

  const handleShopNow = useCallback((product: any, qty: number = 1) => {
    setSelectedProduct(null);
    let newCart = [...cart];
    const existing = newCart.find(item => item.id === product.id);
    if (existing) {
       newCart = newCart.map(item => item.id === product.id ? { ...item, qty: item.qty + qty } : item);
    } else {
       newCart = [...newCart, { ...product, qty }];
    }
    setCart(newCart);
    const newTotal = newCart.reduce((sum, item) => sum + item.price * item.qty, 0);
    setCheckoutTotal(newTotal);
    setIsCartOpen(false);
    setIsCheckoutOpen(true);
  }, [cart]);

  const handleCheckout = useCallback(() => {
    setCheckoutTotal(cartTotal);
    setIsCartOpen(false);
    setIsCheckoutOpen(true);
  }, [cartTotal]);

  const t = (key: string) => DICT[lang]?.[key] || DICT['en']?.[key] || key;
  const isRTL = lang === 'ar';

  const formatPrice = useCallback((price: number) => {
    const cur = CURRENCIES[currency] || CURRENCIES.USD;
    const converted = price * cur.rate;
    if (converted === 0) return t('free') || 'FREE';
    if (currency === 'MAD') return `${converted.toFixed(2)} ${cur.symbol}`;
    return `${cur.symbol}${converted.toFixed(2)}`;
  }, [currency, t]);

  const handleCheckoutClose = useCallback((success: boolean) => {
    setIsCheckoutOpen(false);
    if (success) setCart([]);
  }, []);

  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001
  });

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      <LangContext.Provider value={{ lang, setLang }}>
        <CurrencyContext.Provider value={{ currency, setCurrency }}>
          <motion.div 
            className="fixed top-0 left-0 right-0 h-1 bg-indigo-500 z-[200] origin-left" 
            style={{ scaleX }} 
          />
          <div className={`min-h-screen bg-[#F8FAFC] dark:bg-[#09090B] text-slate-900 dark:text-slate-100 ${lang === 'ar' ? 'font-arabic' : 'font-sans'} selection:bg-indigo-500 selection:text-white ${isRTL ? 'rtl' : 'ltr'}`} dir={isRTL ? 'rtl' : 'ltr'}>
            <NavBar cartCount={cartCount} onOpenCart={() => { setCartOpenedFrom('nav'); setIsCartOpen(true); }} onOpenSearch={() => setIsSearchOpen(true)} isMenuOpen={isMenuOpen} setIsMenuOpen={setIsMenuOpen} />
            
            <MenuOverlay isOpen={isMenuOpen} onClose={() => setIsMenuOpen(false)} onProductClick={setSelectedProduct} onRecipesClick={() => setIsRecipeListOpen(true)} onArticlesClick={() => setIsArticlesListOpen(true)} />

            <SearchModal
              isOpen={isSearchOpen}
              onClose={() => setIsSearchOpen(false)}
              onSelectProduct={setSelectedProduct}
              onSelectArticle={setSelectedArticle}
              t={t}
              isRTL={isRTL}
              formatPrice={formatPrice}
            />

            <RecipeListModal isOpen={isRecipeListOpen} onClose={() => setIsRecipeListOpen(false)} onSelectRecipe={setSelectedRecipe} />
            <ArticlesListModal isOpen={isArticlesListOpen} onClose={() => setIsArticlesListOpen(false)} onSelectArticle={setSelectedArticle} />
            
            <LegalModal type={activeLegal} onClose={() => setActiveLegal(null)} t={t} isRTL={isRTL} />

            <AnimatePresence>
              {selectedRecipe && <RecipeDetailModal key="rec-modal" recipe={selectedRecipe} onClose={() => setSelectedRecipe(null)} />}
              {selectedArticle && <ArticleDetailModal key="art-modal" article={selectedArticle} onClose={() => setSelectedArticle(null)} />}
            </AnimatePresence>
            
            <CartDrawer isOpen={isCartOpen} onClose={closeCart} cart={cart} updateQty={updateQty} onCheckout={handleCheckout} />
            
            <AnimatePresence>
              {selectedProduct && <ProductDetailModal key="prod-modal" product={selectedProduct} onClose={() => setSelectedProduct(null)} onAddToCart={addToCart} onBuyNow={handleShopNow} onProductClick={setSelectedProduct} />}
            </AnimatePresence>
            
            <CheckoutModal 
              isOpen={isCheckoutOpen} 
              onClose={handleCheckoutClose} 
              cartTotal={checkoutTotal} 
              cartInfo={cart.map((item: any) => `${item.qty}x ${item.id}`).join(', ')} 
              cartItems={cart}
            />

          {/* Hero Section */}
          <section className="relative h-[92vh] w-full overflow-hidden rounded-b-[2rem] md:rounded-b-[3rem] bg-gradient-to-br from-[#0c0e17] via-[#141629] to-[#09090B]">
            {/* Fallback ambient glow and color gradient while loading */}
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(99,102,241,0.22),transparent_70%)] animate-pulse pointer-events-none" />

            {/* Video Background & Dynamic Poster with Parallax */}
            <motion.div 
              style={{ 
                y: useTransform(scrollYProgress, [0, 0.5], [0, 120]) 
              }}
              className="absolute inset-0 w-full h-full will-change-transform transform-gpu"
            >
              {/* Fallback Poster Image with Responsive Sizing */}
              <img
                src={posterUrl}
                alt=""
                loading="eager"
                decoding="async"
                className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-1000 ${
                  isVideoLoaded ? 'opacity-0' : 'opacity-60'
                } pointer-events-none`}
              />

              <video
                autoPlay
                loop
                muted
                playsInline
                preload="metadata"
                poster={posterUrl}
                onLoadedData={() => setIsVideoLoaded(true)}
                onPlaying={() => setIsVideoLoaded(true)}
                className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-1000 pointer-events-none ${
                  isVideoLoaded ? 'opacity-60' : 'opacity-0'
                }`}
              >
                <source src="https://xupbvecz0uqtebvs.public.blob.vercel-storage.com/keyboard%20typing%20loop.mp4" type="video/mp4" />
              </video>
            </motion.div>
            
            <div className="absolute inset-0 bg-gradient-to-b from-[#09090B]/60 via-[#09090B]/40 to-[#09090B]"></div>
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(99,102,241,0.15),transparent_70%)] pointer-events-none"></div>

            <div className="relative z-10 flex flex-col items-center justify-between h-full px-4 pt-28 pb-8">
              <motion.div 
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 1.2, ease: [0.33, 1, 0.68, 1] }}
                className="flex-1 flex items-center justify-center w-full"
              >
                <motion.h1 
                  className="font-logo text-white text-[30vw] md:text-[16vw] leading-[0.8] tracking-wide lowercase drop-shadow-2xl flex flex-col items-center"
                >
                  <span>{t('heroTitle1')}</span>
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-slate-200 to-indigo-300">{t('heroTitle2')}</span>
                </motion.h1>
              </motion.div>
              
              <motion.div 
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 1.2, delay: 0.2, ease: [0.33, 1, 0.68, 1] }}
                className="flex flex-col items-center gap-6 md:gap-7 w-full"
              >
                <div className="font-serif text-white/95 text-[26px] md:text-5xl text-center leading-[1.15] tracking-tight drop-shadow-lg flex flex-col items-center gap-1.5">
                  <RevealText text={t('heroTagline1')} />
                  <RevealText text={t('heroTagline2')} delay={0.3} />
                </div>

                <div className="flex items-center justify-center">
                  <motion.button 
                    whileTap={{ scale: 0.95 }}
                    onClick={() => document.getElementById('product-grid')?.scrollIntoView({ behavior: 'smooth' })}
                    className="bg-indigo-600 hover:bg-indigo-500 hover:scale-[1.02] transition-all duration-300 text-white font-semibold text-base py-3.5 px-9 rounded-full flex items-center justify-center gap-2.5 shadow-[0_0_30px_rgba(99,102,241,0.35)]"
                  >
                    <span>{t('orderNow')}</span>
                    <ArrowRight className={`w-4 h-4 ${isRTL ? 'rotate-180' : ''}`} />
                  </motion.button>
                </div>
                
                <div className="flex flex-col items-center gap-2 opacity-75 mt-2">
                  <span className="text-white/60 text-[10px] tracking-[0.2em] uppercase font-semibold">{t('scroll')}</span>
                  <div className="w-[1px] h-7 md:h-9 bg-white/20 relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-full bg-white animate-scroll-down"></div>
                  </div>
                </div>
              </motion.div>
            </div>
          </section>

          {/* Content Section */}
          <section 
            className="py-24 px-6 md:px-12 lg:px-24 text-center flex flex-col items-center bg-[#F8FAFC] dark:bg-[#09090B]"
          >
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200/60 dark:border-indigo-800/60 text-indigo-600 dark:text-indigo-400 text-xs font-semibold uppercase tracking-wider mb-6">
              <span>Open Source & Free Assets</span>
            </div>
            <RevealText text={t('authTitle1')} className="font-serif text-[36px] md:text-6xl text-slate-900 dark:text-white md:mb-1 tracking-tight leading-[1.1] max-w-3xl" />
            <RevealText text={t('authTitle2')} delay={0.15} className="font-serif text-[36px] md:text-6xl text-slate-900 dark:text-white mb-6 tracking-tight leading-[1.1] max-w-3xl" />
            <RevealText text={t('authDesc')} delay={0.3} fast={true} className="font-sans text-base md:text-lg text-slate-600 dark:text-slate-400 max-w-[760px] leading-[1.7]" />
          </section>

          <SwipeSection key={lang} onQuickAdd={addToCart} onShopNow={handleShopNow} onProductClick={setSelectedProduct} />
          <ShopSection onQuickAdd={addToCart} onShopNow={handleShopNow} onProductClick={setSelectedProduct} />
          <RecipeHero onOpenRecipes={() => setIsRecipeListOpen(true)} />
          <Footer onOpenRecipes={() => setIsRecipeListOpen(true)} onOpenArticles={() => setIsArticlesListOpen(true)} onOpenLegal={setActiveLegal} />
        </div>
      </CurrencyContext.Provider>
    </LangContext.Provider>
  </ThemeContext.Provider>
  );
}
