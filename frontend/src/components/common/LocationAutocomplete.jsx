import React, { useState, useEffect, useRef } from 'react';
import { ChevronDown, Loader } from 'lucide-react';

const LocationAutocomplete = ({
  label,
  name,
  value,
  onChange,
  onSuggestionSelect,
  getSuggestions,
  error,
  placeholder = 'Enter location',
  className = '',
  inputClassName = '',
}) => {
  const [suggestions, setSuggestions] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [filteredValue, setFilteredValue] = useState(value);
  const wrapperRef = useRef(null);
  const inputRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Fetch suggestions when user types
  useEffect(() => {
    const fetchSuggestions = async () => {
      if (filteredValue.trim().length < 1) {
        setSuggestions([]);
        setIsOpen(false);
        return;
      }

      setLoading(true);
      try {
        const results = await getSuggestions(filteredValue);
        setSuggestions(results || []);
        setIsOpen(results && results.length > 0);
      } catch (error) {
        console.error('Error fetching suggestions:', error);
        setSuggestions([]);
      } finally {
        setLoading(false);
      }
    };

    // Debounce the search
    const timer = setTimeout(fetchSuggestions, 300);
    return () => clearTimeout(timer);
  }, [filteredValue, getSuggestions]);

  const handleInputChange = (e) => {
    const inputValue = e.target.value;
    setFilteredValue(inputValue);
    onChange({
      target: {
        name,
        value: inputValue,
        type: 'text',
      },
    });
  };

  const handleSuggestionClick = (suggestion) => {
    setFilteredValue(suggestion);
    onChange({
      target: {
        name,
        value: suggestion,
        type: 'text',
      },
    });
    if (onSuggestionSelect) {
      onSuggestionSelect(suggestion);
    }
    setIsOpen(false);
    setSuggestions([]);
  };

  const handleInputFocus = () => {
    if (filteredValue.trim().length > 0 && suggestions.length > 0) {
      setIsOpen(true);
    }
  };

  return (
    <div className={`mb-4 ${className}`} ref={wrapperRef}>
      {label && (
        <label htmlFor={`${name}-autocomplete`} className="block text-sm font-medium text-slate-700 mb-2">
          {label}
        </label>
      )}

      <div className="relative">
        <div className="flex items-center">
          <input
            ref={inputRef}
            id={`${name}-autocomplete`}
            type="text"
            name={name}
            value={filteredValue}
            onChange={handleInputChange}
            onFocus={handleInputFocus}
            placeholder={placeholder}
            className={`flex-1 px-3 md:px-4 py-2 md:py-2.5 border-2 border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 shadow-sm hover:border-slate-400 text-sm md:text-base ${
              error ? 'border-red-500 focus:ring-red-500' : ''
            } ${inputClassName}`}
            autoComplete="off"
          />
          {loading && <Loader className="absolute right-3 w-5 h-5 text-blue-500 animate-spin" />}
        </div>

        {/* Dropdown Suggestions */}
        {isOpen && suggestions.length > 0 && (
          <div className="absolute top-full left-0 right-0 mt-1 bg-white border-2 border-slate-300 rounded-lg shadow-lg z-50 max-h-64 overflow-y-auto">
            {suggestions.map((suggestion, index) => (
              <button
                key={index}
                type="button"
                onClick={() => handleSuggestionClick(suggestion)}
                className="w-full text-left px-4 py-2.5 hover:bg-blue-50 focus:bg-blue-50 focus:outline-none border-b border-slate-200 last:border-b-0 transition-colors text-sm md:text-base"
              >
                {suggestion}
              </button>
            ))}
          </div>
        )}

        {/* No Results Message */}
        {isOpen && filteredValue.trim().length > 0 && suggestions.length === 0 && !loading && (
          <div className="absolute top-full left-0 right-0 mt-1 bg-white border-2 border-slate-300 rounded-lg shadow-lg z-50 p-4 text-center text-sm text-gray-600">
            <p>Location not found. You can enter your own location.</p>
          </div>
        )}
      </div>

      {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
    </div>
  );
};

export default LocationAutocomplete;
