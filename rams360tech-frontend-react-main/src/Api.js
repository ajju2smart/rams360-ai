import axios from "axios";

// REACT_APP_API_URL must be set at build time via docker-compose build args.
// Example: REACT_APP_API_URL=http://localhost:8000
// DO NOT add fallback URLs here — a missing env var should fail visibly, not silently route to production.
if (!process.env.REACT_APP_API_URL) {
  console.error(
    "[Api.js] REACT_APP_API_URL is not defined. " +
    "Set it in docker-compose.yml build args or .env before building."
  );
}

const Api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || "http://localhost:8000",
  withCredentials: true, // sends cookies automatically
});

// Prevent multiple refresh calls
let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach(prom => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });

  failedQueue = [];
};

Api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    const isAuthRoute =
      originalRequest.url.includes("/login") ||
      originalRequest.url.includes("/refresh") ||
      originalRequest.url.includes("/me");

    // If 401 AND not already retried AND not auth route
    if (
      error.response?.status === 401 &&
      !originalRequest._retry &&
      !isAuthRoute
    ) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then(() => Api(originalRequest))
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        await Api.post("/api/v1/user/refresh", {}, { withCredentials: true });
        
        processQueue(null);
        return Api(originalRequest);
      } catch (err) {
        processQueue(err, null);
        return Promise.reject(err); // ❌ DO NOT force redirect here
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

export default Api;