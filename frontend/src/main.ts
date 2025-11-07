import { router } from './router';

window.addEventListener('hashchange', router);
window.addEventListener('DOMContentLoaded', router);

// Handle browser back/forward navigation
window.addEventListener('popstate', () => {
  const currentHash = window.location.hash.slice(1).split('?')[0];
  const gamePages = ['AIopponent', 'tournament', 'pong', 'remote'];

  if (gamePages.includes(currentHash)) {
    window.location.hash = '#intro';
  }
});

// Handle page reload on game pages
window.addEventListener('beforeunload', () => {
  const currentHash = window.location.hash.slice(1).split('?')[0];
  const gamePages = ['AIopponent', 'tournament', 'pong', 'remote'];

  if (gamePages.includes(currentHash)) {
    window.location.hash = '#intro';
  }
});
