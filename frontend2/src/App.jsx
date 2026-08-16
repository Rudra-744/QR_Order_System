import React, { Suspense, lazy } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import { Toaster } from "react-hot-toast";

// Lazy-loaded pages
const AdminWrapper = lazy(() => import("./components/AdminWrapper"));
const Login = lazy(() => import("./pages/Login"));
const Signup = lazy(() => import("./pages/Signup"));
const Menu = lazy(() => import("./pages/Menu"));

// Generic fallback loader
const PageLoader = () => (
  <div className="h-screen flex items-center justify-center bg-[#ece4d8]">
    <div className="animate-pulse flex flex-col items-center">
      <div className="w-16 h-16 border-4 border-[var(--color-navy,#1a2b4c)] border-t-transparent rounded-full animate-spin"></div>
    </div>
  </div>
);

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Toaster
          position="top-center"
          reverseOrder={false}
          toastOptions={{
            style: {
              borderRadius: "10px",
              background: "#333",
              color: "#fff",
            },
            success: {
              duration: 3000,
              theme: {
                primary: "#4aed88",
                secondary: "black",
              },
            },
          }}
        />

        <Suspense fallback={<PageLoader />}>
          <Routes>
            <Route path="/menu" element={<Menu />} />
            <Route path="/" element={<Menu />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route
              path="/admin"
              element={
                <ProtectedRoute>
                  <AdminWrapper />
                </ProtectedRoute>
              }
            />
          </Routes>
        </Suspense>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
