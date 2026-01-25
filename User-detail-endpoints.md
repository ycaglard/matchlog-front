# User Detail API Documentation

## Overview

This API provides endpoints to retrieve detailed user profile information including their comment activity. These endpoints are designed for building user profile pages on the frontend.

## Backend Structure

### UserDTO Model
The UserDTO is a safe representation of user data without sensitive information like passwords:

```json
{
  "id": "507f1f77bcf86cd799439011",
  "username": "john_doe",
  "email": "john@example.com",
  "roles": ["USER"],
  "comments": [
    "60d5ec49f1b2c72b8c8e4b23",
    "60d5ec49f1b2c72b8c8e4b24",
    "60d5ec49f1b2c72b8c8e4b25"
  ],
  "commentCount": 3
}
```

### Fields Explanation
- **id**: Unique user identifier
- **username**: User's display name
- **email**: User's email address
- **roles**: Array of user roles (e.g., "USER", "ADMIN")
- **comments**: Array of comment IDs the user has created
- **commentCount**: Total number of comments the user has made

## API Endpoints

**Base URL:** `http://localhost:8080/api`

### 1. Get User by ID
**GET** `/api/users/{id}`

Retrieves user profile information by user ID.

**Example Request:**
```
GET /api/users/507f1f77bcf86cd799439011
```

**Response:** `200 OK`
```json
{
  "id": "507f1f77bcf86cd799439011",
  "username": "john_doe",
  "email": "john@example.com",
  "roles": ["USER"],
  "comments": [
    "60d5ec49f1b2c72b8c8e4b23",
    "60d5ec49f1b2c72b8c8e4b24",
    "60d5ec49f1b2c72b8c8e4b25"
  ],
  "commentCount": 3
}
```

**Error Response:** `500 Internal Server Error`
```json
{
  "message": "User not found with id: 507f1f77bcf86cd799439011"
}
```

### 2. Get User by Username
**GET** `/api/users/username/{username}`

Retrieves user profile information by username.

**Example Request:**
```
GET /api/users/username/john_doe
```

**Response:** `200 OK`
```json
{
  "id": "507f1f77bcf86cd799439011",
  "username": "john_doe",
  "email": "john@example.com",
  "roles": ["USER"],
  "comments": [
    "60d5ec49f1b2c72b8c8e4b23",
    "60d5ec49f1b2c72b8c8e4b24",
    "60d5ec49f1b2c72b8c8e4b25"
  ],
  "commentCount": 3
}
```

**Error Response:** `500 Internal Server Error`
```json
{
  "message": "User not found with username: john_doe"
}
```

## Frontend Integration Examples

### Example 1: Fetch User Profile by ID
```javascript
// Fetch user profile
async function getUserProfile(userId) {
  try {
    const response = await fetch(`http://localhost:8080/api/users/${userId}`);
    const user = await response.json();
    
    console.log(`User: ${user.username}`);
    console.log(`Email: ${user.email}`);
    console.log(`Total Comments: ${user.commentCount}`);
    
    return user;
  } catch (error) {
    console.error('Error fetching user:', error);
  }
}

// Usage
getUserProfile('507f1f77bcf86cd799439011');
```

### Example 2: Fetch User Profile by Username
```javascript
// Fetch user by username
async function getUserByUsername(username) {
  try {
    const response = await fetch(`http://localhost:8080/api/users/username/${username}`);
    const user = await response.json();
    
    return user;
  } catch (error) {
    console.error('Error fetching user:', error);
  }
}

// Usage
getUserByUsername('john_doe');
```

### Example 3: Fetch User with Their Comments
```javascript
// Fetch complete user profile with comment details
async function getUserWithComments(userId) {
  try {
    // Step 1: Get user profile
    const userResponse = await fetch(`http://localhost:8080/api/users/${userId}`);
    const user = await userResponse.json();
    
    // Step 2: Get user's comments
    const commentsResponse = await fetch(`http://localhost:8080/api/comments/user/${userId}`);
    const comments = await commentsResponse.json();
    
    return {
      ...user,
      commentDetails: comments
    };
  } catch (error) {
    console.error('Error fetching user with comments:', error);
  }
}

// Usage
const userWithComments = await getUserWithComments('507f1f77bcf86cd799439011');
console.log(userWithComments);
```

### Example 4: React Component
```jsx
import { useState, useEffect } from 'react';

function UserProfile({ userId }) {
  const [user, setUser] = useState(null);
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        // Fetch user profile
        const userRes = await fetch(`http://localhost:8080/api/users/${userId}`);
        const userData = await userRes.json();
        setUser(userData);

        // Fetch user's comments
        const commentsRes = await fetch(`http://localhost:8080/api/comments/user/${userId}`);
        const commentsData = await commentsRes.json();
        setComments(commentsData);
      } catch (error) {
        console.error('Error:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [userId]);

  if (loading) return <div>Loading...</div>;

  return (
    <div className="user-profile">
      <h1>{user.username}</h1>
      <p>Email: {user.email}</p>
      <p>Total Comments: {user.commentCount}</p>
      
      <h2>Recent Comments</h2>
      <ul>
        {comments.map(comment => (
          <li key={comment.id}>
            <p>{comment.text}</p>
            <small>{new Date(comment.createdAt).toLocaleString()}</small>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default UserProfile;
```

### Example 5: Using Axios
```javascript
import axios from 'axios';

const API_BASE_URL = 'http://localhost:8080/api';

// Get user by ID
export const getUserById = async (userId) => {
  const response = await axios.get(`${API_BASE_URL}/users/${userId}`);
  return response.data;
};

// Get user by username
export const getUserByUsername = async (username) => {
  const response = await axios.get(`${API_BASE_URL}/users/username/${username}`);
  return response.data;
};

// Get user with comments
export const getUserWithComments = async (userId) => {
  const [user, comments] = await Promise.all([
    axios.get(`${API_BASE_URL}/users/${userId}`),
    axios.get(`${API_BASE_URL}/comments/user/${userId}`)
  ]);
  
  return {
    ...user.data,
    commentDetails: comments.data
  };
};
```

## Common Use Cases

### 1. User Profile Page
- Fetch user by ID: `GET /api/users/{id}`
- Display username, email, roles, and comment count
- Fetch user's comments: `GET /api/comments/user/{userId}`
- Display comment list with details

### 2. User Search/Directory
- Search users by username: `GET /api/users/username/{username}`
- Display user cards with basic info
- Link to full profile page

### 3. Comment Author Info
- When displaying comments, each comment has `userId`
- Fetch full user info: `GET /api/users/{userId}`
- Display user avatar, username, and profile link

### 4. Activity Dashboard
- Get current user's ID from authentication
- Fetch user profile: `GET /api/users/{id}`
- Use `comments` array to display activity count
- Fetch detailed comments: `GET /api/comments/user/{userId}`

## Security Notes

- These endpoints are **public** and do not require authentication
- Sensitive information (password) is **never** exposed in the UserDTO
- Email addresses are included - consider making them optional based on privacy settings
- No authorization checks - any user can view any profile

## Implementation Details

### Backend Files
- **DTO:** `/src/main/java/com/de/matchlogAPI/Models/DTO/UserDTO.java`
- **Mapper:** `/src/main/java/com/de/matchlogAPI/mapper/UserMapper.java`
- **Service Interface:** `/src/main/java/com/de/matchlogAPI/Service/UserService.java`
- **Service Implementation:** `/src/main/java/com/de/matchlogAPI/Service/impl/UserServiceImpl.java`
- **Controller Interface:** `/src/main/java/com/de/matchlogAPI/Controller/UserController.java`
- **Controller Implementation:** `/src/main/java/com/de/matchlogAPI/Controller/impl/UserControllerImpl.java`

### Database
- **Collection:** `users` - MongoDB collection
- **Fields Used:** `id`, `username`, `email`, `roles`, `comments`
- **Query Methods:** `findById()`, `findByUsername()`

## Related Endpoints

These user endpoints work well with the comment endpoints:

- `GET /api/comments/user/{userId}` - Get all comments by a user
- `GET /api/comments/event/{eventId}` - Get comments for a specific match
- `POST /api/comments` - Create a new comment (updates user's comments list)
- `DELETE /api/comments/{id}` - Delete a comment (removes from user's comments list)

See [USER_COMMENTS_API_DOCUMENTATION.md](USER_COMMENTS_API_DOCUMENTATION.md) for complete comment API details.
