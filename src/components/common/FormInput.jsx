import React from 'react';
import { useFormContext } from 'react-hook-form';

const FormInput = ({ 
  name, 
  label, 
  type = 'text', 
  placeholder = '', 
  required = false,
  rules = {},
  className = '',
  ...props 
}) => {
  const { register, formState: { errors } } = useFormContext();
  const error = errors[name];

  return (
    <div className={`space-y-1 ${className}`}>
      <label htmlFor={name} className="block text-sm font-medium text-gray-700">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
      
      <input
        id={name}
        type={type}
        className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm 
          focus:border-kitovu-purple focus:ring-kitovu-purple sm:text-sm
          ${error ? 'border-red-500' : 'border-gray-300'}`}
        placeholder={placeholder}
        {...register(name, {
          required: required && 'This field is required',
          ...rules
        })}
        {...props}
      />
      
      {error && (
        <p className="text-red-500 text-xs mt-1" role="alert">
          {error.message}
        </p>
      )}
    </div>
  );
};

export default FormInput;