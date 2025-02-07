// src/components/farmer/FarmInfo/index.jsx
import React from 'react';
import { Card } from '../../ui/card';
import MapSection from './components/MapSection';
import FarmList from './components/FarmList';
import useFarmStore from '../../../stores/useFarmStore';

const FarmInfo = () => {
  const { farms } = useFarmStore();

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-gray-900">Farm Information</h2>
        <p className="mt-1 text-sm text-gray-600">
          Draw your farm boundaries on the map and provide details about each farm.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Map Section - Takes up 2/3 of the space on larger screens */}
        <div className="lg:col-span-2">
          <Card className="h-[600px]">
            <MapSection />
          </Card>
        </div>

        {/* Farm List Section - Takes up 1/3 of the space */}
        <div className="lg:col-span-1">
          <Card className="h-[600px] overflow-auto">
            <FarmList farms={farms} />
          </Card>
        </div>
      </div>
    </div>
  );
};

export default FarmInfo;