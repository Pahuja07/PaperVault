/**
 * OneDrive Refresh Token Generator
 * 
 * This script helps you get a refresh token from Microsoft OAuth.
 * Since OAuth requires user interaction, this provides the URL to authorize
 * and instructions to get the token.
 */

import dotenv from 'dotenv';
import readline from 'readline';

dotenv.config();

const CLIENT_ID = process.env.ONEDRIVE_CLIENT_ID;
const CLIENT_SECRET = process.env.ONEDRIVE_CLIENT_SECRET;
const TENANT_ID = process.env.ONEDRIVE_TENANT_ID;
const REDIRECT_URI = process.env.ONEDRIVE_REDIRECT_URI;

console.log('🔐 OneDrive Refresh Token Generator\n');
console.log('========================================\n');

// Step 1: Show authorization URL
console.log('📋 STEP 1: Authorize Application\n');
console.log('Copy and paste this URL into your browser:\n');
console.log(`https://login.microsoftonline.com/${TENANT_ID}/oauth2/v2.0/authorize?`);
console.log(`client_id=${CLIENT_ID}&`);
console.log(`response_type=code&`);
console.log(`redirect_uri=${encodeURIComponent(REDIRECT_URI)}&`);
console.log(`response_mode=query&`);
console.log(`scope=offline_access%20Files.ReadWrite.All&`);
console.log(`state=12345\n`);

console.log('After you authorize, you\'ll be redirected to a URL like:');
console.log(`${REDIRECT_URI}?code=AUTH_CODE_HERE&state=12345\n`);
console.log('Copy the "code" parameter value.\n');

// Step 2: Get authorization code from user
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

rl.question('📝 Paste the authorization code here: ', (authCode) => {
  console.log('\n🔑 STEP 2: Exchanging code for tokens...\n');
  
  // Step 3: Exchange code for tokens
  const tokenUrl = `https://login.microsoftonline.com/${TENANT_ID}/oauth2/v2.0/token`;
  
  const params = new URLSearchParams();
  params.append('client_id', CLIENT_ID);
  params.append('scope', 'offline_access Files.ReadWrite.All');
  params.append('code', authCode.trim());
  params.append('redirect_uri', REDIRECT_URI);
  params.append('grant_type', 'authorization_code');
  params.append('client_secret', CLIENT_SECRET);
  
  fetch(tokenUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    body: params
  })
  .then(response => response.json())
  .then(data => {
    if (data.error) {
      console.error('❌ Error:', data.error_description || data.error);
      console.log('\n💡 Tips:');
      console.log('   - Make sure the code is correct and not expired');
      console.log('   - Codes expire quickly (usually 5 minutes)');
      console.log('   - Try the authorization process again');
      process.exit(1);
    }
    
    console.log('✅ Success! Tokens received:\n');
    console.log('📎 Access Token (short-lived):');
    console.log(`   ${data.access_token.substring(0, 50)}...\n`);
    
    console.log('🔑 REFRESH TOKEN (save this!):');
    console.log(`   ${data.refresh_token}\n`);
    
    console.log('========================================\n');
    console.log('📝 NEXT STEPS:\n');
    console.log('1. Copy the refresh token above');
    console.log('2. Open backend/.env file');
    console.log('3. Replace ONEDRIVE_REFRESH_TOKEN=your-refresh-token');
    console.log('   with:');
    console.log(`   ONEDRIVE_REFRESH_TOKEN=${data.refresh_token}\n`);
    console.log('4. Run: node backend/test-onedrive-connection.js\n');
    
    // Ask if user wants to update .env automatically
    rl.question('💾 Do you want me to update your .env file automatically? (y/n): ', (answer) => {
      if (answer.toLowerCase() === 'y' || answer.toLowerCase() === 'yes') {
        const fs = require('fs');
        const envPath = './backend/.env';
        
        let envContent = fs.readFileSync(envPath, 'utf8');
        envContent = envContent.replace(
          /ONEDRIVE_REFRESH_TOKEN=.*/,
          `ONEDRIVE_REFRESH_TOKEN=${data.refresh_token}`
        );
        
        fs.writeFileSync(envPath, envContent);
        console.log('✅ .env file updated successfully!\n');
        console.log('🧪 Now run: node backend/test-onedrive-connection.js\n');
      } else {
        console.log('📝 Please update .env manually as described above.\n');
      }
      
      rl.close();
    });
  })
  .catch(error => {
    console.error('❌ Error:', error.message);
    process.exit(1);
  });
});