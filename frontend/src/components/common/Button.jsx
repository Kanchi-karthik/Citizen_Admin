import React from 'react';
import * as LucideIcons from 'lucide-react';
import LoadingSpinner from './LoadingSpinner.jsx'; // Make sure this path is correct

const Button = ({
  children,
  onClick,
  variant = 'primary', // primary, secondary, danger, outline, ghost
  size = 'md', // sm, md, lg
  icon, // Lucide icon name string, e.g., "Plus"
  iconPosition = 'left', // left, right
  className = '',
  disabled = false,
  loading = false,
  type = 'button', // button, submit, reset
  ...props
}) => {
  const baseStyles = 'inline-flex items-center justify-center font-semibold rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-2 transition-all duration-200 shadow-sm hover:shadow-md';
  const sizeStyles = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-5 py-2.5 text-base',
    lg: 'px-6 py-3 text-lg',
  };
  const variantStyles = {
    primary: 'bg-gradient-to-r from-blue-600 to-blue-700 text-white hover:from-blue-700 hover:to-blue-800 focus:ring-blue-500',
    secondary: 'bg-slate-200 text-slate-800 hover:bg-slate-300 focus:ring-slate-400',
    danger: 'bg-gradient-to-r from-red-600 to-red-700 text-white hover:from-red-700 hover:to-red-800 focus:ring-red-500',
    outline: 'bg-white border-2 border-blue-600 text-blue-600 hover:bg-blue-50 focus:ring-blue-500',
    ghost: 'bg-transparent text-slate-700 hover:bg-slate-100 focus:ring-slate-400',
  };

  const IconComponent = icon ? LucideIcons[icon] : null;

  return (
    <button
      type={type}
      onClick={onClick}
      className={`${baseStyles} ${sizeStyles[size]} ${variantStyles[variant]} ${disabled || loading ? 'opacity-70 cursor-not-allowed' : ''} ${className}`}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? (
        <LoadingSpinner className="mr-2 h-4 w-4" />
      ) : (
        icon && iconPosition === 'left' && IconComponent && <IconComponent className={`${children ? 'mr-2' : ''} h-5 w-5`} />
      )}
      {children}
      {icon && iconPosition === 'right' && IconComponent && <IconComponent className={`${children ? 'ml-2' : ''} h-5 w-5`} />}
    </button>
  );
};

export default Button;