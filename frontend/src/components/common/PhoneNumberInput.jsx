import React, { useState } from 'react';
import { ChevronDown } from 'lucide-react';

const PhoneNumberInput = ({
  label,
  value,
  onChange,
  error,
  placeholder = 'Enter phone number',
  className = '',
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedCountry, setSelectedCountry] = useState({
    code: '+91',
    name: 'India',
    flag: '🇮🇳',
  });

  const countries = [
    { code: '+1', name: 'USA/Canada', flag: '🇺🇸' },
    { code: '+44', name: 'United Kingdom', flag: '🇬🇧' },
    { code: '+91', name: 'India', flag: '🇮🇳' },
    { code: '+86', name: 'China', flag: '🇨🇳' },
    { code: '+81', name: 'Japan', flag: '🇯🇵' },
    { code: '+33', name: 'France', flag: '🇫🇷' },
    { code: '+49', name: 'Germany', flag: '🇩🇪' },
    { code: '+39', name: 'Italy', flag: '🇮🇹' },
    { code: '+34', name: 'Spain', flag: '🇪🇸' },
    { code: '+61', name: 'Australia', flag: '🇦🇺' },
    { code: '+64', name: 'New Zealand', flag: '🇳🇿' },
    { code: '+27', name: 'South Africa', flag: '🇿🇦' },
    { code: '+55', name: 'Brazil', flag: '🇧🇷' },
    { code: '+52', name: 'Mexico', flag: '🇲🇽' },
    { code: '+65', name: 'Singapore', flag: '🇸🇬' },
    { code: '+60', name: 'Malaysia', flag: '🇲🇾' },
  ];

  const handleCountrySelect = (country) => {
    setSelectedCountry(country);
    setIsOpen(false);
  };

  const handlePhoneChange = (e) => {
    const phoneNumber = e.target.value.replace(/\D/g, '');
    onChange({
      target: {
        name: 'phone',
        value: `${selectedCountry.code}${phoneNumber}`,
        type: 'tel',
      },
    });
  };

  const displayPhoneNumber = value.replace(selectedCountry.code, '');

  return (
    <div className={`mb-4 ${className}`}>
      {label && (
        <label className="block text-sm font-medium text-slate-700 mb-2">
          {label}
        </label>
      )}

      <div className="flex gap-2">
        {/* Country Code Dropdown */}
        <div className="relative w-32">
          <button
            type="button"
            onClick={() => setIsOpen(!isOpen)}
            className="w-full flex items-center justify-between px-3 py-2.5 border-2 border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 shadow-sm hover:border-slate-400 bg-white text-sm"
          >
            <span className="flex items-center gap-1">
              <span className="text-lg">{selectedCountry.flag}</span>
              <span className="font-semibold text-slate-700">{selectedCountry.code}</span>
            </span>
            <ChevronDown
              className={`w-4 h-4 text-gray-500 transition-transform ${isOpen ? 'rotate-180' : ''}`}
            />
          </button>

          {/* Dropdown Menu */}
          {isOpen && (
            <div className="absolute top-full left-0 right-0 mt-1 bg-white border-2 border-slate-300 rounded-lg shadow-lg z-50 max-h-64 overflow-y-auto">
              {countries.map((country) => (
                <button
                  key={country.code}
                  type="button"
                  onClick={() => handleCountrySelect(country)}
                  className="w-full text-left px-3 py-2.5 hover:bg-blue-50 focus:bg-blue-50 focus:outline-none border-b border-slate-200 last:border-b-0 transition-colors text-sm"
                >
                  <span className="flex items-center gap-2">
                    <span className="text-lg">{country.flag}</span>
                    <span className="flex-1 font-medium text-slate-700">{country.name}</span>
                    <span className="font-semibold text-blue-600">{country.code}</span>
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Phone Number Input */}
        <div className="flex-1">
          <input
            type="tel"
            value={displayPhoneNumber}
            onChange={handlePhoneChange}
            placeholder={placeholder}
            className="w-full px-3 py-2.5 border-2 border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 shadow-sm hover:border-slate-400 text-sm md:text-base"
            maxLength="15"
          />
        </div>
      </div>

      {/* Error Message */}
      {error && <p className="mt-1 text-sm text-red-600">{error}</p>}

      {/* Helper Text */}
      <p className="mt-1 text-xs text-gray-500">
        Full number: {selectedCountry.code}{displayPhoneNumber}
      </p>
    </div>
  );
};

export default PhoneNumberInput;
