// src/components/farmer/FarmInfo/index.jsx
import React, { useState } from 'react';
import { useFormContext } from 'react-hook-form';
import FarmForm from './FarmForm';
import FarmMap from './FarmMap';
import FarmCardList from './FarmCardList';

const FarmInfo = () => {
  const { reset, getValues, setValue } = useFormContext();
  const [farms, setFarms] = useState([]);
  const [currentArea, setCurrentArea] = useState(0);
  const [currentGeometry, setCurrentGeometry] = useState(null);
  const [editingFarmIndex, setEditingFarmIndex] = useState(null);
  const [drawnPolygon, setDrawnPolygon] = useState(null);
  const [hasOverlap, setHasOverlap] = useState(false);

  const handlePolygonUpdate = (polygonData) => {
    setDrawnPolygon(polygonData.coordinates);
    setCurrentGeometry(polygonData.multiPolygon);
    setHasOverlap(polygonData.hasOverlap);
  };

  const handleSaveFarm = (farmData, addAnother = false) => {
    // Require both form data and drawn boundary
    if (!currentGeometry) {
      alert('Please draw the farm boundary on the map.');
      return;
    }

    if (hasOverlap) {
      alert('Please adjust the farm boundary to avoid overlap with existing farms.');
      return;
    }

    const newFarm = {
      ...farmData,
      area: currentArea,
      geometry: {
        type: 'MultiPolygon',
        coordinates: [[drawnPolygon]] // Format for MultiPolygon
      }
    };

    if (editingFarmIndex !== null) {
      // Update existing farm
      const updatedFarms = [...farms];
      updatedFarms[editingFarmIndex] = newFarm;
      setFarms(updatedFarms);
      setEditingFarmIndex(null);
    } else {
      // Add new farm
      setFarms([...farms, newFarm]);
    }

    // Reset form if not adding another
    if (!addAnother) {
      reset();
      setCurrentArea(0);
      setCurrentGeometry(null);
      setDrawnPolygon(null);
    }
  };

  const handleEditFarm = (index) => {
    const farm = farms[index];
    setEditingFarmIndex(index);
    setDrawnPolygon(farm.geometry.coordinates[0][0]);
    setCurrentArea(farm.area);
    
    // Set form values
    Object.entries(farm).forEach(([key, value]) => {
      if (key !== 'geometry') {
        setValue(key, value);
      }
    });
  };

  const handleDeleteFarm = (index) => {
    if (window.confirm('Are you sure you want to delete this farm?')) {
      setFarms(farms.filter((_, i) => i !== index));
      if (editingFarmIndex === index) {
        setEditingFarmIndex(null);
        setDrawnPolygon(null);
        setCurrentArea(0);
        reset();
      }
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-gray-900">Farm Information</h2>
        <p className="mt-1 text-sm text-gray-600">
          Add details about the farm including location, ownership, and farm boundary.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <FarmForm
          onSave={handleSaveFarm}
          currentArea={currentArea}
          editingFarm={editingFarmIndex !== null ? farms[editingFarmIndex] : null}
          hasDrawnBoundary={!!currentGeometry}
        />
        <FarmMap
          onAreaUpdate={setCurrentArea}
          existingFarms={farms}
          currentPolygon={drawnPolygon}
          onPolygonUpdate={handlePolygonUpdate}
          editMode={editingFarmIndex !== null}
        />
      </div>

      <FarmCardList
        farms={farms}
        onEdit={handleEditFarm}
        onDelete={handleDeleteFarm}
      />
    </div>
  );
};

export default FarmInfo;