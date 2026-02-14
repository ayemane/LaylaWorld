# Hangman for Layla

A colorful, playful Hangman game designed for a 2nd grader with difficulty levels, fun sounds, progress tracking, and achievements.

## Features

- **Three Difficulty Levels**
  - **Easy**: Short words (2-5 letters), category hints, 8 attempts
  - **Medium**: Medium words (6-7 letters), first letter revealed, 6 attempts
  - **Hard**: Long words (8+ letters), no hints, 6 attempts

- **Word Categories**: Animals, Food, School, Nature

- **Fun Interactions**
  - Colorful animated hangman character
  - Touch-friendly on-screen keyboard
  - Letter tiles with flip animations
  - Confetti celebration on wins
  - Encouraging messages

- **Sound Effects** (Web Audio API)
  - Key press clicks
  - Correct/wrong letter sounds
  - Win/lose sounds

- **Progress Tracking**
  - Games played and win rate
  - Current and best streak
  - Words mastered list
  - Achievements system
  - Print-friendly report card

## Getting Started

### Prerequisites

- Node.js 18+ installed

### Installation

```bash
# Install dependencies
npm install

# Start development server
npm run dev
```

The game will be available at http://localhost:3001

### Building for Production

```bash
npm run build
npm run preview
```

## Project Structure

```
Hangman/
├── index.html              # Main game page
├── src/
│   ├── main.ts             # App entry point
│   ├── styles/main.css     # All styles
│   ├── game/
│   │   ├── hangman.ts      # Core game logic
│   │   ├── words.ts        # Word lists
│   │   └── sounds.ts       # Sound manager
│   ├── ui/
│   │   ├── keyboard.ts     # On-screen keyboard
│   │   ├── display.ts      # Word & hangman display
│   │   └── screens.ts      # Screen management
│   └── stats/
│       └── tracker.ts      # Progress tracking
├── layla/
│   └── index.html          # Report card page
└── public/
    └── manifest.json       # PWA manifest
```

## Layla's Report Card

Visit `/layla/` to see:
- Total games played
- Win/loss record
- Current and best streak
- Words mastered
- Achievement badges
- Printable report card

## Future Enhancements

- More word categories
- Multiplayer mode
- Custom word input for parents
- Additional educational games
- Full PWA with offline support
