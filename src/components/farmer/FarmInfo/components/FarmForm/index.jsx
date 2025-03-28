// src/components/farmer/FarmInfo/components/FarmForm/index.jsx
import React, { useEffect } from 'react';
import { Button } from '../../../../ui/button';
import { Select } from '../../../../ui/select';
import { Input } from '../../../../ui/input';
import { useForm } from 'react-hook-form';
import { FARM_TYPES, CROP_TYPES, OWNERSHIP_TYPES, LIVESTOCK_TYPES } from '../../constants/farm_constants';
import { calculateArea } from '../../utils/geometryUtils';
import { Dialog } from '@headlessui/react';

const FarmForm = ({ 
  isOpen, 
  onClose, 
  onSubmit, 
  onEditBoundary,
  drawnPolygon,
  isEditing = false,
  farm = null
}) => {
  const { register, handleSubmit, watch, reset, setValue } = useForm();
  const farmType = watch('farm_type');
  const calculatedArea = drawnPolygon ? calculateArea(drawnPolygon) : 0;

  // Populate form when editing
  useEffect(() => {
    if (isEditing && farm) {
      reset({
        farm_type: farm.farm_type,
        crop_type: farm.crop_type || '',
        livestock_type: farm.livestock_type || '',
        number_of_animals: farm.number_of_animals || ''
      });
    } else {
      reset({});
    }
  }, [isEditing, farm, reset]);

  const onFormSubmit = (data) => {
    onSubmit({
      ...data,
      area: calculatedArea,
      geometry: {
        type: 'MultiPolygon',
        coordinates: [[drawnPolygon]]
      }
    });
    onClose();
  };

  return (
    <Dialog 
      open={isOpen} 
      onClose={onClose} 
      className="relative z-[9999]"
      style={{ position: 'fixed', inset: 0 }}
    >
      <div className="fixed inset-0 bg-black/50" aria-hidden="true" style={{ zIndex: 9998 }} />
      
      <div className="fixed inset-0 overflow-y-auto" style={{ zIndex: 9999 }}>
        <div className="flex min-h-full items-center justify-center p-4">
          <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-lg bg-white p-6 shadow-xl">
            <Dialog.Title className="text-lg font-medium mb-4">
              {isEditing ? 'Edit Farm Details' : 'Farm Details'}
            </Dialog.Title>

            <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-4">
              <div className="grid gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Area (Hectares)
                  </label>
                  <Input
                    value={calculatedArea}
                    disabled
                    className="mt-1"
                  />
                </div>
                
                <div>
                    <label className="block text-sm font-medium text-gray-700">
                        Ownership Status
                    </label>
                    <select
                        {...register('ownership_status', { required: true })}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-kitovu-purple focus:ring-kitovu-purple"
                    >
                        <option value="">Select Ownership Type</option>
                        {OWNERSHIP_TYPES.map(type => (
                        <option key={type.id} value={type.id}>
                            {type.label}
                        </option>
                        ))}
                    </select>
                </div>
                
                {watch('ownership_status') === 'leased' && (
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                        <label className="block text-sm font-medium text-gray-700">
                            Lease Years
                        </label>
                        <Input
                            type="number"
                            {...register('lease_years', {
                            required: 'Years required for leased property'
                            })}
                            className="mt-1"
                        />
                        </div>
                        <div>
                        <label className="block text-sm font-medium text-gray-700">
                            Lease Months
                        </label>
                        <Input
                            type="number"
                            {...register('lease_months', {
                            required: 'Months required for leased property',
                            max: { value: 11, message: 'Months should be less than 12' }
                            })}
                            className="mt-1"
                        />
                        </div>
                    </div>
                    )}

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Farm Type
                  </label>
                  <select
                    {...register('farm_type', { required: true })}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-kitovu-purple focus:ring-kitovu-purple"
                  >
                    <option value="">Select Farm Type</option>
                    {FARM_TYPES.map(type => (
                      <option key={type.id} value={type.id}>
                        {type.label}
                      </option>
                    ))}
                  </select>
                </div>

                {(farmType === 'crop' || farmType === 'both') && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Crop Type
                    </label>
                    <select
                      {...register('crop_type', { required: farmType === 'crop' })}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-kitovu-purple focus:ring-kitovu-purple"
                    >
                      <option value="">Select Crop Type</option>
                      {CROP_TYPES.map(type => (
                        <option key={type.id} value={type.id}>
                          {type.label}
                        </option>
                      ))}
                    </select>
                    <label className="block text-sm font-medium text-gray-700">
                        Crop Area (Hectares)
                        </label>
                        <Input
                        type="number"
                        step="0.01"
                        {...register('crop_area', {
                            required: true,
                            min: 0.01,
                            max: calculatedArea,
                            validate: value => parseFloat(value) <= calculatedArea || 
                            "Crop area cannot exceed farm area"
                        })}
                        className="mt-1"
                        />
                  </div>
                  
                )}
                
                    {(farmType === 'livestock' || farmType === 'both') && (
                    <>
                        <div>
                        <label className="block text-sm font-medium text-gray-700">
                            Livestock Type
                        </label>
                        <select
                            {...register('livestock_type', { 
                            required: farmType === 'livestock' ? 'Livestock type is required' : false
                            })}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-kitovu-purple focus:ring-kitovu-purple"
                        >
                            <option value="">Select Livestock Type</option>
                            {LIVESTOCK_TYPES.map(type => (
                            <option key={type.id} value={type.id}>
                                {type.label}
                            </option>
                            ))}
                        </select>
                        </div>

                        {watch('livestock_type') && (
                        <div>
                            <label className="block text-sm font-medium text-gray-700">
                            Number of Animals
                            </label>
                            <Input
                            type="number"
                            {...register('number_of_animals', {
                                required: 'Number of animals is required',
                                min: {
                                value: 1,
                                message: 'Must have at least 1 animal'
                                },
                                validate: {
                                isInteger: v => Number.isInteger(Number(v)) || 'Must be a whole number',
                                isPositive: v => Number(v) > 0 || 'Must be greater than 0'
                                }
                            })}
                            className="mt-1"
                            />
                        </div>
                        )}
                    </>
                    )}
              </div>

              <div className="flex justify-end space-x-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={onClose}
                >
                  Cancel
                </Button>
                {isEditing && (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      onEditBoundary();
                    }}
                  >
                    Edit Farm Boundary
                  </Button>
                )}
                <Button type="submit">
                  {isEditing ? 'Update Farm' : 'Save Farm'}
                </Button>
              </div>
            </form>
          </Dialog.Panel>
        </div>
      </div>
    </Dialog>
  );
};

export default FarmForm;