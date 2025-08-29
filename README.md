# ⚽ IIE Football Tournament 2025

[![Live Demo](https://img.shields.io/badge/Live-Demo-brightgreen)](https://your-app-url.com)
[![License](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Node.js](https://img.shields.io/badge/Node.js-18+-green.svg)](https://nodejs.org/)
[![React](https://img.shields.io/badge/React-19.1-blue.svg)](https://reactjs.org/)

A real-time football tournament management system for the **Ideal Institute of Engineering, Kalyani**. This application provides live match tracking, team management, player statistics, and real-time score updates with WebSocket integration.

## 🏆 Features

### 🔴 Live Match Management

- **Real-time match tracking** with WebSocket connections
- **Live timer** for match halves, extra time, and penalty shootouts
- **Live score updates** with instant goal notifications
- **Match stage management** (First Half, Halftime, Second Half, Extra Time, Penalty Shootout)
- **Admin controls** for match operations (start, pause, resume, finish)

### 👥 Team & Player Management

- **Team creation and management** with leaderboard rankings
- **Player registration** and team assignments
- **Goal tracking** per player with match context
- **Team statistics** and performance analytics

### 📊 Admin Dashboard

- **Match scheduling** and management
- **Live match controls** with real-time updates
- **Team and player CRUD operations**
- **Tournament administration** interface

### 📱 Responsive Design

- **Mobile-first** responsive design
- **Real-time updates** across all connected devices
- **Clean UI** with Tailwind CSS
- **Live status indicators** and notifications

## 🛠️ Tech Stack

### Backend

- **Node.js** + **Express.js** - RESTful API server
- **Socket.IO** - Real-time WebSocket communication
- **Prisma ORM** - Database management and migrations
- **PostgreSQL** - Primary database
- **TypeScript** - Type-safe development
- **Bun** - Package manager and runtime

### Frontend

- **React 19** - Modern UI framework
- **TypeScript** - Type-safe frontend development
- **Vite** - Fast build tool and dev server
- **Tailwind CSS** - Utility-first CSS framework
- **Socket.IO Client** - Real-time client connections
- **React Router** - Client-side routing
- **React Hook Form** - Form management

### Database Schema

```prisma
- Match (live tracking, stages, scores)
- Team (tournament teams)
- Player (team members)
- Goal (match scoring events)
```

## 🚀 Quick Start

### Prerequisites

- **Node.js 18+**
- **PostgreSQL** database
- **Bun** (recommended) or npm

### 1. Clone the Repository

```bash
git clone https://github.com/iietechclub/outdoor-football.git
cd outdoor-football
```

### 2. Backend Setup

```bash
cd backend

# Install dependencies
bun install

# Set up environment variables
cp .env.example .env
# Edit .env with your database credentials

# Database setup
bunx prisma migrate dev
bunx prisma generate

# Start development server
bun run dev
```

### 3. Frontend Setup

```bash
cd client

# Install dependencies
bun install

# Start development server
bun run dev
```

### 4. Environment Variables

Create `.env` file in the backend directory:

```env
DATABASE_URL="postgresql://username:password@localhost:5432/football_tournament"
NODE_ENV="development"
PORT=3000

# Match timing configuration (in minutes)
HALF_DURATION=15
EXTRA_TIME_DURATION=15
PENALTY_SHOOTOUT_DURATION=15
```

## 📁 Project Structure

```
outdoor-football/
├── backend/                 # Node.js + Express backend
│   ├── src/
│   │   ├── controllers/     # API route handlers
│   │   │   ├── live.ts      # Live match WebSocket events
│   │   │   ├── matches.ts   # Match CRUD operations
│   │   │   ├── players.ts   # Player management
│   │   │   └── teams.ts     # Team management
│   │   ├── routes/          # Express route definitions
│   │   ├── lib/
│   │   │   └── prisma.ts    # Database client setup
│   │   └── index.ts         # Main server + Socket.IO setup
│   ├── prisma/
│   │   ├── schema.prisma    # Database schema
│   │   └── migrations/      # Database migrations
│   └── package.json
│
├── client/                  # React frontend
│   ├── src/
│   │   ├── components/      # Reusable UI components
│   │   │   ├── Card.tsx
│   │   │   ├── Navbar.tsx
│   │   │   ├── Footer.tsx
│   │   │   └── Leaderboard.tsx
│   │   ├── pages/           # Main application pages
│   │   │   ├── HomePage.tsx     # Live match viewing
│   │   │   ├── AdminPage.tsx    # Admin dashboard
│   │   │   └── Admin/           # Admin sub-pages
│   │   │       ├── LiveMatchPage.tsx
│   │   │       ├── MatchesPage.tsx
│   │   │       ├── PlayersPage.tsx
│   │   │       └── TeamsPage.tsx
│   │   ├── context/
│   │   │   └── SocketProvider.tsx  # WebSocket context
│   │   ├── hooks/
│   │   │   └── useTimer.ts      # Live timer hook
│   │   └── lib/
│   │       ├── config.ts        # App configuration
│   │       └── utils.ts         # Utility functions
│   └── package.json
```

## 🔌 API Endpoints

### Teams

- `GET /api/teams` - Get all teams
- `GET /api/teams/leaderboard` - Get team leaderboard
- `POST /api/teams` - Create team
- `PUT /api/teams/:id` - Update team
- `DELETE /api/teams/:id` - Delete team

### Players

- `GET /api/players` - Get all players
- `GET /api/players/team/:teamId` - Get players by team
- `POST /api/players` - Create player
- `PUT /api/players/:id` - Update player
- `DELETE /api/players/:id` - Delete player

### Matches

- `GET /api/matches` - Get all matches
- `POST /api/matches` - Create match
- `PUT /api/matches/:id` - Update match
- `DELETE /api/matches/:id` - Delete match

### Live Match Control

- `GET /api/live/match` - Get current live match
- `POST /api/live/start/:id` - Start live match

## 🔄 WebSocket Events

### Client → Server

```typescript
"timer:request"; // Request current timer state
"match:request"; // Request current match info
"match:pause"; // Pause current match
"match:resume"; // Resume current match
"match:declare-halftime"; // Declare halftime
"match:start-secondHalf"; // Start second half
"match:start-extraTime"; // Start extra time
"match:start-penaltyShootout"; // Start penalty shootout
"match:make-goal"; // Record a goal
"match:finish"; // Finish match
```

### Server → Client

```typescript
"timer:start"; // Timer started with duration
"timer:pause"; // Timer paused with remaining time
"timer:resume"; // Timer resumed with remaining time
"timer:stop"; // Timer stopped
"timer:update"; // Timer tick update
"match:info"; // Match information update
"goal:scored"; // Goal scored notification
```

## 🎮 Usage

### For Administrators

1. **Access Admin Panel**: Navigate to `/admin`
2. **Create Teams**: Add participating teams
3. **Register Players**: Add players to teams
4. **Schedule Matches**: Create match fixtures
5. **Start Live Match**: Begin real-time tracking
6. **Control Match**: Use live controls for match flow
7. **Record Goals**: Track scoring events in real-time

### For Viewers

1. **Visit Homepage**: View live match information
2. **Real-time Updates**: See live scores and timer
3. **Team Leaderboard**: Check current standings
4. **Match History**: View completed matches

## 🚀 Deployment

### Backend Deployment

```bash
cd backend
bun run build
bun run start
```

### Frontend Deployment

```bash
cd client
bun run build
# Serve dist/ folder with your preferred static host
```

### Environment Setup

- Set `NODE_ENV=production`
- Configure production database URL
- Set appropriate CORS origins
- Configure static file serving for production

## 🤝 Contributing

1. **Fork the repository**
2. **Create feature branch**: `git checkout -b feature/amazing-feature`
3. **Commit changes**: `git commit -m 'Add amazing feature'`
4. **Push to branch**: `git push origin feature/amazing-feature`
5. **Open Pull Request**

### Development Guidelines

- Follow TypeScript best practices
- Maintain consistent code formatting
- Write descriptive commit messages
- Test WebSocket functionality thoroughly
- Ensure responsive design compatibility

## 📋 Available Scripts

### Backend Scripts

```bash
bun run dev          # Start development server with hot reload
bun run start        # Start production server
```

### Frontend Scripts

```bash
bun run dev          # Start Vite dev server
bun run build        # Build for production
bun run preview      # Preview production build
bun run lint         # Run ESLint
```

### Database Scripts

```bash
bunx prisma migrate dev      # Run database migrations
bunx prisma generate         # Generate Prisma client
bunx prisma studio          # Open Prisma Studio
bunx prisma db push         # Push schema changes
```

## 🐛 Troubleshooting

### WebSocket Connection Issues

1. **Check Backend Server**: Ensure backend is running on port 3000
2. **CORS Configuration**: Verify CORS settings allow your client origin
3. **Network Issues**: Check firewall and network connectivity
4. **Browser DevTools**: Monitor WebSocket connections in Network tab

### Database Issues

1. **Connection String**: Verify DATABASE_URL is correct
2. **Migrations**: Run `bunx prisma migrate dev` to apply latest schema
3. **Client Generation**: Run `bunx prisma generate` after schema changes

### Common Errors

- **Foreign Key Constraints**: When deleting teams/players with related data
- **Timer Synchronization**: WebSocket connection required for live timer
- **Match State**: Ensure match is properly initialized before starting

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👨‍💻 Created By

**IIE Tech Club**  
Ideal Institute of Engineering, Kalyani

---

<div align="center">
  <p>⚽ Built with passion for football and technology ⚽</p>
  <p><strong>Real-time tournament management for the modern era</strong></p>
</div>
