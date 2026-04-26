# 🎓 PYPVault — College Previous Year Papers Platform

A full-stack web application for browsing, uploading, and downloading college previous year exam papers with AI-powered analysis.

---

## 🚀 Tech Stack

### Frontend
| Technology | Usage |
|---|---|
| React.js 18 | UI Framework |
| Vite | Build Tool |
| Tailwind CSS | Styling |
| React Router DOM | Navigation |
| Recharts | Data Visualization |

### Backend
| Technology | Usage |
|---|---|
| Node.js | Runtime |
| Express.js | REST API Framework |
| Drizzle ORM | Database ORM |
| JWT | Authentication |
| Multer | File Upload |
| Bcryptjs | Password Hashing |
| Nodemailer | Email Service |

### Database & Storage
| Technology | Usage |
|---|---|
| Azure Database for PostgreSQL | Primary Database |
| Azure Blob Storage | PDF File Storage |
| Docker | Local Development |

### AI Integration
| Technology | Usage |
|---|---|
| OpenAI API (GPT-4) | Paper Analysis & Topic Prediction |
| OpenAI Embeddings | Semantic Topic Matching |

### Package Manager
```
pnpm
```

---

## 📁 Folder Structure

```
FileSharingSystem/
│
├── backend/
│   ├── src/
│   │   ├── config/
│   │   │   ├── db.js              → PostgreSQL connection
│   │   │   └── cloudinary.js      → Azure Blob config
│   │   │
│   │   ├── models/
│   │   │   ├── user.model.js      → Users table
│   │   │   ├── paper.model.js     → Papers table
│   │   │   ├── subject.model.js   → Subjects table
│   │   │   └── department.model.js → Departments table
│   │   │
│   │   ├── controllers/
│   │   │   ├── auth.controller.js
│   │   │   ├── paper.controller.js
│   │   │   ├── subject.controller.js
│   │   │   └── department.controller.js
│   │   │
│   │   ├── routes/
│   │   │   ├── auth.routes.js
│   │   │   ├── paper.routes.js
│   │   │   ├── subject.routes.js
│   │   │   └── department.routes.js
│   │   │
│   │   ├── middlewares/
│   │   │   ├── auth.middleware.js  → JWT verification
│   │   │   ├── role.middleware.js  → Admin check
│   │   │   ├── upload.middleware.js → Multer PDF validation
│   │   │   └── errorHandler.js    → Global error handler
│   │   │
│   │   ├── services/
│   │   │   ├── azure.service.js   → Azure Blob upload/delete
│   │   │   ├── email.service.js   → Nodemailer email
│   │   │   └── ai.service.js      → OpenAI paper analysis
│   │   │
│   │   └── app.js                 → Express app setup
│   │
│   ├── drizzle/                   → Migration files
│   ├── uploads/                   → Temp file storage
│   ├── drizzle.config.js
│   ├── docker-compose.yml
│   ├── index.js                   → Server entry point
│   └── package.json
│
└── frontend/
    └── files/
        ├── src/
        │   ├── Home.jsx
        │   ├── Navbar.jsx
        │   ├── Footer.jsx
        │   ├── Hero.jsx
        │   ├── PapersList.jsx
        │   ├── Subjects.jsx
        │   ├── Upload.jsx
        │   ├── Login.jsx
        │   └── Signup.jsx
        ├── main.jsx
        ├── index.html
        └── package.json
```

---

## ⚙️ Setup & Installation

### Prerequisites
```
Node.js v18+
pnpm
Docker Desktop
Azure Account
```

### Backend Setup

```bash
# 1. Clone the project
git clone https://github.com/yourusername/pypvault.git

# 2. Go to backend
cd FileSharingSystem

# 3. Install dependencies
pnpm install

# 4. Create .env file
cp .env.example .env

# 5. Fill in .env values
# (see Environment Variables section below)

# 6. Start Docker for local PostgreSQL
docker-compose up -d

# 7. Run database migrations
npx drizzle-kit push

# 8. Start backend server
pnpm start
```

### Frontend Setup

```bash
# 1. Go to frontend
cd frontend/files

# 2. Install dependencies
pnpm install

# 3. Create .env file
VITE_API_URL=http://localhost:8000

# 4. Start frontend
pnpm dev
```

---

## 🔑 Environment Variables

### Backend `.env`

```env
# Server
PORT=8000
NODE_ENV=development

# Azure PostgreSQL
DATABASE_URL=postgresql://username:password@servername.postgres.database.azure.com:5432/pypvault?ssl=true

# JWT
JWT_SECRET=your_super_secret_key
JWT_EXPIRES_IN=7d

# Azure Blob Storage
AZURE_STORAGE_CONNECTION_STRING=your_connection_string
AZURE_CONTAINER_NAME=pyp-papers

# Nodemailer
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_app_password
FROM_EMAIL=noreply@pypvault.com

# OpenAI
OPENAI_API_KEY=your_openai_api_key
OPENAI_MODEL=gpt-4

# Frontend URL
CLIENT_URL=http://localhost:5173
```

### Frontend `.env`

```env
VITE_API_URL=http://localhost:8000
```

---

## 🌐 API Routes

### Auth Routes
| Method | Route | Access | Description |
|---|---|---|---|
| POST | /api/auth/signup | Public | Register new user |
| POST | /api/auth/login | Public | Login user |
| GET | /api/auth/me | Protected | Get current user |
| POST | /api/auth/forgot-password | Public | Send reset email |
| POST | /api/auth/reset-password/:token | Public | Reset password |

### Paper Routes
| Method | Route | Access | Description |
|---|---|---|---|
| GET | /api/papers | Public | Get all papers with filters |
| GET | /api/papers/:id | Public | Get paper by ID |
| POST | /api/papers | Admin | Upload new paper |
| DELETE | /api/papers/:id | Admin | Delete paper |
| PATCH | /api/papers/:id/download | Public | Increment download count |
| PATCH | /api/papers/:id/approve | Admin | Approve paper |

### Subject Routes
| Method | Route | Access | Description |
|---|---|---|---|
| GET | /api/subjects | Public | Get all subjects |
| GET | /api/subjects/:id | Public | Get subject by ID |
| GET | /api/subjects/department/:id | Public | Get subjects by department |
| POST | /api/subjects | Admin | Create subject |
| DELETE | /api/subjects/:id | Admin | Delete subject |

### Department Routes
| Method | Route | Access | Description |
|---|---|---|---|
| GET | /api/departments | Public | Get all departments |
| GET | /api/departments/:id | Public | Get by ID |
| GET | /api/departments/name/:name | Public | Get by name |
| GET | /api/departments/code/:code | Public | Get by code |
| POST | /api/departments | Admin | Create department |
| DELETE | /api/departments/:id | Admin | Delete department |

### AI Routes
| Method | Route | Access | Description |
|---|---|---|---|
| POST | /api/ai/analyze | Protected | Analyze papers with OpenAI |
| GET | /api/ai/predict/:subjectId | Protected | Predict important topics |
| GET | /api/ai/trends/:departmentId | Protected | Get topic trends |
| POST | /api/ai/study-plan | Protected | Generate study plan |

---

## 🔐 Role Based Access

```
STUDENT → signup, login, browse papers, download papers
ADMIN   → everything + upload, approve, delete papers
                      + create subjects and departments
```

---

## 🐳 Docker Setup

```yaml
# docker-compose.yml
version: '3.8'
services:
  postgres:
    image: postgres:15
    container_name: pyp_postgres
    environment:
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: password123
      POSTGRES_DB: pypvault
    ports:
      - "5432:5432"
```

```bash
# Start Docker
docker-compose up -d

# Stop Docker
docker-compose down
```

---

## 📊 Database Schema

```
users
  userid, name, email, password, salt,
  role (student/admin), resetToken,
  resetTokenExpiry, createdAt, updatedAt

departments
  departmentid, name, code, icon,
  color, createdAt

subjects
  subjectid, name, code, semester,
  paperCount, departmentId, createdAt

papers
  paperid, title, year, semester,
  examType, difficulty, fileUrl,
  fileSize, downloads, tags,
  featured, isApproved,
  uploadedBy, subjectId,
  departmentId, createdAt
```

---

## 🧪 Testing with Postman

```bash
# 1. Signup
POST localhost:8000/api/auth/signup
Body: { "name": "Raj", "email": "raj@test.com", "password": "Test1234" }

# 2. Login
POST localhost:8000/api/auth/login
Body: { "email": "raj@test.com", "password": "Test1234" }

# 3. Upload Paper (Admin only)
POST localhost:8000/api/papers
Headers: Authorization: Bearer <token>
Body: form-data
  file → PDF file
  title → "DSA End Semester 2024"
  semester → 3
  year → 2024
  examtype → "End Semester"
```

---

---

## 🤖 AI Features — OpenAI Integration

### What AI does in PYPVault:

```
1. Paper Analysis
   → Analyzes all previous year papers
   → Finds most repeated topics
   → Identifies question patterns

2. Topic Prediction
   → Predicts important topics for next exam
   → Gives probability score to each topic
   → Based on frequency across years

3. Trend Analysis
   → Year wise topic trends
   → Department wise patterns
   → Difficulty trend over years

4. Study Plan Generation
   → Personalized study suggestions
   → High priority topics first
   → Based on exam pattern analysis
```

### How AI works:

```
Step 1 → Fetch all papers from PostgreSQL
Step 2 → Extract titles, subjects, years, departments
Step 3 → Send data to OpenAI GPT-4 API
Step 4 → OpenAI analyzes patterns
Step 5 → Returns predictions and insights
Step 6 → Show results in AI Dashboard
```

### OpenAI API Call example:

```js
import OpenAI from 'openai'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
})

const analyzepapers = async (papers) => {
  const response = await openai.chat.completions.create({
    model: 'gpt-4',
    messages: [
      {
        role: 'system',
        content: 'You are an expert exam analyzer. Analyze previous year papers and predict important topics.'
      },
      {
        role: 'user',
        content: `Analyze these papers and predict important topics: ${JSON.stringify(papers)}`
      }
    ]
  })
  return response.choices[0].message.content
}
```

### Install OpenAI:

```bash
pnpm add openai
```

### AI Dashboard shows:

```
📊 Most repeated topics — bar chart
📈 Year wise trends — line chart
🎯 Top 5 predicted topics — prediction cards
💡 Study tips — AI generated
⚠️ High probability questions — highlighted
```

---

## ✨ Features

```
✅ User Authentication — Signup, Login, JWT
✅ Role Based Access — Student / Admin
✅ Forgot Password — Email reset link
✅ Paper Upload — PDF with validation
✅ Azure Blob Storage — Cloud PDF storage
✅ Azure PostgreSQL — Cloud database
✅ Search Papers — by title, subject
✅ Filter Papers — by semester, year,
                   difficulty, exam type,
                   department, subject
✅ Download Count — track downloads
✅ Paper Approval — admin approves papers
✅ Department Management
✅ Subject Management
✅ Docker support
✅ CORS enabled
✅ AI Paper Analysis — OpenAI GPT-4
✅ Topic Prediction — next exam topics
✅ Trend Analysis — year wise patterns
✅ Study Plan — AI generated suggestions
✅ AI Dashboard — visual insights
```

---

## 👨‍💻 Developer

```
Built with ❤️ by Jatin
```

---

## 📄 License

```
MIT License
```
