'use client';

import { useState, useEffect } from 'react';

export default function ThemeDebugger() {
  const [currentMode, setCurrentMode] = useState('human');
  const [cssVariables, setCssVariables] = useState<Record<string, string>>({});

  useEffect(() => {
    const updateDebugInfo = () => {
      const mode = localStorage.getItem('blackreaper_mode') || 'human';
      setCurrentMode(mode);

      // Get CSS variables
      const root = document.documentElement;
      const computedStyle = getComputedStyle(root);
      const variables = [
        '--background',
        '--foreground',
        '--accent',
        '--card-bg',
        '--border'
      ];

      const vars: Record<string, string> = {};
      variables.forEach(varName => {
        vars[varName] = computedStyle.getPropertyValue(varName).trim();
      });
      setCssVariables(vars);
    };

    updateDebugInfo();

    // Listen for theme changes
    const handleThemeChange = () => {
      setTimeout(updateDebugInfo, 100); // Small delay to ensure CSS has updated
    };

    window.addEventListener('themeChange' as any, handleThemeChange);
    window.addEventListener('storage', handleThemeChange);

    return () => {
      window.removeEventListener('themeChange' as any, handleThemeChange);
      window.removeEventListener('storage', handleThemeChange);
    };
  }, []);

  // Only show in development
  if (process.env.NODE_ENV === 'production') {
    return null;
  }

  return (
    <div className="fixed bottom-4 left-4 z-50 bg-black/80 text-white p-4 rounded-lg text-xs max-w-xs">
      <h4 className="font-bold mb-2">Theme Debug</h4>
      <p><strong>Mode:</strong> {currentMode}</p>
      <p><strong>data-mode attr:</strong> {document.documentElement.getAttribute('data-mode')}</p>
      <div className="mt-2">
        <strong>CSS Variables:</strong>
        {Object.entries(cssVariables).map(([key, value]) => (
          <div key={key} className="flex justify-between">
            <span>{key}:</span>
            <span className="font-mono">{value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
