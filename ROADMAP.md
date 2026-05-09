# E-commerce Development Roadmap

## Phase 1: MVP - Product Listing & Cart (Week 1)

### Task 1.1: Product Model & API
- Create Product TypeScript interface
- Create MongoDB schema
- Build GET /api/products endpoint
- Build GET /api/products/[id] endpoint
- Tests: Model validation, API response format

### Task 1.2: Product Listing Page
- Design: Hero + grid layout with filters
- Build [shop]/products/page.tsx
- Implement product card component
- Add sorting & filtering
- Tests: Component rendering, filter functionality

### Task 1.3: Shopping Cart
- Create Cart context (React Context API)
- Build cart storage (localStorage)
- Create Cart component
- Add/remove/update quantity functions
- Tests: Add to cart, update quantity, remove item

### Task 1.4: Cart Persistence
- Sync cart with localStorage
- Recover cart on refresh
- Tests: Persistence across sessions

## Phase 2: Checkout & Payment (Week 2)

### Task 2.1: Checkout Page Design
- Design: Multi-step form (shipping, payment, confirm)
- Create checkout flow diagram
- Design system review

### Task 2.2: Order Model & API
- Create Order TypeScript interface
- Create MongoDB collection
- Build POST /api/orders endpoint
- Build GET /api/orders/[id] endpoint
- Tests: Order creation, validation

### Task 2.3: Midtrans Integration
- Setup Midtrans account & API keys
- Build Midtrans client wrapper
- Implement payment token generation
- Handle payment callbacks
- Tests: Payment initiation, callback handling

### Task 2.4: Checkout Page Implementation
- Build [shop]/checkout/page.tsx
- Form validation
- Payment button integration
- Success/failure handling
- Tests: Form validation, payment flow

## Phase 3: Admin Dashboard (Week 3)

### Task 3.1: Admin Auth
- Create admin user model
- Implement login page
- JWT/session management
- Middleware for protected routes
- Tests: Auth flow, protected routes

### Task 3.2: Admin Dashboard Home
- Design: Overview cards (sales, orders, products)
- Dashboard layout
- Key metrics display
- Tests: Data display, calculations

### Task 3.3: Product Management
- Build admin/products page
- CRUD operations (Create, Read, Update, Delete)
- Bulk actions
- Tests: CRUD operations, validation

### Task 3.4: Order Management
- Build admin/orders page
- Order status tracking
- Order details view
- Export orders
- Tests: Order filtering, status updates

## Phase 4: User Accounts (Week 4)

### Task 4.1: User Auth System
- Create User model
- Implement registration
- Implement login/logout
- Password hashing (bcrypt)
- Tests: Auth flow, password security

### Task 4.2: User Profile Page
- Profile view & edit
- Address management
- Password change
- Tests: Profile updates, validation

### Task 4.3: Order History
- Display user's orders
- Order details view
- Order status tracking
- Tests: Order filtering, data display

### Task 4.4: Wishlist
- Add to wishlist functionality
- Wishlist page
- Wishlist persistence
- Tests: Add/remove, persistence

## Success Metrics

- ✅ MVP deployed by end of week 1
- ✅ All tests passing (>80% coverage)
- ✅ No critical bugs
- ✅ Mobile responsive
- ✅ Accessible (WCAG AA)
- ✅ <3s page load time

## Environment Setup

### Required Keys
```env
NEXT_PUBLIC_MIDTRANS_CLIENT_KEY=xxx
MIDTRANS_SERVER_KEY=xxx
MONGODB_URI=xxx
NEXTAUTH_SECRET=xxx
NEXTAUTH_URL=xxx
```

### Commands
```bash
npm run dev          # Start dev server
npm run build        # Build for production
npm test             # Run tests
npm run lint         # Lint code
npm run db:seed      # Seed database
```

## Notes

- All features use TDD (write tests first)
- Design system validated before implementation
- User feedback incorporated after each phase
- Performance monitored (aim for 90+ Lighthouse score)
