// src/constants/farmerFormConstants.js

export const GENDER_OPTIONS = [
  { value: 'male', label: 'Male' },
  { value: 'female', label: 'Female' }
];

export const ID_TYPE_OPTIONS = [
  { value: 'national_id', label: 'National ID' },
  { value: 'voters_card', label: "Voter's Card" },
  { value: 'drivers_license', label: "Driver's License" },
  { value: 'international_passport', label: 'International Passport' }
];

export const EDUCATION_OPTIONS = [
  { value: 'no_formal_education', label: 'No Formal Education' },
  { value: 'primary', label: 'Primary' },
  { value: 'junior_secondary', label: 'Junior Secondary' },
  { value: 'senior_secondary', label: 'Senior Secondary' },
  { value: 'technical_vocational', label: 'Technical & Vocational' },
  { value: 'undergraduate_programs', label: 'Undergraduate Programs' },
  { value: 'master_s_degree', label: "Master's Degree" },
  { value: 'doctorate_degree', label: 'Doctorate Degree' }
];

export const ABIA_LGA_OPTIONS = [
  { value: 'aba_north', label: 'Aba North' },
  { value: 'aba_south', label: 'Aba South' },
  { value: 'arochukwu', label: 'Arochukwu' },
  { value: 'bende', label: 'Bende' },
  { value: 'ikwuano', label: 'Ikwuano' },
  { value: 'isiala_ngwa_north', label: 'Isiala-Ngwa North' },
  { value: 'isiala_ngwa_south', label: 'Isiala-Ngwa South' },
  { value: 'isuikwato', label: 'Isuikwato' },
  { value: 'obi_nwa', label: 'Obi Nwa' },
  { value: 'ohafia', label: 'Ohafia' },
  { value: 'osisioma_ngwa', label: 'Osisioma Ngwa' },
  { value: 'ugwunagbo', label: 'Ugwunagbo' },
  { value: 'ukwa_east', label: 'Ukwa East' },
  { value: 'ukwa_west', label: 'Ukwa West' },
  { value: 'umuahia_north', label: 'Umuahia North' },
  { value: 'umuahia_south', label: 'Umuahia South' },
  { value: 'umu_neochi', label: 'Umu-Neochi' }
];

export const FARM_TYPE_OPTIONS = [
  { value: 'crop_farming', label: 'Crop Farming' },
  { value: 'livestock_farming', label: 'Livestock Farming' },
  { value: 'mixed_farming', label: 'Mixed Farming' }
];

export const OWNERSHIP_STATUS_OPTIONS = [
  { value: 'owned', label: 'Owned' },
  { value: 'leased', label: 'Leased' }
];

export const LIVESTOCK_TYPES = [
  { value: 'cattle', label: 'Cattle' },
  { value: 'goats', label: 'Goats' },
  { value: 'sheep', label: 'Sheep' },
  { value: 'turkeys', label: 'Turkeys' },
  { value: 'chickens', label: 'Chickens' },
  { value: 'ducks', label: 'Ducks' },
  { value: 'guinea_fowls', label: 'Guinea Fowls' },
  { value: 'goose', label: 'Goose' },
  { value: 'pig_breeds', label: 'Pig Breeds' },
  { value: 'catfish', label: 'Catfish' },
  { value: 'tilapia', label: 'Tilapia' },
  { value: 'mackerel', label: 'Mackerel' },
  { value: 'prawn_shrimp', label: 'Prawn & Shrimp' },
  { value: 'rabbits', label: 'Rabbits' },
  { value: 'grasscutters', label: 'Grasscutters' },
  { value: 'snails', label: 'Snails' },
  { value: 'honeybees', label: 'Honeybees' }
];

export const CROP_TYPES = [
  { value: 'rice', label: 'Rice' },
  { value: 'maize', label: 'Maize' },
  { value: 'sorghum', label: 'Sorghum' },
  { value: 'millet', label: 'Millet' },
  { value: 'wheat', label: 'Wheat' },
  { value: 'cassava', label: 'Cassava' },
  { value: 'yam', label: 'Yam' },
  { value: 'sweet_potato', label: 'Sweet Potato' },
  { value: 'cocoyam', label: 'Cocoyam' },
  { value: 'cowpea', label: 'Cowpea' },
  { value: 'beans', label: 'Beans' },
  { value: 'groundnut', label: 'Groundnut' },
  { value: 'soybean', label: 'Soybean' },
  { value: 'bambara_nut', label: 'Bambara Nut' },
  { value: 'palm_oil', label: 'Palm Oil' },
  { value: 'coconut', label: 'Coconut' },
  { value: 'sesame_seed', label: 'Sesame Seed' },
  { value: 'sunflower', label: 'Sunflower' },
  { value: 'irish_potato', label: 'Irish Potato' },
  { value: 'cocoa', label: 'Cocoa' },
  { value: 'cotton', label: 'Cotton' },
  { value: 'coffee', label: 'Coffee' },
  { value: 'tea', label: 'Tea' },
  { value: 'kolanut', label: 'Kolanut' },
  { value: 'rubber', label: 'Rubber' },
  { value: 'tomato', label: 'Tomato' },
  { value: 'pepper', label: 'Pepper' },
  { value: 'onion', label: 'Onion' },
  { value: 'okra', label: 'Okra' },
  { value: 'cabbage', label: 'Cabbage' },
  { value: 'carrot', label: 'Carrot' },
  { value: 'cucumber', label: 'Cucumber' },
  { value: 'lettuce', label: 'Lettuce' },
  { value: 'mango', label: 'Mango' },
  { value: 'banana', label: 'Banana' },
  { value: 'plantain', label: 'Plantain' },
  { value: 'pineapple', label: 'Pineapple' },
  { value: 'orange', label: 'Orange' },
  { value: 'lemon', label: 'Lemon' },
  { value: 'lime', label: 'Lime' },
  { value: 'grapefruit', label: 'Grapefruit' },
  { value: 'pawpaw', label: 'Pawpaw' },
  { value: 'guava', label: 'Guava' },
  { value: 'cashew', label: 'Cashew' },
  { value: 'ginger', label: 'Ginger' },
  { value: 'garlic', label: 'Garlic' },
  { value: 'turmeric', label: 'Turmeric' },
  { value: 'bitter_leaf', label: 'Bitter Leaf' },
  { value: 'scent_leaf', label: 'Scent Leaf' },
  { value: 'sugarcane', label: 'Sugarcane' },
  { value: 'watermelon', label: 'Watermelon' },
  { value: 'mellon', label: 'Mellon' },
  { value: 'pumpkin_leave', label: 'Pumpkin Leave' },
  { value: 'waterleaf', label: 'Waterleaf' },
  { value: 'green', label: 'Green' },
  { value: 'utazi_leaf', label: 'Utazi Leaf' },
  { value: 'uziza', label: 'Uziza' },
  { value: 'pigeon_pea', label: 'Pigeon Pea' }
];

export const COOPERATIVE_ACTIVITIES = [
  { value: 'group_farming', label: 'Group Farming' },
  { value: 'bulk_purchasing_of_inputs', label: 'Bulk Purchasing of Inputs' },
  { value: 'joint_marketing', label: 'Joint Marketing' },
  { value: 'storage_facilities', label: 'Storage Facilities' },
  { value: 'processing_activities', label: 'Processing Activities' },
  { value: 'training_capacity_building', label: 'Training & Capacity Building' },
  { value: 'financial_services', label: 'Financial Services' },
  { value: 'other', label: 'Other' }
];

export const MARKETING_CHANNEL_OPTIONS = [
  { value: 'open_market', label: 'Open Market' },
  { value: 'informal_buyer_individual', label: 'Informal Buyer/Individual' },
  { value: 'offtaker', label: 'Offtaker' }
];