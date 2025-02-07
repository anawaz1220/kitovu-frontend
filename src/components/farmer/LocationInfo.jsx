import React, { useEffect } from 'react';
import useFarmerStore from '../../stores/useFarmerStore';
import nigeriaData from '../../utils/nigeriaData.json';

const LocationInfo = () => {
  const { formData, setFormData, setStepValidation } = useFarmerStore();

  // Handle input changes
  const handleInputChange = (field) => (e) => {
    setFormData({ [field]: e.target.value });
  };

  // Simple validation
  useEffect(() => {
    const isValid = !!(
      formData.address &&
      formData.state &&
      formData.lga &&
      formData.city
    );
    
    setStepValidation(1, isValid);
  }, [formData.address, formData.state, formData.lga, formData.city]);

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold text-gray-900">Farmer Address</h2>
      <p className="text-sm text-gray-600">
        Please provide the farmer's address
      </p>
  
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Column */}
        <div className="space-y-4">
          <div className="space-y-1">
            <label className="form-label">
              Street Address <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.address || ''}
              onChange={handleInputChange('address')}
              className="form-input"
              placeholder="Enter street address"
            />
          </div>
  
          <div className="space-y-1">
            <label className="form-label">Community</label>
            <input
              type="text"
              value={formData.community || ''}
              onChange={handleInputChange('community')}
              className="form-input"
              placeholder="Enter community name"
            />
          </div>
        </div>
  
        {/* Right Column */}
        <div className="space-y-4">
          <div className="space-y-1">
            <label className="form-label">
              State <span className="text-red-500">*</span>
            </label>
            <select
              value={formData.state || ''}
              onChange={handleInputChange('state')}
              className="form-input"
            >
              <option value="">Select State</option>
              {Object.keys(nigeriaData).map(state => (
                <option key={state} value={state}>{state}</option>
              ))}
            </select>
          </div>
  
          <div className="space-y-1">
            <label className="form-label">
              LGA <span className="text-red-500">*</span>
            </label>
            <select
              value={formData.lga || ''}
              onChange={handleInputChange('lga')}
              className="form-input"
              disabled={!formData.state}
            >
              <option value="">Select LGA</option>
              {formData.state && nigeriaData[formData.state]?.map(lga => (
                <option key={lga} value={lga}>{lga}</option>
              ))}
            </select>
          </div>
  
          <div className="space-y-1">
            <label className="form-label">
              City <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.city || ''}
              onChange={handleInputChange('city')}
              className="form-input"
              placeholder="Enter city"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default LocationInfo;