# 🩸 BlackReaper - Kaneki Ken Themed Web App

A psychological, dual-mode productivity dashboard & journaling site inspired by **Kaneki Ken** and Tokyo Ghoul themes.

## 🧠 Overview

BlackReaper is a web application that combines productivity tracking with psychological elements inspired by Tokyo Ghoul. It features two distinct modes:

- **Human Mode**: Light theme with standard to-do functionality and productivity tracking
- **Ghoul Mode**: Dark theme with psychological journaling, corrupted text generation, battles, and ghoul chat

The application allows users to switch between these modes, with an auto-switch feature that activates Ghoul Mode after periods of inactivity.

## ✨ Features

- **RC Cell System**: Earn RC cells for completing tasks and Pomodoro sessions, spend them in battles and customizations
- **Pomodoro Timer**: Tokyo Ghoul themed productivity timer with customizable work/rest periods
- **Kagune Battle System**: Test your strength against other ghouls in battle mode (Ghoul Mode only)
- **Ghoul Chat**: Real-time communication with other users in Ghoul Mode
- **Psychological Journaling**: Track your mental state with unique visualizations
- **Automatic Theme Switching**: Transitions to Ghoul Mode during periods of inactivity

## 💻 Tech Stack

| Layer          | Technologies                                           |
| -------------- | ------------------------------------------------------ |
| Frontend       | HTML5, CSS3, Vanilla JavaScript                        |
| Animation      | CSS Animations, Canvas                                 |
| Backend        | Python (Flask)                                         |
| Database       | Firebase Realtime Database                             |
| Auth / Storage | Firebase Authentication                                |

## 🧱 Project Structure

```
BlackReaper/
├── index.html               # Landing/login page
├── dashboard.html           # Main dashboard
├── journal.html             # Journaling interface
├── profile.html             # User profile and stats
├── battle.html              # Battle arena (Ghoul Mode)
├── assets/
│   ├── css/
│   │   └── style.css        # Main stylesheet
│   ├── js/
│   │   ├── main.js          # Core functionality
│   │   ├── dashboard.js     # Dashboard specific JS
│   │   ├── journal.js       # Journal specific JS
│   │   ├── profile.js       # Profile specific JS
│   │   ├── battle.js        # Battle system logic
│   │   ├── pomodoro.js      # Pomodoro timer functionality
│   │   ├── ghoul-chat.js    # Real-time chat system
│   │   ├── notifications.js # In-app notification system
│   │   ├── analytics.js     # Usage analytics
│   │   └── kagune.js        # Kagune visualization
│   ├── images/              # Image assets
│   │   ├── kagune/          # Kagune type images
│   │   └── opponents/       # Battle opponent images
│   └── audio/               # Audio files
├── firebase/
│   ├── config.js            # Firebase configuration
│   ├── auth.js              # Authentication handlers
│   └── database.js          # Database interactions
├── backend/
│   └── app.py               # Python backend (Flask)
├── run_backend.bat          # Windows backend starter script
└── README.md                # Project documentation
```

## 🚀 Getting Started

### Prerequisites

- Web browser (Chrome/Firefox recommended)
- Python 3.7+ (for backend)
- Node.js and npm (optional, for development)
- Firebase account (for database and authentication)

### Setup Instructions

1. Clone the repository:
```
git clone https://github.com/YourUsername/BlackReaper.git
cd BlackReaper
```

2. Configure Firebase:
   - Create a Firebase project at [firebase.google.com](https://firebase.google.com)
   - Enable Authentication (Email/Password and Anonymous methods)
   - Create a Realtime Database
   - Update `firebase/config.js` with your Firebase credentials
   - Apply security rules from `firebase-rules.json` to your Realtime Database

3. Install Python dependencies:
```
pip install flask flask-cors
```

4. Start the backend server:
```
cd backend
python app.py
```

5. Open `index.html` in your browser or use a local server:
```
# Using Python's built-in server
python -m http.server
```

## 🔑 Features

### ✅ Authentication
- Email/password login
- Anonymous guest access
- User profiles with customizable avatars

### ✅ Dashboard
- Task management with progress tracking
- RC Cell meter (progress visualization)
- Inspirational Kaneki quotes
- Corrupted thought generator (Ghoul Mode)
- Pomodoro Timer with RC Cell rewards

### ✅ Journal
- Mood-based journaling system
- Psychological quotes based on selected mood
- Typing glitch effects
- Entries visible only in Ghoul Mode

### ✅ Profile
- Threat level based on activity
- Kagune unlocks (achievement system)
- Usage statistics
- Account management

### ✅ Battle System (Ghoul Mode)
- Select different opponents with varying difficulty
- Strategic battle mechanics
- Earn RC Cells for victories
- Customizable Kagune types and colors

### ✅ Ghoul Chat (Ghoul Mode)
- Real-time chat with other users in Ghoul Mode
- User presence indicators
- Anonymous ghoul personas

### ✅ Theme Switching
- Toggle between Human and Ghoul modes
- Auto-switch to Ghoul Mode after inactivity
- Persistent theme preference
- Theme-based content visibility

## 🎨 Customization

The application is designed to be easily customizable:

- Change color schemes in `style.css` by modifying CSS variables
- Add new quotes in `dashboard.js` and `backend/app.py`
- Modify animation speeds and effects in `main.js`

## 🧪 Advanced Features

### Implemented Features
- RC Cell reward system for achievements and activities
- Tokyo Ghoul themed Pomodoro timer
- Kagune battle system with multiple opponents and special attacks
- Real-time multiplayer Ghoul chatroom
- Dynamic theme switching with custom event notifications

### Coming Soon
- Speech-to-text journaling
- Voice lines from Kaneki using TTS
- Canvas-based Kagune animation
- Advanced battle mechanics with special abilities

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgments

- Inspired by Tokyo Ghoul and Kaneki Ken's character
- Special thanks to Sui Ishida for creating the Tokyo Ghoul universe
- Built with ❤️ (and a bit of madness)

---

> "I'm not the protagonist of a novel or anything... I'm just a college student who likes to read."
> - Kaneki Ken

---
