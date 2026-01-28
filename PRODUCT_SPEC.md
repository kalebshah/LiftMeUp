# LiftMeUp - Workout Tracker App

## Product Specification

### Overview
LiftMeUp is a gamified workout tracking app designed for a 3-day lifting routine. The app uses Duolingo-style motivation mechanics to keep users engaged while providing comprehensive workout logging and progress tracking.

### Target Users
- Beginner to intermediate lifters following a structured 3-day split
- Users who respond well to gamification and visual progress
- Mobile-first users who need one-handed, quick interactions

---

## User Stories

### Core Workout Flow
1. **As a user**, I want to see my suggested workout for today so I don't have to think about what to do
2. **As a user**, I want to see my last 7 workouts to understand my recent training history
3. **As a user**, I want to be warned if I'm repeating the same workout back-to-back
4. **As a user**, I want to see what I lifted last time before starting a workout
5. **As a user**, I want to log each set one at a time with minimal friction
6. **As a user**, I want to quickly "repeat last time" but still confirm each set
7. **As a user**, I want a rest timer between sets

### Gamification
8. **As a user**, I want to earn XP for completing workouts to feel accomplished
9. **As a user**, I want to maintain streaks to build habits
10. **As a user**, I want to earn badges for achievements to feel rewarded
11. **As a user**, I want to see my level and progress toward the next level
12. **As a user**, I want weekly quests to give me extra goals

### Progress Tracking
13. **As a user**, I want to see my weekly volume trends
14. **As a user**, I want to track PRs for each exercise
15. **As a user**, I want to see strength progression charts
16. **As a user**, I want to track my consistency over time

### Post-Workout
17. **As a user**, I want to log how I felt after each workout
18. **As a user**, I want to celebrate completing a workout
19. **As a user**, I want to add notes about my workout

---

## Database Schema

### LocalStorage Keys

```typescript
interface User {
  id: string;
  name: string;
  createdAt: string;
  xp: number;
  level: number;
  currentStreak: number;
  longestStreak: number;
  lastWorkoutDate: string | null;
  streakFreezeAvailable: boolean;
  streakFreezeLastUsed: string | null;
}

interface WorkoutDefinition {
  id: 1 | 2 | 3;
  name: string;
  description: string;
  exercises: ExerciseDefinition[];
}

interface ExerciseDefinition {
  id: string;
  name: string;
  sets: number;
  repRange: [number, number];
  weightRange: [number, number];
  unit: string; // "lbs total" | "lbs/side" | "lbs/hand" | "lbs"
}

interface WorkoutLog {
  id: string;
  date: string; // ISO date
  workoutTypeId: 1 | 2 | 3;
  startTime: string;
  endTime: string | null;
  duration: number; // minutes
  totalVolume: number;
  notes: string;
  isComplete: boolean;
  setLogs: SetLog[];
  checkIn: CheckIn | null;
}

interface SetLog {
  id: string;
  exerciseId: string;
  setNumber: number;
  targetReps: [number, number];
  actualReps: number;
  weight: number;
  difficulty: 'easy' | 'ok' | 'hard' | null;
  timestamp: string;
}

interface CheckIn {
  fatigue: number; // 1-5
  difficulty: number; // 1-5
  recovery: number; // 1-5
  sleepQuality: number; // 1-5
  motivation: number; // 1-5
  pain: 'none' | 'knee' | 'shoulder' | 'back' | 'other';
  notes: string;
}

interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  earnedAt: string | null;
}

interface Quest {
  id: string;
  name: string;
  description: string;
  target: number;
  current: number;
  xpReward: number;
  startDate: string;
  endDate: string;
  isComplete: boolean;
}

interface PersonalRecord {
  exerciseId: string;
  weight: number;
  reps: number;
  date: string;
  estimated1RM: number;
}
```

---

## Screens List & Navigation

### Navigation Structure
```
App
├── Home (/)
│   ├── Calendar Picker
│   ├── Last Workouts Panel
│   └── Suggested Workout Button
├── Workout Selection (/workout/select)
│   ├── Workout 1/2/3 Cards
│   └── Pre-workout Summary
├── Active Workout (/workout/active)
│   ├── Exercise Card
│   ├── Set Logger
│   └── Rest Timer
├── Workout Complete (/workout/complete)
│   ├── Celebration Screen
│   ├── Stats Summary
│   └── Check-in Survey
├── Progress Dashboard (/progress)
│   ├── Weekly Overview
│   ├── Streak & XP
│   ├── Charts
│   └── PRs & Badges
└── Settings (/settings)
    ├── Profile
    ├── Accessibility
    └── Data Export
```

### Screen Descriptions

1. **Home Screen**
   - Hero section with date and greeting
   - Quick action: "Start Today's Workout"
   - Last 7 workouts list with expandable details
   - Weekly calendar strip
   - Streak and XP summary in header

2. **Workout Selection**
   - Three workout cards with muscle group icons
   - "Recommended" badge on suggested workout
   - Warning for back-to-back repeats
   - "Last time" summary for each workout

3. **Active Workout**
   - Full-screen exercise focus
   - Large set counter (1/3, 2/3, etc.)
   - Weight and rep inputs with +/- steppers
   - "Repeat Last Time" quick-fill button
   - Rest timer (auto-start option)
   - Progress bar for overall workout

4. **Workout Complete**
   - Confetti/celebration animation
   - XP earned breakdown
   - Volume vs last time comparison
   - PRs achieved callout
   - Check-in survey (swipeable MCQ)
   - Badge earned (if any)

5. **Progress Dashboard**
   - Weekly workout count ring
   - Streak flame animation
   - Level progress bar
   - Volume chart (weekly)
   - Per-exercise strength progression
   - Recent PRs carousel
   - Badges collection

---

## Core Components

### State Management
Using React Context + useReducer for global state:

```typescript
// AppContext - Global state
- user: User
- workoutLogs: WorkoutLog[]
- activeWorkout: WorkoutLog | null
- quests: Quest[]
- badges: Badge[]
- personalRecords: PersonalRecord[]

// Actions
- START_WORKOUT
- LOG_SET
- COMPLETE_EXERCISE
- COMPLETE_WORKOUT
- SUBMIT_CHECKIN
- EARN_XP
- EARN_BADGE
- UPDATE_STREAK
```

### Key Components
1. `<CalendarStrip />` - Horizontal scrollable week view
2. `<WorkoutCard />` - Workout type selection card
3. `<ExerciseLogger />` - Full-screen set logging UI
4. `<SetInput />` - Reps/weight input with steppers
5. `<RestTimer />` - Countdown timer with sound
6. `<ProgressRing />` - Circular progress indicator
7. `<XPBar />` - Animated experience bar
8. `<StreakFlame />` - Animated streak counter
9. `<BadgeCard />` - Badge display with unlock animation
10. `<CelebrationModal />` - Confetti and stats display

---

## Gamification System

### XP Rewards
| Action | XP |
|--------|-----|
| Complete a set | 5 |
| Complete an exercise | 15 |
| Complete a workout | 50 |
| Beat last time's volume | 25 |
| Set a new PR | 40 |
| Complete weekly quest | 100 |
| Maintain streak (per day) | 10 |

### Levels
- Level 1: 0 XP
- Level 2: 100 XP
- Level 3: 250 XP
- Level 4: 500 XP
- Level 5: 1000 XP
- Level 6: 1750 XP
- Level 7: 2750 XP
- Level 8: 4000 XP
- Level 9: 5500 XP
- Level 10: 7500 XP
- (continues with increasing gaps)

### Badges
1. **First Steps** - Complete your first workout
2. **Consistency King** - 7-day streak
3. **Iron Will** - 30-day streak
4. **PR Hunter** - Set 5 personal records
5. **Volume King** - 10,000 lbs in one workout
6. **Early Bird** - Workout before 7am
7. **Night Owl** - Workout after 9pm
8. **Perfect Week** - 3 workouts in one week
9. **Variety Pack** - Do all 3 workout types in a week
10. **Level Up** - Reach level 5

### Weekly Quests (Rotating)
- Complete 3 workouts this week
- Add +5 lbs to any lift
- Log 50 total sets
- Maintain your streak for 7 days
- Try a new workout type

---

## Motivational Microcopy

### Pre-Workout
- "Let's crush it! 💪"
- "Your future self will thank you"
- "Time to get stronger!"
- "Every rep counts"

### During Workout
- "You're doing amazing!"
- "Push through! You've got this!"
- "One more set closer to your goals"
- "Beast mode: ACTIVATED"

### Post-Workout
- "Workout complete! You're a legend!"
- "Another day, another win 🏆"
- "Gains incoming! 📈"
- "You showed up. That's what matters."

### Streak Messages
- "🔥 X days strong!"
- "Don't break the chain!"
- "You're on fire! Keep it going!"

---

## Technical Requirements

### Performance
- Instant set logging (no loading states)
- Offline-first with localStorage
- < 100ms interaction response time
- Smooth 60fps animations

### Accessibility
- Minimum touch target: 44x44px
- Font size: 16px minimum
- High contrast mode option
- Screen reader support

### Mobile Optimization
- Safe area insets (notch, home indicator)
- Haptic feedback on actions
- Large, thumb-friendly buttons
- Swipe gestures for navigation

