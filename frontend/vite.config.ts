import { defineConfig } from 'vite';
import fs from 'fs';

// сhecking if it's docker run
const isDocker = fs.existsSync('/.dockerenv');

export default defineConfig({
  root: '.',
  publicDir: 'public',
  server: {
    port: 3000,
    host:'0.0.0.0',
    open: !isDocker, // only locally open browser
    cors: true // Allow CORS for development
  },
  preview: {
    port: 3000,
    host:'0.0.0.0',
    open: !isDocker, // same behaviour for vite preview
    cors: true // Allow CORS for preview (needed when accessed through WAF)
  }
});
