'use client';

import { useState, useEffect } from 'react';

export default function ThemeStatus() {
  const [mode, setMode] = useState('human');

  useEffect(() => {
    const savedMode = localStorage.getItem('blackreaper_mode') || 'human';
    setMode(savedMode);

    // Listen for theme changes
    const handleStorageChange = () => {
      const newMode = localStorage.getItem('blackreaper_mode') || 'human';
      setMode(newMode);
    };

    window.addEventListener('storage', handleStorageChange);

    // Also listen for custom theme change events
    const handleThemeChange = (e: CustomEvent) => {
      setMode(e.detail);
    };

    window.addEventListener('themeChange' as any, handleThemeChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('themeChange' as any, handleThemeChange);
    };
  }, []);

  return (
    <div className="fixed top-4 right-4 z-50 bg-black/50 backdrop-blur-sm rounded-lg px-3 py-1 text-xs text-white/80">
      {mode === 'human' ? '☀️ Human Mode (Light)' : '🌙 Ghoul Mode (Dark)'}
    </div>
  );
}
