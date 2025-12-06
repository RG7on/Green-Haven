# 🌿 Green Haven - Indoor Plants E-Commerce

A full-stack MERN e-commerce application for buying indoor plants, featuring user authentication, shopping cart, order management, and Oman-specific address validation.

## 📋 Project Structure

```
Green-Haven/
├── client/                 # React frontend (Vite)
│   ├── public/            # Static assets
│   ├── src/
│   │   ├── assets/        # Images and media
│   │   ├── components/    # Reusable components
│   │   │   ├── common/    # Shared UI components
│   │   │   └── layout/    # Layout components
│   │   ├── pages/         # Page components
│   │   ├── redux/         # Redux store and slices
│   │   ├── services/      # API services
│   │   ├── theme/         # CSS tokens and themes
│   │   ├── utils/         # Utility functions
│   │   └── __tests__/     # Test files
│   └── package.json
│
├── server/                # Node.js backend (Express)
│   ├── config/           # Database configuration
│   ├── controllers/      # Route controllers
│   ├── middleware/       # Custom middleware
│   ├── models/          # MongoDB models
│   ├── routes/          # API routes
│   ├── utils/           # Utility functions
│   └── package.json
│
├── .gitignore
└── render.yaml          # Deployment configuration
```

## ✨ Features

- 🔐 User authentication (JWT)
- 🛒 Shopping cart management
- 📦 Order tracking and management
- 🌍 Oman-specific address validation (Governorates & Wilayats)
- 💳 Multiple payment methods
- 📱 Responsive design
- 🎨 Light/Dark theme support
- ⚡ Fast development with Vite

## 🚀 Tech Stack

### Frontend
- **React 19** - UI library
- **Redux Toolkit** - State management
- **React Router v7** - Routing
- **Vite** - Build tool
- **Vitest** - Testing framework
- **CSS Custom Properties** - Theming

### Backend
- **Node.js & Express** - Server framework
- **MongoDB & Mongoose** - Database
- **JWT** - Authentication
- **bcryptjs** - Password hashing
- **CORS** - Cross-origin resource sharing

## 🛠️ Prerequisites

- **Node.js** (v18 or higher)
- **npm** or **yarn**
- **MongoDB** (local or MongoDB Atlas)

## 📦 Installation

### 1. Clone the repository
```bash
git clone https://github.com/RG7on/Green-Haven.git
cd Green-Haven
```

### 2. Install dependencies

#### Install server dependencies
```bash
cd server
npm install
```

#### Install client dependencies
```bash
cd ../client
npm install
```

### 3. Set up environment variables

#### Server (.env)
Create a `.env` file in the `server` folder:
```env
MONGO_URI=mongodb+srv://<username>:<password>@<cluster-host>/?appName=GreenHaven
APP_PORT=5000
JWT_SECRET=your-super-secret-jwt-key
```

#### Client (.env) - Optional
Create a `.env` file in the `client` folder (only needed for production):
```env
VITE_API_URL=https://your-backend-url.com
```

## 🏃 Running the Application

### Development Mode

#### Start the backend server
```bash
cd server
npm run dev
```
Server runs on `http://localhost:5000`

#### Start the frontend
```bash
cd client
npm run dev
```
Client runs on `http://localhost:5173`

The frontend is configured to proxy API requests to `http://localhost:5000` automatically.

### Production Build

#### Build the frontend
```bash
cd client
npm run build
```

#### Start the production server
```bash
cd server
npm start
```

## 🧪 Testing

Run tests for the frontend:
```bash
cd client
npm test
```

## 📁 Key Files

- **`client/vite.config.js`** - Vite configuration with API proxy
- **`server/server.js`** - Express server entry point
- **`render.yaml`** - Render deployment configuration
- **`client/src/redux/store.js`** - Redux store setup
- **`server/config/db.js`** - MongoDB connection

## 🌐 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user
- `PUT /api/auth/profile` - Update user profile

### Products
- `GET /api/products` - Get all products
- `GET /api/products/:id` - Get product by ID

### Cart
- `GET /api/cart` - Get user's cart
- `POST /api/cart` - Add item to cart
- `PUT /api/cart/:id` - Update cart item
- `DELETE /api/cart/:id` - Remove from cart

### Orders
- `GET /api/orders` - Get user's orders
- `POST /api/orders` - Create new order

## 🎨 Styling

The project uses CSS custom properties for theming. Theme tokens are defined in `client/src/theme/tokens.css` and imported in `client/src/index.css`.

## 🚀 Deployment

The project is configured for deployment on Render using the `render.yaml` file:
- Backend: Node.js web service
- Frontend: Static site

Update environment variables in Render dashboard before deploying.

## 📄 License

This project is private and proprietary.

## 👥 Contributing

This is a private project. Contact the repository owner for contribution guidelines.

## 🐛 Known Issues

- Check the GitHub issues page for current bugs and feature requests

## 📞 Support

For support, contact the development team or create an issue in the repository.

---

Made with ❤️ by the Green Haven Team
