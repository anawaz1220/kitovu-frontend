// src/components/dashboard/FarmerSearch.jsx
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Search, Loader2, X } from 'lucide-react';
import { searchFarmers } from '../../services/api/farmerQuery.service.js';

const FarmerSearch = ({ onSelectFarmer }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  
  const dropdownRef = useRef(null);
  const searchTimeoutRef = useRef(null);
  const abortControllerRef = useRef(null);

  // Debounced search function
  const performSearch = useCallback(async (query) => {
    // Cancel previous request if still pending
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    // Don't search if query is too short
    if (!query || query.length < 2) {
      setSearchResults([]);
      setIsLoading(false);
      setError(null);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      // Create new abort controller for this request
      abortControllerRef.current = new AbortController();
      
      console.log('Searching for farmers:', query);
      const results = await searchFarmers(query);
      
      // Only update state if the request wasn't aborted
      if (!abortControllerRef.current.signal.aborted) {
        setSearchResults(results);
        console.log(`Found ${results.length} farmers`);
      }
    } catch (err) {
      // Only set error if the request wasn't aborted
      if (!abortControllerRef.current.signal.aborted) {
        console.error('Error searching farmers:', err);
        setError('Failed to search farmers');
        setSearchResults([]);
      }
    } finally {
      // Only update loading state if the request wasn't aborted
      if (!abortControllerRef.current.signal.aborted) {
        setIsLoading(false);
      }
    }
  }, []);

  // Handle input change with debouncing
  const handleInputChange = (e) => {
    const value = e.target.value;
    setSearchTerm(value);
    setShowDropdown(true);

    // Clear existing timeout
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    // Set new timeout for debounced search
    searchTimeoutRef.current = setTimeout(() => {
      performSearch(value);
    }, 500); // 500ms debounce
  };

  // Handle farmer selection
  const handleSelectFarmer = (farmer) => {
    console.log('Selected farmer:', farmer);
    setSearchTerm(farmer.display_name);
    setShowDropdown(false);
    setSearchResults([]);
    onSelectFarmer(farmer);
  };

  // Clear search
  const handleClearSearch = () => {
    setSearchTerm('');
    setSearchResults([]);
    setShowDropdown(false);
    setError(null);
    
    // Cancel any pending search
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
  };

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

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

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
            className="w-full form-input pl-8 pr-8 text-sm"
            placeholder="Type farmer name (min 2 chars)..."
            value={searchTerm}
            onChange={handleInputChange}
            onFocus={() => {
              if (searchResults.length > 0 || isLoading) {
                setShowDropdown(true);
              }
            }}
          />
          
          {/* Search icon */}
          <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          
          {/* Loading indicator */}
          {isLoading && (
            <Loader2 className="absolute right-8 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 animate-spin" />
          )}
          
          {/* Clear button */}
          {searchTerm && (
            <button
              onClick={handleClearSearch}
              className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
        
        {/* Dropdown with search results */}
        {showDropdown && (
          <div className="absolute z-30 w-full mt-1 bg-white border rounded-md shadow-lg max-h-64 overflow-y-auto">
            {isLoading ? (
              <div className="p-3 text-center text-sm text-gray-500">
                <div className="flex items-center justify-center">
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Searching farmers...
                </div>
              </div>
            ) : error ? (
              <div className="p-3 text-center text-sm text-red-500">
                {error}
              </div>
            ) : searchTerm.length > 0 && searchTerm.length < 2 ? (
              <div className="p-3 text-center text-sm text-gray-500">
                Type at least 2 characters to search
              </div>
            ) : searchResults.length > 0 ? (
              searchResults.map((farmer) => (
                <div
                  key={farmer.farmer_id}
                  className="p-3 hover:bg-gray-100 cursor-pointer border-b border-gray-100 last:border-b-0"
                  onClick={() => handleSelectFarmer(farmer)}
                >
                  <div className="text-sm font-medium text-gray-900">
                    {farmer.display_name}
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    {farmer.phone_number}
                  </div>
                </div>
              ))
            ) : searchTerm.length >= 2 ? (
              <div className="p-3 text-center text-sm text-gray-500">
                No farmers found for "{searchTerm}"
              </div>
            ) : (
              <div className="p-3 text-center text-sm text-gray-500">
                Start typing to search farmers
              </div>
            )}
          </div>
        )}
      </div>
      
      {/* Show helpful text when no search term */}
      {!searchTerm && (
        <div className="mt-2 text-xs text-gray-500">
          Search by farmer name to view details and farms
        </div>
      )}
    </div>
  );
};

export default FarmerSearch;