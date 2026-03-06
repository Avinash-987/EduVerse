<p align="center">
  <img src="https://img.shields.io/badge/EduVerse-AI%20Powered%20LMS-6366f1?style=for-the-badge&logo=bookstack&logoColor=white" alt="EduVerse Banner" />
</p>

<h1 align="center">🎓 EduVerse — AI-Powered Learning Management System</h1>

<p align="center">
  A full-stack, production-ready Learning Management System built for the Indian education ecosystem.<br/>
  Featuring real-time live classes with WebRTC, AI tutoring, course management, Razorpay payments, and more.
</p>

<p align="center">
  <img src="https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=white" alt="React" />
  <img src="https://img.shields.io/badge/Node.js-Express-339933?logo=node.js&logoColor=white" alt="Node.js" />
  <img src="https://img.shields.io/badge/MongoDB-Atlas-47A248?logo=mongodb&logoColor=white" alt="MongoDB" />
  <img src="https://img.shields.io/badge/Socket.IO-4.x-010101?logo=socket.io&logoColor=white" alt="Socket.IO" />
  <img src="https://img.shields.io/badge/WebRTC-Peer_to_Peer-333333?logo=webrtc&logoColor=white" alt="WebRTC" />
  <img src="https://img.shields.io/badge/Tailwind_CSS-4.x-06B6D4?logo=tailwindcss&logoColor=white" alt="Tailwind" />
  <img src="https://img.shields.io/badge/Razorpay-INR-0C2451?logo=razorpay&logoColor=white" alt="Razorpay" />
  <img src="https://img.shields.io/badge/Vite-7.x-646CFF?logo=vite&logoColor=white" alt="Vite" />
</p>

---

## ✨ Features

### 👨‍🎓 Student Portal
- **Dashboard** — Personalized overview with enrolled courses, progress, and upcoming live classes
- **Course Catalog** — Browse, search, and filter courses by category and level
- **My Courses** — Track enrolled courses with progress indicators
- **Live Classes (WebRTC)** — Join real-time video meetings with camera, mic, screen share, chat, and hand raise
- **AI Tutor** — AI-powered tutor for instant doubt clearing
- **Assignments** — View and submit assignments for enrolled courses
- **Chat** — Real-time messaging with instructors and classmates
- **Payments** — View payment history and transaction details
- **Profile Settings** — Update personal info, avatar, and preferences

### 👩‍🏫 Faculty Portal
- **Dashboard** — Overview of created courses, revenue, and student engagement
- **Create/Manage Courses** — Full course builder with modules and lessons
- **Student Management** — View enrolled students per course
- **Assignments** — Create and grade assignments
- **Live Classes** — Start/join real-time video classes with students
- **Analytics** — Teaching analytics and performance insights

### 🛡️ Admin Portal
- **Dashboard** — Platform-wide stats and key metrics
- **User Management** — Manage all users across roles
- **Course Management** — Oversee all courses on the platform
- **Faculty Approval** — Approve/reject faculty registrations
- **Revenue** — Platform revenue tracking and analytics
- **Reports** — Generate and view platform reports
- **CMS** — Manage platform content

### 🎥 Live Class System (WebRTC + Socket.IO)
- **Real-time Video/Audio** — Mesh-topology WebRTC with one peer connection per participant
- **Screen Sharing** — Share screen with track replacement, auto-restore camera on stop
- **In-Meeting Chat** — Live chat messages scoped to the meeting room
- **Hand Raise** — Visual bouncing ✋ indicator on video tiles
- **Mic/Camera Toggle** — Real MediaStreamTrack control with state sync across participants
- **Participant Lifecycle** — Join/leave notifications, live participant count, no ghost users
- **Cleanup on Disconnect** — Stops all tracks, closes peer connections, removes socket listeners

### 💳 Payments
- **Razorpay Integration** — UPI, cards, netbanking for Indian users
- **Checkout Flow** — Secure payment with order summary, tax calculation, and success/error states
- **Payment History** — Complete transaction log for students

### 🌗 UI/UX
- **Dark / Light Mode** — Seamless theme toggle with CSS custom properties
- **Glassmorphism Design** — Modern glass-card UI with gradients, blur, and subtle animations
- **Responsive Layout** — Collapsible sidebar, mobile-friendly design
- **Framer Motion** — Smooth page transitions and micro-animations

---

## 🏗️ Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | React 19, Vite 7, Tailwind CSS 4, Framer Motion, Redux Toolkit |
| **Backend** | Node.js, Express.js, Socket.IO |
| **Database** | MongoDB (Mongoose ODM) |
| **Real-time** | WebRTC (mesh topology), Socket.IO signaling |
| **Payments** | Razorpay (INR), Stripe (international) |
| **AI Service** | Python FastAPI, OpenAI GPT |
| **File Storage** | Cloudinary |
| **Auth** | JWT (JSON Web Tokens), bcrypt |
| **Deployment** | Vercel (frontend + backend), Render/Railway (AI service) |

---

## 📁 Project Structure

```
EduVerse/
├── client/                     # React Frontend (Vite)
│   ├── src/
│   │   ├── components/         # Reusable UI components
│   │   │   ├── layout/         # Navbar, Sidebar, Footer, DashboardLayout
│   │   │   └── ui/             # EmptyState, LoadingSpinner
│   │   ├── contexts/           # AuthContext, ThemeContext
│   │   ├── pages/
│   │   │   ├── student/        # Dashboard, MyCourses, LiveClass, Chat, etc.
│   │   │   ├── faculty/        # Dashboard, CreateCourse, Students, etc.
│   │   │   └── admin/          # Dashboard, Users, Revenue, Reports, etc.
│   │   ├── services/           # API client (Axios), Socket.IO client
│   │   ├── store/              # Redux store and slices
│   │   └── utils/              # Constants, formatters
│   ├── .env                    # Client env vars (VITE_API_URL, VITE_SOCKET_URL)
│   └── package.json
│
├── server/                     # Express Backend
│   ├── api/
│   │   └── index.js            # Express + Socket.IO server entry point
│   ├── config/                 # DB connection, Cloudinary, Stripe
│   ├── middleware/              # Auth (JWT), Role-based access
│   ├── models/                 # Mongoose schemas (User, Course, LiveClass, etc.)
│   ├── routes/                 # REST API routes
│   ├── vercel.json             # Vercel serverless config
│   ├── .env                    # Server env vars
│   └── package.json
│
├── ai-service/                 # AI Tutor Microservice (FastAPI)
│   ├── main.py
│   ├── services/
│   ├── requirements.txt
│   └── Dockerfile
│
├── .env.example                # Template for environment variables
├── DEPLOYMENT.md               # Detailed deployment guide
├── SECURITY.md                 # Security practices documentation
└── package.json                # Root package (concurrently runs client + server)
```

---

## 🚀 Getting Started

### Prerequisites

- [Node.js 20+](https://nodejs.org/)
- [MongoDB](https://www.mongodb.com/) (local or [Atlas](https://cloud.mongodb.com/))
- [Git](https://git-scm.com/)

### 1. Clone the Repository

```bash
git clone https://github.com/Avinash-987/EduVerse.git
cd EduVerse
```

### 2. Install Dependencies

```bash
# Root dependencies (concurrently)
npm install

# Client dependencies
cd client && npm install && cd ..

# Server dependencies
cd server && npm install && cd ..
```

### 3. Environment Setup

**Server** — Create `server/.env`:
```env
# Database
MONGODB_URI=mongodb://127.0.0.1:27017/eduverse

# Auth
JWT_SECRET=your-super-secret-jwt-key
JWT_EXPIRE=7d

# App Config
PORT=5000
NODE_ENV=development
CLIENT_URL=http://localhost:5173

# Razorpay (optional for payments)
RAZORPAY_KEY_ID=rzp_test_xxxx
RAZORPAY_KEY_SECRET=your_secret
```

**Client** — Create `client/.env`:
```env
VITE_API_URL=http://localhost:5000/api
VITE_SOCKET_URL=http://localhost:5000
```

### 4. Run Development Server

```bash
# From root — starts both client and server concurrently
npm run dev
```

- 🌐 **Frontend**: http://localhost:5173
- ⚙️ **Backend**: http://localhost:5000
- 🔌 **Socket.IO**: ws://localhost:5000

---

## 🎥 Live Class — How It Works

```
┌─────────────┐     Socket.IO Signaling     ┌─────────────┐
│   Client A   │ ◄──────────────────────────► │   Server     │
│   (React)    │                              │  (Express +  │
│              │     Offer / Answer / ICE     │  Socket.IO)  │
│   WebRTC     │ ◄──────────────────────────► │              │
│   Peer Conn  │                              └──────┬───────┘
│              │                                     │
│              │         Media (P2P)                  │ Signaling
│              │ ◄───────────────────────►    ┌──────┴───────┐
└─────────────┘                              │   Client B   │
                                             │   (React)    │
                                             └──────────────┘
```

1. User enters a **meeting code** and clicks **Join**
2. `getUserMedia` acquires camera + mic (with audio-only fallback)
3. Socket connects and joins the room — receives list of existing participants
4. Creates an **RTCPeerConnection** per remote participant
5. Exchanges **offer → answer → ICE candidates** via Socket.IO
6. Media flows **peer-to-peer** (not through the server)
7. Mic/Camera toggles control real `MediaStreamTrack.enabled`
8. Screen share uses `replaceTrack()` on all peer connections
9. On leave/disconnect: all tracks stopped, connections closed, socket cleaned up

---

## 🔧 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register new user |
| POST | `/api/auth/login` | Login and receive JWT |
| GET | `/api/courses` | List all courses |
| GET | `/api/courses/:id` | Get course details |
| POST | `/api/courses` | Create course (faculty) |
| GET | `/api/enrollments` | Get user enrollments |
| POST | `/api/enrollments` | Enroll in a course |
| GET | `/api/assignments` | Get assignments |
| POST | `/api/payments/create-checkout` | Create payment session |
| GET | `/api/live/upcoming` | Get upcoming live classes |
| POST | `/api/live` | Schedule live class (faculty) |
| GET | `/api/chat/conversations` | Get chat conversations |
| GET | `/api/admin/stats` | Admin dashboard stats |
| POST | `/api/ai/tutor` | AI tutor query |

---

## 🌐 Deployment

### Vercel (Frontend + Backend)

```bash
# Deploy frontend
cd client
vercel --prod

# Deploy backend
cd server
vercel --prod
```

Set the following environment variables in Vercel dashboard:

| Variable | Where | Value |
|----------|-------|-------|
| `VITE_API_URL` | Client | `https://your-backend.vercel.app/api` |
| `VITE_SOCKET_URL` | Client | `https://your-backend.vercel.app` |
| `MONGODB_URI` | Server | Your MongoDB Atlas connection string |
| `JWT_SECRET` | Server | Strong random string |
| `CLIENT_URL` | Server | Your frontend URL |

> ⚠️ **Note:** WebRTC live classes require WebSocket support. Vercel Serverless Functions do not support persistent WebSocket connections. For production live classes, deploy the server on **Railway**, **Render**, or a **VPS** (DigitalOcean, AWS EC2) instead.

See [DEPLOYMENT.md](./DEPLOYMENT.md) for the full deployment guide.

---

## 🔒 Security

- JWT authentication with httpOnly considerations
- Password hashing with bcrypt (12 rounds)
- Rate limiting on API routes
- Helmet.js for HTTP security headers
- CORS configured per environment
- Role-based access control (student / faculty / admin)
- Input validation with express-validator

---

## 📝 License

This project is open source and available under the [MIT License](LICENSE).

---

## 👨‍💻 Author

**Avinash Kumar**

- GitHub: [@Avinash-987](https://github.com/Avinash-987)

---

<p align="center">
  Made with ❤️ in India 🇮🇳
</p>
