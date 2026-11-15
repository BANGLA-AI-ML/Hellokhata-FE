import axios from "axios";
import { toast } from "sonner";

const configuredApiUrl =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";
const API_ORIGIN = configuredApiUrl.replace(/\/api\/?$/, "");

const client = axios.create({
  baseURL: API_ORIGIN,
  withCredentials: true,
});

let isRefreshing = false;
let failedQueue: any[] = [];

const processQueue = (error: any, success = false) => {
  failedQueue.forEach((prom) => {
    if (success) prom.resolve();
    else prom.reject(error);
  });

  failedQueue = [];
};
client.interceptors.response.use(
  (res) => res,
  async (error) => {
    console.log(
      "Request:",
      error.config?.method?.toUpperCase(),
      error.config?.url,
    );
    console.log("Status:", error.response?.status);
    console.log("Response:", error.response?.data);
    const originalRequest = error.config;
    const message = error.response?.data?.message || "Something went wrong!";
    const isPublicAuthRequest =
      /(?:^|\/)api\/auth\/(?:signin|register|verify-otp|resend-otp|forget-password|verify-forget-otp|reset-password)(?:[/?]|$)/i.test(
        originalRequest?.url || "",
      );

    if (
      error.response?.status === 401 &&
      !originalRequest._retry &&
      !isPublicAuthRequest
    ) {
      originalRequest._retry = true;

      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then(() => client(originalRequest))
          .catch((err) => Promise.reject(err));
      }

      isRefreshing = true;

      try {
        await axios.post(
          `${API_ORIGIN}/api/auth/refresh`,
          {},
          { withCredentials: true },
        );
        processQueue(null, true);

        return client(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError, false);
        if (typeof window !== "undefined") {
          toast.error("Session expired. Please login again.");

          const pathname = window.location.pathname;

          if (pathname !== "/login" && pathname !== "/verify-forget-otp") {
            window.location.href = "/login";
          }
        }
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    console.log("error", error.response?.data);
    toast.error(message);
    return Promise.reject(error);
  },
);
export default client;
