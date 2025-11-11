# Authentication Quick Start Guide

## What Was Implemented

A complete user authentication and authorization system with:

✅ **User Model** - User class with role-based permissions  
✅ **Auth Client** - JWT token management and API integration  
✅ **Auth Store** - Global state management for user data  
✅ **Login & Register Views** - Beautiful, responsive UI components  
✅ **Route Protection** - Automatic redirects for protected routes  
✅ **NavBar Integration** - User profile display and logout  
✅ **Comment Authorization** - Only authenticated users can comment  

## Files Created

### Core Authentication
- `src/models/User.js` - User model class
- `src/clients/authClient.js` - Authentication API client
- `src/store/authStore.js` - Global auth state store

### Views & Components
- `src/views/Login.vue` - Login page
- `src/views/Register.vue` - Registration page
- `src/components/NavBar.vue` - Updated with auth controls

### Utilities
- `src/composables/useAuthenticatedComments.js` - Comment auth helper
- `src/router/index.js` - Updated with route guards

### Documentation
- `AUTHENTICATION.md` - Complete system documentation
- `AUTH_QUICKSTART.md` - This file

## API Integration

The system integrates with these backend endpoints (from Postman collection):

```
POST /api/auth/register - Register new user
POST /api/auth/login - Login and get JWT token
GET /api/auth/me - Get current user profile
POST /api/comments - Create comment (requires auth)
```

## How to Use

### 1. Start Your Backend API
Make sure your backend is running on `http://localhost:8080`

### 2. Register a New User
```javascript
// Navigate to http://localhost:5173/register
// Fill in the form:
- Username: testuser
- Email: test@example.com
- Password: password123
- Confirm Password: password123
```

### 3. Login
After registration, you'll be automatically logged in and redirected to home.

Or manually login at `/login`:
```javascript
- Username: testuser
- Password: password123
```

### 4. Access Protected Features
- View event details: `/event/:id` (requires auth)
- Add comments: Click on any event and post a comment
- View user profile: Click on your avatar in the NavBar

### 5. Logout
Click your avatar in the NavBar and select "Logout"

## Code Examples

### Using Auth in Components

```vue
<script setup>
import { useAuth } from '@/clients/authClient.js'

const { user, isAuthenticated, login, logout } = useAuth()

// Check if user is logged in
if (isAuthenticated.value) {
  console.log('Welcome', user.value.username)
}
</script>
```

### Protecting a Route

```javascript
// In router/index.js
{
  path: '/my-events',
  component: MyEvents,
  meta: { requiresAuth: true } // Only authenticated users
}
```

### Creating Comments with Auth

```vue
<script setup>
import { useAuthenticatedComments } from '@/composables/useAuthenticatedComments.js'

const { createAuthenticatedComment, currentUserId } = useAuthenticatedComments()

const postComment = async () => {
  if (!currentUserId.value) {
    alert('Please login to comment')
    return
  }
  
  await createAuthenticatedComment({
    text: 'Great event!',
    eventId: 1
  })
}
</script>
```

## Testing Checklist

- [ ] Register a new user
- [ ] Login with credentials
- [ ] See username in NavBar
- [ ] Access event detail page
- [ ] Post a comment
- [ ] See your comment appear
- [ ] Click user avatar to see dropdown
- [ ] Logout successfully
- [ ] Try accessing `/event/1` while logged out (should redirect to login)
- [ ] Try accessing `/login` while logged in (should redirect to home)

## Environment Variables

Make sure your `.env` file has:

```env
VITE_API_BASE_URL=http://localhost:8080
```

## Troubleshooting

### "Failed to fetch" Error
- Backend API is not running
- Check CORS settings on backend
- Verify API URL in `.env`

### Login Works but No User Data
- Backend `/api/auth/me` endpoint not implemented
- Check JWT token format
- Verify Authorization header is sent

### Comments Not Working
- User not authenticated
- Backend expects different request format
- Check userId is correctly passed

## Next Steps

Now that authentication is working, you can:

1. **Add More Protected Routes**
   - Create user profile page
   - Add "My Events" page
   - Build event creation form

2. **Enhance User Experience**
   - Add loading spinners
   - Implement toast notifications
   - Add password strength indicator

3. **Improve Security**
   - Add token refresh mechanism
   - Implement rate limiting
   - Add email verification

4. **Add Features**
   - User profile editing
   - Avatar uploads
   - Friend system
   - Event favorites

## Architecture Overview

```
┌─────────────────────────────────────────────────────┐
│                   Vue Application                    │
├─────────────────────────────────────────────────────┤
│                                                      │
│  ┌────────────┐  ┌────────────┐  ┌─────────────┐   │
│  │   Login    │  │  Register  │  │   NavBar    │   │
│  │   View     │  │    View    │  │  Component  │   │
│  └─────┬──────┘  └─────┬──────┘  └──────┬──────┘   │
│        │               │                 │          │
│        └───────────────┴─────────────────┘          │
│                        │                            │
│                  ┌─────▼─────┐                      │
│                  │ useAuth() │                      │
│                  │ Composable│                      │
│                  └─────┬─────┘                      │
│                        │                            │
│        ┌───────────────┼───────────────┐            │
│        │               │               │            │
│  ┌─────▼─────┐  ┌─────▼─────┐  ┌─────▼─────┐      │
│  │   Auth    │  │   Auth    │  │   User    │      │
│  │  Client   │  │   Store   │  │   Model   │      │
│  └─────┬─────┘  └───────────┘  └───────────┘      │
│        │                                            │
└────────┼────────────────────────────────────────────┘
         │
    ┌────▼────┐
    │ Backend │
    │   API   │
    └─────────┘
```

## Support

For detailed information, see `AUTHENTICATION.md`

For API endpoints, check `MatchlogAPI.postman_collection.json`
