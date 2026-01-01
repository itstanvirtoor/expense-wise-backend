# 📡 ExpenseWise API Testing Guide

## Quick Test Flow

### 1. Signup (Create Account)
```http
POST http://localhost:3000/api/auth/signup
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john.doe@example.com",
  "password": "SecurePass123!",
  "confirmPassword": "SecurePass123!"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Account created successfully",
  "data": {
    "user": {
      "id": "user_123",
      "name": "John Doe",
      "email": "john.doe@example.com",
      "role": "USER"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

### 2. Login
```http
POST http://localhost:3000/api/auth/login
Content-Type: application/json

{
  "email": "demo@expensewise.com",
  "password": "demo123"
}
```

**Save the token from response!**

### 3. Get Profile
```http
GET http://localhost:3000/api/user/profile
Authorization: Bearer YOUR_TOKEN_HERE
```

### 4. Create Expense
```http
POST http://localhost:3000/api/expenses
Authorization: Bearer YOUR_TOKEN_HERE
Content-Type: application/json

{
  "date": "2026-01-01",
  "description": "Grocery Shopping",
  "category": "Food & Dining",
  "amount": 125.50,
  "paymentMethod": "Credit Card",
  "notes": "Weekly groceries"
}
```

### 5. Get Dashboard
```http
GET http://localhost:3000/api/dashboard/user
Authorization: Bearer YOUR_TOKEN_HERE
```

### 6. Get Analytics
```http
GET http://localhost:3000/api/analytics/overview?timeRange=30days
Authorization: Bearer YOUR_TOKEN_HERE
```

## All API Endpoints

### 🔐 Authentication

#### Signup
```http
POST /api/auth/signup
```
Body:
```json
{
  "name": "string",
  "email": "email@example.com",
  "password": "string",
  "confirmPassword": "string"
}
```

#### Login
```http
POST /api/auth/login
```
Body:
```json
{
  "email": "email@example.com",
  "password": "string"
}
```

#### Logout
```http
POST /api/auth/logout
Authorization: Bearer {token}
```
Body:
```json
{
  "refreshToken": "string"
}
```

#### Refresh Token
```http
POST /api/auth/refresh
```
Body:
```json
{
  "refreshToken": "string"
}
```

### 👤 User Management

#### Get Profile
```http
GET /api/user/profile
Authorization: Bearer {token}
```

#### Update Profile
```http
PATCH /api/user/profile
Authorization: Bearer {token}
```
Body:
```json
{
  "name": "Updated Name",
  "currency": "EUR",
  "monthlyBudget": 3500
}
```

#### Update Password
```http
POST /api/user/password
Authorization: Bearer {token}
```
Body:
```json
{
  "currentPassword": "oldPassword",
  "newPassword": "newPassword",
  "confirmPassword": "newPassword"
}
```

#### Update Notifications
```http
PATCH /api/user/notifications
Authorization: Bearer {token}
```
Body:
```json
{
  "emailNotifications": true,
  "budgetAlerts": true,
  "billReminders": true,
  "weeklyReport": false,
  "monthlyReport": true
}
```

### 💰 Expenses

#### Get All Expenses
```http
GET /api/expenses?page=1&limit=50&category=Food&search=grocery&sortBy=date&sortOrder=desc
Authorization: Bearer {token}
```

#### Create Expense
```http
POST /api/expenses
Authorization: Bearer {token}
```
Body:
```json
{
  "date": "2026-01-01",
  "description": "Grocery Shopping",
  "category": "Food & Dining",
  "amount": 125.50,
  "paymentMethod": "Credit Card",
  "notes": "Weekly groceries",
  "creditCardId": "card_id_optional"
}
```

#### Update Expense
```http
PATCH /api/expenses/{id}
Authorization: Bearer {token}
```
Body:
```json
{
  "description": "Updated Description",
  "amount": 130.00
}
```

#### Delete Expense
```http
DELETE /api/expenses/{id}
Authorization: Bearer {token}
```

#### Bulk Delete Expenses
```http
POST /api/expenses/bulk-delete
Authorization: Bearer {token}
```
Body:
```json
{
  "expenseIds": ["exp_001", "exp_002", "exp_003"]
}
```

### 📊 Dashboard

#### User Dashboard
```http
GET /api/dashboard/user
Authorization: Bearer {token}
```

#### Admin Dashboard (Admin only)
```http
GET /api/dashboard/admin
Authorization: Bearer {token}
```

### 📈 Analytics

#### Analytics Overview
```http
GET /api/analytics/overview?timeRange=30days
Authorization: Bearer {token}
```

#### Category Analytics
```http
GET /api/analytics/categories?timeRange=30days
Authorization: Bearer {token}
```

#### Trend Analysis
```http
GET /api/analytics/trends?timeRange=6months&granularity=daily
Authorization: Bearer {token}
```

#### Comparison Analytics
```http
GET /api/analytics/compare?period1=thismonth&period2=lastmonth
Authorization: Bearer {token}
```

### 💳 Credit Cards

#### Get All Credit Cards
```http
GET /api/credit-cards
Authorization: Bearer {token}
```

#### Create Credit Card
```http
POST /api/credit-cards
Authorization: Bearer {token}
```
Body:
```json
{
  "name": "Chase Sapphire",
  "lastFourDigits": "4532",
  "issuer": "Visa",
  "billingCycle": 1,
  "dueDate": 25,
  "creditLimit": 10000,
  "currentBalance": 2350
}
```

#### Update Credit Card
```http
PATCH /api/credit-cards/{id}
Authorization: Bearer {token}
```
Body:
```json
{
  "name": "Chase Sapphire Preferred",
  "creditLimit": 12000,
  "currentBalance": 2500
}
```

#### Delete Credit Card
```http
DELETE /api/credit-cards/{id}
Authorization: Bearer {token}
```

#### Get Payment History
```http
GET /api/credit-cards/{id}/payments
Authorization: Bearer {token}
```

#### Link Expense to Card
```http
POST /api/credit-cards/{id}/link-expense
Authorization: Bearer {token}
```
Body:
```json
{
  "expenseId": "exp_001",
  "amount": 125.50
}
```

### 🏷️ Categories & Settings

#### Get Categories
```http
GET /api/categories
```

#### Get Payment Methods
```http
GET /api/payment-methods
```

#### Get Settings
```http
GET /api/settings
Authorization: Bearer {token}
```

## Testing with cURL

### Signup
```bash
curl -X POST http://localhost:3000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "test@example.com",
    "password": "Test123!",
    "confirmPassword": "Test123!"
  }'
```

### Login
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "demo@expensewise.com",
    "password": "demo123"
  }'
```

### Get Profile (with token)
```bash
curl -X GET http://localhost:3000/api/user/profile \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

## Testing with Postman

1. **Import Collection:**
   - Create new collection "ExpenseWise"
   - Set base URL: `http://localhost:3000/api`

2. **Set up Environment:**
   - Create variable `baseUrl` = `http://localhost:3000/api`
   - Create variable `token` (will be set after login)

3. **Add Requests:**
   - Use `{{baseUrl}}` for all requests
   - Set Authorization to Bearer Token with `{{token}}`

4. **Test Flow:**
   - Login → Save token to environment
   - Use token for all authenticated requests

## Response Codes

- **200** - Success
- **201** - Created
- **400** - Bad Request (validation error)
- **401** - Unauthorized (invalid token)
- **403** - Forbidden (insufficient permissions)
- **404** - Not Found
- **409** - Conflict (duplicate data)
- **500** - Internal Server Error

## Common Error Responses

### Invalid Credentials
```json
{
  "success": false,
  "message": "Invalid credentials"
}
```

### Validation Error
```json
{
  "success": false,
  "message": "Validation failed",
  "errors": {
    "email": "Email already exists"
  }
}
```

### Unauthorized
```json
{
  "success": false,
  "message": "Invalid or expired token"
}
```

## Demo Accounts

### Admin
- Email: `admin@expensewise.com`
- Password: `admin123`

### User
- Email: `demo@expensewise.com`
- Password: `demo123`

## Tips

1. **Always include `Authorization` header** for protected routes
2. **Token expires in 15 minutes** - use refresh token to get new one
3. **Use Swagger UI** at http://localhost:3000/api/docs for interactive testing
4. **Check response structure** - all responses follow standard format
5. **Use proper Content-Type** - `application/json` for all POST/PATCH requests

---

Happy Testing! 🚀
