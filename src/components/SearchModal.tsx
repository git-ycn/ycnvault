import React, { useState, useEffect, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Search, X, Package, FileText, ArrowRight, CornerDownLeft, Sparkles } from 'lucide-react';
import { PRODUCTS } from '../data';
import { ARTICLES } from '../articles';

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectProduct: (product: any) => void;
  onSelectArticle: (article: any) => void;
  t: (key: string) => string;
  isRTL: boolean;
  formatPrice: (price: number) => string;
}

export const SearchModal: React.FC<SearchModalProps> = ({
  isOpen,
  onClose,
  onSelectProduct,
  onSelectArticle,
  t,
  isRTL,
  formatPrice,
}) => {
  const [query, setQuery] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 50);
      setQuery('');
    }
  }, [isOpen]);

  // Keyboard escape handler
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  const cleanQuery = query.trim().toLowerCase();

  // Filter products by translated title or description
  const matchingProducts = useMemo(() => {
    if (!cleanQuery) return [];
    return PRODUCTS.filter((p) => {
      const title = t(p.title_key).toLowerCase();
      const desc = t(p.desc_key).toLowerCase();
      const id = p.id.toLowerCase();
      return title.includes(cleanQuery) || desc.includes(cleanQuery) || id.includes(cleanQuery);
    });
  }, [cleanQuery, t]);

  // Filter articles by translated title or description
  const matchingArticles = useMemo(() => {
    if (!cleanQuery) return [];
    return ARTICLES.filter((a) => {
      const title = t(a.title_key).toLowerCase();
      const desc = t(a.desc_key).toLowerCase();
      const metaTitle = (a.metaTitle || '').toLowerCase();
      return title.includes(cleanQuery) || desc.includes(cleanQuery) || metaTitle.includes(cleanQuery);
    });
  }, [cleanQuery, t]);

  const totalResults = matchingProducts.length + matchingArticles.length;

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div 
        className="fixed inset-0 z-[170] flex items-start justify-center pt-16 md:pt-24 p-4 bg-black/65 backdrop-blur-md"
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: -10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: -10 }}
          transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
          className="bg-white dark:bg-[#121215] text-slate-900 dark:text-slate-100 w-full max-w-2xl max-h-[80vh] rounded-3xl overflow-hidden shadow-2xl border border-slate-200/80 dark:border-slate-800 flex flex-col relative"
          onClick={(e) => e.stopPropagation()}
          dir={isRTL ? 'rtl' : 'ltr'}
        >
          {/* Search Header Bar */}
          <div className="p-4 md:p-5 border-b border-slate-200/80 dark:border-slate-800 flex items-center gap-3 bg-slate-50/50 dark:bg-[#16161a]/60">
            <Search className="w-5 h-5 text-indigo-500 shrink-0" />
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={t('searchPlaceholder')}
              className="w-full bg-transparent text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 text-base md:text-lg font-medium focus:outline-none"
            />
            {query && (
              <button
                onClick={() => setQuery('')}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-200/60 dark:hover:bg-slate-800 transition-colors"
                aria-label="Clear search"
              >
                <X className="w-4 h-4" />
              </button>
            )}
            <button
              onClick={onClose}
              className="px-2.5 py-1 text-xs font-semibold uppercase tracking-wider text-slate-400 hover:text-slate-700 dark:hover:text-white bg-slate-200/60 dark:bg-slate-800 rounded-lg transition-colors shrink-0"
            >
              ESC
            </button>
          </div>

          {/* Results Area */}
          <div className="p-4 md:p-6 overflow-y-auto max-h-[60vh] space-y-6">
            {!cleanQuery ? (
              <div className="py-6 text-center">
                <div className="w-12 h-12 mx-auto mb-3 rounded-2xl bg-indigo-50 dark:bg-indigo-950/50 text-indigo-500 flex items-center justify-center border border-indigo-100 dark:border-indigo-900/50">
                  <Sparkles className="w-6 h-6" />
                </div>
                <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                  {t('searchHint')}
                </p>
                <div className="flex flex-wrap items-center justify-center gap-2 mt-4">
                  {['React', 'Android', 'PLR', 'Web Tools', 'API', 'Guide'].map((keyword) => (
                    <button
                      key={keyword}
                      onClick={() => setQuery(keyword)}
                      className="px-3 py-1.5 rounded-full text-xs font-medium bg-slate-100 dark:bg-slate-800/80 text-slate-600 dark:text-slate-400 hover:bg-indigo-50 hover:text-indigo-600 dark:hover:bg-indigo-950/50 dark:hover:text-indigo-400 transition-colors border border-slate-200/50 dark:border-slate-800"
                    >
                      {keyword}
                    </button>
                  ))}
                </div>
              </div>
            ) : totalResults === 0 ? (
              <div className="py-12 text-center text-slate-400">
                <Search className="w-10 h-10 mx-auto mb-3 opacity-30" />
                <p className="text-sm font-medium">
                  {t('noResults')} <span className="font-bold text-slate-700 dark:text-slate-200">"{query}"</span>
                </p>
              </div>
            ) : (
              <>
                {/* Products matching */}
                {matchingProducts.length > 0 && (
                  <div>
                    <div className="flex items-center gap-2 mb-3 px-1 text-xs font-bold text-slate-400 uppercase tracking-wider">
                      <Package className="w-3.5 h-3.5 text-indigo-500" />
                      <span>{t('categoryProducts')} ({matchingProducts.length})</span>
                    </div>
                    <div className="space-y-2">
                      {matchingProducts.map((p) => (
                        <div
                          key={p.id}
                          onClick={() => {
                            onClose();
                            onSelectProduct(p);
                          }}
                          className="flex items-center gap-3.5 p-3 rounded-2xl bg-slate-50 dark:bg-[#16161b] hover:bg-indigo-50/70 dark:hover:bg-indigo-950/30 border border-slate-200/60 dark:border-slate-800/80 cursor-pointer transition-all group"
                        >
                          <img
                            src={p.img}
                            alt=""
                            className="w-12 h-12 object-cover rounded-xl shrink-0 border border-slate-200/50 dark:border-slate-700/50"
                          />
                          <div className="flex-1 min-w-0">
                            <h4 className="font-semibold text-sm text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors truncate">
                              {t(p.title_key)}
                            </h4>
                            <p className="text-xs text-slate-500 dark:text-slate-400 truncate mt-0.5">
                              {t(p.desc_key)?.split('|')[0] || ''}
                            </p>
                          </div>
                          <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-2.5 py-1 rounded-full border border-emerald-200/60 dark:border-emerald-800/40 shrink-0">
                            {formatPrice(p.price)}
                          </span>
                          <ArrowRight className={`w-4 h-4 text-slate-400 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 group-hover:translate-x-0.5 transition-all shrink-0 ${isRTL ? 'rotate-180' : ''}`} />
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Articles matching */}
                {matchingArticles.length > 0 && (
                  <div>
                    <div className="flex items-center gap-2 mb-3 px-1 text-xs font-bold text-slate-400 uppercase tracking-wider">
                      <FileText className="w-3.5 h-3.5 text-indigo-500" />
                      <span>{t('categoryArticles')} ({matchingArticles.length})</span>
                    </div>
                    <div className="space-y-2">
                      {matchingArticles.map((a) => (
                        <div
                          key={a.id}
                          onClick={() => {
                            onClose();
                            onSelectArticle(a);
                          }}
                          className="flex items-center gap-3.5 p-3 rounded-2xl bg-slate-50 dark:bg-[#16161b] hover:bg-indigo-50/70 dark:hover:bg-indigo-950/30 border border-slate-200/60 dark:border-slate-800/80 cursor-pointer transition-all group"
                        >
                          <img
                            src={a.img}
                            alt=""
                            className="w-12 h-12 object-cover rounded-xl shrink-0 border border-slate-200/50 dark:border-slate-700/50"
                          />
                          <div className="flex-1 min-w-0">
                            <h4 className="font-semibold text-sm text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors truncate">
                              {t(a.title_key)}
                            </h4>
                            <p className="text-xs text-slate-500 dark:text-slate-400 truncate mt-0.5">
                              {t(a.desc_key)}
                            </p>
                          </div>
                          <span className="text-[11px] font-medium text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/40 px-2.5 py-1 rounded-full border border-indigo-200/60 dark:border-indigo-800/40 shrink-0">
                            Guide
                          </span>
                          <ArrowRight className={`w-4 h-4 text-slate-400 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 group-hover:translate-x-0.5 transition-all shrink-0 ${isRTL ? 'rotate-180' : ''}`} />
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </>
            )}
          </div>

          {/* Search Footer */}
          <div className="px-5 py-3 border-t border-slate-200/80 dark:border-slate-800 bg-slate-50/50 dark:bg-[#16161a]/60 flex items-center justify-between text-xs text-slate-400">
            <span className="flex items-center gap-1.5">
              <CornerDownLeft className="w-3.5 h-3.5" />
              <span>Select item to view details</span>
            </span>
            <span>{totalResults > 0 ? `${totalResults} results` : ''}</span>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
