const os = require('os');

function getLocalIPAddress() {
  const interfaces = os.networkInterfaces();
  const addresses = [];
  
  for (const interfaceName in interfaces) {
    const interface = interfaces[interfaceName];
    
    for (const alias of interface) {
      // Skip internal (localhost) and non-IPv4 addresses
      if (alias.family === 'IPv4' && !alias.internal) {
        addresses.push({
          interface: interfaceName,
          address: alias.address,
          netmask: alias.netmask
        });
      }
    }
  }
  
  return addresses;
}

console.log('🔍 Finding your computer\'s IP addresses...\n');

const ipAddresses = getLocalIPAddress();

if (ipAddresses.length === 0) {
  console.log('❌ No network interfaces found');
} else {
  console.log('✅ Found the following IP addresses:\n');
  
  ipAddresses.forEach((ip, index) => {
    console.log(`${index + 1}. Interface: ${ip.interface}`);
    console.log(`   IP Address: ${ip.address}`);
    console.log(`   Netmask: ${ip.netmask}`);
    console.log('');
  });
  
  console.log('📝 To fix the network error in your React Native app:');
  console.log('1. Choose one of the IP addresses above (usually the first one)');
  console.log('2. Update the BASE_URL in config/api.js:');
  console.log('   BASE_URL: \'http://YOUR_IP_ADDRESS:4000\'');
  console.log('3. Make sure your backend server is running on port 4000');
  console.log('4. Ensure your device/emulator is on the same network as your computer');
  console.log('');
  console.log('💡 Common issues:');
  console.log('- If using Android emulator, try: http://10.0.2.2:4000');
  console.log('- If using iOS simulator, try: http://localhost:4000');
  console.log('- Check if your firewall is blocking port 4000');
} 