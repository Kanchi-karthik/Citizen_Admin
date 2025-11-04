import React, { useState, useEffect } from 'react';
import { RefreshCw, AlertCircle, CheckCircle } from 'lucide-react';

const ImageCaptcha = ({ onVerify, error, className = '' }) => {
  const [captchaCode, setCaptchaCode] = useState('');
  const [userInput, setUserInput] = useState('');
  const [verified, setVerified] = useState(false);
  const [attempts, setAttempts] = useState(0);
  const [localError, setLocalError] = useState('');

  // Generate random captcha code with random characters
  const generateCaptcha = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let code = '';
    for (let i = 0; i < 6; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setCaptchaCode(code);
    setUserInput('');
    setLocalError('');
  };

  useEffect(() => {
    generateCaptcha();
  }, []);

  const handleVerify = () => {
    setLocalError('');

    if (!userInput.trim()) {
      setLocalError('Please enter the CAPTCHA code');
      return;
    }

    if (userInput === captchaCode) {
      setVerified(true);
      onVerify(true);
    } else {
      setAttempts(attempts + 1);
      if (attempts >= 2) {
        setLocalError('Too many incorrect attempts. Please refresh CAPTCHA.');
        generateCaptcha();
        setAttempts(0);
      } else {
        setLocalError(`Incorrect CAPTCHA. Attempts remaining: ${3 - attempts - 1}`);
      }
    }
  };

  if (verified) {
    return (
      <div className={`${className} mb-4`}>
        <div className="flex items-center gap-2 p-3 bg-green-50 border-2 border-green-200 rounded-lg">
          <CheckCircle className="w-5 h-5 text-green-600" />
          <span className="text-sm font-medium text-green-700">CAPTCHA verified successfully</span>
        </div>
      </div>
    );
  }

  return (
    <div className={`${className} mb-4`}>
      <label className="block text-sm font-medium text-gray-700 mb-3">Human Verification (CAPTCHA)</label>

      {/* CAPTCHA Display Box */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-300 rounded-lg p-6 mb-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex-1">
            <p className="text-xs text-gray-600 mb-2 font-semibold">Enter the text below:</p>
            {/* CAPTCHA Code Display with distortion effect */}
            <div className="bg-white border-2 border-gray-300 rounded px-4 py-3 text-center">
              <span
                className="inline-block text-4xl font-bold tracking-widest select-none"
                style={{
                  letterSpacing: '8px',
                  fontFamily: 'monospace',
                  textShadow: '2px 2px 4px rgba(0,0,0,0.1)',
                  transform: 'skewY(-5deg)',
                  color: '#1e40af',
                  filter: 'opacity(0.9)',
                }}
              >
                {captchaCode}
              </span>
            </div>
          </div>

          {/* Refresh Button */}
          <button
            type="button"
            onClick={generateCaptcha}
            className="ml-4 p-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors flex items-center justify-center h-12 w-12"
            title="Generate new CAPTCHA"
          >
            <RefreshCw className="w-5 h-5" />
          </button>
        </div>

        {/* Input Field */}
        <div className="mt-4">
          <input
            type="text"
            value={userInput}
            onChange={(e) => setUserInput(e.target.value.toUpperCase().slice(0, 6))}
            placeholder="Enter CAPTCHA code here"
            maxLength="6"
            className="w-full px-4 py-2.5 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-center text-lg tracking-widest font-semibold"
            onKeyPress={(e) => {
              if (e.key === 'Enter') {
                handleVerify();
              }
            }}
          />
        </div>

        {/* Verify Button */}
        <button
          type="button"
          onClick={handleVerify}
          className="w-full mt-4 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
        >
          Verify CAPTCHA
        </button>
      </div>

      {/* Error Message */}
      {(error || localError) && (
        <div className="flex items-center gap-2 p-3 bg-red-50 border-2 border-red-200 rounded-lg mb-4">
          <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
          <p className="text-sm text-red-700">{error || localError}</p>
        </div>
      )}
    </div>
  );
};

export default ImageCaptcha;
