// src/components/advisory/ReportSections/HerbicideSection.jsx
import React from 'react';
import { Bug, AlertCircle, Package, Clock, Shield, Leaf, Info, Calendar } from 'lucide-react';

/**
 * Herbicide & Pesticide Recommendations Section Component
 * @param {Object} props - Component props
 * @param {Object} props.data - Herbicide/pesticide data from API
 * @param {Object} props.farmInfo - Farm information
 * @param {Object} props.inputParams - Input parameters used for the request
 */
const HerbicideSection = ({ data, farmInfo, inputParams }) => {
  // Handle error or no data
  if (!data || !data.success) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex items-center mb-4">
          <Bug className="h-6 w-6 text-orange-600 mr-3" />
          <h2 className="text-xl font-semibold text-gray-800">Herbicide & Pesticide Recommendations</h2>
        </div>
        <div className="flex items-center text-amber-600 bg-amber-50 p-4 rounded-lg">
          <AlertCircle className="h-5 w-5 mr-2" />
          <span>{data?.error || 'Unable to load herbicide and pesticide recommendations'}</span>
        </div>
      </div>
    );
  }

  const herbicide = data.data;

  // Get application timing color
  const getTimingColor = (timing) => {
    switch (timing?.toLowerCase()) {
      case 'pre-planting': return 'text-blue-600 bg-blue-50 border-blue-200';
      case 'pre-emergence': return 'text-green-600 bg-green-50 border-green-200';
      case 'post-emergence': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  // Get pressure level color
  const getPressureColor = (pressure) => {
    switch (pressure?.toLowerCase()) {
      case 'low': return 'text-green-600 bg-green-50';
      case 'medium': return 'text-yellow-600 bg-yellow-50';
      case 'high': return 'text-red-600 bg-red-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      {/* Header */}
      <div className="flex items-center mb-6">
        <Bug className="h-6 w-6 text-orange-600 mr-3" />
        <div>
          <h2 className="text-xl font-semibold text-gray-800">Herbicide & Pesticide Recommendations</h2>
          <p className="text-sm text-gray-600">Targeted weed and pest management solutions</p>
        </div>
      </div>

      {/* Input Parameters Summary */}
      {inputParams && Object.keys(inputParams).length > 0 && (
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Analysis Parameters</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {inputParams.growth_stage && (
              <div className="bg-blue-50 border border-blue-200 p-3 rounded-lg">
                <p className="text-sm text-gray-600">Growth Stage</p>
                <p className="font-medium text-gray-800 capitalize">{inputParams.growth_stage}</p>
              </div>
            )}
            {inputParams.weed_pressure && (
              <div className={`p-3 rounded-lg border ${getPressureColor(inputParams.weed_pressure)}`}>
                <p className="text-sm font-medium">Weed Pressure</p>
                <p className="font-bold capitalize">{inputParams.weed_pressure}</p>
              </div>
            )}
            {inputParams.pest_pressure && (
              <div className={`p-3 rounded-lg border ${getPressureColor(inputParams.pest_pressure)}`}>
                <p className="text-sm font-medium">Pest Pressure</p>
                <p className="font-bold capitalize">{inputParams.pest_pressure}</p>
              </div>
            )}
            {inputParams.planting_date && (
              <div className="bg-green-50 border border-green-200 p-3 rounded-lg">
                <p className="text-sm text-gray-600">Planting Date</p>
                <p className="font-medium text-gray-800">
                  {new Date(inputParams.planting_date).toLocaleDateString()}
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Farm Information */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-gradient-to-r from-orange-50 to-red-50 p-4 rounded-lg border border-orange-100">
          <div className="flex items-center">
            <Package className="h-8 w-8 text-orange-600 mr-3" />
            <div>
              <p className="text-sm text-gray-600">Farm Size</p>
              <p className="text-xl font-bold text-gray-800">
                {herbicide.farm_size_hectares || farmInfo.calculated_area || 0} 
                {herbicide.farm_size_hectares ? ' ha' : ' acres'}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-4 rounded-lg border border-green-100">
          <div className="flex items-center">
            <Leaf className="h-8 w-8 text-green-600 mr-3" />
            <div>
              <p className="text-sm text-gray-600">Crop Type</p>
              <p className="text-xl font-bold text-gray-800 capitalize">
                {herbicide.crop || farmInfo.crop_type || 'N/A'}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-r from-purple-50 to-indigo-50 p-4 rounded-lg border border-purple-100">
          <div className="flex items-center">
            <Clock className="h-8 w-8 text-purple-600 mr-3" />
            <div>
              <p className="text-sm text-gray-600">Growth Stage</p>
              <p className="text-xl font-bold text-gray-800 capitalize">
                {herbicide.growth_stage || 'N/A'}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-r from-blue-50 to-cyan-50 p-4 rounded-lg border border-blue-100">
          <div className="flex items-center">
            <Calendar className="h-8 w-8 text-blue-600 mr-3" />
            <div>
              <p className="text-sm text-gray-600">Generated</p>
              <p className="text-sm font-medium text-gray-800">
                {new Date(herbicide.generated_at).toLocaleDateString()}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Herbicide Recommendations */}
      {herbicide.recommendations?.herbicides && herbicide.recommendations.herbicides.length > 0 && (
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Herbicide Recommendations</h3>
          <div className="space-y-4">
            {herbicide.recommendations.herbicides.map((herb, index) => (
              <div key={index} className="border rounded-lg p-4 bg-gray-50">
                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h4 className="font-semibold text-gray-800 text-lg">
                      {herb.recommended_brand?.name || herb.herbicide_type}
                    </h4>
                    <p className="text-sm text-gray-600">
                      Active Ingredient: <span className="font-medium">{herb.active_ingredient}</span>
                    </p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${getTimingColor(herb.application_timing)}`}>
                    {herb.application_timing}
                  </span>
                </div>

                {/* Application Details */}
                {herb.application_details && (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                    <div className="bg-white p-3 rounded border">
                      <p className="text-xs text-gray-500">Rate per Hectare</p>
                      <p className="font-bold text-gray-800">{herb.application_details.rate_per_hectare}</p>
                    </div>
                    <div className="bg-white p-3 rounded border">
                      <p className="text-xs text-gray-500">Total Quantity</p>
                      <p className="font-bold text-gray-800">
                        {herb.application_details.total_quantity} {herb.application_details.unit}
                      </p>
                    </div>
                    <div className="bg-white p-3 rounded border">
                      <p className="text-xs text-gray-500">Dilution Water</p>
                      <p className="font-bold text-gray-800">
                        {herb.application_details.dilution_water} {herb.application_details.dilution_unit}
                      </p>
                    </div>
                    <div className="bg-white p-3 rounded border">
                      <p className="text-xs text-gray-500">Total Spray Volume</p>
                      <p className="font-bold text-gray-800">
                        {herb.application_details.total_spray_volume} {herb.application_details.dilution_unit}
                      </p>
                    </div>
                  </div>
                )}

                {/* Product Information */}
                {herb.recommended_brand && (
                  <div className="bg-white p-3 rounded border mb-4">
                    <h5 className="font-medium text-gray-800 mb-2">Product Information</h5>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                      <div>
                        <p className="text-gray-600">Concentration:</p>
                        <p className="font-medium">{herb.recommended_brand.concentration}</p>
                      </div>
                      <div>
                        <p className="text-gray-600">Manufacturer:</p>
                        <p className="font-medium">{herb.recommended_brand.manufacturer}</p>
                      </div>
                      <div>
                        <p className="text-gray-600">Mode of Action:</p>
                        <p className="font-medium">{herb.mode_of_action}</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Target Information */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div className="bg-white p-3 rounded border">
                    <h5 className="font-medium text-gray-800 mb-2">Target Weeds</h5>
                    <p className="text-sm text-gray-700">{herb.target_weeds}</p>
                  </div>
                  {herb.timing_instructions && (
                    <div className="bg-white p-3 rounded border">
                      <h5 className="font-medium text-gray-800 mb-2">Growth Stage</h5>
                      <p className="text-sm text-gray-700">{herb.timing_instructions.growth_stage}</p>
                      {herb.timing_instructions.safety_period_before_harvest && (
                        <p className="text-xs text-gray-600 mt-1">
                          Safety period: {herb.timing_instructions.safety_period_before_harvest}
                        </p>
                      )}
                    </div>
                  )}
                </div>

                {/* Application Conditions */}
                {herb.timing_instructions?.optimal_conditions && (
                  <div className="bg-blue-50 border border-blue-200 p-3 rounded">
                    <h5 className="font-medium text-blue-800 mb-2">Optimal Application Conditions</h5>
                    <ul className="text-sm text-blue-700 space-y-1">
                      {herb.timing_instructions.optimal_conditions.map((condition, idx) => (
                        <li key={idx} className="flex items-start">
                          <span className="text-blue-500 mr-2">•</span>
                          {condition}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Contraindications */}
                {herb.contraindications && (
                  <div className="bg-red-50 border border-red-200 p-3 rounded mt-3">
                    <div className="flex items-start">
                      <AlertCircle className="h-4 w-4 text-red-500 mr-2 mt-0.5" />
                      <div>
                        <h5 className="font-medium text-red-800 mb-1">Contraindications</h5>
                        <p className="text-sm text-red-700">{herb.contraindications}</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Alternative Products */}
      {herbicide.recommendations?.alternatives && herbicide.recommendations.alternatives.length > 0 && (
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Alternative Products</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {herbicide.recommendations.alternatives.map((alt, index) => (
              <div key={index} className="border rounded-lg p-4 bg-yellow-50">
                <h4 className="font-medium text-gray-800">{alt.alternative_brand}</h4>
                <p className="text-sm text-gray-600 mb-2">{alt.concentration} - {alt.manufacturer}</p>
                <p className="text-xs text-gray-500">{alt.reason}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Pesticide Recommendations */}
      {herbicide.pesticides && herbicide.pesticides.length > 0 && (
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Pesticide Recommendations</h3>
          <div className="space-y-3">
            {herbicide.pesticides.map((pest, index) => (
              <div key={index} className="border rounded-lg p-4 bg-orange-50">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium text-gray-800">{pest.product_name}</h4>
                  <Bug className="h-5 w-5 text-orange-600" />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                  <div>
                    <p className="text-gray-600">Target Pest:</p>
                    <p className="font-medium">{pest.target_pest}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Application Rate:</p>
                    <p className="font-medium">{pest.application_rate} {pest.unit}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Total Quantity:</p>
                    <p className="font-medium">{pest.total_quantity} {pest.unit}</p>
                  </div>
                </div>
                <div className="mt-2 text-sm">
                  <p className="text-gray-600">Timing: <span className="font-medium">{pest.timing}</span></p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Application Guidelines */}
      {herbicide.recommendations?.application_guidelines && herbicide.recommendations.application_guidelines.length > 0 && (
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Application Guidelines</h3>
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-start">
              <Shield className="h-5 w-5 text-green-600 mr-2 mt-0.5" />
              <div>
                <h4 className="font-medium text-green-800 mb-2">Best Practices</h4>
                <ul className="text-sm text-green-700 space-y-1">
                  {herbicide.recommendations.application_guidelines.map((guideline, index) => (
                    <li key={index} className="flex items-start">
                      <span className="text-green-500 mr-2">•</span>
                      {guideline}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Safety Guidelines */}
      {herbicide.recommendations?.safety_guidelines && herbicide.recommendations.safety_guidelines.length > 0 && (
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Safety Guidelines</h3>
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-start">
              <AlertCircle className="h-5 w-5 text-red-600 mr-2 mt-0.5" />
              <div>
                <h4 className="font-medium text-red-800 mb-2">Safety Precautions</h4>
                <ul className="text-sm text-red-700 space-y-1">
                  {herbicide.recommendations.safety_guidelines.map((safety, index) => (
                    <li key={index} className="flex items-start">
                      <span className="text-red-500 mr-2">•</span>
                      {safety}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Data Source Information */}
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
        <div className="flex items-start">
          <Info className="h-5 w-5 text-gray-600 mr-2 mt-0.5" />
          <div>
            <h4 className="font-medium text-gray-800 mb-2">Data Source & Generation Info</h4>
            <div className="text-sm text-gray-700 space-y-1">
              <p><strong>Data Source:</strong> {herbicide.data_source || 'Agricultural Extension Database'}</p>
              <p><strong>Generated At:</strong> {new Date(herbicide.generated_at).toLocaleString()}</p>
              {herbicide.weed_pressure && (
                <p><strong>Weed Pressure Level:</strong> <span className="capitalize">{herbicide.weed_pressure}</span></p>
              )}
              {herbicide.pest_pressure && (
                <p><strong>Pest Pressure Level:</strong> <span className="capitalize">{herbicide.pest_pressure}</span></p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HerbicideSection;