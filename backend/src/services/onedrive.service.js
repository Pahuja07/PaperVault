import fs from 'fs';
import { onedriveConfig, GRAPH_API_BASE, PAPERS_FOLDER, DEV_MODE } from '../config/onedrive.js';
import * as devService from './onedrive.service.dev.js';

// Get access token using refresh token
async function getAccessToken() {
  // Return dev mock token if in dev mode
  if (DEV_MODE) {
    return devService.getAccessToken();
  }

  try {
    const tokenResponse = await fetch(`https://login.microsoftonline.com/${onedriveConfig.tenantId}/oauth2/v2.0/token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        client_id: onedriveConfig.clientId,
        client_secret: onedriveConfig.clientSecret,
        refresh_token: onedriveConfig.refreshToken,
        grant_type: 'refresh_token',
        scope: onedriveConfig.scope
      })
    });

    const tokenData = await tokenResponse.json();
    
    if (!tokenResponse.ok) {
      throw new Error(`Failed to get access token: ${tokenData.error_description || tokenData.error}`);
    }

    return tokenData.access_token;
  } catch (error) {
    console.error('Error getting access token:', error);
    throw new Error('Authentication failed: ' + error.message);
  }
}

// Ensure the papers folder exists in OneDrive
async function ensurePapersFolder(accessToken) {
  // Use dev mode folder creation if in dev mode
  if (DEV_MODE) {
    return devService.ensurePapersFolder(accessToken);
  }

  try {
    // Check if folder exists
    const checkResponse = await fetch(`${GRAPH_API_BASE}/me/drive/special/appfolder:/${PAPERS_FOLDER}`, {
      headers: {
        'Authorization': `Bearer ${accessToken}`
      }
    });

    if (checkResponse.ok) {
      return await checkResponse.json(); // Folder exists
    }

    // Create folder if it doesn't exist
    const createResponse = await fetch(`${GRAPH_API_BASE}/me/drive/special/appfolder/children`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        name: PAPERS_FOLDER,
        folder: {},
        '@microsoft.graph.conflictBehavior': 'ignore'
      })
    });

    if (!createResponse.ok) {
      throw new Error('Failed to create papers folder');
    }

    return await createResponse.json();
  } catch (error) {
    console.error('Error ensuring papers folder:', error);
    throw error;
  }
}

// Upload file to OneDrive
export const uploadToOneDrive = async (filePath, fileName) => {
  // Use dev mode upload if in dev mode
  if (DEV_MODE) {
    return devService.uploadToOneDrive(filePath, fileName);
  }

  try {
    console.log('Uploading to OneDrive:', filePath);
    
    // Get access token
    const accessToken = await getAccessToken();
    
    // Ensure papers folder exists
    const folder = await ensurePapersFolder(accessToken);
    
    // Read file
    const fileBuffer = fs.readFileSync(filePath);
    
    // Upload file to OneDrive
    const uploadUrl = `${GRAPH_API_BASE}/me/drive/special/appfolder:/${PAPERS_FOLDER}/${fileName}:/content`;
    
    const uploadResponse = await fetch(uploadUrl, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/octet-stream'
      },
      body: fileBuffer
    });

    if (!uploadResponse.ok) {
      const errorData = await uploadResponse.text();
      throw new Error(`Upload failed: ${uploadResponse.status} ${errorData}`);
    }

    const uploadedFile = await uploadResponse.json();
    
    // Get shareable link
    const shareResponse = await fetch(`${GRAPH_API_BASE}/me/drive/items/${uploadedFile.id}/createLink`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        type: 'view',
        scope: 'anonymous'
      })
    });

    if (!shareResponse.ok) {
      throw new Error('Failed to create share link');
    }

    const shareData = await shareResponse.json();
    const downloadUrl = shareData.link.webUrl;

    console.log('OneDrive upload successful:', downloadUrl);
    
    // Clean up local file
    fs.unlinkSync(filePath);
    
    return downloadUrl;
    
  } catch (error) {
    console.error('OneDrive upload failed:', error);
    
    // Clean up local file even if upload fails
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
    
    throw new Error('Failed to upload to OneDrive: ' + error.message);
  }
};

// Delete file from OneDrive
export const deleteFromOneDrive = async (fileUrl) => {
  // Use dev mode delete if in dev mode
  if (DEV_MODE) {
    return devService.deleteFromOneDrive(fileUrl);
  }

  try {
    // Extract file ID from URL (this is a simplified approach)
    // In production, you'd store the file ID separately
    const accessToken = await getAccessToken();
    
    // This is a placeholder - you'd need to implement proper file ID extraction
    // or store the OneDrive file ID in your database
    console.log('OneDrive delete functionality needs file ID implementation');
    
  } catch (error) {
    console.error('OneDrive delete failed:', error);
    throw error;
  }
};
