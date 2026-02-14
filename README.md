# Layla's World

A collection of colorful, kid-friendly educational web games built for a 2nd grader. Touch-friendly, sound-enabled, and progress-tracked.

## Games

### Hangman
Guess the word letter by letter with three difficulty levels.
- **Easy**: Short words, category hints, 8 attempts
- **Medium**: Medium words, first letter revealed, 6 attempts
- **Hard**: Long words, no hints, 6 attempts
- Word categories: Animals, Food, School, Nature
- Animated hangman character, confetti on wins

### Math Quest
Blast off with math! Solve problems to launch your rocket.
- Addition, subtraction, multiplication practice
- Adaptive difficulty
- Rocket launch animation on streaks

### Spelling Bee
Listen to a word and spell it out.
- Text-to-speech pronunciation
- Grade-appropriate word lists
- Streak tracking and encouragement

## Features

- Sound effects via Web Audio API
- Progress tracking and stats via LocalStorage
- Achievements and streak tracking
- Printable report cards at each game's `/layla/` page
- Mobile-friendly with on-screen keyboards

## Getting Started

```bash
npm install
npm run dev
```

Opens at http://localhost:3001

## Build

```bash
npm run build
npm run preview
```

## Project Structure

```
LaylaWorld/
├── index.html                # Hub — game launcher
├── hangman/
│   ├── index.html            # Hangman game
│   └── layla/index.html      # Hangman report card
├── mathquest/
│   ├── index.html            # Math Quest game
│   └── layla/index.html      # Math Quest report card
├── spellingbee/
│   ├── index.html            # Spelling Bee game
│   └── layla/index.html      # Spelling Bee report card
├── src/
│   ├── main.ts               # Hangman entry point
│   ├── game/                  # Hangman game logic
│   ├── mathquest/             # Math Quest game logic
│   ├── spellingbee/           # Spelling Bee game logic
│   ├── ui/                    # Shared UI (keyboard, display, screens)
│   ├── stats/                 # Progress tracker
│   └── styles/                # CSS per game
├── public/manifest.json       # PWA manifest
├── vite.config.ts
└── tsconfig.json
```

## Tech

TypeScript, Vite, Web Audio API, LocalStorage
