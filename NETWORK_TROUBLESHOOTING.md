# Network Troubleshooting Guide

## Problem
You're experiencing "Network Error" when trying to add items to cart or perform other API operations in your React Native app.

## Root Cause
The app is trying to connect to `localhost:4000` which doesn't work on mobile devices or emulators. Mobile devices need to connect to your computer's actual IP address.

## Solution

### 1. Update API Configuration
Your API configuration has been updated to use your computer's IP address: `192.168.0.101:4000`

### 2. Verify Backend Server
Make sure your backend server is running on port 4000:
```bash
# Check if your server is running
netstat -an | findstr :4000
```

### 3. Test Network Connectivity
Use the network diagnostics feature in the app:
- Go to Cart screen
- Tap the WiFi icon in the header
- This will test your connection and provide diagnostics

### 4. Common Issues and Solutions

#### Issue: "Cannot connect to server"
**Solutions:**
- Ensure your backend server is running
- Check if port 4000 is not blocked by firewall
- Verify your device/emulator is on the same network as your computer

#### Issue: "Authentication failed"
**Solutions:**
- Make sure you're logged in with valid credentials
- Check if your JWT token is valid
- Try logging out and logging back in

#### Issue: "Request timed out"
**Solutions:**
- Check your internet connection
- Try again (the app now has automatic retry functionality)
- Check if your server is responding slowly

### 5. Development Environment Setup

#### For Physical Device Testing:
1. Connect your device to the same WiFi network as your computer
2. Use your computer's IP address: `http://192.168.0.101:4000`
3. Make sure your backend server is accessible from other devices

#### For Android Emulator:
- Use: `http://10.0.2.2:4000`
- This is the special IP that Android emulator uses to access host machine

#### For iOS Simulator:
- Use: `http://localhost:4000`
- iOS simulator can access localhost directly

### 6. Enhanced Error Handling
The app now includes:
- **Automatic retry**: Failed requests are automatically retried
- **Network diagnostics**: Built-in tools to diagnose connection issues
- **Better error messages**: More specific error messages for different failure types
- **Auto-detection**: Can automatically find working API URLs

### 7. Testing Your Setup

#### Quick Test:
1. Start your backend server
2. Open the app
3. Go to Cart screen
4. Tap the WiFi icon for network diagnostics
5. If connection fails, the app will suggest alternative URLs

#### Manual Test:
```bash
# Test if your server is reachable
curl http://192.168.0.101:4000/health

# Test from your device/emulator
curl http://YOUR_IP:4000/health
```

### 8. Firewall Configuration
If you're still having issues, check your firewall:

#### Windows:
1. Open Windows Defender Firewall
2. Allow your Node.js/backend application through the firewall
3. Allow port 4000 for incoming connections

#### macOS:
```bash
sudo pfctl -f /etc/pf.conf
```

### 9. Alternative Solutions

#### If IP address changes frequently:
1. Use a static IP address for your development machine
2. Or update the IP in `config/api.js` when it changes
3. Use the auto-detection feature in the app

#### If server is on different port:
1. Update the port in `config/api.js`
2. Make sure your backend server is configured for that port

### 10. Production Deployment
When deploying to production:
1. Update `BASE_URL` in `config/api.js` to your production domain
2. Ensure your production server is accessible
3. Test all API endpoints

## Quick Fix Commands

```bash
# Find your IP address
node find-ip.js

# Test server connectivity
curl http://192.168.0.101:4000/health

# Check if port is open
netstat -an | findstr :4000
```

## Support
If you're still experiencing issues:
1. Check the console logs for detailed error messages
2. Use the network diagnostics feature in the app
3. Verify your backend server logs for any errors
4. Ensure your device and computer are on the same network 