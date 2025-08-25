// src/components/advisory/AdvisoryInputModal.jsx
import React, { useState } from 'react';
import { X, Calendar, Sprout, Clock, Bug, Leaf } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAdvisoryData } from '../../hooks/useAdvisoryData';

/**
 * Modal component for collecting advisory input parameters
 * @param {Object} props - Component props
 * @param {boolean} props.isOpen - Whether modal is open
 * @param {Function} props.onClose - Function to close modal
 * @param {Object} props.farm - Farm object
 */
const AdvisoryInputModal = ({ isOpen, onClose, farm }) => {
  const navigate = useNavigate();
  const { fetchAdvisoryData } = useAdvisoryData();
  
  // Form state
  const [formData, setFormData] = useState({
    planting_date: '',
    growth_stage: '',
    timing_preference: '',
    weed_pressure: 'medium',
    pest_pressure: 'medium'
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Growth stage options
  const growthStageOptions = [
    { value: '', label: 'Select Growth Stage' },
    { value: 'germination', label: 'Germination' },
    { value: 'vegetative', label: 'Vegetative' },
    { value: 'reproductive', label: 'Reproductive' },
    { value: 'maturity', label: 'Maturity' }
  ];

  // Timing preference options
  const timingOptions = [
    { value: '', label: 'Select Timing Preference' },
    { value: 'pre-planting', label: 'Pre-planting' },
    { value: 'pre-emergence', label: 'Pre-emergence' },
    { value: 'post-emergence', label: 'Post-emergence' }
  ];

  // Pressure level options
  const pressureOptions = [
    { value: 'low', label: 'Low' },
    { value: 'medium', label: 'Medium' },
    { value: 'high', label: 'High' }
  ];

  // Handle input change
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // FIXED: Check for both id and farm_id
    const farmId = farm?.id || farm?.farm_id;
    if (!farmId) {
      alert('Farm information is missing. Please try again.');
      return;
    }

    setIsSubmitting(true);
    
    try {
      // Prepare herbicide parameters (only include non-empty values)
      const herbicideParams = {};
      Object.entries(formData).forEach(([key, value]) => {
        if (value && value.trim() !== '') {
          herbicideParams[key] = value;
        }
      });

      console.log('Submitting advisory request for farm:', farmId, 'with params:', herbicideParams);
      
      // Navigate to advisory report page with farm and params data
      navigate('/advisory-report', {
        state: {
          farm: {
            ...farm,
            id: farmId  // Ensure we always have an id field for the advisory report
          },
          herbicideParams: herbicideParams,
          timestamp: new Date().toISOString()
        }
      });
      
      // Close modal
      onClose();
      
    } catch (error) {
      console.error('Error submitting advisory request:', error);
      alert('An error occurred while processing your request. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Don't render if not open
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="bg-kitovu-purple text-white p-4 rounded-t-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Sprout className="h-6 w-6 mr-2" />
              <h2 className="text-lg font-bold">Advisory Parameters</h2>
            </div>
            <button 
              onClick={onClose}
              className="text-white hover:text-gray-200"
              disabled={isSubmitting}
            >
              <X className="h-5 w-5" />
            </button>
          </div>
          <p className="text-sm mt-1 opacity-90">
            Farm #{farm?.farm_id || farm?.id} - {farm?.crop_type || farm?.livestock_type || 'Mixed farming'}
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6">
          <div className="space-y-4">
            {/* Planting Date */}
            <div>
              <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
                <Calendar className="h-4 w-4 mr-2 text-kitovu-purple" />
                Planting Date (Optional)
              </label>
              <input
                type="date"
                name="planting_date"
                value={formData.planting_date}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-kitovu-purple focus:border-transparent"
                disabled={isSubmitting}
              />
              <p className="text-xs text-gray-500 mt-1">
                When was the crop planted? This helps determine optimal application timing.
              </p>
            </div>

            {/* Growth Stage */}
            <div>
              <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
                <Sprout className="h-4 w-4 mr-2 text-kitovu-purple" />
                Current Growth Stage (Optional)
              </label>
              <select
                name="growth_stage"
                value={formData.growth_stage}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-kitovu-purple focus:border-transparent"
                disabled={isSubmitting}
              >
                {growthStageOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              <p className="text-xs text-gray-500 mt-1">
                Current development stage of the crop.
              </p>
            </div>

            {/* Timing Preference */}
            <div>
              <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
                <Clock className="h-4 w-4 mr-2 text-kitovu-purple" />
                Application Timing (Optional)
              </label>
              <select
                name="timing_preference"
                value={formData.timing_preference}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-kitovu-purple focus:border-transparent"
                disabled={isSubmitting}
              >
                {timingOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              <p className="text-xs text-gray-500 mt-1">
                Preferred timing for chemical application.
              </p>
            </div>

            {/* Weed Pressure */}
            <div>
              <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
                <Leaf className="h-4 w-4 mr-2 text-kitovu-purple" />
                Weed Pressure Level
              </label>
              <select
                name="weed_pressure"
                value={formData.weed_pressure}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-kitovu-purple focus:border-transparent"
                disabled={isSubmitting}
              >
                {pressureOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              <p className="text-xs text-gray-500 mt-1">
                Current weed infestation level in the field.
              </p>
            </div>

            {/* Pest Pressure */}
            <div>
              <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
                <Bug className="h-4 w-4 mr-2 text-kitovu-purple" />
                Pest Pressure Level
              </label>
              <select
                name="pest_pressure"
                value={formData.pest_pressure}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-kitovu-purple focus:border-transparent"
                disabled={isSubmitting}
              >
                {pressureOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              <p className="text-xs text-gray-500 mt-1">
                Current pest infestation level in the field.
              </p>
            </div>
          </div>

          {/* Submit Button */}
          <div className="mt-6 pt-4 border-t border-gray-200">
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-kitovu-purple hover:bg-purple-700 text-white py-3 px-4 rounded-md font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
            >
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                  Processing...
                </>
              ) : (
                'Proceed to Advisory Report'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AdvisoryInputModal;