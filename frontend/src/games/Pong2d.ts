export function GamePong2D(): string {
  return `
    <div class="relative min-h-screen flex flex-col items-center justify-center font-['Press_Start_2P'] text-white overflow-hidden">

      <!-- Background layer -->
      <div class="absolute inset-0 bg-[url('assets/machine1.svg')] bg-cover bg-center z-[-2]"></div>

      <!-- Overlay gradient -->
      <div class="absolute inset-0 bg-gradient-to-b from-[#0f0f0f]/10 to-[#1a1a1a]/10 z-[-1]"></div>

      <!-- Vignette -->
      <div class="absolute inset-0 bg-[radial-gradient(circle,rgba(0,0,0,0)_50%,rgba(0,0,0,1)_100%)] z-0"></div>

      <!-- Game area -->
      <div class="absolute w-[90vw]
                  h-[55.6vw]
                  min-w-[420px]
                  min-h-[277px]
                  max-w-[1000px]
                  max-h-[666px]
                  bg-[rgba(7,26,29,0.6)]
                  top-[6%]
                  border-[2vw]
                  border-[#919bebc7]
                  rounded-2xl
                  backdrop-blur-sm
                  [transform:perspective(1000px)_rotateX(34deg)_scaleX(0.5)_scaleY(0.6)]
                  z-10">

        <!-- Net -->
        <div class="absolute border-r-[0.8vw] border-dotted border-[rgba(255,255,255,0.3)]
                    h-[96%] top-[2%] left-[calc(50%-0.4vw)]"></div>

        <!-- Scores -->
        <span id="score1"
              class="absolute top-[5%] left-[25%] text-[3vw] leading-none select-none">0</span>
        <span id="score2"
              class="absolute top-[5%] right-[25%] text-[3vw] leading-none select-none">0</span>

        <!-- Paddles -->
        <div id="paddle1"
             class="absolute h-[25%] w-[3.3%] bg-[rgba(255,255,255,0.9)]
                    top-[37.5%]"></div>
        <div id="paddle2"
             class="absolute h-[25%] w-[3.3%] bg-[rgba(255,255,255,0.9)]
                    top-[37.5%] right-0"></div>

        <!-- Ball -->
        <div id="ball"
             class="absolute h-[5%] w-[3.3%] bg-[rgba(255,255,255,0.9)]
                    rounded-[30%] left-[48.3%] top-[47.5%]
                    shadow-[0.8vw_1vw_0.4vw_rgba(0,0,0,0.9)]"></div>

        <!-- Start text -->
        <h3 id="startPress"
            class="absolute bottom-[5%] left-1/2 -translate-x-1/2 text-center
                   bg-[#222222]/80 rounded px-4 py-2 text-[1.5vw] select-none">
          Press Space To Start The Game
        </h3>

        <!-- Audio -->
        <audio id="paddleSound" src="/assets/paddle.wav"></audio>
        <audio id="lossSound" src="/assets/loss.wav"></audio>
        <audio id="wallSound" src="/assets/wall.wav"></audio>
      </div>
    </div>
  `;
}
