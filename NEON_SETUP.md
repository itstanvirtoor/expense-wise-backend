# 🐘 Neon PostgreSQL Setup Guide

ExpenseWise uses **Neon** - a serverless PostgreSQL database that's perfect for modern applications.

## Why Neon?

- ✅ **Serverless** - No server management required
- ✅ **Autoscaling** - Scales to zero when not in use
- ✅ **Fast** - Instant database provisioning
- ✅ **Free Tier** - 0.5GB storage, perfect for development
- ✅ **Global** - Deploy to multiple regions
- ✅ **Branching** - Database branches for development

---

## Quick Setup (5 minutes)

### Step 1: Create Neon Account

1. Go to **https://neon.tech**
2. Click "Sign Up" (free account)
3. Sign in with GitHub or email

### Step 2: Create a New Project

1. Click **"Create a Project"**
2. Choose a name: `expensewise`
3. Select region: Choose closest to you (e.g., US East, EU West)
4. Click **"Create Project"**

⏳ Your database will be ready in ~5 seconds!

### Step 3: Get Connection String

1. In your Neon dashboard, you'll see the connection string
2. It looks like:
```
postgresql://neondb_owner:AbCdEf123...@ep-cool-name-123456.us-east-2.aws.neon.tech/neondb?sslmode=require
```

3. **Copy the entire connection string**

### Step 4: Update Your .env File

Open `.env` in your project and update:

```env
DATABASE_URL="postgresql://neondb_owner:your_actual_password@ep-your-endpoint.region.aws.neon.tech/neondb?sslmode=require"
```

**Important:** Replace with YOUR actual connection string from Neon dashboard!

### Step 5: Run Migrations

```bash
# Generate Prisma Client
npm run prisma:generate

# Push schema to Neon
npm run prisma:migrate

# Seed the database
npm run prisma:seed
```

### Step 6: Verify Connection

```bash
# Open Prisma Studio
npm run prisma:studio
```

You should see your database tables! ✅

---

## Connection String Format

Neon connection strings have this format:

```
postgresql://[user]:[password]@[endpoint]/[database]?sslmode=require
```

Example breakdown:
- **User:** `neondb_owner`
- **Password:** `AbCdEf123XyZ...` (auto-generated)
- **Endpoint:** `ep-cool-name-123456.us-east-2.aws.neon.tech`
- **Database:** `neondb`
- **SSL Mode:** `require` (always required for Neon)

---

## Development vs Production

### Local Development (Option 1: Neon)

Use Neon for development - same as production:

```env
DATABASE_URL="postgresql://neondb_owner:pwd@ep-dev-123.aws.neon.tech/neondb?sslmode=require"
```

**Pros:**
- ✅ Same as production
- ✅ No local PostgreSQL needed
- ✅ Auto-scales to zero (free)

### Local Development (Option 2: Docker)

Use local PostgreSQL with Docker:

```bash
docker-compose up postgres -d
```

```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/expensewise?schema=public"
```

**Pros:**
- ✅ Works offline
- ✅ Full control
- ✅ Faster for local testing

### Production

Create a separate Neon project for production:

1. Create new project: `expensewise-production`
2. Choose production region
3. Get connection string
4. Add to production environment variables

---

## Neon Features for ExpenseWise

### 1. Database Branching

Create a branch for testing:

```bash
# In Neon dashboard:
# 1. Go to "Branches"
# 2. Click "Create Branch"
# 3. Name it "development"
# 4. Get new connection string
```

Use different branches for:
- `main` - Production
- `development` - Development
- `feature-xyz` - Feature testing

### 2. Connection Pooling

For high-traffic applications, enable pooling:

```env
# In .env, add both URLs
DATABASE_URL="postgresql://user:pwd@ep-pooled.neon.tech/db?sslmode=require&pgbouncer=true"
DIRECT_URL="postgresql://user:pwd@ep-direct.neon.tech/db?sslmode=require"
```

Update `prisma/schema.prisma`:
```prisma
datasource db {
  provider  = "postgresql"
  url       = env("DATABASE_URL")
  directUrl = env("DIRECT_URL")
}
```

### 3. Monitoring

In Neon dashboard:
- View query performance
- Monitor database size
- Track connection count
- Set up alerts

---

## Common Commands

```bash
# Generate Prisma Client
npm run prisma:generate

# Create and apply migration
npm run prisma:migrate

# Push schema without migration (development)
npx prisma db push

# Seed database
npm run prisma:seed

# Open Prisma Studio (database GUI)
npm run prisma:studio

# Reset database (caution: deletes all data!)
npx prisma migrate reset
```

---

## Troubleshooting

### Error: Can't reach database server

**Solution:**
1. Check internet connection
2. Verify connection string is correct
3. Ensure `sslmode=require` is in URL
4. Check Neon project is active

### Error: SSL connection required

**Solution:**
Add `?sslmode=require` to your connection string:
```
DATABASE_URL="postgresql://...neon.tech/neondb?sslmode=require"
```

### Error: Password authentication failed

**Solution:**
1. Go to Neon dashboard
2. Click "Connection Details"
3. Copy the FULL connection string (includes password)
4. Update `.env` file

### Database is slow

**Solution:**
1. Check your Neon plan limits
2. Your database might be in "sleep mode" (free tier)
3. First query wakes it up (~1-2 seconds)
4. Subsequent queries are fast

---

## Neon Free Tier Limits

- **Storage:** 0.5 GB
- **Compute:** 0.25 vCPU
- **Projects:** 1 project
- **Branches:** 10 branches per project
- **Active time:** Always available (autoscales to zero)

Perfect for:
- ✅ Development
- ✅ Small projects
- ✅ MVP/demos
- ✅ Testing

For production at scale, upgrade to paid plan.

---

## Prisma Commands with Neon

All standard Prisma commands work with Neon:

```bash
# Check connection
npx prisma db pull

# Format schema
npx prisma format

# Validate schema
npx prisma validate

# Generate client
npx prisma generate

# Studio (database viewer)
npx prisma studio
```

---

## Migration Strategy

### Development
```bash
# Create migration
npx prisma migrate dev --name add_feature

# Push changes without migration (faster)
npx prisma db push
```

### Production
```bash
# Apply migrations
npx prisma migrate deploy

# Or in package.json
npm run prisma:migrate
```

---

## Best Practices

### 1. Use Environment Variables
Never commit `.env` file:
```bash
# .gitignore already includes:
.env
.env.local
```

### 2. Separate Databases
- Development: One Neon project
- Production: Separate Neon project
- Testing: Use branches or another project

### 3. Connection Pooling
For production with many concurrent users:
- Enable PgBouncer in connection string
- Add `directUrl` for migrations

### 4. Backups
Neon automatically backs up your data:
- Point-in-time recovery
- Daily snapshots
- Can restore to any point in last 7 days (free tier)

---

## Alternative: Local PostgreSQL

If you prefer local development:

### Using Docker (Recommended)
```bash
# Start PostgreSQL
docker-compose up postgres -d

# Stop PostgreSQL
docker-compose down
```

### Using Homebrew (Mac)
```bash
brew install postgresql@15
brew services start postgresql@15
```

### Using apt (Ubuntu/Debian)
```bash
sudo apt install postgresql
sudo systemctl start postgresql
```

Then use:
```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/expensewise?schema=public"
```

---

## Support & Resources

- **Neon Docs:** https://neon.tech/docs
- **Neon Discord:** https://discord.gg/neon
- **Prisma Docs:** https://www.prisma.io/docs
- **Status Page:** https://neonstatus.com

---

## Quick Reference Card

```bash
# 1. Create Neon account
Visit: https://neon.tech

# 2. Create project
Name: expensewise

# 3. Copy connection string
From Neon dashboard

# 4. Update .env
DATABASE_URL="postgresql://..."

# 5. Run migrations
npm run prisma:generate
npm run prisma:migrate
npm run prisma:seed

# 6. Start server
npm run start:dev

# 7. Verify
npm run prisma:studio
```

---

**That's it! You're now using serverless PostgreSQL with Neon! 🚀**

For production deployment, simply create a new Neon project and use that connection string in your hosting platform's environment variables.
