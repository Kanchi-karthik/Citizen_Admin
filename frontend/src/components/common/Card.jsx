import React from 'react';

const Card = ({ children, title, className = '' }) => {
  return (
    <div className={`bg-white shadow-md rounded-xl p-4 md:p-6 border border-slate-200 hover:shadow-lg transition-shadow duration-300 w-full ${className}`}>
      {title && <h2 className="text-lg md:text-2xl font-bold text-slate-900 mb-3 md:mb-4 pb-2 md:pb-3 border-b-2 border-blue-100">{title}</h2>}
      {children}
    </div>
  );
};

export default Card;