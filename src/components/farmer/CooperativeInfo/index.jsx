// src/components/farmer/CooperativeInfo/index.jsx
import React, { useEffect } from 'react';
import { useFormContext } from 'react-hook-form';
import useFarmerStore from '../../../stores/useFarmerStore';
import { COOPERATIVE_ACTIVITIES } from "../FarmInfo/constants/farm_constants";

const CooperativeInfo = () => {
  const { register, watch, formState: { errors } } = useFormContext();
  const { setFormData, formData, setStepValidation } = useFarmerStore();
  const memberStatus = watch('member_of_cooperative');

  useEffect(() => {
    const isValid = memberStatus === 'false' || 
      (memberStatus === 'true' && 
       formData.name && 
       formData.cooperativeActivities?.length > 0);
       
    setStepValidation(4, isValid);
  }, [memberStatus, formData.name, formData.cooperativeActivities, setStepValidation]);

  const handleActivitiesChange = (e) => {
    const checkboxes = document.querySelectorAll('input[name="activities"]:checked');
    const selectedActivities = Array.from(checkboxes).map(cb => cb.value);
    setFormData({ cooperativeActivities: selectedActivities });
  };

  const handleMembershipChange = (value) => {
    setFormData({ 
      member_of_cooperative: value,
      // Reset related fields when changing membership status
      name: value === 'false' ? '' : formData.name,
      cooperativeActivities: value === 'false' ? [] : formData.cooperativeActivities
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-gray-900">Cooperative Details</h2>
        <p className="mt-1 text-sm text-gray-600">
          Information about farmer's cooperative membership and activities
        </p>
      </div>

      <div className="space-y-4">
        <div className="space-y-2">
          <label className="form-label">
            Are you a member of a cooperative? <span className="text-red-500">*</span>
          </label>
          <div className="flex space-x-4">
            <label className="inline-flex items-center">
              <input
                type="radio"
                {...register('member_of_cooperative')}
                value="true"
                checked={formData.member_of_cooperative === 'true'}
                onChange={(e) => handleMembershipChange(e.target.value)}
                className="form-radio text-kitovu-purple"
              />
              <span className="ml-2">Yes</span>
            </label>
            <label className="inline-flex items-center">
              <input
                type="radio"
                {...register('member_of_cooperative')}
                value="false"
                checked={formData.member_of_cooperative === 'false'}
                onChange={(e) => handleMembershipChange(e.target.value)}
                className="form-radio text-kitovu-purple"
              />
              <span className="ml-2">No</span>
            </label>
          </div>
          {errors.member_of_cooperative && (
            <p className="text-red-500 text-sm mt-1">{errors.member_of_cooperative.message}</p>
          )}
        </div>

        {formData.member_of_cooperative === 'true' && (
          <div className="space-y-4 pt-4">
            <div className="space-y-1">
              <label className="form-label">
                Cooperative Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.name || ''}
                onChange={(e) => setFormData({ name: e.target.value })}
                className="form-input"
                placeholder="Enter cooperative name"
              />
              {errors.name && (
                <p className="text-red-500 text-sm mt-1">{errors.name.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <label className="form-label">
                Cooperative Activities <span className="text-red-500">*</span>
              </label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {COOPERATIVE_ACTIVITIES.map((activity) => (
                  <label key={activity.id} className="inline-flex items-center">
                    <input
                      type="checkbox"
                      name="activities"
                      value={activity.id}
                      checked={formData.cooperativeActivities?.includes(activity.id)}
                      onChange={handleActivitiesChange}
                      className="form-checkbox text-kitovu-purple rounded"
                    />
                    <span className="ml-2 text-sm">{activity.label}</span>
                  </label>
                ))}
              </div>
              {errors.cooperativeActivities && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.cooperativeActivities.message}
                </p>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CooperativeInfo;