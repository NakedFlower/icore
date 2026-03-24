import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "http://localhost:8000/api",
  timeout: 10000,
});

export const builderApi = {
  listTemplates: () => api.get("/builder/templates"),
  deploy: (payload) => api.post("/builder/deploy", payload),
};

export const siteApi = {
  listSites: () => api.get("/sites"),
  createSite: (payload) => api.post("/sites", payload),
};

export const scraperApi = {
  getConfig: () => api.get("/scraper/config"),
  updateConfig: (payload) => api.put("/scraper/config", payload),
  trigger: (payload) => api.post("/scraper/trigger", payload),
};
