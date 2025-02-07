import React, { useState, useEffect } from 'react';
import { useFormContext } from 'react-hook-form';
import PhotoCapture from './PhotoCapture';
import IdInfo from './IdInfo';
import useFarmerStore from '../../../stores/useFarmerStore';


const KYCInfo = () => {
  const { setValue, watch } = useFormContext();
  const { formData, setFormData, setStepValidation } = useFarmerStore();
  const [userPhoto, setUserPhoto] = useState(null);
  const [idPhoto, setIdPhoto] = useState(null);

  // Watch ID fields from react-hook-form
  const idType = watch('idType');
  const idNumber = watch('idNumber');

  // 1. First useEffect - Initialize photos from formData
  useEffect(() => {
    if (formData.userPhotoUrl) {
      setUserPhoto(formData.userPhotoUrl);
    }
    if (formData.idPhotoUrl) {
      setIdPhoto(formData.idPhotoUrl);
    }
  }, []); // Empty dependency array means it runs once on mount

  // 2. Second useEffect - Update formData when ID fields change
  useEffect(() => {
    if (idType) setFormData({ idType });
    if (idNumber) setFormData({ idNumber });
  }, [idType, idNumber, setFormData]);

  // 3. Third useEffect - Validation logic
  useEffect(() => {
    const isValid = !!(
      userPhoto && 
      idPhoto && 
      formData.idType && 
      formData.idNumber
    );
    
    console.log('KYC validation:', {
      userPhoto: !!userPhoto,
      idPhoto: !!idPhoto,
      idType: formData.idType,
      idNumber: formData.idNumber,
      isValid
    });

    setStepValidation(3, isValid);
  }, [userPhoto, idPhoto, formData.idType, formData.idNumber, setStepValidation]);

  const handleUserPhotoCapture = (imageUrl, file) => {
    setUserPhoto(imageUrl);  // Local state for display
    setValue('userPhoto', file);  // Form state
    setFormData({ 
      ...formData,
      userPhotoUrl: imageUrl,  // Add this for display persistence
      userPhoto: file 
    });
  };
  
  const handleIdPhotoCapture = (imageUrl, file) => {
    setIdPhoto(imageUrl);
    setValue('idPhoto', file);
    setFormData({ 
      ...formData,
      idPhotoUrl: imageUrl,  // Add this for display persistence
      idPhoto: file 
    });
  };

  const handlePhotoRemove = (type) => {
    if (type === 'user') {
      setUserPhoto(null);
      setValue('userPhoto', null);
      setFormData({ userPhoto: null });
    } else {
      setIdPhoto(null);
      setValue('idPhoto', null);
      setFormData({ idPhoto: null });
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold text-gray-900">Identity Verification</h2>
      <p className="text-sm text-gray-600">
        Please provide your identification details and photos. This information helps us verify your identity.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <PhotoCapture
          label="Your Photo"
          photo={userPhoto}
          onPhotoCapture={handleUserPhotoCapture}
          onPhotoRemove={() => handlePhotoRemove('user')}
          required
        />

        <div className="space-y-6">
          <IdInfo />

          <PhotoCapture
            label="ID Document Photo"
            photo={idPhoto}
            onPhotoCapture={handleIdPhotoCapture}
            onPhotoRemove={() => handlePhotoRemove('id')}
            required
          />
        </div>
      </div>
    </div>
  );
};

export default KYCInfo;