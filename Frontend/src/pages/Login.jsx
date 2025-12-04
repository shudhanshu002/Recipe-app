import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link, useNavigate } from 'react-router-dom';
import { Loader2, LogIn, Facebook } from 'lucide-react';
import { loginSchema } from '../lib/validation';
import { authApi } from '../api/auth';
import useAuthStore from '../store/useAuthStore';
import Input from '../components/Input';
import useThemeStore from '../store/useThemeStore';

const Login = () => {
    const [isLoading, setIsLoading] = useState(false);
    const [serverError, setServerError] = useState('');
    const navigate = useNavigate();
    const { login } = useAuthStore();
    const { isDarkMode } = useThemeStore();

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm({
        resolver: zodResolver(loginSchema),
    });

    const onSubmit = async (data) => {
        setIsLoading(true);
        setServerError('');
        try {
            const response = await authApi.login(data);
            login(response.user);
            navigate('/');
        } catch (error) {
            setServerError(error.message || 'Login failed');
        } finally {
            setIsLoading(false);
        }
    };

    // Social Login Handlers
    const handleGoogleLogin = () => {
        window.location.href = 'http://localhost:5000/api/v1/users/google';
    };

    const handleFacebookLogin = () => {
        window.location.href = 'http://localhost:5000/api/v1/users/facebook';
    };

    // Styles
    const containerBg = isDarkMode ? 'bg-[#121212]' : 'bg-secondary';
    const cardBg = isDarkMode ? 'bg-[#1e1e1e]' : 'bg-white';
    const textColor = isDarkMode ? 'text-white' : 'text-gray-900';
    const subText = isDarkMode ? 'text-gray-400' : 'text-gray-500';

    return (
        <div className={`flex items-center justify-center min-h-screen p-4 ${containerBg}`}>
            <div className={`w-full max-w-md rounded-2xl shadow-xl p-8 space-y-6 ${cardBg}`}>
                <div className="text-center space-y-2">
                    <div className="w-12 h-12 bg-primary rounded-xl flex items-center justify-center mx-auto text-white shadow-lg shadow-orange-500/20">
                        <LogIn size={24} />
                    </div>
                    <h1 className={`text-2xl font-bold ${textColor}`}>Welcome Back</h1>
                    <p className={subText}>Sign in to continue your culinary journey</p>
                </div>

                {serverError && <div className="p-3 bg-red-100 border border-red-200 text-red-700 rounded-lg text-sm text-center font-medium">{serverError}</div>}

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                    <Input label="Email" placeholder="chef@example.com" error={errors.email} {...register('email')} />
                    <Input label="Password" type="password" placeholder="••••••••" error={errors.password} {...register('password')} />

                    <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full py-3 bg-primary text-white rounded-lg flex justify-center font-bold hover:bg-orange-600 transition shadow-md disabled:opacity-70"
                    >
                        {isLoading ? <Loader2 className="animate-spin" /> : 'Sign In'}
                    </button>
                </form>

                <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                        <span className={`w-full border-t ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}></span>
                    </div>
                    <div className="relative flex justify-center text-xs uppercase">
                        <span className={`px-2 ${cardBg} ${subText}`}>Or continue with</span>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                    <button
                        onClick={handleGoogleLogin}
                        className={`flex items-center justify-center gap-2 py-2.5 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition ${
                            isDarkMode ? 'border-gray-700 text-white' : 'border-gray-200 text-gray-700'
                        }`}
                    >
                        <svg className="w-5 h-5" viewBox="0 0 24 24">
                            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                        </svg>
                        Google
                    </button>
                    <button
                        onClick={handleFacebookLogin}
                        className={`flex items-center justify-center gap-2 py-2.5 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition ${
                            isDarkMode ? 'border-gray-700 text-white' : 'border-gray-200 text-gray-700'
                        }`}
                    >
                        <Facebook className="w-5 h-5 text-[#1877F2]" fill="currentColor" />
                        Facebook
                    </button>
                </div>

                <p className={`text-center text-sm ${subText}`}>
                    Don't have an account?{' '}
                    <Link to="/register" className="text-primary hover:underline font-medium">
                        Sign up
                    </Link>
                </p>
            </div>
        </div>
    );
};

export default Login;
