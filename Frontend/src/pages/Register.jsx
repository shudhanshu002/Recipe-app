import React, { useState, useRef, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link, useNavigate } from 'react-router-dom';
import { Loader2, UserPlus, CheckCircle } from 'lucide-react';
import { registerSchema, otpSchema } from '../lib/validation';
import { authApi } from '../api/auth';
import Input from '../components/Input';
import useThemeStore from '../store/useThemeStore';

const Register = () => {
    const [step, setStep] = useState(1);
    const [isLoading, setIsLoading] = useState(false);
    const [email, setEmail] = useState('');
    const [serverError, setServerError] = useState('');
    const navigate = useNavigate();
    const { isDarkMode } = useThemeStore();

    
    const [otp, setOtp] = useState(new Array(6).fill(''));
    const inputRefs = useRef([]);

    
    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm({ resolver: zodResolver(registerSchema) });

    
    const {
        register: registerOtp,
        handleSubmit: handleSubmitOtp,
        setValue: setValueOtp, 
        formState: { errors: errorsOtp },
    } = useForm({ resolver: zodResolver(otpSchema) });

    

    useEffect(() => {
        setValueOtp('otp', otp.join(''));
    }, [otp, setValueOtp]);

    const handleOtpChange = (element, index) => {
        if (isNaN(element.value)) return false;

        const newOtp = [...otp];
        newOtp[index] = element.value;
        setOtp(newOtp);

        
        if (element.value && index < 5) {
            inputRefs.current[index + 1].focus();
        }
    };

    const handleKeyDown = (e, index) => {
        if (e.key === 'Backspace') {
            if (!otp[index] && index > 0) {
                inputRefs.current[index - 1].focus();
            } else if (otp[index]) {
                const newOtp = [...otp];
                newOtp[index] = '';
                setOtp(newOtp);
            }
        }
    };

    const handlePaste = (e) => {
        e.preventDefault();
        const data = e.clipboardData.getData('text').slice(0, 6).split('');
        if (data.length === 0) return;

        const newOtp = [...otp];
        data.forEach((char, index) => {
            if (index < 6 && !isNaN(char)) {
                newOtp[index] = char;
            }
        });
        setOtp(newOtp);

        
        const nextIndex = Math.min(data.length, 5);
        inputRefs.current[nextIndex].focus();
    };

    

    const onRegister = async (data) => {
        setIsLoading(true);
        setServerError('');
        try {
            await authApi.register(data);
            setEmail(data.email);
            setStep(2);
        } catch (error) {
            if (error.message && error.message.includes('409')) {
                setServerError('User with this email or username already exists.');
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

    
    const containerBg = isDarkMode ? 'bg-[#121212]' : 'bg-secondary';
    const cardBg = isDarkMode ? 'bg-[#1e1e1e]' : 'bg-white';
    const textColor = isDarkMode ? 'text-white' : 'text-gray-900';
    const subText = isDarkMode ? 'text-gray-400' : 'text-gray-500';
    const inputBg = isDarkMode ? 'bg-[#121212] border-gray-700 text-white' : 'bg-white border-gray-300 text-gray-900';

    return (
        <div className={`flex items-center justify-center min-h-screen p-4 ${containerBg}`}>
            <div className={`w-full max-w-md rounded-2xl shadow-xl p-8 space-y-6 ${cardBg}`}>
                <div className="text-center space-y-2">
                    <div className="w-12 h-12 bg-primary rounded-xl flex items-center justify-center mx-auto text-white">{step === 1 ? <UserPlus size={24} /> : <CheckCircle size={24} />}</div>
                    <h1 className={`text-2xl font-bold ${textColor}`}>{step === 1 ? 'Create Account' : 'Verify Email'}</h1>
                    <p className={subText}>{step === 1 ? 'Join our community of chefs' : `Enter the code sent to ${email}`}</p>
                </div>

                {serverError && <div className="p-3 bg-red-100 text-red-600 rounded-lg text-sm text-center border border-red-200">{serverError}</div>}

                {step === 1 ? (
                    <form onSubmit={handleSubmit(onRegister)} className="space-y-4">
                        <Input label="Username" placeholder="ChefName" error={errors.username} {...register('username')} />
                        <Input label="Email" placeholder="email@example.com" error={errors.email} {...register('email')} />
                        <Input label="Password" type="password" placeholder="••••••••" error={errors.password} {...register('password')} />
                        <button type="submit" disabled={isLoading} className="w-full py-3 bg-primary bg-orange-600 text-white rounded-lg flex justify-center transition disabled:opacity-70">
                            {isLoading ? <Loader2 className="animate-spin" /> : 'Send OTP'}
                        </button>
                    </form>
                ) : (
                    <form onSubmit={handleSubmitOtp(onOtp)} className="space-y-6">
                        <input type="hidden" {...registerOtp('otp')} />

                        <div className="flex gap-2 justify-center" onPaste={handlePaste}>
                            {otp.map((data, index) => (
                                <input
                                    key={index}
                                    type="text"
                                    maxLength="1"
                                    ref={(el) => (inputRefs.current[index] = el)}
                                    value={data}
                                    onChange={(e) => handleOtpChange(e.target, index)}
                                    onKeyDown={(e) => handleKeyDown(e, index)}
                                    onFocus={(e) => e.target.select()}
                                    className={`w-12 h-12 text-center text-xl font-semibold rounded-lg border focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all ${inputBg}`}
                                />
                            ))}
                        </div>

                        {errorsOtp.otp && <p className="text-center text-sm text-red-500 mt-2">{errorsOtp.otp.message}</p>}

                        <button type="submit" disabled={isLoading} className="w-full py-3 bg-accent bg-green-600 text-white rounded-lg flex justify-center transition disabled:opacity-70">
                            {isLoading ? <Loader2 className="animate-spin" /> : 'Verify'}
                        </button>

                        <button type="button" onClick={() => setStep(1)} className={`w-full text-sm hover:underline ${subText}`}>
                            Back to Registration
                        </button>
                    </form>
                )}

                {step === 1 && (
                    <p className={`text-center text-sm ${subText}`}>
                        Already have an account?{' '}
                        <Link to="/login" className="text-primary hover:underline font-medium">
                            Login
                        </Link>
                    </p>
                )}
            </div>
        </div>
    );
};

export default Register;
