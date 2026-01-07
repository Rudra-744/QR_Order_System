# 🍽️ QR Based Order System

A modern restaurant ordering system where customers can scan QR codes at their table to browse the menu and place orders directly. Orders appear in real-time on the admin dashboard using WebSocket technology.

![React](https://img.shields.io/badge/React-19.2-61DAFB?logo=react&logoColor=white)
![Node.js](https://img.shields.io/badge/Node.js-Express-339933?logo=node.js&logoColor=white)
![MongoDB](https://img.shields.io/badge/MongoDB-Mongoose-47A248?logo=mongodb&logoColor=white)
![Socket.io](https://img.shields.io/badge/Socket.io-4.8-010101?logo=socket.io&logoColor=white)

---

## ✨ Features

### Customer Side
- 📱 Scan QR code to open menu (table auto-detected)
- 🍕 Browse menu items with categories
- 🛒 Add items to cart and place orders
- ⏱️ Real-time order status updates

### Admin Dashboard
- 📋 Real-time order notifications via WebSocket
- ✅ Accept/Reject/Complete orders
- 🍔 Menu management (Add, Edit, Delete items)
- 🔐 Secure admin authentication with JWT

---

## 🛠️ Tech Stack

### Frontend
| Technology | Purpose |
|------------|---------|
| React 19 | UI Framework |
| Vite | Build Tool & Dev Server |
| Tailwind CSS 4 | Styling |
| React Router 7 | Navigation |
| Socket.io Client | Real-time updates |
| Axios | HTTP Requests |
| GSAP | Animations |
| React Hot Toast | Notifications |

### Backend
| Technology | Purpose |
|------------|---------|
| Node.js + Express 5 | Server Framework |
| MongoDB + Mongoose 9 | Database |
| Socket.io | Real-time Communication |
| JWT | Authentication |
| Bcrypt.js | Password Hashing |
| Helmet | Security Headers |
| CORS | Cross-Origin Requests |

---

## 📁 Project Structure

```
QR based order system/
├── Backend/
│   ├── config/
│   │   └── db.js              # MongoDB connection
│   ├── controllers/
│   │   ├── adminController.js # Admin login/signup
│   │   ├── authController.js  # Authentication logic
│   │   ├── menuController.js  # Menu CRUD operations
│   │   └── orderController.js # Order management
│   ├── middleware/
│   │   └── authMiddleware.js  # JWT verification
│   ├── models/
│   │   ├── Admin.js           # Admin schema
│   │   ├── MenuItem.js        # Menu item schema
│   │   ├── Order.js           # Order schema
│   │   ├── Table.js           # Table schema
│   │   └── User.js            # User schema
│   ├── routes/
│   │   ├── adminRoutes.js     # Admin API routes
│   │   ├── menuRoutes.js      # Menu API routes
│   │   └── orderRoutes.js     # Order API routes
│   ├── server.js              # Express app entry
│   ├── socket.js              # Socket.io setup
│   └── Seed.js                # Database seeder
│
├── frontend2/
│   ├── src/
│   │   ├── components/
│   │   │   ├── MenuManager.jsx    # Admin menu management
│   │   │   ├── OrderTimer.jsx     # Order countdown timer
│   │   │   └── ProtectedRoute.jsx # Auth route guard
│   │   ├── context/
│   │   │   ├── AuthContext.jsx    # Authentication state
│   │   │   └── SocketContext.jsx  # Socket.io provider
│   │   ├── pages/
│   │   │   ├── Dashboard.jsx      # Admin dashboard
│   │   │   ├── Login.jsx          # Admin login
│   │   │   ├── Menu.jsx           # Customer menu page
│   │   │   └── Signup.jsx         # Admin signup
│   │   ├── App.jsx
│   │   └── main.jsx
│   └── public/
│       └── Logo.png
│
└── QR-Code/                   # QR code images for tables
    ├── Table-1.png
    ├── Table-2.png
    └── Table-3.png
```

---

## 🚀 Getting Started

### Prerequisites
- Node.js (v18+)
- MongoDB (local or Atlas)
- npm or yarn

### 1. Clone the Repository
```bash
git clone https://github.com/Rudra-744/QR_Order_System.git
cd QR_Order_System
```

### 2. Setup Backend

```bash
cd Backend
npm install
```

Create a `.env` file in the `Backend` folder:
```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/qr-order-system
JWT_SECRET=your_super_secret_jwt_key
```

Seed the database with sample menu items:
```bash
node Seed.js
```

Start the backend server:
```bash
npm run dev
```
Server will run on `http://localhost:5000`

### 3. Setup Frontend

```bash
cd frontend2
npm install
npm run dev
```
Frontend will run on `http://localhost:5173`

---

## 📱 How to Use

### For Customers
1. Scan the QR code at your table (e.g., `Table-1.png`)
2. The menu page opens with your table number auto-detected
3. Browse menu items and add to cart
4. Place your order
5. Wait for real-time status updates

### For Admin
1. Go to `/login` or `/signup` to create admin account
2. Access the dashboard at `/admin`
3. View incoming orders in real-time
4. Accept, reject, or mark orders as complete
5. Manage menu items (add/edit/delete)

---

## 🔗 API Endpoints

### Menu
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/menu` | Get all menu items |
| POST | `/api/menu` | Add new menu item |
| PUT | `/api/menu/:id` | Update menu item |
| DELETE | `/api/menu/:id` | Delete menu item |

### Orders
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/orders` | Get all orders |
| POST | `/api/orders` | Create new order |
| PUT | `/api/orders/:id/status` | Update order status |

### Admin
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/admin/signup` | Register admin |
| POST | `/api/admin/login` | Admin login |

---

## 🔌 WebSocket Events

| Event | Direction | Description |
|-------|-----------|-------------|
| `newOrder` | Server → Client | New order placed |
| `orderStatusUpdate` | Server → Client | Order status changed |

---

## 📸 Screenshots

> Add screenshots of your application here

---

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📄 License

This project is licensed under the ISC License.

---

## 👨‍💻 Author

**Rudra**

- GitHub: [@Rudra-744](https://github.com/Rudra-744)

---

⭐ Star this repo if you found it helpful!
