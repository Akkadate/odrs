import api from '../utils/api';

// Service for managing document requests
const requestService = {
  /**
   * Fetch all document types
   * @returns {Promise} Promise object represents the document types
   */
  getDocumentTypes: async () => {
    try {
      const response = await api.get('/documents');
      return response.data;
    } catch (error) {
      console.error('Error fetching document types:', error);
      throw error;
    }
  },

  /**
   * Create a new document request
   * @param {Object} requestData - The request data
   * @returns {Promise} Promise object represents the created request
   */
  createRequest: async (requestData) => {
    try {
      const response = await api.post('/requests', requestData);
      return response.data;
    } catch (error) {
      console.error('Error creating request:', error);
      throw error;
    }
  },

  /**
   * Get all requests for the current user
   * @returns {Promise} Promise object represents the user's requests
   */
  getMyRequests: async () => {
    try {
      const response = await api.get('/requests');
      return response.data;
    } catch (error) {
      console.error('Error fetching requests:', error);
      throw error;
    }
  },

  /**
   * Get a single request by ID
   * @param {string} requestId - The request ID
   * @returns {Promise} Promise object represents the request
   */
  getRequest: async (requestId) => {
    try {
      const response = await api.get(`/requests/${requestId}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching request ${requestId}:`, error);
      throw error;
    }
  },

  /**
   * Submit payment for a request
   * @param {string} requestId - The request ID
   * @param {Object} paymentData - The payment data
   * @returns {Promise} Promise object represents the payment result
   */
  submitPayment: async (requestId, paymentData) => {
    try {
      // Create form data for file upload
      const formData = new FormData();
      
      // Add payment proof file
      if (paymentData.paymentProof) {
        formData.append('paymentProof', paymentData.paymentProof);
      }
      
      // Add other payment data
      formData.append('paymentMethod', paymentData.paymentMethod);
      if (paymentData.notes) {
        formData.append('notes', paymentData.notes);
      }
      
      const response = await api.post(`/requests/${requestId}/payment`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      
      return response.data;
    } catch (error) {
      console.error(`Error submitting payment for request ${requestId}:`, error);
      throw error;
    }
  },

  /**
   * Cancel a request
   * @param {string} requestId - The request ID
   * @param {string} reason - The cancellation reason
   * @returns {Promise} Promise object represents the cancellation result
   */
  cancelRequest: async (requestId, reason) => {
    try {
      const response = await api.put(`/requests/${requestId}/cancel`, { reason });
      return response.data;
    } catch (error) {
      console.error(`Error cancelling request ${requestId}:`, error);
      throw error;
    }
  },

  /**
   * Get all requests (admin/staff only)
   * @param {Object} params - Query parameters (page, limit, status, etc.)
   * @returns {Promise} Promise object represents all requests
   */
  getAllRequests: async (params = {}) => {
    try {
      const response = await api.get('/requests/all', { params });
      return response.data;
    } catch (error) {
      console.error('Error fetching all requests:', error);
      throw error;
    }
  },

  /**
   * Update request status (admin/staff only)
   * @param {string} requestId - The request ID
   * @param {Object} updateData - The update data (status, notes, trackingNumber)
   * @returns {Promise} Promise object represents the update result
   */
  updateRequestStatus: async (requestId, updateData) => {
    try {
      const response = await api.put(`/requests/${requestId}/status`, updateData);
      return response.data;
    } catch (error) {
      console.error(`Error updating status for request ${requestId}:`, error);
      throw error;
    }
  }
};

export default requestService;