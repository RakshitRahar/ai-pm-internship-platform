# 🚀 AI-Based Smart Allocation Engine for PM Internship Scheme

A full-stack, production-ready web application that enables students to apply for PM internships, upload CVs, and be automatically matched and allocated using AI-powered evaluation.

---

## 🏗️ Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | React 18 + Vite, Tailwind CSS, Zustand, Chart.js |
| **Backend** | Node.js + Express |
| **Database** | MongoDB + Mongoose |
| **Auth** | JWT (JSON Web Tokens) |
| **AI** | OpenAI GPT-4o-mini (CV parsing, scoring, chat) |
| **File Upload** | Multer (PDF + DOCX) |
| **Logging** | Winston |

---

## 📁 Folder Structure

```
Ai based pm intership/
├── server/                         # Node.js + Express Backend
│   ├── src/
│   │   ├── app.js                  # Main Express app
│   │   ├── config/
│   │   │   ├── db.js               # MongoDB connection
│   │   │   └── constants.js        # App-wide constants & weights
│   │   ├── models/
│   │   │   ├── User.js             # User model (student & admin)
│   │   │   ├── Internship.js       # Internship listings
│   │   │   ├── Application.js      # Student applications + AI scores
│   │   │   └── AIAnalysis.js       # Stored CV analysis results
│   │   ├── controllers/
│   │   │   ├── authController.js
│   │   │   ├── userController.js
│   │   │   ├── internshipController.js
│   │   │   ├── applicationController.js
│   │   │   └── adminController.js
│   │   ├── services/
│   │   │   ├── aiService.js         # OpenAI CV parsing + scoring + chat
│   │   │   ├── allocationService.js # Smart allocation engine
│   │   │   └── fileService.js       # PDF/DOCX text extraction
│   │   ├── middleware/
│   │   │   ├── auth.js              # JWT protect + role authorization
│   │   │   ├── errorHandler.js      # Global error handler
│   │   │   └── upload.js            # Multer CV upload config
│   │   ├── routes/
│   │   │   ├── auth.js
│   │   │   ├── users.js
│   │   │   ├── internships.js
│   │   │   ├── applications.js
│   │   │   ├── admin.js
│   │   │   └── ai.js
│   │   └── utils/
│   │       └── logger.js            # Winston logger
│   ├── uploads/cvs/                 # Uploaded CV files
│   ├── logs/                        # Application logs
│   ├── package.json
│   └── .env.example
│
├── client/                         # React + Vite Frontend
│   ├── src/
│   │   ├── App.jsx                  # Router + route guards
│   │   ├── main.jsx                 # Entry point
│   │   ├── index.css                # Tailwind + global styles
│   │   ├── store/
│   │   │   └── authStore.js         # Zustand auth state (persisted)
│   │   ├── services/
│   │   │   └── api.js               # Axios instance + API functions
│   │   ├── components/
│   │   │   ├── layout/
│   │   │   │   ├── StudentLayout.jsx
│   │   │   │   └── AdminLayout.jsx
│   │   │   ├── ui/
│   │   │   │   └── ScoreCard.jsx    # AI score visualization
│   │   │   └── student/
│   │   │       ├── CVUpload.jsx     # Drag-drop CV uploader
│   │   │       └── AIChatWidget.jsx # Floating AI chat
│   │   └── pages/
│   │       ├── LandingPage.jsx
│   │       ├── LoginPage.jsx
│   │       ├── RegisterPage.jsx     # 2-step registration
│   │       ├── student/
│   │       │   ├── StudentDashboard.jsx
│   │       │   ├── StudentProfile.jsx
│   │       │   ├── StudentApplications.jsx
│   │       │   └── InternshipsPage.jsx
│   │       └── admin/
│   │           ├── AdminDashboard.jsx    # Analytics + Charts
│   │           ├── AdminInternships.jsx  # CRUD internships
│   │           ├── AdminCandidates.jsx   # Ranked candidates
│   │           ├── AdminAllocation.jsx   # 3-step allocation wizard
│   │           └── AdminUsers.jsx        # User management
│   ├── index.html
│   ├── vite.config.js
│   ├── tailwind.config.js
│   └── package.json
│
└── README.md
```

---

## ⚙️ Setup Instructions

### Prerequisites

- Node.js v18+
- MongoDB (local or MongoDB Atlas)
- OpenAI API key

### 1. Clone and Navigate

```bash
cd "Ai based pm intership"
```

### 2. Backend Setup

```bash
cd server

# Install dependencies
npm install

# Create environment file
cp .env.example .env
# Edit .env and fill in your values:
# - MONGO_URI=mongodb://localhost:27017/pm_internship_db
# - JWT_SECRET=your_minimum_32_char_secret
# - OPENAI_API_KEY=sk-your-openai-key

# Start development server
npm run dev
# Server runs at http://localhost:5000
```

### 3. Frontend Setup

```bash
cd client

# Install dependencies
npm install

# Start development server
npm run dev
# App runs at http://localhost:5173
```

### 4. Create Admin Account

Make a POST request to the admin registration endpoint:

```bash
curl -X POST http://localhost:5000/api/auth/admin/register \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "Admin",
    "lastName": "User",
    "email": "admin@example.com",
    "password": "Admin1234!",
    "adminSecret": "your_admin_secret_from_env"
  }'
```

> Add `ADMIN_SECRET=your_secret` to your `.env` file.

---

## 🤖 AI Scoring System

The allocation engine uses a **weighted scoring algorithm**:

| Factor | Weight | Description |
|--------|--------|-------------|
| Skills Match | **40%** | Overlap between candidate skills and required/preferred skills |
| Experience | **20%** | Years and relevance of work experience |
| Education | **15%** | Degree relevance and CGPA |
| Projects | **15%** | Number and technology relevance of projects |
| Keywords | **10%** | Domain keyword match in CV |

**Score Tiers:**
- 🟢 Excellent: 80-100
- 🔵 Good: 60-79
- 🟡 Average: 40-59
- 🔴 Poor: 0-39

---

## 🔌 API Reference

### Auth
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Student registration |
| POST | `/api/auth/login` | Login (student & admin) |
| GET | `/api/auth/me` | Get current user |
| PUT | `/api/auth/update-password` | Update password |
| POST | `/api/auth/admin/register` | Create admin (with secret) |

### Users
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/users/profile` | Get profile + AI analysis |
| PUT | `/api/users/profile` | Update profile |
| POST | `/api/users/upload-cv` | Upload CV + trigger AI analysis |
| GET | `/api/users/cv-analysis` | Get CV analysis results |

### Internships
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/internships` | List (with search/filter) |
| GET | `/api/internships/:id` | Get single |
| POST | `/api/internships` | Create (admin) |
| PUT | `/api/internships/:id` | Update (admin) |
| DELETE | `/api/internships/:id` | Delete (admin) |

### Applications
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/applications` | Submit application |
| GET | `/api/applications/my` | My applications |
| GET | `/api/applications/recommendations` | AI recommendations |
| PATCH | `/api/applications/:id/withdraw` | Withdraw |
| PATCH | `/api/applications/:id/status` | Update status (admin) |

### Admin
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/admin/dashboard` | Dashboard stats + charts |
| GET | `/api/admin/users` | List users |
| GET | `/api/admin/applications` | All applications |
| POST | `/api/admin/internships/:id/score-all` | Run batch AI scoring |
| GET | `/api/admin/internships/:id/candidates` | Ranked candidates |
| POST | `/api/admin/internships/:id/allocate` | Run smart allocation |
| GET | `/api/admin/internships/:id/report` | Allocation report |

### AI
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/ai/chat` | AI career advisor chat |

---

## 🔐 Security Features

- ✅ JWT Authentication with expiry
- ✅ Bcrypt password hashing (12 rounds)
- ✅ Helmet HTTP headers
- ✅ Rate limiting (100 req/15min, 20 for auth)
- ✅ MongoDB sanitization (NoSQL injection prevention)
- ✅ CORS configured to client origin
- ✅ File type + size validation
- ✅ Role-based access control

---

## 🌟 Features Summary

**Student:**
- Register with academic details (2-step form)
- Upload CV (PDF/DOCX, max 10MB)
- AI analysis with skill extraction and CV quality score
- Browse & apply to internships with smart recommendations
- Track application status + view AI score breakdown
- AI chat assistant for improvement feedback

**Admin:**
- Dashboard with KPIs, charts, trends
- Create/edit internship listings with requirements
- Trigger AI batch scoring for all applicants
- View ranked candidates with expandable score details
- Run 3-step Smart Allocation Engine
- User management with activate/deactivate

---

## 🚀 Production Notes

For production deployment:

1. Set `NODE_ENV=production` in the server `.env`
2. Use MongoDB Atlas for the database
3. Store uploads on S3/Cloudinary instead of local disk
4. Add Redis for caching frequent AI analysis requests
5. Add email service for allocation notifications
6. Set proper CORS origins
7. Use process manager like PM2 for the Node server
