export function TimerDisplay(): string {
  return `
    <div id="timer"
         class="px-4 py-2 border border-gray-300 shadow-[0_0_30px_10px_#7037d3]
                rounded-md text-2xl font-bold text-gray-800 bg-white select-none">
      1:30
    </div>
  `;
}

let currentTimerInterval: number | null = null;

export function startTimer(duration: number = 5): void {
  // Clear any existing timer
  if (currentTimerInterval) {
    clearInterval(currentTimerInterval);
  }

  let remaining = duration;
  const timerElement = document.getElementById("timer");
  if (!timerElement) return;

  // Reset timer styling
  timerElement.classList.remove("text-red-600", "animate-pulse");

  // render immediately so UI matches the chosen duration
  const render = () => {
    const minutes = Math.floor(remaining / 60);
    const seconds = remaining % 60;
    timerElement.textContent = `${minutes}:${seconds.toString().padStart(2, "0")}`;
  };
  render();

  currentTimerInterval = window.setInterval(() => {
    // tick first
    remaining--;
    if (remaining <= 0) {
      clearInterval(currentTimerInterval!);
      currentTimerInterval = null;
      timerElement.textContent = "0:00";
	//   timerElement.classList.remove("animate-pulse"); // if it's better without pulsing after
	  (timerElement as HTMLElement).classList.add("text-red-600");
	  window.dispatchEvent(new CustomEvent("game:timeup"));
      return;
    }
	if (remaining <= 3) {
      timerElement.classList.add("text-red-600", "animate-pulse");
    }
	render();
  }, 1000);
}

export function resetTimer(duration?: number): void {
  if (currentTimerInterval) {
    clearInterval(currentTimerInterval);
    currentTimerInterval = null;
  }
  const timerElement = document.getElementById("timer");
  if (timerElement) {
    if (duration) {
      const minutes = Math.floor(duration / 60);
      const seconds = duration % 60;
      timerElement.textContent = `${minutes}:${seconds.toString().padStart(2, "0")}`;
    } else {
      timerElement.textContent = "1:30";
    }
    timerElement.classList.remove("text-red-600", "animate-pulse");
  }
}

