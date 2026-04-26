import 'dotenv/config'

// Development mode flag
export const DEV_MODE = process.env.ONEDRIVE_DEV_MODE === 'true' || !process.env.ONEDRIVE_REFRESH_TOKEN;

if (DEV_MODE) {
  console.log('⚠️ ONEDRIVE: Running in DEVELOPMENT MODE (local file storage)');
  console.log('💡 To use real OneDrive, set ONEDRIVE_REFRESH_TOKEN in .env');
}

// Microsoft Graph API configuration for OneDrive
export const onedriveConfig = {
  clientId: process.env.ONEDRIVE_CLIENT_ID || 'dev-client-id',
  clientSecret: process.env.ONEDRIVE_CLIENT_SECRET || 'dev-secret',
  tenantId: process.env.ONEDRIVE_TENANT_ID || 'dev-tenant',
  refreshToken: process.env.ONEDRIVE_REFRESH_TOKEN || 'dev-refresh-token',
  scope: 'https://graph.microsoft.com/Files.ReadWrite AppFolder',
  redirectUri: process.env.ONEDRIVE_REDIRECT_URI || 'http://localhost:8000/auth/onedrive/callback',
  devMode: DEV_MODE
};

// Base URL for Microsoft Graph API
export const GRAPH_API_BASE = 'https://graph.microsoft.com/v1.0';

// OneDrive folder for storing papers
export const PAPERS_FOLDER = 'pyp-papers';
