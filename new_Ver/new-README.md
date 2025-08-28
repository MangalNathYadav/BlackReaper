# BlackReaper - Tokyo Ghoul Inspired Productivity App

BlackReaper is a web application inspired by Tokyo Ghoul that helps you manage tasks, track habits, and battle procrastination. Switch between Human and Ghoul modes as you complete tasks and earn RC cells.

## Features

### Core Features
- **Authentication**: Email, anonymous, and Google sign-in options
- **Dashboard**: Task management with Pomodoro timer
- **Theme Switching**: Toggle between Human (light) and Ghoul (dark) modes with animations
- **Battle System**: Battle opponents to level up your productivity
- **Journal**: Track your progress and thoughts
- **Statistics**: View your productivity stats and progress

### Advanced Features
- **Offline Support**: Works offline with service worker caching
- **Real-time Sync**: Data synchronization between devices
- **Notifications**: Task reminders and achievement notifications
- **Achievements**: Unlock achievements as you complete tasks and reach milestones
- **Progressive Web App (PWA)**: Install BlackReaper on your device

## Tech Stack

- **Frontend**: HTML, CSS, Vanilla JavaScript
- **Backend**: Firebase (Authentication and Realtime Database)
- **Storage**: Base64-encoded images stored in Firebase RTDB
- **Offline**: Service Worker, IndexedDB, Local Storage

## File Structure

```
├── index.html               # Landing page and authentication
├── dashboard.html           # Task management and Pomodoro
├── battle.html              # Battle system
├── journal.html             # Journal entries
├── stats.html               # Statistics and progress
├── profile.html             # User profile and settings
├── loading.html             # Offline fallback page
├── service-worker.js        # Service worker for offline functionality
├── manifest.json            # PWA manifest
├── animation_sprites/       # Animation frame sprites
├── firebase/                # Firebase configuration and utilities
│   ├── config.js            # Firebase initialization
│   ├── auth.js              # Authentication functions
│   ├── database.js          # Database operations
│   ├── state.js             # Application state management
│   └── ui.js                # UI utilities
└── assets/
    ├── css/                 # Stylesheets
    │   ├── style.css        # Global styles
    │   ├── auth-forms.css   # Authentication form styles
    │   ├── dashboard-enhanced.css # Dashboard styles
    │   └── profile.css      # Profile page styles
    ├── js/                  # JavaScript files
    │   ├── main.js          # Main application logic
    │   ├── app.js           # Central application entry point
    │   ├── dashboard.js     # Dashboard functionality
    │   ├── battle.js        # Battle system
    │   ├── journal.js       # Journal functionality
    │   ├── stats-tracking.js # Statistics tracking
    │   ├── profile.js       # User profile management
    │   ├── pomodoro.js      # Pomodoro timer
    │   ├── theme-sync.js    # Theme synchronization
    │   ├── theme-animator.js # Theme animation effects
    │   ├── ghoul-animation.js # Ghoul-specific animations
    │   ├── theme-animation-loader.js # Animation loader
    │   ├── ui-components.js # Reusable UI components
    │   ├── form-validator.js # Form validation utilities
    │   ├── animator.js      # Animation utilities
    │   ├── notifications.js # Notification management
    │   ├── achievements.js  # Achievement tracking
    │   ├── data-sync.js     # Data synchronization
    │   └── service-worker-registration.js # Service worker registration
    ├── audio/               # Audio files
    │   ├── kagune-activate.mp3  # Kagune activation sound
    │   ├── kagune-deactivate.mp3 # Kagune deactivation sound
    │   └── tab-switch.mp3   # Tab switching sound
    └── images/              # Image assets
        └── placeholder-frame.png # Placeholder image
```

## New Additions

### Progressive Web App (PWA) Support
- **Service Worker**: Caches assets for offline use
- **Manifest**: Allows installation on devices
- **Offline Support**: Works without internet connection

### Enhanced User Experience
- **Notifications**: Native browser notifications for tasks and achievements
- **Achievements System**: Track progress and unlock achievements
- **Theme Animations**: Animated transitions between Human and Ghoul modes

### Data Management
- **Offline Data Sync**: Stores changes when offline and syncs when online
- **Data Caching**: Improves performance and enables offline usage
- **Real-time Sync**: Keeps data synchronized across devices

## Getting Started

1. Clone the repository
2. Configure Firebase (update `firebase/config.js` with your Firebase credentials)
3. Open `index.html` in your browser or deploy to a web server

## Development

### Prerequisites
- Firebase account
- Web server (for local development, you can use Live Server in VS Code)

### Setup
1. Create a Firebase project at [https://console.firebase.google.com/](https://console.firebase.google.com/)
2. Enable Authentication (Email/Password and Anonymous) and Realtime Database
3. Update `firebase/config.js` with your Firebase project credentials
4. Deploy Firebase security rules from `firebase-rules.json`

## Deployment

### Hosting Options
- Firebase Hosting
- GitHub Pages
- Netlify
- Vercel

### Steps
1. Build the project (no build step required, it's vanilla JS)
2. Deploy to your hosting provider of choice
3. Configure custom domain (optional)

## License

[MIT License](LICENSE)

## Acknowledgements

- Tokyo Ghoul - Inspiration for the theme
- Firebase - Authentication and Realtime Database
- Service Worker Cookbook - Service worker implementation examples
