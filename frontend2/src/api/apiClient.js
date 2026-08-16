import axios from 'axios';
import toast from 'react-hot-toast';

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

const apiClient = axios.create({
  baseURL: API_URL,
  withCredentials: true,
  timeout: 10000, // 10s default timeout
  headers: {
    "Bypass-Tunnel-Reminder": "true"
  }
});

// Response Interceptor for centralized error handling
apiClient.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    const isSilent = error.config?.silent;
    const status = error.response?.status;
    const message = error.response?.data?.message || error.response?.data?.error || error.message || "An unexpected error occurred.";
    
    // Global toast for errors, skipping 401s which are usually handled by auth flows,
    // and skipping requests explicitly marked as silent (e.g. mutations with their own error handling)
    if (status !== 401 && !isSilent) {
       toast.error(message, { id: 'global-api-error' });
    }
    
    return Promise.reject(error);
  }
);

export default apiClient;
