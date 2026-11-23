# DayFlow — Your Day, Simplified

DayFlow is a responsive, HCI-centered personal routine, focus timer, habit tracking, and productivity web application built entirely with **HTML**, **CSS (Tailwind CSS)**, and **Vanilla JavaScript** with persistent `localStorage` data storage.

---

## Key Features

### 1. Tasks & Daily Routine Planner
- Organize tasks into **Morning**, **Afternoon**, and **Evening** routines.
- Filter tasks by routine schedule and track pending tasks via live notification badges.
- Launch a dedicated **Focus Timer** directly from any task card.
- Full create, edit, complete, and soft-delete (move to Recycle Bin) support.

### 2. Focus Timer (Draggable Drum & Custom Presets)
- **Tactile Digital Drum:** Drag Hours, Minutes, or Seconds up and down (touch/mouse drag, scroll wheel, or nudge buttons) to set countdown durations.
- **Saved Quick Timers Grid:** One-tap presets (Pomodoro Study, Short Break, Deep Work Block, Quick Stretch, Workout Interval, Power Nap) with full customization for icon, name, duration, and alarm tone.
- Live progress bar, pause/resume controls, and completion alarm overlay.

### 3. Smart Alarm & Snooze Engine
- Live digital clock and automatic task alarm triggers.
- Synthesized Web Audio API alarm tones (**Gentle Chime**, **Classic Alarm**, **Focus Pulse**, **Zen Bell**) plus optional **Voice Task Announcement** via Web Speech API.
- Flexible snooze intervals (**5, 15, 30, or 60 minutes**) with an active snooze status banner.

### 4. Habit Tracker & Streaks
- Track daily habit targets with incremental (`+1`) logging or one-tap completion.
- Automatic streak counter and overall daily completion progress bar.

### 5. Quick Notes & Folder Organization
- Categorize notes into customizable color-coded folders (**Study**, **Projects**, **Personal**, **Lists**, or custom folders).
- Pin important notes, search across titles/content/folders, and switch between **Grid**, **List**, and **Card** views.

### 6. Productivity Summary
- Visual **Weekly** and **Monthly** completion rate bar charts, task completion metrics, and top habit streak highlights.

### 7. Recycle Bin
- Soft-deletes tasks and notes so you can filter, restore, or permanently delete items anytime.

### 8. Profile & Appearance Customization
- Light and Dark mode themes.
- Custom display photo upload, emoji avatars, or color-coded initials, plus customizable user motto and alarm preferences.

---

## Project Structure

```text
dayflow-webapp/
├── index.html      # Main application layout, views, modals, and alarm overlay
├── css/
│   └── style.css   # Custom typography, scrollbar rules, drum touch-action, and animations
├── js/
│   └── app.js      # State management, localStorage persistence, timer drum, Web Audio engine, and UI rendering
└── README.md       # Project documentation
```

---

## Getting Started

1. Open `dayflow-webapp/index.html` directly in any modern web browser (Chrome, Edge, Firefox, Safari) — no backend server or build step required.
2. Click **Instant Demo Login (Alex)** on the welcome screen (or sign in with `alex@example.com` / `dayflow123`, or create a new local account).
