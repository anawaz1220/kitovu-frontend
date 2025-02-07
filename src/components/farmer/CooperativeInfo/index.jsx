// src/components/farmer/CooperativeInfo/index.jsx
import React from 'react';
import { useFormContext } from 'react-hook-form';
import FormInput from '../../common/FormInput';
import { COOPERATIVE_ACTIVITIES } from "../FarmInfo/constants/farm_constants";
const CooperativeInfo = () => {
  const { register, watch, formState: { errors } } = useFormContext();
  const isMember = watch('isMember');

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-gray-900">Cooperative Details</h2>
        <p className="mt-1 text-sm text-gray-600">
          Information about farmer's cooperative membership and activities
        </p>
      </div>

      <div className="space-y-4">
        {/* Membership Status */}
        <div className="space-y-2">
          <label className="form-label">
            Are you a member of a cooperative? <span className="text-red-500">*</span>
          </label>
          <div className="flex space-x-4">
            <label className="inline-flex items-center">
              <input
                type="radio"
                {...register('isMember', { required: 'Please select membership status' })}
                value="true"
                className="form-radio text-kitovu-purple"
              />
              <span className="ml-2">Yes</span>
            </label>
            <label className="inline-flex items-center">
              <input
                type="radio"
                {...register('isMember')}
                value="false"
                className="form-radio text-kitovu-purple"
              />
              <span className="ml-2">No</span>
            </label>
          </div>
          {errors.isMember && (
            <p className="text-red-500 text-sm mt-1">{errors.isMember.message}</p>
          )}
        </div>

        {/* Conditional Fields for Cooperative Members */}
        {isMember === 'true' && (
          <div className="space-y-4 pt-4">
            <FormInput
              name="cooperativeName"
              label="Cooperative Name"
              required
              placeholder="Enter cooperative name"
              rules={{
                required: 'Cooperative name is required',
                minLength: {
                  value: 3,
                  message: 'Name must be at least 3 characters long'
                }
              }}
            />

            {/* Cooperative Activities */}
            <div className="space-y-2">
              <label className="form-label">
                Cooperative Activities <span className="text-red-500">*</span>
              </label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {COOPERATIVE_ACTIVITIES.map((activity) => (
                  <label key={activity.id} className="inline-flex items-center">
                    <input
                      type="checkbox"
                      {...register('cooperativeActivities', {
                        required: 'Please select at least one activity'
                      })}
                      value={activity.id}
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