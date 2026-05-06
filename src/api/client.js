import axios from "axios";

function getDefaultApiBaseUrl() {
  if (typeof window === "undefined") {
    return "http://localhost:8000/api";
  }

  const isLocalhost = ["localhost", "127.0.0.1"].includes(window.location.hostname);
  if (isLocalhost) {
    return "http://localhost:8000/api";
  }

  // 배포 환경에서는 동일 오리진 + /api 경로를 기본값으로 사용
  return `${window.location.origin}/api`;
}

const configuredApiBaseUrl = import.meta.env.VITE_API_BASE_URL || getDefaultApiBaseUrl();

function normalizeApiBaseUrl(rawUrl) {
  if (typeof window === "undefined") {
    return rawUrl;
  }

  try {
    const parsed = new URL(rawUrl, window.location.origin);

    // HTTPS 페이지에서는 HTTP API 호출이 브라우저에서 차단되므로 자동 보정
    if (window.location.protocol === "https:" && parsed.protocol === "http:") {
      parsed.protocol = "https:";
    }

    return parsed.toString().replace(/\/+$/, "");
  } catch {
    return rawUrl;
  }
}

export const API_BASE_URL = normalizeApiBaseUrl(configuredApiBaseUrl);

/** FastAPI 422 등에서 detail이 문자열·객체 배열·단일 객체일 때 안전한 메시지 문자열로 변환 */
export function formatApiError(error, fallback = "요청에 실패했습니다.") {
  const detail = error?.response?.data?.detail;
  if (detail == null || detail === "") {
    return fallback;
  }
  if (typeof detail === "string") {
    return detail;
  }
  if (Array.isArray(detail)) {
    const lines = detail
      .map((item) => {
        if (item == null) return "";
        if (typeof item === "string") return item;
        if (typeof item.msg === "string") {
          const loc = Array.isArray(item.loc)
            ? item.loc.filter((p) => p !== "body").join(".")
            : "";
          return loc ? `${loc}: ${item.msg}` : item.msg;
        }
        return "";
      })
      .filter(Boolean);
    return lines.length ? lines.join("\n") : fallback;
  }
  if (typeof detail === "object" && typeof detail.msg === "string") {
    return detail.msg;
  }
  try {
    return JSON.stringify(detail);
  } catch {
    return fallback;
  }
}

const api = axios.create({
  baseURL: API_BASE_URL,
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
  listRuns: (limit = 20) => api.get(`/scraper/runs?limit=${limit}`),
};
