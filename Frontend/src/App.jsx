import React, { useEffect, useState } from 'react';
import {
  Routes,
  Route,
  Navigate,
  useNavigate,
  useLocation,
} from 'react-router-dom';

// api
import api from './lib/axios';
import Layout from './components/Layout';
import useAuthStore from './store/useAuthStore';

// --- Pages ---
import SplashScreen from './pages/SplashScreen';
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
import ChefSpotlight from './pages/ChefSpotlight';

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuthStore();

  // Wait for auth check to finish before redirecting
  if (loading)
    return (
      <div className="flex items-center justify-center h-screen dark:bg-[#121212] dark:text-white">
        Loading...
      </div>
    );

  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return children;
};

const scrollbarStyles = `
  ::-webkit-scrollbar {
    width: 8px;
    height: 8px;
  }
  ::-webkit-scrollbar-track {
    background: transparent;
  }
  ::-webkit-scrollbar-thumb {
    background: #fb923c; /* Light orange */
    border-radius: 10px;
    border: 2px solid transparent;
    background-clip: content-box;
  }
  ::-webkit-scrollbar-thumb:hover {
    background: #f97316; /* Main orange */
  }
  .dark ::-webkit-scrollbar-thumb {
    background: #ea580c; /* Dark mode orange */
  }
  .dark ::-webkit-scrollbar-thumb:hover {
    background: #f97316; /* Hover orange */
  }
`;

function App() {
  const [showSplash, setShowSplash] = useState(() => {
    return !sessionStorage.getItem('hasSeenSplash');
  });
  const [authChecked, setAuthChecked] = useState(false);

  const { login, logout, isAuthenticated } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();

  // 1. Check Authentication on Mount
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await api.post('/users/refresh-token');

        if (response.data?.data?.user) {
          login(response.data.data.user);
        } else {
          logout();
        }
      } catch (error) {
        logout();
      } finally {
        setAuthChecked(true);
      }
    };
    checkAuth();
  }, [login, logout]);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);

  // 2. Handle Splash Finish
  const handleSplashFinish = () => {
    sessionStorage.setItem('hasSeenSplash', 'true');
    setShowSplash(false);
    navigate('/');
  };

  // 3. Render Splash Screen until Auth is ready AND Animation is done
  // if (showSplash) {
  //   return (
  //       <SplashScreen
  //           onFinish={() => {
  //               if (authChecked) handleSplashFinish();
  //               else {
  //                   // If auth is slow, wait for it
  //                   const checkInterval = setInterval(() => {
  //                       if (authChecked) {
  //                           clearInterval(checkInterval);
  //                           handleSplashFinish();
  //                       }
  //                   }, 100);
  //               }
  //           }}
  //           readyToFinish = {authChecked}
  //       />
  //   );
  // }

  // if (!showSplash && !authChecked) {
  //     return <div className="w-screen h-screen bg-black" />;
  // }

  return (
    <>
      <style>{scrollbarStyles}</style>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="/recipes/:id" element={<RecipeDetail />} />
          <Route path="/profile/:username" element={<Profile />} />
          <Route path="/chef/:id" element={<ChefSpotlight />} />
          <Route path="/community" element={<Community />} />
          <Route path="/recipes" element={<RecipeFeed />} />

          {/* Blog Routes */}
          <Route path="/blogs" element={<BlogFeed />} />
          <Route path="/blogs/:id" element={<BlogDetail />} />

          {/* Protected Routes */}
          <Route
            path="/create-recipe"
            element={
              <ProtectedRoute>
                <CreateRecipe />
              </ProtectedRoute>
            }
          />
          <Route
            path="/create-blog"
            element={
              <ProtectedRoute>
                <CreateBlog />
              </ProtectedRoute>
            }
          />
          <Route
            path="/meal-planner"
            element={
              <ProtectedRoute>
                <MealPlanner />
              </ProtectedRoute>
            }
          />
          <Route
            path="/shopping-list"
            element={
              <ProtectedRoute>
                <ShoppingList />
              </ProtectedRoute>
            }
          />
          <Route
            path="/favorites"
            element={
              <ProtectedRoute>
                <Favorites />
              </ProtectedRoute>
            }
          />
          <Route
            path="/notifications"
            element={
              <ProtectedRoute>
                <Notifications />
              </ProtectedRoute>
            }
          />
          <Route
            path="/subscription"
            element={
              <ProtectedRoute>
                <Subscription />
              </ProtectedRoute>
            }
          />
          <Route
            path="/settings"
            element={
              <ProtectedRoute>
                <Settings />
              </ProtectedRoute>
            }
          />
          <Route
            path="/payment/success"
            element={
              <ProtectedRoute>
                <PaymentSuccess />
              </ProtectedRoute>
            }
          />
        </Route>

        {/* Auth Routes (Redirect if already logged in) */}
        <Route
          path="/login"
          element={isAuthenticated ? <Navigate to="/" replace /> : <Login />}
        />
        <Route
          path="/register"
          element={isAuthenticated ? <Navigate to="/" replace /> : <Register />}
        />

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  );
}

export default App;
