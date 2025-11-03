import React from 'react';
import * as LucideIcons from 'lucide-react';

const Modal = ({ isOpen, onClose, title, children, className = '' }) => {
  if (!isOpen) return null;

  const XIcon = LucideIcons.X; // Get the X icon component

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-2 md:p-4">
      <div className={`bg-white rounded-lg shadow-xl max-w-xl w-full max-h-[90vh] md:max-h-[80vh] overflow-hidden ${className}`}>
        <div className="flex justify-between items-center p-3 md:p-4 border-b border-gray-200">
          <h3 className="text-base md:text-lg font-semibold text-gray-800">{title}</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 focus:outline-none">
            <XIcon className="h-5 md:h-6 w-5 md:w-6" />
          </button>
        </div>
        <div className="p-3 md:p-4 overflow-y-auto max-h-[calc(90vh-60px)] md:max-h-[calc(80vh-60px)]">
          {children}
        </div>
      </div>
    </div>
  );
};

export default Modal;