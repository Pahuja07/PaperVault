// Development utilities for OneDrive dev mode
import fs from 'fs';
import path from 'path';

const DEV_UPLOADS_DIR = path.join(process.cwd(), 'dev-uploads');

// Dev download handler - serves files from local dev storage
export const devDownload = (req, res) => {
  try {
    const fileName = req.params.filename;
    const filePath = path.join(DEV_UPLOADS_DIR, 'pyp-papers', fileName);

    // Security check - prevent directory traversal
    if (!filePath.includes(DEV_UPLOADS_DIR)) {
      return res.status(403).json({ error: 'Access denied' });
    }

    // Check if file exists
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ error: 'File not found in dev storage' });
    }

    // Send file with appropriate headers
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
    
    const fileStream = fs.createReadStream(filePath);
    fileStream.pipe(res);
    
    console.log(`✅ [DEV] Served file: ${fileName}`);
  } catch (error) {
    console.error('❌ [DEV] Download error:', error);
    res.status(500).json({ error: 'Failed to download file' });
  }
};

// List files in dev storage (for debugging)
export const devListFiles = (req, res) => {
  try {
    const devFolder = path.join(DEV_UPLOADS_DIR, 'pyp-papers');
    
    if (!fs.existsSync(devFolder)) {
      return res.json({ files: [], message: 'No uploads yet' });
    }

    const files = fs.readdirSync(devFolder);
    const fileDetails = files.map(file => {
      const filePath = path.join(devFolder, file);
      const stat = fs.statSync(filePath);
      return {
        name: file,
        size: stat.size,
        created: stat.birthtime
      };
    });

    res.json({
      message: '📁 [DEV MODE] Files in local storage',
      directory: devFolder,
      files: fileDetails,
      totalFiles: fileDetails.length,
      totalSize: fileDetails.reduce((sum, f) => sum + f.size, 0)
    });
  } catch (error) {
    console.error('❌ [DEV] List files error:', error);
    res.status(500).json({ error: 'Failed to list files' });
  }
};

export default {
  devDownload,
  devListFiles
};
