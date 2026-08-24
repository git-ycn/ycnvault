import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, ShieldCheck, FileText, RefreshCw, ExternalLink } from 'lucide-react';
import { LEGAL_PAGES } from '../legalContent';

interface LegalModalProps {
  type: 'privacy' | 'terms' | 'refund' | null;
  onClose: () => void;
  t: (key: string) => string;
  isRTL: boolean;
}

export const LegalModal: React.FC<LegalModalProps> = ({ type, onClose, t, isRTL }) => {
  if (!type) return null;
  const doc = LEGAL_PAGES[type];

  const getIcon = () => {
    switch (type) {
      case 'privacy':
        return <ShieldCheck className="w-6 h-6 text-indigo-500" />;
      case 'terms':
        return <FileText className="w-6 h-6 text-indigo-500" />;
      case 'refund':
        return <RefreshCw className="w-6 h-6 text-indigo-500" />;
    }
  };

  return (
    <AnimatePresence>
      <div 
        className="fixed inset-0 z-[160] flex items-center justify-center p-4 md:p-6 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
          className="bg-white dark:bg-[#121215] text-slate-900 dark:text-slate-100 w-full max-w-3xl max-h-[85vh] rounded-3xl overflow-hidden shadow-2xl border border-slate-200/80 dark:border-slate-800 flex flex-col relative"
          onClick={(e) => e.stopPropagation()}
          dir={isRTL ? 'rtl' : 'ltr'}
        >
          {/* Header */}
          <div className="px-6 py-5 md:px-8 md:py-6 border-b border-slate-100 dark:border-slate-800/80 flex items-center justify-between bg-slate-50/50 dark:bg-[#16161a]/60">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-indigo-500/10 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400">
                {getIcon()}
              </div>
              <div>
                <h3 className="font-sans font-bold text-xl md:text-2xl text-slate-900 dark:text-white">
                  {t(doc.titleKey)}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  {t('legalLastUpdated')}: {doc.lastUpdated}
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-2 rounded-full text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              aria-label="Close legal modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Body Content */}
          <div className="p-6 md:p-8 overflow-y-auto space-y-6 text-slate-600 dark:text-slate-300 leading-relaxed text-sm md:text-base">
            {doc.sections.map((sec, idx) => (
              <div key={idx} className="space-y-2">
                <h4 className="font-semibold text-base md:text-lg text-slate-900 dark:text-slate-100">
                  {t(sec.headingKey)}
                </h4>
                <p className="text-slate-600 dark:text-slate-300 text-sm md:text-base leading-relaxed">
                  {t(sec.bodyKey)}
                </p>
              </div>
            ))}

            <div className="pt-4 border-t border-slate-100 dark:border-slate-800 text-xs text-slate-400 flex items-center gap-2">
              <ExternalLink className="w-3.5 h-3.5" />
              <span>YCN Vault Open Source Digital Resources Directory</span>
            </div>
          </div>

          {/* Footer actions */}
          <div className="px-6 py-4 md:px-8 border-t border-slate-100 dark:border-slate-800/80 bg-slate-50/50 dark:bg-[#16161a]/60 flex justify-end">
            <button
              onClick={onClose}
              className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-medium text-sm transition-colors shadow-sm"
            >
              {t('legalClose')}
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
