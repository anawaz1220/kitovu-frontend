// src/services/api/community.service.js
import { getFarmers } from './farmerQuery.service';
import farmService from './farms.service';

// Cache objects to avoid repeated API calls
let cachedFarmers = null;
let cachedFarms = null;

/**
 * Get unique communities (street addresses) from all farmers
 * @returns {Promise<Array>} - Array of unique community names
 */
const getCommunities = async () => {
  try {
    // Use cached farmers if available, otherwise fetch them
    if (!cachedFarmers) {
      cachedFarmers = await getFarmers();
      console.log(`Loaded ${cachedFarmers.length} farmers for community options`);
    }
    
    // Extract unique street addresses (communities)
    const communities = cachedFarmers
      .map(farmer => farmer.street_address)
      .filter(address => address && address.trim() !== '') // Filter out empty values
      .filter((value, index, self) => self.indexOf(value) === index) // Get unique values
      .sort(); // Sort alphabetically
    
    console.log(`Found ${communities.length} unique communities`);
    return communities;
  } catch (error) {
    console.error('Error fetching communities:', error);
    throw error;
  }
};

/**
 * Get farms belonging to farmers from a specific community
 * @param {string} community - Street address/community to filter by
 * @returns {Promise<Array>} - Array of farm objects in the specified community
 */
const getFarmsByCommunitity = async (community) => {
  try {
    if (!community) {
      console.warn('Community parameter is required');
      return [];
    }
    
    console.log(`Looking for farms in community: ${community}`);
    
    // Use cached data or fetch if not available
    if (!cachedFarmers) {
      cachedFarmers = await getFarmers();
      console.log(`Loaded ${cachedFarmers.length} farmers`);
    }
    
    if (!cachedFarms) {
      cachedFarms = await farmService.getFarms();
      console.log(`Loaded ${cachedFarms.length} farms`);
    }
    
    // Filter farmers by community
    const communityFarmers = cachedFarmers.filter(farmer => 
      farmer.street_address === community
    );
    
    console.log(`Found ${communityFarmers.length} farmers in community "${community}"`);
    
    if (communityFarmers.length === 0) {
      return [];
    }
    
    // Log first few farmers to see their structure
    if (communityFarmers.length > 0) {
      console.log('Example farmer from this community:', communityFarmers[0]);
    }
    
    // Try matching with different farmer ID fields
    let communityFarms = [];
    
    // Create maps of farmer IDs to check for matches
    const farmerIdMap = {};
    const farmerFarmerIdMap = {};
    
    // Extract both potential ID fields
    communityFarmers.forEach(farmer => {
      if (farmer.id) {
        farmerIdMap[farmer.id] = true;
      }
      if (farmer.farmer_id) {
        farmerFarmerIdMap[farmer.farmer_id] = true;
      }
    });
    
    console.log(`Using ${Object.keys(farmerIdMap).length} farmer IDs and ${Object.keys(farmerFarmerIdMap).length} farmer_id values for matching`);
    
    // Try matching using id field
    const farmsById = cachedFarms.filter(farm => 
      farmerIdMap[farm.farmer_id]
    );
    
    // Try matching using farmer_id field
    const farmsByFarmerId = cachedFarms.filter(farm => 
      farmerFarmerIdMap[farm.farmer_id]
    );
    
    console.log(`Found ${farmsById.length} farms matching by id and ${farmsByFarmerId.length} farms matching by farmer_id`);
    
    // Use the matching method that found farms
    if (farmsById.length > 0) {
      communityFarms = farmsById;
    } else if (farmsByFarmerId.length > 0) {
      communityFarms = farmsByFarmerId;
    }
    
    // If still no farms found, log sample data for debugging
    if (communityFarms.length === 0 && cachedFarms.length > 0) {
      console.log('No matches found. Sample farm data:', cachedFarms[0]);
      
      // Try a different approach - check if the farm ID might be in a different format
      // For example, some APIs might use strings vs numbers or different case sensitivity
      const allFarmerIds = communityFarmers.map(farmer => 
        farmer.id && farmer.id.toString().toLowerCase()
      ).filter(Boolean);
      
      const allFarmerFarmerIds = communityFarmers.map(farmer => 
        farmer.farmer_id && farmer.farmer_id.toString().toLowerCase()
      ).filter(Boolean);
      
      console.log(`Checking with normalized IDs: ${allFarmerIds.length} farmer IDs and ${allFarmerFarmerIds.length} farmer_id values`);
      
      // Try a more lenient matching approach
      communityFarms = cachedFarms.filter(farm => {
        const farmerId = farm.farmer_id && farm.farmer_id.toString().toLowerCase();
        return allFarmerIds.includes(farmerId) || allFarmerFarmerIds.includes(farmerId);
      });
      
      console.log(`Found ${communityFarms.length} farms with normalized ID matching`);
    }
    
    console.log(`Total matching farms for community "${community}": ${communityFarms.length}`);
    return communityFarms;
  } catch (error) {
    console.error('Error fetching farms by community:', error);
    throw error;
  }
};

/**
 * Clear the cache - useful when data might have changed
 */
const clearCache = () => {
  cachedFarmers = null;
  cachedFarms = null;
  console.log('Community service cache cleared');
};

// Export functions
const communityService = {
  getCommunities,
  getFarmsByCommunitity,
  clearCache
};

export default communityService;