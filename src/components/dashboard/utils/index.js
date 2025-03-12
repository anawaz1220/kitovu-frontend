// src/components/dashboard/utils/index.js
// This file exports all utility functions from the utils directory

// Re-export all from mapConfig
export * from './mapConfig';

// Re-export all from mapStyles
export { 
  farmersStyle, 
  cropsStyle, 
  countryStyle, 
  stateStyle, 
  lgaStyle,
  getColorByFarmersCount,
  getColorByCropArea
} from './mapStyles';

// Re-export all from mapInteractions
export {
  onEachFarmerFeature,
  onEachCropFeature,
  onEachStateFeature,
  onEachLGAFeature,
  safelyFitBounds
} from './mapInteractions';