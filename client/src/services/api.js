import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "http://localhost:5001/api"
});

let authToken = localStorage.getItem("dpa_auth_token") || "";

export function setAuthToken(token) {
  authToken = token || "";
}

api.interceptors.request.use((config) => {
  if (authToken) {
    config.headers.Authorization = `Bearer ${authToken}`;
  }
  return config;
});

export const authApi = {
  login: async (payload) => {
    const { data } = await api.post("/auth/login", payload);
    return data;
  },
  registerStudent: async (payload) => {
    const { data } = await api.post("/auth/register-student", payload);
    return data;
  },
  me: async () => {
    const { data } = await api.get("/auth/me");
    return data;
  }
};

export const profileApi = {
  getAll: async () => {
    const { data } = await api.get("/profiles");
    return data;
  },
  getMe: async () => {
    const { data } = await api.get("/profiles/me");
    return data;
  },
  getOne: async (id) => {
    const { data } = await api.get(`/profiles/${id}`);
    return data;
  },
  create: async (payload) => {
    const { data } = await api.post("/profiles", payload);
    return data;
  },
  update: async (id, payload) => {
    const { data } = await api.put(`/profiles/${id}`, payload);
    return data;
  },
  remove: async (id) => {
    const { data } = await api.delete(`/profiles/${id}`);
    return data;
  },
  verify: async (payload) => {
    const { data } = await api.post("/profiles/verify", payload);
    return data;
  },
  updateMe: async (payload) => {
    const { data } = await api.put("/profiles/me", payload);
    return data;
  },
  leaderboard: async () => {
    const { data } = await api.get("/profiles/leaderboard");
    return data;
  },
  getPublicProfile: async (username) => {
    const { data } = await api.get(`/profiles/public/${username}`);
    return data;
  },
  getDevCard: async (username) => {
    const { data } = await api.get(`/profiles/dev-card/${username}`);
    return data;
  }
};

export default api;
