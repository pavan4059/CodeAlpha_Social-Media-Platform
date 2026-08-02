# ⚡ Pulse — The Next-Generation Social Sphere

<div align="center">
  <p>
    <strong>A world-class, real-time reactive full-stack micro-social network engineered with a Cyber-Violet design system, self-healing MongoDB fallback engine, and live developer community streaming.</strong>
  </p>
  <p>
    <img src="https://img.shields.io/badge/Node.js-v18+-339933?style=for-the-badge&logo=nodedotjs&logoColor=white" alt="Node.js" />
    <img src="https://img.shields.io/badge/Express-API-000000?style=for-the-badge&logo=express&logoColor=white" alt="Express" />
    <img src="https://img.shields.io/badge/MongoDB-Mongoose-47A248?style=for-the-badge&logo=mongodb&logoColor=white" alt="MongoDB" />
    <img src="https://img.shields.io/badge/Architecture-Reactive_SPA-7952B3?style=for-the-badge&logo=javascript&logoColor=white" alt="SPA" />
    <img src="https://img.shields.io/badge/Real--Time_Stream-Dev.to_%2B_HackerNews-00F2FE?style=for-the-badge&logo=devdotto&logoColor=black" alt="Live Stream" />
  </p>
</div>

---

## 🌟 Executive Summary

**Pulse** is a premium, full-stack micro-social platform built from scratch to push the boundaries of reactive single-page applications (SPAs). Inspired by platforms like Twitter/X, Pulse breaks away from generic designs by implementing a bespoke **Cyber-Violet & Deep Indigo Dark Mode** aesthetic powered entirely by Vanilla HTML5, CSS3 Tokens, and high-performance JavaScript logic.

On the backend, Pulse runs a rock-solid **Node.js + Express.js RESTful API** backed by **Mongoose & MongoDB**. To eliminate setup friction and guarantee 100% reliable local development without background daemons, Pulse features an autonomous **self-healing local database engine** and seamlessly merges your live personal network with global engineering discussions from **Dev.to** and **Hacker News**.

---

## 🚀 Key Architectural Innovation & Features

### 1. Zero-Interrupt Self-Healing Database Engine
Never get blocked by missing MongoDB installations or port configuration conflicts again!
- **Auto-Fallback Mechanism**: When launching `node server.js`, the application attempts to connect to your configured external MongoDB instance (`127.0.0.1:27017`). If unreachable, Mongoose seamlessly initiates an embedded in-memory MongoDB engine via `mongodb-memory-server`.
- **Automated Seeder Engine**: Upon connecting to an empty database, Pulse automatically runs a high-fidelity data seeder (`seeders/seed.js`) that injects **6 authentic user accounts**, interactive follower connections, timeline posts with Unsplash media attachments, and conversational threaded replies.

### 2. Real-Time Global Stream Blend
Pulse solves the social media "cold-start" problem by weaving real-world global discussions directly into your stream:
- **Blended "For You" Feed**: Seamlessly combines authored posts from your local MongoDB database with live trending technology articles from **Dev.to** and **Hacker News Live JSON**.
- **Fault-Tolerant Memory Caching**: Our backend service (`services/liveStreamService.js`) maintains a resilient 5-minute memory cache. Even if external developer APIs experience rate limits or network disruptions, your timeline serves instantly in sub-milliseconds without breaking or delaying user interactions.
- **Visual Stream Badging**: External cards feature an illuminated neon cyan border around author portraits and a glowing badge (`📡 Live Dev.to` / `Live HackerNews`), with a dedicated button to open the canonical community discussions in a browser tab.

### 3. High-Performance Reactive SPA Client
Built without heavyweight bundle frameworks, the frontend leverages pure, optimized reactive state logic:
- **Optimistic UI Transitions**: Liking a post or following an account immediately triggers kinetic scale bounce micro-animations and updates DOM counters instantly without waiting for network latency.
- **Client-Side Hash Routing**: Smoothly transition between your "For You" Feed, curated "Following" network, automated "Explore / Who to Follow" widgets, and customized user profiles without a single page refresh.
- **Interactive Discussion Modal**: Read and engage in real-time comment replies through a sleek glassmorphic floating overlay.

### 4. Enterprise-Grade Security
- **JWT Session Encryption**: Secure JSON Web Token authentication stored in local state and validated across all private REST endpoints via Express middleware.
- **Bcrypt Password Hashing**: Cryptographical salt and password hashing guaranteeing absolute credential privacy.
- **XSS Sanitization**: Built-in HTML escaping across all user-submitted pulse contents, names, and bio inputs.

---

## 🛠️ Technology Stack

| Layer | Technologies & Frameworks | Role in Architecture |
| :--- | :--- | :--- |
| **Frontend Core** | **HTML5, Vanilla CSS3, JavaScript (ES6+)** | Responsive DOM structure, HSL cyber-violet tokens, reactive SPA router. |
| **Backend API** | **Node.js, Express.js** | Non-blocking RESTful routing, payload validation, CORS handling. |
| **Database Engine** | **Mongoose, MongoDB, Mongo-Memory-Server** | Document schemas, indexing (`createdAt: -1`), atomic array reactions (`$addToSet`), automatic embedded database fallback. |
| **Security & Auth** | **Bcrypt.js, JSON Web Tokens (JWT), Dotenv** | Credential hashing, cryptographic session signing, environmental variables. |
| **Live Stream** | **Dev.to API, Hacker News Firebase API** | Asynchronous JSON fetching with fault-tolerant TTL memory cache. |

---

## 🏎️ Quick Start & Local Installation

### Prerequisites
- **Node.js**: Version v18.0.0 or higher installed on your operating system.
- **MongoDB** *(Optional)*: An external MongoDB instance on port `27017` is supported, but not required thanks to the self-contained in-memory fallback engine!

### Installation Instructions
1. **Clone the Repository**:
   ```bash
   git clone https://github.com/pavan4059/CodeAlpha_Social-Media-Platform.git
   cd CodeAlpha_Social-Media-Platform
   ```

2. **Install Node Dependencies**:
   ```bash
   npm install
   ```

3. **Configure Environment Variables**:
   Copy the example template to create your `.env` configuration file:
   ```bash
   cp .env.example .env
   ```
   *(Default Port: `5050` | Default Secret: `pulse_ultra_secret_jwt_key_2026_x_gen`)*

4. **Launch the Application Server**:
   ```bash
   npm start
   ```
   The terminal will log database connection confirmation and automatic seeding success.

5. **Open in Your Web Browser**:
   Navigate to: **[http://localhost:5050/](http://localhost:5050/)**

---

## 🔑 Instant Test Account Credentials

Whenever the application boots on a clean database, it seeds **6 fully realized professional test accounts**. You can log into any of these accounts immediately on the home screen using the uniform default password:

> **Universal Test Password:** `password123`

| Username Handle | Display Name | Role & Vibe | Follower Network |
| :--- | :--- | :--- | :--- |
| **`pawan_kalyan`** | Pawan Kalyan | Full Stack Architect & Visionary Builder | 5 Followers |
| **`alex_dev`** | Alex Chen | Senior AI Systems Engineer @ DeepMind | 4 Followers |
| **`elena_design`** | Elena Rostova | Lead Product & UI/UX Design Lead | 3 Followers |
| **`marcus_photog`** | Marcus Vance | Cyber-Noir Conceptual Artist | 2 Followers |
| **`sophia_ai`** | Dr. Sophia Carter | AI Safety & Generative Intelligence Researcher | 3 Followers |
| **`dev_oracle`** | The Code Oracle | Clean Code Zealot & Runtime Speed Enthusiast | 1 Follower |

---

## 📡 RESTful API Documentation

### Authentication Routes (`/api/auth`)
| HTTP Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/auth/register` | Register a new user profile & receive JWT token | No |
| `POST` | `/api/auth/login` | Log in with username/email & password | No |
| `GET` | `/api/auth/me` | Resolve current authenticated session profile | **Yes (JWT)** |

### Post & Stream Routes (`/api/posts`)
| HTTP Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/posts?type=all` | Fetch combined "For You" stream (MongoDB + Live Dev.to/HN) | **Yes (JWT)** |
| `GET` | `/api/posts?type=following`| Fetch curated stream strictly from followed MongoDB accounts | **Yes (JWT)** |
| `POST` | `/api/posts` | Publish a new Pulse with optional media attachments | **Yes (JWT)** |
| `GET` | `/api/posts/:id` | Fetch specific post details and metadata | **Yes (JWT)** |
| `DELETE` | `/api/posts/:id` | Permanently delete authored pulse and discussion threads | **Yes (JWT)** |
| `POST` | `/api/posts/:id/like` | Atomically toggle Like reaction ($addToSet / $pull) | **Yes (JWT)** |

### Discussion Comment Routes (`/api/posts/:id/comments`)
| HTTP Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/posts/:id/comments` | Retrieve chronological comment threads for a pulse | **Yes (JWT)** |
| `POST` | `/api/posts/:id/comments` | Publish a new reply comment and increment post counter | **Yes (JWT)** |

### User Profile & Social Network Routes (`/api/users`)
| HTTP Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/users/:username` | Retrieve full user profile, stats, and authored pulses | **Yes (JWT)** |
| `PUT` | `/api/users/profile` | Update bio, display name, avatar URL, or banner cover photo | **Yes (JWT)** |
| `POST` | `/api/users/:id/follow` | Atomically toggle bi-directional Follow / Unfollow connection | **Yes (JWT)** |
| `GET` | `/api/users/explore/suggestions` | Fetch intelligent creator recommendations for "Who to Follow" | **Yes (JWT)** |

---

## 📂 Project Repository Structure

```text
CodeAlpha_Social-Media-Platform/
│
├── config/
│   └── db.js                       # Mongoose connection & automated embedded Mongo engine fallback
├── controllers/
│   ├── authController.js           # Registration, login, and JWT session handling
│   ├── postController.js           # Feed indexing, creation, deletion, and reaction mechanics
│   └── userController.js           # Profile resolution, bio customization, and follow engine
├── middleware/
│   └── authMiddleware.js           # JWT verification & protected route boundary validation
├── models/
│   ├── Comment.js                  # Mongoose Comment schema & relationship referencing
│   ├── Post.js                     # Mongoose Post schema indexed by timestamp
│   └── User.js                     # Mongoose User profile schema with bcrypt pre-save formatting
├── public/                         # Static Web Application Client (Reactive SPA)
│   ├── css/
│   │   └── style.css               # Cyber-Violet & Deep Indigo design system tokens
│   ├── js/
│   │   ├── api.js                  # Asynchronous HTTP REST API request wrapper
│   │   ├── app.js                  # SPA view routing, composer state, and discussion modal engine
│   │   ├── auth.js                 # LocalStorage token persistence & registration form handling
│   │   └── components.js           # Dynamic DOM renderer with optimistic micro-interaction binding
│   └── index.html                  # Responsive SPA canvas (3-column desktop / bottom bar mobile)
├── routes/
│   ├── auth.js                     # Authentication routing pipeline
│   ├── posts.js                    # Timeline post and discussion thread routes
│   └── users.js                    # Profile and follower network routes
├── seeders/
│   └── seed.js                     # Automated high-fidelity developer database seeder
├── services/
│   └── liveStreamService.js        # Real-time Dev.to & Hacker News fetcher with 5-min TTL memory cache
├── .env.example                    # Environmental variable template
├── .gitignore                      # Git tracking exclusion definitions
├── package.json                    # Node script definitions and dependencies
├── README.md                       # Complete application architectural documentation
└── server.js                       # Express application bootstrap & port listener
```

---

<div align="center">
  <p>Engineered for excellence and speed. Built with ❤️ by Pawan Kalyan.</p>
</div>