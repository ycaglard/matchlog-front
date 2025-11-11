# Authentication & User Management System

This document describes the authentication and user management system implemented in the MatchLog Vue frontend application.

## Overview

The authentication system provides:
- User registration and login
- JWT token-based authentication
- Protected routes
- Global auth state management
- User profile display
- Secure logout functionality

## Architecture

### Components

1. **User Model** (`src/models/User.js`)
   - Represents user data structure
   - Provides utility methods (role checking, initials, etc.)

2. **Auth Client** (`src/clients/authClient.js`)
   - Handles all authentication API calls
   - Manages JWT tokens in localStorage
   - Provides composable `useAuth()` for Vue components

3. **Auth Store** (`src/store/authStore.js`)
   - Global reactive state for authentication
   - Tracks current user and authentication status
   - Provides helper methods for authorization checks

4. **Views**
   - `Login.vue` - User login form
   - `Register.vue` - User registration form

5. **Router Guards** (`src/router/index.js`)
   - Protects routes requiring authentication
   - Redirects authenticated users from login/register pages

## API Endpoints

Based on the Postman collection, the following endpoints are used:

### Register User
```
POST /api/auth/register
Body: {
  username: string,
  email: string,
  password: string,
  roles?: string[] // Optional, defaults to ["USER"]
}
Response: User object (without token)
```

### Login
```
POST /api/auth/login
Body: {
  username: string,
  password: string
}
Response: {
  token: string // JWT token
}
```

### Get Current User
```
GET /api/auth/me
Headers: {
  Authorization: "Bearer {token}"
}
Response: User object
```

## Usage

### In Vue Components

#### Using the Auth Composable

```vue
<script setup>
import { useAuth } from '@/clients/authClient.js'

const { user, isAuthenticated, login, logout, loading, error } = useAuth()

// Login
const handleLogin = async () => {
  try {
    await login({ username: 'user', password: 'pass' })
    // User is now logged in
  } catch (err) {
    console.error('Login failed:', err)
  }
}

// Logout
const handleLogout = () => {
  logout()
}
</script>
```

#### Using the Auth Store

```vue
<script setup>
import { authStore, getUserId, isAdmin } from '@/store/authStore.js'

// Reactive state
const user = authStore.user
const isAuth = authStore.isAuthenticated

// Helper functions
const userId = getUserId()
const userIsAdmin = isAdmin()
</script>
```

### Protecting Routes

Routes can be protected using meta fields:

```javascript
{
  path: '/protected',
  component: ProtectedView,
  meta: { requiresAuth: true } // Requires authentication
}

{
  path: '/login',
  component: Login,
  meta: { requiresGuest: true } // Only for non-authenticated users
}
```

### Making Authenticated API Calls

The auth client provides helper functions for API calls:

```javascript
import { getToken } from '@/clients/authClient.js'

const response = await fetch('/api/endpoint', {
  headers: {
    'Authorization': `Bearer ${getToken()}`,
    'Content-Type': 'application/json'
  }
})
```

## User Roles & Authorization

The User model supports role-based authorization:

```javascript
import { hasRole, isAdmin, isModerator } from '@/store/authStore.js'

// Check specific role
if (hasRole('ADMIN')) {
  // Show admin features
}

// Convenience methods
if (isAdmin()) {
  // Admin only features
}

if (isModerator()) {
  // Moderator features
}
```

## Token Management

JWT tokens are automatically:
- Stored in localStorage on login
- Included in API requests via Authorization header
- Removed on logout
- Verified on protected route access

## Navigation Flow

1. **Unauthenticated User**:
   - Can access: Home, About, Login, Register
   - Redirected to Login when accessing protected routes

2. **Authenticated User**:
   - Can access: All routes including protected ones
   - Redirected to Home when accessing Login/Register
   - Can logout via NavBar dropdown

3. **After Login/Register**:
   - User is automatically redirected to Home page
   - User info displayed in NavBar
   - Token stored for subsequent requests

## Security Features

1. **Password Validation**: Minimum 6 characters required
2. **Token Storage**: Secure localStorage with automatic cleanup
3. **Route Protection**: Navigation guards prevent unauthorized access
4. **Error Handling**: Graceful error messages for failed operations
5. **Token Verification**: Automatic verification on protected routes

## UI Components

### NavBar
- Displays login/register buttons for guests
- Shows user avatar and dropdown for authenticated users
- Logout button in dropdown menu
- Responsive mobile menu

### Login Form
- Username and password fields
- "Remember me" checkbox
- Link to registration page
- Error message display

### Register Form
- Username, email, password fields
- Password confirmation
- Password mismatch validation
- Link to login page

## Event Comments Integration

The EventDetail view now uses authenticated user data for comments:

```javascript
// Get current user from auth store
const currentUserId = computed(() => authStore.user?.id || null)

// Check authentication before allowing comments
if (!currentUserId.value) {
  commentError.value = 'You must be logged in to comment'
  return
}
```

## Testing the System

1. **Start the backend API** (ensure it's running on http://localhost:8080)
2. **Register a new user**:
   - Navigate to `/register`
   - Fill in username, email, password
   - Submit form
3. **Login**:
   - Navigate to `/login`
   - Enter credentials
   - Verify redirect to home page
4. **Test protected routes**:
   - Click on an event to view details (requires auth)
   - Add a comment (requires auth)
5. **Logout**:
   - Click user avatar in NavBar
   - Click "Logout"
   - Verify redirect to login page

## Troubleshooting

### "Login failed" Error
- Check backend API is running
- Verify username/password are correct
- Check browser console for detailed error messages

### Token Expired
- Logout and login again
- Backend should implement token refresh if needed

### Protected Route Not Working
- Check `meta: { requiresAuth: true }` is set in router
- Verify navigation guard is properly configured
- Check token exists in localStorage

## Future Enhancements

Potential improvements:
- Token refresh mechanism
- "Forgot password" functionality
- Email verification
- Social authentication (Google, Facebook)
- Two-factor authentication
- User profile editing
- Avatar upload
- Password strength indicator
