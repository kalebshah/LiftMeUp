# 💪 LiftMeUp - Gamified Workout Tracker

A mobile-first, Duolingo-style gamified workout tracking app for your 3-day lifting routine. Built with React, TypeScript, and Tailwind CSS.

![LiftMeUp Screenshot](https://via.placeholder.com/800x400/0f172a/f97316?text=LiftMeUp+Workout+Tracker)

## ✨ Features

### Core Workout Flow
- **📅 Calendar View** - Select any day to log workouts
- **🎯 Smart Suggestions** - Recommends workouts based on your history (avoids back-to-back repeats)
- **📊 Last Workouts Panel** - View your last 7 workouts with date, type, duration, and volume
- **⚠️ Repeat Warning** - Warns if you're about to do the same workout twice in a row

### Guided Workout Experience
- **🧙 Workout Wizard** - Step-by-step guided logging, one exercise at a time
- **⏱️ Rest Timer** - Customizable rest periods (60s, 90s, 120s) between sets
- **🔄 Quick Fill** - "Repeat last time" button for quick logging
- **😊😐😤 Difficulty Tracking** - Log how each set felt (Easy/OK/Hard)

### Post-Workout Check-In
- **🎉 Celebration Screen** - Confetti animation and stats summary
- **📝 MCQ Survey** - Track fatigue, difficulty, recovery, sleep, motivation, and pain
- **📈 Volume Comparison** - See how you did vs. last time

### Gamification System
- **⚡ XP Rewards** - Earn XP for sets, exercises, workouts, PRs, and streaks
- **🔥 Streak Tracking** - Animated streak counter with flame effects
- **🏆 Badges** - 12 collectible badges for achievements
- **🎯 Weekly Quests** - Rotating challenges for bonus XP
- **📊 Levels** - Progress through 15 levels with unique titles

### Progress Dashboard
- **📈 Volume Charts** - Weekly volume trends visualization
- **🏅 Personal Records** - Track and celebrate your PRs
- **📊 Weekly Stats** - Workouts, sets, and volume at a glance
- **🏆 Badges Collection** - View earned and locked badges

## 🏋️ Your 3-Day Routine

### Workout 1: Push & Legs 🏋️
| Exercise | Sets × Reps | Weight Range |
|----------|-------------|--------------|
| Incline Chest Press | 3×8-12 | 55-75 lbs |
| Cable Chest Flys | 2×10-15 | 15-25 lbs/side |
| Machine Shoulder Press | 3×8-12 | 45-65 lbs |
| DB Lateral Raises | 2×12-15 | 10-15 lbs/hand |
| Cable Tricep Extensions | 2×10-15 | 25-40 lbs |
| Squats | 3×8-12 | 65-95 lbs |
| Leg Extensions | 2×12-15 | 40-70 lbs |

### Workout 2: Pull & Legs 💪
| Exercise | Sets × Reps | Weight Range |
|----------|-------------|--------------|
| Seated Cable Rows | 3×8-12 | 60-90 lbs |
| Lat Pulldowns | 3×8-12 | 70-100 lbs |
| Bicep Curls | 3×10-12 | 15-25 lbs |
| Lunges | 3×8-10/leg | 20-35 lbs |
| Leg Extensions | 2×12-15 | 40-70 lbs |

### Workout 3: Full Body ⚡
| Exercise | Sets × Reps | Weight Range |
|----------|-------------|--------------|
| Incline Chest Press | 2×8-10 | 55-75 lbs |
| Cable Chest Flys | 2×10-12 | 15-20 lbs/side |
| Seated Cable Rows | 2×8-10 | 60-80 lbs |
| Lat Pulldowns | 2×8-10 | 70-90 lbs |
| DB Lateral Raises | 2×12-15 | 10-12 lbs/hand |
| Bicep Curls | 2×10-12 | 15-20 lbs |
| Cable Tricep Extensions | 2×10-12 | 25-35 lbs |
| Squats or Lunges | 3×8-12 | 65-85 lbs |

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ (recommended: 20.x)
- npm or yarn

### Installation

```bash
# Clone the repository
git clone <your-repo-url>
cd LiftMeUp

# Install dependencies
npm install

# Start the development server
npm run dev
```

The app will be available at `http://localhost:5173`

### Build for Production

```bash
npm run build
npm run preview
```

## 📱 Mobile Installation (PWA)

LiftMeUp works as a Progressive Web App! To install:

1. Open the app in your mobile browser
2. **iOS**: Tap Share → "Add to Home Screen"
3. **Android**: Tap the menu → "Install app" or "Add to Home Screen"

## 🏗️ Tech Stack

- **React 18** - UI framework
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling
- **Framer Motion** - Animations
- **React Router** - Navigation
- **Recharts** - Charts
- **Lucide React** - Icons
- **date-fns** - Date utilities
- **Vite** - Build tool

## 📁 Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── ui/             # Base UI components (Button, Card, etc.)
│   ├── CalendarStrip   # Week calendar picker
│   ├── StreakFlame     # Animated streak display
│   ├── XPBar           # Level/XP progress bar
│   ├── Confetti        # Celebration animation
│   ├── RestTimer       # Workout rest timer
│   └── WorkoutCard     # Workout selection card
├── context/            # React Context for state management
│   └── AppContext      # Global app state
├── data/               # Static data and configurations
│   └── workouts        # Workout definitions, badges, levels
├── pages/              # Route pages
│   ├── Home            # Main dashboard
│   ├── WorkoutSelection# Choose workout type
│   ├── ActiveWorkout   # Guided workout logging
│   ├── WorkoutComplete # Post-workout celebration
│   └── Progress        # Stats and progress dashboard
├── types/              # TypeScript type definitions
└── utils/              # Utility functions
    ├── helpers         # Formatting and utility functions
    └── storage         # localStorage persistence
```

## 💾 Data Storage

All data is stored locally in the browser using localStorage:
- **Offline-first** - Works without internet
- **Instant saves** - Every set logged immediately
- **Data export** - Export your data as JSON

## 🎮 Gamification Details

### XP Rewards
| Action | XP |
|--------|-----|
| Complete a set | +5 |
| Complete an exercise | +15 |
| Complete a workout | +50 |
| Beat last time's volume | +25 |
| Set a new PR | +40 |
| Complete weekly quest | +100 |
| Maintain streak (per day) | +10 |

### Level Progression
| Level | Title | XP Required |
|-------|-------|-------------|
| 1 | Rookie | 0 |
| 2 | Beginner | 100 |
| 3 | Trainee | 250 |
| 4 | Athlete | 500 |
| 5 | Warrior | 1,000 |
| 6 | Champion | 1,750 |
| 7 | Elite | 2,750 |
| 8 | Master | 4,000 |
| 9 | Legend | 5,500 |
| 10 | Titan | 7,500 |

### Badges
- 🎯 **First Steps** - Complete your first workout
- 👑 **Consistency King** - 7-day streak
- 🔥 **Iron Will** - 30-day streak
- 🏆 **PR Hunter** - Set 5 personal records
- 💎 **Volume King** - 10,000 lbs in one workout
- 🌅 **Early Bird** - Workout before 7am
- 🦉 **Night Owl** - Workout after 9pm
- ⭐ **Perfect Week** - 3 workouts in one week
- 🎨 **Variety Pack** - All 3 workout types in a week
- 🌟 **Rising Star** - Reach level 5
- 💯 **Centurion** - 100 total sets
- 🎖️ **Dedicated** - 10 workouts completed

## 🎨 Design Principles

- **Mobile-first** - Designed for one-handed use
- **Big touch targets** - Minimum 44x44px for all interactive elements
- **Instant feedback** - Haptic feedback and sounds
- **Dark theme** - Easy on the eyes in any lighting
- **Motivational** - Encouraging messages throughout

## 📄 License

MIT License - feel free to use and modify!

---

Made with 💪 for lifters who love games
