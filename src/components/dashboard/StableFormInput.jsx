// src/components/dashboard/StableFormInput.jsx
import React, { useState, useEffect, useCallback } from 'react';

const StableFormInput = ({ 
  field, 
  label, 
  type = 'text', 
  options = [], 
  required = false, 
  disabled = false,
  initialValue = '',
  error = '',
  onValueChange
}) => {
  const [localValue, setLocalValue] = useState(initialValue);

  // Update local value when initialValue changes
  useEffect(() => {
    setLocalValue(initialValue);
  }, [initialValue]);

  // Handle changes with debounce to prevent excessive updates
  const handleChange = useCallback((newValue) => {
    setLocalValue(newValue);
    
    // Immediately notify parent without debounce for better UX
    if (onValueChange) {
      onValueChange(field, newValue);
    }
  }, [field, onValueChange]);

  if (type === 'select') {
    return (
      <div className="mb-3">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {label} {required && <span className="text-red-500">*</span>}
        </label>
        <select
          value={localValue}
          onChange={(e) => handleChange(e.target.value)}
          disabled={disabled}
          className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-kitovu-purple ${error ? 'border-red-500' : 'border-gray-300'} ${disabled ? 'bg-gray-100 cursor-not-allowed' : ''}`}
        >
          <option value="">Select {label.toLowerCase()}...</option>
          {options.map(option => (
            <option key={option.value} value={option.value}>{option.label}</option>
          ))}
        </select>
        {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
      </div>
    );
  }

  if (type === 'boolean') {
    return (
      <div className="mb-3">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {label}
        </label>
        <div className="flex items-center space-x-4">
          <label className="flex items-center">
            <input
              type="radio"
              name={`${field}_radio`}
              checked={localValue === true || localValue === 'true'}
              onChange={() => handleChange(true)}
              disabled={disabled}
              className="mr-2"
            />
            Yes
          </label>
          <label className="flex items-center">
            <input
              type="radio"
              name={`${field}_radio`}
              checked={localValue === false || localValue === 'false'}
              onChange={() => handleChange(false)}
              disabled={disabled}
              className="mr-2"
            />
            No
          </label>
        </div>
        {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
      </div>
    );
  }

  if (type === 'textarea') {
    return (
      <div className="mb-3">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {label} {required && <span className="text-red-500">*</span>}
        </label>
        <textarea
          value={localValue}
          onChange={(e) => handleChange(e.target.value)}
          disabled={disabled}
          className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-kitovu-purple ${error ? 'border-red-500' : 'border-gray-300'} ${disabled ? 'bg-gray-100 cursor-not-allowed' : ''}`}
          rows="3"
        />
        {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
      </div>
    );
  }

  if (type === 'file') {
    return (
      <div className="mb-3">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {label} {required && <span className="text-red-500">*</span>}
        </label>
        <input
          type="file"
          accept="image/*"
          onChange={(e) => handleChange(e.target.files[0])}
          disabled={disabled}
          className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-kitovu-purple ${error ? 'border-red-500' : 'border-gray-300'} ${disabled ? 'bg-gray-100 cursor-not-allowed' : ''}`}
        />
        {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
      </div>
    );
  }

  return (
    <div className="mb-3">
      <label className="block text-sm font-medium text-gray-700 mb-1">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <input
        type={type}
        value={localValue}
        onChange={(e) => handleChange(e.target.value)}
        disabled={disabled}
        className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-kitovu-purple ${error ? 'border-red-500' : 'border-gray-300'} ${disabled ? 'bg-gray-100 cursor-not-allowed' : ''}`}
      />
      {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
    </div>
  );
};

export default StableFormInput;