import express from 'express';
import { devDownload, devListFiles } from '../controllers/dev.controller.js';

const router = express.Router();

// Dev mode routes - only available in development
if (process.env.ONEDRIVE_DEV_MODE === 'true') {
  // Download file from dev storage
  router.get('/download/:filename', devDownload);
  
  // List all uploaded files (debugging)
  router.get('/files/list', devListFiles);
  
  // Info endpoint
  router.get('/info', (req, res) => {
    res.json({
      mode: '🛠️ DEVELOPMENT MODE',
      message: 'OneDrive integration is running in development mode',
      details: {
        fileStorage: 'Local file system (dev-uploads/pyp-papers/)',
        uploadsBehavior: 'Files saved locally instead of Azure OneDrive',
        downloads: 'Served from local storage',
        note: 'Switch to production mode by setting ONEDRIVE_DEV_MODE=false and providing real ONEDRIVE_REFRESH_TOKEN'
      },
      endpoints: {
        download: '/dev/download/:filename',
        listFiles: '/dev/files/list',
        info: '/dev/info'
      }
    });
  });
}

export default router;
