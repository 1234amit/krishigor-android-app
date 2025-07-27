// Script to add test images to Android emulator
const fs = require('fs');
const path = require('path');

console.log('=== Test Images Setup ===');
console.log('');
console.log('To add test images to your Android emulator, follow these steps:');
console.log('');
console.log('1. Open Android Studio');
console.log('2. Go to Device Manager');
console.log('3. Click on your emulator (three dots menu)');
console.log('4. Select "Open Device File Manager"');
console.log('5. Navigate to /sdcard/Download/');
console.log('6. Drag and drop these test images from your computer:');
console.log('');

// List available test images
const testImages = [
  'assets/images/Logo.png',
  'assets/images/test-profile.png',
  'assets/images/onboard1.jpg',
  'assets/images/onboard2.jpg',
  'assets/images/onboard3.jpg'
];

testImages.forEach(imagePath => {
  if (fs.existsSync(imagePath)) {
    console.log(`   ✓ ${imagePath}`);
  } else {
    console.log(`   ✗ ${imagePath} (not found)`);
  }
});

console.log('');
console.log('Alternative method using ADB (if available):');
console.log('1. Open command prompt/terminal');
console.log('2. Navigate to your project directory');
console.log('3. Run: adb push assets/images/Logo.png /sdcard/Download/');
console.log('');
console.log('After adding images, you can test profile image upload by:');
console.log('1. Opening the app');
console.log('2. Going to Profile screen');
console.log('3. Tapping the edit icon on the profile picture');
console.log('4. Selecting "Gallery"');
console.log('5. Choosing one of the test images you added');
console.log('');
console.log('The app should now be able to pick and upload the image!'); 