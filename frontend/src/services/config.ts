// Use environment variables (must be set at build time)
// Supports only https://LAN_IP/ format (no localhost, no ports)
export const API_URL = import.meta.env.VITE_BACKEND_URL || '';
