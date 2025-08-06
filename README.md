# UCDPakiPSA Polling Website

A full-stack anonymous polling website built with Next.js and Express.js.

## Features

- 🗳️ Create public polls with multiple choices
- 📊 View poll results as bar charts
- ✏️ Edit existing polls
- 📱 Mobile-friendly responsive design
- 🔒 No authentication required - completely anonymous

## Tech Stack

- **Frontend**: Next.js 14, React, Tailwind CSS
- **Backend**: Node.js, Express.js
- **Database**: PostgreSQL
- **Deployment**: Vercel (Frontend) + Render (Backend)

## Development Setup

1. Install dependencies:
```bash
npm run install:all
```

2. Set up environment variables:
   - Copy `backend/.env.example` to `backend/.env`
   - Update database connection details

3. Start development servers:
```bash
npm run dev
```

This will start both frontend (http://localhost:3000) and backend (http://localhost:5000).

## Deployment

### Frontend (Vercel)
1. Connect your GitHub repo to Vercel
2. Set build command: `cd frontend && npm run build`
3. Set output directory: `frontend/.next`

### Backend (Render)
1. Connect your GitHub repo to Render
2. Set root directory to `backend`
3. Set start command: `npm start`
4. Add environment variables for production database

## API Endpoints

- `GET /api/polls` - Get all polls
- `POST /api/polls` - Create a new poll
- `PUT /api/polls/:id` - Update a poll
- `POST /api/polls/:id/vote` - Vote on a poll
- `GET /api/polls/:id` - Get a specific poll with results