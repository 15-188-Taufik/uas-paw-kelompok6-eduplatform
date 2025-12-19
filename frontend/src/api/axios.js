// src/api/axios.js
import axios from 'axios';

// Instance axios khusus
const api = axios.create({
  // [PERBAIKAN 1] Sesuaikan nama variabel dengan yang ada di Vercel (VITE_API_BASE_URL)
  baseURL: import.meta.env.VITE_API_BASE_URL || 'https://api.eduplatform.web.id',
  
  // [PERBAIKAN 2] Wajib tambahkan ini agar login/session jalan (Cookie)
  withCredentials: true, 

  headers: {
    'Content-Type': 'application/json'
  }
});

export default api;
