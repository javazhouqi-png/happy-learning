# Happy Learning · Online Learning Platform for Primary Students

> A frontend for an online learning website aimed at primary-school students, covering core subjects such as Chinese / Math / English, interactive quizzes, animated explainer videos, learning-progress tracking, and a parent view panel. Bright colors and simple interactions, with gamified incentives (points & badges) and full responsive support for desktop and mobile.

This project was built from a design file (Ardot) into a runnable frontend using **React 18 + Vite 5 + CSS Modules**. Components are clearly separated, state management is well-structured, and interactions are real and usable.

---

## ✨ Features

- **Three core subject modules**: Chinese, Math, English subject cards with distinct color schemes and progress bars
- **Interactive quizzes**: pick an answer → submit → instant correctness feedback with animated response; correct answers grant +10 points automatically
- **Animated explainer videos**: video cards with thumbnail, play button, and duration badge
- **Gamified incentives**: growth panel (level / points / streak days) + badge wall (earned / locked states)
- **Learning progress tracking**: this-week study-time bar chart + three-subject mastery visualization
- **Parent view panel**: child profile, today's activity timeline, eye-rest & screen-time toggles (live switching)
- **Responsive layout**: the desktop three-column layout collapses to a single column on mobile, with touch-friendly tap targets
- **Real interactions**: mobile hamburger drawer navigation, smooth anchor scrolling, state-driven tab switching
- **Fun layer** (see below): celebrations, sound effects, a floating mascot, easter eggs, and a richer achievement wall

---

## 🎉 Fun Layer

A lightweight "fun layer" is wired in at the app root (`src/main.jsx`: `AppProvider` → `FunProvider` → `App`), exposing a single `useFun()` hook so business components stay clean and the core reducer is untouched.

- **`FunProvider` / `useFun()`** (`src/components/fun/FunContext.jsx`): central celebration & feedback API — `celebrate({ title, emoji, confetti, tone })` toasts, `sound(type)` for audio cues, `setMood(mood, duration)` to drive the mascot, and `unlockSecret()`.
- **`CelebrationLayer`** (`src/components/fun/CelebrationLayer.jsx`): fixed, non-blocking toast + pure-CSS confetti (36 randomized pieces). Automatically disabled under `prefers-reduced-motion`.
- **`Mascot`** ("星宝", bottom-right): floats gently; reacts to mood with facial expressions and speech bubbles; 7 quick clicks unlock a secret badge.
- **`FunWatchers`** (`src/components/fun/FunWatchers.jsx`): a side-effect-only watcher that triggers celebrations + sounds on level-up, new badge unlock, and study streaks — without mutating app state.
- **Sound effects** (`src/utils/sound.js`): native Web Audio API (no third-party library) with recipes `correct / wrong / ding / fanfare / levelup / egg`. Respects the parent audio toggle and fails silently when audio is unavailable.
- **Easter eggs**: 7 clicks on the mascot → secret "神秘探索者" (Mystery Explorer) badge + confetti; 5 clicks on the header logo within 2s → confetti burst.
- **`AchievementWall`** (`src/components/sections/AchievementWall.jsx`): badge wall that appends a `SECRET_BADGE` once the secret is unlocked.
- **Fun copy** centralized in `src/data/fun.js` (`PRAISE`, `ENCOURAGE`, `LEVEL_UP`, `BADGE_UNLOCK`, `EGG_MESSAGES`, `MASCOT_LINES`).

---

## 🛠 Tech Stack

| Category | Choice |
| --- | --- |
| Framework | React 18 (function components + Hooks) |
| Build tool | Vite 5 |
| Styling | CSS Modules (component-scoped) |
| State | React Context + `useReducer` (centralized) |
| Language | JavaScript (JSX) |
| Fonts | Fredoka (headings) / Quicksand (body) — rounded, friendly, legible |
| Icons | Fully inline SVG, zero emoji / Unicode symbols |

---

## 🚀 Quick Start

### Requirements

- Node.js ≥ 18
- npm ≥ 9

### Install & Run

```bash
# install dependencies
npm install

# start dev server (default http://localhost:5173/)
npm run dev

# production build, output to dist/
npm run build

# preview the production build locally
npm run preview
```

---

## 📁 Project Structure

```
happy-learning/
├─ index.html                 # HTML entry
├─ vite.config.js             # Vite config (React plugin)
├─ scripts/
│  └─ ssr-check.mjs           # browser-free render smoke test (catches first-paint crashes)
├─ docs/
│  └─ EXAMPLES.md             # component / state usage & extension examples
├─ public/
│  └─ star.svg                # mascot / brand icon asset
├─ src/
│  ├─ main.jsx                # React render entry (HashRouter + AppProvider + FunProvider)
│  ├─ index.css               # global design tokens (:root CSS variables)
│  ├─ App.jsx                 # route assembly: compose pages & shared sections
│  ├─ data/
│  │  ├─ content.js           # content & business data + pure-function utils (data/view split)
│  │  └─ fun.js               # fun copy & messages (praise, eggs, mascot lines)
│  ├─ state/
│  │  └─ AppContext.jsx       # global state: reducer + derived + actions + persistence
│  ├─ utils/
│  │  └─ sound.js             # Web Audio API sound effects (no library)
│  └─ components/
│     ├─ ExerciseEngine.jsx    # quiz engine (per-question scoring + wrong-answer review)
│     ├─ VideoModal.jsx        # video playback modal (simulated progress + watch scoring)
│     ├─ fun/                  # fun layer
│     │  ├─ FunContext.jsx     # FunProvider + useFun()
│     │  ├─ FunWatchers.jsx    # level-up / badge / streak side-effect watcher
│     │  ├─ CelebrationLayer.jsx
│     │  ├─ CelebrationLayer.module.css
│     │  ├─ Mascot.jsx
│     │  └─ Mascot.module.css
│     ├─ ui/                  # reusable UI primitives
│     │  ├─ Icon.jsx           # inline SVG icon set
│     │  ├─ Button.jsx         # button (primary / secondary / ghost variants)
│     │  ├─ ProgressBar.jsx    # progress bar
│     │  ├─ Pill.jsx           # points / badge pill
│     │  ├─ SectionHeading.jsx # section title
│     │  ├─ SubjectCard.jsx    # subject card
│     │  └─ VideoCard.jsx      # video card
│     ├─ sections/            # homepage business sections (top to bottom)
│     │  ├─ Header.jsx         # top nav (with mobile drawer)
│     │  ├─ Hero.jsx           # hero + mascot
│     │  ├─ SubjectModules.jsx # three core subjects
│     │  ├─ InteractiveExercises.jsx # interactive quizzes (answer + points)
│     │  ├─ AnimatedVideos.jsx # animated videos
│     │  ├─ Gamification.jsx   # gamified incentives
│     │  ├─ ProgressTracking.jsx # learning progress tracking
│     │  ├─ AchievementWall.jsx # badge wall (incl. secret badge)
│     │  ├─ ParentPanel.jsx    # parent view panel (today's screen time / toggles)
│     │  ├─ ResponsiveShowcase.jsx # responsive phone mockup
│     │  ├─ FinalCTA.jsx       # bottom call-to-action
│     │  └─ Footer.jsx         # footer
│     └─ pages/               # route-level pages
│        ├─ Home.jsx           # homepage (assembles business sections)
│        ├─ SubjectPage.jsx    # subject page (lessons / exercises / videos tabs)
│        └─ VideoLibrary.jsx   # animated classroom (subject filter)
```

---

## 🎨 Design System

Design tokens live in the `:root` variables of `src/index.css`, kept consistent with the original design file for easy theme-wide adjustments.

### Colors

| Purpose | Color | Value |
| --- | --- | --- |
| Primary (blue) | Primary | `#4D96FF` |
| Chinese (pink) | Chinese | `#FF6B9D` |
| English / progress (green) | English | `#3DCA6E` |
| Math / accent (orange) | Math | `#FF9F45` |
| Gamification (purple) | Game | `#7A5CFF` |
| Warm white background | Bg | `#FFF8F0` |

### Radius & Shadows

- Card radius: `--radius-card: 24px`
- Button radius: `--radius-btn: 999px`
- Shadows: `--shadow-soft` / `--shadow-card` two-level soft elevation

### Fonts

- Headings: `Fredoka` (rounded, playful)
- Body: `Quicksand` (clear, friendly)

> When the fonts are not installed locally, the browser falls back to a system sans-serif. For production, we recommend importing them via `@font-face` or a font CDN.

---

## 🧩 State Management

Global state is managed centrally by `src/state/AppContext.jsx`, using a **Context + useReducer** one-way data flow:

- `useApp()` exposes `{ state, derived, actions }` — raw state, derived calculations, and stable action functions;
- Components only dispatch intent through `actions`, never mutating `state` directly; derived data is computed centrally via `useMemo`, avoiding scattered duplicate logic;
- State is written to `localStorage` on every change (key `happy-learning-state-v1`), surviving refreshes; write failures (e.g. private mode) are silently ignored and do not affect usage.

### Raw state (`state`)

| Field | Type | Description |
| --- | --- | --- |
| `points` | number | cumulative points (finish lesson +15 / correct answer +10 / watch video +5) |
| `completedLessons` | `{ [lessonId]: true }` | completed lessons index |
| `quizBySubject` | `{ [subjectId]: { correct, total } }` | per-subject quiz totals |
| `wrongBySubject` | `{ [subjectId]: { [questionId]: true } }` | wrong-answer notebook (supports review mode) |
| `videosWatched` | `{ [videoId]: true }` | watched videos index |
| `studySeconds` | number | cumulative study seconds (all-time) |
| `todayStudySec` | number | today's study seconds (auto-resets across days) |
| `todayDate` | string | the date for today's duration, used to zero out by natural day |
| `streakDays` | number | consecutive study-day streak |
| `lastActiveDate` | string | most recent active date (local date) |
| `parent` | `{ dailyLimitMin, eyeRest, sound }` | parent settings |
| `history` | `Array<{ ts, type, detail }>` | learning activity feed, max 50 entries, newest first |

### Actions (`actions`)

| Method | Signature | Description |
| --- | --- | --- |
| `completeLesson` | `(lessonId, subjectId, durationMin)` | finish a lesson (idempotent, no double-scoring) |
| `answerQuiz` | `(subjectId, correct, total, { wrongIds, correctIds })` | submit quiz, maintain wrong-answer notebook |
| `watchVideo` | `(videoId, durationSec, subjectId)` | watch a video (idempotent) |
| `recordStudy` | `(seconds)` | append study time (zeroes across days) |
| `updateParent` | `(patch)` | update parent settings (shallow merge) |
| `clearWrong` | `(subjectId)` | clear a subject's wrong-answer notebook |
| `reset` | `()` | clear all progress |

### Derived data (`derived`, read directly by components)

`level` / `levelTitle` (level & title), `nextLevelPoints` / `levelProgress` (level-up progress),
`badges` / `unlockedCount` (badge wall), `mastery` (three-subject mastery percentage),
`wrongCountBySubject` (wrong answers per subject), `todayStudyMin` / `dailyLimitMin` / `dailyRemainingMin` / `dailyOverLimit` (today's screen time).

### Edge Cases & Handling

- **Corrupted / old storage**: `loadState` force-casts `points` etc. to numbers, falls back to defaults for missing fields; on parse error it falls back to the default state entirely — **never throws a blank screen**.
- **Double-scoring**: lesson / video completion are idempotently protected; repeated clicks do not add points again.
- **Cross-day reset**: `todayStudySec` zeroes by local natural day; the parent daily limit is enforced per "day" rather than across the whole lifetime.
- **Streak**: if already recorded today, no extra +1; if active yesterday, +1; if a gap is earlier, reset to 1. Uses local date to avoid UTC midnight miscalculation.
- **Quiz guardrails**: `safeInt` collapses `undefined`/negative/NaN to safe values; submission is blocked until all questions are answered.
- **Wrong-answer self-cleanup**: answering correctly during review removes the item from the notebook immediately.

---

## 📚 Component & State Usage Examples

See [`docs/EXAMPLES.md`](./docs/EXAMPLES.md) for more runnable examples. Common snippets:

```jsx
import { useApp } from '../state/AppContext.jsx'
import { getSubject, levelTitle } from '../data/content.js'

function MyComponent() {
  const { state, derived, actions } = useApp()
  // read derived data
  console.log(derived.levelTitle, derived.points, derived.mastery.math)
  // dispatch actions (idempotent, components need not know reducer details)
  actions.completeLesson('ma-1', 'math', 8)
  return <p>{getSubject('math').name} mastery {derived.mastery.math}%</p>
}
```

Adding a new subject (data-driven, no component changes needed):

```js
// src/data/content.js —— add an entry to SUBJECTS, and supply matching LESSONS / QUIZZES / VIDEOS keys
export const SUBJECTS = [ /* ... */ { id: 'science', name: 'Science', color: '#2bb3c0', icon: 'sparkle', tagline: '…', desc: '…' } ]
```

Using the fun layer:

```jsx
import { useFun } from '../components/fun/FunContext.jsx'

function ExerciseFooterView() {
  const { celebrate, sound, setMood } = useFun()
  const onAllCorrect = () => {
    celebrate({ title: 'Perfect!', emoji: '🏆', confetti: true })
    sound('fanfare')
    setMood('cheer', 2200)
  }
  return <button onClick={onAllCorrect}>Submit</button>
}
```

---

## ♿ Accessibility & Best Practices

- Semantic tags (`<header>` / `<main>` / `<section>` / `<footer>` / `<nav>`)
- Key interactive elements carry `aria-label` and `role`
- `:focus-visible` focus ring for keyboard reachability
- Animations auto-degrade under `prefers-reduced-motion`
- Color blocks uniformly use `currentColor` and `color-mix` for easy theming

---

## 📦 Build Output

`npm run build` outputs to `dist/`, a static bundle deployable to any static host (e.g. Nginx, GitHub Pages, EdgeOne Pages, etc.).

---

## 📄 License

This project is open-sourced under the [MIT License](./LICENSE). See the `LICENSE` file for details.
