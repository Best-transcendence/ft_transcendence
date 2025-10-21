/**
 * Tournament Engine
 * 
 * This module provides the core tournament logic including bracket creation,
 * match management, and result processing. It handles both 2-player and 4-player
 * tournaments with different formats (best-of-1 and best-of-3).
 */

/**
 * Represents a player in the tournament system
 */
export type Player = { 
  id: string;              // Unique player identifier ("me" | "guest_xyz" | "auth_123")
  name: string;            // Player display name
  isAuthenticated?: boolean;  // true if real user account, false/undefined for guest
  authUserId?: number;     // Real user ID from database (for stats tracking)
};

/**
 * Represents a single match within a tournament
 */
export type Match = {
  id: string;              // Unique match identifier
  round: number;           // Tournament round (1 = semis/Bo3, 2 = final)
  index: number;           // Order within a round (0, 1, ...)
  playerA: Player;         // First player in the match
  playerB: Player;         // Second player in the match
  bestOf: number;          // Match format (1 for single, 3 for Bo3)
  winsA: number;           // Games won by playerA
  winsB: number;           // Games won by playerB
  winnerId?: string;       // Winner ID (set when match is decided)
};

/**
 * Represents a tournament round containing multiple matches
 */
export type Round = { 
  round: number;    // Round number
  matches: Match[];  // Matches in this round
};

/**
 * Complete tournament bracket structure
 */
export type Bracket = {
  players: Player[];       // All tournament participants (order matters for pairing)
  rounds: Round[];         // Tournament rounds (round 1, then round 2 if applicable)
  championId?: string;     // Tournament champion (set when final is decided)
};

// Internal utilities for match creation and ID generation
let uidCounter = 0;  // Counter for unique match IDs

/**
 * Generates a unique match ID using timestamp and counter
 * @returns {string} Unique match identifier
 */
const uid = () => `m_${Date.now()}_${uidCounter++}`;

/**
 * Creates a new match with initial state
 * @param round - Tournament round number
 * @param index - Match index within the round
 * @param a - First player
 * @param b - Second player
 * @param bestOf - Match format (1 for single, 3 for Bo3)
 * @returns {Match} New match with initial state
 */
const makeMatch = (
  round: number,
  index: number,
  a: Player,
  b: Player,
  bestOf: number
): Match => ({
  id: uid(),
  round,
  index,
  playerA: a,
  playerB: b,
  bestOf,
  winsA: 0,  // Initialize with no wins
  winsB: 0,  // Initialize with no wins
});

// Tournament bracket creation functions

/**
 * Creates a 2-player tournament bracket
 * Format: Single best-of-3 match between the two players
 * @param players - Array of exactly 2 players
 * @returns {Bracket} Tournament bracket with single Bo3 match
 */
export function createTwoPlayerTournament(players: [Player, Player]): Bracket {
  return {
    players,
    rounds: [
      { round: 1, matches: [makeMatch(1, 0, players[0], players[1], 3)] },
    ],
  };
}

/**
 * Creates a 4-player tournament bracket
 * Format: Two semifinals (best-of-1) followed by a final (best-of-1)
 * Pairing: [p1 vs p2], [p3 vs p4] in semifinals
 * @param players - Array of exactly 4 players
 * @returns {Bracket} Tournament bracket with semifinals and final structure
 */
export function createFourPlayerTournament(
  players: [Player, Player, Player, Player]
): Bracket {
  const [p1, p2, p3, p4] = players;
  return {
    players,
    rounds: [
      { round: 1, matches: [makeMatch(1, 0, p1, p2, 1), makeMatch(1, 1, p3, p4, 1)] },
    ],
  };
}

/**
 * Calculates the number of wins needed to win a match
 * @param bestOf - Match format (1 for single, 3 for Bo3)
 * @returns {number} Number of wins needed to clinch the match
 */
function winsNeeded(bestOf: number) {
  // e.g. Bo3 → 2 wins to clinch, Bo1 → 1 win to clinch
  return Math.floor(bestOf / 2) + 1;
}

// Match result processing and bracket advancement

/**
 * Processes a single game result and updates tournament state
 * 
 * For best-of-1 matches, this completes the match immediately.
 * For best-of-3 matches, this increments the winner's wins; once the required
 * number of wins is reached, the match is decided and bracket advancement is triggered.
 * 
 * @param bracket - Tournament bracket to update
 * @param matchId - ID of the match to update
 * @param winnerId - ID of the winning player
 */
export function reportMatchResult(
  bracket: Bracket,
  matchId: string,
  winnerId: string
) {
  // Find the match by ID across all rounds
  const match = bracket.rounds.reduce<Match[]>((acc, r) => acc.concat(r.matches), []).find(m => m.id === matchId);
  if (!match || match.winnerId) return; // Ignore invalid or already-decided matches

  // Update win count for the winning player
  if (winnerId === match.playerA.id) match.winsA++;
  else if (winnerId === match.playerB.id) match.winsB++;

  // Check if match is decided based on wins needed
  const need = winsNeeded(match.bestOf);
  if (match.winsA >= need || match.winsB >= need) {
    match.winnerId = match.winsA > match.winsB ? match.playerA.id : match.playerB.id;
    advance(bracket);  // Trigger bracket advancement
  }
}

/**
 * Advances the tournament bracket based on completed matches
 * 
 * Handles bracket progression for 4-player tournaments:
 * - Creates the final round when both semifinals are complete
 * - Sets the tournament champion when the final is decided
 * 
 * @param bracket - Tournament bracket to advance
 */
function advance(bracket: Bracket) {
  // 4-player tournament: create final when both semifinals are complete
  const semis = bracket.rounds.find(r => r.round === 1);
  if (semis && semis.matches.length === 2) {
    const bothDone = semis.matches.every(m => m.winnerId);
    const finalExists = !!bracket.rounds.find(r => r.round === 2);

    if (bothDone && !finalExists) {
      const semi1 = semis.matches[0];
      const semi2 = semis.matches[1];

      if (!semi1 || !semi2) return;

      // Get the winners of both semifinals
      const w1 = semi1.winnerId === semi1.playerA.id ? semi1.playerA : semi1.playerB;
      const w2 = semi2.winnerId === semi2.playerA.id ? semi2.playerA : semi2.playerB;

      // Create the final match between semifinal winners
      bracket.rounds.push({ round: 2, matches: [makeMatch(2, 0, w1, w2, 1)] });
    }
  }

  // Set tournament champion when final is decided
  const final = bracket.rounds.find(r => r.round === 2)?.matches[0];
  if (final?.winnerId) bracket.championId = final.winnerId;
}