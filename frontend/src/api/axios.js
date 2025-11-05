import axios from "axios";

const API = axios.create({
  baseURL: "http://localhost:4000/api",
});

// Request interceptor - add token to all requests
API.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// No response interceptor for auth refresh; 401s will propagate so pages can handle them

export default API;
