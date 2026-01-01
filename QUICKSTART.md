# 🚀 ExpenseWise Backend - Quick Start Guide

## Prerequisites Check
✅ Node.js v18+ installed
✅ npm or yarn package manager
✅ Neon account (free - create at https://neon.tech) **OR** Local PostgreSQL

## Two Setup Options

### 🌟 Option 1: Neon (Recommended - No local setup needed!)

#### 1️⃣ Create Neon Database (2 minutes)

1. Go to **https://neon.tech** and sign up (free)
2. Click **"Create a Project"**
3. Name it: `expensewise`
4. Choose region closest to you
5. Click **"Create Project"**
6. **Copy the connection string** (looks like):
   ```
   postgresql://neondb_owner:abc123...@ep-cool-name.aws.neon.tech/neondb?sslmode=require
   ```

#### 2️⃣ Install Dependencies
```bash
npm install
```

#### 3️⃣ Configure Environment
Create a `.env` file:
```bash
cp .env.example .env
```

Update `.env` with YOUR Neon connection string:
```env
DATABASE_URL="postgresql://neondb_owner:YOUR_PASSWORD@ep-YOUR-ENDPOINT.aws.neon.tech/neondb?sslmode=require"
JWT_SECRET="your-super-secret-jwt-key-change-this"
JWT_REFRESH_SECRET="your-super-secret-refresh-key-change-this"
```

#### 4️⃣ Set Up Database (One Command!)
```bash
npm run db:setup
```

This runs:
- ✅ Prisma generate
- ✅ Database migrations
- ✅ Seed data (categories, demo accounts)

#### 5️⃣ Start the Server
```bash
npm run start:dev
```

**Done! 🎉** Your API is running at http://localhost:3000

---

### 🐘 Option 2: Local PostgreSQL

#### Prerequisites Check
✅ PostgreSQL v14+ installed and running locally

## Step-by-Step Setup

### 1️⃣ Install Dependencies
```bash
npm install
```

### 2️⃣ Configure Environment
Create a `.env` file in the root directory:
```bash
cp .env.example .env
```

Update the `.env` file with your local PostgreSQL credentials:
```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/expensewise?schema=public"
JWT_SECRET="your-super-secret-jwt-key-change-this"
JWT_REFRESH_SECRET="your-super-secret-refresh-key-change-this"
PORT=3000
NODE_ENV="development"
FRONTEND_URL="http://localhost:5173"
```

### 3️⃣ Set Up Database
```bash
# All-in-one setup command
npm run db:setup

# Or run individually:
# npm run prisma:generate
# npm run prisma:migrate
# npm run prisma:seed
```

### 4️⃣ Start the Server
```bash
# Development mode with auto-reload
npm run start:dev
```

## ✅ Verify Installation

### Check API is Running
Open your browser and visit:
- **API Health:** http://localhost:3000/api
- **Swagger Docs:** http://localhost:3000/api/docs

### Test Authentication
Use these demo accounts to test:

**Admin Account:**
- Email: `admin@expensewise.com`
- Password: `admin123`

**Demo User:**
- Email: `demo@expensewise.com`
- Password: `demo123`

### Test API Endpoints

1. **Signup** (POST http://localhost:3000/api/auth/signup)
```json
{
  "name": "Test User",
  "email": "test@example.com",
  "password": "Test123!",
  "confirmPassword": "Test123!"
}
```

2. **Login** (POST http://localhost:3000/api/auth/login)
```json
{
  "email": "demo@expensewise.com",
  "password": "demo123"
}
```

3. **Get Profile** (GET http://localhost:3000/api/user/profile)
```
Headers:
Authorization: Bearer YOUR_JWT_TOKEN
```

## 🛠️ Common Commands

```bash
# Development
npm run start:dev          # Start with hot-reload

# Database (All Options)
npm run db:setup           # Complete setup (generate + migrate + seed)
npm run prisma:generate    # Generate Prisma Client
npm run prisma:migrate     # Run migrations
npm run prisma:seed        # Seed database
npm run prisma:studio      # Open Prisma Studio (DB GUI)
npm run db:push            # Push schema without migration (dev only)

# Code Quality
npm run lint               # Lint code
npm run format             # Format code

# Build & Production
npm run build              # Build for production
npm run start:prod         # Run production build
```

## 📊 Database Management

### View Data with Prisma Studio
```bash
npm run prisma:studio
```
This opens a GUI at http://localhost:5555 to view and edit database records.

**Works with both Neon and local PostgreSQL!**

### Reset Database (Caution!)
```bash
# This will delete all data and reseed
npx prisma migrate reset
```

---

## 🌟 Using Neon (Detailed Guide)

For complete Neon setup instructions, see: **[NEON_SETUP.md](./NEON_SETUP.md)**

**Quick Neon Benefits:**
- ✅ No local PostgreSQL installation needed
- ✅ Serverless - scales to zero when not in use
- ✅ Free tier: 0.5GB storage
- ✅ Same setup for development and production
- ✅ Database branches for testing
- ✅ Automatic backups
- ✅ Global deployment

## 🧪 API Testing

### Using Swagger UI
1. Visit http://localhost:3000/api/docs
2. Click "Authorize" button
3. Login to get a JWT token
4. Paste token in Authorization: Bearer {token}
5. Test any endpoint

### Using Postman/Thunder Client
Import the API collection:
- Base URL: `http://localhost:3000/api`
- Set Authorization header: `Bearer {your_jwt_token}`

## 🐛 Troubleshooting

### Database Connection Error
```bash
# Check PostgreSQL is running
pg_isready

# Verify DATABASE_URL in .env
# Format: postgresql://USER:PASSWORD@HOST:PORT/DATABASE
```

### Prisma Client Not Generated
```bash
npm run prisma:generate
```

### Port Already in Use
```bash
# Change PORT in .env file
PORT=3001
```

### Migration Errors
```bash
# Reset and recreate database
npx prisma migrate reset
npm run prisma:seed
```

## 📁 Project Structure

```
expense-wise-backend/
├── prisma/
│   ├── schema.prisma      # Database schema
│   └── seed.ts            # Seed data
├── src/
│   ├── auth/              # Authentication
│   ├── user/              # User management
│   ├── expense/           # Expense CRUD
│   ├── dashboard/         # Dashboard data
│   ├── analytics/         # Analytics & insights
│   ├── credit-card/       # Credit card management
│   ├── category/          # Categories & payment methods
│   ├── settings/          # User settings
│   ├── common/            # Guards, decorators, filters
│   ├── prisma/            # Prisma service
│   └── main.ts            # Entry point
├── .env                   # Environment variables
├── package.json           # Dependencies
└── README.md              # Documentation
```

## 🔐 Security Best Practices

1. **Change Default Secrets**
   - Update JWT_SECRET and JWT_REFRESH_SECRET in production
   - Use strong, random strings (32+ characters)

2. **Secure Database**
   - Use strong database passwords
   - Enable SSL for production databases
   - Restrict database access by IP

3. **Production Checklist**
   - Set NODE_ENV=production
   - Use HTTPS only
   - Enable rate limiting
   - Set up monitoring and logging

## 🎯 Next Steps

1. ✅ Set up the backend (you're here!)
2. 🔜 Set up the frontend (React/Next.js)
3. 🔜 Connect frontend to backend
4. 🔜 Deploy to production

## 💡 Tips

- Use Prisma Studio for quick database inspection
- Check Swagger docs for all available endpoints
- Review logs in console for debugging
- Use demo accounts for testing

## 📞 Support

- Documentation: See README.md
- API Docs: http://localhost:3000/api/docs
- Issues: Check console logs for errors

---

**Ready to build! 🚀**

For detailed documentation, see [README.md](./README.md)
