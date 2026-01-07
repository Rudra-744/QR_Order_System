import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Dashboard from './pages/Dashboard';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Menu from './pages/Menu';

// 👇 1. Import Karo
import { Toaster } from 'react-hot-toast';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        
        {/* 👇 2. Yahan Add Karo (Sabse Upar) */}
        <Toaster 
          position="top-center" 
          reverseOrder={false} 
          toastOptions={{
            style: {
              borderRadius: '10px',
              background: '#333',
              color: '#fff',
            },
            success: {
              duration: 3000,
              theme: {
                primary: '#4aed88',
                secondary: 'black',
              },
            },
          }}
        />

        <Routes>
          <Route path="/" element={<Menu />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route 
            path="/admin" 
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            } 
          />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;