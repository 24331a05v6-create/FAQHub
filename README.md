# FAQHub - AI-Powered Student FAQ & Knowledge Platform

A premium, full-stack MERN application for community-driven Q&A with AI chatbot assistance, built for the Vicharanashala Internship Program (VINS).

## Features

### Core
- **4 FAQ Views** — Tree, Gallery, Explorer, and Mind Map visualizations
- **AI Chatbot** — Multilingual support (10 languages), image upload, FAQ-first smart search
- **OTP Registration** — Email-based verification with Gmail SMTP
- **Community Q&A** — Ask questions, answer peers, upvote best responses
- **Moderation Workflow** — Approve, reject, or request changes on answers
- **Duplicate Detection** — TF-IDF similarity scoring to merge duplicate FAQs
- **Trending FAQs** — Priority tracking with view/bookmark/trending scores
- **Pin & Manage** — Admin can pin, delete, and manage all FAQs

### Admin
- **Analytics Dashboard** — User stats, category distribution, recent activity
- **Moderation Queue** — Review pending answers with keyboard shortcuts (A/R/C)
- **Credential Management** — Issue/revoke temporary admin/moderator credentials
- **FAQ Management** — Add, delete, pin/unpin FAQs with search

### User
- **Profile Page** — View raised queries, resolved questions, answers, notifications
- **Notification Bell** — Real-time unread count with mark-as-read
- **Dark/Light Mode** — Theme persistence with system preference detection

### UI/UX
- **Glassmorphism Design** — Frosted glass cards, blur effects, gradient backgrounds
- **Framer Motion Animations** — Smooth page transitions, micro-interactions
- **Floating Orbs** — Animated background decorations
- **Responsive** — Mobile-first design, works on all screen sizes

## Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | React 18, Vite, Tailwind CSS v4, Framer Motion, TanStack Query |
| Backend | Node.js, Express, Mongoose, JWT, bcrypt |
| Database | MongoDB |
| Email | Nodemailer (Gmail SMTP) |
| Icons | Lucide React |
| AI | MiniMax-M2.7 via Samagama proxy (FAQ-first with AI fallback) |

## Getting Started

### Prerequisites
- Node.js 18+
- MongoDB running locally or MongoDB Atlas
- Gmail App Password for OTP emails

### Installation

```bash
# Clone the repo
git clone https://github.com/YOUR_USERNAME/FAQHub.git
cd FAQHub

# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

### Environment Variables

Create `backend/.env`:

```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/faq-platform
JWT_SECRET=your_jwt_secret
JWT_EXPIRES_IN=7d

# Gmail OTP (https://myaccount.google.com/apppasswords)
EMAIL_USER=your_email@gmail.com
EMAIL_APP_PASSWORD=your_16_char_app_password
```

### Seed the Database

```bash
cd backend
npm run seed
```

This creates 75 FAQs across 11 categories and an admin user.

### Run

```bash
# Terminal 1 — Backend
cd backend
npm run dev

# Terminal 2 — Frontend
cd frontend
npm run dev
```

Open [http://localhost:5173](http://localhost:5173)

### Default Admin
- **Email:** saisrinivasjagannadh@gmail.com
- **Password:** Sai@1919

## Project Structure

```
FAQHub/
├── backend/
│   ├── config/          # Database connection
│   ├── controllers/     # Route handlers (13 controllers)
│   ├── middleware/       # Auth, error handling
│   ├── models/          # Mongoose schemas (9 models)
│   ├── routes/          # API routes (10 route files)
│   ├── utils/           # Email, token generation, seed script
│   └── server.js        # Express entry point
├── frontend/
│   ├── src/
│   │   ├── api/         # Axios config, API functions
│   │   ├── components/  # Reusable UI (ChatBot, MindMap, Navbar, etc.)
│   │   ├── context/     # AuthContext, ThemeContext
│   │   ├── hooks/       # Custom hooks (useDebounce)
│   │   ├── pages/       # Page components (15 pages)
│   │   ├── index.css    # Global styles, glassmorphism utilities
│   │   └── App.jsx      # Router setup
│   └── vite.config.js
├── docs/                # Feature specification
└── opencode.json        # AI model configuration
```

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register new user |
| POST | `/api/auth/login` | Login |
| POST | `/api/auth/send-otp` | Send OTP email |
| POST | `/api/auth/verify-otp` | Verify OTP |
| GET | `/api/faqs` | Get all FAQs |
| GET | `/api/faqs/trending` | Get trending FAQs |
| POST | `/api/ai/chat` | AI chatbot |
| POST | `/api/questions` | Raise a question |
| GET | `/api/community` | Get community questions |
| GET | `/api/users/me` | Get user profile |
| GET | `/api/admin/analytics` | Admin analytics |
| POST | `/api/admin/faqs` | Create FAQ |
| PATCH | `/api/admin/faqs/:id/toggle-pin` | Pin/unpin FAQ |

## 75 FAQs Across 11 Categories

1. About the Internship (6)
2. Timing and Dates (6)
3. NOC (12)
4. Selection, Offer Letter & Certificate (18)
5. Work, Mentorship & Projects (7)
6. Communication Channels (1)
7. Interviews (1)
8. Certificate (4)
9. Rosetta Journal (12)
10. Phase 1 Coursework (8)
11. OTHERS

## License

MIT

---

Built with care for the Vicharanashala community.
