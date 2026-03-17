# Developer Profile Aggregator (MERN)

Full-stack platform to aggregate developer stats from GitHub, LeetCode, YouTube, and Sololearn in one dashboard.

## Features

- Role-based auth (`student`, `admin`)
- Student self-service profile edit page
- Verify Profile flow (fetches GitHub, LeetCode, YouTube stats)
- Unified student dashboard with all six platforms
- Leaderboard + ranked dev cards
- Public student profile dashboard route (`/student-dashboard/:username`)
- Admin profile management (create, edit, delete)
- Dev Score formula:
  - `(GitHub Repos x 2) + (LeetCode Solved x 3) + (YouTube Videos x 1)`

## Tech Stack

- Frontend: React, Vite, Tailwind CSS, Framer Motion
- Backend: Node.js, Express, Mongoose
- Database: MongoDB
- API calls: Axios

## Project Structure

```text
dev-profile-aggregator/
  client/
    src/components/
    src/context/
    src/pages/
    src/services/
  server/
    controllers/
    middleware/
    models/
    routes/
    services/
    server.js
  database/
  README.md
```

## Prerequisites

- Node.js 18+ (recommended)
- npm 9+
- MongoDB local/Atlas connection string

## Environment Variables

### Server (`server/.env`)

Copy `server/.env.example` to `server/.env`, then set:

```env
PORT=5001
MONGODB_URI=your_mongodb_connection_string
CLIENT_URL=http://localhost:5173
CLIENT_URLS=https://your-frontend.onrender.com,https://another-frontend-domain.com
JWT_SECRET=your_long_random_secret
ADMIN_EMAIL=admin@devprofile.local
ADMIN_PASSWORD=your_admin_password
GITHUB_TOKEN=optional_github_personal_access_token
YOUTUBE_API_KEY=your_google_youtube_data_api_key
```

### Client (`client/.env`)

Copy `client/.env.example` to `client/.env`, then set:

```env
VITE_API_BASE_URL=http://localhost:5001/api
```

## Installation

Install root + app dependencies:

```bash
npm install
npm install --prefix server
npm install --prefix client
```

## Run Locally

Start both server and client:

```bash
npm run dev
```

Expected:

- Client: `http://localhost:5173`
- API: `http://localhost:5001/api`

## Scripts

### Root

- `npm run dev` - run server + client together
- `npm run dev:server` - run backend only
- `npm run dev:client` - run frontend only
- `npm run build` - build frontend
- `npm run start` - run backend in production mode

### Server

- `npm run dev --prefix server`
- `npm run start --prefix server`

### Client

- `npm run dev --prefix client`
- `npm run build --prefix client`
- `npm run preview --prefix client`

## App Routes

### Public

- `/login`

### Student

- `/student-dashboard` - own dashboard
- `/student` - edit own profile + verify stats
- `/leaderboard` - ranked cards + profile viewing

### Shared (Student + Admin)

- `/student-dashboard/:username` - view selected student dashboard
- `/home`

### Admin

- `/admin` - manage student profiles
- `/dashboard` - switch and view profiles
- `/profile/:id` - detailed profile page (admin route)

## API Summary

### Auth

- `POST /api/auth/register-student`
- `POST /api/auth/login`
- `GET /api/auth/me`

### Profiles

- `POST /api/profiles/verify`
- `GET /api/profiles/leaderboard`
- `GET /api/profiles/dev-card/:username`
- `GET /api/profiles/public/:username`
- `GET /api/profiles/me`
- `PUT /api/profiles/me`
- `GET /api/profiles` (admin)
- `POST /api/profiles` (admin)
- `GET /api/profiles/:id`
- `PUT /api/profiles/:id` (admin)
- `DELETE /api/profiles/:id` (admin)

## Security Notes

- `.env` files are gitignored.
- Keep only `.env.example` in GitHub.
- If any real key/password was ever exposed, rotate it before deploying.

## Deployment (Suggested)

- Frontend: Vercel
- Backend: Render
- Database: MongoDB Atlas
