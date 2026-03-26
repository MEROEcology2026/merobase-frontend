import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

/* ================= REQUEST INTERCEPTOR ================= */
// Automatically attach token to every request
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
// Automatically handle 401 (token expired)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("merobase_token");
      localStorage.removeItem("merobase_user");
      window.location.href = "/";
    }
    return Promise.reject(error);
  }
);

/* ================= AUTH ================= */
export const authAPI = {
  login: (credentials) => api.post("/api/auth/login", credentials),
  register: (credentials) => api.post("/api/auth/register", credentials),
  getMe: () => api.get("/api/auth/me"),
};

/* ================= SAMPLES ================= */
export const samplesAPI = {
  getAll: () => api.get("/api/samples"),
  getById: (id) => api.get(`/api/samples/${id}`),
  search: (params) => api.get("/api/samples/search", { params }),
  create: (data) => api.post("/api/samples", data),
  update: (id, data) => api.put(`/api/samples/${id}`, data),
  delete: (id) => api.delete(`/api/samples/${id}`),
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