import { createCard } from './CardCreator'
import { t } from "../../i18n/Lang";

export const AICard = createCard({
  title: t("aiCardTitle"),
  icon: "🤖",
  description: t("aiCardDescription"),
  hash: "AIopponent"
});