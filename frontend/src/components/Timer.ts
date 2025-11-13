// timer design
export function TimerDisplay(): string {
  return `
    <div id="timer"
         class="px-4 py-2 border border-gray-300 shadow-[0_0_30px_10px_#7037d3]
                rounded-md text-2xl font-bold text-gray-800 bg-white select-none">
      <!-- initial value will be set by startTimer -->
    </div>`;
}

// ID if an active countdown loop: new game, reset, interruption
let currentTimerInterval: number | null = null;

export function startTimer(duration: number) {
  // Clear any existing timer
  if (currentTimerInterval) {
    clearInterval(currentTimerInterval);
  }

  // get element from TimerDisplay
  const timerElement = document.getElementById("timer");
  if (!timerElement) return;

  // Reset timer styling
  timerElement.classList.remove("text-red-600", "animate-pulse");

  let remaining = duration; //to count down

  // function declaration
  const render = () => {
    const minutes = Math.floor(remaining / 60); // minute count (with round)
    const seconds = remaining % 60; // second count
    timerElement.textContent = `${minutes}:${seconds.toString().padStart(2, "0")}`; // "1:5" becomes "1:05" (padding start)
  };

  //render function call
  render();

  //setInterval(() => {code to run repeatedly}, milliseconds);
  currentTimerInterval = window.setInterval(() => {
    // tick first
    remaining--;
    if (remaining <= 0) {
	  // set to default
      clearInterval(currentTimerInterval!); // stop repeating countdown
      currentTimerInterval = null;
      timerElement.textContent = "0:00";
	  (timerElement as HTMLElement).classList.add("text-red-600"); // stays red
	  // register for addEventListner to stop the game
	  window.dispatchEvent(new CustomEvent("game:timeup"));
      return;
    }
	if (remaining <= 3) {
		// pulse close to the end (reamining-- so it's not the most precise)
      timerElement.classList.add("text-red-600", "animate-pulse");
    }
	render(); // display every second
  }, 1000); // 1000ms = 1s, runs every second (timer period)
}

// don't start, just setup for a new round (parameter optional)
export function resetTimer(duration?: number) {
  // clean
  if (currentTimerInterval) {
    clearInterval(currentTimerInterval);
    currentTimerInterval = null;
  }

  //set up
  const timerElement = document.getElementById("timer");
  if (timerElement) {
    if (duration) {
      const minutes = Math.floor(duration / 60);
      const seconds = duration % 60;
      timerElement.textContent = `${minutes}:${seconds.toString().padStart(2, "0")}`;
    } else {
      timerElement.textContent = "1:30";
    }
	// remove effect it's the beginning
    timerElement.classList.remove("text-red-600", "animate-pulse");
  }
}

