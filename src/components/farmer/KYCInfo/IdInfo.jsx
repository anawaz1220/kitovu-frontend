import React from 'react';
import { useFormContext } from 'react-hook-form';
import FormInput from "../../common/FormInput";

const ID_TYPES = [
  { value: 'national_id', label: 'National ID' },
  { value: 'voters_card', label: 'Voter\'s Card' },
  { value: 'drivers_license', label: 'Driver\'s License' },
  { value: 'international_passport', label: 'International Passport' },
];

const IdInfo = () => {
  const { register, formState: { errors } } = useFormContext();

  return (
    <div className="space-y-4">
      <div className="space-y-4">
        <label className="block text-sm font-medium text-gray-700">
          ID Type <span className="text-red-500">*</span>
        </label>
        <select
          {...register('idType', { required: 'ID Type is required' })}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-kitovu-purple focus:ring-kitovu-purple sm:text-sm"
        >
          <option value="">Select ID Type</option>
          {ID_TYPES.map((type) => (
            <option key={type.value} value={type.value}>
              {type.label}
            </option>
          ))}
        </select>
        {errors.idType && (
          <p className="text-red-500 text-xs mt-1">{errors.idType.message}</p>
        )}
      </div>

      <FormInput
        name="idNumber"
        label="ID Number"
        required
        placeholder="Enter your ID number"
        rules={{
          required: 'ID Number is required',
          minLength: {
            value: 4,
            message: 'ID Number must be at least 4 characters'
          }
        }}
      />
    </div>
  );
};

export default IdInfo;