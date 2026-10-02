import { createContext, useContext, useEffect, useState } from 'react';
import i18n from '../i18n.js';

const SettingsContext = createContext(null);

const LANGS = ['en', 'mr', 'hi'];

export function SettingsProvider({ children }) {
  // Font scale: 0 = base (18px), 1 = 20px, 2 = 23px (three discrete steps).
  const [fontScale, setFontScale] = useState(() =>
    Number(localStorage.getItem('ol_font_scale')) || 0
  );
  const [highContrast, setHighContrast] = useState(
    () => localStorage.getItem('ol_contrast') === 'high'
  );
  const [lang, setLang] = useState(() => localStorage.getItem('ol_lang') || 'en');

  // Apply + persist font scale on <html>.
  useEffect(() => {
    document.documentElement.setAttribute('data-font-scale', String(fontScale));
    localStorage.setItem('ol_font_scale', String(fontScale));
  }, [fontScale]);

  // Apply + persist high-contrast on <html>.
  useEffect(() => {
    if (highContrast) {
      document.documentElement.setAttribute('data-contrast', 'high');
    } else {
      document.documentElement.removeAttribute('data-contrast');
    }
    localStorage.setItem('ol_contrast', highContrast ? 'high' : 'normal');
  }, [highContrast]);

  // Apply + persist language.
  useEffect(() => {
    i18n.changeLanguage(lang);
    document.documentElement.setAttribute('lang', lang);
    localStorage.setItem('ol_lang', lang);
  }, [lang]);

  const value = {
    fontScale,
    setFontScale, // 0 | 1 | 2
    highContrast,
    toggleContrast: () => setHighContrast((v) => !v),
    lang,
    setLang,
    cycleLang: () => setLang((cur) => LANGS[(LANGS.indexOf(cur) + 1) % LANGS.length]),
    LANGS,
  };

  return <SettingsContext.Provider value={value}>{children}</SettingsContext.Provider>;
}

export function useSettings() {
  const ctx = useContext(SettingsContext);
  if (!ctx) throw new Error('useSettings must be used within SettingsProvider');
  return ctx;
}
