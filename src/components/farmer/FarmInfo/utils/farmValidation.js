// src/components/farmer/FarmInfo/utils/farmValidation.js

/**
 * Validate farm form data
 */
export const validateFarmForm = (formData, geometry) => {
    const errors = {};
  
    // Required fields
    if (!formData.farmType) {
      errors.farmType = 'Farm type is required';
    }
  
    if (!formData.ownershipType) {
      errors.ownershipType = 'Ownership type is required';
    }
  
    // Lease duration if farm is leased
    if (formData.ownershipType === 'leased') {
      if (!formData.leaseYears && !formData.leaseMonths) {
        errors.leaseDuration = 'Lease duration is required';
      }
    }
  
    // Farm type specific validations
    if (formData.farmType === 'crop' || formData.farmType === 'both') {
      if (!formData.cropType) {
        errors.cropType = 'Crop type is required';
      }
    }
  
    if (formData.farmType === 'livestock' || formData.farmType === 'both') {
      if (!formData.livestockType) {
        errors.livestockType = 'Livestock type is required';
      }
      if (!formData.livestockCount) {
        errors.livestockCount = 'Number of animals is required';
      }
    }
  
    // Geometry validation
    if (!geometry || !geometry.coordinates || geometry.coordinates.length < 3) {
      errors.geometry = 'Farm boundary must be drawn on the map';
    }
  
    return {
      isValid: Object.keys(errors).length === 0,
      errors
    };
  };
  
  /**
   * Check if farm data is complete enough to save
   */
  export const canSaveFarm = (formData, geometry) => {
    const { isValid } = validateFarmForm(formData, geometry);
    return isValid;
  };
  
  /**
   * Check if form has unsaved changes
   */
  export const hasUnsavedChanges = (currentValues, savedValues) => {
    if (!savedValues) return Object.keys(currentValues).length > 0;
    
    return JSON.stringify(currentValues) !== JSON.stringify(savedValues);
  };