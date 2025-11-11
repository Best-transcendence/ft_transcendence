import { t } from "../services/lang/LangEngine";
import { LanguageSwitcher } from "../services/lang/LanguageSwitcher";
import { addTheme } from "../components/Theme";

export function LoginPage() {
  return `

	${ addTheme() }
	
	<div class="fixed top-10 right-6 z-50">
			${LanguageSwitcher()}
	</div>

    <!-- Login Card -->
 	<div class="flex items-center justify-center min-h-screen text-center">
      <div class="relative z-10 bg-slate-900 backdrop-blur-md p-8 rounded-2xl w-96 shadow-[0_0_30px_10px_#7037d3]">

		<!-- Title -->
        <h1 id="form-title" class="text-2xl font-heading font-bold mb-6 text-white">
			${t("signIn")}
        </h1>

        <!-- Login Form -->
        <form id="login-form" class="flex flex-col gap-4">
		<!-- Name field (hidden by default) -->
		<input
			id="name-field"
			class="p-3 rounded-lg border border-gray-600 outline-none focus:ring-2 focus:ring-purple-500 hidden text-white bg-[#161220] placeholder-gray-400 autofill:bg-[#161220] autofill:text-white"
			type="text"
			placeholder="${t("nameUnique")}"
		/>

		<!-- Email field -->
		<input
		    id="email-field"
			class="p-3 rounded-lg border border-gray-600 outline-none focus:ring-2 focus:ring-purple-500 text-white bg-[#161220] placeholder-gray-400 autofill:bg-[#161220] autofill:text-white"
			type="email"
			placeholder="${t("email")}"
		/>

		<!-- Password field -->
		<input
		    id="password-field"
			class="p-3 rounded-lg border border-gray-600 outline-none focus:ring-2 focus:ring-purple-500 text-white bg-[#161220] placeholder-gray-400 autofill:bg-[#161220] autofill:text-white"
			type="password"
			placeholder="${t("password")}"
		/>

		<!-- Confirm Password field (hidden by default) -->
		<input
			id="confirm-password-field"
			class="p-3 rounded-lg border border-gray-600 outline-none focus:ring-2 focus:ring-purple-500 hidden text-white bg-[#161220] placeholder-gray-400 autofill:bg-[#161220] autofill:text-white"
			type="password"
			placeholder="${t("confirmPassword")}"
		/>
          <button
		    id="submit-button"
            type="submit"
            class="text-white font-semibold py-2 rounded-lg bg-purple-600 hover:bg-purple-500 transition-colors"
          >
            ${t("login")}
          </button>
        </form>

        <!-- Divider -->
        <div class="my-4 text-gray-300">${t("orDivider")}</div>

        <!-- Sign Up Button -->
        <button
          id="signup-toggle"
          class="mt-4 text-sm cursor-pointer bg-transparent border-none text-gray-300"
        >
		</button>

		</div>
	</div>
  `;
}
