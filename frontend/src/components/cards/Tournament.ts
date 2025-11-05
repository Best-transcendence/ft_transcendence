// scr/components/cards/tournament

import { createCard } from './CardCreator'
import { t } from "../../i18n/Lang";

export const TournamentCard = createCard({
  title: t("tournamentMode"),
  icon: "🏆",
  description: t("tournamentDescription"),
  hash: "lobbytournament"
});