import axios from 'axios';

class BigQueryPatentFetcher {
  async fetchPatentData(patentNumber) {
    try {
      const response = await axios.post('http://localhost:3001/api/fetch-patent', { patentNumber });
      return response.data;
    } catch (error) {
      console.error('Error fetching patent data:', error);
      throw error;
    }
  }
}

export default BigQueryPatentFetcher;