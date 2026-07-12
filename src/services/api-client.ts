import axios from "axios";
import { authStorage } from "@/lib/auth-storage";

/**
 * Central axios instance. Every service imports this instead of calling
 * axios directly, so swapping environments/auth behavior is a single edit.
 * Not yet wired to a live backend — see each service's mock implementation.
 */
export const apiClient = axios.create({
      //  baseURL: process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001/api",
     baseURL: process.env.NEXT_PUBLIC_API_URL ?? "https://obm-sourcing-backend.onrender.com/api",
 
  timeout: 15_000,
});

apiClient.interceptors.request.use((config) => {
  const token = authStorage.getToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      authStorage.clear();
    }
    return Promise.reject(error);
  },
);
