import React, { useState } from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import { Alert } from '../components/ui/alert';
import { useNavigate } from 'react-router-dom';
import useFarmerStore from '../stores/useFarmerStore';
import useFarmStore from '../stores/useFarmStore';
import { farmerService } from '../services/api/farmer.service';
import { Button } from '../components/ui/button';
import { CheckCircle2, AlertCircle } from 'lucide-react';

// Import Components
import PersonalInfo from '../components/farmer/PersonalInfo';
import LocationInfo from '../components/farmer/LocationInfo';
import FarmInfo from '../components/farmer/FarmInfo';
import KYCInfo from '../components/farmer/KYCInfo';
import CooperativeInfo from '../components/farmer/CooperativeInfo';

// Registration Steps Configuration
const STEPS = [
  { id: 'personal', title: 'Personal', component: PersonalInfo },
  { id: 'location', title: 'Location', component: LocationInfo },
  { id: 'farm', title: 'Farm', component: FarmInfo },
  { id: 'kyc', title: 'KYC', component: KYCInfo },
  { id: 'cooperative', title: 'Cooperative', component: CooperativeInfo }
];

const FarmerRegistration = () => {
  // Hooks and State Management
  const navigate = useNavigate();
  const methods = useForm();
  const [showSuccessAlert, setShowSuccessAlert] = useState(false);
  const [showErrorAlert, setShowErrorAlert] = useState(false);
  const [alertMessage, setAlertMessage] = useState('');

  // Get store states and methods
  const { 
    currentStep, 
    setCurrentStep,
    formData,
    isSubmitting,
    error,
    setSubmitting,
    setError,
    isStepValid,
    isFormComplete,
    resetForm
  } = useFarmerStore();

  const { farms } = useFarmStore();

  // Navigation Handlers
  const handleNext = () => {
    if (isStepValid(currentStep)) {
      const nextStep = Math.min(currentStep + 1, STEPS.length - 1);
      setCurrentStep(nextStep);
    }
  };

  const handlePrevious = () => {
    setCurrentStep(Math.max(currentStep - 1, 0));
  };

  const handleAlertClose = () => {
    if (showSuccessAlert) {
      setShowSuccessAlert(false);
      resetForm();
      navigate('/success');
    } else {
      setShowErrorAlert(false);
    }
  };

  // Progress Steps Component
  const ProgressSteps = () => (
    <div className="mb-8">
      <div className="flex items-center justify-between">
        {STEPS.map((step, index) => (
          <React.Fragment key={step.id}>
            <div className="flex flex-col items-center">
              <div
                className={`w-10 h-10 rounded-full border-2 flex items-center justify-center
                  ${index <= currentStep 
                    ? 'border-kitovu-purple bg-kitovu-purple text-white' 
                    : 'border-gray-300 text-gray-300'
                  }`}
              >
                {index + 1}
              </div>
              <span className={`mt-2 text-xs sm:text-sm ${
                index <= currentStep ? 'text-kitovu-purple' : 'text-gray-400'
              }`}>
                {step.title}
              </span>
            </div>
            {index < STEPS.length - 1 && (
              <div className={`flex-1 h-0.5 mx-4 ${
                index < currentStep ? 'bg-kitovu-purple' : 'bg-gray-200'
              }`} />
            )}
          </React.Fragment>
        ))}
      </div>
    </div>
  );

  // Continue in next part...
  // Form Submission Handler
  const handleSubmit = async () => {
    try {
      setSubmitting(true);
      setError(null);
      setShowSuccessAlert(false);
      setShowErrorAlert(false);

      // Required Fields Validation
      const requiredFields = {
        // Personal Info Validation
        firstName: formData.firstName,
        lastName: formData.lastName,
        gender: formData.gender,
        dateOfBirth: formData.dateOfBirth,
        phoneNumber: formData.phoneNumber,
        user_latitude: formData.user_latitude,
        user_longitude: formData.user_longitude,

        // Location Info Validation
        address: formData.address,
        state: formData.state,
        lga: formData.lga,
        city: formData.city,

        // Farm Info Validation
        farms: farms,

        // KYC Info Validation
        idType: formData.idType,
        idNumber: formData.idNumber,
        userPhoto: formData.userPhoto,
        idPhoto: formData.idPhoto,
      };

      // Check for missing fields
      const missingFields = Object.entries(requiredFields)
        .filter(([key, value]) => !value)
        .map(([key]) => key);

      if (missingFields.length > 0) {
        const errorMsg = `Missing required fields: ${missingFields.join(', ')}`;
        setError(errorMsg);
        setAlertMessage(errorMsg);
        setShowErrorAlert(true);
        return;
      }

      // Prepare Farmer Data
      const farmerData = {
        first_name: formData.firstName,
        last_name: formData.lastName,
        gender: formData.gender,
        date_of_birth: formData.dateOfBirth,
        phone_number: formData.phoneNumber,
        alternate_phone_number: formData.alternatePhone || null,
        street_address: formData.address,
        state: formData.state,
        community: formData.community || null,
        lga: formData.lga,
        city: formData.city,
        id_type: formData.idType,
        id_number: formData.idNumber,
        user_latitude: formData.user_latitude,
        user_longitude: formData.user_longitude
      };

      // Prepare Farm Data
      const farmData = farms.map(farm => ({
        farm_type: farm.farm_type,
        ownership_status: farm.ownership_status,
        lease_years: farm.lease_years || null,
        lease_months: farm.lease_months || null,
        area: parseFloat(farm.area),
        crop_type: farm.crop_type || null,
        crop_area: farm.crop_area ? parseFloat(farm.crop_area) : null,
        livestock_type: farm.livestock_type || null,
        number_of_animals: farm.number_of_animals ? parseInt(farm.number_of_animals) : null,
        farm_latitude: farm.geometry.coordinates[0][0][0][1],
        farm_longitude: farm.geometry.coordinates[0][0][0][0],
        farm_geometry: `MULTIPOLYGON(((${
          farm.geometry.coordinates[0][0]
            .map(coord => `${coord[0]} ${coord[1]}`)
            .join(', ')
        })))`
      }));

      // Prepare Cooperative Data
      const affiliationData = {
        member_of_cooperative: formData.member_of_cooperative === 'true',
        name: formData.member_of_cooperative === 'true' ? formData.name : null,
        activities: formData.member_of_cooperative === 'true' ? 
          formData.cooperativeActivities.join(', ') : null
      };

      console.log('Farm data being sent:', {
        farmerData,
        farmData,
        affiliationData
      });

      // Submit to API
      const response = await farmerService.createFarmer(
        farmerData,
        farmData,
        affiliationData,
        formData.userPhoto,
        formData.idPhoto
      );

      // Handle Success
      setAlertMessage('Farmer registration completed successfully!');
      setShowSuccessAlert(true);

    } catch (err) {
      // Handle Error
      console.error('Form submission error:', err);
      const errorMessage = err?.response?.data?.error || 'Failed to submit form. Please try again.';
      setError(errorMessage);
      setAlertMessage(errorMessage);
      setShowErrorAlert(true);
    } finally {
      setSubmitting(false);
    }
  };

  // Alert Components
  const AlertComponents = () => (
    <>
      {/* Success Alert */}
      {showSuccessAlert && (
        <div className="mb-6">
          <Alert 
            variant="success" 
            onClose={handleAlertClose}
          >
            <div className="flex items-center">
              <CheckCircle2 className="h-5 w-5 mr-2" />
              <div>
                <strong className="font-medium">Success!</strong>
                <p className="mt-1">{alertMessage}</p>
              </div>
            </div>
          </Alert>
        </div>
      )}

      {/* Error Alert */}
      {showErrorAlert && (
        <div className="mb-6">
          <Alert 
            variant="error" 
            onClose={handleAlertClose}
          >
            <div className="flex items-center">
              <AlertCircle className="h-5 w-5 mr-2" />
              <div>
                <strong className="font-medium">Error!</strong>
                <p className="mt-1">{alertMessage}</p>
              </div>
            </div>
          </Alert>
        </div>
      )}
    </>
  );

  // Continue in next part 

  // Navigation Buttons Component
  const NavigationButtons = () => (
    <div className="mt-8 flex justify-between pt-5 border-t">
      {currentStep > 0 && (
        <button
          type="button"
          onClick={handlePrevious}
          className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-kitovu-purple"
          disabled={isSubmitting}
        >
          Previous
        </button>
      )}
      
      {currentStep < STEPS.length - 1 ? (
        <button
          type="button"
          onClick={handleNext}
          className="ml-auto px-4 py-2 text-sm font-medium text-white bg-kitovu-purple border border-transparent rounded-md hover:bg-kitovu-purple/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-kitovu-purple"
          disabled={!isStepValid(currentStep) || isSubmitting}
        >
          Next
        </button>
      ) : (
        <button
          type="button"
          onClick={handleSubmit}
          className="ml-auto px-4 py-2 text-sm font-medium text-white bg-kitovu-purple border border-transparent rounded-md hover:bg-kitovu-purple/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-kitovu-purple disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={!isFormComplete() || isSubmitting}
        >
          {isSubmitting ? (
            <div className="flex items-center">
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Submitting...
            </div>
          ) : (
            'Submit'
          )}
        </button>
      )}
    </div>
  );

  // Main Render Method
  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      {/* Alerts Section */}
      <AlertComponents />

      {/* Progress Steps */}
      <ProgressSteps />

      {/* Main Form Section */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <FormProvider {...methods}>
          {/* Current Step Component */}
          <div className="min-h-[400px]">
            {React.createElement(STEPS[currentStep].component)}
          </div>

          {/* Navigation */}
          <NavigationButtons />
        </FormProvider>
      </div>

      {/* Loading Overlay */}
      {isSubmitting && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 flex items-center space-x-4">
            <svg className="animate-spin h-8 w-8 text-kitovu-purple" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <span className="text-gray-700 font-medium">Processing...</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default FarmerRegistration;