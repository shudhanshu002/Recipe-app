import React, { useEffect, useState } from 'react';
import { Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import useAuthStore from './store/useAuthStore';
import api from './lib/axios';
import Layout from './components/Layout';

// --- Pages ---
import SplashScreen from './pages/SplashScreen'; // ✅ Import Splash
import Login from './pages/Login';
import Register from './pages/Register';
import Home from './pages/Home';
import CreateRecipe from './pages/CreateRecipe';
import RecipeDetail from './pages/RecipeDetail';
import MealPlanner from './pages/MealPlanner';
import ShoppingList from './pages/ShoppingList';
import Favorites from './pages/Favorites';
import Profile from './pages/Profile';
import Notifications from './pages/Notifications';
import Subscription from './pages/Subscription';
import Settings from './pages/Settings';
import BlogFeed from './pages/BlogFeed';
import CreateBlog from './pages/CreateBlog';
import BlogDetail from './pages/BlogDetail';
import Community from './pages/Community';
import PaymentSuccess from './pages/PaymentSuccess'; 
import RecipeFeed from './pages/RecipeFeed';

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuthStore();
  
  // Wait for auth check to finish before redirecting
  if (loading) return <div className="flex items-center justify-center h-screen dark:bg-[#121212] dark:text-white">Loading...</div>;
  
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return children;
};

function App() {
  // ✅ States for Splash & Auth
  const [showSplash, setShowSplash] = useState(true);
  const [authChecked, setAuthChecked] = useState(false);
  
  const { login, logout, isAuthenticated } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();

  // 1. Check Authentication on Mount
  useEffect(() => {
    const checkAuth = async () => {
      try {
        // Attempt to refresh token (verifies HttpOnly cookie)
        const response = await api.post('/users/refresh-token');
        
        if (response.data?.data?.user) {
            login(response.data.data.user);
        } else {
            logout();
        }
      } catch (error) {
        // Expected error if user is not logged in (401)
        logout();
      } finally {
        setAuthChecked(true);
      }
    };
    checkAuth();
  }, []); 

  // 2. Handle Splash Finish
  const handleSplashFinish = () => {
    setShowSplash(false);
    
    // Redirect Logic based on Auth Status
    // Only redirect if we are at the root ('/') to avoid breaking deep links
    if (location.pathname === '/') {
        if (isAuthenticated) {
            navigate('/'); // Already home, but ensures explicit flow
        } else {
            navigate('/login');
        }
    }
  };

  // 3. Render Splash Screen until Auth is ready AND Animation is done
  // We keep showing splash until 'handleSplashFinish' sets showSplash to false
  // We only allow 'handleSplashFinish' to run if authChecked is true
  if (showSplash) {
    return (
        <SplashScreen 
            onFinish={() => {
                if (authChecked) handleSplashFinish();
                else {
                    // If auth is slow, wait for it
                    const checkInterval = setInterval(() => {
                        if (authChecked) {
                            clearInterval(checkInterval);
                            handleSplashFinish();
                        }
                    }, 100);
                }
            }} 
        />
    );
  }

  return (
    <Routes>
      <Route path="/recipes" element={<RecipeFeed />} />
      <Route path="/" element={<Layout />}>
        <Route index element={<Home />} />
        <Route path="/recipes/:id" element={<RecipeDetail />} />
        <Route path="/profile/:username" element={<Profile />} />
        <Route path="/community" element={<Community />} />
        
        {/* Blog Routes */}
        <Route path="/blogs" element={<BlogFeed />} />
        <Route path="/blogs/:id" element={<BlogDetail />} />
        
        {/* Protected Routes */}
        <Route path="/create-recipe" element={<ProtectedRoute><CreateRecipe /></ProtectedRoute>} />
        <Route path="/create-blog" element={<ProtectedRoute><CreateBlog /></ProtectedRoute>} />
        <Route path="/meal-planner" element={<ProtectedRoute><MealPlanner /></ProtectedRoute>} />
        <Route path="/shopping-list" element={<ProtectedRoute><ShoppingList /></ProtectedRoute>} />
        <Route path="/favorites" element={<ProtectedRoute><Favorites /></ProtectedRoute>} />
        <Route path="/notifications" element={<ProtectedRoute><Notifications /></ProtectedRoute>} />
        <Route path="/subscription" element={<ProtectedRoute><Subscription /></ProtectedRoute>} />
        <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
        <Route path="/payment/success" element={<ProtectedRoute><PaymentSuccess /></ProtectedRoute>} />
      </Route>
      
      {/* Auth Routes (Redirect if already logged in) */}
      <Route path="/login" element={isAuthenticated ? <Navigate to="/" replace /> : <Login />} />
      <Route path="/register" element={isAuthenticated ? <Navigate to="/" replace /> : <Register />} />
      
      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;