⚡ BlackReaper (Next.js + HeroUI + Framer Motion + Firebase) — 20 Step Build Guide
Step 1: Project Initialization

Prompt:

Create a Next.js 14+ project with TypeScript support.

npx create-next-app@latest blackreaper --typescript
cd blackreaper

Step 2: Install Dependencies

Prompt:

Install HeroUI, Framer Motion, Firebase, and other utilities.

npm install @heroui/react framer-motion firebase

✅ **COMPLETED** - Project created and dependencies installed

Step 3: Global Styles

Prompt:

Add globals.css with dark Tokyo Ghoul-style theme base, and setup data-mode="human|ghoul" CSS variables.

✅ **COMPLETED** - Tokyo Ghoul theme with human/ghoul modes implemented

Step 4: Wrap App with HeroUI

Prompt:

Configure app/layout.tsx to use HeroUIProvider for global theming.

"use client";
import { HeroUIProvider } from "@heroui/react";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <HeroUIProvider>{children}</HeroUIProvider>
      </body>
    </html>
  );
}

✅ **COMPLETED** - HeroUIProvider configured in layout.tsx

Step 5: Firebase Config

Prompt:

Create lib/firebase.ts with Firebase Auth + Realtime DB initialization.

import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getDatabase } from "firebase/database";

const firebaseConfig = {
  apiKey: "AIzaSyCEEMiU0Brkt2zQIpnh_9DA5lpRWz8lIxU",
  authDomain: "blackreaper-68d80.firebaseapp.com",
  databaseURL: "https://blackreaper-68d80-default-rtdb.firebaseio.com",
  projectId: "blackreaper-68d80",
  storageBucket: "blackreaper-68d80.firebasestorage.app",
  messagingSenderId: "878532400780",
  appId: "1:878532400780:web:7e08a1d0e490a7282c8da9",
  measurementId: "G-BQM80KXY60"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getDatabase(app);

✅ **COMPLETED** - Firebase configuration created with real credentials

Step 5.5: Landing Page

Prompt:

Create app/page.tsx with beautiful Tokyo Ghoul-themed landing page featuring HeroUI components and Framer Motion animations.

Features:
- Hero section with BlackReaper branding
- Human vs Ghoul path selection cards
- Call-to-action buttons linking to auth
- Responsive design with dark theme
- Smooth animations and transitions

✅ **COMPLETED** - Landing page created with Tokyo Ghoul theme

Step 6: Auth Page UI

Prompt:

Build app/auth/page.tsx with HeroUI Card, Input, Button for login/register/guest access.

Step 7: Implement Email & Anonymous Login

Prompt:

Add Firebase login logic with signInWithEmailAndPassword and signInAnonymously.

Step 8: Protect Routes

Prompt:

Create lib/authContext.tsx with React Context that checks Firebase auth state and wraps private pages (like Dashboard).

Step 9: Dashboard Skeleton

Prompt:

Create app/dashboard/page.tsx with 3 sections: RC Balance, Pomodoro Timer, Tasks List.

Step 10: Theme Toggle Component

Prompt:

Build components/ThemeToggle.tsx using NextUI Button + Framer Motion for smooth animations. Save mode to localStorage.

Step 11: Pomodoro Component

Prompt:

Create components/Pomodoro.tsx with start/pause/reset and reward RC Cells when completed. Add animated timer with Framer Motion.

Step 12: RC Balance Card

Prompt:

Make a reusable RCMeter.tsx showing current RC balance (updates dynamically when earned/spent).

Step 13: Task Manager

Prompt:

Build components/TaskList.tsx with NextUI list + checkbox. Store tasks in Firebase Realtime DB under /tasks/{uid}/.

Step 14: Journal System

Prompt:

Create app/journal/page.tsx where users can write private journal entries. Only visible if in Ghoul Mode.

Step 15: Kagune Battle Engine (Basic)

Prompt:

Create components/BattleSimulator.tsx with simple turn-based attacks (p1 vs p2). Use Framer Motion for attack animations.

Step 16: RC Stakes in Battles

Prompt:

Connect battles to Firebase /battles/ and update winners’ RC balances via server-side API routes.

Step 17: Ghoul Chat Room

Prompt:

Build app/chat/page.tsx with anonymous Firebase chat. Messages stored in /chat/ghoulRooms/{roomId}/. Show live updates with onValue.

Step 18: Stats & Leaderboard

Prompt:

Create app/leaderboard/page.tsx showing top users ranked by RC balance, Pomodoros, and threat level.

Step 19: API Routes for Secure Ops

Prompt:

Add app/api/award-pomodoro/route.ts with Firebase Admin SDK to securely increment RC on Pomodoro completion.

Step 20: Deployment & Security Rules

Prompt:

Add Firebase Realtime DB security rules + deploy to Vercel.

{
  "rules": {
    "users": {
      "$uid": {
        ".read": "$uid === auth.uid",
        ".write": "$uid === auth.uid"
      }
    },
    "chat": {
      "ghoulRooms": {
        ".read": "auth != null",
        ".write": "auth != null"
      }
    },
    "battles": {
      ".read": "auth != null",
      ".write": "auth != null"
    },
    "journals": {
      "$uid": {
        ".read": "$uid === auth.uid",
        ".write": "$uid === auth.uid"
      }
    }
  }
}


Finally:

npm run build
vercel deploy