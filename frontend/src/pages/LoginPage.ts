export function LoginPage() {
  return `
    <div class="flex items-center justify-center min-h-screen
    bg-gradient-to-b
    from-theme-bg1
    to-theme-bg2 text-theme-text">
      <div class="bg-white bg-opacity-95 p-8 rounded-2xl shadow-lg w-96 text-center">

        <!-- Avatar -->
        <div class="flex justify-center mb-6">
          <div class="w-16 h-16 rounded-full flex items-center justify-center"
               style="background-color: var(--color-accent1);">
            <span class="text-2xl" style="color: var(--color-bg1)">👤</span>
          </div>
        </div>

        <!-- Title -->
        <h1 class="text-2xl font-heading font-bold mb-6" style="color: var(--color-accent2);">
          Welcome to Pong Arena
        </h1>

        <!-- Login Form -->
        <form id="login-form" class="flex flex-col gap-4">
          <input
            class="p-3 rounded-lg border border-gray-300 outline-none focus:ring-2"
            style="focus:ring: var(--color-accent1)"
            type="text"
            placeholder="Username / Alias"
          />
          <input
            class="p-3 rounded-lg border border-gray-300 outline-none focus:ring-2"
            style="focus:ring: var(--color-accent1)"
            type="password"
            placeholder="Password"
          />
          <button
            type="submit"
            class="text-white font-semibold py-2 rounded-lg"
            style="background-color: var(--color-button);"
            onmouseover="this.style.backgroundColor='var(--color-button-hover)'"
            onmouseout="this.style.backgroundColor='var(--color-button)'"
          >
            Login
          </button>
        </form>

        <!-- Divider -->
        <div class="my-4 text-gray-500">OR</div>

        <!-- Google Sign-in -->
        <button
          id="google-login"
          class="flex items-center
                justify-center
                gap-2 bg-white
                text-gray-800
                py-2
                px-4 rounded-lg shadow
                hover:bg-gray-100 w-full"
        >
          <img src="/assets/google.svg" class="w-5 h-5" />
          Google Sign-in
        </button>

        <!-- Guest Option -->
        <p
          id="guest-login"
          class="mt-4 text-sm cursor-pointer"
          style="color: var(--color-accent2);"
        >
          Continue as Guest
        </p>
      </div>
    </div>
  `;
}
