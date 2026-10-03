import axios from "axios";

// The API is served from the same address as the app under /api
// (Nginx in production, the Vite dev proxy locally), so no host name is
// needed here. Set VITE_API_URL only when the API lives somewhere else.
const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "/api",
});

API.interceptors.request.use((req) => {
  const token = localStorage.getItem("token");
  if (token) {
    req.headers.Authorization = `Bearer ${token}`;
  }
  return req;
});

// An expired or revoked session sends the user back to the login page.
API.interceptors.response.use(
  (res) => res,
  (error) => {
    const status = error.response?.status;
    const url = error.config?.url || "";
    const hadToken = Boolean(localStorage.getItem("token"));
    const suspended = status === 403 && /suspended/i.test(error.response?.data?.message || "");
    if (hadToken && !url.includes("/auth/login") && (status === 401 || suspended)) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      if (window.location.pathname !== "/login") window.location.assign("/login");
    }
    return Promise.reject(error);
  }
);

export default API;
