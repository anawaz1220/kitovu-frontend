// src/components/dashboard/FarmerSearch.jsx
import React, { useState, useEffect, useRef } from 'react';
import { Search, Loader2 } from 'lucide-react';
import { farmerQueryService } from '../../services/api/farmerQuery.service';
import { useQuery } from '@tanstack/react-query';

const FarmerSearch = ({ onSelectFarmer }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef(null);
  
  // Fetch farmers data
  const { data: farmers, isLoading, isError, error } = useQuery({
    queryKey: ['farmers'],
    queryFn: () => farmerQueryService.getFarmers(),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Filter farmers based on search term
  const filteredFarmers = farmers && searchTerm
    ? farmers.filter(farmer => 
        `${farmer.first_name} ${farmer.last_name}`
          .toLowerCase()
          .includes(searchTerm.toLowerCase())
      )
    : [];

  // Handle click outside of dropdown to close it
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleInputChange = (e) => {
    setSearchTerm(e.target.value);
    setShowDropdown(true);
  };

  const handleSelectFarmer = (farmer) => {
    setSearchTerm(`${farmer.first_name} ${farmer.last_name}`);
    setShowDropdown(false);
    onSelectFarmer(farmer);
  };

  return (
    <div className="p-4 border-b">
      <div className="flex items-center mb-3">
        <Search className="h-5 w-5 text-kitovu-purple mr-2" />
        <h3 className="text-md font-medium">Search Farmer</h3>
      </div>
      
      <div className="relative" ref={dropdownRef}>
        <div className="relative">
          <input
            type="text"
            className="w-full form-input pl-8 text-sm"
            placeholder="Search by name..."
            value={searchTerm}
            onChange={handleInputChange}
            onFocus={() => setShowDropdown(true)}
          />
          <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          {isLoading && (
            <Loader2 className="absolute right-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 animate-spin" />
          )}
        </div>
        
        {showDropdown && (
          <div className="absolute z-30 w-full mt-1 bg-white border rounded-md shadow-lg max-h-64 overflow-y-auto">
            {isLoading ? (
              <div className="p-2 text-center text-sm text-gray-500">
                Loading farmers...
              </div>
            ) : isError ? (
              <div className="p-2 text-center text-sm text-red-500">
                Error: {error?.message || 'Failed to load farmers'}
              </div>
            ) : filteredFarmers.length > 0 ? (
              filteredFarmers.map((farmer) => (
                <div
                  key={farmer.id}
                  className="p-2 hover:bg-gray-100 cursor-pointer text-sm"
                  onClick={() => handleSelectFarmer(farmer)}
                >
                  {farmer.first_name} {farmer.last_name}
                </div>
              ))
            ) : searchTerm ? (
              <div className="p-2 text-center text-sm text-gray-500">
                No farmers found
              </div>
            ) : (
              <div className="p-2 text-center text-sm text-gray-500">
                Type to search farmers
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default FarmerSearch;