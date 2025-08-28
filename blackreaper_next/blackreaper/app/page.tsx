"use client";
import { Button as HeroUIButton } from "@heroui/react";
import { Button } from "../components/ui-button";
import { Input } from "../components/ui-input";
import { Card } from "../components/ui-card";
import { Avatar } from "../components/ui-avatar";
import { Toast } from "../components/ui-toast";
import { Modal } from "../components/ui-modal";
import { Switch } from "../components/ui-switch";
import { Tabs } from "../components/ui-tabs";
import Link from "next/link";
import { motion, AnimatePresence, useScroll, useTransform } from "framer-motion";
import * as React from "react";
import Image from "next/image";
import { useRef } from "react";

// Animation variants
const fadeIn = {
  hidden: { opacity: 0, y: 20 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { duration: 0.6 }
  }
};

const shimmer = {
  hidden: { backgroundPosition: '200% 0', opacity: 0.5 },
  visible: { 
    backgroundPosition: '0% 0', 
    opacity: 1,
    transition: { 
      duration: 1.5,
      repeat: Infinity,
      repeatType: "mirror"
    }
  }
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.2,
      delayChildren: 0.1
    }
  }
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

const shimmer = {
  hidden: { backgroundPosition: "200% 0" },
  visible: { 
    backgroundPosition: "-200% 0",
    transition: { 
      repeat: Infinity,
      repeatType: "mirror",
      duration: 3
    }
  }
};

export default function LandingPage() {
  const [showModal, setShowModal] = React.useState(false);
  const [showToast, setShowToast] = React.useState(false);
  const [switchOn, setSwitchOn] = React.useState(false);
  const [activeTab, setActiveTab] = React.useState(0);
  const [activeMode, setActiveMode] = React.useState<'none' | 'human' | 'ghoul'>('none');
  
  // Scroll-based animations
  const containerRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"]
  });
  
  const headerOpacity = useTransform(scrollYProgress, [0, 0.2], [1, 0.3]);
  const headerScale = useTransform(scrollYProgress, [0, 0.2], [1, 0.95]);

  return (
    <div className="min-h-screen bg-black text-white flex flex-col relative overflow-hidden" ref={containerRef}>
      {/* Dynamic Animated Background */}
      <div className="fixed inset-0 z-0">
        <motion.div 
          className="absolute inset-0 bg-black"
          initial={{ opacity: 1 }}
          animate={{ opacity: 1 }}
        />
        
        {/* Kagune-inspired animated patterns */}
        <motion.div 
          className="absolute top-0 right-0 w-full h-full opacity-40"
          initial={{ backgroundPosition: "0% 0%" }}
          animate={{ backgroundPosition: "100% 100%" }}
          transition={{ duration: 20, repeat: Infinity, repeatType: "reverse" }}
          style={{ 
            background: "radial-gradient(circle at 70% 20%, #ff0055 0%, transparent 40%), radial-gradient(circle at 30% 50%, #ff0055 0%, transparent 30%)",
            filter: "blur(60px)"
          }}
        />
        
        {/* Quinque-inspired CCG patterns */}
        <motion.div 
          className="absolute bottom-0 left-0 w-full h-full opacity-40"
          initial={{ backgroundPosition: "100% 100%" }}
          animate={{ backgroundPosition: "0% 0%" }}
          transition={{ duration: 15, repeat: Infinity, repeatType: "reverse" }}
          style={{ 
            background: "radial-gradient(circle at 30% 80%, #3a86ff 0%, transparent 40%), radial-gradient(circle at 70% 60%, #3a86ff 0%, transparent 30%)",
            filter: "blur(60px)"
          }}
        />
        
        {/* Grid overlay with subtle animation */}
        <motion.div 
          className="absolute inset-0 opacity-20"
          initial={{ opacity: 0.1 }}
          animate={{ opacity: 0.2 }}
          transition={{ duration: 5, repeat: Infinity, repeatType: "reverse" }}
          style={{
            backgroundImage: "linear-gradient(to right, #ffffff10 1px, transparent 1px), linear-gradient(to bottom, #ffffff10 1px, transparent 1px)",
            backgroundSize: "50px 50px"
          }}
        />
        
        {/* Additional atmosphere effects */}
        <div className="absolute inset-0 mix-blend-overlay opacity-30" 
          style={{ 
            backgroundImage: "url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPjxkZWZzPjxwYXR0ZXJuIGlkPSJwYXR0ZXJuIiB4PSIwIiB5PSIwIiB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHBhdHRlcm5Vbml0cz0idXNlclNwYWNlT25Vc2UiIHBhdHRlcm5UcmFuc2Zvcm09InJvdGF0ZSgzMCkiPjxyZWN0IHg9IjE5IiB5PSIwIiB3aWR0aD0iMiIgaGVpZ2h0PSI0MCIgZmlsbD0iIzQwNDA0MCIvPjwvcGF0dGVybj48L2RlZnM+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0idXJsKCNwYXR0ZXJuKSIvPjwvc3ZnPg==')"
          }}
        />
      </div>
      
      {/* Hero Section with Parallax Effect */}
      <motion.header 
        className="relative pt-24 pb-16 md:pt-32 md:pb-24 z-10 overflow-hidden"
        style={{ 
          opacity: headerOpacity,
          scale: headerScale
        }}
      >
        {/* Ambient background glow */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1 }}
          className="absolute inset-0 z-0 pointer-events-none opacity-70"
          style={{
            background: "radial-gradient(circle at center, rgba(255,255,255,0.1) 0%, transparent 70%)",
          }}
        />
        
        <div className="container mx-auto px-6 relative z-10">
          <motion.div 
            variants={staggerContainer}
            initial="hidden"
            animate="visible"
            className="flex flex-col items-center"
          >
            {/* Logo with kagune effects */}
            <motion.div 
              variants={fadeIn}
              className="mb-6 relative"
              whileHover={{ scale: 1.05 }}
            >
              <div className="absolute -inset-2 rounded-full bg-gradient-to-r from-red-500/30 to-blue-500/30 blur-md animate-pulse" />
              <Avatar 
                src="/globe.svg" 
                size={100} 
                className="border-4 border-gradient-to-r from-red-500/50 to-blue-500/50 shadow-lg shadow-red-500/30 relative z-10" 
              />
              
              {/* Kagune-like tendrils radiating from logo */}
              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-0 w-32 h-32">
                <motion.div 
                  className="absolute w-1 h-16 bg-gradient-to-t from-red-500/0 to-red-500/70 rounded-full blur-sm" 
                  style={{ left: '50%', top: '100%', transformOrigin: 'top', transform: 'rotate(30deg)' }}
                  animate={{ scaleY: [1, 1.2, 1], opacity: [1, 0.7, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                />
                <motion.div 
                  className="absolute w-1 h-14 bg-gradient-to-t from-blue-500/0 to-blue-500/70 rounded-full blur-sm" 
                  style={{ left: '50%', top: '100%', transformOrigin: 'top', transform: 'rotate(-40deg)' }}
                  animate={{ scaleY: [1, 1.3, 1], opacity: [1, 0.6, 1] }}
                  transition={{ duration: 2.5, repeat: Infinity, delay: 0.5 }}
                />
                <motion.div 
                  className="absolute w-1 h-12 bg-gradient-to-t from-purple-500/0 to-purple-500/70 rounded-full blur-sm" 
                  style={{ left: '50%', top: '100%', transformOrigin: 'top', transform: 'rotate(80deg)' }}
                  animate={{ scaleY: [1, 1.4, 1], opacity: [1, 0.5, 1] }}
                  transition={{ duration: 3, repeat: Infinity, delay: 0.7 }}
                />
              </div>
            </motion.div>
            
            {/* Title with enhanced text effects */}
            <motion.h1 
              variants={shimmer}
              initial="hidden"
              animate="visible"
              className="text-6xl md:text-8xl font-black tracking-tighter text-center mb-6 leading-none relative"
            >
              <span
                className="absolute inset-0 blur-xl opacity-50"
                style={{
                  backgroundClip: "text",
                  WebkitBackgroundClip: "text",
                  color: "transparent",
                  backgroundImage: "linear-gradient(90deg, #ffffff30, #ff005530, #3a86ff30, #ffffff30)",
                  backgroundSize: "200% auto",
                  transform: "translateY(2px) scale(1.05)"
                }}
              >
                BlackReaper
              </span>
              <span
                className="relative z-10"
                style={{
                  backgroundClip: "text",
                  WebkitBackgroundClip: "text",
                  color: "transparent",
                  backgroundImage: "linear-gradient(90deg, #ffffff, #ff0055, #3a86ff, #ffffff)",
                  backgroundSize: "200% auto",
                }}
              >
                BlackReaper
              </span>
            </motion.h1>
            
            <motion.p 
              variants={fadeIn}
              className="text-xl md:text-2xl text-gray-300 text-center max-w-3xl mb-10 leading-relaxed"
            >
              Harness the power of the <span className="text-red-400">Kagune</span> and 
              <span className="text-blue-400"> Quinque</span> to enhance your productivity. 
              Will you embrace humanity or unleash your inner ghoul?
            </motion.p>
          </motion.div>
        </div>
      </motion.header>

      {/* Main CTA Buttons with kagune-inspired effects */}
      <div className="flex flex-wrap gap-6 justify-center pb-24 px-4">
        <Link href="/auth?mode=human">
          <div className="relative group">
            {/* Button glow effect */}
            <motion.div 
              className="absolute -inset-1 rounded-xl bg-gradient-to-r from-blue-600/30 to-blue-400/30 blur-md group-hover:opacity-100 opacity-70 transition-opacity duration-300"
              animate={{ scale: [1, 1.05, 1] }}
              transition={{ duration: 3, repeat: Infinity }}
            />
            <Button 
              variant="default" 
              className="text-lg px-10 py-7 bg-gradient-to-r from-blue-800 to-blue-600 hover:from-blue-700 hover:to-blue-500 text-white shadow-lg shadow-blue-700/30 rounded-xl relative z-10 overflow-hidden"
              onClick={() => setActiveMode('human')}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-blue-400/10 to-transparent -skew-x-12 -translate-x-full group-hover:animate-shimmer" />
              <span className="relative z-10 flex items-center">
                <span className="mr-3">👮‍♂️</span>
                Join as Human Investigator
              </span>
            </Button>
          </div>
        </Link>
        <Link href="/auth?mode=ghoul">
          <div className="relative group">
            {/* Button glow effect */}
            <motion.div 
              className="absolute -inset-1 rounded-xl bg-gradient-to-r from-red-600/30 to-red-400/30 blur-md group-hover:opacity-100 opacity-70 transition-opacity duration-300"
              animate={{ scale: [1, 1.05, 1] }}
              transition={{ duration: 3, repeat: Infinity, delay: 1.5 }}
            />
            <Button 
              variant="default" 
              className="text-lg px-10 py-7 bg-gradient-to-r from-red-800 to-red-600 hover:from-red-700 hover:to-red-500 text-white shadow-lg shadow-red-700/30 rounded-xl relative z-10 overflow-hidden"
              onClick={() => setActiveMode('ghoul')}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-red-400/10 to-transparent -skew-x-12 -translate-x-full group-hover:animate-shimmer" />
              <span className="relative z-10 flex items-center">
                <span className="mr-3">👹</span>
                Join as Ghoul
              </span>
            </Button>
          </div>
        </Link>
      </div>
      
      {/* Feature Section with RC cell animation */}
      <motion.section
        variants={staggerContainer}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.2 }}
        className="py-20 z-10 relative"
      >
        {/* Animated RC Cells floating in background */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute w-full h-full">
            {[...Array(20)].map((_, i) => (
              <motion.div
                key={i}
                className={`absolute rounded-full ${i % 2 === 0 ? 'bg-red-500' : 'bg-blue-500'}`}
                style={{
                  width: `${Math.random() * 10 + 3}px`,
                  height: `${Math.random() * 10 + 3}px`,
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`,
                  opacity: 0.3,
                  filter: 'blur(1px)'
                }}
                animate={{
                  y: [Math.random() * -100, Math.random() * 100],
                  x: [Math.random() * -50, Math.random() * 50],
                  opacity: [0.2, 0.6, 0.2],
                }}
                transition={{
                  duration: Math.random() * 10 + 15,
                  repeat: Infinity,
                  repeatType: 'reverse'
                }}
              />
            ))}
          </div>
        </div>
        
        <div className="container mx-auto px-6">
          <motion.div 
            className="relative mb-16 w-fit mx-auto"
            variants={fadeIn}
          >
            <h2 className="text-4xl md:text-5xl font-bold text-center relative z-10 text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-purple-400 to-red-400">
              The Ultimate Dual System
            </h2>
            <div className="absolute -inset-x-6 -inset-y-2 bg-gradient-to-r from-blue-500/10 via-purple-500/10 to-red-500/10 rounded-lg blur-xl z-0"></div>
          </motion.div>
          
          {/* Feature Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto relative">
            {/* Feature 1: Pomodoro Timer */}
            <motion.div
              variants={fadeIn}
              whileHover={{ scale: 1.03, y: -5 }}
              className="group relative overflow-hidden rounded-2xl"
            >
              {/* Card background with interactivity */}
              <div className="absolute inset-0 bg-gradient-to-br from-blue-900/40 to-blue-700/20 -z-10 backdrop-blur-xl border border-blue-500/30" />
              <div className="absolute inset-0 bg-gradient-to-br from-blue-600/0 to-blue-400/0 group-hover:from-blue-600/20 group-hover:to-blue-400/10 transition-all duration-300 -z-10" />
              
              <div className="p-8 md:p-10 h-full flex flex-col">
                {/* Icon with animation */}
                <div className="relative">
                  <motion.div 
                    className="absolute -inset-2 rounded-full bg-blue-500/20 blur-md" 
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ duration: 3, repeat: Infinity }}
                  />
                  <div className="w-16 h-16 rounded-full flex items-center justify-center bg-gradient-to-br from-blue-700 to-blue-500 mb-6 shadow-lg shadow-blue-500/30 relative z-10 border border-blue-400/50">
                    <span className="text-3xl">⏰</span>
                  </div>
                </div>
                
                <h3 className="text-2xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-blue-200">Pomodoro Timer</h3>
                
                <p className="text-gray-300 mb-6">
                  Focus like a CCG investigator with timed work sessions. Each completed Pomodoro earns you RC Cells to level up your rank and abilities.
                </p>
                
                {/* Feature bullet points with icons */}
                <ul className="mb-6 space-y-3">
                  <li className="flex items-center text-blue-200/90 text-sm">
                    <div className="w-5 h-5 rounded-full bg-blue-500/20 flex items-center justify-center mr-2">
                      <span className="text-blue-300 text-xs">✓</span>
                    </div>
                    Customizable focus intervals
                  </li>
                  <li className="flex items-center text-blue-200/90 text-sm">
                    <div className="w-5 h-5 rounded-full bg-blue-500/20 flex items-center justify-center mr-2">
                      <span className="text-blue-300 text-xs">✓</span>
                    </div>
                    RC Cell reward system
                  </li>
                  <li className="flex items-center text-blue-200/90 text-sm">
                    <div className="w-5 h-5 rounded-full bg-blue-500/20 flex items-center justify-center mr-2">
                      <span className="text-blue-300 text-xs">✓</span>
                    </div>
                    Focus-streak multipliers
                  </li>
                </ul>
                
                <div className="mt-auto pt-4">
                  <div className="h-1 w-full bg-gradient-to-r from-blue-500/80 to-blue-300/80 rounded-full" />
                </div>
              </div>
            </motion.div>
            
            {/* Feature 2: Kagune Battles */}
            <motion.div
              variants={fadeIn}
              whileHover={{ scale: 1.03, y: -5 }}
              className="group relative overflow-hidden rounded-2xl"
            >
              {/* Card background with interactivity */}
              <div className="absolute inset-0 bg-gradient-to-br from-red-900/40 to-red-700/20 -z-10 backdrop-blur-xl border border-red-500/30" />
              <div className="absolute inset-0 bg-gradient-to-br from-red-600/0 to-red-400/0 group-hover:from-red-600/20 group-hover:to-red-400/10 transition-all duration-300 -z-10" />
              
              <div className="p-8 md:p-10 h-full flex flex-col">
                {/* Icon with animation */}
                <div className="relative">
                  <motion.div 
                    className="absolute -inset-2 rounded-full bg-red-500/20 blur-md" 
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ duration: 3, repeat: Infinity, delay: 1 }}
                  />
                  <div className="w-16 h-16 rounded-full flex items-center justify-center bg-gradient-to-br from-red-700 to-red-500 mb-6 shadow-lg shadow-red-500/30 relative z-10 border border-red-400/50">
                    <span className="text-3xl">⚔️</span>
                  </div>
                </div>
                
                <h3 className="text-2xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-red-400 to-red-200">Kagune Battles</h3>
                
                <p className="text-gray-300 mb-6">
                  Deploy your kagune in strategic battles against other ghouls. Develop unique abilities, earn RC cells, and climb the ward hierarchy.
                </p>
                
                {/* Feature bullet points with icons */}
                <ul className="mb-6 space-y-3">
                  <li className="flex items-center text-red-200/90 text-sm">
                    <div className="w-5 h-5 rounded-full bg-red-500/20 flex items-center justify-center mr-2">
                      <span className="text-red-300 text-xs">✓</span>
                    </div>
                    Unique kagune evolution system
                  </li>
                  <li className="flex items-center text-red-200/90 text-sm">
                    <div className="w-5 h-5 rounded-full bg-red-500/20 flex items-center justify-center mr-2">
                      <span className="text-red-300 text-xs">✓</span>
                    </div>
                    RC Cell combat rewards
                  </li>
                  <li className="flex items-center text-red-200/90 text-sm">
                    <div className="w-5 h-5 rounded-full bg-red-500/20 flex items-center justify-center mr-2">
                      <span className="text-red-300 text-xs">✓</span>
                    </div>
                    Ward territory control
                  </li>
                </ul>
                
                <div className="mt-auto pt-4">
                  <div className="h-1 w-full bg-gradient-to-r from-red-500/80 to-red-300/80 rounded-full" />
                </div>
              </div>
            </motion.div>
            
            {/* Feature 3: Task Management */}
            <motion.div
              variants={fadeIn}
              whileHover={{ scale: 1.03, y: -5 }}
              className="group relative overflow-hidden rounded-2xl"
            >
              {/* Card background with interactivity */}
              <div className="absolute inset-0 bg-gradient-to-br from-purple-900/40 to-purple-700/20 -z-10 backdrop-blur-xl border border-purple-500/30" />
              <div className="absolute inset-0 bg-gradient-to-br from-purple-600/0 to-purple-400/0 group-hover:from-purple-600/20 group-hover:to-purple-400/10 transition-all duration-300 -z-10" />
              
              <div className="p-8 md:p-10 h-full flex flex-col">
                {/* Icon with animation */}
                <div className="relative">
                  <motion.div 
                    className="absolute -inset-2 rounded-full bg-purple-500/20 blur-md" 
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ duration: 3, repeat: Infinity, delay: 2 }}
                  />
                  <div className="w-16 h-16 rounded-full flex items-center justify-center bg-gradient-to-br from-purple-700 to-purple-500 mb-6 shadow-lg shadow-purple-500/30 relative z-10 border border-purple-400/50">
                    <span className="text-3xl">📊</span>
                  </div>
                </div>
                
                <h3 className="text-2xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-purple-200">Task Management</h3>
                
                <p className="text-gray-300 mb-6">
                  Organize missions and objectives like a true strategist. Track progress and manage your investigator journal or ghoul activities.
                </p>
                
                {/* Feature bullet points with icons */}
                <ul className="mb-6 space-y-3">
                  <li className="flex items-center text-purple-200/90 text-sm">
                    <div className="w-5 h-5 rounded-full bg-purple-500/20 flex items-center justify-center mr-2">
                      <span className="text-purple-300 text-xs">✓</span>
                    </div>
                    Mission tracking system
                  </li>
                  <li className="flex items-center text-purple-200/90 text-sm">
                    <div className="w-5 h-5 rounded-full bg-purple-500/20 flex items-center justify-center mr-2">
                      <span className="text-purple-300 text-xs">✓</span>
                    </div>
                    Personal progress journal
                  </li>
                  <li className="flex items-center text-purple-200/90 text-sm">
                    <div className="w-5 h-5 rounded-full bg-purple-500/20 flex items-center justify-center mr-2">
                      <span className="text-purple-300 text-xs">✓</span>
                    </div>
                    Achievement milestones
                  </li>
                </ul>
                
                <div className="mt-auto pt-4">
                  <div className="h-1 w-full bg-gradient-to-r from-purple-500/80 to-purple-300/80 rounded-full" />
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </motion.section>      {/* Feature Section */}
      <motion.section
        variants={staggerContainer}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.3 }}
        className="py-20 z-10 relative bg-gradient-to-b from-black/0 via-black/80 to-black/0"
      >
        <div className="container mx-auto px-6">
          <motion.h2 
            variants={fadeIn}
            className="text-4xl md:text-5xl font-bold text-center mb-16 text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-red-400"
          >
            Dual-Mode Productivity
          </motion.h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            <motion.div
              variants={fadeIn}
              whileHover={{ scale: 1.05, y: -10 }}
              className="relative overflow-hidden rounded-2xl"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-blue-900/30 to-blue-700/10 -z-10 backdrop-blur-xl border border-blue-500/20" />
              <div className="p-8 h-full flex flex-col">
                <div className="w-16 h-16 rounded-full flex items-center justify-center bg-blue-900/50 border-2 border-blue-400/30 mb-6 shadow-lg shadow-blue-500/20">
                  <span className="text-3xl">⏰</span>
                </div>
                <h3 className="text-2xl font-bold mb-4 text-blue-300">Pomodoro Timer</h3>
                <p className="text-gray-300">
                  Boost productivity with timed focus sessions and earn RC Cells for every completed task. Build your reputation as a skilled investigator.
                </p>
                <div className="mt-auto pt-6">
                  <div className="h-1 w-full bg-gradient-to-r from-blue-500 to-blue-300 rounded-full" />
                </div>
              </div>
            </motion.div>
            
            <motion.div
              variants={fadeIn}
              whileHover={{ scale: 1.05, y: -10 }}
              className="relative overflow-hidden rounded-2xl"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-red-900/30 to-red-700/10 -z-10 backdrop-blur-xl border border-red-500/20" />
              <div className="p-8 h-full flex flex-col">
                <div className="w-16 h-16 rounded-full flex items-center justify-center bg-red-900/50 border-2 border-red-400/30 mb-6 shadow-lg shadow-red-500/20">
                  <span className="text-3xl">⚔️</span>
                </div>
                <h3 className="text-2xl font-bold mb-4 text-red-300">Kagune Battles</h3>
                <p className="text-gray-300">
                  Battle in Kagune arenas, earn RC rewards, and dominate the underworld. Develop your unique kagune abilities and rise to power.
                </p>
                <div className="mt-auto pt-6">
                  <div className="h-1 w-full bg-gradient-to-r from-red-500 to-red-300 rounded-full" />
                </div>
              </div>
            </motion.div>
            
            <motion.div
              variants={fadeIn}
              whileHover={{ scale: 1.05, y: -10 }}
              className="relative overflow-hidden rounded-2xl"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-purple-900/30 to-purple-700/10 -z-10 backdrop-blur-xl border border-purple-500/20" />
              <div className="p-8 h-full flex flex-col">
                <div className="w-16 h-16 rounded-full flex items-center justify-center bg-purple-900/50 border-2 border-purple-400/30 mb-6 shadow-lg shadow-purple-500/20">
                  <span className="text-3xl">📈</span>
                </div>
                <h3 className="text-2xl font-bold mb-4 text-purple-300">Leaderboards & Stats</h3>
                <p className="text-gray-300">
                  Track your progress, climb the ranks, and become a legend in Tokyo's underground world. Compare stats with friends and rivals.
                </p>
                <div className="mt-auto pt-6">
                  <div className="h-1 w-full bg-gradient-to-r from-purple-500 to-purple-300 rounded-full" />
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </motion.section>

      {/* How It Works Section */}
      <motion.section
        variants={staggerContainer}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.3 }}
        className="py-24 z-10 relative"
      >
        {/* Background elements - kagune shapes */}
        <div className="absolute inset-0 overflow-hidden">
          <motion.div 
            className="absolute w-96 h-96 rounded-full bg-gradient-to-r from-red-600/5 to-red-400/10 blur-3xl"
            style={{ top: '10%', right: '5%' }}
            animate={{ scale: [1, 1.1, 1], opacity: [0.3, 0.4, 0.3] }}
            transition={{ duration: 8, repeat: Infinity }}
          />
          <motion.div 
            className="absolute w-96 h-96 rounded-full bg-gradient-to-r from-blue-600/5 to-blue-400/10 blur-3xl"
            style={{ bottom: '10%', left: '5%' }}
            animate={{ scale: [1, 1.1, 1], opacity: [0.3, 0.4, 0.3] }}
            transition={{ duration: 8, repeat: Infinity, delay: 4 }}
          />
        </div>
        
        <div className="container mx-auto px-6">
          <motion.div 
            className="flex flex-col items-center mb-16"
            variants={fadeIn}
          >
            <span className="px-4 py-1 bg-white/5 rounded-full text-sm text-blue-300 border border-blue-500/20 mb-4">
              SIMPLE PROCESS
            </span>
            <h2 className="text-4xl md:text-5xl font-bold text-center mb-6 text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-purple-400 to-red-400">
              The BlackReaper Methodology
            </h2>
            <p className="text-xl text-gray-400 text-center max-w-3xl">
              A unique approach to productivity inspired by the duality of Tokyo Ghoul's universe
            </p>
          </motion.div>
          
          {/* Process Steps with connecting lines */}
          <div className="relative max-w-5xl mx-auto">
            {/* Connecting line */}
            <div className="absolute left-1/2 top-24 bottom-24 w-0.5 bg-gradient-to-b from-blue-500/30 via-purple-500/30 to-red-500/30 hidden md:block" />
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-y-16 md:gap-x-12">
              {/* Step 1 */}
              <motion.div 
                variants={fadeIn}
                className="relative z-10 md:col-span-3 md:w-1/3"
              >
                <div className="absolute left-1/2 md:left-full top-20 -translate-x-1/2 md:-translate-x-4 w-12 h-12 rounded-full bg-gradient-to-r from-blue-600/30 to-blue-400/30 backdrop-blur-sm border border-blue-400/30 flex items-center justify-center z-10">
                  <div className="w-6 h-6 rounded-full bg-blue-500 flex items-center justify-center">
                    <span className="text-xs font-bold">1</span>
                  </div>
                </div>
                
                <div className="bg-gradient-to-br from-blue-900/30 to-blue-800/10 backdrop-blur-sm border border-blue-500/20 rounded-xl p-8 relative">
                  <div className="absolute -inset-px rounded-xl bg-gradient-to-r from-blue-500/20 to-transparent opacity-0 hover:opacity-100 transition-opacity duration-300" />
                  
                  <div className="w-20 h-20 rounded-full flex items-center justify-center bg-gradient-to-br from-blue-700 to-blue-500 mb-6 shadow-lg border border-blue-400/50">
                    <span className="text-4xl">⏱️</span>
                  </div>
                  
                  <h3 className="text-2xl font-bold mb-4 text-blue-300">Focus with Pomodoro</h3>
                  
                  <p className="text-gray-300">
                    Enter focus mode with our custom Pomodoro timer. Each completed session generates RC Cells - the vital resource in our ecosystem.
                  </p>
                  
                  <ul className="mt-6 space-y-2 text-sm text-blue-100/80">
                    <li className="flex items-center">
                      <span className="mr-2 text-blue-400">→</span>
                      Customizable work intervals (25-50 mins)
                    </li>
                    <li className="flex items-center">
                      <span className="mr-2 text-blue-400">→</span>
                      Audio notifications with kagune sounds
                    </li>
                    <li className="flex items-center">
                      <span className="mr-2 text-blue-400">→</span>
                      Focus analytics track your progress
                    </li>
                  </ul>
                </div>
              </motion.div>
              
              {/* Step 2 */}
              <motion.div 
                variants={fadeIn}
                className="relative z-10 md:col-span-3 md:w-1/3 md:ml-auto"
              >
                <div className="absolute left-1/2 md:left-0 top-20 -translate-x-1/2 md:translate-x-4 w-12 h-12 rounded-full bg-gradient-to-r from-purple-600/30 to-purple-400/30 backdrop-blur-sm border border-purple-400/30 flex items-center justify-center z-10">
                  <div className="w-6 h-6 rounded-full bg-purple-500 flex items-center justify-center">
                    <span className="text-xs font-bold">2</span>
                  </div>
                </div>
                
                <div className="bg-gradient-to-br from-purple-900/30 to-purple-800/10 backdrop-blur-sm border border-purple-500/20 rounded-xl p-8 relative">
                  <div className="absolute -inset-px rounded-xl bg-gradient-to-r from-purple-500/20 to-transparent opacity-0 hover:opacity-100 transition-opacity duration-300" />
                  
                  <div className="w-20 h-20 rounded-full flex items-center justify-center bg-gradient-to-br from-purple-700 to-purple-500 mb-6 shadow-lg border border-purple-400/50">
                    <span className="text-4xl">🔄</span>
                  </div>
                  
                  <h3 className="text-2xl font-bold mb-4 text-purple-300">Harvest RC Cells</h3>
                  
                  <p className="text-gray-300">
                    RC Cells are your currency for growth and combat. Collect them through completed tasks, daily streaks, and special achievements.
                  </p>
                  
                  <ul className="mt-6 space-y-2 text-sm text-purple-100/80">
                    <li className="flex items-center">
                      <span className="mr-2 text-purple-400">→</span>
                      RC Cell bank tracks your resources
                    </li>
                    <li className="flex items-center">
                      <span className="mr-2 text-purple-400">→</span>
                      Streak multipliers increase earnings
                    </li>
                    <li className="flex items-center">
                      <span className="mr-2 text-purple-400">→</span>
                      Special events for bonus RC rewards
                    </li>
                  </ul>
                </div>
              </motion.div>
              
              {/* Step 3 */}
              <motion.div 
                variants={fadeIn}
                className="relative z-10 md:col-span-3 md:w-1/3"
              >
                <div className="absolute left-1/2 md:left-full top-20 -translate-x-1/2 md:-translate-x-4 w-12 h-12 rounded-full bg-gradient-to-r from-red-600/30 to-red-400/30 backdrop-blur-sm border border-red-400/30 flex items-center justify-center z-10">
                  <div className="w-6 h-6 rounded-full bg-red-500 flex items-center justify-center">
                    <span className="text-xs font-bold">3</span>
                  </div>
                </div>
                
                <div className="bg-gradient-to-br from-red-900/30 to-red-800/10 backdrop-blur-sm border border-red-500/20 rounded-xl p-8 relative">
                  <div className="absolute -inset-px rounded-xl bg-gradient-to-r from-red-500/20 to-transparent opacity-0 hover:opacity-100 transition-opacity duration-300" />
                  
                  <div className="w-20 h-20 rounded-full flex items-center justify-center bg-gradient-to-br from-red-700 to-red-500 mb-6 shadow-lg border border-red-400/50">
                    <span className="text-4xl">⚔️</span>
                  </div>
                  
                  <h3 className="text-2xl font-bold mb-4 text-red-300">Battle & Evolve</h3>
                  
                  <p className="text-gray-300">
                    Invest RC Cells to enhance your abilities or enter Kagune battles. Climb the ranks in your chosen path - human or ghoul.
                  </p>
                  
                  <ul className="mt-6 space-y-2 text-sm text-red-100/80">
                    <li className="flex items-center">
                      <span className="mr-2 text-red-400">→</span>
                      Strategic kagune combat system
                    </li>
                    <li className="flex items-center">
                      <span className="mr-2 text-red-400">→</span>
                      Quinque and kagune upgrades
                    </li>
                    <li className="flex items-center">
                      <span className="mr-2 text-red-400">→</span>
                      RC-based rank progression
                    </li>
                  </ul>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </motion.section>
      
      {/* Interface Preview Section */}
      <section className="w-full max-w-6xl mx-auto py-16 z-10 px-4">
        {/* Section header with animated elements */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <span className="px-4 py-1 bg-white/5 rounded-full text-sm text-purple-300 border border-purple-500/20 inline-block mb-4">
            INTERFACE PREVIEW
          </span>
          <h2 className="text-3xl md:text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-300 via-purple-300 to-red-300 mb-4">
            Experience The BlackReaper Interface
          </h2>
          <p className="text-gray-400 max-w-2xl mx-auto text-lg">
            Get a taste of our Tokyo Ghoul-inspired productivity interface with RC cell rewards and kagune integration
          </p>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="relative"
        >
          {/* Glow effects for the card */}
          <div className="absolute -inset-1 bg-gradient-to-r from-blue-600/30 via-purple-600/30 to-red-600/30 rounded-2xl blur-lg opacity-50 group-hover:opacity-100 transition-all duration-300"></div>
          
          <Card className="mb-8 backdrop-blur-xl bg-black/40 border border-white/10 shadow-2xl overflow-hidden relative">
            {/* Background elements */}
            <div className="absolute inset-0 z-0 opacity-10 pointer-events-none">
              <div className="absolute inset-0" style={{ 
                backgroundImage: "url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48Y2lyY2xlIGN4PSIyMCIgY3k9IjIwIiByPSIxIiBmaWxsPSJyZ2JhKDI1NSwgMjU1LCAyNTUsIDAuMilcIiAvPjwvc3ZnPg==')",
                backgroundSize: "40px 40px"
              }}></div>
            </div>
            
            <div className="p-8 md:p-10 relative z-10">
              <div className="flex items-center gap-4 mb-8">
                <div className="h-10 w-10 rounded-full bg-gradient-to-r from-red-500 to-red-700 flex items-center justify-center shadow-lg shadow-red-500/20">
                  <span className="text-lg">👁️</span>
                </div>
                <h3 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-red-300 to-red-100">
                  Kagune Dashboard Demo
                </h3>
              </div>
              
              <Tabs tabs={["Overview", "Features", "Interactive Demo"]} active={activeTab} onTabChange={setActiveTab} />
              
              <div className="mt-8">
                {activeTab === 0 && (
                  <div className="space-y-6">
                    <p className="text-gray-300 text-lg">
                      BlackReaper merges productivity with Tokyo Ghoul's dark aesthetic. Track your focus sessions, earn RC Cells, and evolve your abilities in either human or ghoul path.
                    </p>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-6">
                      <div className="bg-white/5 border border-white/10 rounded-lg p-4 flex items-center gap-3">
                        <div className="w-12 h-12 rounded-lg bg-blue-500/20 flex items-center justify-center text-blue-300">
                          <span className="text-xl">⏱️</span>
                        </div>
                        <div>
                          <h4 className="font-medium text-blue-200">Focus Timer</h4>
                          <p className="text-xs text-gray-400">Earn RC cells by focusing</p>
                        </div>
                      </div>
                      
                      <div className="bg-white/5 border border-white/10 rounded-lg p-4 flex items-center gap-3">
                        <div className="w-12 h-12 rounded-lg bg-red-500/20 flex items-center justify-center text-red-300">
                          <span className="text-xl">🗡️</span>
                        </div>
                        <div>
                          <h4 className="font-medium text-red-200">Battle System</h4>
                          <p className="text-xs text-gray-400">Strategic kagune combat</p>
                        </div>
                      </div>
                      
                      <div className="bg-white/5 border border-white/10 rounded-lg p-4 flex items-center gap-3">
                        <div className="w-12 h-12 rounded-lg bg-purple-500/20 flex items-center justify-center text-purple-300">
                          <span className="text-xl">📊</span>
                        </div>
                        <div>
                          <h4 className="font-medium text-purple-200">Progress Tracking</h4>
                          <p className="text-xs text-gray-400">Monitor your evolution</p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="pt-4 flex gap-4">
                      <Button onClick={() => setActiveTab(2)} variant="default" className="bg-gradient-to-r from-red-600 to-red-500">
                        Try Interactive Demo
                      </Button>
                      <Button onClick={() => setActiveTab(1)} variant="outline">
                        See Full Features
                      </Button>
                    </div>
                  </div>
                )}
                
                {activeTab === 1 && (
                  <div className="space-y-8">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                      {/* CCG Path */}
                      <div className="space-y-4">
                        <div className="flex items-center gap-3 mb-2">
                          <div className="h-8 w-8 rounded-full bg-blue-500/30 flex items-center justify-center">
                            <span className="text-sm">👮‍♂️</span>
                          </div>
                          <h4 className="text-lg font-bold text-blue-300">CCG Investigator Path</h4>
                        </div>
                        
                        <div className="bg-gradient-to-br from-blue-900/30 to-blue-800/10 backdrop-blur-sm border border-blue-500/20 rounded-lg p-4">
                          <ul className="text-gray-300 space-y-3">
                            <li className="flex items-start">
                              <span className="text-blue-400 mr-2 mt-1">✓</span>
                              <div>
                                <span className="font-medium">Pomodoro Timer</span>
                                <p className="text-xs text-gray-400 mt-0.5">Focused work sessions with quinque-inspired rewards</p>
                              </div>
                            </li>
                            <li className="flex items-start">
                              <span className="text-blue-400 mr-2 mt-1">✓</span>
                              <div>
                                <span className="font-medium">CCG Task Management</span>
                                <p className="text-xs text-gray-400 mt-0.5">Organize missions like a true investigator</p>
                              </div>
                            </li>
                            <li className="flex items-start">
                              <span className="text-blue-400 mr-2 mt-1">✓</span>
                              <div>
                                <span className="font-medium">Investigator Journal</span>
                                <p className="text-xs text-gray-400 mt-0.5">Document your progress and findings</p>
                              </div>
                            </li>
                            <li className="flex items-start">
                              <span className="text-blue-400 mr-2 mt-1">✓</span>
                              <div>
                                <span className="font-medium">CCG Rank Progression</span>
                                <p className="text-xs text-gray-400 mt-0.5">Climb from Rank 3 to Special Class</p>
                              </div>
                            </li>
                          </ul>
                        </div>
                      </div>
                      
                      {/* Ghoul Path */}
                      <div className="space-y-4">
                        <div className="flex items-center gap-3 mb-2">
                          <div className="h-8 w-8 rounded-full bg-red-500/30 flex items-center justify-center">
                            <span className="text-sm">👹</span>
                          </div>
                          <h4 className="text-lg font-bold text-red-300">Ghoul Path</h4>
                        </div>
                        
                        <div className="bg-gradient-to-br from-red-900/30 to-red-800/10 backdrop-blur-sm border border-red-500/20 rounded-lg p-4">
                          <ul className="text-gray-300 space-y-3">
                            <li className="flex items-start">
                              <span className="text-red-400 mr-2 mt-1">✓</span>
                              <div>
                                <span className="font-medium">Kagune Battle System</span>
                                <p className="text-xs text-gray-400 mt-0.5">Ukaku, Koukaku, Rinkaku, and Bikaku types</p>
                              </div>
                            </li>
                            <li className="flex items-start">
                              <span className="text-red-400 mr-2 mt-1">✓</span>
                              <div>
                                <span className="font-medium">RC Cell Management</span>
                                <p className="text-xs text-gray-400 mt-0.5">Earn and spend cells to evolve abilities</p>
                              </div>
                            </li>
                            <li className="flex items-start">
                              <span className="text-red-400 mr-2 mt-1">✓</span>
                              <div>
                                <span className="font-medium">Ward Territory Control</span>
                                <p className="text-xs text-gray-400 mt-0.5">Establish dominance in Tokyo's districts</p>
                              </div>
                            </li>
                            <li className="flex items-start">
                              <span className="text-red-400 mr-2 mt-1">✓</span>
                              <div>
                                <span className="font-medium">Ghoul Rating System</span>
                                <p className="text-xs text-gray-400 mt-0.5">Progress from C to SSS rating</p>
                              </div>
                            </li>
                          </ul>
                        </div>
                      </div>
                    </div>
                    
                    <div className="bg-gradient-to-br from-purple-900/30 to-purple-800/10 backdrop-blur-sm border border-purple-500/20 rounded-lg p-4">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="h-8 w-8 rounded-full bg-purple-500/30 flex items-center justify-center">
                          <span className="text-sm">🔄</span>
                        </div>
                        <h4 className="text-lg font-bold text-purple-300">Cross-Path Features</h4>
                      </div>
                      
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <ul className="text-gray-300 space-y-2">
                            <li className="flex items-center">
                              <span className="text-purple-400 mr-2">•</span>
                              <span>Shared RC Cell Economy</span>
                            </li>
                            <li className="flex items-center">
                              <span className="text-purple-400 mr-2">•</span>
                              <span>Global Leaderboards</span>
                            </li>
                          </ul>
                        </div>
                        <div>
                          <ul className="text-gray-300 space-y-2">
                            <li className="flex items-center">
                              <span className="text-purple-400 mr-2">•</span>
                              <span>Daily Ward Challenges</span>
                            </li>
                            <li className="flex items-center">
                              <span className="text-purple-400 mr-2">•</span>
                              <span>Detailed Analytics</span>
                            </li>
                          </ul>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
                
                {activeTab === 2 && (
                  <div className="space-y-8">
                    {/* Kagune/Quinque Mode Selector */}
                    <div className="bg-gradient-to-r from-black/60 to-black/40 border border-white/10 rounded-lg p-5">
                      <div className="flex flex-col sm:flex-row gap-6 items-center justify-between">
                        <div className="flex items-center gap-3">
                          <span className="text-sm font-medium text-gray-300">Mode:</span>
                          <div className="relative flex items-center">
                            <span className={`mr-2 text-sm ${switchOn ? 'text-gray-400' : 'text-blue-300 font-medium'}`}>
                              CCG Investigator
                            </span>
                            <Switch checked={switchOn} onChange={setSwitchOn} className="relative z-10" />
                            <span className={`ml-2 text-sm ${switchOn ? 'text-red-300 font-medium' : 'text-gray-400'}`}>
                              Ghoul
                            </span>
                            <div className="absolute inset-0 -z-10">
                              {switchOn ? (
                                <motion.div 
                                  initial={{ opacity: 0 }}
                                  animate={{ opacity: 1 }}
                                  exit={{ opacity: 0 }}
                                  className="absolute inset-0 bg-red-500/10 rounded-full blur-xl"
                                />
                              ) : (
                                <motion.div 
                                  initial={{ opacity: 0 }}
                                  animate={{ opacity: 1 }}
                                  exit={{ opacity: 0 }}
                                  className="absolute inset-0 bg-blue-500/10 rounded-full blur-xl"
                                />
                              )}
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-3">
                          <span className="text-sm text-gray-400">RC Cells:</span>
                          <div className="px-3 py-1 bg-gradient-to-r from-purple-900/50 to-purple-800/30 rounded-full border border-purple-500/20 text-purple-300 font-mono">
                            1,250
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    {/* Demo Interactive Elements */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                      {/* Timer Preview */}
                      <div className="bg-gradient-to-br from-black/60 to-black/40 border border-white/10 rounded-lg p-5 flex flex-col">
                        <h4 className="text-lg font-semibold text-gray-200 mb-4">Focus Timer</h4>
                        
                        <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-lg border border-white/5 p-6 flex flex-col items-center justify-center flex-1">
                          <div className="text-4xl font-mono font-bold mb-6 text-white">
                            25:00
                          </div>
                          
                          <div className="flex gap-3 items-center">
                            <Button 
                              variant="outline" 
                              className="rounded-full w-10 h-10 p-0 flex items-center justify-center text-sm"
                            >
                              ⏪
                            </Button>
                            <Button 
                              variant="default" 
                              className={`rounded-full px-6 py-4 ${!switchOn ? 'bg-blue-600 hover:bg-blue-700' : 'bg-red-600 hover:bg-red-700'}`}
                              onClick={() => setShowToast(true)}
                            >
                              Start Focus
                            </Button>
                            <Button 
                              variant="outline" 
                              className="rounded-full w-10 h-10 p-0 flex items-center justify-center text-sm"
                            >
                              ⏩
                            </Button>
                          </div>
                        </div>
                      </div>
                      
                      {/* Battle Preview */}
                      <div className="bg-gradient-to-br from-black/60 to-black/40 border border-white/10 rounded-lg p-5 flex flex-col">
                        <h4 className="text-lg font-semibold text-gray-200 mb-4">
                          {switchOn ? "Kagune Combat" : "Quinque Training"}
                        </h4>
                        
                        <div 
                          className={`bg-gradient-to-br rounded-lg border border-white/5 p-6 flex flex-col items-center justify-center flex-1 ${
                            switchOn 
                              ? "from-red-900/40 to-red-800/20 border-red-500/20" 
                              : "from-blue-900/40 to-blue-800/20 border-blue-500/20"
                          }`}
                        >
                          <div className="flex items-center justify-center mb-4">
                            <div className="text-6xl">
                              {switchOn ? "👹" : "👮‍♂️"}
                            </div>
                            <div className="text-4xl mx-4">⚔️</div>
                            <div className="text-6xl opacity-40">
                              {switchOn ? "👮‍♂️" : "👹"}
                            </div>
                          </div>
                          
                          <Button 
                            variant="default" 
                            className={`px-6 py-4 ${
                              switchOn 
                                ? "bg-red-600 hover:bg-red-700" 
                                : "bg-blue-600 hover:bg-blue-700"
                            }`}
                            onClick={() => setShowModal(true)}
                          >
                            {switchOn ? "Deploy Kagune" : "Ready Quinque"}
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </Card>
        </motion.div>
        
        {/* RC Cell Transaction Modal */}
        {showModal && (
          <Modal open={showModal} onClose={() => setShowModal(false)}>
            <div className="relative">
              {/* Background glow effect */}
              <div className={`absolute inset-0 rounded-lg opacity-30 blur-xl -z-10 ${
                switchOn 
                  ? "bg-gradient-to-br from-red-600/30 to-red-800/10" 
                  : "bg-gradient-to-br from-blue-600/30 to-blue-800/10"
              }`} />
              
              <h3 className="text-2xl font-bold mb-2">
                {switchOn ? "Kagune Evolution Available" : "Quinque Enhancement Ready"}
              </h3>
              
              <p className="text-gray-400 text-sm mb-4">RC Cell Balance: 1,250</p>
              
              <p className="text-gray-300 mb-6">
                {switchOn 
                  ? "Your kagune has reached evolution potential! Spend 500 RC Cells to evolve your abilities and increase your threat rating?" 
                  : "New quinque technology available! Spend 500 RC Cells to enhance your weapon and increase your investigator rank?"
                }
              </p>
              
              <div className="grid grid-cols-2 gap-4">
                <Button 
                  onClick={() => setShowModal(false)} 
                  variant="outline" 
                  className="w-full"
                >
                  Save RC Cells
                </Button>
                <Button 
                  onClick={() => {
                    setShowModal(false);
                    setShowToast(true);
                  }} 
                  variant="default" 
                  className={`w-full ${
                    switchOn 
                      ? "bg-gradient-to-r from-red-700 to-red-600 hover:from-red-800 hover:to-red-700" 
                      : "bg-gradient-to-r from-blue-700 to-blue-600 hover:from-blue-800 hover:to-blue-700"
                  }`}
                >
                  {switchOn ? "Evolve Kagune" : "Enhance Quinque"}
                </Button>
              </div>
            </div>
          </Modal>
        )}
        
        {/* Toast Notification */}
        {showToast && (
          <Toast 
            message={switchOn 
              ? "Kagune evolution successful! Your RC rating has increased." 
              : "Quinque enhancement complete! Your investigator rank has improved."
            } 
            type="success" 
          />
        )}
      </section>

      {/* Main Cards Section (Human/Ghoul) */}
      <main className="flex-1 flex flex-col items-center justify-center px-4 z-10 py-16">
        {/* Kagune and Quinque Background Elements */}
        <div className="absolute inset-0 z-0 overflow-hidden opacity-20 pointer-events-none">
          {/* Kagune-like tendrils (red) */}
          <motion.div 
            className="absolute w-[60%] h-[70%] right-0 top-[10%]"
            initial={{ opacity: 0, scale: 0.8, x: 100 }}
            animate={{ opacity: 1, scale: 1, x: 0 }}
            transition={{ duration: 3 }}
          >
            <div className="absolute top-0 left-[20%] w-2 h-60 bg-gradient-to-b from-red-600/0 via-red-600/40 to-red-600/0 rounded-full blur-sm transform -rotate-12"></div>
            <div className="absolute top-[10%] left-[40%] w-3 h-80 bg-gradient-to-b from-red-600/0 via-red-600/30 to-red-600/0 rounded-full blur-sm transform rotate-3"></div>
            <div className="absolute top-[5%] left-[60%] w-2 h-96 bg-gradient-to-b from-red-600/0 via-red-600/50 to-red-600/0 rounded-full blur-sm transform -rotate-20"></div>
            <div className="absolute top-[15%] left-[80%] w-2 h-72 bg-gradient-to-b from-red-600/0 via-red-600/40 to-red-600/0 rounded-full blur-sm transform rotate-12"></div>
          </motion.div>
          
          {/* Quinque-like patterns (blue) */}
          <motion.div 
            className="absolute w-[60%] h-[70%] left-0 bottom-[10%]"
            initial={{ opacity: 0, scale: 0.8, x: -100 }}
            animate={{ opacity: 1, scale: 1, x: 0 }}
            transition={{ duration: 3 }}
          >
            <div className="absolute bottom-0 right-[20%] w-2 h-60 bg-gradient-to-t from-blue-600/0 via-blue-600/40 to-blue-600/0 rounded-full blur-sm transform rotate-12"></div>
            <div className="absolute bottom-[10%] right-[40%] w-3 h-80 bg-gradient-to-t from-blue-600/0 via-blue-600/30 to-blue-600/0 rounded-full blur-sm transform -rotate-3"></div>
            <div className="absolute bottom-[5%] right-[60%] w-2 h-96 bg-gradient-to-t from-blue-600/0 via-blue-600/50 to-blue-600/0 rounded-full blur-sm transform rotate-20"></div>
            <div className="absolute bottom-[15%] right-[80%] w-2 h-72 bg-gradient-to-t from-blue-600/0 via-blue-600/40 to-blue-600/0 rounded-full blur-sm transform -rotate-12"></div>
          </motion.div>
        </div>
        
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
          className="w-full max-w-6xl"
        >
          <motion.div variants={fadeIn} className="text-center mb-16">
            <span className="px-4 py-1 bg-white/5 rounded-full text-sm text-purple-300 border border-purple-500/20 inline-block mb-4">
              CHOOSE YOUR PATH
            </span>
            <h2 className="text-4xl md:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-purple-300 to-red-400 mb-5">
              Two Worlds, One Purpose
            </h2>
            <p className="text-xl text-gray-300 max-w-2xl mx-auto">
              Will you maintain your humanity as a CCG investigator, or embrace the darkness as a powerful ghoul?
            </p>
          </motion.div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12">
            {/* Human Mode Card */}
            <motion.div 
              variants={fadeIn}
              whileHover={{ scale: 1.03, y: -5 }}
              transition={{ type: "spring", stiffness: 300 }}
              onClick={() => setActiveMode('human')}
              className="relative group"
            >
              {/* Card glow effect on hover */}
              <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-600/0 to-blue-600/0 group-hover:from-blue-600/20 group-hover:to-blue-400/20 rounded-2xl blur opacity-0 group-hover:opacity-100 transition duration-500"></div>
              
              <Card className="bg-gradient-to-br from-blue-900/80 via-blue-800/60 to-blue-700/40 border border-blue-400/30 shadow-2xl backdrop-blur-lg rounded-2xl overflow-hidden h-full relative">
                {/* Quinque-inspired pattern overlay */}
                <div className="absolute inset-0 z-0 opacity-10">
                  <div className="absolute inset-0" style={{ 
                    backgroundImage: "url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cGF0aCBkPSJNMzAgMzBtLTI1IDBhMjUgMjUgMCAxIDAgNTAgMCAyNSAyNSAwIDEgMC01MCAweiIgc3Ryb2tlPSIjMzQ4MmY2IiBzdHJva2Utd2lkdGg9IjAuNSIgZmlsbD0ibm9uZSIgZmlsbC1ydWxlPSJldmVub2RkIi8+PC9zdmc+')",
                    backgroundSize: "60px 60px"
                  }}></div>
                </div>
                
                <div className="p-8 md:p-10 flex flex-col items-center relative z-10">
                  {/* Icon with animation */}
                  <div className="relative mb-8">
                    <motion.div 
                      className="absolute -inset-4 rounded-full bg-blue-500/20 blur-md" 
                      animate={{ scale: [1, 1.2, 1] }}
                      transition={{ duration: 3, repeat: Infinity }}
                    />
                    <div className="w-24 h-24 rounded-full bg-gradient-to-br from-blue-700 to-blue-500 flex items-center justify-center shadow-xl border-2 border-blue-400/40 relative z-10">
                      <span className="text-5xl">👮‍♂️</span>
                    </div>
                    
                    {/* Quinque weapon illustration */}
                    <motion.div 
                      className="absolute top-1/2 -right-4 w-10 h-10 bg-blue-400/30 blur-sm rounded-full"
                      animate={{ scale: [1, 1.3, 1], opacity: [0.6, 1, 0.6] }}
                      transition={{ duration: 4, repeat: Infinity, repeatType: "reverse" }}
                    />
                  </div>
                  
                  <h3 className="text-3xl md:text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-300 to-blue-100 mb-6">
                    CCG Investigator
                  </h3>
                  
                  <p className="text-gray-200 mb-8 text-center text-lg leading-relaxed">
                    Maintain your humanity and hunt down threats to society. Wield your quinque and climb the ranks of the CCG.
                  </p>
                  
                  {/* Feature list with enhanced styling */}
                  <div className="space-y-5 mb-8 w-full bg-blue-900/20 rounded-xl p-6 border border-blue-500/20">
                    <h4 className="font-semibold text-blue-300 text-lg mb-3">Investigator Specialties:</h4>
                    
                    <div className="flex items-start">
                      <div className="mt-1 mr-4 flex-shrink-0 w-6 h-6 rounded-full bg-blue-500/30 flex items-center justify-center">
                        <span className="text-blue-300 text-xs">✓</span>
                      </div>
                      <div>
                        <span className="font-bold text-blue-200">Focus-Enhanced Pomodoro</span>
                        <p className="text-sm text-gray-400 mt-1">Special Quinque-enhanced timer with RC cell rewards</p>
                      </div>
                    </div>
                    
                    <div className="flex items-start">
                      <div className="mt-1 mr-4 flex-shrink-0 w-6 h-6 rounded-full bg-blue-500/30 flex items-center justify-center">
                        <span className="text-blue-300 text-xs">✓</span>
                      </div>
                      <div>
                        <span className="font-bold text-blue-200">CCG Task Management</span>
                        <p className="text-sm text-gray-400 mt-1">Organize missions with special classification system</p>
                      </div>
                    </div>
                    
                    <div className="flex items-start">
                      <div className="mt-1 mr-4 flex-shrink-0 w-6 h-6 rounded-full bg-blue-500/30 flex items-center justify-center">
                        <span className="text-blue-300 text-xs">✓</span>
                      </div>
                      <div>
                        <span className="font-bold text-blue-200">Quinque Evolution</span>
                        <p className="text-sm text-gray-400 mt-1">Develop and customize your unique quinque</p>
                      </div>
                    </div>
                    
                    <div className="flex items-start">
                      <div className="mt-1 mr-4 flex-shrink-0 w-6 h-6 rounded-full bg-blue-500/30 flex items-center justify-center">
                        <span className="text-blue-300 text-xs">✓</span>
                      </div>
                      <div>
                        <span className="font-bold text-blue-200">Rank Progression</span>
                        <p className="text-sm text-gray-400 mt-1">Rise from Rank 3 to Special Class Investigator</p>
                      </div>
                    </div>
                  </div>
                  
                  {/* CCG Rank display */}
                  <div className="w-full bg-blue-900/10 border border-blue-500/20 rounded-lg p-3 flex justify-between items-center mb-8">
                    <span className="text-blue-300 text-sm">Starting Rank:</span>
                    <span className="bg-blue-500/20 text-blue-200 px-3 py-1 rounded-md text-sm font-mono">Rank 3 Investigator</span>
                  </div>
                  
                  <Link href="/auth?mode=human" className="w-full">
                    <Button variant="default" className="w-full bg-gradient-to-r from-blue-700 to-blue-500 hover:from-blue-800 hover:to-blue-600 text-white py-6 text-lg font-bold shadow-lg shadow-blue-900/30 rounded-xl">
                      <span className="mr-2">Join the CCG</span> →
                    </Button>
                  </Link>
                </div>
              </Card>
            </motion.div>

            {/* Ghoul Mode Card */}
            <motion.div 
              variants={fadeIn}
              whileHover={{ scale: 1.03, y: -5 }}
              transition={{ type: "spring", stiffness: 300 }}
              onClick={() => setActiveMode('ghoul')}
              className="relative group"
            >
              {/* Card glow effect on hover */}
              <div className="absolute -inset-0.5 bg-gradient-to-r from-red-600/0 to-red-600/0 group-hover:from-red-600/20 group-hover:to-red-400/20 rounded-2xl blur opacity-0 group-hover:opacity-100 transition duration-500"></div>
              
              <Card className="bg-gradient-to-br from-red-900/80 via-red-800/60 to-red-700/40 border border-red-400/30 shadow-2xl backdrop-blur-lg rounded-2xl overflow-hidden h-full relative">
                {/* Kagune-inspired pattern overlay */}
                <div className="absolute inset-0 z-0 opacity-10">
                  <div className="absolute inset-0" style={{ 
                    backgroundImage: "url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cGF0aCBkPSJNMzAgMzBtLTI1IDBhMjUgMjUgMCAxIDAgNTAgMCAyNSAyNSAwIDEgMC01MCAweiIgc3Ryb2tlPSIjZWY0NDQ0IiBzdHJva2Utd2lkdGg9IjAuNSIgZmlsbD0ibm9uZSIgZmlsbC1ydWxlPSJldmVub2RkIi8+PC9zdmc+')",
                    backgroundSize: "60px 60px"
                  }}></div>
                </div>
                
                <div className="p-8 md:p-10 flex flex-col items-center relative z-10">
                  {/* Icon with animation */}
                  <div className="relative mb-8">
                    <motion.div 
                      className="absolute -inset-4 rounded-full bg-red-500/20 blur-md" 
                      animate={{ scale: [1, 1.2, 1] }}
                      transition={{ duration: 3, repeat: Infinity, delay: 1 }}
                    />
                    <div className="w-24 h-24 rounded-full bg-gradient-to-br from-red-700 to-red-500 flex items-center justify-center shadow-xl border-2 border-red-400/40 relative z-10">
                      <span className="text-5xl">👹</span>
                    </div>
                    
                    {/* Kagune tendrils illustration */}
                    <motion.div 
                      className="absolute top-1/2 -right-6 w-12 h-3 bg-red-500/50 blur-md rounded-full"
                      animate={{ scaleX: [1, 1.5, 1], opacity: [0.6, 1, 0.6] }}
                      transition={{ duration: 3, repeat: Infinity }}
                      style={{ transformOrigin: 'left' }}
                    />
                    <motion.div 
                      className="absolute top-1/3 -left-6 w-10 h-2 bg-red-500/40 blur-md rounded-full"
                      animate={{ scaleX: [1, 1.4, 1], opacity: [0.5, 0.8, 0.5] }}
                      transition={{ duration: 4, repeat: Infinity, delay: 1 }}
                      style={{ transformOrigin: 'right' }}
                    />
                  </div>
                  
                  <h3 className="text-3xl md:text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-red-300 to-red-100 mb-6">
                    Tokyo Ghoul
                  </h3>
                  
                  <p className="text-gray-200 mb-8 text-center text-lg leading-relaxed">
                    Embrace your inner darkness and terrorize the city with your kagune. Feed on RC cells and rise through ghoul society.
                  </p>
                  
                  {/* Feature list with enhanced styling */}
                  <div className="space-y-5 mb-8 w-full bg-red-900/20 rounded-xl p-6 border border-red-500/20">
                    <h4 className="font-semibold text-red-300 text-lg mb-3">Ghoul Abilities:</h4>
                    
                    <div className="flex items-start">
                      <div className="mt-1 mr-4 flex-shrink-0 w-6 h-6 rounded-full bg-red-500/30 flex items-center justify-center">
                        <span className="text-red-300 text-xs">✓</span>
                      </div>
                      <div>
                        <span className="font-bold text-red-200">Kagune Combat System</span>
                        <p className="text-sm text-gray-400 mt-1">Four unique kagune types with custom abilities</p>
                      </div>
                    </div>
                    
                    <div className="flex items-start">
                      <div className="mt-1 mr-4 flex-shrink-0 w-6 h-6 rounded-full bg-red-500/30 flex items-center justify-center">
                        <span className="text-red-300 text-xs">✓</span>
                      </div>
                      <div>
                        <span className="font-bold text-red-200">RC Cell Harvesting</span>
                        <p className="text-sm text-gray-400 mt-1">Earn RC cells through completed tasks</p>
                      </div>
                    </div>
                    
                    <div className="flex items-start">
                      <div className="mt-1 mr-4 flex-shrink-0 w-6 h-6 rounded-full bg-red-500/30 flex items-center justify-center">
                        <span className="text-red-300 text-xs">✓</span>
                      </div>
                      <div>
                        <span className="font-bold text-red-200">Ward Territory System</span>
                        <p className="text-sm text-gray-400 mt-1">Claim and defend Tokyo's 24 wards</p>
                      </div>
                    </div>
                    
                    <div className="flex items-start">
                      <div className="mt-1 mr-4 flex-shrink-0 w-6 h-6 rounded-full bg-red-500/30 flex items-center justify-center">
                        <span className="text-red-300 text-xs">✓</span>
                      </div>
                      <div>
                        <span className="font-bold text-red-200">Ghoul Rating System</span>
                        <p className="text-sm text-gray-400 mt-1">Evolve from C-rated to SSS-rated threat</p>
                      </div>
                    </div>
                  </div>
                  
                  {/* Ghoul Rating display */}
                  <div className="w-full bg-red-900/10 border border-red-500/20 rounded-lg p-3 flex justify-between items-center mb-8">
                    <span className="text-red-300 text-sm">Starting Rating:</span>
                    <span className="bg-red-500/20 text-red-200 px-3 py-1 rounded-md text-sm font-mono">C-Rated Ghoul</span>
                  </div>
                  
                  <Link href="/auth?mode=ghoul" className="w-full">
                    <Button variant="default" className="w-full bg-gradient-to-r from-red-700 to-red-500 hover:from-red-800 hover:to-red-600 text-white py-6 text-lg font-bold shadow-lg shadow-red-900/30 rounded-xl">
                      <span className="mr-2">Unleash Your Kagune</span> →
                    </Button>
                  </Link>
                </div>
              </Card>
            </motion.div>
          </div>
        </motion.div>
      </main>

      {/* Stats Section with Tokyo-inspired Ward Map */}
      <motion.section
        variants={staggerContainer}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.3 }}
        className="py-20 z-10 relative"
      >
        <div className="absolute inset-0 z-0 bg-gradient-to-b from-black/0 via-black/60 to-black/0 pointer-events-none"></div>
        
        <div className="container mx-auto px-6 relative z-10">
          <motion.div 
            className="text-center mb-16"
            variants={fadeIn}
          >
            <span className="px-4 py-1 bg-white/5 rounded-full text-sm text-purple-300 border border-purple-500/20 inline-block mb-4">
              GLOBAL STATS
            </span>
            <h2 className="text-4xl md:text-5xl font-bold text-center mb-4 text-transparent bg-clip-text bg-gradient-to-r from-red-400 via-purple-400 to-blue-400">
              Tokyo Wards Battleground
            </h2>
            <p className="text-xl text-gray-400 max-w-2xl mx-auto">
              Join thousands already fighting in the 24 wards of Tokyo
            </p>
          </motion.div>
          
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 max-w-6xl mx-auto">
            {/* Ward Map Visualization */}
            <motion.div 
              className="lg:col-span-3 rounded-2xl overflow-hidden relative h-96 lg:h-auto"
              variants={fadeIn}
            >
              <div className="absolute inset-0 bg-black/50 backdrop-blur-sm rounded-2xl border border-white/10">
                {/* Stylized Tokyo Ward Map */}
                <div className="absolute inset-0 p-4">
                  <div className="relative h-full w-full rounded-xl overflow-hidden border border-white/10">
                    {/* Ward grid */}
                    <div className="absolute inset-0 grid grid-cols-6 grid-rows-4 gap-px">
                      {[...Array(24)].map((_, i) => {
                        const isHuman = Math.random() > 0.6;
                        return (
                          <div 
                            key={i} 
                            className={`relative ${
                              isHuman 
                                ? 'bg-gradient-to-br from-blue-900/40 to-blue-800/20 border-blue-500/20' 
                                : 'bg-gradient-to-br from-red-900/40 to-red-800/20 border-red-500/20'
                            } border`}
                          >
                            <div className="absolute inset-0 flex items-center justify-center text-xs text-white/60">
                              Ward {i + 1}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                    
                    {/* Pulse effects for active battles */}
                    <div className="absolute top-[30%] left-[20%] w-4 h-4">
                      <motion.div 
                        className="absolute inset-0 rounded-full bg-red-500"
                        animate={{ scale: [1, 3], opacity: [0.8, 0] }}
                        transition={{ duration: 3, repeat: Infinity }}
                      />
                      <div className="absolute inset-0 rounded-full bg-red-500"></div>
                    </div>
                    
                    <div className="absolute top-[60%] left-[70%] w-4 h-4">
                      <motion.div 
                        className="absolute inset-0 rounded-full bg-blue-500"
                        animate={{ scale: [1, 3], opacity: [0.8, 0] }}
                        transition={{ duration: 3, repeat: Infinity, delay: 1 }}
                      />
                      <div className="absolute inset-0 rounded-full bg-blue-500"></div>
                    </div>
                  </div>
                  
                  <div className="absolute bottom-4 left-4 right-4 bg-black/60 backdrop-blur-sm rounded-lg p-3 border border-white/10">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div className="h-3 w-3 bg-blue-500 rounded-full mr-2"></div>
                        <span className="text-xs text-blue-300">CCG Control: 10 Wards</span>
                      </div>
                      <div className="flex items-center">
                        <div className="h-3 w-3 bg-red-500 rounded-full mr-2"></div>
                        <span className="text-xs text-red-300">Ghoul Control: 14 Wards</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
            
            {/* Stats Counter Cards */}
            <div className="lg:col-span-2 grid grid-cols-2 gap-4 content-between h-full">
              <motion.div 
                variants={fadeIn}
                className="flex flex-col items-center p-6 backdrop-blur-xl bg-white/5 border border-white/10 rounded-xl"
              >
                <div className="w-12 h-12 rounded-full bg-blue-500/20 flex items-center justify-center mb-3">
                  <span className="text-lg">👮‍♂️</span>
                </div>
                <span className="text-3xl font-bold text-blue-400 mb-2">15K+</span>
                <p className="text-gray-400 text-center text-sm">Active Investigators</p>
              </motion.div>
              
              <motion.div 
                variants={fadeIn}
                className="flex flex-col items-center p-6 backdrop-blur-xl bg-white/5 border border-white/10 rounded-xl"
              >
                <div className="w-12 h-12 rounded-full bg-red-500/20 flex items-center justify-center mb-3">
                  <span className="text-lg">👹</span>
                </div>
                <span className="text-3xl font-bold text-red-400 mb-2">12K+</span>
                <p className="text-gray-400 text-center text-sm">Active Ghouls</p>
              </motion.div>
              
              <motion.div 
                variants={fadeIn}
                className="flex flex-col items-center p-6 backdrop-blur-xl bg-white/5 border border-white/10 rounded-xl"
              >
                <div className="w-12 h-12 rounded-full bg-purple-500/20 flex items-center justify-center mb-3">
                  <span className="text-lg">⏱️</span>
                </div>
                <span className="text-3xl font-bold text-purple-400 mb-2">2.5M+</span>
                <p className="text-gray-400 text-center text-sm">Focus Sessions</p>
              </motion.div>
              
              <motion.div 
                variants={fadeIn}
                className="flex flex-col items-center p-6 backdrop-blur-xl bg-white/5 border border-white/10 rounded-xl"
              >
                <div className="w-12 h-12 rounded-full bg-green-500/20 flex items-center justify-center mb-3">
                  <span className="text-lg">⚔️</span>
                </div>
                <span className="text-3xl font-bold text-green-400 mb-2">850K+</span>
                <p className="text-gray-400 text-center text-sm">Battles Fought</p>
              </motion.div>
              
              <motion.div 
                variants={fadeIn}
                className="col-span-2 flex flex-col items-center p-6 backdrop-blur-xl bg-gradient-to-br from-purple-900/30 to-purple-800/10 border border-purple-500/20 rounded-xl"
              >
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-red-500/30 to-blue-500/30 flex items-center justify-center mb-3">
                  <span className="text-lg">🔄</span>
                </div>
                <span className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-red-400 to-blue-400 mb-2">75M+</span>
                <p className="text-gray-300 text-center text-sm">RC Cells Circulating in Economy</p>
              </motion.div>
            </div>
          </div>
        </div>
      </motion.section>
      
      {/* Call to Action with Kagune/Quinque Animation */}
      <motion.section
        variants={fadeIn}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.3 }}
        className="py-24 z-10 relative overflow-hidden"
      >
        {/* Animated background elements */}
        <div className="absolute inset-0 pointer-events-none">
          {/* Left side - Quinque effect */}
          <motion.div 
            className="absolute left-0 top-0 bottom-0 w-1/2"
            initial={{ opacity: 0, x: -100 }}
            whileInView={{ opacity: 0.6, x: 0 }}
            transition={{ duration: 1, ease: "easeOut" }}
            viewport={{ once: true }}
          >
            <div className="absolute right-0 top-1/2 transform -translate-y-1/2">
              <motion.div 
                className="w-40 h-40 md:w-60 md:h-60 rounded-full bg-gradient-to-r from-blue-600/20 to-blue-400/5 blur-2xl"
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ duration: 8, repeat: Infinity }}
              />
            </div>
          </motion.div>
          
          {/* Right side - Kagune effect */}
          <motion.div 
            className="absolute right-0 top-0 bottom-0 w-1/2"
            initial={{ opacity: 0, x: 100 }}
            whileInView={{ opacity: 0.6, x: 0 }}
            transition={{ duration: 1, ease: "easeOut" }}
            viewport={{ once: true }}
          >
            <div className="absolute left-0 top-1/2 transform -translate-y-1/2">
              <motion.div 
                className="w-40 h-40 md:w-60 md:h-60 rounded-full bg-gradient-to-r from-red-400/5 to-red-600/20 blur-2xl"
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ duration: 8, repeat: Infinity, delay: 4 }}
              />
            </div>
          </motion.div>
        </div>
        
        <div className="container mx-auto px-6 relative z-10">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-8">
              <span className="px-4 py-1 bg-white/5 rounded-full text-sm text-purple-300 border border-purple-500/20 inline-block mb-4">
                FINAL DECISION
              </span>
              
              <h2 className="text-4xl md:text-5xl font-bold mb-6 text-center">
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-purple-400 to-red-400">
                  Ready to Enter the World of
                </span>
                <div className="mt-2 text-white">
                  <span className="relative">
                    BlackReaper
                    <div className="absolute -inset-1 -skew-y-3 bg-gradient-to-r from-blue-600/20 to-red-600/20 blur-md -z-10"></div>
                  </span>
                </div>
              </h2>
              
              <p className="text-xl text-gray-300 mb-10 max-w-2xl mx-auto">
                Join thousands of investigators and ghouls in Tokyo's underground world of productivity and power.
              </p>
            </div>
            
            {/* Dual CTA Buttons */}
            <div className="flex flex-col sm:flex-row justify-center items-center gap-6">
              <Link href="/auth?mode=human">
                <div className="relative group">
                  <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-600/30 to-blue-400/30 rounded-xl blur opacity-75 group-hover:opacity-100 transition duration-300"></div>
                  <Button 
                    variant="default"
                    className="relative px-8 py-6 bg-gradient-to-r from-blue-800 to-blue-600 hover:from-blue-700 hover:to-blue-500 text-white shadow-xl shadow-blue-900/20 rounded-xl text-lg font-medium"
                  >
                    Join as Human
                  </Button>
                </div>
              </Link>
              
              <Link href="/auth?mode=ghoul">
                <div className="relative group">
                  <div className="absolute -inset-0.5 bg-gradient-to-r from-red-600/30 to-red-400/30 rounded-xl blur opacity-75 group-hover:opacity-100 transition duration-300"></div>
                  <Button 
                    variant="default"
                    className="relative px-8 py-6 bg-gradient-to-r from-red-800 to-red-600 hover:from-red-700 hover:to-red-500 text-white shadow-xl shadow-red-900/20 rounded-xl text-lg font-medium"
                  >
                    Join as Ghoul
                  </Button>
                </div>
              </Link>
              
              <span className="text-gray-500 hidden sm:block">or</span>
              
              <Link href="/auth">
                <div className="relative group">
                  <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-600/30 to-purple-400/30 rounded-xl blur opacity-75 group-hover:opacity-100 transition duration-300"></div>
                  <Button 
                    variant="default"
                    className="relative px-8 py-6 bg-gradient-to-r from-purple-800 to-purple-600 hover:from-purple-700 hover:to-purple-500 text-white shadow-xl shadow-purple-900/20 rounded-xl text-lg font-medium"
                  >
                    Explore BlackReaper
                  </Button>
                </div>
              </Link>
            </div>
          </div>
        </div>
      </motion.section>
      
      {/* Footer with Tokyo Ghoul References */}
      <footer className="w-full py-14 z-10 relative border-t border-gray-800/50">
        <div className="absolute inset-0 bg-gradient-to-b from-black/0 to-black/40 pointer-events-none"></div>
        
        <div className="container mx-auto px-6 relative">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 max-w-6xl mx-auto">
            <div className="flex flex-col">
              <div className="flex items-center mb-6">
                <Avatar src="/globe.svg" size={48} className="mr-3 border-2 border-white/10" />
                <span className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-red-400 to-blue-400">BlackReaper</span>
              </div>
              <p className="text-gray-400 text-sm mb-6">
                A Tokyo Ghoul-inspired productivity platform where focus meets combat in a dark urban fantasy setting.
              </p>
              <div className="mt-auto flex space-x-4">
                <a href="#" className="text-gray-400 hover:text-white transition">
                  <span className="sr-only">Twitter</span>
                  <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84"></path>
                  </svg>
                </a>
                <a href="#" className="text-gray-400 hover:text-white transition">
                  <span className="sr-only">GitHub</span>
                  <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd"></path>
                  </svg>
                </a>
              </div>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold text-white mb-4">System Features</h3>
              <ul className="space-y-3 text-gray-400">
                <li className="flex items-center"><span className="mr-2">◉</span> Pomodoro Focus Timer</li>
                <li className="flex items-center"><span className="mr-2">◉</span> Kagune Battle System</li>
                <li className="flex items-center"><span className="mr-2">◉</span> RC Cell Economy</li>
                <li className="flex items-center"><span className="mr-2">◉</span> Ward Territory Control</li>
                <li className="flex items-center"><span className="mr-2">◉</span> CCG Rank Progression</li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold text-white mb-4">Tokyo Wards</h3>
              <div className="grid grid-cols-3 gap-2">
                {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(ward => (
                  <div key={ward} className="text-xs py-1 px-2 bg-white/5 rounded border border-white/10 text-gray-400 text-center">
                    Ward {ward}
                  </div>
                ))}
              </div>
              <div className="mt-4 text-sm text-gray-500">
                &copy; 2025 BlackReaper. Inspired by Tokyo Ghoul.
              </div>
            </div>
          </div>
        </div>
      </footer>
      
      {/* Mode Selection Overlay - Appears when hovering/selecting a mode */}
      <AnimatePresence>
        {activeMode === 'human' && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setActiveMode('none')}
            className="fixed inset-0 pointer-events-none z-20"
          >
            <div className="absolute inset-0 bg-blue-900/20" />
            <motion.div
              initial={{ scale: 0, x: "-50%", y: "-50%" }}
              animate={{ scale: 1, x: "-50%", y: "-50%" }}
              exit={{ scale: 0, x: "-50%", y: "-50%" }}
              className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 pointer-events-none"
              style={{ width: "150vmax", height: "150vmax" }}
            >
              <div className="w-full h-full rounded-full bg-gradient-to-br from-blue-600/0 to-blue-600/10 border border-blue-500/20 animate-pulse" />
            </motion.div>
          </motion.div>
        )}
        
        {activeMode === 'ghoul' && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setActiveMode('none')}
            className="fixed inset-0 pointer-events-none z-20"
          >
            <div className="absolute inset-0 bg-red-900/20" />
            <motion.div
              initial={{ scale: 0, x: "-50%", y: "-50%" }}
              animate={{ scale: 1, x: "-50%", y: "-50%" }}
              exit={{ scale: 0, x: "-50%", y: "-50%" }}
              className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 pointer-events-none"
              style={{ width: "150vmax", height: "150vmax" }}
            >
              <div className="w-full h-full rounded-full bg-gradient-to-br from-red-600/0 to-red-600/10 border border-red-500/20 animate-pulse" />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}