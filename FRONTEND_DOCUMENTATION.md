# MatchLog Frontend Application Documentation

## Overview
MatchLog is a Vue.js 3 frontend application for logging and tracking sports events (primarily football/soccer matches). Users can view upcoming events, search for events by team, view event details, and add comments to events. The application features authentication, real-time search, and a responsive design.

---

## Technology Stack
- **Framework**: Vue.js 3 with Composition API
- **Build Tool**: Vite
- **Routing**: Vue Router 4
- **State Management**: Reactive stores (authStore)
- **HTTP Client**: Native Fetch API
- **Styling**: Scoped CSS

---

## Application Structure

### Core Files
- `src/main.js` - Application entry point
- `src/App.vue` - Root component with NavBar and router-view
- `src/router/index.js` - Route definitions and navigation guards

### Key Directories
- **`/src/views/`** - Page-level components (Home, Login, Register, EventDetail, About)
- **`/src/components/`** - Reusable UI components (NavBar, SearchBar, EventCard, etc.)
- **`/src/clients/`** - API client modules (authClient, eventClient)
- **`/src/store/`** - Global state management (authStore)
- **`/src/models/`** - Data models (User)
- **`/src/composables/`** - Reusable composition functions

---

## Features & Functionality

### 1. **Authentication System**

#### Registration
- **Route**: `/register`
- **Component**: `Register.vue`
- **API Endpoint**: `POST /api/auth/register`
- **Request Body**:
  ```json
  {
    "username": "string",
    "email": "string",
    "password": "string",
    "roles": ["USER"]
  }
  ```
- **Flow**:
  1. User fills registration form (username, email, password, confirm password)
  2. Frontend validates password match and length (min 6 characters)
  3. Calls `register()` from authClient
  4. After successful registration, automatically logs in the user
  5. Stores JWT token in localStorage
  6. Fetches user profile and stores in authStore
  7. Redirects to home page

#### Login
- **Route**: `/login`
- **Component**: `Login.vue`
- **API Endpoint**: `POST /api/auth/login`
- **Request Body**:
  ```json
  {
    "username": "string",
    "password": "string"
  }
  ```
- **Response**:
  ```json
  {
    "token": "jwt-token-string"
  }
  ```
- **Flow**:
  1. User enters username and password
  2. Calls `login()` from authClient
  3. Receives JWT token from backend
  4. Stores token in localStorage (key: `matchlog_auth_token`)
  5. Fetches user profile via `getCurrentUser()` API call
  6. Updates authStore with user data
  7. Redirects to home page

#### User Profile Management
- **API Endpoint**: `GET /api/auth/me`
- **Headers**: `Authorization: Bearer {token}`
- **Response**: User object with id, username, email, roles, etc.
- **Purpose**: Fetches current authenticated user's profile data

#### Logout
- Removes JWT token from localStorage
- Clears user data from authStore
- Redirects to login page

#### Navigation Guards
- **requiresAuth**: Protects routes like `/event/:id` - redirects to login if not authenticated
- **requiresGuest**: Protects login/register pages - redirects to home if already authenticated

---

### 2. **Event Management**

#### Home Page - Event List
- **Route**: `/`
- **Component**: `Home.vue`
- **Default Behavior**: Loads upcoming events for the next 7 days
- **API Endpoint**: `GET /api/events/daterange?startDate={date}&endDate={date}`
- **Flow**:
  1. On mount, calculates date range (today + 7 days)
  2. Fetches events via `getEventsByDateRange()`
  3. Displays events in grid layout using `EventCard` component
  4. Shows static data for "Friend Events" and "Tournament News" sections

#### Event Search by Team
- **API Endpoint**: `GET /api/events/team/{teamName}`
- **Flow**:
  1. User types team name in NavBar SearchBar
  2. Debounced search fetches suggestions via `searchEvents(query, 5)`
  3. User clicks search or selects from suggestions
  4. Updates URL with query parameter `?team={teamName}`
  5. Home component watches query changes and fetches filtered events
  6. Displays only events matching the searched team

#### Event Detail Page
- **Route**: `/event/:id`
- **Component**: `EventDetail.vue`
- **API Endpoint**: `GET /api/events/id/{id}`
- **Protected**: Requires authentication
- **Data Displayed**:
  - Event type (LEAGUE, TOURNAMENT, FRIENDLY, CHAMPIONSHIP)
  - Match details (home team vs away team)
  - Event date and time
  - Comment count
  - List of all comments with user information
- **Flow**:
  1. Extracts event ID from route params
  2. Fetches full event data including comments via `getEventById(id)`
  3. Displays event banner, teams, and information
  4. Shows comments section with add comment form

---

### 3. **Comment System**

#### Viewing Comments
- Comments are embedded in the EventDTO response
- Each comment includes:
  - Comment text
  - User ID, username, and email of commenter
  - Creation timestamp
  - Comment ID

#### Adding Comments
- **API Endpoint**: `POST /api/comments`
- **Headers**: `Authorization: Bearer {token}` (Required)
- **Request Body**:
  ```json
  {
    "text": "comment text",
    "userId": 123,
    "eventId": 456
  }
  ```
- **Flow**:
  1. User must be authenticated to add comments
  2. User types comment in textarea on EventDetail page
  3. Clicks "Post Comment" button
  4. Frontend validates: user is logged in and text is not empty
  5. Calls `createComment()` with text, userId, and eventId
  6. On success, refreshes entire event data to show new comment
  7. Clears comment form

---

### 4. **Search Functionality**

#### NavBar Search
- **Component**: `SearchBar.vue` (used in `NavBar.vue`)
- **API Endpoint**: `GET /api/events/search?query={query}&limit={limit}`
- **Features**:
  - Real-time suggestions with debouncing (500ms delay)
  - Dropdown with event suggestions showing team names and dates
  - Minimum 2 characters required for search
  - Click suggestion to navigate to event detail
  - Press Enter or click search button to filter home page results
- **Flow**:
  1. User types in search bar
  2. After 500ms debounce, fetches suggestions (max 5 results)
  3. Displays dropdown with matching events
  4. User can select event (navigate to detail) or search (filter home)
  5. Clear button resets search and shows all upcoming events

---

## API Integration

### Base Configuration
- **API Base URL**: Configurable via environment variable `VITE_API_BASE_URL`
- **Default**: `http://localhost:8080`
- **Token Storage**: localStorage with key `matchlog_auth_token`

### API Client Architecture

#### authClient.js
Handles all authentication-related API calls:
- `register(registrationData)` - User registration
- `login(credentials)` - User login
- `getCurrentUser()` - Fetch authenticated user profile
- `logout()` - Clear authentication data
- `isAuthenticated()` - Check if token exists
- `verifyToken()` - Validate token with backend
- Helper functions for token and user data management

**Composable**: `useAuth()` provides reactive state (loading, error, user) and methods

#### eventClient.js
Handles all event and comment-related API calls:
- `getEvents()` - Fetch all events
- `getEventById(id)` - Fetch single event with full details
- `getEventsByDate(date)` - Fetch events for specific date
- `getEventsByDateRange(startDate, endDate)` - Fetch events in date range
- `getEventsByTeamName(teamName)` - Search events by team
- `searchEvents(query, limit)` - General search with limit
- `createComment(commentData)` - Create new comment (requires auth)

**Composable**: `useEventClient()` provides reactive state (loading, error) and methods

---

## Data Models

### User Model (`User.js`)
```javascript
{
  id: number,
  username: string,
  email: string,
  roles: string[], // e.g., ['USER', 'ADMIN', 'MODERATOR']
  profilePicture: string | null,
  createdAt: Date | null
}
```
**Methods**:
- `hasRole(role)` - Check if user has specific role
- `isAdmin()` - Check admin role
- `isModerator()` - Check moderator role
- `getDisplayName()` - Get username for display
- `toJSON()` / `fromJSON()` - Serialization methods

### EventDTO
```javascript
{
  id: number,
  eventType: string, // 'LEAGUE', 'TOURNAMENT', 'FRIENDLY', 'CHAMPIONSHIP'
  match: {
    id: number,
    home: { id: number, name: string },
    away: { id: number, name: string }
  },
  date: Date,
  comments: Comment[],
  commentCount: number
}
```

### Comment
```javascript
{
  id: number,
  text: string,
  createdAt: Date,
  userId: number,
  username: string,
  userEmail: string,
  eventId: number
}
```

---

## State Management

### authStore.js
Global reactive authentication state:
- **State**:
  - `user`: Current User object or null
  - `isAuthenticated`: Boolean authentication status
  - `isLoading`: Loading state for auth operations
  - `error`: Error message string or null

- **Actions**:
  - `setUser(user)` - Update user state
  - `clearUser()` - Clear user on logout
  - `setLoading(loading)` - Update loading state
  - `setError(error)` - Set error message
  - `getUserId()`, `getUsername()`, etc. - Getters for user properties

---

## Routing

### Routes Configuration
```javascript
/ - Home (public)
/about - About (public)
/login - Login (guest only)
/register - Register (guest only)
/event/:id - Event Detail (requires auth)
```

### Navigation Guards
- Checks authentication status before each route
- Redirects unauthenticated users from protected routes to login
- Redirects authenticated users from login/register to home
- Preserves redirect query parameter for return navigation

---

## Component Breakdown

### Views
- **Home.vue**: Main dashboard with event list, search results, friend events, news
- **EventDetail.vue**: Detailed event view with comment system
- **Login.vue**: Authentication form for existing users
- **Register.vue**: Registration form for new users
- **About.vue**: About page

### Components
- **NavBar.vue**: Top navigation with branding, search, auth buttons/user menu
- **SearchBar.vue**: Search input with autocomplete suggestions
- **EventCard.vue**: Card component displaying event summary
- **FriendEventCard.vue**: Card showing events logged by friends (static data)
- **NewsCard.vue**: Card for tournament news (static data)

---

## Authentication Flow

### Registration → Login → Access Protected Routes
```
1. User visits /register
2. Fills form (username, email, password)
3. POST /api/auth/register
4. Automatically logs in: POST /api/auth/login
5. Receives JWT token
6. GET /api/auth/me to fetch profile
7. Token stored in localStorage
8. User object stored in authStore
9. Redirect to / (home)
10. Can now access /event/:id and create comments
```

### Subsequent Sessions
```
1. User opens app
2. authStore checks localStorage for token
3. If token exists, loads stored user data
4. Navigation guards verify authentication
5. API calls include Authorization header
6. Token validated on protected API calls
```

---

## Error Handling

### API Errors
- All API responses checked with `handleResponse()` function
- Non-OK responses throw errors with status and message
- Error messages displayed in UI via reactive `error` state
- Console logging for debugging

### Form Validation
- Client-side validation for required fields
- Password matching verification
- Minimum password length enforcement
- Empty comment prevention

### Protected Routes
- Navigation guards redirect unauthenticated users
- Comment form disabled for non-authenticated users
- Error messages shown for authentication failures

---

## Key User Flows

### 1. View Upcoming Events (Unauthenticated)
```
Home → Auto-loads next 7 days of events → Browse events
```

### 2. Search for Team Events
```
NavBar search → Type team name → See suggestions → Click search → View filtered events
```

### 3. View Event Details (Requires Auth)
```
Home → Click event → Login (if needed) → Event Detail → View comments
```

### 4. Add Comment to Event
```
Event Detail (authenticated) → Scroll to comment form → Type comment → Post → See new comment
```

### 5. New User Registration
```
NavBar → Sign Up → Fill form → Submit → Auto-login → Redirect home → Access all features
```

---

## Environment Configuration

### Required Environment Variables
Create a `.env` file in the project root:
```
VITE_API_BASE_URL=http://localhost:8080
```

### localStorage Keys
- `matchlog_auth_token` - JWT authentication token
- `matchlog_user_data` - Serialized user object (JSON)

---

## API Endpoints Summary

### Authentication
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | /api/auth/register | No | Register new user |
| POST | /api/auth/login | No | Login user |
| GET | /api/auth/me | Yes | Get current user profile |

### Events
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | /api/events | No | Get all events |
| GET | /api/events/id/{id} | No | Get event by ID |
| GET | /api/events/date/{date} | No | Get events by date |
| GET | /api/events/daterange?startDate=&endDate= | No | Get events in date range |
| GET | /api/events/team/{teamName} | No | Get events by team name |
| GET | /api/events/search?query=&limit= | No | Search events |

### Comments
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | /api/comments | Yes | Create new comment |

---

## Development Workflow

### Running the Application
```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

### Project Setup
1. Clone repository
2. Install dependencies: `npm install`
3. Configure environment variables in `.env`
4. Ensure backend API is running on configured URL
5. Start dev server: `npm run dev`
6. Access at `http://localhost:5173` (default Vite port)

---

## Future Enhancements (Based on Current Code)
- Friend events integration with backend (currently static data)
- Tournament news integration with backend (currently static data)
- User profile page
- Edit/delete comments functionality
- Event creation for authenticated users
- Real-time notifications
- File upload for user avatars
- Social features (following friends, sharing events)

---

## Security Considerations
- JWT tokens stored in localStorage (consider httpOnly cookies for production)
- All authenticated API calls include Authorization header
- Navigation guards prevent unauthorized access
- CORS must be properly configured on backend
- Token validation on backend for all protected endpoints
- Input sanitization for comments and forms

---

## Browser Compatibility
- Modern browsers supporting ES6+
- Vue 3 composition API
- Fetch API (native)
- localStorage API

---

This documentation reflects the current state of the MatchLog frontend application as of December 23, 2025.
