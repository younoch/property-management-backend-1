const axios = require('axios');

const API_BASE_URL = 'http://localhost:3000/api';

async function testFeedback() {
  try {
    // Test unauthenticated feedback
    console.log('Testing unauthenticated feedback submission...');
    const unauthenticatedResponse = await axios.post(`${API_BASE_URL}/feedback`, {
      message: 'This is a test feedback from an unauthenticated user',
      user_email: 'anonymous@example.com',
      page_url: 'http://localhost:3000/test-page',
    });
    console.log('Unauthenticated feedback submitted successfully:', unauthenticatedResponse.data);

    // Test authenticated feedback (you'll need a valid user ID and token)
    console.log('\nTesting authenticated feedback submission...');
    const authenticatedResponse = await axios.post(
      `${API_BASE_URL}/feedback`,
      {
        user_id: 1, // Replace with a valid user ID
        message: 'This is a test feedback from an authenticated user',
        user_email: 'user@example.com', // Replace with a valid user email
        page_url: 'http://localhost:3000/dashboard',
      },
      {
        headers: {
          // Add your auth token here if needed
          // 'Authorization': 'Bearer your-token-here',
        },
      }
    );
    console.log('Authenticated feedback submitted successfully:', authenticatedResponse.data);

    // Test getting all feedback (admin only)
    console.log('\nTesting feedback retrieval...');
    const feedbackList = await axios.get(`${API_BASE_URL}/feedback`, {
      headers: {
        // Add admin auth token here
        // 'Authorization': 'Bearer admin-token-here',
      },
    });
    console.log('Feedback list retrieved successfully:', feedbackList.data);
  } catch (error) {
    console.error('Error testing feedback:', error.response?.data || error.message);
  }
}

testFeedback();
