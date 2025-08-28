"use client";

import { Button, Card, CardBody } from "@heroui/react";
import Link from "next/link";
import { motion } from "framer-motion";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-black text-white flex flex-col">
      <header className="w-full py-10 flex flex-col items-center justify-center bg-gradient-to-r from-red-900/60 to-transparent">
        <motion.h1
          initial={{ opacity: 0, y: -40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-6xl md:text-8xl font-extrabold tracking-tight text-center mb-2"
        >
          <span className="text-red-500 drop-shadow-lg">Black</span>
          <span className="text-white">Reaper</span>
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1 }}
          className="text-lg md:text-2xl text-gray-400 text-center max-w-2xl mt-4"
        >
          Enter the world of BlackReaper. Will you embrace your humanity or unleash your inner ghoul?
        </motion.p>
      </header>

      <main className="flex-1 flex flex-col items-center justify-center px-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.7 }}
          className="w-full max-w-4xl grid grid-cols-1 md:grid-cols-2 gap-10"
        >
          {/* Human Mode Card */}
          <motion.div whileHover={{ scale: 1.04, boxShadow: "0 0 40px #3a86ff55" }}>
            <Card className="bg-gradient-to-br from-blue-900/60 to-blue-800/30 border-2 border-blue-500/40 shadow-xl">
              <CardBody className="p-8 flex flex-col items-center">
                <motion.div
                  initial={{ scale: 0.8, rotate: -10 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ duration: 0.6 }}
                  className="w-16 h-16 rounded-full bg-blue-900 flex items-center justify-center mb-4 shadow-lg"
                >
                  <span className="text-3xl text-blue-400">🧑‍💻</span>
                </motion.div>
                <h3 className="text-2xl font-bold text-blue-400 mb-2">Human Mode</h3>
                <p className="text-gray-300 mb-4 text-center">
                  Focus on productivity, earn RC Cells, and climb the ranks as a legendary human.
                </p>
                <ul className="text-left text-sm text-gray-400 space-y-2 mb-6 w-full">
                  <li>✅ Pomodoro Timer with RC rewards</li>
                  <li>✅ Task Management System</li>
                  <li>✅ Personal Journal</li>
                  <li>✅ Leaderboards & Stats</li>
                </ul>
                <Link href="/auth?mode=human">
                  <Button color="primary" className="w-full font-bold text-lg">
                    Enter as Human
                  </Button>
                </Link>
              </CardBody>
            </Card>
          </motion.div>

          {/* Ghoul Mode Card */}
          <motion.div whileHover={{ scale: 1.04, boxShadow: "0 0 40px #ff005555" }}>
            <Card className="bg-gradient-to-br from-red-900/60 to-red-800/30 border-2 border-red-500/40 shadow-xl">
              <CardBody className="p-8 flex flex-col items-center">
                <motion.div
                  initial={{ scale: 0.8, rotate: 10 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ duration: 0.6 }}
                  className="w-16 h-16 rounded-full bg-red-900 flex items-center justify-center mb-4 shadow-lg"
                >
                  <span className="text-3xl text-red-400">👹</span>
                </motion.div>
                <h3 className="text-2xl font-bold text-red-400 mb-2">Ghoul Mode</h3>
                <p className="text-gray-300 mb-4 text-center">
                  Embrace the darkness, battle in Kagune arenas, and dominate the underworld as a fearsome ghoul.
                </p>
                <ul className="text-left text-sm text-gray-400 space-y-2 mb-6 w-full">
                  <li>✅ Kagune Battle System</li>
                  <li>✅ RC Cell Combat Rewards</li>
                  <li>✅ Ghoul Chat Rooms</li>
                  <li>✅ Territory Control</li>
                </ul>
                <Link href="/auth?mode=ghoul">
                  <Button color="danger" className="w-full font-bold text-lg">
                    Enter as Ghoul
                  </Button>
                </Link>
              </CardBody>
            </Card>
          </motion.div>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1 }}
          className="text-center text-gray-400 text-sm mt-12"
        >
          &copy; 2025 BlackReaper. Built with Next.js, HeroUI, and Firebase. Inspired by Tokyo Ghoul.
        </motion.div>
      </main>
    </div>
  );
}