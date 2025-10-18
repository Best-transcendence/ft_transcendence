export type Player = { id: string; name: string };

export type Match = {
  id: string;
  round: number;
  index: number;
  playerA: Player;
  playerB: Player;
  bestOf: number;   // 1 for single, 3 for Bo3
  winsA: number;
  winsB: number;
  winnerId?: string;
};

export type Round = { round: number; matches: Match[] };

export type Bracket = {
  players: Player[];
  rounds: Round[];
  championId?: string;
};

let uidCounter = 0;
const uid = () => `m_${Date.now()}_${uidCounter++}`;

const makeMatch = (round: number, index: number, a: Player, b: Player, bestOf: number): Match => ({
  id: uid(),
  round,
  index,
  playerA: a,
  playerB: b,
  bestOf,
  winsA: 0,
  winsB: 0,
});

export function createTwoPlayerTournament(players: [Player, Player]): Bracket {
  return {
    players,
    rounds: [{ round: 1, matches: [makeMatch(1, 0, players[0], players[1], 3)] }],
  };
}

export function createFourPlayerTournament(players: [Player, Player, Player, Player]): Bracket {
  // pairs: first 2, second 2 → winners go to final
  const [p1, p2, p3, p4] = players;
  return {
    players,
    rounds: [{ round: 1, matches: [makeMatch(1, 0, p1, p2, 1), makeMatch(1, 1, p3, p4, 1)] }],
  };
}

function winsNeeded(bestOf: number) {
  return Math.floor(bestOf / 2) + 1; // Bo3 -> 2
}

export function reportMatchResult(bracket: Bracket, matchId: string, winnerId: string) {
  const match = bracket.rounds.flatMap(r => r.matches).find(m => m.id === matchId);
  if (!match || match.winnerId) return;

  if (winnerId === match.playerA.id) match.winsA++;
  else if (winnerId === match.playerB.id) match.winsB++;

  const need = winsNeeded(match.bestOf);
  if (match.winsA >= need || match.winsB >= need) {
    match.winnerId = match.winsA > match.winsB ? match.playerA.id : match.playerB.id;
    advance(bracket);
  }
}

function advance(bracket: Bracket) {
  // if semis both have winners, create/populate final
  const semis = bracket.rounds.find(r => r.round === 1);
  if (semis && semis.matches.length === 2) {
    const bothDone = semis.matches.every(m => m.winnerId);
    if (bothDone && !bracket.rounds.find(r => r.round === 2)) {
      const w1 = semis.matches[0].winnerId === semis.matches[0].playerA.id ? semis.matches[0].playerA : semis.matches[0].playerB;
      const w2 = semis.matches[1].winnerId === semis.matches[1].playerA.id ? semis.matches[1].playerA : semis.matches[1].playerB;
      bracket.rounds.push({ round: 2, matches: [makeMatch(2, 0, w1, w2, 1)] });
    }
  }
  // if final exists and has winner, set champion
  const final = bracket.rounds.find(r => r.round === 2)?.matches[0];
  if (final?.winnerId) bracket.championId = final.winnerId;
}
