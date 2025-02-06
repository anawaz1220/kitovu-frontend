import React from 'react';
import { useFormContext } from 'react-hook-form';
import FormInput from '../common/FormInput';

const PersonalInfo = () => {
  const { formState: { errors } } = useFormContext();

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold text-gray-900">Personal Information</h2>
      <p className="text-sm text-gray-600">
        Please provide the farmer's basic information. Required fields are marked with an asterisk (*).
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <FormInput
          name="firstName"
          label="First Name"
          required
          placeholder="Enter first name"
          rules={{ 
            required: 'First name is required',
            minLength: {
              value: 2,
              message: 'Name should be at least 2 characters'
            }
          }}
        />

        <FormInput
          name="middleName"
          label="Middle Name"
          placeholder="Enter middle name"
        />

        <FormInput
          name="lastName"
          label="Last Name"
          required
          placeholder="Enter last name"
          rules={{ 
            required: 'Last name is required',
            minLength: {
              value: 2,
              message: 'Name should be at least 2 characters'
            }
          }}
        />

        <div className="space-y-2">
          <label className="form-label">
            Gender <span className="text-red-500">*</span>
          </label>
          <div className="flex space-x-4">
            <label className="inline-flex items-center">
              <input
                type="radio"
                name="gender"
                value="male"
                className="form-radio text-kitovu-purple"
              />
              <span className="ml-2">Male</span>
            </label>
            <label className="inline-flex items-center">
              <input
                type="radio"
                name="gender"
                value="female"
                className="form-radio text-kitovu-purple"
              />
              <span className="ml-2">Female</span>
            </label>
          </div>
          {errors.gender && (
            <p className="form-error">{errors.gender.message}</p>
          )}
        </div>

        <FormInput
          name="dateOfBirth"
          label="Date of Birth"
          type="date"
          required
          max={new Date().toISOString().split('T')[0]}
          rules={{ 
            required: 'Date of birth is required'
          }}
        />

        <FormInput
          name="phoneNumber"
          label="Phone Number"
          required
          placeholder="Enter phone number"
          rules={{ 
            required: 'Phone number is required',
            pattern: {
              value: /^[0-9+\s-()]{10,15}$/,
              message: 'Please enter a valid phone number'
            }
          }}
        />

        <FormInput
          name="alternatePhone"
          label="Alternate Phone"
          placeholder="Enter alternate phone number"
          rules={{ 
            pattern: {
              value: /^[0-9+\s-()]{10,15}$/,
              message: 'Please enter a valid phone number'
            }
          }}
        />
      </div>
    </div>
  );
};

export default PersonalInfo;