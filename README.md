# Simple Tic-Tac-Toe Web Game

Premium-looking, responsive Tic‑Tac‑Toe built with vanilla HTML, CSS and JavaScript.  
Features include two game modes (2 Players and vs Computer), a polished scoreboard, dark mode, sound effects, and a modern responsive UI.

---

## Add screenshot here
(Replace this text with a screenshot of the game in the repository)

---

## Features

- Classic 3x3 Tic‑Tac‑Toe
- Two game modes:
  - 2 Players (local, same device)
  - vs Computer (smart-ish AI: tries to win, blocks immediate threats, prefers center/corners)
- Clean, premium UI with subtle animations, glassmorphism card and modern typography
- Scoreboard:
  - X wins, O wins, Draws counters
  - Reset Scores button
- Dark mode toggle (uses a CSS class on the `<body>` and transitions smoothly)
- Sound effects with Sound On/Off toggle
  - Placement sound
  - Win chime
  - Draw sound
- Responsive layout:
  - Desktop: board and scoreboard positioned comfortably side-by-side
  - Mobile: stacked layout with touch-friendly controls
- Accessibility enhancements:
  - Buttons and cells can be activated via keyboard (Enter/Space)
  - Clear status messages and ARIA labels

---

## Tech Stack

- HTML5
- CSS3 (variables, grid, flexbox)
- Vanilla JavaScript (modular IIFE design)

No libraries, no build tools — just open and play.

---

## How to run locally

1. Clone the repository:
   git clone https://github.com/yourusername/your-repo-name.git

2. Open the folder and launch the game:
   - Open `index.html` in your browser (double-click or use "Open File" in your browser)

That's it — the game runs entirely in the browser.

---

## How to customize

- Colors & theme:
  - Edit CSS variables at the top of `style.css` (e.g. `--accent-x`, `--accent-o`, `--bg-gradient-start`)
  - Light/dark theme styles are controlled by the `.dark-theme` class and CSS variables.

- Fonts:
  - The project uses "Poppins" via Google Fonts. To change the font, edit the `<link>` in `index.html` and adjust `font-family` in `style.css`.

- Sounds:
  - Sound is synthesized using the Web Audio API in `script.js`. You can adjust frequencies, envelopes, or replace with audio files by modifying the `playSound` function.
  - The Sound toggle controls whether audio plays; the choice is saved in browser localStorage.

---

## Project Structure

- `index.html` — Main markup, controls, and layout
- `style.css` — Styling, responsive rules, animations, theme variables
- `script.js` — All game logic, AI, sounds, UI interactions
- `README.md` — This documentation

---

## Future Improvements

- Harder AI using Minimax algorithm (optimize for perfect play)
- Online multiplayer or WebRTC-based real-time matches
- Persistent global leaderboard (server-side or use a cloud datastore)
- Additional themes and customizable color palettes
- Animated mark drawing (SVG strokes) and more advanced visual polish
- Optional music or per-event sound customization

---

## Notes

- The game persists user preferences (dark mode, sound on/off) and scoreboard in localStorage.
- The AI is intentionally not a full minimax implementation but follows a solid heuristic:
  - win if possible, block immediate threats, pick center, corners, then edges.

Enjoy the game — feel free to fork, improve, and make it your own!
