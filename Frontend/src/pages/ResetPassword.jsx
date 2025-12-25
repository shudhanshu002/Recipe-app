import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate, useParams } from 'react-router-dom';
import { authApi } from '../api/auth';
import Input from '../components/Input';
import useThemeStore from '../store/useThemeStore';
import Login3DBackground from '../components/Login3DBackground'; // Kept the 3D BG
import { Loader2, Lock } from 'lucide-react';
import { toast, ToastContainer } from 'react-toastify';

const ResetPassword = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const { theme } = useThemeStore();
  const isDarkMode = theme === 'dark';

  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm();

  const password = watch('password');

  const onSubmit = async (data) => {
    setIsLoading(true);
    try {
      const response = await authApi.resetPassword(token, data.password);
      if (response.success) {
        toast.success('Password reset successfully!');
        setTimeout(() => navigate('/login'), 2000);
      } else {
        toast.error(response.message || 'Invalid or expired token');
      }
    } catch (error) {
      toast.error('Failed to reset password');
    } finally {
      setIsLoading(false);
    }
  };

  // Theme Constants matching Login.jsx
  const containerBg = isDarkMode ? 'bg-[#121212]' : 'bg-gray-50';
  const cardBg = isDarkMode
    ? 'bg-[#1e1e1e]/90 backdrop-blur-md'
    : 'bg-white/90 backdrop-blur-md';
  const textColor = isDarkMode ? 'text-white' : 'text-gray-900';
  const subText = isDarkMode ? 'text-gray-400' : 'text-gray-500';

  return (
    <div
      className={`font-dancing relative flex items-center justify-center min-h-screen p-4 overflow-hidden ${containerBg}`}
    >
      <ToastContainer />
      <Login3DBackground isDarkMode={isDarkMode} />

      <div
        className={`relative z-10 w-full max-w-md rounded-2xl shadow-2xl p-8 space-y-6 border border-white/10 ${cardBg}`}
      >
        <div className="mb-8 text-center space-y-4">
          <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto shadow-inner">
            <Lock className="w-8 h-8 text-[#f97316]" />
          </div>
          <div>
            <h1 className={`text-3xl font-bold ${textColor}`}>
              Set new password
            </h1>
            <p className={`mt-2 ${subText}`}>
              Your new password must be different from previously used
              passwords.
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <Input
            label="New Password"
            placeholder="Enter new password"
            type="password"
            {...register('password', {
              required: 'Password is required',
              minLength: { value: 6, message: 'Must be at least 6 chars' },
            })}
            error={errors.password}
          />

          <Input
            label="Confirm Password"
            placeholder="Confirm new password"
            type="password"
            {...register('confirmPassword', {
              required: 'Please confirm your password',
              validate: (val) => val === password || 'Passwords do not match',
            })}
            error={errors.confirmPassword}
          />

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 bg-[#f97316] hover:bg-orange-800 text-white rounded-lg font-bold transition-all flex items-center justify-center gap-2 shadow-md disabled:opacity-70"
          >
            {isLoading ? (
              <Loader2 className="animate-spin" />
            ) : (
              'Reset Password'
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ResetPassword;
