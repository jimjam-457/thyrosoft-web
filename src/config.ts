// Central API base URL configuration
// Prefer environment variable if provided, otherwise fallback to localhost
// Example: set REACT_APP_API_BASE=https://YOUR-NGROK-SUBDOMAIN.ngrok-free.app/api
export const API_URL: string =
  (process.env.REACT_APP_API_BASE && process.env.REACT_APP_API_BASE.trim()) || 'http://localhost:3771/api';
