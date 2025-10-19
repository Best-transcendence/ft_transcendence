export type Player = { id: string; name: string };

export type Match = {
  id: string;
  round: number;           // 1 = semis (4P) / whole Bo3 (2P), 2 = final (4P)
  index: number;           // order within a round (0, 1, ...)
  playerA: Player;
  playerB: Player;
  bestOf: number;          // 1 for single, 3 for Bo3
  winsA: number;           // games won by playerA
  winsB: number;           // games won by playerB
  winnerId?: string;       // set once a match is decided
};

export type Round = { round: number; matches: Match[] };

export type Bracket = {
  players: Player[];       // ordering matters for initial pairing
  rounds: Round[];         // round 1 then round 2 (if any)
  championId?: string;     // set when a final is decided
};

// Internals: ids & match factory
let uidCounter = 0;
const uid = () => `m_${Date.now()}_${uidCounter++}`;

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
  winsA: 0,
  winsB: 0,
});

// Bracket builders
/**
 * 2 players → a single Bo3 match 
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
 * 4 players → two semis (best-of-1) followed by a final (best-of-1).
 * Pairing: [p1 vs p2], [p3 vs p4]
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

function winsNeeded(bestOf: number) {
  // e.g. Bo3 → 2 wins to clinch
  return Math.floor(bestOf / 2) + 1;
}

/** Results ingestion & progression */

/**
 * Apply a single game result to the match with `matchId`.
 * For Bo1 this completes the match immediately.
 * For Bo3 this increments the winner’s wins; once winsNeeded() is reached,
 * the match is decided. Then we try to advance the bracket.
 */
export function reportMatchResult(
  bracket: Bracket,
  matchId: string,
  winnerId: string
) {
  const match = bracket.rounds.flatMap(r => r.matches).find(m => m.id === matchId);
  if (!match || match.winnerId) return; // ignore invalid or already-decided

  if (winnerId === match.playerA.id) match.winsA++;
  else if (winnerId === match.playerB.id) match.winsB++;

  const need = winsNeeded(match.bestOf);
  if (match.winsA >= need || match.winsB >= need) {
    match.winnerId = match.winsA > match.winsB ? match.playerA.id : match.playerB.id;
    advance(bracket);
  }
}

/**
 * Advance the bracket:
 * - If we’re in 4P mode and both semis are done, create the final (round 2).
 * - If the final is done, set the champion.
 */
function advance(bracket: Bracket) {
  // 4P: once both semis (round 1) have winners, create final (round 2)
  const semis = bracket.rounds.find(r => r.round === 1);
  if (semis && semis.matches.length === 2) {
    const bothDone = semis.matches.every(m => m.winnerId);
    const finalExists = !!bracket.rounds.find(r => r.round === 2);

    if (bothDone && !finalExists) {
      const semi1 = semis.matches[0];
      const semi2 = semis.matches[1];

      const w1 = semi1.winnerId === semi1.playerA.id ? semi1.playerA : semi1.playerB;
      const w2 = semi2.winnerId === semi2.playerA.id ? semi2.playerA : semi2.playerB;

      bracket.rounds.push({ round: 2, matches: [makeMatch(2, 0, w1, w2, 1)] });
    }
  }

  // If there is a final and it has a winner → champion decided
  const final = bracket.rounds.find(r => r.round === 2)?.matches[0];
  if (final?.winnerId) bracket.championId = final.winnerId;
}