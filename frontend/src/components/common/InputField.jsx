import React, { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';

const InputField = ({
  label,
  name,
  type = 'text',
  value,
  onChange,
  error,
  placeholder,
  className = '',
  labelClassName = '',
  inputClassName = '',
  options = [], // For select type
  checked, // For checkbox type
  readOnly = false,
  rows = 3, // For textarea type
  id, // Add id prop
  ...props
}) => {
  const [showPassword, setShowPassword] = useState(false);
  const inputId = id || `${name}-${value || ''}`;
  const baseInputStyle = "mt-2 block w-full px-3 md:px-4 py-2 md:py-2.5 border-2 border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 shadow-sm hover:border-slate-400 text-sm md:text-base";
  const errorInputStyle = "border-red-500 focus:ring-red-500 focus:border-transparent";

  const renderInput = () => {
    switch (type) {
      case 'textarea':
        return (
          <textarea
            id={inputId}
            name={name}
            value={value}
            onChange={onChange}
            placeholder={placeholder}
            className={`${baseInputStyle} ${error ? errorInputStyle : ''} ${inputClassName}`}
            readOnly={readOnly}
            rows={rows}
            {...props}
          ></textarea>
        );
      case 'select':
        return (
          <select
            id={inputId}
            name={name}
            value={value}
            onChange={onChange}
            className={`${baseInputStyle} ${error ? errorInputStyle : ''} ${inputClassName}`}
            readOnly={readOnly}
            {...props}
          >
            {placeholder && <option value="" disabled>{placeholder}</option>}
            {options.map((option) => (
              <option key={option.value || option} value={option.value || option}>
                {option.label || option}
              </option>
            ))}
          </select>
        );
      case 'checkbox':
        return (
          <input
            id={inputId}
            name={name}
            type="checkbox"
            checked={checked}
            onChange={onChange}
            className="h-5 w-5 text-blue-600 focus:ring-2 focus:ring-blue-500 border-slate-300 rounded cursor-pointer transition-all"
            readOnly={readOnly}
            {...props}
          />
        );
      case 'file':
        return (
          <input
            id={inputId}
            name={name}
            type="file"
            onChange={onChange}
            className={`${baseInputStyle} ${error ? errorInputStyle : ''} ${inputClassName}`}
            readOnly={readOnly}
            {...props}
          />
        );
      default:
        return (
          <div className="relative">
            <input
              id={inputId}
              name={name}
              type={type === 'password' && showPassword ? 'text' : type}
              value={value}
              onChange={onChange}
              placeholder={placeholder}
              className={`${baseInputStyle} ${error ? errorInputStyle : ''} ${inputClassName} ${type === 'password' ? 'pr-10' : ''}`}
              readOnly={readOnly}
              {...props}
            />
            {type === 'password' && (
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 focus:outline-none"
                tabIndex="-1"
              >
                {showPassword ? (
                  <EyeOff size={20} className="stroke-2" />
                ) : (
                  <Eye size={20} className="stroke-2" />
                )}
              </button>
            )}
          </div>
        );
    }
  };

  return (
    <div className={`mb-4 ${className}`}>
      {label && type !== 'checkbox' && (
        <label htmlFor={inputId} className={`block text-sm font-medium text-slate-700 ${labelClassName}`}>
          {label}
        </label>
      )}
      {type === 'checkbox' ? (
        <div className="flex items-center">
          {renderInput()}
          {label && (
            <label htmlFor={inputId} className={`ml-2 block text-sm text-slate-900 ${labelClassName}`}>
              {label}
            </label>
          )}
        </div>
      ) : (
        renderInput()
      )}
      {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
    </div>
  );
};

export default InputField;