import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";
import axios from "axios";

import { HelmetProvider } from "react-helmet-async";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import ErrorBoundary from "./components/ErrorBoundary";
import ConnectivityOverlay from "./components/ui/ConnectivityOverlay";

axios.defaults.withCredentials = true;

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false, // Optimize: Don't refetch on window focus
      retry: 1, // Optimize: Only retry failed requests once
    },
  },
});

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <HelmetProvider>
          <ConnectivityOverlay />
          <App />
        </HelmetProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  </StrictMode>,
);
