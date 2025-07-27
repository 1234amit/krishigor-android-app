// Debug script for image upload testing
const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');

// Test the API endpoint directly
async function testImageUpload() {
  // Create a simple test image file
  const testImagePath = './test-image.png';
  const testImageData = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==', 'base64');
  fs.writeFileSync(testImagePath, testImageData);
  
  const formData = new FormData();
  formData.append('userId', '68794c218ec0b80d4a7c4562');
  formData.append('image', fs.createReadStream(testImagePath), {
    filename: 'test.png',
    contentType: 'image/png'
  });
  
  console.log('Testing with FormData:', {
    userId: '68794c218ec0b80d4a7c4562',
    imageFile: testImagePath
  });
  
  try {
    const response = await axios.put('http://192.168.0.102:4000/api/v1/profile/image', formData, {
      headers: {
        ...formData.getHeaders(),
        'Content-Type': 'multipart/form-data'
      }
    });
    
    console.log('Success:', response.data);
  } catch (error) {
    console.log('Error:', error.response?.data || error.message);
  } finally {
    // Clean up test file
    if (fs.existsSync(testImagePath)) {
      fs.unlinkSync(testImagePath);
    }
  }
}

testImageUpload(); 