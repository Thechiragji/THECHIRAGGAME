/* Tic-Tac-Toe game with scoreboard, dark mode, sounds, and simple AI.
   Vanilla JS, modular style wrapped in an IIFE to avoid polluting global scope.
*/

(function () {
  'use strict';

  /* ---------------------------
     DOM References
     --------------------------- */
  const boardEl = document.getElementById('board');
  const cells = Array.from(document.querySelectorAll('.cell'));
  const statusEl = document.getElementById('status');
  const restartBtn = document.getElementById('restart-btn');
  const resetScoresBtn = document.getElementById('reset-scores');
  const modeButtons = Array.from(document.querySelectorAll('.mode-btn'));
  const darkToggle = document.getElementById('dark-toggle');
  const soundToggle = document.getElementById('sound-toggle');

  const scoreXEl = document.getElementById('score-x');
  const scoreOEl = document.getElementById('score-o');
  const scoreDrawEl = document.getElementById('score-draw');

  /* ---------------------------
     Game state
     --------------------------- */
  const Game = {
    board: Array(9).fill(null), // 'X' | 'O' | null
    currentPlayer: 'X',
    isGameOver: false,
    winner: null,
    winningLine: [],
    mode: 'pvp', // 'pvp' | 'cpu'
    scores: { X: 0, O: 0, D: 0 },
    soundOn: true,
    darkMode: false,
    audioCtx: null
  };

  /* ---------------------------
     Initialization
     --------------------------- */

  // Apply saved settings (localStorage) and initialize UI & events.
  function initializeGame() {
    // Load saved preferences
    applySavedSettings();

    // Attach event listeners to cells
    cells.forEach(cell => {
      cell.addEventListener('click', handleCellClick);
      cell.addEventListener('keydown', (e) => {
        // Allow keyboard activation
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          cell.click();
        }
      });
    });

    // Mode switch buttons
    modeButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        modeButtons.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        const newMode = btn.dataset.mode;
        if (Game.mode !== newMode) {
          Game.mode = newMode;
          resetBoard();
        }
      });
    });

    // Restart & Reset Scores
    restartBtn.addEventListener('click', resetBoard);
    resetScoresBtn.addEventListener('click', resetScores);

    // Dark mode toggle
    darkToggle.addEventListener('change', () => toggleDarkMode(darkToggle.checked));

    // Sound toggle
    soundToggle.addEventListener('change', () => toggleSound(soundToggle.checked));

    // Initialize AudioContext lazily when first needed
    // Start fresh board
    resetBoard();
    updateScoreboard();
    updateStatusMessage();

    // Accessibility: ensure the first cell is focusable
    cells[0].setAttribute('tabindex', '0');
  }

  /* ---------------------------
     Local Storage / Settings
     --------------------------- */
  function applySavedSettings() {
    try {
      const saved = JSON.parse(localStorage.getItem('ttt_settings') || '{}');
      if (typeof saved.soundOn === 'boolean') {
        Game.soundOn = saved.soundOn;
        soundToggle.checked = saved.soundOn;
      }
      if (typeof saved.darkMode === 'boolean') {
        Game.darkMode = saved.darkMode;
        darkToggle.checked = saved.darkMode;
        document.body.classList.toggle('dark-theme', Game.darkMode);
      }
      if (saved.scores && typeof saved.scores === 'object') {
        Game.scores = Object.assign(Game.scores, saved.scores);
      }
    } catch (e) {
      // If parsing fails, ignore and use defaults.
      console.warn('Failed to load settings:', e);
    }
  }

  function saveSettings() {
    const toSave = {
      soundOn: Game.soundOn,
      darkMode: Game.darkMode,
      scores: Game.scores
    };
    try {
      localStorage.setItem('ttt_settings', JSON.stringify(toSave));
    } catch (e) {
      // ignore local storage errors
      console.warn('Failed to save settings:', e);
    }
  }

  /* ---------------------------
     Game Control Functions
     --------------------------- */

  // Initialize or reset the board for a new match
  function resetBoard() {
    Game.board = Array(9).fill(null);
    Game.currentPlayer = 'X';
    Game.isGameOver = false;
    Game.winner = null;
    Game.winningLine = [];
    statusEl.textContent = (Game.mode === 'cpu') ? "Your turn (X)" : "X's turn";
    cells.forEach(cell => {
      cell.className = 'cell';
      cell.removeAttribute('disabled');
      cell.textContent = '';
      cell.setAttribute('aria-pressed', 'false');
    });

    // If vs CPU and CPU should move first (we keep X as player always), do nothing.
    updateStatusMessage();
  }

  // Reset scores to zero
  function resetScores() {
    Game.scores = { X: 0, O: 0, D: 0 };
    saveSettings();
    updateScoreboard();
  }

  // Switch current player (X -> O, O -> X)
  function switchPlayer() {
    Game.currentPlayer = (Game.currentPlayer === 'X') ? 'O' : 'X';
    updateStatusMessage();
  }

  /* ---------------------------
     UI Update Helpers
     --------------------------- */

  // Update the status message based on current game state
  function updateStatusMessage(text) {
    if (text) {
      statusEl.textContent = text;
      return;
    }
    if (Game.isGameOver) {
      if (Game.winner === 'Draw') {
        statusEl.textContent = 'Draw!';
      } else {
        statusEl.textContent = `${Game.winner} wins!`;
      }
    } else {
      if (Game.mode === 'cpu') {
        if (Game.currentPlayer === 'X') {
          statusEl.textContent = 'Your turn (X)';
        } else {
          statusEl.textContent = 'Computer is thinking...';
        }
      } else {
        statusEl.textContent = `${Game.currentPlayer}'s turn`;
      }
    }
  }

  // Update scoreboard DOM
  function updateScoreboard() {
    scoreXEl.textContent = Game.scores.X;
    scoreOEl.textContent = Game.scores.O;
    scoreDrawEl.textContent = Game.scores.D;
  }

  // End game, set flags, highlight winning line and update scores
  function endGame(winner, line = []) {
    Game.isGameOver = true;
    Game.winner = winner === null ? 'Draw' : winner;
    Game.winningLine = line || [];

    // Highlight winning cells
    if (line && line.length === 3) {
      line.forEach(i => {
        const c = cells[i];
        c.classList.add('win');
      });
    }

    // Disable further clicks
    cells.forEach(cell => cell.setAttribute('disabled', 'true'));

    // Update scoreboard counts
    if (winner === 'X') Game.scores.X += 1;
    else if (winner === 'O') Game.scores.O += 1;
    else Game.scores.D += 1;

    saveSettings();
    updateScoreboard();

    // Play appropriate sound
    if (winner === null) playSound('draw');
    else playSound('win');

    updateStatusMessage();
  }

  /* ---------------------------
     Click Handler
     --------------------------- */

  // Handle a cell click by user
  function handleCellClick(e) {
    const index = Number(e.currentTarget.dataset.index);
    if (Game.isGameOver) return;
    if (Game.board[index]) return; // already occupied

    // Player move
    placeMark(index, Game.currentPlayer);

    // After player move, check for win/draw
    const winLine = checkWin(Game.board, Game.currentPlayer);
    if (winLine) {
      endGame(Game.currentPlayer, winLine);
      return;
    }
    if (checkDraw(Game.board)) {
      endGame(null, []);
      return;
    }

    // Switch player (for pvp) or let AI move
    if (Game.mode === 'pvp') {
      switchPlayer();
      playSound('place');
    } else {
      // vs CPU: player is always X; after placing X, trigger computer move
      playSound('place');
      switchPlayer(); // set to O (computer)
      updateStatusMessage();
      // Small delay to simulate thinking
      setTimeout(() => makeComputerMove(), 650);
    }
  }

  // Place a mark on board and update DOM
  function placeMark(index, mark) {
    Game.board[index] = mark;
    const cell = cells[index];
    cell.textContent = mark;
    cell.classList.add(mark.toLowerCase());
    cell.setAttribute('aria-pressed', 'true');
    cell.setAttribute('disabled', 'true');
  }

  /* ---------------------------
     Game Logic - Win / Draw
     --------------------------- */

  // Return winning indices if the symbol has a win, else null.
  function checkWin(board, symbol) {
    const lines = [
      [0,1,2],
      [3,4,5],
      [6,7,8],
      [0,3,6],
      [1,4,7],
      [2,5,8],
      [0,4,8],
      [2,4,6]
    ];
    for (const line of lines) {
      const [a,b,c] = line;
      if (board[a] === symbol && board[b] === symbol && board[c] === symbol) {
        return line;
      }
    }
    return null;
  }

  // Return true if board is full and no winner
  function checkDraw(board) {
    return board.every(cell => cell !== null);
  }

  /* ---------------------------
     Computer AI
     --------------------------- */

  // Make a computer move for 'O'
  function makeComputerMove() {
    if (Game.isGameOver) return;

    // Determine best move index
    const move = computeBestMove(Game.board, 'O', 'X');
    if (move === null || move === undefined) {
      // fallback to any available
      const available = Game.board.map((v,i)=> v ? null : i).filter(v => v !== null);
      if (available.length === 0) return;
      // choose first (deterministic)
      placeMark(available[0], 'O');
    } else {
      placeMark(move, 'O');
    }

    // After AI move, check for win/draw
    const winLine = checkWin(Game.board, 'O');
    if (winLine) {
      endGame('O', winLine);
      return;
    }
    if (checkDraw(Game.board)) {
      endGame(null, []);
      return;
    }

    // Switch back to player
    playSound('place');
    switchPlayer();
  }

  // Compute a "smart" move: win if possible, block, else center, corners, edges.
  function computeBestMove(board, ai, human) {
    // 1) Can AI win in one move?
    for (let i = 0; i < 9; i++) {
      if (!board[i]) {
        const copy = board.slice();
        copy[i] = ai;
        if (checkWin(copy, ai)) return i;
      }
    }

    // 2) Can human win in next move? Block it.
    for (let i = 0; i < 9; i++) {
      if (!board[i]) {
        const copy = board.slice();
        copy[i] = human;
        if (checkWin(copy, human)) return i;
      }
    }

    // 3) Prefer center
    if (!board[4]) return 4;

    // 4) Prefer corners
    const corners = [0,2,6,8];
    for (const c of corners) {
      if (!board[c]) return c;
    }

    // 5) Fallback to edges
    const edges = [1,3,5,7];
    for (const e of edges) {
      if (!board[e]) return e;
    }

    // No move found
    return null;
  }

  /* ---------------------------
     Sound handling (WebAudio synth)
     --------------------------- */

  // Initialize AudioContext
  function ensureAudio() {
    if (!Game.audioCtx) {
      try {
        Game.audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      } catch (e) {
        Game.audioCtx = null;
      }
    }
  }

  // Play short synthesized sound events for different types
  function playSound(type) {
    if (!Game.soundOn) return;
    ensureAudio();
    if (!Game.audioCtx) return;

    const ctx = Game.audioCtx;
    const now = ctx.currentTime;

    let osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.connect(gain);
    gain.connect(ctx.destination);

    // Choose frequencies and envelopes by type
    if (type === 'place') {
      osc.type = 'sine';
      osc.frequency.setValueAtTime(520, now);
      gain.gain.setValueAtTime(0.0001, now);
      gain.gain.exponentialRampToValueAtTime(0.08, now + 0.01);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.18);
      osc.start(now);
      osc.stop(now + 0.22);
    } else if (type === 'win') {
      // pleasurable ascending chime
      const freqs = [420, 520, 650];
      let offset = 0;
      freqs.forEach((f, idx) => {
        const o = ctx.createOscillator();
        const g = ctx.createGain();
        o.type = 'triangle';
        o.frequency.setValueAtTime(f, now + offset);
        g.gain.setValueAtTime(0.0001, now + offset);
        g.gain.exponentialRampToValueAtTime(0.12, now + offset + 0.02);
        g.gain.exponentialRampToValueAtTime(0.0001, now + offset + 0.26);
        o.connect(g); g.connect(ctx.destination);
        o.start(now + offset);
        o.stop(now + offset + 0.28);
        offset += 0.07;
      });
    } else if (type === 'draw') {
      osc.type = 'sine';
      osc.frequency.setValueAtTime(320, now);
      gain.gain.setValueAtTime(0.0001, now);
      gain.gain.exponentialRampToValueAtTime(0.06, now + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.22);
      osc.start(now);
      osc.stop(now + 0.24);
    }

    // small cleanup
    setTimeout(() => {
      try { osc.disconnect(); gain.disconnect(); } catch (e) {}
    }, 1000);
  }

  /* ---------------------------
     Theme & sound toggles
     --------------------------- */

  function toggleDarkMode(enabled) {
    Game.darkMode = Boolean(enabled);
    document.body.classList.toggle('dark-theme', Game.darkMode);
    saveSettings();
  }

  function toggleSound(enabled) {
    Game.soundOn = Boolean(enabled);
    // if enabling sound and audio context is suspended, try to resume
    if (Game.soundOn && Game.audioCtx && Game.audioCtx.state === 'suspended') {
      Game.audioCtx.resume().catch(()=>{});
    }
    saveSettings();
  }

  /* ---------------------------
     Start
     --------------------------- */

  // Run initialization after DOM is ready (script is defer so DOM is ready)
  initializeGame();

  // Expose functions for potential debugging (not necessary in production)
  // window.TicTacToe = { Game, resetBoard, resetScores };

})();
