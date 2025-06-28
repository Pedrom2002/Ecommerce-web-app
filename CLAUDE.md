# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a full-stack e-commerce application with Angular frontend and Flask backend. The project combines a modern Angular 18 frontend with Server-Side Rendering (SSR) support and a Python Flask REST API backend with SQLite database.

## Architecture

### Frontend (Angular 18)
- **Location**: `src/` directory
- **Framework**: Angular 18 with SSR enabled
- **Build System**: Angular CLI with TypeScript
- **Styling**: CSS with Bootstrap components and custom themes
- **State Management**: Services with RxJS observables
- **Authentication**: JWT tokens stored in localStorage with HTTP interceptors

### Backend (Flask API)
- **Location**: `app.py` in root directory
- **Framework**: Flask with SQLAlchemy ORM
- **Database**: SQLite (`instance/app.db`)
- **Authentication**: JWT tokens with Flask-JWT-Extended
- **CORS**: Configured for localhost:4200 (Angular dev server)

### Key Components Structure
```
src/app/
├── auth/                 # Login/Register components
├── core/                 # Header/Footer layout components
├── ecommerce/           # Product list and detail components
├── profile/             # User profile management
├── services/            # HTTP services (auth, article, cart, product)
├── interceptors/        # JWT HTTP interceptor
└── models/              # TypeScript interfaces
```

## Development Commands

### Frontend Development
```bash
# Start Angular development server (port 4200)
npm start
# or
/

# Build for production
npm run build
# or
ng build

# Run unit tests
npm test
# or
ng test

# Build and serve SSR version
npm run serve:ssr:pw-2-pl

# Watch build (development)
npm run watch
```

### Recent UI Fixes & Features
- **Fixed Header**: Header positioning corrected, no longer appears below search bar
- **Cart Icon**: Better centered cart icon in header with improved responsiveness
- **Cart Interactions**: Fixed cart dropdown interactions on large screens with proper pointer events
- **Checkout Page**: Complete checkout flow with:
  - Multi-step process (Shipping → Payment → Review)
  - Form validation with real-time feedback
  - Order summary with price calculations (subtotal, shipping, tax)
  - Authentication protection
  - Responsive design
- **Cart Navigation**: "View Cart" button changed to "Checkout" and navigates to checkout page

### Backend Development
```bash
# Install Python dependencies first
pip3 install flask flask-sqlalchemy flask-jwt-extended flask-cors

# Start Flask development server (port 5000)
python3 app.py

# Initialize database migrations (if using Flask-Migrate)
flask db init
flask db migrate
flask db upgrade
```

**Important**: The Flask backend must be running on port 5000 for authentication (login/register) to work. If you get "Servidor não disponível" errors, start the Flask server first.

## Important Implementation Details

### Dual Architecture Pattern
The project has both traditional HTML templates in `html/` directory and Angular components in `src/`. The Angular application is the main frontend, while HTML files appear to be for reference or alternative implementations.

### API Integration
- **Base URL**: `http://localhost:5000` (configured in services)
- **Authentication**: JWT tokens with Authorization header
- **CORS**: Backend configured to accept requests from `http://localhost:4200`

### Data Models
- **User**: name, username, email, phone, password_hash, role, is_active
- **Article**: id, name, content, image_url (represents products)
- **Order**: user_id, order_date, status, shipping info, totals (subtotal, shipping, tax, total)
- **OrderItem**: order_id, article_id, quantity, price (price at time of purchase)
- **Frontend Product Interface**: Defined in `src/app/models/product.interface.ts`

### Database Setup
- **Location**: `instance/app.db` (SQLite database)
- **Test Users Created**: Script `create_test_users.py` creates 3 test users with real data
- **Credentials**: 
  - joao123/password123 (joao@email.com)
  - maria456/password456 (maria@email.com) 
  - admin/admin123 (admin@email.com)
- **Products**: 5 sample products created (Smartphone, Laptop, Headphones, etc.)
- **No Simulated Data**: All data comes from real database, no fallback to simulated data

### Authentication Flow
1. User registers/logs in via Angular forms
2. Flask API validates credentials and returns JWT token
3. Angular AuthService stores token in localStorage
4. JwtInterceptor automatically adds Authorization header to requests
5. Protected routes use JWT for authentication

### Product/Article System
The application treats "articles" and "products" as the same entity. The `artigos.json` file contains sample product data that should be imported into the Article database table.

## Recent Frontend Improvements

### Reactive Forms Implementation
- Login and registration components now use Angular Reactive Forms instead of template-driven forms
- Better validation, performance, and type safety
- Form validation happens at the FormControl level with proper error handling

### Global Error Handling
- `ErrorInterceptor` automatically handles all HTTP errors with user-friendly messages
- Specific error handling for 401, 403, 404, 409, 500 status codes
- Automatic token cleanup and redirect to login on 401 errors

### Authentication & Route Protection
- `AuthGuard` protects routes that require authentication (e.g., /search)
- `GuestGuard` prevents authenticated users from accessing login/register pages
- Header component shows different navigation based on authentication state
- Automatic redirect to intended page after successful login

### UI/UX Enhancements
- `LoadingSkeletonComponent` provides smooth loading states for better user experience
- Skeleton types: 'product', 'card', 'list', 'text', 'avatar'
- Dark mode support in skeleton animations
- Header component updated with responsive authentication controls
- **Fixed header positioning** - Header now stays fixed at top, content properly positioned
- **Improved cart UI** - Better cart icon centering and interactions on large screens
- **Enhanced cart functionality** - Cart dropdown works properly on all screen sizes
- **Cart interaction fix** - Fixed conflicts with external JavaScript by disabling functions.js
- **Simplified cart system** - Cart now runs purely on Angular without external JS interference
- **Checkout page** - Complete multi-step checkout process with form validation and order persistence
- **Profile page** - Comprehensive user profile management replacing search functionality
- **User management** - Personal data editing, password change, and order history tracking
- **Order system** - Complete order management with database persistence and user order history

### Security Features
- JWT token automatic cleanup on authentication errors
- Login attempt tracking with temporary account blocking
- Password visibility toggle with security considerations
- CORS properly configured for frontend-backend communication

## Architecture Best Practices
- HTTP interceptors for JWT tokens and error handling
- Route guards for authentication flow control
- Reactive programming patterns with RxJS
- Component separation of concerns (auth, layout, business logic)
- Reusable UI components (skeleton loader)

## Testing Strategy
- Unit tests configured with Jasmine and Karma
- Test files follow `*.spec.ts` naming convention
- Angular testing utilities available for component and service testing

## SSR Configuration
- Server-side rendering enabled in `angular.json`
- Entry point: `server.ts`
- Platform checks in services using `isPlatformBrowser()` for localStorage access