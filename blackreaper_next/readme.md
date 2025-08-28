⚡ BlackReaper (Next.js + NextUI + Framer Motion + Firebase) — 20 Step Build Guide
Step 1: Project Initialization

Prompt:

Create a Next.js 14+ project with TypeScript support.

npx create-next-app@latest blackreaper --typescript
cd blackreaper

Step 2: Install Dependencies

Prompt:

Install NextUI, Framer Motion, Firebase, and other utilities.

npm install @nextui-org/react framer-motion firebase

Step 3: Global Styles

Prompt:

Add globals.css with dark Tokyo Ghoul-style theme base, and setup data-mode="human|ghoul" CSS variables.

Step 4: Wrap App with NextUI

Prompt:

Configure app/layout.tsx to use NextUIProvider for global theming.

"use client";
import { NextUIProvider } from "@nextui-org/react";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <NextUIProvider>{children}</NextUIProvider>
      </body>
    </html>
  );
}

Step 5: Firebase Config

Prompt:

Create lib/firebase.ts with Firebase Auth + Realtime DB initialization.

import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getDatabase } from "firebase/database";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY!,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN!,
  databaseURL: process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL!,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID!,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET!,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID!,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID!,
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getDatabase(app);

Step 6: Auth Page UI

Prompt:

Build app/auth/page.tsx with NextUI Card, Input, Button for login/register/guest access.

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