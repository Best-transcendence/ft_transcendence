import { addTheme } from "../components/Theme";
import { t } from "../services/lang/LangEngine";

export function NotFoundPage() {
  return `
  ${ addTheme() }

	<div class="w-full flex flex-col items-center justify-center min-h-[70vh] text-center space-y-10">

		<!-- Title & subtitle -->
		<div>
			<h1 class="text-6xl text-gray-200 font-heading font-bold mb-4">404</h1>
			<p class="text-2xl text-gray-400 max-w-xl mb-12">
			${t("notFoundTitle")}
			</p>
		</div>

		<!-- Button -->
		<button
			onclick="window.location.hash='intro'"
			class="px-8 py-4 rounded-2xl font-semibold text-white text-lg transition hover:shadow-lg cursor-pointer bg-purple-600 hover:bg-purple-700">
			${t("backToArcade")}
		</button>

	</div>
  `;
}
