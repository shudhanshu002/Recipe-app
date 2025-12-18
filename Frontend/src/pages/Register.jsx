import { useState, useRef, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Link, useNavigate } from 'react-router-dom';

// zod validation
import { zodResolver } from '@hookform/resolvers/zod';
import { registerSchema, otpSchema } from '../lib/validation';

// api
import { authApi } from '../api/auth';

// store
import useThemeStore from '../store/useThemeStore';

// component
import Input from '../components/Input';
import Login3DBackground from '../components/Login3DBackground';

// animation and icons
import { motion } from 'framer-motion';
import {
  Loader2,
  UserPlus,
  CheckCircle,
  Facebook,
  EyeOff,
  Eye,
} from 'lucide-react';

const Register = () => {
  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [serverError, setServerError] = useState('');

  // OTP State: Array of 6 strings
  const [otp, setOtp] = useState(new Array(6).fill(''));
  const inputRefs = useRef([]); // To hold refs for the 6 inputs

  const navigate = useNavigate();
  const { theme } = useThemeStore();
  const isDarkMode = theme === 'dark';

  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({ resolver: zodResolver(registerSchema) });

  const {
    handleSubmit: handleSubmitOtp,
    setValue, // We need this to manually set the OTP value for Zod
    formState: { errors: errorsOtp },
  } = useForm({ resolver: zodResolver(otpSchema) });

  // Sync local OTP state with React Hook Form
  useEffect(() => {
    setValue('otp', otp.join(''));
  }, [otp, setValue]);

  const onRegister = async (data) => {
    setIsLoading(true);
    setServerError('');
    try {
      await authApi.register(data);
      setEmail(data.email);
      setStep(2);
    } catch (error) {
      if (error.statusCode === 409) {
        setServerError('User already exists! Please Login.');
      } else {
        setServerError(error.message || 'Registration Failed');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const onOtp = async (data) => {
    setIsLoading(true);
    setServerError('');
    try {
      await authApi.verifyOtp({ email, otp: data.otp });
      navigate('/login');
    } catch (error) {
      setServerError(error.message || 'Invalid OTP');
    } finally {
      setIsLoading(false);
    }
  };

  // 1. Handle Typing
  const handleOtpChange = (element, index) => {
    if (isNaN(element.value)) return;

    const newOtp = [...otp];
    newOtp[index] = element.value;
    setOtp(newOtp);

    // Move to next input if value is entered
    if (element.value && index < 5) {
      inputRefs.current[index + 1].focus();
    }
  };

  // 2. Handle Backspace
  const handleKeyDown = (e, index) => {
    if (e.key === 'Backspace') {
      if (!otp[index] && index > 0) {
        // If current box is empty, focus previous and clear it
        const newOtp = [...otp];
        newOtp[index - 1] = '';
        setOtp(newOtp);
        inputRefs.current[index - 1].focus();
      }
    }
  };

  // 3. Handle Paste
  const handlePaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').slice(0, 6); // Get first 6 chars
    if (!/^\d+$/.test(pastedData)) return; // Only allow numbers

    const newOtp = [...otp];
    pastedData.split('').forEach((char, i) => {
      if (i < 6) newOtp[i] = char;
    });
    setOtp(newOtp);

    // Focus the box after the pasted content
    const nextIndex = Math.min(pastedData.length, 5);
    inputRefs.current[nextIndex].focus();
  };

  const base_url = import.meta.env.VITE_API_URL;

  // Social Handlers
  const handleGoogleLogin = () => {
    window.location.href = `${base_url}/users/google`;
  };
  const handleFacebookLogin = () => {
    window.location.href = `${base_url}/users/facebook`;
  };

  // Theme Styles
  const containerBg = isDarkMode ? 'bg-[#121212]' : 'bg-[#3b82f6]';
  const cardBg = isDarkMode ? 'bg-[#1e1e1e]' : 'bg-white';
  const textColor = isDarkMode ? 'text-white' : 'text-gray-900';
  const subText = isDarkMode ? 'text-gray-400' : 'text-gray-500';
  const inputBg = isDarkMode
    ? 'bg-[#2d2d2d] border-gray-600 text-white'
    : 'bg-gray-50 border-gray-200 text-gray-900';

  return (
    <div
      className={`font-dancing relative flex items-center justify-center min-h-screen p-4 ${containerBg}`}
    >
      <Login3DBackground isDarkMode={isDarkMode} />
      <div
        className={`relative z-10 w-full max-w-md rounded-2xl shadow-xl p-8 space-y-6 ${cardBg}`}
      >
        {/* ⭐ TOP PROGRESS BAR ⭐ */}
        <div
          className={`w-full h-1 rounded overflow-hidden mb-4 ${isDarkMode ? 'bg-gray-700' : 'bg-gray-300'}`}
        >
          <motion.div
            initial={{ width: step === 1 ? '50%' : '100%' }}
            animate={{ width: step === 1 ? '50%' : '100%' }}
            transition={{ duration: 0.6, ease: 'easeInOut' }}
            className="h-full bg-[#f97316]"
          />
        </div>

        <div className="text-center space-y-2">
          <div className="w-12 h-12 bg-[#f97316] rounded-xl flex items-center justify-center mx-auto text-white shadow-lg shadow-orange-500/20">
            {step === 1 ? <UserPlus size={24} /> : <CheckCircle size={24} />}
          </div>
          <h1 className={`text-2xl font-bold ${textColor}`}>
            {step === 1 ? 'Create Account' : 'Verify Email'}
          </h1>
          <p className={subText}>
            {step === 1
              ? 'Join our community of chefs'
              : `Enter the code sent to ${email}`}
          </p>
        </div>

        {serverError && (
          <div className="p-3 bg-red-100 border border-red-200 text-red-700 rounded-lg text-sm text-center font-medium">
            {serverError}
          </div>
        )}

        {step === 1 ? (
          <>
            <form onSubmit={handleSubmit(onRegister)} className="space-y-4">
              <Input
                label="Username"
                placeholder="ChefName"
                error={errors.username}
                {...register('username')}
              />
              <Input
                label="Email"
                placeholder="email@example.com"
                error={errors.email}
                {...register('email')}
              />

              <div className="relative">
                <Input
                  label="Password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  error={errors.password}
                  {...register('password')}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  // Adjust 'top' if the icon isn't aligned with your input field perfectly
                  className="absolute right-3 top-[38px] text-gray-400 hover:text-[#f97316] transition-colors focus:outline-none"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 bg-[#f97316] text-white rounded-lg flex justify-center hover:bg-orange-600 transition shadow-md font-bold disabled:opacity-70"
              >
                {isLoading ? <Loader2 className="animate-spin" /> : 'Send OTP'}
              </button>
            </form>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span
                  className={`w-full border-t ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}
                ></span>
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className={`px-2 ${cardBg} ${subText}`}>
                  Or sign up with
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={handleGoogleLogin}
                className={`flex items-center justify-center gap-2 py-2.5 border rounded-lg transition ${
                  isDarkMode
                    ? 'border-gray-700 text-white hover:bg-gray-800'
                    : 'border-gray-200 text-gray-700 hover:bg-gray-50'
                }`}
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    fill="#4285F4"
                  />
                  <path
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    fill="#34A853"
                  />
                  <path
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                    fill="#FBBC05"
                  />
                  <path
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    fill="#EA4335"
                  />
                </svg>
                Google
              </button>

              <button
                type="button"
                onClick={handleFacebookLogin}
                className={`flex items-center justify-center gap-2 py-2.5 border rounded-lg transition ${
                  isDarkMode
                    ? 'border-gray-700 text-white hover:bg-gray-800'
                    : 'border-gray-200 text-gray-700 hover:bg-gray-50'
                }`}
              >
                <Facebook
                  className="w-5 h-5 text-[#1877F2]"
                  fill="currentColor"
                />{' '}
                Facebook
              </button>
            </div>
          </>
        ) : (
          <form onSubmit={handleSubmitOtp(onOtp)} className="space-y-6">
            {/* 6-Box OTP Input */}
            <div className="flex justify-between gap-2">
              {otp.map((data, index) => (
                <input
                  key={index}
                  type="text"
                  name="otp"
                  maxLength="1"
                  value={data}
                  ref={(el) => (inputRefs.current[index] = el)}
                  onChange={(e) => handleOtpChange(e.target, index)}
                  onKeyDown={(e) => handleKeyDown(e, index)}
                  onPaste={handlePaste}
                  className={`w-12 h-14 text-center text-xl font-bold rounded-xl border focus:border-[#f97316] focus:ring-2 focus:ring-[#f97316]/20 outline-none transition-all ${inputBg}`}
                />
              ))}
            </div>

            {errorsOtp.otp && (
              <p className="text-red-500 text-sm text-center">
                {errorsOtp.otp.message}
              </p>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 bg-[#f97316] text-white rounded-lg flex justify-center hover:bg-orange-600 transition font-bold disabled:opacity-70"
            >
              {isLoading ? (
                <Loader2 className="animate-spin" />
              ) : (
                'Verify & Create'
              )}
            </button>
          </form>
        )}

        {step === 1 && (
          <p className={`text-center text-sm ${subText}`}>
            Already have an account?{' '}
            <Link
              to="/login"
              className="text-[#f97316] hover:underline font-medium"
            >
              Login
            </Link>
          </p>
        )}
      </div>
    </div>
  );
};

export default Register;
