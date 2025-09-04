export function LoginPage() {
  return `
    <div class="relative flex items-center justify-center min-h-screen text-theme-text overflow-hidden
      bg-[radial-gradient(ellipse_at_bottom,_rgba(255,165,0,0.35)_0%,_transparent_40%),radial-gradient(circle_at_80%_20%,_rgba(122,44,208,0.3)_0%,_transparent_30%),linear-gradient(180deg,_#140533_0%,_#3c1282_50%,_#0a0f3d_100%)]">

      <!-- Bubble Layer -->
      <div class="absolute inset-0 pointer-events-none">
        <!-- Bubble 1 -->
        <div class="absolute w-12 h-12 bg-purple-400/30 rounded-full blur-lg top-20 left-10"></div>
        <!-- Bubble 2 -->
        <div class="absolute w-16 h-16 bg-purple-300/40 rounded-full blur-lg top-1/3 right-16"></div>
        <!-- Bubble 3 -->
        <div class="absolute w-8 h-8 bg-orange-300/30 rounded-full blur-md bottom-24 left-1/4"></div>
        <!-- Bubble 4 -->
        <div class="absolute w-10 h-10 bg-blue-400/30 rounded-full blur-md top-40 right-1/3"></div>
      </div>

      <!-- Login Card -->
      <div class="relative z-10 bg-white/90 backdrop-blur-sm p-8 rounded-2xl shadow-lg w-96 text-center">
        <!-- Title -->
        <h1 class="text-2xl font-heading font-bold mb-6" style="color: var(--color-accent2);">
          Sign In
        </h1>

        <!-- Login Form -->
        <form id="login-form" class="flex flex-col gap-4">
          <input
            class="p-3 rounded-lg border border-gray-300 outline-none focus:ring-2"
            style="focus:ring: var(--color-accent1)"
            type="email"
            placeholder="Email"
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
          class="flex items-center justify-center gap-2 bg-white text-gray-800 py-2 px-4 rounded-lg shadow hover:bg-gray-100 w-full"
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