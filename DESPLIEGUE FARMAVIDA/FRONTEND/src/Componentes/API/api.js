import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "http://172.210.66.28:4000";

const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true
});

export default api;