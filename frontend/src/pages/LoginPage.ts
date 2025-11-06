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

        <!-- Google Sign-in -->
        <button
          id="google-login"
          class="flex items-center justify-center gap-2 bg-white text-gray-800 py-2 px-4 rounded-lg shadow hover:bg-gray-100 w-full"
        >
          <svg class="w-5 h-5" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
          </svg>
            ${t("googleSignIn")}
        </button>

        <!-- Sign Up Button -->
        <button
          id="signup-toggle"
          class="mt-4 text-sm cursor-pointer bg-transparent border-none text-gray-300">
          </button>
		</div>
	   </div>
	</div>
  `;
}
