import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link, useNavigate } from 'react-router-dom';
import { Loader2, LogIn } from 'lucide-react';
import { loginSchema } from '../lib/validation'; 
import useAuthStore from '../store/useAuthStore';
import { authApi } from '../api/auth';
import Input from '../components/Input';

const Login = () => {
    const [isLoading, setIsLoading] = useState(false);
    const [serverError, setServerError] = useState('');
    const navigate = useNavigate();
    const login = useAuthStore((state) => state.login);

    
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
            const responseUser = await authApi.login(data);

            login(responseUser.user);
            navigate('/');
        } catch (error) {
            setServerError(error.message || 'Invalid credentials');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-secondary dark:bg-darkBg p-4">
            <div className="w-full max-w-md bg-white dark:bg-darkCard rounded-2xl shadow-xl p-8 space-y-6">
                <div className="text-center space-y-2">
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Welcome Back</h1>
                    <p className="text-gray-500 dark:text-gray-400">Sign in to continue</p>
                </div>

                {serverError && <div className="p-3 rounded-lg bg-red-50 text-red-600 text-sm text-center border border-red-100">{serverError}</div>}

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                    <Input label="Email" type="email" placeholder="chef@example.com" error={errors.email} {...register('email')} />
                    <Input label="Password" type="password" placeholder="••••••••" error={errors.password} {...register('password')} />

                    <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full py-3 bg-primary text-white rounded-lg bg-orange-600 disabled:opacity-70 flex justify-center items-center gap-2 transition-colors"
                    >
                        {isLoading ? <Loader2 className="animate-spin" size={20} /> : 'Sign In'}
                    </button>
                </form>

                <p className="text-center text-sm text-gray-600 dark:text-gray-400">
                    No account?{' '}
                    <Link to="/register" className="text-primary hover:underline font-medium">
                        Register
                    </Link>
                </p>
            </div>
        </div>
    );
};

export default Login;
