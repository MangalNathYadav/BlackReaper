# BlackReaper (Next.js Version)

## Overview

BlackReaper is a productivity and gaming web application that merges task management with an immersive, dark-themed experience inspired by Tokyo Ghoul. Users can toggle between "Human" and "Ghoul" modes, earn RC Cells through Pomodoro sessions and task completions, and engage in Kagune battles with other players.

This version is built with Next.js for improved performance, SEO, server-side rendering, and a better developer experience compared to the original Vanilla JS implementation.

## Features

- **Authentication**: Email and anonymous login via Firebase Auth
- **Dashboard**: Task management, Pomodoro timer with RC Cell rewards, real-time RC meter
- **Theme Toggle**: Persistent Human/Ghoul mode with CSS variables and localStorage
- **Journal Entries**: Ghoul-only visibility for private journaling
- **Kagune Battles**: Turn-based battles with RC stakes, server-simulated for fairness
- **Realtime Chat**: Anonymous ghoul chat rooms
- **Stats Tracking**: User statistics, leaderboards, and threat levels
- **Inactivity Auto-Switch**: Friendly UX with warnings before switching to Ghoul mode
- **RC Cell Economy**: Earn through tasks/Pomodoro, spend on cosmetics and unlocks

## Tech Stack

- **Frontend**: Next.js 14+, React, TypeScript
- **Backend**: Firebase (Realtime Database, Auth, Hosting)
- **Styling**: CSS with custom properties for themes
- **Deployment**: Vercel (recommended) or Firebase Hosting
- **Server-Side Validation**: Next.js API routes for sensitive operations (RC transfers, battle resolution)

## Installation & Setup

### Prerequisites
- Node.js 18+
- npm or yarn
- Firebase project with Realtime Database and Auth enabled

### Steps

1. **Clone the repository**
   ```bash
   git clone https://github.com/MangalNathYadav/BlackReaper.git
   cd BlackReaper/blackreaper
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up Firebase**
   - Create a Firebase project at https://console.firebase.google.com
   - Enable Authentication (Email/Password + Anonymous)
   - Enable Realtime Database
   - Copy your config to `lib/firebase.js`

4. **Configure environment variables**
   Create a `.env.local` file:
   ```
   NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
   NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
   NEXT_PUBLIC_FIREBASE_DATABASE_URL=https://your_project.firebaseio.com
   NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
   NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
   NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
   NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
   ```

5. **Run development server**
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
blackreaper/
├── pages/                 # Next.js pages (app router)
│   ├── api/              # API routes for server-side logic
│   ├── dashboard.js      # Main dashboard
│   ├── battle.js         # Battle interface
│   ├── journal.js        # Journal page
│   └── ...
├── components/           # Reusable React components
│   ├── Pomodoro.js       # Pomodoro timer component
│   ├── ThemeToggle.js    # Theme switcher
│   ├── BattleSimulator.js # Battle logic
│   └── ...
├── lib/                  # Utilities and Firebase config
│   ├── firebase.js       # Firebase initialization
│   ├── auth.js           # Authentication helpers
│   ├── database.js       # Database operations
│   └── ...
├── styles/               # CSS files
│   ├── globals.css       # Global styles with CSS variables
│   ├── dashboard.css     # Dashboard-specific styles
│   └── ...
├── public/               # Static assets
│   ├── assets/
│   └── ...
└── README.md             # This file
```

## Key Differences from Original Version

- **Framework**: Migrated from Vanilla JS to Next.js/React for component reusability and better state management
- **Server-Side**: Replaced Flask with Next.js API routes for server-side validation
- **Routing**: Uses Next.js App Router for file-based routing
- **Performance**: Server-side rendering for better SEO and initial load times
- **TypeScript**: Optional but recommended for better development experience

## Firebase Configuration

```javascript
// lib/firebase.js
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getDatabase } from 'firebase/database';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  databaseURL: process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getDatabase(app);
```

## Theme Toggle Implementation

```javascript
// components/ThemeToggle.js
import { useState, useEffect } from 'react';

export default function ThemeToggle() {
  const [mode, setMode] = useState('human');

  useEffect(() => {
    const savedMode = localStorage.getItem('blackreaper_mode') || 'human';
    setMode(savedMode);
    document.documentElement.setAttribute('data-mode', savedMode);
  }, []);

  const toggleMode = () => {
    const newMode = mode === 'human' ? 'ghoul' : 'human';
    setMode(newMode);
    document.documentElement.setAttribute('data-mode', newMode);
    localStorage.setItem('blackreaper_mode', newMode);
  };

  return (
    <button onClick={toggleMode} aria-pressed={mode === 'ghoul'}>
      Switch to {mode === 'human' ? 'Ghoul' : 'Human'} Mode
    </button>
  );
}
```

## Pomodoro Component

```javascript
// components/Pomodoro.js
import { useState, useEffect } from 'react';

export default function Pomodoro({ onComplete }) {
  const [timeLeft, setTimeLeft] = useState(25 * 60);
  const [isActive, setIsActive] = useState(false);
  const [mode, setMode] = useState('work'); // 'work' or 'rest'

  useEffect(() => {
    let interval = null;
    if (isActive && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft(timeLeft => timeLeft - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      if (mode === 'work') {
        onComplete(5); // Reward 5 RC cells
        setMode('rest');
        setTimeLeft(5 * 60);
      } else {
        setMode('work');
        setTimeLeft(25 * 60);
        setIsActive(false);
      }
    }
    return () => clearInterval(interval);
  }, [isActive, timeLeft, mode, onComplete]);

  const startTimer = () => setIsActive(true);
  const pauseTimer = () => setIsActive(false);
  const resetTimer = () => {
    setIsActive(false);
    setTimeLeft(mode === 'work' ? 25 * 60 : 5 * 60);
  };

  return (
    <div className="pomodoro">
      <h3>{mode === 'work' ? 'Work Session' : 'Break Time'}</h3>
      <div className="timer">{Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}</div>
      <button onClick={isActive ? pauseTimer : startTimer}>
        {isActive ? 'Pause' : 'Start'}
      </button>
      <button onClick={resetTimer}>Reset</button>
    </div>
  );
}
```

## Data Model (Realtime Database)

```
/users/{uid}/
  profile: { name, avatar, modePref, rcBalance, threatLevel }
  stats: { totalTasks, pomodoros, wins, losses, lastActive }
/tasks/{uid}/{taskId}/
  { title, done, rcReward, createdAt }
/journals/{uid}/{entryId}/
  { mood, text, createdAt, visibility: "ghoul" }
/battles/{battleId}/
  { players: {p1, p2}, state: {...}, winner, rcStakes, createdAt }
/chat/ghoulRooms/{roomId}/messages/{msgId}/
  { uid, displayName, text, createdAt }
```

## Firebase Security Rules

```json
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
```

## API Routes Example

```javascript
// pages/api/award-pomodoro.js
import { verifyIdToken } from 'firebase-admin/auth';
import { getDatabase } from 'firebase-admin/database';
import admin from 'firebase-admin';

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: process.env.FIREBASE_DATABASE_URL
  });
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  const { token } = req.body;
  try {
    const decodedToken = await verifyIdToken(token);
    const uid = decodedToken.uid;

    // Server-side RC award logic
    const db = getDatabase();
    const userRef = db.ref(`users/${uid}/profile/rcBalance`);
    
    await userRef.transaction(currentBalance => (currentBalance || 0) + 5);
    
    res.status(200).json({ success: true });
  } catch (error) {
    res.status(401).json({ error: 'Unauthorized' });
  }
}
```

## RC Cell Economy

- **Earning**:
  - Complete task: 1-10 RC based on difficulty
  - Pomodoro completion: 3-5 RC per session
  - Win battle: Stake returned + 10-50 RC bonus
- **Spending**:
  - Cosmetic skins: 20-200 RC
  - Kagune unlocks: 100-1000 RC
  - Special moves: Small cost per use
- **Anti-farming**: Cooldowns, daily caps, server validation

## Deployment

### Vercel (Recommended)
1. Push to GitHub
2. Connect to Vercel
3. Add environment variables
4. Deploy

### Firebase Hosting
```bash
npm run build
firebase deploy
```

## Roadmap

1. **Core MVP (Week 1-2)**
   - Auth integration
   - Dashboard with tasks and Pomodoro
   - Theme toggle
   - Basic RC system

2. **Enhanced Features (Week 3-4)**
   - Journal system
   - Realtime chat
   - Battle system prototype

3. **Polish & Security (Week 5)**
   - Security hardening
   - UI/UX improvements
   - Performance optimization

4. **Stretch Goals**
   - Advanced animations
   - Matchmaking system
   - Mobile app

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the MIT License.

## Acknowledgments

- Original BlackReaper concept and design
- Tokyo Ghoul inspiration
- Firebase and Next.js communities

---

For the original Vanilla JS + Flask version, see the root README.md.
