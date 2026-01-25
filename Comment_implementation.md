# User Comments Activity Tracking API Documentation

## Overview

Our backend has a user comments activity tracking system that automatically maintains a list of comment IDs for each user.

## Backend Structure

### User Model
Each user has a `comments` field that tracks all comment IDs they've created:
```json
{
  "id": "507f1f77bcf86cd799439011",
  "username": "john_doe",
  "email": "john@example.com",
  "roles": ["USER"],
  "comments": ["comment_id_1", "comment_id_2", "comment_id_3"]
}
```

### Comment Model (DTO)
```json
{
  "id": "60d5ec49f1b2c72b8c8e4b23",
  "text": "Great match! Amazing performance by both teams.",
  "createdAt": "2025-12-28T14:30:00",
  "userId": "507f1f77bcf86cd799439011",
  "username": "john_doe",
  "userEmail": "john@example.com",
  "eventId": 12345
}
```

## API Endpoints

**Base URL:** `http://localhost:8080/api`

### 1. Create Comment
**POST** `/api/comments`

**Request Body:**
```json
{
  "text": "What an incredible match!",
  "userId": "507f1f77bcf86cd799439011",
  "eventId": 12345
}
```

**Response:** `201 Created`
```json
{
  "id": "60d5ec49f1b2c72b8c8e4b23",
  "text": "What an incredible match!",
  "createdAt": "2025-12-28T14:30:00",
  "userId": "507f1f77bcf86cd799439011",
  "username": "john_doe",
  "userEmail": "john@example.com",
  "eventId": 12345
}
```

**Side Effect:** The comment ID is automatically added to the user's `comments` list in the database.

### 2. Get Comments by Match ID
**GET** `/api/comments/event/{eventId}`

**Example:** `GET /api/comments/event/12345`

**Response:** `200 OK`
```json
[
  {
    "id": "60d5ec49f1b2c72b8c8e4b23",
    "text": "What an incredible match!",
    "createdAt": "2025-12-28T14:30:00",
    "userId": "507f1f77bcf86cd799439011",
    "username": "john_doe",
    "userEmail": "john@example.com",
    "eventId": 12345
  },
  {
    "id": "60d5ec49f1b2c72b8c8e4b24",
    "text": "Best game of the season!",
    "createdAt": "2025-12-28T15:45:00",
    "userId": "507f1f77bcf86cd799439012",
    "username": "jane_smith",
    "userEmail": "jane@example.com",
    "eventId": 12345
  }
]
```

### 3. Get Comments by User ID
**GET** `/api/comments/user/{userId}`

**Example:** `GET /api/comments/user/507f1f77bcf86cd799439011`

**Response:** `200 OK`
```json
[
  {
    "id": "60d5ec49f1b2c72b8c8e4b23",
    "text": "What an incredible match!",
    "createdAt": "2025-12-28T14:30:00",
    "userId": "507f1f77bcf86cd799439011",
    "username": "john_doe",
    "userEmail": "john@example.com",
    "eventId": 12345
  },
  {
    "id": "60d5ec49f1b2c72b8c8e4b25",
    "text": "Can't believe that last goal!",
    "createdAt": "2025-12-27T18:20:00",
    "userId": "507f1f77bcf86cd799439011",
    "username": "john_doe",
    "userEmail": "john@example.com",
    "eventId": 67890
  }
]
```

### 4. Update Comment
**PUT** `/api/comments/{id}`

**Example:** `PUT /api/comments/60d5ec49f1b2c72b8c8e4b23`

**Request Body:**
```json
{
  "text": "Updated: What an absolutely incredible match!"
}
```

**Response:** `200 OK`
```json
{
  "id": "60d5ec49f1b2c72b8c8e4b23",
  "text": "Updated: What an absolutely incredible match!",
  "createdAt": "2025-12-28T14:30:00",
  "userId": "507f1f77bcf86cd799439011",
  "username": "john_doe",
  "userEmail": "john@example.com",
  "eventId": 12345
}
```

### 5. Delete Comment
**DELETE** `/api/comments/{id}`

**Example:** `DELETE /api/comments/60d5ec49f1b2c72b8c8e4b23`

**Response:** `204 No Content`

**Side Effect:** The comment ID is automatically removed from the user's `comments` list in the database.

### 6. Get Single Comment
**GET** `/api/comments/{id}`

**Example:** `GET /api/comments/60d5ec49f1b2c72b8c8e4b23`

**Response:** `200 OK`
```json
{
  "id": "60d5ec49f1b2c72b8c8e4b23",
  "text": "What an incredible match!",
  "createdAt": "2025-12-28T14:30:00",
  "userId": "507f1f77bcf86cd799439011",
  "username": "john_doe",
  "userEmail": "john@example.com",
  "eventId": 12345
}
```

## Key Features

- **Automatic Activity Tracking:** When a user creates a comment, the comment ID is automatically added to their `comments` list
- **Automatic Cleanup:** When a comment is deleted, it's automatically removed from the user's `comments` list
- **Match Integration:** The `eventId` field refers to match IDs (kept as eventId for API compatibility)
- **Timestamp Format:** All timestamps are in ISO 8601 format (LocalDateTime)
- **Denormalized Data:** User info (username, email) is denormalized in comments for better query performance

## Implementation Details

### Backend Files
- **Model:** `/src/main/java/com/de/matchlogAPI/Models/User.java` - Contains `comments` list
- **Service:** `/src/main/java/com/de/matchlogAPI/Service/impl/CommentServiceImpl.java` - Manages comment and user updates
- **Controller:** `/src/main/java/com/de/matchlogAPI/Controller/impl/CommentControllerImpl.java` - REST endpoints

### Database
- **Collection:** `users` - MongoDB collection storing user documents with comment references
- **Collection:** `comments` - MongoDB collection storing comment documents
- **Field:** `comments: List<String>` - Array of comment IDs in the User document
