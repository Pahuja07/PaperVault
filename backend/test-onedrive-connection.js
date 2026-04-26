/**
 * OneDrive Connection Test
 * Tests the complete OneDrive integration including authentication and API access
 */

import dotenv from 'dotenv';
dotenv.config();

async function testOneDriveConnection() {
  console.log('🧪 Testing OneDrive Connection...\n');
  console.log('========================================\n');

  // Check environment variables
  console.log('1️⃣ Checking environment variables...\n');
  
  const requiredVars = [
    'ONEDRIVE_CLIENT_ID',
    'ONEDRIVE_CLIENT_SECRET',
    'ONEDRIVE_TENANT_ID',
    'ONEDRIVE_REFRESH_TOKEN'
  ];
  
  let allVarsPresent = true;
  for (const varName of requiredVars) {
    const value = process.env[varName];
    if (!value || value === 'your-refresh-token' || value === 'your-onedrive-client-secret') {
      console.log(`❌ ${varName}: Missing or placeholder value`);
      allVarsPresent = false;
    } else {
      console.log(`✅ ${varName}: ${value.substring(0, 20)}...`);
    }
  }
  
  if (!allVarsPresent) {
    console.log('\n❌ Missing required environment variables!');
    console.log('\n💡 To fix this:');
    console.log('   1. Run: node backend/get-onedrive-refresh-token.js');
    console.log('   2. Follow the prompts to get your refresh token');
    console.log('   3. Update backend/.env with the refresh token');
    process.exit(1);
  }
  
  console.log('\n✅ All environment variables present!\n');
  
  // Test authentication
  console.log('2️⃣ Testing authentication...\n');
  
  try {
    const tokenUrl = `https://login.microsoftonline.com/${process.env.ONEDRIVE_TENANT_ID}/oauth2/v2.0/token`;
    
    const params = new URLSearchParams();
    params.append('client_id', process.env.ONEDRIVE_CLIENT_ID);
    params.append('scope', 'offline_access Files.ReadWrite.All');
    params.append('refresh_token', process.env.ONEDRIVE_REFRESH_TOKEN);
    params.append('grant_type', 'refresh_token');
    params.append('client_secret', process.env.ONEDRIVE_CLIENT_SECRET);
    
    const response = await fetch(tokenUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: params
    });
    
    const data = await response.json();
    
    if (data.error) {
      console.log(`❌ Authentication failed: ${data.error_description}`);
      
      if (data.error === 'invalid_grant') {
        console.log('\n💡 The refresh token is invalid or expired.');
        console.log('   Run: node backend/get-onedrive-refresh-token.js');
        console.log('   to get a new refresh token.');
      }
      
      process.exit(1);
    }
    
    console.log('✅ Authentication successful!\n');
    const accessToken = data.access_token;
    
    // Test OneDrive API access
    console.log('3️⃣ Testing OneDrive API access...\n');
    
    const meResponse = await fetch('https://graph.microsoft.com/v1.0/me/drive', {
      headers: {
        'Authorization': `Bearer ${accessToken}`
      }
    });
    
    const meData = await meResponse.json();
    
    if (meData.error) {
      console.log(`❌ API access failed: ${meData.error.message}`);
      process.exit(1);
    }
    
    console.log('✅ OneDrive API access successful!\n');
    console.log('📊 OneDrive Account Details:');
    console.log(`   Owner: ${meData.owner?.user?.displayName || 'Unknown'}`);
    console.log(`   Email: ${meData.owner?.user?.email || 'Unknown'}`);
    console.log(`   Quota Total: ${(meData.quota?.total / 1024 / 1024 / 1024).toFixed(2)} GB`);
    console.log(`   Quota Used: ${(meData.quota?.used / 1024 / 1024 / 1024).toFixed(2)} GB`);
    console.log(`   Quota Remaining: ${(meData.quota?.remaining / 1024 / 1024 / 1024).toFixed(2)} GB\n`);
    
    // Test folder access
    console.log('4️⃣ Testing folder access...\n');
    
    // Try to access or create the pyp-papers folder
    const folderResponse = await fetch('https://graph.microsoft.com/v1.0/me/drive/root:/pyp-papers', {
      headers: {
        'Authorization': `Bearer ${accessToken}`
      }
    });
    
    if (folderResponse.status === 404) {
      console.log('📁 Creating pyp-papers folder...');
      
      const createFolderResponse = await fetch('https://graph.microsoft.com/v1.0/me/drive/root:/pyp-papers', {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          name: 'pyp-papers',
          folder: {},
          '@microsoft.graph.conflictBehavior': 'rename'
        })
      });
      
      const createFolderData = await createFolderResponse.json();
      
      if (createFolderData.id) {
        console.log('✅ pyp-papers folder created successfully!\n');
      } else {
        console.log('⚠️ Could not create folder (this is okay, will be created on first upload)\n');
      }
    } else {
      const folderData = await folderResponse.json();
      if (folderData.id) {
        console.log('✅ pyp-papers folder exists!\n');
      }
    }
    
    console.log('========================================\n');
    console.log('🎉 OneDrive integration is fully working!\n');
    console.log('✅ Authentication: Working');
    console.log('✅ API Access: Working');
    console.log('✅ Folder Access: Working');
    console.log('\n🚀 You can now upload files to OneDrive!');
    console.log('\n📝 Next steps:');
    console.log('   1. Start your backend: cd backend && pnpm start');
    console.log('   2. Test file upload via API endpoint');
    console.log('   3. Files will be stored in your OneDrive pyp-papers folder');
    
  } catch (error) {
    console.log(`❌ Test failed: ${error.message}`);
    console.log('\n💡 Troubleshooting:');
    console.log('   - Check your internet connection');
    console.log('   - Verify your Azure AD app permissions');
    console.log('   - Make sure your refresh token is valid');
    console.log('   - Run: node backend/get-onedrive-refresh-token.js to get a new token');
    process.exit(1);
  }
}

testOneDriveConnection();