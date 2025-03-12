
import React, { useEffect, useState } from 'react';
import useFarmerStore from '../../stores/useFarmerStore';
import { MapPin } from 'lucide-react';
import { Alert } from '../ui/alert';
import { Button } from '../ui/button';

const PersonalInfo = () => {
  const { formData, setFormData, setStepValidation } = useFarmerStore();
  const [locationError, setLocationError] = useState(null);
  const [isRequestingLocation, setIsRequestingLocation] = useState(false);

  const handleInputChange = (field) => (e) => {
    setFormData({ ...formData, [field]: e.target.value });
  };

  useEffect(() => {
    // Check if we already have location permission stored
    const hasLocationPermission = localStorage.getItem('locationPermissionGranted');
    if (hasLocationPermission === 'true') {
      requestLocation();
    }
  }, []);

  useEffect(() => {
    const handleLocationUpdate = (event) => {
      const { latitude, longitude, accuracy } = event.detail;
      setFormData({
        user_latitude: latitude,
        user_longitude: longitude,
        location_accuracy: accuracy,
        location_timestamp: new Date().toISOString()
      });
    };
  
    window.addEventListener('locationUpdated', handleLocationUpdate);
    
    return () => {
      window.removeEventListener('locationUpdated', handleLocationUpdate);
    };
  }, [setFormData]);

  useEffect(() => {
    const isValid = !!(
      formData.firstName?.length >= 2 &&
      formData.lastName?.length >= 2 &&
      formData.gender &&
      formData.dateOfBirth &&
      /^[0-9+\s-()]{10,15}$/.test(formData.phoneNumber) &&
      formData.user_latitude &&
      formData.user_longitude
    );
    
    setStepValidation(0, isValid);
  }, [formData, setStepValidation]);

  const requestLocation = async () => {
    setIsRequestingLocation(true);
    setLocationError(null);
  
    try {
      const position = await new Promise((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(
          resolve, 
          reject,
          {
            enableHighAccuracy: true,
            timeout: 10000,
            maximumAge: 0
          }
        );
      });
  
      const { latitude, longitude, accuracy } = position.coords;
      
      // Log detailed location info
      console.log('Location details:', {
        latitude,
        longitude,
        accuracy,
        timestamp: position.timestamp,
        browser: navigator.userAgent,
        platformInfo: {
          platform: navigator.platform,
          vendor: navigator.vendor,
          language: navigator.language
        }
      });
      setFormData({
        user_latitude: latitude,
        user_longitude: longitude
      });
      
      // Store permission status
      localStorage.setItem('locationPermissionGranted', 'true');
      setFormData({ locationPermissionGranted: true });
      
    } catch (error) {
      let errorMessage = 'Could not get your location. ';
      
      switch (error.code) {
        case error.PERMISSION_DENIED:
          errorMessage += 'Please enable location access in your browser settings.';
          break;
        case error.POSITION_UNAVAILABLE:
          errorMessage += 'Location information is unavailable.';
          break;
        case error.TIMEOUT:
          errorMessage += 'Location request timed out.';
          break;
        default:
          errorMessage += 'An unknown error occurred.';
      }
      
      setLocationError(errorMessage);
      localStorage.setItem('locationPermissionGranted', 'false');
    } finally {
      setIsRequestingLocation(false);
    }
  };

  // Add this near the top of your existing form, after the heading
  const LocationPrompt = () => (
    <div className="mb-6">
      {!formData.user_latitude && !formData.user_longitude && !formData.locationPermissionGranted && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-start">
            <MapPin className="h-5 w-5 text-yellow-600 mt-0.5" />
            <div className="ml-3">
              <h3 className="text-sm font-medium text-yellow-800">
                Location Access Required
              </h3>
              <div className="mt-2 text-sm text-yellow-700">
                <p>
                  We need your location to properly register your farm. This helps us provide better services and support.
                </p>
              </div>
              <div className="mt-4">
                <Button
                  type="button"
                  onClick={requestLocation}
                  disabled={isRequestingLocation}
                  className="inline-flex items-center"
                >
                  {isRequestingLocation ? (
                    'Getting Location...'
                  ) : (
                    <>
                      <MapPin className="h-4 w-4 mr-2" />
                      Share Location
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {locationError && (
        <Alert variant="destructive" className="mt-4">
          {locationError}
        </Alert>
      )}

      {formData.user_latitude && formData.user_longitude && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 mt-4">
          <div className="flex items-center">
            <MapPin className="h-5 w-5 text-green-600" />
            <span className="ml-2 text-sm text-green-700">
              Location successfully captured
            </span>
          </div>
        </div>
      )}
    </div>
  );

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold text-gray-900">Personal Information</h2>
      <p className="text-sm text-gray-600">
        Please provide the farmer's basic information. Required fields are marked with an asterisk (*).
      </p>

      <LocationPrompt />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-1">
          <label className="form-label">
            First Name <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={formData.firstName}
            onChange={handleInputChange('firstName')}
            className={`form-input ${
              formData.firstName && formData.firstName.length < 2 
                ? 'border-red-500' 
                : 'border-gray-300'
            }`}
            placeholder="Enter first name"
          />
          {formData.firstName && formData.firstName.length < 2 && (
            <p className="text-red-500 text-xs mt-1">
              Name should be at least 2 characters
            </p>
          )}
        </div>

        <div className="space-y-1">
          <label className="form-label">
            Last Name <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={formData.lastName}
            onChange={handleInputChange('lastName')}
            className={`form-input ${
              formData.lastName && formData.lastName.length < 2 
                ? 'border-red-500' 
                : 'border-gray-300'
            }`}
            placeholder="Enter last name"
          />
          {formData.lastName && formData.lastName.length < 2 && (
            <p className="text-red-500 text-xs mt-1">
              Name should be at least 2 characters
            </p>
          )}
        </div>

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
                checked={formData.gender === 'male'}
                onChange={handleInputChange('gender')}
                className="form-radio text-kitovu-purple"
              />
              <span className="ml-2">Male</span>
            </label>
            <label className="inline-flex items-center">
              <input
                type="radio"
                name="gender"
                value="female"
                checked={formData.gender === 'female'}
                onChange={handleInputChange('gender')}
                className="form-radio text-kitovu-purple"
              />
              <span className="ml-2">Female</span>
            </label>
          </div>
        </div>

        <div className="space-y-1">
          <label className="form-label">
            Date of Birth <span className="text-red-500">*</span>
          </label>
          <input
            type="date"
            value={formData.dateOfBirth}
            onChange={handleInputChange('dateOfBirth')}
            max={new Date().toISOString().split('T')[0]}
            className="form-input"
          />
        </div>

        <div className="space-y-1">
          <label className="form-label">
            Phone Number <span className="text-red-500">*</span>
          </label>
          <input
            type="tel"
            value={formData.phoneNumber}
            onChange={handleInputChange('phoneNumber')}
            className={`form-input ${
              formData.phoneNumber && !/^[0-9+\s-()]{10,15}$/.test(formData.phoneNumber)
                ? 'border-red-500'
                : 'border-gray-300'
            }`}
            placeholder="Enter phone number"
          />
          {formData.phoneNumber && !/^[0-9+\s-()]{10,15}$/.test(formData.phoneNumber) && (
            <p className="text-red-500 text-xs mt-1">
              Please enter a valid phone number
            </p>
          )}
        </div>

        <div className="space-y-1">
          <label className="form-label">
            Alternate Phone
          </label>
          <input
            type="tel"
            value={formData.alternatePhone}
            onChange={handleInputChange('alternatePhone')}
            className="form-input"
            placeholder="Enter alternate phone number"
          />
        </div>
      </div>
    </div>
  );
};

export default PersonalInfo;