# Task Management Application

A full-stack task management web application with user authentication, CRUD operations, and real-time updates.

## Check out the Taskflow - https://taskflow-task-management-blue.vercel.app/login

## Features

- User authentication & authorization (JWT-based)
- Create, read, update, and delete tasks
- Real-time task updates (WebSockets)
- Responsive design for web and mobile
- Modern UI with TailwindCSS and shadcn/ui

## Tech Stack

### Backend
- Node.js with Express
- MongoDB with Mongoose
- JWT for authentication
- Socket.io for real-time updates
- bcryptjs for password hashing

### Frontend
- React with Vite
- TailwindCSS for styling
- shadcn/ui for UI components
- Axios for API calls
- Socket.io-client for real-time updates

## Getting Started

### Prerequisites
- Node.js (v18 or higher) - Download from https://nodejs.org/
- MongoDB (local instance or MongoDB Atlas) - Download from https://www.mongodb.com/try/download/community

### Installation

1. Install Node.js if not already installed:
   - Download and install from https://nodejs.org/
   - Verify installation: `node --version` and `npm --version`

2. Install MongoDB if not already installed:
   - Download and install from https://www.mongodb.com/try/download/community
   - Start MongoDB service (Windows: Run as MongoDB service or use `mongod` command)

3. Install dependencies:
```bash
npm run install:all
```

4. Environment variables are already configured:
   - Backend `.env` is set up with default values
   - Frontend `.env` is set up with default values
   - You can modify these if needed (e.g., change MongoDB URI or JWT secret)

5. Start the development servers:
```bash
npm run dev
```

The backend will run on `http://localhost:5000` and the frontend on `http://localhost:5173`.

### Troubleshooting

If npm is not recognized:
- Make sure Node.js is installed and added to your PATH
- Restart your terminal/command prompt after installation
- Try running `node -v` to verify Node.js is installed

If MongoDB connection fails:
- Ensure MongoDB is running (check MongoDB service or run `mongod`)
- Update the MONGODB_URI in `backend/.env` if using a different connection string

## Environment Variables

Backend `.env`:
```
PORT=5000
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret_key
NODE_ENV=development
```

## API Endpoints

### Authentication
- POST `/api/auth/register` - Register a new user
- POST `/api/auth/login` - Login user
- GET `/api/auth/me` - Get current user

### Tasks
- GET `/api/tasks` - Get all tasks for authenticated user
- POST `/api/tasks` - Create a new task
- PUT `/api/tasks/:id` - Update a task
- DELETE `/api/tasks/:id` - Delete a task
- PATCH `/api/tasks/:id/complete` - Mark task as complete/incomplete

## Project Structure

```
task-management/
├── backend/
│   ├── config/
│   ├── controllers/
│   ├── middleware/
│   ├── models/
│   ├── routes/
│   ├── server.js
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── context/
│   │   ├── hooks/
│   │   ├── lib/
│   │   ├── pages/
│   │   └── App.jsx
│   ├── index.html
│   ├── package.json
│   └── vite.config.js
└── package.json
```
