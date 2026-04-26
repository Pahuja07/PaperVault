// Development mode OneDrive service (uses local storage instead of Azure)
import fs from 'fs';
import path from 'path';

const DEV_UPLOADS_DIR = path.join(process.cwd(), 'dev-uploads');

// Ensure dev uploads directory exists
if (!fs.existsSync(DEV_UPLOADS_DIR)) {
  fs.mkdirSync(DEV_UPLOADS_DIR, { recursive: true });
}

// Mock access token getter for development
async function getAccessToken() {
  console.log('⚠️ [DEV MODE] Using mock access token');
  return 'mock-access-token-' + Date.now();
}

// Mock folder creation for development
async function ensurePapersFolder(accessToken) {
  const devFolder = path.join(DEV_UPLOADS_DIR, 'pyp-papers');
  if (!fs.existsSync(devFolder)) {
    fs.mkdirSync(devFolder, { recursive: true });
    console.log('✅ [DEV] Created pyp-papers folder');
  }
  return { id: 'dev-folder', name: 'pyp-papers' };
}

// Mock upload to local storage for development
export const uploadToOneDrive = async (filePath, fileName) => {
  try {
    console.log('📤 [DEV MODE] Uploading to local storage:', filePath);
    
    // Create destination path
    const devFolder = path.join(DEV_UPLOADS_DIR, 'pyp-papers');
    const destPath = path.join(devFolder, fileName);
    
    // Copy file to dev uploads
    fs.copyFileSync(filePath, destPath);
    console.log('✅ [DEV] File copied to:', destPath);
    
    // Generate mock shareable URL
    const mockUrl = `http://localhost:8000/dev/download/${fileName}?mock=true`;
    console.log('🔗 [DEV] Mock shareable URL:', mockUrl);
    
    // Clean up local temp file
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
    
    return mockUrl;
    
  } catch (error) {
    console.error('❌ [DEV] Upload failed:', error);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
    throw new Error('Failed to upload to local storage: ' + error.message);
  }
};

// Mock delete for development
export const deleteFromOneDrive = async (fileUrl) => {
  try {
    console.log('🗑️ [DEV] Deleting mock file:', fileUrl);
    // In dev mode, just log the action
    return true;
  } catch (error) {
    console.error('❌ [DEV] Delete failed:', error);
    throw error;
  }
};

// Export for dev mode
export { getAccessToken, ensurePapersFolder };
