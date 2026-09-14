import React, { createContext, useContext, useEffect, useState } from 'react';

const ThemeContext = createContext(null);

function resolveTheme(mode) {
  if (mode === 'system') {
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }
  return mode; // 'light' or 'dark'
}

export function ThemeProvider({ mode, onModeChange, children }) {
  const [resolved, setResolved] = useState(() => resolveTheme(mode));

  useEffect(() => {
    setResolved(resolveTheme(mode));
    if (mode !== 'system') return;
    const mql = window.matchMedia('(prefers-color-scheme: dark)');
    const handler = () => setResolved(resolveTheme('system'));
    mql.addEventListener('change', handler);
    return () => mql.removeEventListener('change', handler);
  }, [mode]);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', resolved);
  }, [resolved]);

  return (
    <ThemeContext.Provider value={{ mode, resolved, setMode: onModeChange }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}
