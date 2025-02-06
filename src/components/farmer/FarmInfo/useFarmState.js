// src/components/farmer/FarmInfo/hooks/useFarmState.js
import { useState, useEffect } from 'react';

const STORAGE_KEY = 'draft_farms';

export const useFarmState = () => {
  // State for all farms (both saved and current)
  const [farms, setFarms] = useState(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved) : [];
  });
  
  // State for currently editing farm
  const [currentFarm, setCurrentFarm] = useState(null);
  
  // State for tracking edit mode
  const [editingFarmIndex, setEditingFarmIndex] = useState(null);

  // State for currently drawn/edited geometry
  const [currentGeometry, setCurrentGeometry] = useState(null);

  // State for overlap detection
  const [hasOverlap, setHasOverlap] = useState(false);

  // Persist farms to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(farms));
  }, [farms]);

  const addFarm = (farmData) => {
    if (hasOverlap) {
      throw new Error('Cannot save farm with overlapping boundaries');
    }

    const newFarm = {
      ...farmData,
      geometry: currentGeometry,
      createdAt: new Date().toISOString()
    };

    setFarms(prev => [...prev, newFarm]);
    setCurrentFarm(null);
    setCurrentGeometry(null);
    setHasOverlap(false);
  };

  const updateFarm = (index, farmData) => {
    if (hasOverlap) {
      throw new Error('Cannot save farm with overlapping boundaries');
    }

    setFarms(prev => {
      const updated = [...prev];
      updated[index] = {
        ...farmData,
        geometry: currentGeometry || prev[index].geometry,
        updatedAt: new Date().toISOString()
      };
      return updated;
    });
    
    setCurrentFarm(null);
    setCurrentGeometry(null);
    setEditingFarmIndex(null);
    setHasOverlap(false);
  };

  const deleteFarm = (index) => {
    setFarms(prev => prev.filter((_, i) => i !== index));
    
    if (editingFarmIndex === index) {
      setEditingFarmIndex(null);
      setCurrentFarm(null);
      setCurrentGeometry(null);
    }
  };

  const startEditing = (index) => {
    const farmToEdit = farms[index];
    setEditingFarmIndex(index);
    setCurrentFarm(farmToEdit);
    setCurrentGeometry(farmToEdit.geometry);
  };

  const cancelEditing = () => {
    setEditingFarmIndex(null);
    setCurrentFarm(null);
    setCurrentGeometry(null);
    setHasOverlap(false);
  };

  const updateCurrentGeometry = (geometry, hasOverlap) => {
    setCurrentGeometry(geometry);
    setHasOverlap(hasOverlap);
  };

  const clearStorage = () => {
    localStorage.removeItem(STORAGE_KEY);
    setFarms([]);
    setCurrentFarm(null);
    setCurrentGeometry(null);
    setEditingFarmIndex(null);
    setHasOverlap(false);
  };

  return {
    // State
    farms,
    currentFarm,
    currentGeometry,
    editingFarmIndex,
    hasOverlap,

    // Actions
    addFarm,
    updateFarm,
    deleteFarm,
    startEditing,
    cancelEditing,
    updateCurrentGeometry,
    clearStorage,

    // Setters
    setCurrentFarm,
  };
};