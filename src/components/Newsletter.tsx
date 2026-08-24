import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Mail, CheckCircle2, ArrowRight, Sparkles, Loader2 } from 'lucide-react';

interface NewsletterProps {
  t: (key: string) => string;
  isRTL: boolean;
}

export const Newsletter: React.FC<NewsletterProps> = ({ t, isRTL }) => {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success'>('idle');
  const [errorMessage, setErrorMessage] = useState('');
  const formRef = useRef<HTMLFormElement>(null);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    if (!email || !email.includes('@') || !email.includes('.')) {
      e.preventDefault();
      setErrorMessage('Please enter a valid email address.');
      return;
    }
    
    setErrorMessage('');
    setStatus('loading');

    // Asynchronous background fallback dispatch
    try {
      const formData = new FormData();
      formData.append('fields[email]', email.trim());
      formData.append('ml-submit', '1');
      formData.append('anticsrf', 'true');

      fetch('https://assets.mailerlite.com/jsonp/2592168/forms/196618173286450524/subscribe', {
        method: 'POST',
        body: formData,
        mode: 'no-cors'
      }).catch(() => {});
    } catch (_) {
      // Ignored
    }

    // The form natively posts into the hidden iframe so the user is never redirected away
    setTimeout(() => {
      setStatus('success');
      setEmail('');
    }, 600);
  };

  const handleReset = () => {
    setStatus('idle');
    setErrorMessage('');
  };

  return (
    <div className="w-full max-w-2xl mx-auto px-4 mb-16">
      {/* Invisible iframe to swallow MailerLite response and prevent redirection or popup tabs */}
      <iframe
        name="hidden_mailerlite_frame"
        id="hidden_mailerlite_frame"
        title="mailerlite-submission-frame"
        className="hidden"
        style={{ display: 'none', width: 0, height: 0, border: 0 }}
      />

      <div className="bg-gradient-to-b from-slate-50 to-indigo-50/30 dark:from-[#121215] dark:to-[#16161b] rounded-3xl p-6 md:p-10 border border-slate-200/80 dark:border-slate-800/80 shadow-sm relative overflow-hidden transition-colors duration-300">
        {/* Ambient background accents */}
        <div className="absolute -top-20 -right-20 w-44 h-44 bg-indigo-500/10 dark:bg-indigo-500/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-20 -left-20 w-44 h-44 bg-emerald-500/10 dark:bg-emerald-500/15 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 text-center">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-100/80 dark:bg-indigo-950/70 text-indigo-600 dark:text-indigo-400 text-xs font-semibold uppercase tracking-wider mb-3.5 shadow-xs">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Vault Newsletter</span>
          </div>

          <h3 className="font-serif text-2xl md:text-3xl font-bold text-slate-900 dark:text-white mb-2 tracking-tight">
            {t('newsletterTitle')}
          </h3>
          <p className="text-slate-600 dark:text-slate-400 text-sm md:text-base max-w-md mx-auto mb-7 leading-relaxed">
            {t('newsletterSubtitle')}
          </p>

          <AnimatePresence mode="wait">
            {status === 'success' ? (
              <motion.div
                key="success"
                initial={{ opacity: 0, scale: 0.96, y: 6 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.96, y: -6 }}
                className="p-5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200/80 dark:border-emerald-800/60 text-emerald-800 dark:text-emerald-300 text-sm font-medium flex flex-col items-center justify-center gap-3"
              >
                <div className="flex items-center gap-2.5">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                  <span>{t('newsletterSuccess')}</span>
                </div>
                <button
                  type="button"
                  onClick={handleReset}
                  className="text-xs text-emerald-700 dark:text-emerald-400 underline hover:no-underline cursor-pointer"
                >
                  Subscribe another email
                </button>
              </motion.div>
            ) : (
              <motion.form
                ref={formRef}
                key="mailerlite-form"
                action="https://assets.mailerlite.com/jsonp/2592168/forms/196618173286450524/subscribe"
                method="POST"
                target="hidden_mailerlite_frame"
                onSubmit={handleSubmit}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex flex-col sm:flex-row gap-2.5 max-w-md mx-auto"
                dir={isRTL ? 'rtl' : 'ltr'}
              >
                {/* Required Hidden Inputs for MailerLite */}
                <input type="hidden" name="ml-submit" value="1" />
                <input type="hidden" name="anticsrf" value="true" />

                <div className="relative flex-1">
                  <div className={`absolute top-1/2 -translate-y-1/2 ${isRTL ? 'right-3.5' : 'left-3.5'} text-slate-400 dark:text-slate-500 pointer-events-none transition-colors`}>
                    <Mail className="w-4 h-4" />
                  </div>
                  <input
                    type="email"
                    name="fields[email]"
                    required
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      if (errorMessage) setErrorMessage('');
                    }}
                    placeholder={t('newsletterPlaceholder') || "Enter your email address"}
                    className={`w-full py-3.5 ${isRTL ? 'pr-10 pl-4' : 'pl-10 pr-4'} rounded-xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-700/90 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/80 focus:border-indigo-500 transition-all duration-200 shadow-xs hover:border-slate-300 dark:hover:border-slate-600`}
                  />
                </div>

                <motion.button
                  whileTap={{ scale: 0.97 }}
                  type="submit"
                  disabled={status === 'loading'}
                  className="py-3.5 px-6 rounded-xl bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 disabled:opacity-75 text-white font-semibold text-sm transition-all duration-200 shadow-sm hover:shadow-md flex items-center justify-center gap-2 shrink-0 cursor-pointer"
                >
                  {status === 'loading' ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>{t('newsletterLoading')}</span>
                    </>
                  ) : (
                    <>
                      <span>{t('newsletterButton')}</span>
                      <ArrowRight className={`w-4 h-4 ${isRTL ? 'rotate-180' : ''}`} />
                    </>
                  )}
                </motion.button>
              </motion.form>
            )}
          </AnimatePresence>

          {errorMessage && (
            <p className="text-xs font-medium text-rose-500 mt-2.5 transition-all">{errorMessage}</p>
          )}

          <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-4 leading-normal">
            {t('newsletterPrivacy')}
          </p>
        </div>
      </div>
    </div>
  );
};


