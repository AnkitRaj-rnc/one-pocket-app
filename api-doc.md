# One Pocket API Documentation

Base URL: `http://localhost:3000`

---

## Authentication Endpoints

### 1. Register User
**Endpoint:** `POST /api/auth/register`

**Description:** Create a new user account

**Request Body:**
```json
{
  "username": "john",
  "password": "password123"
}
```

**Response (201 Created):**
```json
{
  "success": true,
  "data": {
    "id": "67774a1b2c5d8e3f4a1b2c3d",
    "username": "john",
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY3Nzc0YTFiMmM1ZDhlM2Y0YTFiMmMzZCIsImlhdCI6MTcwNDMwMjQwMCwiZXhwIjoxNzM1ODM4NDAwfQ.abcdefghijklmnopqrstuvwxyz"
  }
}
```

**Error Response (400 Bad Request):**
```json
{
  "success": false,
  "message": "Username already taken"
}
```

---

### 2. Login User
**Endpoint:** `POST /api/auth/login`

**Description:** Login and get JWT token (valid for 365 days)

**Request Body:**
```json
{
  "username": "john",
  "password": "password123"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "id": "67774a1b2c5d8e3f4a1b2c3d",
    "username": "john",
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY3Nzc0YTFiMmM1ZDhlM2Y0YTFiMmMzZCIsImlhdCI6MTcwNDMwMjQwMCwiZXhwIjoxNzM1ODM4NDAwfQ.abcdefghijklmnopqrstuvwxyz"
  }
}
```

**Error Response (401 Unauthorized):**
```json
{
  "success": false,
  "message": "Invalid credentials"
}
```

---

### 3. Get Current User
**Endpoint:** `GET /api/auth/me`

**Description:** Get logged in user information

**Headers:**
```
Authorization: Bearer <your_jwt_token>
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "id": "67774a1b2c5d8e3f4a1b2c3d",
    "username": "john"
  }
}
```

**Error Response (401 Unauthorized):**
```json
{
  "success": false,
  "message": "Not authorized, no token"
}
```

---

### 4. Logout User
**Endpoint:** `POST /api/auth/logout`

**Description:** Logout user (client should delete token)

**Headers:**
```
Authorization: Bearer <your_jwt_token>
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Logged out successfully. Please delete token from client."
}
```

---

## Expense Endpoints (Protected - Requires JWT Token)

### 5. Get All Expenses
**Endpoint:** `GET /api/expenses`

**Description:** Get all expenses for the logged-in user

**Headers:**
```
Authorization: Bearer <your_jwt_token>
```

**Response (200 OK):**
```json
[
  {
    "id": "507f1f77bcf86cd799439011",
    "userId": "67774a1b2c5d8e3f4a1b2c3d",
    "amount": 150.50,
    "reason": "Food & Dining",
    "date": "2025-01-03T00:00:00.000Z",
    "createdAt": "2025-01-03T10:30:45.123Z",
    "updatedAt": "2025-01-03T10:30:45.123Z"
  },
  {
    "id": "507f1f77bcf86cd799439012",
    "userId": "67774a1b2c5d8e3f4a1b2c3d",
    "amount": 2500.00,
    "reason": "Rent",
    "date": "2025-01-01T00:00:00.000Z",
    "createdAt": "2025-01-01T08:00:00.000Z",
    "updatedAt": "2025-01-01T08:00:00.000Z"
  }
]
```

**Error Response (401 Unauthorized):**
```json
{
  "success": false,
  "message": "Not authorized, no token"
}
```

---

### 6. Create Expense
**Endpoint:** `POST /api/expenses`

**Description:** Create a new expense for logged-in user (userId added automatically from JWT)

**Headers:**
```
Authorization: Bearer <your_jwt_token>
```

**Request Body:**
```json
{
  "amount": 150.50,
  "reason": "Food & Dining",
  "date": "2025-01-03"
}
```

**Response (201 Created):**
```json
{
  "success": true,
  "data": {
    "id": "507f1f77bcf86cd799439011",
    "userId": "67774a1b2c5d8e3f4a1b2c3d",
    "amount": 150.50,
    "reason": "Food & Dining",
    "date": "2025-01-03T00:00:00.000Z",
    "createdAt": "2025-01-03T10:30:45.123Z",
    "updatedAt": "2025-01-03T10:30:45.123Z"
  }
}
```

**Error Response (400 Bad Request):**
```json
{
  "success": false,
  "message": "Please provide amount, reason, and date"
}
```

**Error Response (401 Unauthorized):**
```json
{
  "success": false,
  "message": "Not authorized, no token"
}
```

---

## Utility Endpoints

### 7. Welcome/Home
**Endpoint:** `GET /`

**Description:** Welcome message

**Response (200 OK):**
```json
{
  "message": "Welcome to One Pocket API",
  "status": "Server is running successfully",
  "timestamp": "2025-01-04T10:30:45.123Z"
}
```

---

### 8. Health Check
**Endpoint:** `GET /api/health`

**Description:** Check server health and uptime

**Response (200 OK):**
```json
{
  "status": "OK",
  "uptime": 12345.678,
  "timestamp": "2025-01-04T10:30:45.123Z"
}
```

---

### 9. Greet
**Endpoint:** `GET /api/greet?name=John`

**Description:** Sample greeting endpoint

**Query Parameters:**
- `name` (optional) - Name to greet (default: "Guest")

**Response (200 OK):**
```json
{
  "message": "Hello, John!",
  "timestamp": "2025-01-04T10:30:45.123Z"
}
```

---

## Error Responses

### 404 Not Found
When accessing a non-existent route:
```json
{
  "error": "Route not found",
  "path": "/api/invalid-route"
}
```

### 500 Internal Server Error
When a server error occurs:
```json
{
  "error": "Something went wrong!",
  "message": "Error details here"
}
```

---

## Authentication Flow

1. **Register:** `POST /api/auth/register` with username and password
2. **Login:** `POST /api/auth/login` to get JWT token (valid for 365 days)
3. **Store Token:** Save the token in client (localStorage, AsyncStorage, etc.)
4. **Use Token:** Include token in `Authorization: Bearer <token>` header for all protected routes
5. **Logout:** `POST /api/auth/logout` and delete token from client

---

## Notes

- JWT token is valid for **365 days** - users stay logged in for 1 year
- All expense endpoints require authentication (JWT token in header)
- userId is automatically extracted from JWT token when creating expenses
- Expenses are filtered by logged-in user (users only see their own expenses)
- Passwords are hashed using bcrypt before storing in database
- Username is unique and case-insensitive

---

## Environment Variables Required

```env
PORT=3000
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/onepocket?retryWrites=true&w=majority
JWT_SECRET=your_jwt_secret_key_here_change_this_in_production
```
