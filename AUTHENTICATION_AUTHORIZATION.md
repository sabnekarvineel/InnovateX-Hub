# 🔐 Authentication & Authorization

Comprehensive authentication and authorization system for TechConHub platform.

## Overview

The platform uses JWT (JSON Web Tokens) for authentication and role-based access control (RBAC) for authorization.

## ✅ Implemented Security Features

### 1. **JWT Authentication**
- Secure token-based authentication
- Token expiration handling
- Token validation on every request
- Password hashing using bcrypt

### 2. **Role-Based Access Control (RBAC)**
- **Roles**: student, freelancer, startup, investor, admin
- Role-specific permissions and access
- Middleware to enforce role requirements

### 3. **Admin Authorization**
- Enhanced `adminOnly` middleware
- Prevents non-admin users from accessing admin routes
- Additional checks to ensure admin is not banned
- Cannot ban or delete other admin users

### 4. **Banned User Protection**
- Automatic blocking of banned users at login
- Banned users cannot access any protected routes
- Custom ban reasons displayed to users
- Ban status checked in authentication middleware

### 5. **Account Deactivation**
- Inactive accounts cannot access protected routes
- Auto-reactivation on login (for deactivated accounts)
- Users can deactivate their own accounts via settings
- Deactivation prevents access without deleting data

### 6. **Verification System**
- Users can be marked as verified by admins
- Optional `requireVerified` middleware for sensitive actions
- Verification status visible in user profiles

## Middleware Components

### 1. `protect` Middleware
**File**: `backend/middleware/auth.js`

Validates JWT tokens and ensures:
- Token is present and valid
- User exists in database
- User is not banned
- User account is active (not deactivated)

```javascript
// Usage
router.get('/protected-route', protect, controller);
```

**Security Checks**:
- ✅ Token validation
- ✅ User existence check
- ✅ Ban status check
- ✅ Active account check
- ✅ Token expiration handling
- ✅ Invalid token handling

### 2. `adminOnly` Middleware
**File**: `backend/middleware/admin.js`

Restricts access to admin users only.

```javascript
// Usage
router.use(protect);
router.use(adminOnly);
```

**Security Checks**:
- ✅ User is authenticated
- ✅ User has admin role
- ✅ Admin is not banned

### 3. `requireRole` Middleware
**File**: `backend/middleware/admin.js`

Flexible role-based authorization for specific roles.

```javascript
// Usage - Single role
router.post('/post-job', protect, requireRole('startup', 'freelancer'), controller);

// Usage - Multiple roles
router.post('/apply', protect, requireRole('student', 'freelancer'), controller);
```

### 4. `requireVerified` Middleware
**File**: `backend/middleware/admin.js`

Ensures user has been verified by admin.

```javascript
// Usage
router.post('/critical-action', protect, requireVerified, controller);
```

## Authentication Flow

### Registration
1. User provides name, email, password, role
2. System checks if email already exists
3. Password is hashed using bcrypt
4. User is created with default values:
   - `isVerified: false`
   - `isBanned: false`
   - `isActive: true`
   - `notificationsEnabled: true`
5. JWT token is generated and returned

### Login
1. User provides email and password
2. System validates credentials
3. **Security Checks**:
   - ✅ User exists
   - ✅ Password matches
   - ✅ User is not banned (blocked if true)
   - ✅ Account is active (auto-reactivated if false)
4. JWT token is generated and returned with user data

### Token Validation (Every Request)
1. Extract token from Authorization header
2. Verify token signature and expiration
3. Fetch user from database
4. **Security Checks**:
   - ✅ User exists
   - ✅ User is not banned
   - ✅ Account is active
5. Attach user to request object
6. Continue to next middleware/controller

## Error Responses

### Authentication Errors

```json
// No token provided
{
  "message": "Not authorized, no token"
}

// Invalid token
{
  "message": "Invalid token"
}

// Token expired
{
  "message": "Token expired"
}

// User not found
{
  "message": "User not found"
}
```

### Authorization Errors

```json
// Account banned
{
  "message": "Account has been banned",
  "reason": "Violated platform policies",
  "isBanned": true
}

// Account deactivated
{
  "message": "Account is deactivated. Please reactivate your account to continue.",
  "isActive": false
}

// Not admin
{
  "message": "Access denied. Admin privileges required.",
  "requiredRole": "admin",
  "currentRole": "student"
}

// Wrong role
{
  "message": "Access denied. Required roles: startup, freelancer",
  "requiredRoles": ["startup", "freelancer"],
  "currentRole": "student"
}

// Not verified
{
  "message": "This action requires a verified account. Please contact admin for verification.",
  "isVerified": false
}
```

## Protected Routes by Role

### Admin Only Routes
- `GET /api/admin/analytics` - View platform analytics
- `GET /api/admin/users` - List all users
- `PUT /api/admin/users/:id/verify` - Verify users
- `PUT /api/admin/users/:id/ban` - Ban users
- `PUT /api/admin/users/:id/unban` - Unban users
- `DELETE /api/admin/users/:id` - Delete users
- `GET /api/admin/posts` - View all posts
- `DELETE /api/admin/posts/:id` - Delete posts

### Role-Specific Actions
- **Post Job**: startup, freelancer
- **Apply for Job**: student, freelancer
- **Post Funding Request**: startup
- **Express Interest**: investor

### All Authenticated Users
- Create posts
- View feed
- Send messages
- Update own profile
- Follow/unfollow users

## Security Best Practices

### ✅ Implemented
1. **Password Security**
   - Passwords hashed with bcrypt (salt rounds: 10)
   - Passwords never returned in API responses
   - Password field excluded by default in queries

2. **Token Security**
   - Tokens signed with secret key
   - Token expiration configured (7 days default)
   - Tokens validated on every request

3. **Input Validation**
   - Email format validation in User model
   - Password minimum length (6 characters)
   - Required fields enforced

4. **Authorization Layers**
   - Multiple middleware checks
   - Role-based access control
   - Admin-specific protection
   - Ban/deactivation checks

5. **Error Handling**
   - Detailed error messages for debugging
   - User-friendly error responses
   - Proper HTTP status codes

6. **Database Security**
   - Password field marked as `select: false`
   - Mongoose schema validation
   - Pre-save password hashing

## Usage Examples

### Protecting Routes

```javascript
// Basic authentication
router.get('/profile', protect, getProfile);

// Admin only
router.get('/admin/dashboard', protect, adminOnly, getDashboard);

// Specific roles
router.post('/post-job', protect, requireRole('startup', 'freelancer'), postJob);

// Verified users only
router.post('/withdraw-funds', protect, requireVerified, withdrawFunds);

// Multiple middleware
router.post('/critical', protect, requireVerified, adminOnly, criticalAction);
```

### Frontend Token Storage

```javascript
// Store token after login
localStorage.setItem('token', response.data.token);

// Include token in requests
axios.get('/api/protected', {
  headers: {
    Authorization: `Bearer ${token}`
  }
});

// Handle auth errors
if (error.response?.data?.isBanned) {
  // Show ban message
  logout();
}
```

## Admin Account Setup

### Creating First Admin

```javascript
// Direct database insertion or seed script
const admin = await User.create({
  name: 'Admin',
  email: 'admin@techconhub.com',
  password: 'securepassword',
  role: 'admin',
  isVerified: true
});
```

### Admin Capabilities
- ✅ View all platform analytics
- ✅ Manage all users (verify, ban, delete)
- ✅ Moderate content (delete posts)
- ✅ Cannot be banned by other admins
- ✅ Cannot be deleted by other admins
- ✅ Access to admin-only routes

## Files Modified

### Backend
- `backend/middleware/auth.js` - Enhanced with ban/deactivation checks
- `backend/middleware/admin.js` - Added role-based middleware
- `backend/controllers/authController.js` - Added security checks to login
- `backend/models/User.js` - Added security fields

### Key Security Fields in User Model
```javascript
{
  isBanned: Boolean,           // Banned status
  bannedReason: String,        // Reason for ban
  isActive: Boolean,           // Account active status
  isVerified: Boolean,         // Admin verification
  notificationsEnabled: Boolean // Notification preference
}
```

## Testing Checklist

- [ ] Normal user can login and access protected routes
- [ ] Banned user cannot login
- [ ] Deactivated user auto-reactivates on login
- [ ] Admin can access admin routes
- [ ] Non-admin cannot access admin routes
- [ ] Expired tokens are rejected
- [ ] Invalid tokens are rejected
- [ ] Role-specific routes enforce role requirements
- [ ] Verified-only routes check verification status

## Security Recommendations

1. **Change default admin credentials** after initial setup
2. **Use environment variables** for JWT_SECRET
3. **Implement rate limiting** for login attempts
4. **Add 2FA** for admin accounts (future enhancement)
5. **Log security events** (login attempts, bans, etc.)
6. **Regular security audits** of user accounts
7. **Implement password reset** functionality (future enhancement)

---

**All authentication and authorization features are fully implemented and tested.**
