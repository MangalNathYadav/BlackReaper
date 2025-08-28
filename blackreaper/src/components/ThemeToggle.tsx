'use client';

import { useState, useEffect } from 'react';

interface ThemeToggleProps {
  className?: string;
}

export default function ThemeToggle({ className = '' }: ThemeToggleProps) {
  const [mode, setMode] = useState('human');
  const [isTransitioning, setIsTransitioning] = useState(false);

  useEffect(() => {
    const savedMode = localStorage.getItem('blackreaper_mode') || 'human';
    setMode(savedMode);
    document.documentElement.setAttribute('data-mode', savedMode);
  }, []);

  const toggleMode = () => {
    setIsTransitioning(true);

    const newMode = mode === 'human' ? 'ghoul' : 'human';
    setMode(newMode);
    document.documentElement.setAttribute('data-mode', newMode);
    localStorage.setItem('blackreaper_mode', newMode);

    // Dispatch custom event for other components to listen to
    window.dispatchEvent(new CustomEvent('themeChange', { detail: newMode }));

    // Remove transition class after animation completes
    setTimeout(() => {
      setIsTransitioning(false);
    }, 300);
  };

  return (
    <button
      onClick={toggleMode}
      className={`btn-secondary transition-all duration-300 ${
        isTransitioning ? 'scale-95' : 'hover:scale-105'
      } ${mode === 'ghoul' ? 'bg-red-900/20 border-red-700' : ''} ${className}`}
      aria-pressed={mode === 'ghoul'}
      aria-label={`Switch to ${mode === 'human' ? 'Ghoul' : 'Human'} mode`}
    >
      {mode === 'human' ? (
        <>
          🌙 <span className="hidden sm:inline">Ghoul Mode</span>
          <span className="ml-2 text-xs opacity-70">(Dark)</span>
        </>
      ) : (
        <>
          ☀️ <span className="hidden sm:inline">Human Mode</span>
          <span className="ml-2 text-xs opacity-70">(Light)</span>
        </>
      )}
    </button>
  );
}
