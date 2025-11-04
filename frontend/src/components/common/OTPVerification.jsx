import React, { useState, useEffect } from 'react';
import { Mail, Phone, AlertCircle, CheckCircle, Loader } from 'lucide-react';

const OTPVerification = ({
  type = 'email',
  value,
  onVerificationChange,
  onSendOTP,
  onVerifyOTP,
  error,
  className = '',
}) => {
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState('');
  const [verified, setVerified] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [timeLeft, setTimeLeft] = useState(0);
  const [localError, setLocalError] = useState('');

  const isEmail = type === 'email';
  const Icon = isEmail ? Mail : Phone;
  const label = isEmail ? 'Email' : 'Phone';

  // Timer for OTP expiry
  useEffect(() => {
    let interval;
    if (timeLeft > 0) {
      interval = setInterval(() => setTimeLeft(prev => prev - 1), 1000);
    }
    return () => clearInterval(interval);
  }, [timeLeft]);

  const handleSendOTP = async () => {
    setLocalError('');
    setMessage('');

    if (!value || value.trim() === '') {
      setLocalError(`${label} is required`);
      return;
    }

    // Basic validation
    if (isEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
      setLocalError('Invalid email format');
      return;
    }

    if (!isEmail && !/^[\d\s\-\+\(\)]{7,}$/.test(value.replace(/\D/g, ''))) {
      setLocalError('Phone number must contain at least 7 digits');
      return;
    }

    setLoading(true);
    try {
      await onSendOTP(value);
      setOtpSent(true);
      setTimeLeft(600); // 10 minutes
      setMessage(`OTP sent to ${label.toLowerCase()} successfully. Check your ${isEmail ? 'email' : 'phone'}.`);
      setOtp('');
    } catch (err) {
      setLocalError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async () => {
    setLocalError('');
    setMessage('');

    if (!otp || otp.trim() === '') {
      setLocalError('OTP is required');
      return;
    }

    if (otp.length !== 6) {
      setLocalError('OTP must be 6 digits');
      return;
    }

    setLoading(true);
    try {
      await onVerifyOTP(value, otp);
      setVerified(true);
      setMessage(`${label} verified successfully!`);
      onVerificationChange(true);
    } catch (err) {
      setLocalError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleResendOTP = async () => {
    setOtpSent(false);
    setOtp('');
    setVerified(false);
    setMessage('');
    setLocalError('');
    await handleSendOTP();
  };

  if (verified) {
    return (
      <div className={`${className} mb-4`}>
        <div className="flex items-center gap-2 p-3 bg-green-50 border-2 border-green-200 rounded-lg">
          <CheckCircle className="w-5 h-5 text-green-600" />
          <span className="text-sm font-medium text-green-700">{label} verified successfully</span>
        </div>
      </div>
    );
  }

  return (
    <div className={`${className} mb-4`}>
      <div className="space-y-3">
        {/* Send OTP Button */}
        {!otpSent ? (
          <button
            type="button"
            onClick={handleSendOTP}
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-medium rounded-lg transition-colors"
          >
            {loading ? (
              <>
                <Loader className="w-4 h-4 animate-spin" />
                Sending OTP...
              </>
            ) : (
              <>
                <Icon className="w-4 h-4" />
                Send OTP to {label}
              </>
            )}
          </button>
        ) : (
          <>
            {/* OTP Input Field */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Enter OTP
              </label>
              <input
                type="text"
                value={otp}
                onChange={(e) => {
                  const val = e.target.value.replace(/\D/g, '').slice(0, 6);
                  setOtp(val);
                }}
                placeholder="000000"
                maxLength="6"
                className="w-full px-4 py-2.5 border-2 border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-center text-2xl letter-spacing tracking-widest"
              />
              <p className="mt-1 text-xs text-gray-500">
                OTP expires in {Math.floor(timeLeft / 60)}:{String(timeLeft % 60).padStart(2, '0')}
              </p>
            </div>

            {/* Verify Button */}
            <button
              type="button"
              onClick={handleVerifyOTP}
              disabled={loading || otp.length !== 6}
              className="w-full px-4 py-2.5 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white font-medium rounded-lg transition-colors"
            >
              {loading ? 'Verifying...' : 'Verify OTP'}
            </button>

            {/* Resend OTP Button */}
            <button
              type="button"
              onClick={handleResendOTP}
              disabled={loading}
              className="w-full px-4 py-2 text-blue-600 hover:text-blue-700 font-medium text-sm transition-colors"
            >
              Resend OTP
            </button>
          </>
        )}

        {/* Error Message */}
        {(error || localError) && (
          <div className="flex items-center gap-2 p-3 bg-red-50 border-2 border-red-200 rounded-lg">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
            <p className="text-sm text-red-700">{error || localError}</p>
          </div>
        )}

        {/* Success Message */}
        {message && (
          <div className="flex items-center gap-2 p-3 bg-blue-50 border-2 border-blue-200 rounded-lg">
            <CheckCircle className="w-5 h-5 text-blue-600" />
            <p className="text-sm text-blue-700">{message}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default OTPVerification;
