export function drawCanvasBackground(): void {
  const canvas = document.getElementById("gameCanvas") as HTMLCanvasElement;
  const ctx = canvas?.getContext("2d");
  if (!canvas || !ctx) return;

  const bgImg = new Image();
  bgImg.src = "/assets/machine_tina_fav.png"; // public path
  bgImg.onload = () => {
    ctx.imageSmoothingEnabled = false;
    ctx.drawImage(bgImg, 0, 0, canvas.width, canvas.height);
  };
  bgImg.onerror = () => {
    console.error("❌ Could not load image:", bgImg.src);
  };
}
