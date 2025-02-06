import React from 'react';
import { useFormContext } from 'react-hook-form';
import FormInput from '../../common/FormInput';
import { 
  FARM_TYPES, 
  OWNERSHIP_TYPES, 
  CROP_TYPES, 
  LIVESTOCK_TYPES 
} from './constants';

const FarmForm = ({ onSave, currentArea, editingFarm }) => {
  const { register, watch, getValues } = useFormContext();
  const farmType = watch('farmType');
  const ownershipType = watch('ownershipType');

  const handleSave = (addAnother = false) => {
    const formData = {
      ...getValues(),
      area: currentArea || getValues('area'),
    };
    onSave(formData, addAnother);
  };

  return (
    <div className="space-y-4">
      <div>
        <label className="form-label">Farm Type</label>
        <select {...register('farmType')} className="form-input">
          <option value="">Select Farm Type</option>
          {FARM_TYPES.map(type => (
            <option key={type.id} value={type.id}>{type.label}</option>
          ))}
        </select>
      </div>

      <div>
        <label className="form-label">Ownership Status</label>
        <select {...register('ownershipType')} className="form-input">
          <option value="">Select Ownership Type</option>
          {OWNERSHIP_TYPES.map(type => (
            <option key={type.id} value={type.id}>{type.label}</option>
          ))}
        </select>
      </div>

      {ownershipType === 'leased' && (
        <div className="grid grid-cols-2 gap-4">
          <FormInput
            name="leaseYears"
            label="Lease Years"
            type="number"
            min="0"
          />
          <FormInput
            name="leaseMonths"
            label="Lease Months"
            type="number"
            min="0"
            max="11"
          />
        </div>
      )}

      <FormInput
        name="area"
        label="Area (Hectares)"
        type="number"
        step="0.01"
        defaultValue={currentArea}
      />

      {(farmType === 'crop' || farmType === 'both') && (
        <div className="space-y-4">
          <h3 className="text-lg font-medium">Crop Information</h3>
          <div>
            <label className="form-label">Crop Type</label>
            <select {...register('cropType')} className="form-input">
              <option value="">Select Crop Type</option>
              {CROP_TYPES.map(type => (
                <option key={type.id} value={type.id}>{type.label}</option>
              ))}
            </select>
          </div>
          <FormInput
            name="cropArea"
            label="Crop Area (Hectares)"
            type="number"
            step="0.01"
            min="0"
            max={currentArea || getValues('area')}
          />
        </div>
      )}

      {(farmType === 'livestock' || farmType === 'both') && (
        <div className="space-y-4">
          <h3 className="text-lg font-medium">Livestock Information</h3>
          <div>
            <label className="form-label">Livestock Type</label>
            <select {...register('livestockType')} className="form-input">
              <option value="">Select Livestock Type</option>
              {LIVESTOCK_TYPES.map(type => (
                <option key={type.id} value={type.id}>{type.label}</option>
              ))}
            </select>
          </div>
          <FormInput
            name="livestockCount"
            label="Number of Animals"
            type="number"
            min="0"
          />
        </div>
      )}

      <div className="flex space-x-4 pt-4">
        <button
          type="button"
          onClick={() => handleSave(false)}
          className="btn-primary"
        >
          {editingFarm ? 'Update Farm' : 'Save Farm'}
        </button>
        {!editingFarm && (
          <button
            type="button"
            onClick={() => handleSave(true)}
            className="btn-secondary"
          >
            Save & Add Another
          </button>
        )}
      </div>
    </div>
  );
};

export default FarmForm;