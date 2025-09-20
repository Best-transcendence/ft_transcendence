import { addTheme } from "../components/Theme"
import { sidebarDisplay } from "../components/SideBar"
import { profileDivDisplay } from "../components/ProfileDiv"
import { LogOutBtnDisplay } from "../components/LogOutBtn"

export function GamePong2D(): string {
  return `
	${ addTheme() }

	<div class="fixed inset-0 min-h-screen w-full bg-cover bg-center z-0"
		style="background-image: url('/assets/machine_tina_fav.png');">
	</div>


<!-- filters layer -->
		<div class="absolute inset-0 bg-gradient-to-b from-[#0f0f0f]/10 to-[#1a1a1a]/10 z-[1]"></div>
		<div class="absolute inset-0 bg-[radial-gradient(circle,rgba(0,0,0,0)_50%,rgba(0,0,0,1)_100%)] z-[2]"></div>

<!-- Header with user info -->
		<div class="w-full
			flex justify-between items-center
			mb-10 relative z-3">

<!-- Protected pages components -->
			${ profileDivDisplay() }
			${ sidebarDisplay() }
			${ LogOutBtnDisplay() }
		</div>

<!-- Game area -->
<div class="relative h-screen w-full flex items-center justify-center bg-[url('/assets/machine_tina_fav.png')] bg-cover bg-center overflow-hidden">
  <div class="gameArea">
  </div>
</div>

  `;
}



/* <!-- Background layer -->
	<div class="relative min-h-screen
		flex flex-col
		items-center justify-start
		bg-[url('assets/machine_tina_fav.png')] bg-cover bg-center z-[0]
		text-theme-text p-8">


		<!-- Game div -->
	<div class="absolute min-h-screen
		flex flex-col items-center justify-center
		font-['Press_Start_2P'] text-white overflow-hidden">

<!-- Game area -->

	  <div class="absolute w-[40vw]
				h-[55vh]
				bg-[rgba(7,26,29,0.6)]
				top-[12.5%]
				left-[29.8%]
				border-[1vw]
				border-[#919bebc7]
				rounded-2xl
				backdrop-blur-sm
				shadow-[0_0_40px_15px_#7037d3]
				z-10">

<!-- Net -->
<div class="absolute border-r-4 border-dotted border-white h-full top-0 left-1/2"></div>
		<div class="absolute border-r-[0.8vw] border-dotted border-[rgba(255,255,255,0.3)]
                    h-[96%] top-[2%] left-[calc(50%-0.4vw)]"></div>

        <!-- Scores -->
        <span id="score1"

              class="absolute top-[5%] left-[25%] text-[1.5vw] leading-none select-none">0</span>
        <span id="score2"
              class="absolute top-[5%] right-[25%] text-[1.5vw] leading-none select-none">0</span>

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

		<p id="startPress"
		class="absolute bottom-[5%] left-1/2 -translate-x-1/2 text-center
				bg-[#222222]/80 rounded px-4 py-2 text-[clamp(14px,1vw,20px)] select-none">
		Press Space To Start The Game
		</p>

        <!-- Audio -->
        <audio id="paddleSound" src="/assets/paddle.wav"></audio>
        <audio id="lossSound" src="/assets/loss.wav"></audio>
        <audio id="wallSound" src="/assets/wall.wav"></audio>
      </div>
    </div>*/



/* 		<h1 class="title">Pong</h1>
    <span class="score player1Score" id="player1Score">0</span>
    <span class="score player2Score" id="player2Score">0</span>
    <h3 class="startPress" id="startPress">Press Any Key To Start The Game</h3>
    <div class="gameArea">
      <div class="paddle paddle1" id="paddle1"></div>
      <div class="paddle paddle2" id="paddle2"></div>
      <div class="ball" id="ball"></div>
      <div class="net"></div>
    </div>

    <img class ="bg" src="../assets/machine_tina_fav.png" alt="Arcade Pong Machine"/>
    <div class="vignett"></div>
    <audio src="../assets/paddle.wav" id="paddleSound"></audio>
    <audio src="/assets/loss.wav" id="lossSound"></audio>
    <audio src="/assets/wall.wav" id="wallSound"></audio>
  </div>
  <script type="module" src="/src/main.ts"></script> */
