# PYP Website - Complete Master Setup Guide

## 🎯 All-in-One Setup Guide for AI Predictions Feature

This comprehensive guide covers everything you need to set up the PYP website with AI predictions, email, OneDrive integration, and troubleshooting.

---

## 📋 Table of Contents

1. [Prerequisites](#prerequisites)
2. [Quick Start (5 Minutes)](#quick-start-5-minutes)
3. [Detailed Setup](#detailed-setup)
   - [Step 1: Backend Setup](#step-1-backend-setup)
   - [Step 2: Frontend Setup](#step-2-frontend-setup)
   - [Step 3: Database Setup](#step-3-database-setup)
   - [Step 4: OpenAI API Setup](#step-4-openai-api-setup)
   - [Step 5: Email Setup](#step-5-email-setup)
   - [Step 6: OneDrive Setup](#step-6-onedrive-setup)
4. [Testing](#testing)
5. [Troubleshooting](#troubleshooting)
6. [Documentation Links](#documentation-links)

---

## Prerequisites

Before starting, ensure you have:

- ✅ **Node.js 18+** installed ([Download](https://nodejs.org/))
- ✅ **PostgreSQL** running ([Download](https://www.postgresql.org/download/))
- ✅ **pnpm** package manager (`npm install -g pnpm`)
- ✅ **Git** for version control
- ✅ **Code Editor** (VS Code recommended)

---

## Quick Start (5 Minutes)

### 1. Install Dependencies

```bash
# Backend
cd backend
pnpm install

# Frontend
cd ../pyp-website/pyp-website
pnpm install
```

### 2. Configure Environment

**Backend (.env):**
```bash
# Copy existing .env or create new one
# At minimum, add your OpenAI API key:
OPENAI_API_KEY=sk-your-key-here
```

**Frontend (.env):**
```bash
# Should already have:
VITE_API_URL=http://localhost:8000
```

### 3. Run Database Migrations

```bash
cd backend
pnpm db:push
```

### 4. Start Services

**Terminal 1 - Backend:**
```bash
cd backend
pnpm start
```

**Terminal 2 - Frontend:**
```bash
cd pyp-website/pyp-website
pnpm dev
```

### 5. Open Browser

Visit: `http://localhost:5173`

---

## Detailed Setup

### Step 1: Backend Setup

#### 1.1 Install Dependencies

```bash
cd backend
pnpm install
```

**Installed packages:**
- `express` - Web framework
- `drizzle-orm` - Database ORM
- `pg` - PostgreSQL driver
- `openai` - AI predictions
- `pdf-parse` - PDF text extraction
- `nodemailer` - Email sending
- `jsonwebtoken` - Authentication
- `multer` - File uploads
- `cors` - Cross-origin requests

#### 1.2 Configure Environment

Edit `backend/.env`:

```env
# Database (already configured)
DATABASE_URL=postgresql://JAZZ:lilu123@localhost:5448/FILES

# JWT Secret (change this!)
JWT_SECRET=your-super-secret-key-change-this

# Server Port
PORT=8000

# Email (for OTP and notifications)
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-gmail-app-password

# OpenAI (for AI predictions)
OPENAI_API_KEY=sk-your-openai-api-key-here

# OneDrive (for file storage)
ONEDRIVE_CLIENT_ID=your-onedrive-client-id
ONEDRIVE_CLIENT_SECRET=your-onedrive-client-secret
ONEDRIVE_TENANT_ID=your-tenant-id
ONEDRIVE_REFRESH_TOKEN=your-refresh-token
ONEDRIVE_REDIRECT_URI=http://localhost:8000/auth/onedrive/callback
```

#### 1.3 Test Backend

```bash
cd backend
pnpm start
```

Expected output:
```
server is listening on port:8000
```

Test in browser: `http://localhost:8000/department`

---

### Step 2: Frontend Setup

#### 2.1 Install Dependencies

```bash
cd pyp-website/pyp-website
pnpm install
```

**Installed packages:**
- `react` - UI library
- `react-router-dom` - Routing
- `recharts` - Data visualization
- `lucide-react` - Icons
- `tailwindcss` - Styling
- `vite` - Build tool

#### 2.2 Configure Environment

Edit `pyp-website/pyp-website/.env`:

```env
VITE_API_URL=http://localhost:8000
VITE_APP_NAME=PYP Website
```

#### 2.3 Test Frontend

```bash
cd pyp-website/pyp-website
pnpm dev
```

Expected output:
```
  VITE v5.4.2  ready in 500 ms

  ➜  Local:   http://localhost:5173/
  ➜  Network: use --host to expose
```

Visit: `http://localhost:5173`

---

### Step 3: Database Setup

#### 3.1 Ensure PostgreSQL is Running

**Windows:**
- Check Services (`services.msc`)
- Look for "PostgreSQL" service
- Should be "Running"

**Check port:**
```bash
netstat -ano | findstr :5432
```

#### 3.2 Run Migrations

```bash
cd backend
pnpm db:push
```

This creates all required tables:
- `users` - User accounts
- `departments` - College departments
- `subjects` - Course subjects
- `papers` - Previous year papers
- `predictions` - AI predictions (NEW)
- `question_bank` - Extracted questions (NEW)
- `topic_mastery` - Topic tracking (NEW)
- `prediction_feedback` - User feedback (NEW)

#### 3.3 Verify Database

```bash
cd backend
pnpm db:studio
```

Opens Drizzle Studio at `http://localhost:3000` to view tables.

---

### Step 4: OpenAI API Setup

#### 4.1 Get API Key

1. Visit: https://platform.openai.com/api-keys
2. Sign up/Login with OpenAI account
3. Click "Create new secret key"
4. Copy the key (starts with `sk-`)

#### 4.2 Add to Environment

Edit `backend/.env`:
```env
OPENAI_API_KEY=sk-your-actual-api-key-here
```

#### 4.3 Test AI Predictions

1. Start backend and frontend
2. Navigate to `/predictions`
3. Select department and semester
4. Wait for AI to generate predictions

**Note:** First prediction takes ~10 seconds (OpenAI API call). Subsequent requests are instant (cached).

#### 4.4 Cost Management

- **GPT-4 Turbo**: ~$0.035 per prediction
- **Caching**: Predictions cached after first generation
- **Estimated cost**: $3-5/month for 100 unique predictions

---

### Step 5: Email Setup

#### 5.1 Gmail (Recommended for Development)

1. **Enable 2FA** on your Gmail account
2. **Generate App Password**:
   - Visit: https://myaccount.google.com/apppasswords
   - Select "Mail" and your device
   - Copy 16-character password

3. **Update backend/.env**:
```env
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-16-character-app-password
```

#### 5.2 Test Email

Create `backend/test-email.js`:

```javascript
import nodemailer from 'nodemailer'
import dotenv from 'dotenv'

dotenv.config()

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD
  }
})

transporter.sendMail({
  from: process.env.EMAIL_USER,
  to: 'your-email@gmail.com',
  subject: 'PYP Website Test',
  text: 'Email configuration successful!'
}, (error, info) => {
  if (error) {
    console.error('Error:', error)
  } else {
    console.log('Email sent:', info.response)
  }
})
```

Run:
```bash
cd backend
node test-email.js
```

---

### Step 6: OneDrive Setup

#### 6.1 Register Azure AD Application

1. Visit: https://portal.azure.com
2. Go to **Azure Active Directory** → **App registrations**
3. Click **+ New registration**
4. Fill in:
   - Name: `PYP-Website-Files`
   - Redirect URI: `http://localhost:8000/auth/onedrive/callback`
5. Click **Register**

#### 6.2 Get Credentials

1. **Copy Application (client) ID** → `ONEDRIVE_CLIENT_ID`
2. **Copy Directory (tenant) ID** → `ONEDRIVE_TENANT_ID`
3. **Create Client Secret**:
   - Go to **Certificates & secrets**
   - Click **+ New client secret**
   - Copy the **Value** → `ONEDRIVE_CLIENT_SECRET`

#### 6.3 Get Refresh Token

1. Visit: https://oauthplayground.azurewebsites.net/
2. Fill in your credentials
3. Authorize and get refresh token → `ONEDRIVE_REFRESH_TOKEN`

#### 6.4 Update Environment

```env
ONEDRIVE_CLIENT_ID=your-client-id
ONEDRIVE_CLIENT_SECRET=your-client-secret
ONEDRIVE_TENANT_ID=your-tenant-id
ONEDRIVE_REFRESH_TOKEN=your-refresh-token
ONEDRIVE_REDIRECT_URI=http://localhost:8000/auth/onedrive/callback
```

#### 6.5 How It Works

- **PostgreSQL**: Stores paper metadata (title, subject, year, OneDrive URL)
- **OneDrive**: Stores actual PDF files
- **Benefits**: Scalable storage, automatic backups, easy sharing

---

## Testing

### Backend Tests

```bash
# Test department endpoint
curl http://localhost:8000/department

# Test AI info endpoint
curl http://localhost:8000/ai/skit-info

# Test database
cd backend
pnpm db:studio
```

### Frontend Tests

1. Visit `http://localhost:5173`
2. Navigate to AI Predictions
3. Select filters
4. Verify predictions load

### Integration Tests

1. **Upload a paper** → Goes to OneDrive
2. **View paper** → Downloads from OneDrive
3. **Get predictions** → Uses OpenAI API
4. **Rate prediction** → Stores feedback in database

---

## Troubleshooting

### Issue: "Failed to fetch"

**Solution:**
1. Ensure backend is running: `cd backend && pnpm start`
2. Check frontend `.env`: `VITE_API_URL=http://localhost:8000`
3. Verify port 8000 is available

### Issue: "Import not found"

**Solution:**
```bash
cd pyp-website/pyp-website
pnpm install
```

### Issue: Database connection error

**Solution:**
1. Ensure PostgreSQL is running
2. Verify `DATABASE_URL` in `.env`
3. Run `pnpm db:push`

### Issue: OpenAI API error

**Solution:**
1. Check API key in `.env`
2. Verify API key has credits
3. Check OpenAI status page

### Issue: Email not sending

**Solution:**
1. Use Gmail App Password (not regular password)
2. Enable 2FA on Gmail
3. Check email credentials in `.env`

---

## Documentation Links

### Created Documentation

1. **[AI_PREDICTIONS_SETUP.md](./AI_PREDICTIONS_SETUP.md)** - Detailed AI predictions setup
2. **[IMPLEMENTATION_SUMMARY.md](./IMPLEMENTATION_SUMMARY.md)** - Technical implementation details
3. **[EMAIL_SETUP_GUIDE.md](./EMAIL_SETUP_GUIDE.md)** - Email configuration guide
4. **[ONEDRIVE_SETUP_GUIDE.md](./ONEDRIVE_SETUP_GUIDE.md)** - OneDrive integration guide
5. **[FRONTEND_BACKEND_TROUBLESHOOTING.md](./FRONTEND_BACKEND_TROUBLESHOOTING.md)** - Connection troubleshooting
6. **[SETUP_AI_PREDICTIONS.bat](./SETUP_AI_PREDICTIONS.bat)** - Automated setup script

### External Resources

- [OpenAI API Documentation](https://platform.openai.com/docs)
- [Recharts Documentation](https://recharts.org/)
- [Drizzle ORM Documentation](https://orm.drizzle.team/)
- [React Router Documentation](https://reactrouter.com/)

---

## 🎉 You're All Set!

After completing these steps, you should have:

✅ **Backend** running on `http://localhost:8000`  
✅ **Frontend** running on `http://localhost:5173`  
✅ **Database** with all tables created  
✅ **AI Predictions** working with OpenAI  
✅ **Email** configured for OTP and notifications  
✅ **OneDrive** integrated for file storage  

### Next Steps

1. **Add your papers** - Upload previous year question papers
2. **Test AI predictions** - Navigate to `/predictions`
3. **Invite users** - Share the platform with students
4. **Monitor usage** - Track API usage and costs
5. **Gather feedback** - Improve predictions based on user ratings

### Support

If you encounter any issues:
1. Check the troubleshooting guide
2. Review the detailed documentation
3. Check backend/frontend console logs
4. Test API endpoints manually

---

**Happy Coding! 🚀**

*Last Updated: April 25, 2026*  
*Version: 1.0.0*