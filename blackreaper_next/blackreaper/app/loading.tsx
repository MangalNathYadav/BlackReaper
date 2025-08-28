"use client";

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

export default function Loading() {
  const [progress, setProgress] = useState(0);
  
  useEffect(() => {
    const interval = setInterval(() => {
      setProgress(prev => {
        const next = prev + Math.random() * 10;
        return next > 100 ? 100 : next;
      });
    }, 200);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="fixed inset-0 flex flex-col items-center justify-center bg-black z-50">
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="mb-8"
      >
        <h1 className="text-5xl font-bold text-red-600 mb-2">
          BlackReaper
        </h1>
        <p className="text-gray-400 text-center">Awakening your productivity...</p>
      </motion.div>
      
      <div className="w-64 h-2 bg-gray-800 rounded-full overflow-hidden mb-4">
        <motion.div 
          className="h-full bg-gradient-to-r from-red-700 to-red-500"
          initial={{ width: '0%' }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.2 }}
        />
      </div>
      
      <p className="text-gray-500">{Math.round(progress)}%</p>
      
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ 
          opacity: [0.5, 1, 0.5], 
          y: [0, -5, 0]
        }}
        transition={{ 
          duration: 2, 
          repeat: Infinity,
          repeatType: "loop"
        }}
        className="absolute bottom-8 text-sm text-gray-500"
      >
        "I am a ghoul." - Kaneki Ken
      </motion.div>
    </div>
  );
}
