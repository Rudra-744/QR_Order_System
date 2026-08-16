# 🍽️ Rimi — Production-Grade QR Restaurant Ordering System

[![React](https://img.shields.io/badge/React-19.0-61DAFB?style=for-the-badge&logo=react&logoColor=white)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-7.3-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev/)
[![Node.js](https://img.shields.io/badge/Node.js-Express%205-339933?style=for-the-badge&logo=node.js&logoColor=white)](https://nodejs.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Mongoose%209-47A248?style=for-the-badge&logo=mongodb&logoColor=white)](https://www.mongodb.com/)
[![Socket.IO](https://img.shields.io/badge/Socket.io-Admin%20Acceleration-010101?style=for-the-badge&logo=socket.io&logoColor=white)](https://socket.io/)
[![TailwindCSS](https://img.shields.io/badge/Tailwind_CSS-v4-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![Jest](https://img.shields.io/badge/Jest-Automated%20Tests-C21325?style=for-the-badge&logo=jest&logoColor=white)](https://jestjs.io/)

A modern, high-performance, and secure contactless dining experience. Customers scan table-specific QR codes to instantly browse dynamic menus and place orders without waiting for staff. Admin restaurant staff receive real-time audio-visual notifications on their dashboard.

---

## 🌟 Key Architecture & Highlights

- ⚡ **Zero-Latency Customer Experience**: Fast React 19 + Vite frontend with TanStack React Query caching and smart polling (replaces noisy client WebSockets to preserve customer privacy).
- 🛡️ **Server-Authoritative Pricing & Integrity**: Client order requests only transmit `itemId` and `qty`. Item prices, names, and availability are enforced strictly by the backend database to prevent payload spoofing.
- 🔁 **Idempotent Order Creation**: Powered by UUIDv4 idempotency keys to prevent duplicate transactions during network instability or accidental multi-clicks.
- 🔔 **Admin Real-Time Acceleration**: Isolated, authenticated Socket.IO rooms for restaurant staff with lazy module loading (`AdminWrapper`) so customer bundles stay ultra-lightweight.
- 📱 **Fluid Multi-Screen Responsiveness**: High-converting, animated mobile-first menu that seamlessly adapts into 2, 3, 4, or 5-column grid layouts for iPads and desktop displays.
- 🧪 **Automated Testing Suite**: End-to-end integration tests using **Jest**, **Supertest**, and **mongodb-memory-server**.

---

## 🚀 System Architecture

```
[ Customer Phone ] ─── (QR Scan) ───► [ React / Vite Menu ]
                                            │
                                 (REST + Idempotency)
                                            │
                                            ▼
                                   [ Express 5 Backend ]
                                  /          │          \
                     (Joi Validate)   (Server Auth)   (Mongo DB)
                                  \          │          /
                                            ▼
                               [ Real-Time Socket Event ]
                                            │
                                            ▼
                                  [ Admin Dashboard ]
```

---

## 🛠️ Tech Stack

### Frontend (`frontend2`)
- **Framework**: React 19 + Vite
- **Data Fetching & State**: TanStack React Query + Custom Hooks
- **Styling**: Tailwind CSS v4 + Vanilla CSS Design Tokens
- **Animations**: Framer Motion
- **Icons & Typography**: React Icons, Custom Rink typography
- **Bundling Optimization**: Code-splitting with lazy Admin Socket isolation

### Backend (`Backend`)
- **Runtime**: Node.js (v18+) & Express 5
- **Database**: MongoDB with Mongoose ODM
- **Real-Time Engine**: Socket.IO (Admin dashboard channel)
- **Security**: JWT Authentication, Helmet, Rate Limiting, HTTP Compression
- **Validation**: Joi Schema Validation
- **Testing**: Jest + Supertest + `mongodb-memory-server`

---

## 📁 Repository Structure

```
QR_Order_System/
├── Backend/
│   ├── config/              # MongoDB & JWT configuration
│   ├── controllers/         # Auth, Menu, Order, and Admin business logic
│   ├── middleware/          # JWT auth, rate limiter, error handlers
│   ├── models/              # Admin, MenuItem, Order, Table schemas
│   ├── routes/              # Express API route declarations
│   ├── tests/               # Jest integration test suites
│   ├── validations/         # Joi schema validations
│   ├── Seed.js              # Initial database seeder
│   ├── server.js            # Express & HTTP server entry point
│   └── socket.js            # Socket.IO event setup
│
├── frontend2/
│   ├── src/
│   │   ├── api/             # Axios client and React Query hooks
│   │   ├── components/      # Admin dashboard and UI components
│   │   │   ├── customer/    # MenuHeader, CategoryNav, MenuItemCard, Cart
│   │   │   └── ui/          # Error boundaries, Skeleton loaders
│   │   ├── hooks/           # useCart, useActiveOrders custom hooks
│   │   ├── pages/           # Customer Menu, Admin Dashboard, Login, Signup
│   │   ├── App.jsx          # Route declarations
│   │   └── main.jsx         # App mounting point
│   └── public/              # Brand logos and font assets
│
└── QR-Code/                 # Pre-generated table QR code assets
```

---

## 💻 Getting Started Locally

### Prerequisites
- **Node.js** (v18.x or higher)
- **MongoDB** (Local instance or free MongoDB Atlas URI)
- **Git**

---

### 1. Clone the Project

```bash
git clone https://github.com/Rudra-744/QR_Order_System.git
cd QR_Order_System
```

---

### 2. Backend Setup

```bash
cd Backend
npm install
```

Create a `.env` file in the `Backend` directory:
```env
PORT=5000
MONGO_URI=mongodb://127.0.0.1:27017/qr_orders
JWT_SECRET=your_super_secret_production_key_here
NODE_ENV=development
```

Seed initial restaurant & menu data:
```bash
node Seed.js
```

Start the backend development server:
```bash
npm run dev
```
> Server will be running at `http://localhost:5000`

---

### 3. Frontend Setup

Open a new terminal window:
```bash
cd frontend2
npm install
```

Create a `.env` file in the `frontend2` directory:
```env
VITE_API_URL=http://localhost:5000/api
VITE_SOCKET_URL=http://localhost:5000
```

Start the frontend development server:
```bash
npm run dev
```
> Customer Menu will be available at `http://localhost:5173/?restaurantId=<YOUR_ID>&tableNumber=1`  
> Admin Dashboard will be available at `http://localhost:5173/admin`

---

### 4. Running Automated Tests

Run the complete backend integration test suite:
```bash
cd Backend
npm test
```

---

## 🔒 Production API Reference

### 📋 Customer & Order API
| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| `GET` | `/api/menu?restaurantId=...` | Retrieve menu items for a restaurant | No |
| `POST` | `/api/orders` | Place a server-authoritative order | No (Idempotency Key supported) |
| `GET` | `/api/orders/:id` | Poll order status updates | No |

### 👨‍🍳 Admin API
| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| `POST` | `/api/admin/signup` | Register restaurant admin account | No |
| `POST` | `/api/admin/login` | Authenticate admin & receive JWT | No |
| `GET` | `/api/admin/orders` | Fetch active restaurant orders | Yes (Bearer JWT) |
| `PATCH` | `/api/orders/:id/status` | Update status (`approved`, `rejected`, `completed`) | Yes (Bearer JWT) |
| `POST` | `/api/menu` | Add new menu item | Yes (Bearer JWT) |
| `PUT` | `/api/menu/:id` | Update existing menu item | Yes (Bearer JWT) |
| `DELETE`| `/api/menu/:id` | Delete menu item | Yes (Bearer JWT) |

---

## 🌐 Production Deployment Guide

| Layer | Recommended Host | Notes |
|---|---|---|
| **Frontend** | **Vercel** or **Netlify** | Fast global edge CDN deployment. Connect directly to `/frontend2`. |
| **Backend** | **Railway.app** or **Render** (Paid) | Persistent server required for Socket.IO WebSockets (No serverless sleep). |
| **Database** | **MongoDB Atlas** | Free M0 sandbox or serverless tier. |

---

## 👨‍💻 Author

**Rudra**  
- GitHub: [@Rudra-744](https://github.com/Rudra-744)

---

⭐ *Star this repository if you find it helpful for your restaurant tech stack!*
