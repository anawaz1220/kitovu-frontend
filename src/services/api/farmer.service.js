import api from './axios.config';

export const farmerService = {
    createFarmer: async (farmerData, farmData, affiliationData, farmerPicture, idPicture) => {
      try {
        const formData = new FormData();
        
        // Include location data in farmerData
        const farmerDataWithLocation = {
          ...farmerData,
          user_latitude: farmerData.user_latitude,
          user_longitude: farmerData.user_longitude
        };
        
        // Append JSON data
        formData.append('farmer', JSON.stringify(farmerDataWithLocation));
        formData.append('farm', JSON.stringify(farmData));
        formData.append('affiliation', JSON.stringify(affiliationData));
        
        // Append files
        formData.append('farmer_picture', farmerPicture);
        formData.append('id_document_picture', idPicture);
        
        const { data } = await api.post('/farmer', formData, {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        });
        
        return data;
      } catch (error) {
        throw error;
      }
    }
  };