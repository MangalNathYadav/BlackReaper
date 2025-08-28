'use client';

import { useState } from 'react';

export default function FloatingActionButton() {
  const [isOpen, setIsOpen] = useState(false);

  const actions = [
    { icon: '⏱️', label: 'Start Pomodoro', action: () => alert('Pomodoro timer would start here!') },
    { icon: '⚔️', label: 'Quick Battle', action: () => alert('Battle matchmaking would start here!') },
    { icon: '📓', label: 'Quick Journal', action: () => alert('Journal entry would open here!') },
  ];

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {/* Action buttons */}
      {isOpen && (
        <div className="absolute bottom-16 right-0 space-y-3">
          {actions.map((action, index) => (
            <button
              key={index}
              onClick={() => {
                action.action();
                setIsOpen(false);
              }}
              className="flex items-center gap-3 bg-black/80 backdrop-blur-sm border border-white/20 rounded-lg px-4 py-3 text-white hover:bg-black/90 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
              style={{
                animation: `fadeInUp 0.3s ease-out ${index * 0.1}s both`
              }}
            >
              <span className="text-xl">{action.icon}</span>
              <span className="text-sm font-medium">{action.label}</span>
            </button>
          ))}
        </div>
      )}

      {/* Main FAB */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`w-14 h-14 rounded-full btn-primary shadow-lg hover:shadow-xl transform transition-all duration-300 ${
          isOpen ? 'rotate-45 scale-110' : 'hover:scale-110'
        }`}
      >
        <span className="text-2xl">+</span>
      </button>
    </div>
  );
}
