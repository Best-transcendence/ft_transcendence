// src/components/cards/PvPCard.ts

import { createCard } from './CardCreator'
import { t } from "../../services/lang/LangEngine";

export const PvPCard = createCard({
  title: t("playerVsPlayerTitle"),
  icon: "⚔️",
  description: t("playerVsPlayerDescription"),
  hash: "lobby"
});