import { router } from './router';

window.addEventListener('hashchange', router);
window.addEventListener('DOMContentLoaded', router);

// src/main.ts
import {
  Bracket,
  Player,
  createTwoPlayerTournament,
  createFourPlayerTournament,
  reportMatchResult,
} from "./tournament/engine";
import { render } from "./tournament/ui";

const two: [Player, Player] = [
  { id: "p1", name: "Alice" },
  { id: "p2", name: "Bob" },
];

const four: [Player, Player, Player, Player] = [
  { id: "p1", name: "Alice" },
  { id: "p2", name: "Bob" },
  { id: "p3", name: "Cleo" },
  { id: "p4", name: "Diego" },
];

let mode: "2p" | "4p" = "2p";
let bracket: Bracket = createTwoPlayerTournament(two);

function restart() {
  bracket = mode === "2p" ? createTwoPlayerTournament(two) : createFourPlayerTournament(four);
  draw();
}

function draw() {
  render(bracket, (matchId, winnerId) => {
    reportMatchResult(bracket, matchId, winnerId);
    draw();
  });
}

window.addEventListener("DOMContentLoaded", () => {
  const modeSel = document.getElementById("mode") as HTMLSelectElement;
  const resetBtn = document.getElementById("resetBtn") as HTMLButtonElement;

  modeSel.onchange = () => {
    mode = (modeSel.value as "2p" | "4p");
    restart();
  };
  resetBtn.onclick = restart;

  draw();
});
