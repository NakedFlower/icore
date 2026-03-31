import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "http://localhost:8000/api",
  timeout: 10000,
});

export const AUTH_TOKEN_KEY = "icore_admin_access_token";

api.interceptors.request.use((config) => {
  const token = window.localStorage.getItem(AUTH_TOKEN_KEY);
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const authApi = {
  login: (payload) => api.post("/auth/login", payload),
};

export const builderApi = {
  listTemplates: () => api.get("/builder/templates"),
  getTemplateDetail: (templateId) => api.get(`/builder/templates/${templateId}`),
  deploy: (payload) => api.post("/builder/deploy", payload),
};

export const siteApi = {
  listSites: () => api.get("/sites"),
  updateSite: (siteId, payload) => api.put(`/sites/${siteId}`, payload),
  deleteSite: (siteId) => api.delete(`/sites/${siteId}`),
};

export const scraperApi = {
  getConfig: () => api.get("/scraper/config"),
  updateConfig: (payload) => api.put("/scraper/config", payload),
  trigger: (payload) => api.post("/scraper/trigger", payload),
};
