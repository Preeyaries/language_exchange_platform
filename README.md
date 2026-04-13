# Bello! — Language Exchange Platform

A full-stack web application that connects language learners around the world. Users can create profiles, post language exchange requests, follow each other, and chat in real time.

> **Live App:** http://13.54.163.145:5173
> **Live API:** http://13.54.163.145:5000
> **GitHub:** https://github.com/Preeyaries/language_exchange_platform


//User Account
//Username:
//password:

//Admin Account
//Username:
//password:

---

## Test Accounts

### User Account
| Field | Value |
|-------|-------|
| Email | kebby.monster@gmail.com |
| Password | Ploy250240@ |

### Admin Account
| Field | Value |
|-------|-------|
| Email | admin@bello.com |
| Password | Admin1234! |

---

## Features

- **Authentication** — Register (multi-step), Login, JWT-based auth, Role-based access (User / Admin)
- **Profile** — View & edit profile, language bar with CEFR levels, personal interests, bio
- **Follow System** — Follow / Unfollow users, real-time follower counts
- **Posts** — Create posts with topics, feed with search & language filter, Like / Comment / Translate
- **Messaging** — Direct messages between users, conversation list with unread badge
- **Admin Panel** — User management (suspend/unsuspend), Post management, Tag management
- **CI/CD** — GitHub Actions pipeline with Jest tests, deployed on AWS EC2 with PM2

---

<<<<<<< HEAD
=======
## Tech Stack

>>>>>>> f1d72f41640732fad97e6a8aa3b4f959781ba8c1
### Frontend
| Technology | Version |
|------------|---------|
| React | 19.x |
| Vite | 8.x |
| React Router DOM | 6.x |
| Axios | latest |

### Backend
| Technology | Version |
|------------|---------|
| Node.js | 22.x |
| Express.js | 5.x |
| MongoDB | Atlas |
| Mongoose | latest |
| JWT | jsonwebtoken |
| bcryptjs | latest |

### DevOps
| Technology | Purpose |
|------------|---------|
| AWS EC2 | Cloud hosting |
| PM2 | Process manager |
| GitHub Actions | CI/CD pipeline |
| Jest + Supertest | Testing |

---

## Project Structure

```
language_exchange_platform/
├── .github/
│   └── workflows/
│       └── ci.yml          # GitHub Actions CI/CD
├── backend/
│   ├── controllers/           # Route handlers
│   ├── middleware/            # Auth, error handling
│   ├── models/                # Mongoose schemas
│   ├── routes/                # Express routes
│   ├── test/                  # Jest test files
│   ├── app.js                 # Express app
│   ├── server.js              # Entry point
│   └── .env                   # Environment variables (not committed)
└── frontend/
    ├── src/
    │   ├── api/               # Axios instance
    │   ├── components/        # Reusable components
    │   ├── pages/             # Page components
    │   │   └── admin/         # Admin pages
    │   └── App.jsx
    └── vite.config.js
```

---

## Installation & Setup

### Prerequisites
- Node.js 18+
- MongoDB Atlas account
- Git

### 1. Clone the repository
```bash
git clone https://github.com/Preeyaries/language_exchange_platform.git
cd language_exchange_platform
```

### 2. Setup Backend
```bash
cd backend
npm install
```

Create a `.env` file in the `backend/` directory:
```env
MONGODB_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/language_exchange
JWT_SECRET=your_jwt_secret
PORT=5000
```

Start the backend:
```bash
npm start
```

### 3. Setup Frontend
```bash
cd frontend
npm install
npm run dev
```

Frontend will run at `http://localhost:5173`

### 4. Run Tests
```bash
cd backend
npm test
```

---

## 📡 API Endpoints

### Auth
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register new user |
| POST | `/api/auth/login` | Login |
| GET | `/api/auth/me` | Get current user |

### Profile
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/profile` | Get own profile |
| GET | `/api/profile/:id` | Get user profile by ID |
| PUT | `/api/profile` | Update own profile |

### Posts
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/posts` | Get all posts |
| POST | `/api/posts` | Create post |
| GET | `/api/posts/my-posts` | Get my posts |
| GET | `/api/posts/user/:userId` | Get posts by user |
| PUT | `/api/posts/:id` | Update post |
| DELETE | `/api/posts/:id` | Delete post |

### Follow
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/follow/:id` | Follow user |
| DELETE | `/api/follow/:id` | Unfollow user |
| GET | `/api/follow/status/:id` | Check follow status |

### Messages
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/messages/conversations` | Get all conversations |
| GET | `/api/messages/:userId` | Get messages with user |
| POST | `/api/messages/:userId` | Send message |

### Admin
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/admin/users` | Get all users |
| PUT | `/api/admin/users/:id/suspend` | Suspend user |
| PUT | `/api/admin/users/:id/unsuspend` | Unsuspend user |
| GET | `/api/admin/reports` | Get all reports |
| DELETE | `/api/admin/posts/:id` | Delete post as admin |

---

## CI/CD Pipeline

GitHub Actions automatically runs tests on every push to `main`:

```yaml
name: CI
on:
  push:
    branches: [main]
  pull_request:
    branches: [main]
jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - Checkout code
      - Setup Node.js 18
      - Install dependencies
      - Run Jest tests
```

---

## Branching Strategy

| Branch | Purpose |
|--------|---------|
| `main` | Production-ready code |
| `feature/auth-fix` | Authentication & protected routes |
| `feature/profile-crud` | Profile management & follow system |
| `feature/post-crud` | Posts & feed |
| `feature/admin-panel` | Admin dashboard |

---

## Developer

**Preeyanan Khamfoei** — QUT IFN636 Software Life Cycle
GitHub: [@Preeyaries](https://github.com/Preeyaries)
