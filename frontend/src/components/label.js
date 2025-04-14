import React from 'react';

const Label = ({ 
  htmlFor, 
  children, 
  variant = 'default', 
  className = '', 
  required = false 
}) => {
  // Variant styles
  const variants = {
    default: 'text-gray-700 dark:text-gray-300',
    primary: 'text-blue-600 dark:text-blue-400',
    success: 'text-green-600 dark:text-green-400',
    warning: 'text-yellow-600 dark:text-yellow-400',
    danger: 'text-red-600 dark:text-red-400',
  };

  return (
    <label
      htmlFor={htmlFor}
      className={`
        block text-sm font-medium mb-1 
        transition-colors duration-200 ease-in-out
        ${variants[variant]}
        ${className}
      `}
    >
      {children}
      {required && (
        <span className="ml-1 text-red-500 dark:text-red-400">*</span>
      )}
    </label>
  );
};

export default Label;