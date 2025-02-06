import React, { useState } from 'react';
import { useFormContext } from 'react-hook-form';
import PhotoCapture from './PhotoCapture';
import IdInfo from './IdInfo';

const KYCInfo = () => {
  const { setValue } = useFormContext();
  const [userPhoto, setUserPhoto] = useState(null);
  const [idPhoto, setIdPhoto] = useState(null);

  const handleUserPhotoCapture = (imageUrl, file) => {
    setUserPhoto(imageUrl);
    setValue('userPhoto', file);
  };

  const handleIdPhotoCapture = (imageUrl, file) => {
    setIdPhoto(imageUrl);
    setValue('idPhoto', file);
  };

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold text-gray-900">Identity Verification</h2>
      <p className="text-sm text-gray-600">
        Please provide your identification details and photos. This information helps us verify your identity.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* User Photo Section */}
        <PhotoCapture
          label="Your Photo"
          photo={userPhoto}
          onPhotoCapture={handleUserPhotoCapture}
          onPhotoRemove={() => {
            setUserPhoto(null);
            setValue('userPhoto', null);
          }}
          required
        />

        <div className="space-y-6">
          {/* ID Information Section */}
          <IdInfo />

          {/* ID Photo Section */}
          <PhotoCapture
            label="ID Document Photo"
            photo={idPhoto}
            onPhotoCapture={handleIdPhotoCapture}
            onPhotoRemove={() => {
              setIdPhoto(null);
              setValue('idPhoto', null);
            }}
            required
          />
        </div>
      </div>
    </div>
  );
};

export default KYCInfo;