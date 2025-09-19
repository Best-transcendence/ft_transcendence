# Pong Arcade Cabinet — Game Area & Logic
# Sesion 6 sep - 14 sep
# Note : can be run only with the front end, no need back end yet (npm run dev) and go to : [text](http://localhost:1234/game#game)

## Controls
- **Player 1**: `W` (up), `S` (down)
- **Player 2**: `Arrow Up` (up), `Arrow Down` (down)
- **Start Game**: `Space`

## Overview
This part of the project implements the **visual game area** and **core game logic** for the Pong arcade (I wanted to put a cabinet as background but well it did not scale as expected jeje).

It includes:
- A responsive, SVG‑based arcade background (I have some issues with the adjust so at the end I leave it without the adjust) I have some different size images, to see if is better but not change much.
- Paddle, ball, and net elements sized in percentages for more responsiveness (eventhought in small devices can be a problem but well).
- Score display and start prompt. (Need to improve the visuals)
- Basic Pong game loop with keyboard controls (problems to add the sound effects.)

---

## 🛠 What I Did

### 1. **Responsive Game Area** (I make the game first in normal html css and js and then refactor to ts, and tailwind and was crazy hard)
- Removed fixed pixel sizes (`600px x 400px`) and replaced them with `%` and `vw` units.
- Added `min-w` and `min-h` to prevent the game area from shrinking too much on small screens.
- Kept `max-w` and `max-h` for large screens to avoid it becoming absurdly huge.
- Used `transform: perspective(...) rotateX(...) scaleX(...) scaleY(...)` to give like a mini 3d perspective

### 2. **Game Elements**
- **Net**: Centered dotted line using `%` positioning.
- **Paddles**: Sized and positioned in `%` so they scale with the game area.
- **Ball**: Sized in `%` with a drop shadow for depth.
- **Scores**: Positioned inside the game area, scale with viewport width.
- **Start Text**: Centered at the bottom of the game area, hidden when the game starts.

### 4. **Core Game Logic (`initGame.ts`)**
- Paddle movement with acceleration, max speed, and friction.
- Ball movement with collision detection for walls and paddles.
- Score tracking and display updates.
- Sound effects for paddle hits, wall bounces, and scoring.
- Game starts on **Space** key press.

---

## 🐛 Problems We Encountered

1. **Game Area Not Scaling**
   - Initially hard‑coded pixel sizes meant the game field stayed small regardless of background size.
   - Fixed by switching to `%` and `vw` units and aligning to the SVG screen.

4. **Paddle Bugs**
   - Paddles can sometimes drift or jitter due to velocity not resetting cleanly.
   - Needs refinement in velocity handling and collision boundaries.
   - Somentimes the paddle stiks with the ball and does not bounce.

5. **Game Not Stopping**
   - Once started, the game loop runs indefinitely, and when one score just start inmediately.
   - No current mechanism to pause or end the game after a win condition.

---

## ✅ What We Have Done So Far
- Some how responsive game area inside the arcade cabinet.
- Working paddle and ball movement.
- Score tracking and display.
- Start prompt that hides when the game begins.

---

## 🚧 Known Issues / Next Steps
- **Paddle Movement**: Needs smoother stop/reset logic to avoid jitter.
- **Game Stop Condition**: Add a win condition (e.g., first to 10 points) and stop the loop.
- **AI Opponent**: Optional — add CPU control for paddle 2 for single‑player mode.
- **Mobile Controls**: Add touch support for paddles on mobile devices.
- **Sound Controls**: Add sound support for paddles, collition, and losse of the game.


---

