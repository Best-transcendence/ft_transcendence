import { router } from "./router";

document.addEventListener("DOMContentLoaded", () => {
  router(); // bootstrap the SPA
});

// When user clicks back/forward in browser
window.addEventListener("hashchange", router);