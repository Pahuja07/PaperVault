# 🚀 Quick Start: Azure OneDrive Upload Implementation

## ✨ What's Already Set Up

Your backend already has:
- ✅ OneDrive service with upload/download functions
- ✅ Paper controller integrated with OneDrive
- ✅ Multer middleware configured for PDF uploads
- ✅ Authentication middleware (Admin only)
- ✅ Automatic file cleanup after upload
- ✅ Shareable link generation

---

## 🎯 Implementation Checklist

### Phase 1: Azure Setup (20 minutes)
- [ ] Go to [portal.azure.com](https://portal.azure.com)
- [ ] Register new app named "PYP-Files-OneDrive"
- [ ] Copy Client ID and Tenant ID (already in your .env ✅)
- [ ] Create Client Secret → Save to `ONEDRIVE_CLIENT_SECRET`
- [ ] Add API permissions: Files.ReadWrite, Files.ReadWrite.All, Sites.ReadWrite
- [ ] Grant admin consent

### Phase 2: Get Refresh Token (10 minutes)
- [ ] Visit [oauthplayboard.azurewebsites.net](https://oauthplayboard.azurewebsites.net)
- [ ] Authorize your Microsoft account
- [ ] Get refresh token → Save to `ONEDRIVE_REFRESH_TOKEN`
- [ ] **Test that token works**

### Phase 3: Update Configuration (5 minutes)
- [ ] Update `backend/.env` with:
  - [ ] `ONEDRIVE_CLIENT_SECRET`
  - [ ] `ONEDRIVE_REFRESH_TOKEN`
- [ ] Verify all other .env values

### Phase 4: Test Upload (10 minutes)
- [ ] Start backend: `pnpm start`
- [ ] Create test JWT token
- [ ] Use cURL or Postman to upload PDF
- [ ] Verify file appears on OneDrive
- [ ] Verify shareable link works

### Phase 5: Frontend Integration (Optional)
- [ ] Update upload form to include new fields
- [ ] Display OneDrive link to users
- [ ] Show upload progress

---

## 📋 Complete .env Template

```env
# ============ CORE CONFIGURATION ============
DATABASE_URL=postgresql://JAZZ:lilu123@localhost:5448/FILES
JWT_SECRET=your-secret-key-change-this-in-production
PORT=8000

# ============ EMAIL CONFIGURATION ============
EMAIL_USER=jatinnpahuja112@gmail.com
EMAIL_PASSWORD=hsne loqi ehsj zlrf

---

## 🧪 Testing with cURL

### 1. Create Admin User (if needed)

```bash
# First, create a user account and get JWT token
curl -X POST http://localhost:8000/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@example.com",
    "password": "admin123"
  }'

# Response will contain: JWT_TOKEN
```

### 2. Upload Paper to OneDrive

```bash
curl -X POST http://localhost:8000/papers \
  -H "Authorization: Bearer JWT_TOKEN_HERE" \
  -F "file=@./sample-paper.pdf" \
  -F "title=Calculus Midterm 2024" \
  -F "semester=5" \
  -F "examtype=Midterm" \
  -F "difficulty=Hard" \
  -F "year=2024" \
  -F "departmentid=1" \
  -F "subjectid=1"
```

### 3. Response Example

```json
{
  "message": "Paper Uploaded",
  "inserted": [
    {
      "paperid": 1,
      "title": "Calculus Midterm 2024"
    }
  ]
}
```

### 4. Download Paper

```bash
curl -X GET http://localhost:8000/papers/1/download \
  -L  # Follow redirects
```

This will redirect to the OneDrive shareable link.

---

## 🌐 Testing with Postman

### Setup Collection

1. **Create new Postman Collection**: "PYP File System"
2. **Set Variables**:
   - `base_url`: `http://localhost:8000`
   - `jwt_token`: Your JWT token
   - `paper_id`: 1

### Request 1: Upload Paper

```
POST {{base_url}}/papers
Authorization: Bearer {{jwt_token}}

Form Data:
- file: [Select PDF file]
- title: Calculus Final Exam
- semester: 5
- examtype: Final
- difficulty: Medium
- year: 2024
- departmentid: 1
- subjectid: 1
```

### Request 2: Download Paper

```
GET {{base_url}}/papers/{{paper_id}}/download
Authorization: Bearer {{jwt_token}}
```

---

## 🛠️ Troubleshooting Steps

### Step 1: Check .env File

```bash
cd backend
cat .env  # Verify credentials are filled in
```

✅ Should see:
```
ONEDRIVE_CLIENT_SECRET=your-actual-secret
ONEDRIVE_REFRESH_TOKEN=your-actual-token
```

### Step 2: Check OneDrive Permissions

1. Go to [portal.azure.com](https://portal.azure.com)
2. App registrations → Your app
3. API permissions → Verify these are granted:
   - ✅ Files.ReadWrite
   - ✅ Files.ReadWrite.All
   - ✅ Sites.ReadWrite

### Step 3: Test Token Refresh

Create `backend/test-token.js`:

```javascript
import { onedriveConfig, GRAPH_API_BASE } from './src/config/onedrive.js';

async function testToken() {
  try {
    console.log('Testing token refresh...');
    console.log('Client ID:', onedriveConfig.clientId);
    console.log('Tenant ID:', onedriveConfig.tenantId);
    
    const response = await fetch(
      `https://login.microsoftonline.com/${onedriveConfig.tenantId}/oauth2/v2.0/token`,
      {
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
      }
    );

    const data = await response.json();
    
    if (response.ok) {
      console.log('✅ Token refresh successful!');
      console.log('Access token:', data.access_token.substring(0, 50) + '...');
    } else {
      console.error('❌ Token refresh failed!');
      console.error('Error:', data.error_description || data.error);
    }
  } catch (error) {
    console.error('Error:', error.message);
  }
}

testToken();
```

Run:
```bash
node backend/test-token.js
```

### Step 4: Check File Upload

Create test PDF and verify:

```bash
# Verify multer is working
ls -la backend/uploads/

# Should contain temp files before OneDrive upload
```

---

## 🎨 Frontend Integration (React)

Update your upload form in `pyp-website/src/pages/Upload/Upload.jsx`:

```jsx
import { useState } from 'react';
import api from '../../services/api';

export default function Upload() {
  const [file, setFile] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    semester: '',
    examtype: '',
    difficulty: '',
    year: '',
    departmentid: '',
    subjectid: ''
  });
  const [loading, setLoading] = useState(false);
  const [oneDriveUrl, setOneDriveUrl] = useState('');

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!file) {
      alert('Please select a PDF file');
      return;
    }

    setLoading(true);
    
    try {
      const data = new FormData();
      data.append('file', file);
      data.append('title', formData.title);
      data.append('semester', formData.semester);
      data.append('examtype', formData.examtype);
      data.append('difficulty', formData.difficulty);
      data.append('year', formData.year);
      data.append('departmentid', formData.departmentid);
      data.append('subjectid', formData.subjectid);

      const response = await api.post('/papers', data, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      setOneDriveUrl(response.data.fileUrl);
      alert('✅ Paper uploaded successfully to OneDrive!');
      
      // Reset form
      setFile(null);
      setFormData({
        title: '',
        semester: '',
        examtype: '',
        difficulty: '',
        year: '',
        departmentid: '',
        subjectid: ''
      });
    } catch (error) {
      console.error('Upload failed:', error);
      alert('❌ Upload failed: ' + error.response?.data?.error || error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="upload-container">
      <form onSubmit={handleSubmit}>
        <input
          type="file"
          accept=".pdf"
          onChange={handleFileChange}
          required
        />
        
        <input
          type="text"
          name="title"
          placeholder="Paper Title"
          value={formData.title}
          onChange={handleInputChange}
          required
        />
        
        <input
          type="number"
          name="semester"
          placeholder="Semester"
          value={formData.semester}
          onChange={handleInputChange}
          required
        />
        
        <select name="examtype" value={formData.examtype} onChange={handleInputChange} required>
          <option value="">Select Exam Type</option>
          <option value="Midterm">Midterm</option>
          <option value="Final">Final</option>
          <option value="Quiz">Quiz</option>
        </select>
        
        <select name="difficulty" value={formData.difficulty} onChange={handleInputChange} required>
          <option value="">Select Difficulty</option>
          <option value="Easy">Easy</option>
          <option value="Medium">Medium</option>
          <option value="Hard">Hard</option>
        </select>
        
        <input
          type="number"
          name="year"
          placeholder="Year"
          value={formData.year}
          onChange={handleInputChange}
          required
        />
        
        <input
          type="number"
          name="departmentid"
          placeholder="Department ID"
          value={formData.departmentid}
          onChange={handleInputChange}
          required
        />
        
        <input
          type="number"
          name="subjectid"
          placeholder="Subject ID"
          value={formData.subjectid}
          onChange={handleInputChange}
          required
        />
        
        <button type="submit" disabled={loading}>
          {loading ? 'Uploading...' : 'Upload to OneDrive'}
        </button>
      </form>

      {oneDriveUrl && (
        <div className="success-message">
          <h3>✅ File uploaded successfully!</h3>
          <p>OneDrive Link: <a href={oneDriveUrl} target="_blank">{oneDriveUrl}</a></p>
        </div>
      )}
    </div>
  );
}
```

---

## 📚 File Structure Summary

```
backend/
├── src/
│   ├── services/
│   │   └── onedrive.service.js      ← Upload/download logic
│   ├── config/
│   │   └── onedrive.js               ← OneDrive credentials
│   ├── controllers/
│   │   └── paper.controller.js       ← Upload endpoint
│   ├── routes/
│   │   └── paper.routes.js           ← API routes
│   └── middlewares/
│       └── upload.middleware.js      ← Multer configuration
├── .env                              ← YOUR CREDENTIALS HERE
└── uploads/                          ← Temp folder (auto-cleanup)
```

---

## ✅ Success Checklist

After completing setup:

- [ ] .env file has real Client Secret
- [ ] .env file has real Refresh Token
- [ ] Backend starts without errors
- [ ] Token refresh works (test-token.js)
- [ ] Can upload PDF file via API
- [ ] File appears in OneDrive
- [ ] Shareable link works
- [ ] Download endpoint works
- [ ] Frontend shows OneDrive link

---

## 🎉 You're Done!

Your file sharing system now has:
- ✅ Cloud storage on OneDrive
- ✅ Automatic backups
- ✅ Shareable links
- ✅ Database metadata
- ✅ Scalable architecture

**All files are now stored securely in Azure OneDrive!** 🚀
