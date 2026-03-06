# EduVerse Deployment Guide

## Architecture Overview

```
Frontend (React) → Vercel
Backend (Express) → Vercel Serverless Functions
AI Service (FastAPI) → Render / Railway / Fly.io
Database → MongoDB Atlas
Cache → Upstash Redis
Files → Cloudinary
```

## Prerequisites

- [Node.js 20+](https://nodejs.org)
- [Python 3.11+](https://python.org)
- [Git](https://git-scm.com)
- [Vercel CLI](https://vercel.com/docs/cli) (`npm i -g vercel`)
- MongoDB Atlas account
- Stripe account
- Cloudinary account

---

## 1. MongoDB Atlas Setup

1. Go to [MongoDB Atlas](https://cloud.mongodb.com)
2. Create a new cluster (free tier M0)
3. Create a database user
4. Add your IP to the whitelist (or allow all: `0.0.0.0/0`)
5. Copy the connection string

## 2. Frontend Deployment (Vercel)

```bash
cd client
vercel login
vercel --prod
```

Environment variables to set in Vercel:
- `VITE_API_URL` = `https://your-backend.vercel.app/api`
- `VITE_SOCKET_URL` = `https://your-backend.vercel.app`

## 3. Backend Deployment (Vercel Serverless)

```bash
cd server
npm install
vercel login
vercel --prod
```

Environment variables to set in Vercel:
- `MONGODB_URI` = your MongoDB Atlas connection string
- `JWT_SECRET` = strong random string
- `STRIPE_SECRET_KEY` = your Stripe secret key
- `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`
- `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`
- `AI_SERVICE_URL` = URL of deployed AI service
- `CLIENT_URL` = your frontend URL

## 4. AI Microservice Deployment (Render)

### Option A: Render.com

1. Push `ai-service/` to a Git repo
2. Go to [Render](https://render.com)
3. Create New → Web Service
4. Connect your repo, set root directory to `ai-service`
5. Runtime: Docker
6. Set environment variable: `OPENAI_API_KEY`

### Option B: Railway.app

```bash
cd ai-service
railway login
railway init
railway up
```

### Option C: Fly.io

```bash
cd ai-service
fly launch
fly deploy
```

## 5. Environment Variables Summary

| Variable | Service | Description |
|----------|---------|-------------|
| `MONGODB_URI` | Backend | MongoDB connection string |
| `JWT_SECRET` | Backend | JWT signing secret |
| `STRIPE_SECRET_KEY` | Backend | Stripe API key |
| `CLOUDINARY_*` | Backend | File storage credentials |
| `OPENAI_API_KEY` | AI Service | OpenAI API key |
| `VITE_API_URL` | Frontend | Backend API URL |

## 6. Post-Deployment Checklist

- [ ] Test user registration and login
- [ ] Test course listing and detail pages
- [ ] Verify dark/light mode
- [ ] Test payment flow (use Stripe test mode)
- [ ] Verify file uploads work (Cloudinary)
- [ ] Test AI tutor responses
- [ ] Monitor error logs in Vercel dashboard
