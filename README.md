# ExpenseWise Backend

> Professional Personal Finance Management SaaS Backend built with NestJS, PostgreSQL (Neon), and Prisma

## 🚀 Tech Stack

- **Framework:** NestJS 10.x
- **Database:** PostgreSQL with Neon (Serverless)
- **ORM:** Prisma
- **Authentication:** JWT with refresh tokens
- **Validation:** class-validator & class-transformer
- **API Documentation:** Swagger/OpenAPI
- **Security:** bcrypt password hashing, JWT guards, role-based access

## 🚀 Features

### ✅ Phase 1 - Essential Features (Completed)
- **Authentication**
  - User signup with email/password
  - Login with JWT tokens
  - Token refresh mechanism
  - Logout functionality
  - Secure password hashing with bcrypt

- **User Management**
  - Get user profile
  - Update profile (name, currency, budget)
  - Change password
  - Update notification preferences

- **Expense Management**
  - Create, read, update, delete expenses
  - Bulk delete operations
  - Advanced filtering (category, date, search)
  - Pagination support
  - Link expenses to credit cards

- **Dashboard**
  - User dashboard with statistics
  - Category breakdown with charts
  - Monthly trends (6 months)
  - Recent expenses
  - Budget tracking
  - Admin dashboard with system stats

- **Credit Card Management**
  - Add/edit/delete credit cards
  - Track balances and credit limits
  - Calculate utilization percentages
  - Payment history
  - Upcoming payments tracker
  - Automatic balance updates

### ✅ Phase 2 - Analytics (Completed)
- **Analytics Overview**
  - Spending insights by day of week
  - Average transaction amounts
  - Payment method distribution
  - Budget utilization tracking
  
- **Category Analytics**
  - Detailed breakdown by category
  - Top merchants per category
  - Day-of-week spending patterns
  - Transaction counts and averages

- **Trend Analysis**
  - Daily/weekly/monthly granularity
  - Recurring expense detection
  - Spending predictions
  - Historical comparisons

- **Comparison Analytics**
  - Period-over-period comparisons
  - Category trend analysis
  - Transaction count changes

### 🏗️ Architecture

- **Framework:** NestJS 10.x
- **Database:** PostgreSQL with Prisma ORM
- **Authentication:** JWT with refresh tokens
- **Validation:** class-validator & class-transformer
- **API Documentation:** Swagger/OpenAPI
- **Security:** bcrypt password hashing, JWT guards, role-based access

## 📋 Prerequisites

- Node.js (v18 or higher)
- npm or yarn
- **Neon account** (free - https://neon.tech) **OR** PostgreSQL (v14+) locally

## 🛠️ Installation

### Quick Start with Neon (Recommended)

1. **Create Neon Database**
```bash
# Visit https://neon.tech
# Create a free account
# Create new project: "expensewise"
# Copy your connection string
```

2. **Clone and Install**
```bash
cd expense-wise-backend
npm install
```

3. **Configure Environment**
```bash
cp .env.example .env
# Edit .env and add your Neon connection string
```

4. **Setup Database (One Command)**
```bash
npm run db:setup
```

5. **Start Server**
```bash
npm run start:dev
```

📚 **Detailed Neon Setup:** See [NEON_SETUP.md](./NEON_SETUP.md)

---

### Alternative: Local PostgreSQL

1. **Clone the repository**
```bash
cd expense-wise-backend
```

2. **Install dependencies**
```bash
npm install
```

3. **Set up environment variables**
```bash
cp .env.example .env
```

Edit `.env` file with your configuration:
```env
DATABASE_URL="postgresql://username:password@localhost:5432/expensewise?schema=public"
JWT_SECRET="your-super-secret-jwt-key"
JWT_REFRESH_SECRET="your-super-secret-refresh-key"
PORT=3000
```

4. **Set up the database**
```bash
# Generate Prisma Client
npm run prisma:generate

# Run database migrations
npm run prisma:migrate

# Seed the database with initial data
npm run prisma:seed
```

## 🚀 Running the Application

### Development Mode
```bash
npm run start:dev
```

### Production Mode
```bash
npm run build
npm run start:prod
```

### Debug Mode
```bash
npm run start:debug
```

The API will be available at:
- **API:** http://localhost:3000/api
- **Swagger Docs:** http://localhost:3000/api/docs
- **Prisma Studio:** `npm run prisma:studio`

## 📚 API Documentation

Once the server is running, visit http://localhost:3000/api/docs to access the interactive Swagger documentation.

### Key Endpoints

#### Authentication
- `POST /api/auth/signup` - Create new account
- `POST /api/auth/login` - Login user
- `POST /api/auth/logout` - Logout user
- `POST /api/auth/refresh` - Refresh access token

#### User Management
- `GET /api/user/profile` - Get user profile
- `PATCH /api/user/profile` - Update profile
- `POST /api/user/password` - Change password
- `PATCH /api/user/notifications` - Update notifications

#### Expenses
- `GET /api/expenses` - Get all expenses (with filters)
- `POST /api/expenses` - Create expense
- `PATCH /api/expenses/:id` - Update expense
- `DELETE /api/expenses/:id` - Delete expense
- `POST /api/expenses/bulk-delete` - Bulk delete

#### Dashboard
- `GET /api/dashboard/user` - User dashboard
- `GET /api/dashboard/admin` - Admin dashboard (admin only)

#### Analytics
- `GET /api/analytics/overview` - Analytics overview
- `GET /api/analytics/categories` - Category analytics
- `GET /api/analytics/trends` - Trend analysis
- `GET /api/analytics/compare` - Period comparison

#### Credit Cards
- `GET /api/credit-cards` - Get all cards
- `POST /api/credit-cards` - Add new card
- `PATCH /api/credit-cards/:id` - Update card
- `DELETE /api/credit-cards/:id` - Delete card
- `GET /api/credit-cards/:id/payments` - Payment history
- `POST /api/credit-cards/:id/link-expense` - Link expense

#### Categories & Settings
- `GET /api/categories` - Get all categories
- `GET /api/payment-methods` - Get payment methods
- `GET /api/settings` - Get user settings

## 🗃️ Database Schema

### User
- Authentication details (email, password)
- Personal settings (currency, budget, theme)
- Notification preferences
- Security settings (2FA, password change)

### Expense
- Transaction details
- Category and payment method
- Notes and receipts
- Credit card linking

### CreditCard
- Card information
- Billing cycles and due dates
- Credit limits and balances
- Utilization tracking

### Payment
- Payment history for credit cards
- Billing periods
- Payment status

### Category & PaymentMethod
- Predefined categories with colors and icons
- Available payment methods

## 🔒 Security Features

- **Password Hashing:** bcrypt with salt rounds
- **JWT Authentication:** Access & refresh token pattern
- **Role-Based Access:** Admin and user roles
- **Input Validation:** All DTOs validated with class-validator
- **SQL Injection Protection:** Prisma ORM
- **CORS:** Configurable CORS settings
- **Rate Limiting:** Ready for implementation

## 🧪 Testing

```bash
# Unit tests
npm run test

# E2E tests
npm run test:e2e

# Test coverage
npm run test:cov
```

## 📊 Default Accounts (After Seeding)

### Admin Account
- **Email:** admin@expensewise.com
- **Password:** admin123

### Demo User
- **Email:** demo@expensewise.com
- **Password:** demo123

## 🏗️ Project Structure

```
src/
├── analytics/          # Analytics module
├── auth/              # Authentication module
├── category/          # Categories & payment methods
├── common/            # Shared utilities
│   ├── decorators/    # Custom decorators
│   ├── filters/       # Exception filters
│   ├── guards/        # Auth & role guards
│   └── interceptors/  # Transform interceptor
├── credit-card/       # Credit card management
├── dashboard/         # Dashboard data
├── expense/           # Expense management
├── prisma/            # Prisma service
├── settings/          # User settings
├── user/              # User management
├── app.module.ts      # Root module
└── main.ts            # Application entry point
```

## 🔧 Scripts Reference

```bash
npm run build          # Build for production
npm run start          # Start production server
npm run start:dev      # Start development server
npm run start:debug    # Start debug server
npm run lint           # Lint code
npm run format         # Format code with Prettier
npm run prisma:generate    # Generate Prisma Client
npm run prisma:migrate     # Run migrations
npm run prisma:studio      # Open Prisma Studio
npm run prisma:seed        # Seed database
```

## 🌟 Tech Stack

- **NestJS** - Progressive Node.js framework
- **Prisma** - Next-generation ORM
- **PostgreSQL** - Relational database
- **JWT** - JSON Web Tokens for authentication
- **Passport** - Authentication middleware
- **Swagger** - API documentation
- **class-validator** - Validation decorators
- **bcrypt** - Password hashing

## 📈 Performance Considerations

- Database indexing on frequently queried fields
- Pagination for large datasets
- Optimized queries with Prisma select
- Connection pooling
- JWT token caching strategy

## 🚀 Deployment

### Environment Variables (Production)
```env
NODE_ENV=production
DATABASE_URL=your-production-db-url
JWT_SECRET=strong-secret-key
JWT_REFRESH_SECRET=strong-refresh-key
FRONTEND_URL=https://your-frontend-domain.com
```

### Recommended Platforms
- **Backend:** Railway, Render, Heroku, AWS
- **Database:** Supabase, Railway, Neon, AWS RDS
- **Container:** Docker support ready

## 📝 License

MIT

## 👨‍💻 Developer

Built with ❤️ by ExpenseWise Team

---

## 🎯 Next Steps (Future Enhancements)

- [ ] Receipt upload with OCR
- [ ] Recurring expense automation
- [ ] Budget recommendations (AI)
- [ ] Multi-currency support
- [ ] Email notifications
- [ ] Export to CSV/PDF
- [ ] Mobile app API optimization
- [ ] Real-time notifications (WebSocket)
- [ ] Social OAuth (Google, GitHub)
- [ ] Two-factor authentication

---

**Happy Coding! 🚀**