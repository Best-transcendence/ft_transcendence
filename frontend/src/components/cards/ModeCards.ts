import { AICard } from './AICard'
import { PvPCard } from './PvPCard'
import { TournamentCard } from './Tournament'

export function ModeCards() {
  return `
    <div class="flex gap-6 flex-wrap justify-center">
      ${PvPCard}
      ${TournamentCard}
      ${AICard}
    </div>
  `;
}

