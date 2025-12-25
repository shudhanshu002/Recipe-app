import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link } from 'react-router-dom';
import { authApi } from '../api/auth';
import Input from '../components/Input';
import useThemeStore from '../store/useThemeStore';
import Login3DBackground from '../components/Login3DBackground';
import { Loader2, ArrowLeft, Mail } from 'lucide-react';
import { toast, ToastContainer } from 'react-toastify';

const ForgotPassword = () => {
  const { theme } = useThemeStore();
  const isDarkMode = theme === 'dark';
  const [isLoading, setIsLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  const onSubmit = async (data) => {
    setIsLoading(true);

    // FIX 1: Sanitize input (Trim spaces and lowercase)
    const cleanEmail = data.email.trim().toLowerCase();

    console.log('Sending reset link to:', cleanEmail);

    try {
      const response = await authApi.forgotPassword(cleanEmail);
      console.log('API Response:', response);

      if (response.success) {
        setEmailSent(true);
        toast.success('Reset link sent! Check your inbox.');
      } else {
        // FIX 2: Don't hardcode "User not found". Show the actual server message.
        const msg = response.message || 'Unable to process request.';
        toast.error(msg);
      }
    } catch (error) {
      console.error('Forgot Password Error:', error);
      toast.error('Network error. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

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
        {emailSent ? (
          <div className="text-center space-y-6 animate-in fade-in zoom-in duration-300">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto shadow-inner">
              <Mail className="w-8 h-8 text-green-600" />
            </div>
            <h2 className={`text-2xl font-bold ${textColor}`}>
              Check your mail
            </h2>
            <p className={subText}>
              We have sent a password reset link to your email.
            </p>
            <Link
              to="/login"
              className="inline-block w-full py-3 bg-[#f97316] hover:bg-orange-800 text-white rounded-lg font-bold transition-all shadow-md"
            >
              Back to Login
            </Link>
          </div>
        ) : (
          <>
            <div className="space-y-2">
              <Link
                to="/login"
                className={`flex items-center gap-2 text-sm mb-4 ${subText} hover:text-[#f97316] transition-colors`}
              >
                <ArrowLeft size={16} /> Back to Login
              </Link>
              <h1 className={`text-3xl font-bold ${textColor}`}>
                Forgot Password?
              </h1>
              <p className={subText}>
                Enter your email to receive a reset link.
              </p>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              <Input
                label="Email Address"
                placeholder="chef@example.com"
                type="email"
                {...register('email', {
                  required: 'Email is required',
                  pattern: {
                    value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                    message: 'Invalid email address',
                  },
                })}
                error={errors.email}
              />

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 bg-[#f97316] hover:bg-orange-800 text-white rounded-lg font-bold transition-all flex items-center justify-center gap-2 shadow-md disabled:opacity-70"
              >
                {isLoading ? (
                  <Loader2 className="animate-spin" />
                ) : (
                  'Send Reset Link'
                )}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
};

export default ForgotPassword;
