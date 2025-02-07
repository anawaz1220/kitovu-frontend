export const formatFullAddress = (addressData) => {
    const {
      address, // street address
      community,
      state,
      lga,
      city
    } = addressData;
  
    // Filter out empty/undefined values
    const addressParts = [
      address,
      community,
      city,
      lga,
      state
    ].filter(part => part && part.trim());
  
    // Join with commas
    return addressParts.join(', ');
  };