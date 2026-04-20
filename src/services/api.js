import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

/* ================= TOAST HELPER ================= */
const showSessionToast = () => {
  if (document.getElementById("merobase-session-toast")) return;

  const toast = document.createElement("div");
  toast.id = "merobase-session-toast";
  toast.style.cssText = `
    position: fixed;
    bottom: 32px;
    left: 50%;
    transform: translateX(-50%);
    background: #1E293B;
    color: white;
    padding: 12px 24px;
    border-radius: 12px;
    font-size: 14px;
    font-family: sans-serif;
    font-weight: 500;
    box-shadow: 0 8px 24px rgba(0,0,0,0.25);
    z-index: 99999;
    display: flex;
    align-items: center;
    gap: 10px;
    animation: merobaseSlideUp 0.3s ease;
  `;

  const style = document.createElement("style");
  style.textContent = `
    @keyframes merobaseSlideUp {
      from { opacity: 0; transform: translateX(-50%) translateY(12px); }
      to   { opacity: 1; transform: translateX(-50%) translateY(0); }
    }
  `;
  document.head.appendChild(style);

  toast.innerHTML = `
    <span style="font-size:18px">🔒</span>
    <span>Your session has expired — please log in again</span>
  `;

  document.body.appendChild(toast);

  setTimeout(() => {
    toast.style.transition = "opacity 0.3s ease";
    toast.style.opacity = "0";
    setTimeout(() => {
      toast.remove();
      style.remove();
    }, 300);
  }, 2500);
};

/* ================= REQUEST INTERCEPTOR ================= */
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("merobase_token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

/* ================= RESPONSE INTERCEPTOR ================= */
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("merobase_token");
      localStorage.removeItem("merobase_user");
      showSessionToast();
      setTimeout(() => {
        window.location.href = "/";
      }, 2800);
    }
    return Promise.reject(error);
  }
);

/* ================= AUTH ================= */
export const authAPI = {
  login:          (credentials) => api.post("/api/auth/login", credentials),
  register:       (credentials) => api.post("/api/auth/register", credentials),
  getMe:          ()             => api.get("/api/auth/me"),
  getActiveUsers: ()             => api.get("/api/auth/active-users"), // ✅ NEW
};

/* ================= SAMPLES ================= */
export const samplesAPI = {
  getAll:   ()           => api.get("/api/samples"),
  getById:  (id)         => api.get(`/api/samples/${id}`),
  search:   (params)     => api.get("/api/samples/search", { params }),
  create:   (data)       => api.post("/api/samples", data),
  update:   (id, data)   => api.put(`/api/samples/${id}`, data),
  delete:   (id)         => api.delete(`/api/samples/${id}`),
};

/* ================= UPLOAD ================= */
export const uploadAPI = {
  image: (file) => {
    const formData = new FormData();
    formData.append("file", file);
    return api.post("/api/upload/image", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  },
};

export default api;