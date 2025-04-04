/**
 * Direct login test for ODRS
 */
const axios = require('axios');

// Define the login credentials
const credentials = {
  email: 'staff@odocs.devapp.cc',
  password: 'admin123'
};

// Define the login URL
const loginUrl = 'http://localhost:5001/api/auth/login'; 

async function testLogin() {
  try {
    console.log(`Testing login with email: ${credentials.email}`);
    
    const response = await axios.post(loginUrl, credentials);
    
    console.log('Login successful!');
    console.log('User data:', response.data.user);
    console.log('Token:', response.data.token.substring(0, 20) + '...');
    
    return response.data;
  } catch (error) {
    console.error('Login failed:', error.message);
    
    if (error.response) {
      console.error('Response data:', error.response.data);
      console.error('Response status:', error.response.status);
      console.error('Response headers:', error.response.headers);
    } else if (error.request) {
      console.error('No response received. Is the server running?');
    }
    
    throw error;
  }
}

// Run the test
testLogin()
  .then(() => console.log('Test completed'))
  .catch(() => console.log('Test failed'));