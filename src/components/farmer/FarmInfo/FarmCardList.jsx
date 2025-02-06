// src/components/farmer/FarmInfo/FarmCardList.jsx
import React from 'react';
import FarmCard from './FarmCard';

const FarmCardList = ({ farms, onEdit, onDelete }) => {
  if (!farms.length) {
    return null;
  }

  return (
    <div className="mt-8">
      <h3 className="text-lg font-medium text-gray-900 mb-4">Registered Farms</h3>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {farms.map((farm, index) => (
          <FarmCard
            key={index}
            farm={farm}
            onEdit={() => onEdit(index)}
            onDelete={() => onDelete(index)}
          />
        ))}
      </div>
    </div>
  );
};

export default FarmCardList;