# 🚀 ExpenseWise Backend - Deployment Guide

## Deployment Options

### Option 1: Railway (Recommended - Easiest)

#### Prerequisites
- GitHub account
- Railway account (https://railway.app)

#### Steps

1. **Push code to GitHub**
```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin YOUR_GITHUB_REPO_URL
git push -u origin main
```

2. **Deploy to Railway**
   - Go to https://railway.app
   - Click "New Project"
   - Select "Deploy from GitHub repo"
   - Choose your repository
   - Railway will auto-detect NestJS

3. **Add PostgreSQL Database**
   - Click "New" → "Database" → "Add PostgreSQL"
   - Railway will auto-generate DATABASE_URL

4. **Set Environment Variables**
   - Click on your service → "Variables"
   - Add:
```env
JWT_SECRET=your-production-secret-key-change-this
JWT_REFRESH_SECRET=your-production-refresh-secret-key
NODE_ENV=production
FRONTEND_URL=https://your-frontend-url.com
```

5. **Deploy**
   - Railway auto-deploys on push
   - Your API will be available at: `https://your-app.up.railway.app`

6. **Run Migrations**
   - In Railway dashboard, open service
   - Go to "Deploy" tab
   - Add build command: `npm run prisma:migrate && npm run prisma:seed`

---

### Option 2: Render

#### Prerequisites
- GitHub account
- Render account (https://render.com)

#### Steps

1. **Push to GitHub** (same as Railway)

2. **Create PostgreSQL Database**
   - Go to Render Dashboard
   - Click "New" → "PostgreSQL"
   - Choose free tier
   - Copy Internal Database URL

3. **Create Web Service**
   - Click "New" → "Web Service"
   - Connect your GitHub repository
   - Choose "Node" environment
   - Configure:
     - **Build Command:** `npm install && npm run prisma:generate && npm run build`
     - **Start Command:** `npm run start:prod`

4. **Set Environment Variables**
```env
DATABASE_URL=your-render-postgres-url
JWT_SECRET=your-secret
JWT_REFRESH_SECRET=your-refresh-secret
NODE_ENV=production
FRONTEND_URL=https://your-frontend.com
```

5. **Deploy**
   - Click "Create Web Service"
   - Render will build and deploy

---

### Option 3: Heroku

#### Prerequisites
- Heroku account
- Heroku CLI installed

#### Steps

1. **Login to Heroku**
```bash
heroku login
```

2. **Create Heroku App**
```bash
heroku create expensewise-backend
```

3. **Add PostgreSQL**
```bash
heroku addons:create heroku-postgresql:mini
```

4. **Set Environment Variables**
```bash
heroku config:set JWT_SECRET=your-secret
heroku config:set JWT_REFRESH_SECRET=your-refresh-secret
heroku config:set NODE_ENV=production
heroku config:set FRONTEND_URL=https://your-frontend.com
```

5. **Create Procfile**
```bash
echo "web: npm run start:prod" > Procfile
```

6. **Deploy**
```bash
git add .
git commit -m "Deploy to Heroku"
git push heroku main
```

7. **Run Migrations**
```bash
heroku run npm run prisma:migrate
heroku run npm run prisma:seed
```

---

### Option 4: Vercel (Serverless)

#### Prerequisites
- Vercel account
- Vercel CLI

#### Steps

1. **Install Vercel CLI**
```bash
npm i -g vercel
```

2. **Create vercel.json**
```json
{
  "version": 2,
  "builds": [
    {
      "src": "src/main.ts",
      "use": "@vercel/node"
    }
  ],
  "routes": [
    {
      "src": "/(.*)",
      "dest": "src/main.ts",
      "methods": ["GET", "POST", "PUT", "PATCH", "DELETE"]
    }
  ]
}
```

3. **Deploy**
```bash
vercel
```

4. **Set Environment Variables**
   - Go to Vercel Dashboard
   - Select your project
   - Settings → Environment Variables
   - Add all variables

---

### Option 5: AWS (EC2)

#### Prerequisites
- AWS account
- EC2 instance (Ubuntu 22.04 recommended)

#### Steps

1. **Connect to EC2**
```bash
ssh -i your-key.pem ubuntu@your-ec2-ip
```

2. **Install Node.js**
```bash
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs
```

3. **Install PostgreSQL**
```bash
sudo apt-get install postgresql postgresql-contrib
sudo systemctl start postgresql
```

4. **Clone Repository**
```bash
git clone YOUR_REPO_URL
cd expense-wise-backend
npm install
```

5. **Set up Environment**
```bash
cp .env.example .env
nano .env  # Edit with your values
```

6. **Run Migrations**
```bash
npm run prisma:generate
npm run prisma:migrate
npm run prisma:seed
```

7. **Install PM2**
```bash
sudo npm install -g pm2
```

8. **Start Application**
```bash
npm run build
pm2 start dist/main.js --name expensewise
pm2 save
pm2 startup
```

9. **Set up Nginx (Optional)**
```bash
sudo apt-get install nginx
sudo nano /etc/nginx/sites-available/expensewise
```

Nginx config:
```nginx
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

```bash
sudo ln -s /etc/nginx/sites-available/expensewise /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

---

### Option 6: Docker + DigitalOcean

#### Prerequisites
- DigitalOcean account
- Docker Hub account

#### Steps

1. **Build Docker Image**
```bash
docker build -t your-username/expensewise-backend .
docker push your-username/expensewise-backend
```

2. **Create DigitalOcean Droplet**
   - Choose Docker image from Marketplace
   - Select plan (Basic $6/month recommended)
   - Choose datacenter region
   - Add SSH key

3. **SSH into Droplet**
```bash
ssh root@your-droplet-ip
```

4. **Pull and Run**
```bash
docker pull your-username/expensewise-backend
docker-compose up -d
```

---

## Database Setup

### Using Supabase (Free PostgreSQL)

1. **Create Supabase Project**
   - Go to https://supabase.com
   - Create new project
   - Wait for database provisioning

2. **Get Connection String**
   - Project Settings → Database
   - Copy Connection String (URI)
   - Format: `postgresql://postgres:[PASSWORD]@[HOST]:[PORT]/postgres`

3. **Update DATABASE_URL**
   - Add to environment variables
   - Run migrations

### Using Neon (Serverless PostgreSQL)

1. **Create Neon Project**
   - Go to https://neon.tech
   - Create new project

2. **Get Connection String**
   - Copy from dashboard
   - Add to environment variables

---

## Production Checklist

### Security
- [ ] Change all default secrets
- [ ] Use strong JWT secrets (32+ characters)
- [ ] Enable HTTPS only
- [ ] Set secure CORS origins
- [ ] Enable rate limiting
- [ ] Use environment variables (never commit .env)
- [ ] Set up SSL certificates (Let's Encrypt)

### Database
- [ ] Use production database (not SQLite)
- [ ] Enable connection pooling
- [ ] Set up automated backups
- [ ] Use SSL for database connections
- [ ] Configure database firewall rules

### Performance
- [ ] Enable caching (Redis recommended)
- [ ] Set up CDN for static assets
- [ ] Configure compression
- [ ] Optimize database indexes
- [ ] Set up load balancing (if needed)

### Monitoring
- [ ] Set up logging (Winston, Sentry)
- [ ] Configure error tracking
- [ ] Set up uptime monitoring
- [ ] Configure alerting
- [ ] Set up APM (Application Performance Monitoring)

### CI/CD
- [ ] Set up GitHub Actions
- [ ] Configure automated tests
- [ ] Set up deployment pipeline
- [ ] Configure staging environment

---

## Environment Variables Reference

### Required
```env
DATABASE_URL=postgresql://user:pass@host:5432/db
JWT_SECRET=your-secret-key
JWT_REFRESH_SECRET=your-refresh-secret
NODE_ENV=production
FRONTEND_URL=https://your-frontend.com
```

### Optional
```env
PORT=3000
JWT_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d
GOOGLE_CLIENT_ID=your-google-id
GOOGLE_CLIENT_SECRET=your-google-secret
GITHUB_CLIENT_ID=your-github-id
GITHUB_CLIENT_SECRET=your-github-secret
```

---

## Post-Deployment

### 1. Test API
```bash
curl https://your-api.com/api/categories
```

### 2. Run Health Check
```bash
curl https://your-api.com/api/user/profile
```

### 3. Test Authentication
```bash
curl -X POST https://your-api.com/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"demo@expensewise.com","password":"demo123"}'
```

### 4. Check Swagger Docs
Visit: `https://your-api.com/api/docs`

---

## Troubleshooting

### Build Fails
```bash
# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

### Database Connection Fails
- Check DATABASE_URL format
- Verify database is running
- Check firewall rules
- Test connection with Prisma Studio

### Migrations Fail
```bash
# Reset and run migrations
npm run prisma:migrate reset
npm run prisma:migrate deploy
```

---

## Monitoring Tools

### Free Options
- **Uptime Monitoring:** UptimeRobot, Pingdom
- **Error Tracking:** Sentry (free tier)
- **Logging:** Papertrail, Loggly
- **APM:** New Relic (free tier)

### Recommended Stack
- **Railway** for hosting (auto-deploy)
- **Supabase** for PostgreSQL
- **Sentry** for error tracking
- **Vercel** for frontend
- **GitHub Actions** for CI/CD

---

## Support & Resources

- [NestJS Documentation](https://docs.nestjs.com)
- [Prisma Documentation](https://www.prisma.io/docs)
- [Railway Documentation](https://docs.railway.app)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)

---

**Ready for Production! 🚀**

Choose your deployment platform and follow the steps above. Railway is recommended for the easiest deployment experience.
