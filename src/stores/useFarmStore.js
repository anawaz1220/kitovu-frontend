// src/stores/useFarmStore.js
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const useFarmStore = create(
  persist(
    (set, get) => ({
      farms: [],
      currentFarm: null,
      editingFarmIndex: null,
      drawnPolygon: null,
      hasOverlap: false,

      addFarm: (farmData) => {
        if (get().hasOverlap) {
          throw new Error('Cannot save farm with overlapping boundaries');
        }
        set((state) => ({
          farms: [...state.farms, { ...farmData, id: Date.now().toString() }],
          currentFarm: null,
          drawnPolygon: null,
          hasOverlap: false,
        }));
      },

      updateFarm: (index, farmData) => {
        if (get().hasOverlap) {
          throw new Error('Cannot save farm with overlapping boundaries');
        }
        set((state) => {
          const updatedFarms = [...state.farms];
          updatedFarms[index] = {
            ...farmData,
            updatedAt: new Date().toISOString(),
          };
          return {
            farms: updatedFarms,
            currentFarm: null,
            editingFarmIndex: null,
            drawnPolygon: null,
            hasOverlap: false,
          };
        });
      },

      setDrawnPolygon: (polygon) => set({ drawnPolygon: polygon }),
      setEditingFarm: (index) => {
        const farm = get().farms[index];
        set({
          editingFarmIndex: index,
          currentFarm: farm,
          drawnPolygon: farm?.geometry.coordinates[0][0],
        });
      },

      resetFarmState: () => set({
        currentFarm: null,
        editingFarmIndex: null,
        drawnPolygon: null,
        hasOverlap: false,
      }),

      deleteFarm: (index) => set((state) => ({
        farms: state.farms.filter((_, i) => i !== index),
        ...(state.editingFarmIndex === index ? {
          editingFarmIndex: null,
          currentFarm: null,
          drawnPolygon: null,
        } : {})
      })),

      setHasOverlap: (hasOverlap) => set({ hasOverlap }),
    }),
    {
      name: 'farm-storage',
    }
  )
);

export default useFarmStore;