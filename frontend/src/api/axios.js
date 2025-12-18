// src/api/axios.js
import axios from 'axios';

// Kita buat instance axios khusus
const api = axios.create({
  // Jika ada env VITE_API_URL (di Vercel), pakai itu. Jika tidak, pakai localhost.
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:6543/api',
});

export default api;