import React, { useState } from 'react';
import { useForm, FormProvider } from 'react-hook-form';
import PersonalInfo from '../components/farmer/PersonalInfo';
import LocationInfo from '../components/farmer/LocationInfo';
import KYCInfo from '../components/farmer/KYCInfo';
import FarmInfo from '../components/farmer/FarmInfo';

import CooperativeInfo from '../components/farmer/CooperativeInfo/index';

const STEPS = [
  { id: 'personal', title: 'Personal Information', component: PersonalInfo },
  { id: 'location', title: 'Farmer Address', component: LocationInfo },
  { id: 'farm', title: 'Farm Information', component: FarmInfo }, 
  { id: 'kyc', title: 'Identity Verification', component: KYCInfo },
  { id: 'cooperative', title: 'Cooperative Details', component: CooperativeInfo }
];

const FarmerRegistration = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const methods = useForm({
    mode: 'onChange',
  });

  const onSubmit = async (data) => {
    // Will be replaced with API call later
    // console.log('Form submitted:', data);
  };

  const nextStep = () => {
    setCurrentStep(prev => Math.min(prev + 1, STEPS.length - 1));
  };

  const prevStep = () => {
    setCurrentStep(prev => Math.max(prev - 1, 0));
  };

  return (
    <div className="max-w-3xl mx-auto">
      {/* Progress Steps */}
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

      {/* Form */}
      <FormProvider {...methods}>
        <form onSubmit={methods.handleSubmit(onSubmit)} className="space-y-6">
          <div className="bg-white rounded-lg shadow p-6">
            {React.createElement(STEPS[currentStep].component)}
            
            {/* Navigation Buttons */}
            <div className="mt-8 flex justify-between pt-5 border-t">
              {currentStep > 0 && (
                <button
                  type="button"
                  onClick={prevStep}
                  className="btn-secondary"
                >
                  Previous
                </button>
              )}
              
              {currentStep < STEPS.length - 1 ? (
                <button
                  type="button"
                  onClick={nextStep}
                  className="btn-primary ml-auto"
                >
                  Next
                </button>
              ) : (
                <button
                  type="submit"
                  className="btn-primary ml-auto"
                >
                  Submit
                </button>
              )}
            </div>
          </div>
        </form>
      </FormProvider>
    </div>
  );
};

export default FarmerRegistration;