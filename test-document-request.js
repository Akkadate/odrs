/**
 * Test script for document request submission
 */
const axios = require('axios');

// API base URL
const API_URL = 'http://localhost:5001/api';

// Login credentials
const loginCredentials = {
  email: 'student@odocs.devapp.cc',
  password: 'admin123'
};

// Document request data
const requestData = {
  documentTypeId: 1, // Will be updated with actual ID from document types
  quantity: 2,
  language: 'en', // Using 'en' now that we've added it to the database enum
  deliveryMethod: 'pickup',
  documentPrice: 200,
  shippingFee: 0,
  totalPrice: 200
};

// Main test function
async function testDocumentRequest() {
  try {
    console.log('Starting document request test...');
    
    // Step 1: Login to get token
    console.log('\n1. Logging in...');
    const loginResponse = await axios.post(`${API_URL}/auth/login`, loginCredentials);
    
    if (loginResponse.data.status !== 'success') {
      throw new Error('Login failed');
    }
    
    const token = loginResponse.data.token;
    console.log('✅ Login successful');
    
    // Set auth header for subsequent requests
    const authHeader = {
      headers: {
        Authorization: `Bearer ${token}`
      }
    };
    
    // Step 2: Get document types
    console.log('\n2. Fetching document types...');
    const typesResponse = await axios.get(`${API_URL}/documents`, authHeader);
    
    if (typesResponse.data.status !== 'success' || !typesResponse.data.data.length) {
      throw new Error('Failed to fetch document types or no document types available');
    }
    
    console.log(`✅ Found ${typesResponse.data.data.length} document types`);
    
    // Use the first document type for our request
    const firstDocType = typesResponse.data.data[0];
    console.log(`Using document type: ${firstDocType.nameEn}`);
    
    // Update request data with document type ID and price
    requestData.documentTypeId = firstDocType.id;
    requestData.documentPrice = firstDocType.price * requestData.quantity;
    requestData.totalPrice = requestData.documentPrice + requestData.shippingFee;
    
    // Step 3: Create document request
    console.log('\n3. Creating document request...');
    console.log('Request data being sent:', JSON.stringify(requestData, null, 2));
    const requestResponse = await axios.post(
      `${API_URL}/requests`,
      requestData,
      authHeader
    );
    
    if (requestResponse.data.status !== 'success') {
      throw new Error('Failed to create document request');
    }
    
    const createdRequest = requestResponse.data.data;
    console.log('✅ Document request created successfully');
    console.log('Request details:');
    console.log(`- Request Number: ${createdRequest.requestNumber}`);
    console.log(`- Status: ${createdRequest.status}`);
    console.log(`- Total Price: ${createdRequest.totalPrice}`);
    
    // Step 4: Get user's requests
    console.log('\n4. Fetching user requests...');
    const userRequestsResponse = await axios.get(`${API_URL}/requests`, authHeader);
    
    if (userRequestsResponse.data.status !== 'success') {
      throw new Error('Failed to fetch user requests');
    }
    
    console.log(`✅ User has ${userRequestsResponse.data.count} requests`);
    
    console.log('\nDocument request test completed successfully!');
    return true;
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    if (error.response) {
      console.error('Response data:', error.response.data);
      console.error('Response status:', error.response.status);
    }
    return false;
  }
}

// Run the test
testDocumentRequest();