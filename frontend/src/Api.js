import axios from "axios";

const API_BASE_URL_LOCAL = "http://localhost:5004/"; // Change this to your backend URL
const API_BASE_URL_PROD = "https://rams360server-86d8d55cead8.herokuapp.com/";
const API_BASE_URL_PROD_MAIN = "https://api.rams360tech.com/";

const Api = axios.create({
  baseURL: API_BASE_URL_PROD_MAIN,
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