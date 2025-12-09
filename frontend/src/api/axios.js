// src/api/axios.js
import axios from 'axios';

// Kita buat instance axios khusus
const api = axios.create({
  // Pastikan port ini SAMA dengan port backend kamu (biasanya 6543)
  baseURL: 'http://localhost:6543/api', 
  headers: {
    'Content-Type': 'application/json',
  },
});

export default api;