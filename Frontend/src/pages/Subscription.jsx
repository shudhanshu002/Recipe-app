import React, { useState } from 'react';
import { Check, Crown, Loader, ShieldCheck, AlertCircle } from 'lucide-react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import useAuthStore from '../store/useAuthStore';
import useThemeStore from '../store/useThemeStore';

const loadRazorpayScript = () => {
  return new Promise((resolve) => {
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
};

const Subscription = () => {
  const { user, updateUser, setUser } = useAuthStore();
  const { theme } = useThemeStore();
  const isDarkMode = theme === 'dark';
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState('monthly'); // 'monthly' | 'yearly'

  const API_URL = 'http://localhost:5000/api/v1/payment';

  // Date formatter
  const formatDate = (dateString) => {
    if (!dateString) return 'Never';
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  const handlePayment = async () => {
    if (!user) {
      navigate('/login');
      return;
    }

    setLoading(true);

    try {
      const isLoaded = await loadRazorpayScript();
      if (!isLoaded) {
        alert('Razorpay SDK failed to load.');
        setLoading(false);
        return;
      }

      // 1. Get Key
      const { data: keyResponse } = await axios.get(`${API_URL}/razorpay-key`, {
        withCredentials: true,
      });
      const RAZORPAY_KEY_ID = keyResponse.data.key;

      // 2. Create Order (Send PLAN TYPE)
      const { data: orderResponse } = await axios.post(
        `${API_URL}/create-order`,
        { planType: selectedPlan },
        { withCredentials: true }
      );

      // 3. Open Razorpay
      const options = {
        key: RAZORPAY_KEY_ID,
        amount: orderResponse.data.amount,
        currency: orderResponse.data.currency,
        name: 'YumPlatform',
        description: `${selectedPlan} Subscription`,
        order_id: orderResponse.data.id,

        handler: async function (response) {
          try {
            const { data: verifyResponse } = await axios.post(
              `${API_URL}/verify-payment`,
              {
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                planType: selectedPlan, // Send this back!
              },
              { withCredentials: true }
            );

            alert('Payment Successful!');

            // Update State
            const freshUser = { ...verifyResponse.data, isPremium: true };
            if (updateUser) updateUser(freshUser);
            else if (setUser) setUser(freshUser);

            navigate('/');
          } catch (error) {
            console.error('Verify Error:', error);
            alert('Verification failed.');
          }
        },
        prefill: {
          name: user.username,
          email: user.email,
        },
        theme: { color: '#EAB308' },
      };

      const rzp = new window.Razorpay(options);
      rzp.on('payment.failed', function (response) {
        alert(`Payment Failed: ${response.error.description}`);
      });
      rzp.open();
    } catch (error) {
      // Handle "Already Active" Error
      if (error.response && error.response.status === 400) {
        alert(error.response.data.message); // Shows "You already have an active subscription..."
      } else {
        console.error('Payment Error:', error);
        alert('Could not start payment.');
      }
    } finally {
      setLoading(false);
    }
  };

  const bgClass = isDarkMode
    ? 'bg-[#121212] text-white'
    : 'bg-gray-200 text-gray-900';
  const cardBg = isDarkMode
    ? 'bg-[#1a1a1a] border-gray-700'
    : 'bg-white border-gray-200';

  return (
    <div
      className={`font-dancing min-h-screen py-20 px-4 ${bgClass} rounded-4xl`}
    >
      <div className="max-w-4xl mx-auto text-center mb-10">
        <h1 className="text-4xl font-bold mb-4">
          Upgrade to <span className="text-yellow-500">Premium</span>
        </h1>
        <p className="opacity-70 text-lg">Select your preferred plan.</p>
      </div>

      {/* Plan Toggle */}
      <div className="flex justify-center mb-8">
        <div
          className={`p-1 rounded-full border ${isDarkMode ? 'border-gray-700 bg-gray-800' : 'border-gray-200 bg-gray-100'} flex`}
        >
          <button
            onClick={() => setSelectedPlan('monthly')}
            className={`px-6 py-2 rounded-full text-sm font-bold transition-all ${selectedPlan === 'monthly' ? 'bg-white text-black shadow-md' : 'text-gray-500'}`}
          >
            Monthly
          </button>
          <button
            onClick={() => setSelectedPlan('yearly')}
            className={`px-6 py-2 rounded-full text-sm font-bold transition-all ${selectedPlan === 'yearly' ? 'bg-yellow-500 text-black shadow-md' : 'text-gray-500'}`}
          >
            Yearly
          </button>
        </div>
      </div>

      <div className="max-w-md mx-auto relative">
        <div
          className={`rounded-2xl p-8 border-2 ${selectedPlan === 'yearly' ? 'border-yellow-500' : 'border-gray-300'} shadow-xl ${cardBg} transition-all`}
        >
          {selectedPlan === 'yearly' && (
            <div className="absolute top-5 right-5 bg-yellow-100 text-yellow-700 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1">
              <Crown size={12} fill="currentColor" /> SAVE 20%
            </div>
          )}

          <h2 className="text-2xl font-bold mb-2 capitalize">
            {selectedPlan} Plan
          </h2>
          <div className="flex items-end gap-1 mb-6">
            <span className="text-5xl font-bold">
              {selectedPlan === 'monthly' ? '₹499' : '₹4999'}
            </span>
            <span className="text-gray-500 mb-1">
              / {selectedPlan === 'monthly' ? 'month' : 'year'}
            </span>
          </div>

          <ul className="space-y-4 mb-8">
            <li className="flex items-center gap-2">
              <Check className="text-green-500" /> Unlock Exclusive Recipes
            </li>
            <li className="flex items-center gap-2">
              <Check className="text-green-500" /> Ad-free Experience
            </li>
            <li className="flex items-center gap-2">
              <Check className="text-green-500" /> Priority Support
            </li>
          </ul>

          {user?.isPremium ? (
            <div className="text-center">
              <button
                disabled
                className="w-full py-4 rounded-xl bg-green-600 text-white font-bold flex items-center justify-center gap-2 cursor-default mb-2"
              >
                <ShieldCheck /> Active Subscription
              </button>
              <p className="text-sm text-gray-500 mt-2">
                Expires on:{' '}
                <span className="font-semibold text-yellow-500">
                  {formatDate(user.subscriptionExpiry)}
                </span>
              </p>
            </div>
          ) : (
            <button
              onClick={handlePayment}
              disabled={loading}
              className={`w-full py-4 rounded-xl font-bold flex items-center justify-center gap-2 transition-all hover:scale-105 ${
                selectedPlan === 'yearly'
                  ? 'bg-yellow-500 hover:bg-yellow-600 text-black'
                  : 'bg-gray-800 text-white hover:bg-gray-900'
              }`}
            >
              {loading ? (
                <Loader className="animate-spin" />
              ) : (
                `Get ${selectedPlan} Premium`
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default Subscription;
