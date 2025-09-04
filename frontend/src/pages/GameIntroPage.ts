export function GameIntroPage() {
  return `
    <div class="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-brand-light to-brand">
      <h1 class="text-5xl font-heading font-bold text-brand-dark mb-4">Retro Pong</h1>
      <p class="text-lg text-gray-700 text-center max-w-xl mb-10">
        Experience the classic game of Pong with a modern twist. Smooth animations, warm colors, and addictive gameplay.
      </p>

      <div class="flex gap-6 mb-10">
        <div class="bg-white p-4 rounded-xl shadow-md rotate-[-3deg]">
          <h2 class="font-bold text-brand mb-2">Classic Gameplay</h2>
          <p class="text-gray-600 text-sm">Pure Pong mechanics with modern polish</p>
        </div>
        <div class="bg-white p-4 rounded-xl shadow-md rotate-[2deg]">
          <h2 class="font-bold text-brand mb-2">Smooth Controls</h2>
          <p class="text-gray-600 text-sm">Responsive keyboard controls for both players</p>
        </div>
        <div class="bg-white p-4 rounded-xl shadow-md rotate-[1deg]">
          <h2 class="font-bold text-brand mb-2">Modern Design</h2>
          <p class="text-gray-600 text-sm">Warm colors and 3D visual effects</p>
        </div>
      </div>

      <div class="bg-white p-6 rounded-xl shadow-md w-[700px]">
        <div class="flex justify-between mb-4">
          <div class="text-center">
            <p class="font-semibold">Player 1</p>
            <span class="bg-brand text-white px-3 py-1 rounded-lg">0</span>
          </div>
          <div class="text-center">
            <p class="font-semibold">Player 2</p>
            <span class="bg-brand text-white px-3 py-1 rounded-lg">0</span>
          </div>
        </div>

        <div class="flex justify-center gap-4">
          <button class="bg-brand hover:bg-brand-dark text-white px-6 py-2 rounded-lg">Start Game</button>
          <button class="bg-gray-200 hover:bg-gray-300 text-gray-700 px-6 py-2 rounded-lg">Reset</button>
        </div>
      </div>
    </div>
  `;
}
