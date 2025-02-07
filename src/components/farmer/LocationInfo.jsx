// src/components/farmer/LocationInfo.jsx
import React from 'react';
import { useFormContext } from 'react-hook-form';
import FormInput from '../common/FormInput';
import nigeriaData from '../../utils/nigeriaData.json';

const LocationInfo = () => {
  const { register, watch } = useFormContext();
  const selectedState = watch('state');

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold text-gray-900">Farmer Address</h2>
      <p className="text-sm text-gray-600">
        Please provide the farmer's address
      </p>
  
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Column */}
        <div className="space-y-4">
          <FormInput
            name="address"
            label="Street Address"
            required
            placeholder="Enter street address"
          />
  
          <FormInput
            name="community"
            label="Community"
            placeholder="Enter community name"
          />
        </div>
  
        {/* Right Column */}
        <div className="space-y-4">
          <div>
            <label className="form-label">State</label>
            <select
              {...register('state')}
              className="form-input"
            >
              <option value="">Select State</option>
              {Object.keys(nigeriaData).map(state => (
                <option key={state} value={state}>{state}</option>
              ))}
            </select>
          </div>
  
          <div>
            <label className="form-label">LGA</label>
            <select
              {...register('lga')}
              className="form-input"
              disabled={!selectedState}
            >
              <option value="">Select LGA</option>
              {selectedState && nigeriaData[selectedState]?.map(lga => (
                <option key={lga} value={lga}>{lga}</option>
              ))}
            </select>
          </div>
  
          <FormInput
            name="city"
            label="City"
            required
            placeholder="Enter city"
          />
  
          {/* Hidden fields for coordinates - keeping these in case needed for future API integration */}
          <input type="hidden" {...register('latitude')} />
          <input type="hidden" {...register('longitude')} />
        </div>
      </div>
    </div>
  );
};

export default LocationInfo;