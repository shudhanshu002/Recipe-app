import React, { useEffect, useState } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import useAuthStore from './store/useAuthStore';
import api from './lib/axios';
import Layout from './components/Layout';

// Auth
import Login from './pages/Login';
import Register from './pages/Register';

// Core
import Home from './pages/Home';
import CreateRecipe from './pages/CreateRecipe';
import RecipeDetail from './pages/RecipeDetail';

// Utilities
import MealPlanner from './pages/MealPlanner';
import ShoppingList from './pages/ShoppingList';
import Favorites from './pages/Favorites';

// Social & Profile
import Profile from './pages/Profile';
import Notifications from './pages/Notifications';
import Subscription from './pages/Subscription';
import Settings from './pages/Settings';

const ProtectedRoute = ({ children }) => {
    const { isAuthenticated } = useAuthStore();
    if (!isAuthenticated) return <Navigate to="/login" replace />;
    return children;
};

function App() {
    const [isInitializing, setIsInitializing] = useState(true);
    const { login, logout, isAuthenticated } = useAuthStore();

    useEffect(() => {
        const checkAuth = async () => {

          if (!isAuthenticated) {
              setIsInitializing(false);
              return;
          }

            try {
                const response = await api.post('/users/refresh-token');
                if (response.data?.data?.user) login(response.data.data.user);
            } catch (error) {
                logout();
            } finally {
                setIsInitializing(false);
            }
        };
        checkAuth();
    }, []);

    if (isInitializing) return <div className="flex items-center justify-center h-screen dark:bg-darkBg dark:text-white">Loading...</div>;

    return (
        <Routes>
            <Route path="/" element={<Layout />}>
                {/* Public Routes */}
                <Route index element={<Home />} />
                <Route path="/recipes/:id" element={<RecipeDetail />} />
                <Route path="/profile/:username" element={<Profile />} />

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
            </Route>

            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />

            <Route path="*" element={<Navigate to="/" replace />} />

            <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
        <Route path="/premium-recipes" element={<ProtectedRoute><h1>Premium Recipes Page (Coming Soon)</h1></ProtectedRoute>} />
        </Routes>
    );
}

export default App;
