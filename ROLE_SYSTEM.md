# 👥 Role System - Complete

## Available Roles

The TechConHub platform supports 5 distinct user roles:

### 1. 👨‍🎓 Student
**Purpose**: Students looking for internships and learning opportunities

**Capabilities**:
- Apply for internships and jobs
- Build student profile with education and projects
- Upload resume
- View and apply to opportunities
- Network with startups and freelancers

**Profile Features**:
- Education history
- Projects portfolio
- Resume upload
- Skills
- Looking for internships flag

---

### 2. 💼 Freelancer
**Purpose**: Independent professionals offering services

**Capabilities**:
- Post services/projects
- Apply for freelance work
- Set hourly rates
- Showcase portfolio
- Receive ratings and reviews
- Apply for jobs

**Profile Features**:
- Services offered
- Hourly rate
- Portfolio projects
- Ratings and reviews
- Skills

---

### 3. 🚀 Startup
**Purpose**: Startups seeking funding, talent, and growth

**Capabilities**:
- Post job openings and internships
- Post funding requests
- Manage team members
- Review applications
- Connect with investors
- Showcase startup details

**Profile Features**:
- Startup name and mission
- Stage (idea, seed, series-a, etc.)
- Team members
- Open positions
- Funding requirements
- Pitch deck upload

---

### 4. 💎 Investor
**Purpose**: Investors looking for investment opportunities

**Capabilities**:
- Browse funding requests
- Express interest in startups
- Manage investment portfolio
- Set investment preferences
- Propose terms and conditions

**Profile Features**:
- Investment focus areas
- Investment range (min-max)
- Portfolio of investments
- Funding history

---

### 5. 🛡️ Admin
**Purpose**: Platform administrators with full control

**Capabilities**:
- **Verify** investors and startups
- **Ban/Unban** users
- **Delete** inappropriate posts
- **Delete** users (except other admins)
- **View** platform analytics
- **Moderate** all content
- Cannot be banned or deleted by other admins

**Admin Panel Access**:
- Platform analytics
- User management
- Investor verification
- Startup verification
- Post moderation

---

## Role Selection

### Registration
Users can select their role during registration at `/register`

Available options:
- 👨‍🎓 Student
- 💼 Freelancer
- 🚀 Startup
- 💎 Investor
- 🛡️ Admin

### Admin Panel Filter
Admins can filter users by role in the admin panel

---

## Role-Based Access Control

### Protected Routes by Role

#### Students & Freelancers Only
- Apply for jobs: `POST /api/applications/apply`
- View my applications: `GET /api/applications/my-applications`

#### Startups & Freelancers Only
- Post jobs: `POST /api/jobs`
- Manage job applications: `GET /api/applications/job/:jobId`

#### Startups Only
- Post funding requests: `POST /api/funding`
- View funding interests: `GET /api/investor-interest/funding/:id`

#### Investors Only
- Express interest: `POST /api/investor-interest/express`
- View my interests: `GET /api/investor-interest/my-interests`

#### Admin Only
- All `/api/admin/*` routes
- Analytics, user management, verification, moderation

### Shared Capabilities (All Roles)
- Create posts
- Like and comment
- Send messages
- Follow/unfollow users
- Update profile
- View feed
- Search users

---

## Role Implementation

### Backend (User Model)
```javascript
role: {
  type: String,
  enum: ['student', 'freelancer', 'startup', 'investor', 'admin'],
  required: true
}
```

### Frontend (Role Selection)
1. **Register Component**: Dropdown with all 5 roles + emojis
2. **Admin Panel**: Role filter includes all 5 roles

### Middleware
- `requireRole(...roles)` - Restrict to specific roles
- `adminOnly` - Admin-only access
- `protect` - General authentication

---

## Usage Examples

### Protecting Routes by Role

```javascript
// Single role
router.post('/post-funding', protect, requireRole('startup'), postFunding);

// Multiple roles
router.post('/apply', protect, requireRole('student', 'freelancer'), applyForJob);

// Admin only
router.use('/admin', protect, adminOnly);
```

---

## Role Display

Roles are displayed with emojis for better UX:
- 👨‍🎓 Student
- 💼 Freelancer
- 🚀 Startup
- 💎 Investor
- 🛡️ Admin

This makes role identification quick and visually appealing throughout the platform.

---

## Files Updated

### Backend
- `backend/models/User.js` - Role enum (already had admin)

### Frontend
- `frontend/src/components/Register.jsx` - Added admin + emojis
- `frontend/src/components/Admin.jsx` - Added admin to filter + emojis

---

## ✅ Complete Role System

All 5 roles are now fully implemented and selectable:
- ✅ Student
- ✅ Freelancer
- ✅ Startup
- ✅ Investor
- ✅ Admin (newly added to UI)

Users can now register as admin directly from the registration page!
