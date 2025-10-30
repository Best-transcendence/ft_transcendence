// src/components/ModeCard.ts
import { createCard } from './CardCreator';
import { AICard } from './AICard'
import { PvPCard } from './PvPCard'
import { TournamentCard } from './Tournament'

// import { AICard } from './AICard'


export function ModeCards() {
  return `
    <div class="flex gap-6 flex-wrap justify-center">
      ${PvPCard}
      ${TournamentCard}
      ${AICard}
    </div>
  `;
}

