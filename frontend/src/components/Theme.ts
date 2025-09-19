export function addTheme()
{
	return `
	<!-- Theme -->
		<div class="min-h-screen
			flex flex-col
			items-center justify-start
			bg-[radial-gradient(ellipse_at_bottom,_rgba(255,165,0,0.35)_0%,_transparent_40%),radial-gradient(circle_at_80%_20%,_rgba(122,44,208,0.3)_0%,_transparent_30%),linear-gradient(180deg,_#140533_0%,_#3c1282_50%,_#0a0f3d_100%)]
			text-theme-text p-8">

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

			</div>`;
}
