# AGENTS.md

## Build Commands
- Frontend: `cd frontend && npm run build` (Vite) or `npm run dev`
- Backend: `make build/up` (Docker) or `make docker` (rebuild + start)
- Individual services: `make up-auth/up-user/up-gateway/up-ws/up-frontend`
- Rebuild: `make rebuild` (frontend) or `make rebuild-all` (all)

## Lint Commands
- Backend: `cd backend && npm run lint` (ESLint: 2-space indent, single quotes, semicolons, 120 char limit)
- Root: `npx eslint .` (includes frontend) or `npm run lint:fix` (auto-fix)

## Test Commands
- Manual WebSocket: `make up` then open `backend/ws-service/tests/*.html` in browser
- Automated: No setup yet - add Jest/Vitest to `frontend/src/tests/` or `backend/*/tests/`
- Single test: N/A (no automated tests configured)

## Code Style Guidelines
- **Languages**: TypeScript (frontend), JavaScript/Node.js (backend)
- **Imports**: ES modules; external libs first; absolute paths; no unused imports
- **Formatting**: 2-space indent; single quotes; semicolons; 120 char max; no trailing commas
- **Types**: Strict typing (`strict: true`); interfaces > any; prefer unions
- **Naming**: camelCase (vars/functions), PascalCase (classes/components), UPPER_SNAKE (constants)
- **Comments**: JSDoc for functions; avoid inline comments; self-documenting code
- **Error Handling**: try-catch; descriptive Error objects; log with context; handle async rejections
- **Async**: async/await preferred; Promise.all for concurrency; no callbacks
- **Security**: No secrets in code; validate/sanitize inputs; HTTPS/WSS; escape HTML/XSS
- **File Structure**: Related files grouped; MVC backend pattern; Husky pre-commit hooks