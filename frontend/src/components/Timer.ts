// timer.ts
export function TimerDisplay(): string {
  return `
    <div id="timer"
         class="px-4 py-2 border border-gray-300 shadow-[0_0_30px_10px_#7037d3]
                rounded-md text-2xl font-bold text-gray-800 bg-white select-none">
      1:30
    </div>
  `;
}

							// TODO setup to 90 
export function startTimer(duration: number = 5): void {
  let remaining = duration;
  const timerElement = document.getElementById("timer");
  if (!timerElement) return;

  const interval = window.setInterval(() => {
    const minutes = Math.floor(remaining / 60);
    const seconds = remaining % 60;
    timerElement.textContent = `${minutes}:${seconds.toString().padStart(2, "0")}`;

    if (remaining <= 0) {
      clearInterval(interval);
      timerElement.textContent = "0:00";
      (timerElement as HTMLElement).classList.add("text-red-600");
    }

    remaining--;
  }, 1000);
}