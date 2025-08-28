# BlackReaper v2

A Tokyo Ghoul inspired productivity app that helps you manage tasks, track habits, and battle procrastination.

## Overview

BlackReaper is a web application designed to gamify productivity with Tokyo Ghoul-inspired theming. The app features a dual-mode system (Human and Ghoul) with different UI themes and behaviors.

## Features

- **Human/Ghoul Mode**: Toggle between two distinct themes, each with unique colors and behaviors.
- **Pomodoro Timer**: Focus sessions with customizable timers to enhance productivity.
- **Task Management**: Create, track, and complete daily tasks.
- **RC Cell System**: Earn RC cells by completing tasks and focus sessions.
- **Battle System**: Fight procrastination by battling opponents with your kagune.
- **Journal**: Track your thoughts and progress.
- **Stats & Analytics**: Visualize your productivity data.
- **Achievements**: Unlock achievements as you progress.
- **Profile Management**: Customize your user profile.
- **PWA Support**: Install as a Progressive Web App for offline usage.
- **Firebase Integration**: Real-time data sync and authentication.

## Tech Stack

- HTML5
- CSS3
- JavaScript (ES6+)
- Firebase (Authentication, Realtime Database, Storage)
- Progressive Web App technologies
- Service Workers for offline functionality

## App Structure

### Main Pages
- `index.html`: Login/signup page
- `dashboard.html`: Main user dashboard
- `profile.html`: User profile management
- `battle.html`: Kagune battle arena
- `journal.html`: User journal/log
- `stats.html`: User statistics and analytics

### Directory Structure

```
v2/
├── assets/
│   ├── audio/               # Sound effects
│   │   ├── kagune-activate.mp3
│   │   ├── kagune-deactivate.mp3
│   │   └── tab-switch.mp3
│   ├── css/                 # Stylesheet files
│   │   ├── auth-forms.css
│   │   ├── dashboard-enhanced.css
│   │   ├── profile.css
│   │   └── style.css
│   ├── images/              # Image assets
│   │   └── placeholder-frame.png
│   └── js/                  # JavaScript files
│       ├── battle.js
│       ├── dashboard.js
│       ├── journal.js
│       ├── main.js
│       ├── notifications.js
│       ├── service-worker-registration.js
│       ├── stats.js
│       └── theme-animator.js
├── firebase/                # Firebase integration modules
│   ├── auth.js
│   ├── config.js
│   ├── database.js
│   ├── firebase-bridge.js
│   ├── firebase.js
│   ├── state.js
│   └── ui.js
├── battle.html              # Kagune battle system page
├── dashboard.html           # Main dashboard page
├── index.html               # Landing/authentication page
├── journal.html             # Journal page
├── manifest.json            # PWA manifest
├── profile.html             # User profile page
├── README.md                # Project documentation
├── service-worker.js        # PWA service worker
└── stats.html               # Statistics page
```

## Core Components

### Firebase Integration

The app uses Firebase for backend functionality:

- **Authentication**: User login, registration, and session management with `auth.js`
- **Realtime Database**: Store and sync user data, tasks, and journal entries with `database.js`
- **Bridge Module**: `firebase-bridge.js` provides a unified API for common operations
- **State Management**: `state.js` handles real-time state updates and subscriptions

### Human/Ghoul Mode System

The dual-mode system changes the app's appearance and behavior:

- **Human Mode**: Light theme, standard productivity features
- **Ghoul Mode**: Dark theme, enhanced features, different animations
- **Theme Toggle**: Switch between modes with customizable transitions

### Task Management

- Create, edit, and delete tasks
- Set priorities and categories
- Mark tasks as complete to earn RC cells
- Track completion statistics

### Kagune Battle System

- Train and develop your kagune (special ability from Tokyo Ghoul)
- Battle against opponents to earn RC cells
- Different kagune types (Rinkaku, Ukaku, Koukaku, Bikaku) with unique stats
- Unlock special abilities as you progress

## Getting Started

1. Clone the repository
2. Set up Firebase project and add your configuration to `firebase/config.js`
3. Copy audio files and animation sprites to their respective folders
4. Deploy to a web server or run locally with a development server

## PWA Features

BlackReaper v2 is designed as a Progressive Web App (PWA) with:

- **Offline Support**: Service worker caches assets for offline use
- **Installable**: Add to home screen on mobile devices
- **Responsive Design**: Works on desktop, tablet, and mobile
- **Push Notifications**: Get reminded about tasks and streaks

## Credits

- Inspired by Tokyo Ghoul anime/manga
- Icons from Font Awesome
- Animations created with CSS and custom sprite sheets

## License

MIT License

---

&copy; 2025 BlackReaper
