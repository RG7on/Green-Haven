# Green Haven - AI Coding Agent Instructions

## Project Overview
Green Haven is a full-stack MERN e-commerce web application for selling plants online. This project includes user authentication, product browsing with CRUD operations, shopping cart functionality, order management, and location-based services.

## Tech Stack & Architecture

### Frontend
- **Framework**: React 19.1.1 with React DOM 19.1.1
- **Build Tool**: Vite 7 with SWC plugin (`@vitejs/plugin-react-swc`) for Fast Refresh
- **State Management**: Redux Toolkit (required for global state)
- **UI Framework**: React UI framework (e.g., Reactstrap, Material-UI, or Ant Design)
- **Styling**: CSS with CSS custom properties + UI framework styles
- **Testing**: React Testing Library (minimum 4 test cases required)
- **JavaScript**: ES2020+ with ESM modules (`"type": "module"` in package.json)
- **Linting**: ESLint 9 with flat config format (see `eslint.config.js`)

### Backend
- **Runtime**: Node.js with Express.js
- **Database**: MongoDB with Mongoose ODM
- **API**: RESTful API for CRUD operations
- **Validation**: Server-side data validation and business logic
- **Location Services**: Geolocation-based features

### DevOps
- **Containerization**: Docker (required)
- **Version Control**: GitHub
- **Deployment**: Web hosting service (Render, Vercel, Netlify, Railway, etc.)
- **Testing**: Jest + React Testing Library

## Project Structure
```
client/ (or frontend/)
  src/
    main.jsx              # Entry point - renders App with StrictMode
    App.jsx               # Root component with routing
    App.css               # Component-specific styles
    index.css             # Global styles (color scheme, resets, typography)
    assets/               # Static assets (logos, images)
    components/           # Reusable UI components
      common/             # Shared components (Button, Input, Card, etc.)
      layout/             # Layout components (Navbar, Footer, etc.)
    pages/                # Page-level components
      Welcome.jsx         # Landing page with Login/Sign Up buttons
      Login.jsx           # Email/password login form
      SignUp.jsx          # Registration form (first name, last name, email, password)
      Home.jsx            # Products grid (protected route)
      ProductDetails.jsx  # Product detail modal/page
      Cart.jsx            # Shopping cart page
      Orders.jsx          # Order history
      Profile.jsx         # User profile
    redux/                # Redux Toolkit state management
      store.js            # Redux store configuration
      slices/             # Redux slices (auth, cart, products, etc.)
    hooks/                # Custom React hooks
    services/             # API service layer (Axios/Fetch)
    utils/                # Utility functions
    __tests__/            # Test files (minimum 4 test cases)
  public/                 # Public assets served as-is
  index.html              # HTML entry point
  vite.config.js          # Vite configuration
  package.json            # Frontend dependencies

server/ (or backend/)
  server.js               # Express server entry point
  config/
    db.js                 # MongoDB connection
  models/                 # Mongoose models/schemas
    User.js               # User schema (auth)
    Product.js            # Product schema
    Order.js              # Order schema
    Cart.js               # Shopping cart schema (optional)
  routes/                 # Express routes
    auth.js               # Authentication routes
    products.js           # Product CRUD routes
    orders.js             # Order management routes
    cart.js               # Cart operations routes
  controllers/            # Business logic and data processing
  middleware/             # Auth, validation, error handling
  utils/                  # Server utilities
  package.json            # Backend dependencies

docker-compose.yml        # Docker orchestration
Dockerfile                # Container configuration
.env                      # Environment variables (not committed)
.env.example              # Example environment variables
README.md                 # Project documentation
```

## Application Structure

### User Flow
1. **Welcome Page** → Login/Sign Up buttons
2. **Login Page** → Email/password form with "Don't have an account?" link to Sign Up
3. **Sign Up Page** → First name, last name, email, password with "Already have an account?" link to Login
4. **Home/Products Page** → Grid of plant cards (protected route, requires auth)
5. **Product Details Modal** → Pop-up with large image, description, quantity selector, Add to Cart/Buy Now
6. **Shopping Cart** → Cart items, checkout flow
7. **Additional pages** → Orders, Profile, etc. (to be implemented)

### Key Features
- **Authentication**: Login/Sign Up with email/password (not graded but required)
- **Product Catalog**: Grid layout with plant cards showing image, name, price
- **Product Cards**: Include "View Details" button and quick "Add to Cart" icon button
- **Product Details Modal**: Larger image, full description, quantity counter (+/-), Add to Cart, Buy Now
- **Shopping Cart**: Add/remove items, update quantities, checkout
- **Order Management**: Place orders, view order history
- **Location-Based Service**: Geolocation feature (e.g., find nearby stores, delivery zones)
- **Protected Routes**: Home and other pages require authentication

## Academic Requirements Checklist

### ✅ Prototype (2 marks)
- Figma design created and submitted
- Professional mockup with clear UI/UX

### ✅ React UI Framework (1 mark)
- Use Reactstrap, Material-UI, Ant Design, or similar
- Proper component integration

### ✅ Required Form Controls
Must include: TextBox, Button, DropDown, Radio, Checkbox, Date, Navigation Bar with search box

### ✅ CRUD Functionality (8 marks)
- **Create** (2 marks): Add new products/orders
- **Read** (2 marks): Fetch and display data
- **Update** (2 marks): Edit products/orders
- **Delete** (2 marks): Remove items
- All operations include server-side validation and business logic

### ✅ Business Logic & Data Processing (2 marks)
- Server-side calculations (e.g., order totals, tax, discounts)
- Data validation before storing/updating
- Business rules implementation

### ✅ MongoDB Database (0.5 marks)
- At least 2 collections with 5+ documents each
- Collections: Users, Products, Orders (or Cart)
- Data types: Text, Numbers, Boolean, Date

### ✅ Testing (2 marks)
- Minimum 4 test cases using React Testing Library
- Cover essential functionalities

### ✅ Location-Based Service (0.5 marks)
- Integration of geolocation feature
- Example: Store locator, delivery zone checker, distance calculation

### ✅ GitHub (1 mark)
- Client and Server code committed
- Clear commit history

### ✅ Containerization & Orchestration (2 marks)
- Docker setup with Dockerfile
- Docker Compose for multi-container orchestration

### ✅ Deployment (2 marks)
- Live deployment on hosting service
- Accessible via public URL

### ✅ Creativity & Uniqueness (1 mark)
- Innovative approach and original implementation

## Development Commands
- `npm run dev` - Start Vite dev server with HMR
- `npm run build` - Production build
- `npm run preview` - Preview production build locally
- `npm run lint` - Run ESLint on all JS/JSX files

## Code Conventions

### ESLint Configuration
- Uses **flat config format** (`eslint.config.js`, not `.eslintrc`)
- Extends: ESLint recommended, React Hooks recommended-latest, React Refresh Vite
- Custom rule: `no-unused-vars` allows uppercase/underscore prefixed vars (e.g., `const _UNUSED = 'ok'`)
- Ignores `dist/` directory
- Targets browser globals and ECMAScript 2020

### React Patterns
- Uses **React 19** - leverage latest features and APIs
- Strict Mode is enabled in `main.jsx` for development checks
- Component structure: Functional components with hooks (see `App.jsx`)
- Import React methods explicitly (e.g., `import { useState } from 'react'`)

### Styling Conventions
- **Global styles** in `src/index.css` - reset, base elements, imports
- **Component styles** in separate CSS files (e.g., `App.css` for `App.jsx`)
- Uses CSS custom properties for theming via `src/theme/tokens.css` (imported in `src/index.css`)
- Supports light/dark color schemes via `@media (prefers-color-scheme)`
- **Design System**: Colors and fonts are defined in Figma design - maintain consistency
- **Responsive Design**: Mobile-first approach for plant cards and grid layouts

### Design Tokens (src/theme/tokens.css)
Tokens are single source of truth for look & feel. Edit these variables to theme the app.

- Typography
  - `--font-display`: Headings and callouts (Itim)
  - `--font-body`: Body text stack
- Colors
  - `--color-bg`: Page background
  - `--color-text`: Primary text (deep green)
  - `--color-primary`: Brand green for headings/CTAs
  - `--color-surface`, `--color-surface-2`: Card backgrounds
  - `--color-border`: Subtle borders
  - `--color-accent`: Dark accent (buttons)
  - `--color-muted`: Secondary text
  - `--color-danger`: Error state
- Radius: `--radius-sm`, `--radius-md`, `--radius-lg`
- Shadows: `--shadow-sm`, `--shadow-md`
- Layout: `--container-width`

Provided utilities and generics:
- `.container`, `.stack`, `.center`
- `.card`, `.btn`, `.btn-primary`, `.btn-dark`, `.input`

Usage:
- Import once in `index.css`: `@import "./theme/tokens.css";`
- Reference variables in components: `color: var(--color-primary);`

### File Naming
- React components: PascalCase with `.jsx` extension (e.g., `App.jsx`)
- Styles: match component name (e.g., `App.css` for `App.jsx`)
- Entry point: lowercase `main.jsx`
- Config files: lowercase with extension (e.g., `vite.config.js`)

## Important Notes
- **Do NOT use TypeScript** - this is a JavaScript-only project
- **SWC is required** - not compatible with React Compiler, uses SWC for Fast Refresh
- **React 19** - ensure compatibility when suggesting new dependencies
- **Redux Toolkit is mandatory** - use for state management, not Context API alone
- **Server-side validation required** - all CRUD operations must include business logic
- **Testing is mandatory** - minimum 4 test cases required
- Public assets go in `/public`, imported assets go in `/src/assets`
- Vite serves public files from root (e.g., `/vite.svg` references `public/vite.svg`)

## When Adding Dependencies
- Check compatibility with React 19 and Vite 7
- Use `npm install` for package management
- Update ESLint config if adding new file types or requiring special linting

## Backend Development Notes
- Use Express.js for REST API
- Mongoose for MongoDB ODM with schema validation
- Implement middleware for authentication, validation, error handling
- Environment variables for sensitive data (MongoDB URI, JWT secret, etc.)
- Separate business logic from route handlers (use controllers)

## Testing Requirements
- Use Jest + React Testing Library
- Test user interactions (button clicks, form submissions)
- Test component rendering and state changes
- Test API integration (mock API calls)
- Example test locations: `src/__tests__/` or `src/components/__tests__/`
