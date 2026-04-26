# File Sharing System - Setup Guide

## Overview
This is a complete file sharing system with:
- Backend: Node.js/Express API with PostgreSQL (via Docker)
- Frontend: React/Vite with Tailwind CSS
- OneDrive Integration: Files uploaded to OneDrive
- Syllabus: SKIT JAIPUR curriculum support

---

## Prerequisites
- Node.js (v18+)
- Docker & Docker Compose
- OneDrive Account (for file storage)

---

## Backend Setup

### 1. Start PostgreSQL via Docker
```bash
cd backend/src
docker-compose up -d
```

### 2. Configure Environment Variables
Create/Update `backend/.env`:
```
# Database
DATABASE_URL=postgresql://JAZZ:lilu123@localhost:5448/FILES

# JWT
JWT_SECRET=your-super-secret-jwt-key-change-in-production

# Email (for OTP)
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-specific-password

# OneDrive
ONEDRIVE_CLIENT_ID=your-onedrive-client-id
ONEDRIVE_CLIENT_SECRET=your-client-secret
ONEDRIVE_TENANT_ID=your-tenant-id
ONEDRIVE_REFRESH_TOKEN=your-refresh-token
ONEDRIVE_REDIRECT_URI=http://localhost:8000/auth/onedrive/callback

# Server
PORT=8000
```

### 3. Install Dependencies
```bash
cd backend
pnpm install
```

### 4. Push Database Schema
```bash
pnpm db:push
```

### 5. Start Backend Server
```bash
pnpm start
```

The backend will be running at `http://localhost:8000`

---

## Frontend Setup

### 1. Install Dependencies
```bash
cd pyp-website/pyp-website
pnpm install
```

### 2. Configure Environment Variables
Create `.env`:
```
VITE_API_URL=http://localhost:8000
VITE_APP_NAME=PYP Website
```

### 3. Start Development Server
```bash
pnpm dev
```

The frontend will be running at `http://localhost:5173`

---

## API Routes

### User Routes (`/user`)
- `POST /user/signup` - Register new user
- `POST /user/login` - Login user
- `POST /user/forgotpassword` - Request password reset
- `POST /user/verify-otp` - Verify OTP
- `POST /user/reset-password` - Reset password

### Department Routes (`/department`)
- `GET /department` - Get all departments
- `GET /department/:id` - Get department by ID
- `GET /department/search?q=search` - Search departments
- `POST /department` - Create department (Admin only)
- `DELETE /department/:id` - Delete department (Admin only)

### Subject Routes (`/subject`)
- `GET /subject` - Get all subjects
- `GET /subject/:id` - Get subject by ID
- `POST /subject` - Create subject (Admin only)
- `DELETE /subject/:id` - Delete subject (Admin only)

### Paper Routes (`/papers`)
- `GET /papers` - Get all papers
- `GET /papers/all` - Get all papers with filtering
  - Query params: `title`, `departmentid`, `year`, `semester`, `examtype`, `difficulty`
- `GET /papers/:id` - Get paper by ID
- `GET /papers/:id/download` - Download paper from OneDrive
- `POST /papers/upload` - Upload paper (Authenticated, multipart/form-data)
  - Required fields: `title`, `departmentid`, `semester`, `year`, `examtype`, `subjectid`, `file`
  - Optional: `difficulty`
- `DELETE /papers/:id` - Delete paper (Admin only)

---

## Features

### ✅ User Authentication
- Sign up with email and password
- Login with JWT tokens
- Password recovery via OTP
- Role-based access control (Student/Admin)

### ✅ Paper Management
- Upload PDFs to OneDrive
- Search and filter papers by:
  - Department
  - Semester
  - Year
  - Exam Type
  - Difficulty Level
  - Title/Keywords

### ✅ OneDrive Integration
- Files stored securely on OneDrive
- Shareable download links
- Automatic cleanup on deletion

### ✅ Database
- PostgreSQL with Drizzle ORM
- Automated migrations with `drizzle-kit`
- Proper foreign keys and constraints

---

## SKIT JAIPUR Curriculum

### Departments Supported
- **CSE** - Computer Science Engineering
- **ECE** - Electronics & Communication Engineering
- **ME** - Mechanical Engineering
- **CE** - Civil Engineering
- **EEE** - Electrical Engineering
- **IT** - Information Technology
- **BCA** - Bachelor of Computer Applications
- **MBA** - Master of Business Administration

### Semesters
- Semesters 1-8 supported for all departments

### Exam Types
- End Semester
- Mid Semester
- Quiz
- Assignment

### Difficulty Levels
- Easy
- Medium
- Hard

---

## Troubleshooting

### Backend crashes on startup
- Check PostgreSQL is running: `docker ps`
- Verify `DATABASE_URL` in `.env`
- Ensure `JWT_SECRET` is set
- Run: `pnpm db:push` to create tables

### Can't upload files
- Verify OneDrive credentials in `.env`
- Check JWT token is valid
- Ensure user is authenticated
- File must be PDF and < 10MB

### CORS errors in frontend
- Backend CORS is configured for `http://localhost:3000`
- Update `frontend/.env` if using different port
- Check `VITE_API_URL` matches backend URL

### Database connection refused
- Ensure Docker containers are running
- Check port 5448 is not in use
- Restart containers: `docker-compose restart`

---

## Production Deployment

### Environment Changes
```bash
# Use production database
DATABASE_URL=postgresql://user:password@prod-db-host:5432/files

# Use strong JWT secret
JWT_SECRET=very-long-random-string-here

# Enable HTTPS
VITE_API_URL=https://api.yourdomain.com
```

### Build Frontend
```bash
cd pyp-website/pyp-website
pnpm build
# Output in dist/ folder
```

### Run Backend with PM2
```bash
npm install -g pm2
pm2 start index.js --name "file-sharing-api"
pm2 save
```

---

## Development Notes

### File Structure
```
backend/
├── src/
│   ├── config/         # Database & OneDrive config
│   ├── controllers/    # Request handlers
│   ├── middlewares/    # Auth, validation, error handling
│   ├── models/         # Database schemas
│   ├── routes/         # API endpoints
│   ├── services/       # OneDrive integration
│   └── index.js        # Main server file

pyp-website/
└── pyp-website/
    ├── src/
    │   ├── components/ # Reusable React components
    │   ├── pages/      # Page components
    │   ├── services/   # API client
    │   ├── hooks/      # Custom React hooks
    │   └── data/       # Static data (fallback)
```

### API Client Usage
```javascript
import { paperAPI, userAPI, departmentAPI } from '@/services/api'

// Upload paper
const formData = new FormData()
formData.append('file', file)
formData.append('title', 'Paper Title')
formData.append('departmentid', 'dept-uuid')
// ... other fields

const response = await paperAPI.uploadPaper(formData)

// Fetch papers
const papers = await paperAPI.getAll()

// Search papers
const results = await paperAPI.search('Data Structures')
```

### Adding New Routes
1. Create controller in `backend/src/controllers/`
2. Create routes in `backend/src/routes/`
3. Import routes in `backend/src/index.js`
4. Add API methods in `frontend/src/services/api.js`
5. Use in React components

---

## Support & Contributions

For issues or feature requests, please create an issue in the repository.

---

## License

This project is part of SKIT JAIPUR and is provided as-is for educational purposes.
