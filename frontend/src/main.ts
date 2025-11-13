import { router } from './router';

// global event functions
// fires everytime URL’s hash changes
window.addEventListener('hashchange', router);
// loading content
window.addEventListener('DOMContentLoaded', router);
