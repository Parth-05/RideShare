// redux/api/axiosBaseQuery.js
import api from '../../services/axiosInstance';

export const axiosBaseQuery =
  () =>
  async ({ url, method, data, params }) => {
    try {
      const response = await api({
        url,
        method,
        data,
        params,
      });
      return { data: response.data };
    } catch (error) {
      return {
        error: {
          status: error.response?.status || 500,
          data: error.response?.data || error.message,
        },
      };
    }
  };
