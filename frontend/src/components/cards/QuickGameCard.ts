export function QuickGameCard(): string {
  return `
    <div id="quick-start-card"
         class="rounded-xl shadow-[0_0_30px_10px_#7037d3]
                p-6 w-64 text-center cursor-pointer
                bg-gradient-to-b from-orange-600 to-red-700
                hover:from-orange-500 hover:to-red-600
                transform
                transition-all duration-300 ease-in-out
                hover:scale-110
                mt-6">

      <h2 class="font-bold text-yellow-300 text-xl mb-3
                 transition-colors duration-300 hover:text-yellow-200">
        🔥 Quick Game
      </h2>

      <p class="text-orange-100 text-sm mb-4
                transition-colors duration-300 hover:text-orange-200">
        Jump straight into matchmaking and find an opponent instantly.
      </p>

      <button id="quick-start-btn"
              class="px-4 py-2 rounded-lg font-bold
                     bg-red-600 text-white
                     hover:bg-red-700
                     transition-colors duration-300">
        Start Now
      </button>
    </div>
  `;
}
