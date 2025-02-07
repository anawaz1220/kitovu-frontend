import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const validateFarmInfo = (farms) => {
    // At least one farm should be added with boundary
    return farms.length > 0;
  };

  const validateKYCInfo = (formData) => {
    return !!(
      formData.idType &&
      formData.idNumber &&
      formData.userPhoto &&
      formData.idPhoto
    );
  };

  const validateCooperativeInfo = (formData) => {
    if (!formData.member_of_cooperative) return true;
    
    // If they are a member, check required fields
    return formData.member_of_cooperative === 'false' || 
           (formData.name && formData.activities?.length > 0);
  };

const initialFormState = {
  // Personal Info
  firstName: '',
  lastName: '',
  gender: '',
  dateOfBirth: '',
  phoneNumber: '',
  alternatePhone: '',

  // user device location
  user_latitude: null,
  user_longitude: null,
  locationPermissionGranted: false,

  // Location Info
  address: '',
  community: '',
  state: '',
  lga: '',
  city: '',

  // Farm Info is handled by existing useFarmStore

  // KYC Info
  idType: '',
  idNumber: '',
  userPhoto: null,
  idPhoto: null,

  // Cooperative Info
  member_of_cooperative: '',
  name: '',
  activities: [],
};
const validateLocationInfo = (formData) => {
    return !!(
      formData.address &&
      formData.state &&
      formData.lga &&
      formData.city
    );
  };

const useFarmerStore = create(
  persist(
    (set, get) => ({
      // Form Data
      formData: initialFormState,
      currentStep: 0,
      stepsValidation: {
        0: false, // Personal Info
        1: false, // Location
        2: false, // Farm Info
        3: false, // KYC
        4: false  // Cooperative
      },
      
      // UI States
      isSubmitting: false,
      error: null,
      
      // Actions
      setFormData: (data) => set((state) => ({
        formData: { ...state.formData, ...data }
      })),
      
      setCurrentStep: (step) => set({ currentStep: step }),
      
      
      setStepValidation: (step, isValid) => set((state) => ({
        stepsValidation: {
          ...state.stepsValidation,
          [step]: isValid
        }
      })),

      resetForm: () => set({
        formData: initialFormState,
        currentStep: 0,
        stepsValidation: {
          0: false,
          1: false,
          2: false,
          3: false,
          4: false
        }
      }),

      // Submission handlers
      setSubmitting: (isSubmitting) => set({ isSubmitting }),
      setError: (error) => set({ error }),
      
      // Helper methods
      isStepValid: (step) => get().stepsValidation[step],
      canProceed: (step) => get().stepsValidation[step],
      
      // Form completion check
      isFormComplete: () => {
        const { stepsValidation } = get();
        return Object.values(stepsValidation).every(Boolean);
      },
    }),
    {
      name: 'farmer-registration-storage',
      partialize: (state) => ({
        formData: state.formData,
        currentStep: state.currentStep,
        stepsValidation: state.stepsValidation
      })
    }
  )
);

export default useFarmerStore;