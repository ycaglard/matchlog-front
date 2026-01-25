# MatchLog API - Frontend Integration Guide

## Base URL
```
http://localhost:8080
```

## Authentication Flow

### 1. Register New User
**Endpoint:** `POST /api/auth/register`

**Request Body:**
```json
{
  "username": "john_doe",
  "email": "john@example.com",
  "password": "password123"
}
```

**Success Response (201 Created):**
```json
{
  "token": null,
  "id": "507f191e810c19729de860ea",
  "username": "john_doe",
  "email": "john@example.com",
  "roles": ["USER"]
}
```

**Important:** Upon registration, three default custom lists are automatically created:
- "Favourites"
- "Watched"
- "Reviewed"

**Error Responses:**
```json
// 400 - Username taken
"Username is already taken"

// 400 - Email in use
"Email is already in use"
```

### 2. Login
**Endpoint:** `POST /api/auth/login`

**Request Body:**
```json
{
  "username": "john_doe",
  "password": "password123"
}
```

**Success Response (200 OK):**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJqb2huX2RvZSIsImlhdCI6MTUxNjIzOTAyMiwiZXhwIjoxNTE2MjQyNjIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c",
  "id": "507f191e810c19729de860ea",
  "username": "john_doe",
  "email": "john@example.com",
  "roles": ["USER"]
}
```

**Store the token:** Save the JWT token from login response for authenticated requests.

**Error Response (401 Unauthorized):**
```json
"Invalid username or password"
```

### 3. Get Current User
**Endpoint:** `GET /api/auth/me`

**Headers:**
```
Authorization: Bearer {jwt-token}
```

**Success Response (200 OK):**
```json
{
  "token": null,
  "id": "507f191e810c19729de860ea",
  "username": "john_doe",
  "email": "john@example.com",
  "roles": ["USER"]
}
```

**Error Response (401 Unauthorized):**
```json
"Not authenticated"
```

---

## Custom Lists API

All custom list endpoints require authentication. Include the JWT token in the Authorization header:
```
Authorization: Bearer {jwt-token}
```

### 1. Get All Custom Lists (Public)
**Endpoint:** `GET /api/lists`

**Headers:**
```
Authorization: Bearer {jwt-token}
```

**Success Response (200 OK):**
```json
[
  {
    "id": "507f1f77bcf86cd799439011",
    "name": "Favourites",
    "description": "Your favourite matches",
    "createdAt": "2026-01-03T14:30:00",
    "updatedAt": "2026-01-03T14:30:00",
    "userId": "507f191e810c19729de860ea",
    "username": "john_doe",
    "matchIds": [123, 456, 789]
  },
  {
    "id": "507f1f77bcf86cd799439012",
    "name": "Watched",
    "description": "Matches you have watched",
    "createdAt": "2026-01-03T14:30:00",
    "updatedAt": "2026-01-03T14:30:00",
    "userId": "507f191e810c19729de860ea",
    "username": "john_doe",
    "matchIds": [456, 999]
  }
]
```

### 2. Get My Custom Lists (Current User's Lists)
**Endpoint:** `GET /api/lists/my-lists`

**Headers:**
```
Authorization: Bearer {jwt-token}
```

**Success Response (200 OK):**
```json
[
  {
    "id": "507f1f77bcf86cd799439011",
    "name": "Favourites",
    "description": "Your favourite matches",
    "createdAt": "2026-01-03T14:30:00",
    "updatedAt": "2026-01-03T14:30:00",
    "userId": "507f191e810c19729de860ea",
    "username": "john_doe",
    "matchIds": [123, 456, 789]
  },
  {
    "id": "507f1f77bcf86cd799439012",
    "name": "Watched",
    "description": "Matches you have watched",
    "createdAt": "2026-01-03T14:30:00",
    "updatedAt": "2026-01-03T14:30:00",
    "userId": "507f191e810c19729de860ea",
    "username": "john_doe",
    "matchIds": []
  },
  {
    "id": "507f1f77bcf86cd799439013",
    "name": "Reviewed",
    "description": "Matches you have reviewed",
    "createdAt": "2026-01-03T14:30:00",
    "updatedAt": "2026-01-03T14:30:00",
    "userId": "507f191e810c19729de860ea",
    "username": "john_doe",
    "matchIds": []
  }
]
```

### 3. Get Custom List by ID
**Endpoint:** `GET /api/lists/{listId}`

**Path Parameters:**
- `listId` (string): The MongoDB ObjectId of the list

**Headers:**
```
Authorization: Bearer {jwt-token}
```

**Success Response (200 OK):**
```json
{
  "id": "507f1f77bcf86cd799439011",
  "name": "Favourites",
  "description": "Your favourite matches",
  "createdAt": "2026-01-03T14:30:00",
  "updatedAt": "2026-01-03T14:30:00",
  "userId": "507f191e810c19729de860ea",
  "username": "john_doe",
  "matchIds": [123, 456, 789]
}
```

**Error Response (404 Not Found):**
```json
{
  "timestamp": "2026-01-03T14:30:00",
  "status": 404,
  "error": "Not Found",
  "message": "Custom list not found with id: 507f1f77bcf86cd799439011"
}
```

### 4. Get Lists by User ID
**Endpoint:** `GET /api/lists/user/{userId}`

**Path Parameters:**
- `userId` (string): The MongoDB ObjectId of the user

**Headers:**
```
Authorization: Bearer {jwt-token}
```

**Success Response (200 OK):**
```json
[
  {
    "id": "507f1f77bcf86cd799439011",
    "name": "Favourites",
    "description": "Your favourite matches",
    "createdAt": "2026-01-03T14:30:00",
    "updatedAt": "2026-01-03T14:30:00",
    "userId": "507f191e810c19729de860ea",
    "username": "john_doe",
    "matchIds": [123, 456]
  }
]
```

### 5. Create Custom List
**Endpoint:** `POST /api/lists`

**Headers:**
```
Authorization: Bearer {jwt-token}
Content-Type: application/json
```

**Request Body:**
```json
{
  "name": "Champions League Finals",
  "description": "Best CL finals I've watched",
  "matchIds": [123, 456, 789]
}
```

**Validation Rules:**
- `name`: Required, 1-100 characters
- `description`: Optional, max 500 characters
- `matchIds`: Optional, array of match IDs (must exist in database)

**Success Response (201 Created):**
```json
{
  "id": "507f1f77bcf86cd799439014",
  "name": "Champions League Finals",
  "description": "Best CL finals I've watched",
  "createdAt": "2026-01-03T15:00:00",
  "updatedAt": "2026-01-03T15:00:00",
  "userId": "507f191e810c19729de860ea",
  "username": "john_doe",
  "matchIds": [123, 456, 789]
}
```

**Error Responses:**
```json
// 400 - Validation error
{
  "timestamp": "2026-01-03T15:00:00",
  "status": 400,
  "error": "Bad Request",
  "message": "List name is required"
}

// 404 - Invalid match ID
{
  "timestamp": "2026-01-03T15:00:00",
  "status": 404,
  "error": "Not Found",
  "message": "Match not found with id: 999"
}
```

### 6. Update Custom List
**Endpoint:** `PUT /api/lists/{listId}`

**Path Parameters:**
- `listId` (string): The MongoDB ObjectId of the list

**Headers:**
```
Authorization: Bearer {jwt-token}
Content-Type: application/json
```

**Request Body:**
```json
{
  "name": "Updated List Name",
  "description": "Updated description",
  "matchIds": [123, 456, 999, 1001]
}
```

**Success Response (200 OK):**
```json
{
  "id": "507f1f77bcf86cd799439011",
  "name": "Updated List Name",
  "description": "Updated description",
  "createdAt": "2026-01-03T14:30:00",
  "updatedAt": "2026-01-03T15:30:00",
  "userId": "507f191e810c19729de860ea",
  "username": "john_doe",
  "matchIds": [123, 456, 999, 1001]
}
```

**Error Responses:**
```json
// 403 - Not authorized
{
  "timestamp": "2026-01-03T15:30:00",
  "status": 403,
  "error": "Forbidden",
  "message": "User is not authorized to update this list"
}

// 404 - List not found
{
  "timestamp": "2026-01-03T15:30:00",
  "status": 404,
  "error": "Not Found",
  "message": "Custom list not found with id: 507f1f77bcf86cd799439011"
}
```

### 7. Delete Custom List
**Endpoint:** `DELETE /api/lists/{listId}`

**Path Parameters:**
- `listId` (string): The MongoDB ObjectId of the list

**Headers:**
```
Authorization: Bearer {jwt-token}
```

**Success Response (204 No Content):**
```
(Empty response body)
```

**Error Responses:**
```json
// 403 - Not authorized
{
  "timestamp": "2026-01-03T15:30:00",
  "status": 403,
  "error": "Forbidden",
  "message": "User is not authorized to delete this list"
}

// 404 - List not found
{
  "timestamp": "2026-01-03T15:30:00",
  "status": 404,
  "error": "Not Found",
  "message": "Custom list not found with id: 507f1f77bcf86cd799439011"
}
```

### 8. Add Match to List
**Endpoint:** `POST /api/lists/{listId}/matches/{matchId}`

**Path Parameters:**
- `listId` (string): The MongoDB ObjectId of the list
- `matchId` (number): The ID of the match to add

**Headers:**
```
Authorization: Bearer {jwt-token}
```

**Success Response (200 OK):**
```json
{
  "id": "507f1f77bcf86cd799439011",
  "name": "Favourites",
  "description": "Your favourite matches",
  "createdAt": "2026-01-03T14:30:00",
  "updatedAt": "2026-01-03T16:00:00",
  "userId": "507f191e810c19729de860ea",
  "username": "john_doe",
  "matchIds": [123, 456, 789, 999]
}
```

**Notes:**
- If match is already in the list, it won't be added again
- Match ID must exist in the database

**Error Responses:**
```json
// 403 - Not authorized
{
  "timestamp": "2026-01-03T16:00:00",
  "status": 403,
  "error": "Forbidden",
  "message": "User is not authorized to modify this list"
}

// 404 - Match not found
{
  "timestamp": "2026-01-03T16:00:00",
  "status": 404,
  "error": "Not Found",
  "message": "Match not found with id: 999"
}
```

### 9. Remove Match from List
**Endpoint:** `DELETE /api/lists/{listId}/matches/{matchId}`

**Path Parameters:**
- `listId` (string): The MongoDB ObjectId of the list
- `matchId` (number): The ID of the match to remove

**Headers:**
```
Authorization: Bearer {jwt-token}
```

**Success Response (200 OK):**
```json
{
  "id": "507f1f77bcf86cd799439011",
  "name": "Favourites",
  "description": "Your favourite matches",
  "createdAt": "2026-01-03T14:30:00",
  "updatedAt": "2026-01-03T16:30:00",
  "userId": "507f191e810c19729de860ea",
  "username": "john_doe",
  "matchIds": [123, 456, 789]
}
```

**Error Response (403 Forbidden):**
```json
{
  "timestamp": "2026-01-03T16:30:00",
  "status": 403,
  "error": "Forbidden",
  "message": "User is not authorized to modify this list"
}
```

---

## TypeScript Interfaces (Optional)

```typescript
// Auth Types
interface RegisterRequest {
  username: string;
  email: string;
  password: string;
  roles?: string[];
}

interface LoginRequest {
  username: string;
  password: string;
}

interface AuthResponse {
  token: string | null;
  id: string;
  username: string;
  email: string;
  roles: string[];
}

// Custom List Types
interface CustomList {
  id: string;
  name: string;
  description: string;
  createdAt: string; // ISO 8601 format
  updatedAt: string; // ISO 8601 format
  userId: string;
  username: string;
  matchIds: number[];
}

interface CreateCustomListRequest {
  name: string;
  description?: string;
  matchIds?: number[];
}

interface UpdateCustomListRequest {
  name: string;
  description?: string;
  matchIds?: number[];
}
```

---

## Frontend Implementation Tips

### 1. Authentication Setup

**Store JWT Token:**
```javascript
// After successful login
localStorage.setItem('jwt_token', response.token);
localStorage.setItem('user_id', response.id);
localStorage.setItem('username', response.username);
```

**Create Axios Instance with Auth:**
```javascript
import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:8080',
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('jwt_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
```

### 2. Common API Calls

**Register:**
```javascript
const register = async (username, email, password) => {
  const response = await axios.post('http://localhost:8080/api/auth/register', {
    username,
    email,
    password
  });
  return response.data;
};
```

**Login:**
```javascript
const login = async (username, password) => {
  const response = await axios.post('http://localhost:8080/api/auth/login', {
    username,
    password
  });
  // Store token
  localStorage.setItem('jwt_token', response.data.token);
  return response.data;
};
```

**Get My Lists:**
```javascript
const getMyLists = async () => {
  const response = await api.get('/api/lists/my-lists');
  return response.data;
};
```

**Create List:**
```javascript
const createList = async (name, description, matchIds = []) => {
  const response = await api.post('/api/lists', {
    name,
    description,
    matchIds
  });
  return response.data;
};
```

**Add Match to List:**
```javascript
const addMatchToList = async (listId, matchId) => {
  const response = await api.post(`/api/lists/${listId}/matches/${matchId}`);
  return response.data;
};
```

**Remove Match from List:**
```javascript
const removeMatchFromList = async (listId, matchId) => {
  const response = await api.delete(`/api/lists/${listId}/matches/${matchId}`);
  return response.data;
};
```

### 3. Default Lists on Registration

After registration, the user will have three lists automatically:
- Access them via `GET /api/lists/my-lists`
- Find specific lists by name: "Favourites", "Watched", "Reviewed"
- Store list IDs for quick access

```javascript
const getDefaultLists = async () => {
  const allLists = await getMyLists();
  return {
    favourites: allLists.find(list => list.name === 'Favourites'),
    watched: allLists.find(list => list.name === 'Watched'),
    reviewed: allLists.find(list => list.name === 'Reviewed')
  };
};
```

### 4. Error Handling

```javascript
try {
  const lists = await getMyLists();
} catch (error) {
  if (error.response?.status === 401) {
    // Unauthorized - redirect to login
    window.location.href = '/login';
  } else if (error.response?.status === 403) {
    // Forbidden - show error message
    console.error('You are not authorized to perform this action');
  } else {
    // Other errors
    console.error('An error occurred:', error.message);
  }
}
```

---

## Common Workflows

### Workflow 1: User Registration & Setup
1. `POST /api/auth/register` - Register new user
2. `POST /api/auth/login` - Login to get JWT token
3. `GET /api/lists/my-lists` - Fetch default lists (Favourites, Watched, Reviewed)
4. Store list IDs for quick access

### Workflow 2: Adding Match to Favourites
1. User clicks "Add to Favourites" on a match
2. Get Favourites list ID from stored lists
3. `POST /api/lists/{favouritesListId}/matches/{matchId}` - Add match
4. Update UI to reflect change

### Workflow 3: Creating Custom List
1. User clicks "Create New List"
2. Show form with name and description fields
3. `POST /api/lists` - Create list with initial matches (optional)
4. `GET /api/lists/my-lists` - Refresh lists
5. Display new list in UI

### Workflow 4: Managing List Contents
1. Display list with matches
2. For each match:
   - Show "Remove" button
   - `DELETE /api/lists/{listId}/matches/{matchId}` - Remove match
3. Show "Add matches" button:
   - Browse available matches
   - `POST /api/lists/{listId}/matches/{matchId}` - Add selected match

---

## CORS Configuration

The backend is configured to allow requests from:
- `http://localhost:5173` (Vite default)
- `http://localhost:3000` (React default)

If using a different port, update the CORS configuration in the backend.
