## Table of Contents

- [Project Map](#project-map)
- [TL;DR (Key Points)](#tldr-key-points)
- [Glossary](#glossary)
- [Data Flow: From Lobby → Game](#data-flow-from-lobby--game)
- [The Engine Logic](#the-engine-logic)
- [The Lobby UI](#the-lobby-ui)
- [Game Screen](#game-screen)
  - [Markup](#markup)
  - [Runtime](#runtime)
- [Flow Orchestration](#flow-orchestration)
- [Window Mechanism (runtime ↔ flow)](#window-mechanism-runtime--flow)
- [Optional Renames (readability)](#optional-renames-readability)

# Projectmap

```bash
src/
  pages/
    LobbyPageTournament.ts          // Builder UI (HTML/markup)
    LobbyPageTournament.init.ts     // Behavior: add friends/guests, mode, preview, start
  games/
    Tournament.ts                   // Game screen HTML/markup (has #gameWindow)
    InitGameTournament.ts           // The 2D pong game runtime + timer & event hooks
    TournamentFlow.ts               // Orchestrates bracket progression & overlay
  tournament/
    engine.ts                       // Core types + bracket creation/advancement
    utils.ts                        // Shared helpers (myName, ensureMeFirst, shuffle, etc.)
```

# TL;DR (Key Points)

2 modes:
- 2P → single Best-of-3 series (we intentionally play all 3 games).
- 4P → two single-game semifinals → single-game final.

Seeding & State handoff: The lobby builds a seed and stores it in localStorage as "tournamentSeed". The game screen reads it and boots the flow.
- Overlay + “two-space” start:
- Space #1 closes the pre-round overlay.
- Space #2 starts the actual round (via the game’s handler).

Time control
- The game raises a game:timeup event → flow decides winner or tie-breaker.

No duplication
- Reusable helpers live in tournament/utils.ts (e.g., myName, ensureMeFirst, shuffle, currentMax, byId).

Engine (tournament/engine.ts)
- pure state logic: builds brackets, records results, advances rounds, sets champion.

Safe re-entry
- teardownTournamentFlow() cleans DOM listeners and overlay between sessions to prevent “stacked” handlers.

# Glossary

- Bo = Best of (Bo1, Bo3, Bo5). In our code, bestOf: 3 = Bo3 (first to 2).
- Bracket = Tournament state (players, rounds, matches, champion).

# Data Flow: From Lobby → Game

1. Lobby builds players & pairs
- Users add friends/guests.
- For 4P, we randomize the other three players and always seed “me” in Semi 1.
- For 2P, it’s just you vs. one opponent.

2. Seed is stored

```bash
const payload = {
  mode,                 // "2" | "4"
  players,              // Player[]
  pairs: [[idA,idB], [idC,idD]] | null  // only for 4P
};
localStorage.setItem("tournamentSeed", JSON.stringify(payload));
window.location.hash = "#tournament";
```

3. Game screen boots the flow
- TournamentFlow.bootTournamentFlow() reads "tournamentSeed", constructs a Bracket, shows an overlay for the first match, and captures Space (two-space flow).
- The actual round start is delegated to the game runtime via window.beginTournamentRound.

# The Engine Logic

src/tournament/engine.ts

Builders:
- createTwoPlayerTournament([A, B]) → one Bo3 match.
- createFourPlayerTournament([A, B, C, D]) → 2 semis (round 1), final (round 2).

Recording results:
- reportMatchResult(bracket, matchId, winnerId) increments wins; once someone meets winsNeeded(bestOf), the match winnerId is set and advance() is called.

Advancement:
- After both semis are decided → create final.
- After final decided → set bracket.championId.


The engine does not touch the DOM. It only mutates the Bracket object.

# The Lobby UI
src/pages/LobbyPageTournament.ts (+ .init.ts)

Core helpers (imported from tournament/utils.ts):
- myName, myPlayer, shuffle, ensureMeFirst(players), sortForRender(players), byId, currentMax(mode).

State in init.ts:
- players: Player[], mode: "2" | "4", paired: boolean, plannedPairs: [Player, Player][] | null.

User interactions
- Add friend/guest → updates chips and counters.
- Switch mode 2/4 → resets and re-enforces “me” as first.
- “Matchmaking” button:
	- 2P → mark paired = true.
	- 4P → compute plannedPairs (you + a random opponent in Semi 1).
- “Let’s start 🕹️” → call startTournamentAndGo() (write seed + route to #tournament).

Preview rendering:
- Shows participants as chips.
- Shows matchup preview cards (Round 1, Round 2, Final).
- If not yet paired, shows "?" placeholders.

# Game Screen

## Markup

src/games/Tournament.ts renders:

- Background “arcade” image.
- A game window container (#gameWindow) where the overlay attaches.
- The pong field (paddles, ball, score).
- “Press Space When You Are Ready” message (handled by the runtime).

## Runtime

src/games/InitGameTournament.ts:

- Simple pong mechanics (percent-based positions).
- Keyboard controls: W/S (left) + ArrowUp/ArrowDown (right).
- startTimer(15) per round → at time up, it dispatches:
```bash
window.dispatchEvent(new CustomEvent("game:timeup"));
```

It does not decide winners; it hands off to the flow through:
- window.layoutTournamentRound() → reset field & scores for the next overlay.
- window.beginTournamentRound() → start a round (Space #2).
- window.tournamentTimeUp(leftScore, rightScore) → tie or winner notification for the flow.


## Flow Orchestration

src/games/TournamentFlow.ts:

Reads seed, builds bracket, and selects next match.

Overlay inside #gameWindow shows:
- Round label (“Round 1”, “Round 2”, “Final”, or Bo3 label).
- Left/Right player names and control hints.
- “Press SPACE to start”

Space handling:
- Space #1 (captured in capture phase) → closes overlay, does not start game.
- Then, when Space is pressed again (game listens) → beginTournamentRound() starts the actual round.

Results:

For 2P Bo3 → always 3 games:
- After each time up, the flow updates the match internal counters (winsA/winsB).
- Before game 2 and game 3, overlay appears again (two-space flow repeats).
- After the 3rd game, champion is decided.

For 4P:
- Each match is one game; after a winner is decided → next match or champion.

Tie-breaker:
- If timeup scores are tied:
- First tie → show overlay labeled “Tie-breaker” (Space #1 hide, Space #2 restarts round).
- Tie again in tie-breaker → instant sudden-death restart (no extra overlay).
- Cleanup: teardownTournamentFlow() removes listeners and overlay when leaving the page.

# Window mechanism (runtime <-> flow)

The flow expects these on window (set by the runtime):
	window.layoutTournamentRound?: () => void
	- Reset field & scores for the next overlay.

	window.beginTournamentRound?: () => void
	- Start the next actual round (Space #2).

	window.tournamentTimeUp?: (left: number, right: number) => void
	- Called when round time expires.


The runtime expects this from the flow:
- window.tournamentCurrentPlayers?: { left: string; right: string; label: string }

# Optional Renames (readability)
- Bracket → TournamentState
- Match → MatchSeries
- bestOf → bestOfGames