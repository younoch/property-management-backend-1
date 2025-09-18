const axios = require('axios');

async function testNotifications() {
  try {
    console.log('Testing notifications endpoint...');
    
    // Test GET /notifications
    const response = await axios.get('http://localhost:8000/notifications');
    console.log('GET /notifications response:', response.data);
  } catch (error) {
    console.log('Error testing notifications:', error.response?.data || error.message);
  }
}

testNotifications(); 