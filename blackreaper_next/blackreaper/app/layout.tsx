"use client";
import "./globals.css";
import { Button, Card, CardBody } from "@heroui/react";
import Link from "next/link";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-black text-white flex flex-col">
      <header className="w-full py-8 flex justify-center items-center bg-gradient-to-r from-red-900/40 to-transparent">
        <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight text-center">
          <span className="text-red-500">Black</span>
          <span className="text-white">Reaper</span>
        </h1>
      </header>

      <main className="flex-1 flex flex-col items-center justify-center px-4">
        <Card className="w-full max-w-3xl bg-gradient-to-br from-gray-900 via-gray-950 to-black shadow-2xl border border-gray-800">
          <CardBody className="p-8 flex flex-col items-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-center">Choose Your Mode</h2>
            <p className="text-lg text-gray-400 mb-8 text-center max-w-xl">
              Enter the world of BlackReaper. Will you embrace your humanity or unleash your inner ghoul?
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full">
              {/* Human Mode */}
              <Card className="bg-gradient-to-br from-blue-900/40 to-blue-800/20 border-blue-500/30 hover:border-blue-400/50 transition-all duration-300 shadow-lg">
                <CardBody className="p-6 flex flex-col items-center">
                  <div className="w-12 h-12 rounded-full bg-blue-900 flex items-center justify-center mb-4">
                    <span className="text-2xl text-blue-400">🧑</span>
                  </div>
                  <h3 className="text-2xl font-bold text-blue-400 mb-2">Human Mode</h3>
                  <p className="text-gray-300 mb-4 text-center">
                    Focus on productivity, earn RC Cells, and climb the ranks as a legendary human.
                  </p>
                  <ul className="text-left text-sm text-gray-400 space-y-2 mb-6">
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

              {/* Ghoul Mode */}
              <Card className="bg-gradient-to-br from-red-900/40 to-red-800/20 border-red-500/30 hover:border-red-400/50 transition-all duration-300 shadow-lg">
                <CardBody className="p-6 flex flex-col items-center">
                  <div className="w-12 h-12 rounded-full bg-red-900 flex items-center justify-center mb-4">
                    <span className="text-2xl text-red-400">👹</span>
                  </div>
                  <h3 className="text-2xl font-bold text-red-400 mb-2">Ghoul Mode</h3>
                  <p className="text-gray-300 mb-4 text-center">
                    Embrace the darkness, battle in Kagune arenas, and dominate the underworld as a fearsome ghoul.
                  </p>
                  <ul className="text-left text-sm text-gray-400 space-y-2 mb-6">
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
            </div>
          </CardBody>
        </Card>
        <div className="text-center text-gray-400 text-sm mt-8">
          &copy; 2025 BlackReaper. Built with Next.js, HeroUI, and Firebase. Inspired by Tokyo Ghoul.
        </div>
      </main>
    </div>
  );
}