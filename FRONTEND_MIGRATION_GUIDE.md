# Frontend Migration Guide - MongoDB & Match Model Update

## Overview
This guide provides step-by-step instructions for migrating the MatchLog frontend from the old Event-based model with H2/JPA to the new Match-based model with MongoDB. The backend has undergone a complete architectural change from a relational database with separate Event, Match, and Team entities to a NoSQL document-based approach with nested Match documents.

---

## Critical Changes Summary

### 1. **API Endpoint Changes**
- **OLD**: `/api/events/*` 
- **NEW**: `/api/matches/*`

### 2. **Data Model Changes**
- **OLD**: Separate Event, Match, Team entities with relationships
- **NEW**: Single Match document with embedded nested objects (Area, Competition, Season, TeamInfo, Score)

### 3. **ID Type Changes**
- **Comment IDs**: Changed from `number` to `string` (MongoDB ObjectId)
- **User IDs**: Changed from `number` to `string` (MongoDB ObjectId)
- **Match IDs**: Remain `number` (Long from Football-Data.org API)
- **Team IDs**: Changed from `number` to `Integer` (nested in TeamInfo)

### 4. **Field Structure Changes**
- **OLD**: Flat structure with `eventType`, `match.home`, `match.away`
- **NEW**: Nested document structure with `homeTeam`, `awayTeam`, `competition`, `season`, `area`, `score`

---

## Step-by-Step Migration

### STEP 1: Update API Base Endpoints

#### File: `src/clients/eventClient.js` (rename to `matchClient.js`)

**Changes Required:**

1. **Rename the file**: `eventClient.js` → `matchClient.js`

2. **Update all endpoint URLs**:

```javascript
// OLD
const BASE_URL = '/api/events';

// NEW
const BASE_URL = '/api/matches';
```

3. **Update function names and endpoints**:

```javascript
// OLD FUNCTIONS → NEW FUNCTIONS

// ❌ OLD
export async function getEvents() {
  return await fetchWithAuth(`${BASE_URL}`);
}

// ✅ NEW
export async function getMatches() {
  return await fetchWithAuth(`${BASE_URL}`);
}

// ❌ OLD
export async function getEventById(id) {
  return await fetchWithAuth(`${BASE_URL}/id/${id}`);
}

// ✅ NEW
export async function getMatchById(id) {
  return await fetchWithAuth(`${BASE_URL}/${id}`);
}

// ❌ OLD
export async function getEventsByDate(date) {
  return await fetchWithAuth(`${BASE_URL}/date/${date}`);
}

// ⚠️ REMOVED - No direct date endpoint in new API
// Use getMatchesByDateRange instead

// ❌ OLD
export async function getEventsByDateRange(startDate, endDate) {
  return await fetchWithAuth(`${BASE_URL}/daterange?startDate=${startDate}&endDate=${endDate}`);
}

// ✅ NEW
export async function getMatchesByDateRange(startDate, endDate) {
  return await fetchWithAuth(`${BASE_URL}/date-range?startDate=${startDate}&endDate=${endDate}`);
}

// ❌ OLD
export async function getEventsByTeamName(teamName) {
  return await fetchWithAuth(`${BASE_URL}/team/${teamName}`);
}

// ✅ NEW - Changed from team name to team ID
export async function getMatchesByTeamId(teamId) {
  return await fetchWithAuth(`${BASE_URL}/team/${teamId}`);
}

// ❌ OLD
export async function searchEvents(query, limit = 10) {
  return await fetchWithAuth(`${BASE_URL}/search?query=${query}&limit=${limit}`);
}

// ⚠️ REMOVED - No search endpoint in new API
// Implement client-side search or use other endpoints
```

4. **Add new endpoints available in Match API**:

```javascript
// ✅ NEW endpoints
export async function getMatchesByCompetition(competitionId) {
  return await fetchWithAuth(`${BASE_URL}/competition/${competitionId}`);
}

export async function getMatchesByCompetitionCode(code) {
  return await fetchWithAuth(`${BASE_URL}/competition/code/${code}`);
}

export async function getMatchesByStatus(status) {
  return await fetchWithAuth(`${BASE_URL}/status/${status}`);
}

export async function getTodayMatches() {
  return await fetchWithAuth(`${BASE_URL}/today`);
}

export async function getUpcomingMatches() {
  return await fetchWithAuth(`${BASE_URL}/upcoming`);
}

export async function getFinishedMatches() {
  return await fetchWithAuth(`${BASE_URL}/finished`);
}

export async function getMatchesByCompetitionAndMatchday(competitionId, matchday) {
  return await fetchWithAuth(`${BASE_URL}/competition/${competitionId}/matchday/${matchday}`);
}

export async function getMatchStats() {
  return await fetchWithAuth(`${BASE_URL}/stats`);
}
```

---

### STEP 2: Update Comment API Client

#### File: `src/clients/commentClient.js` (create new or update existing)

**Key Changes:**

1. **Comment ID type changed from number to string**:

```javascript
// ❌ OLD
export async function getCommentById(id) {
  return await fetchWithAuth(`/api/comments/${id}`); // id was number
}

// ✅ NEW
export async function getCommentById(id) {
  return await fetchWithAuth(`/api/comments/${id}`); // id is now string (MongoDB ObjectId)
}
```

2. **Event ID parameter name remains `eventId` in DTO but refers to `matchId` internally**:

```javascript
// ✅ STAYS THE SAME (API compatibility maintained)
export async function createComment(commentData) {
  return await fetchWithAuth(`/api/comments`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      text: commentData.text,
      userId: commentData.userId, // now string
      eventId: commentData.eventId // still called eventId, but refers to matchId
    })
  });
}

export async function getCommentsByEventId(eventId) {
  return await fetchWithAuth(`/api/comments/event/${eventId}`);
}
```

3. **Add new comment endpoints**:

```javascript
// ✅ NEW
export async function updateComment(id, text) {
  return await fetchWithAuth(`/api/comments/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text })
  });
}

export async function deleteComment(id) {
  return await fetchWithAuth(`/api/comments/${id}`, {
    method: 'DELETE'
  });
}

export async function getCommentsByUserId(userId) {
  return await fetchWithAuth(`/api/comments/user/${userId}`);
}
```

---

### STEP 3: Update Data Models

#### File: `src/models/Match.js` (create new)

**Complete Match Model:**

```javascript
export class Match {
  constructor(data = {}) {
    this.id = data.id || null;
    this.utcDate = data.utcDate ? new Date(data.utcDate) : null;
    this.status = data.status || 'SCHEDULED';
    this.matchday = data.matchday || null;
    this.stage = data.stage || null;
    this.group = data.group || null;
    this.lastUpdated = data.lastUpdated ? new Date(data.lastUpdated) : null;
    
    // Nested objects
    this.area = data.area ? new Area(data.area) : null;
    this.competition = data.competition ? new Competition(data.competition) : null;
    this.season = data.season ? new Season(data.season) : null;
    this.homeTeam = data.homeTeam ? new TeamInfo(data.homeTeam) : null;
    this.awayTeam = data.awayTeam ? new TeamInfo(data.awayTeam) : null;
    this.score = data.score ? new Score(data.score) : null;
    
    // Comments embedded in match
    this.comments = data.comments ? data.comments.map(c => new CommentRef(c)) : [];
  }

  // Helper methods
  getMatchDescription() {
    return `${this.homeTeam?.name || 'TBD'} vs ${this.awayTeam?.name || 'TBD'}`;
  }

  getFormattedDate() {
    if (!this.utcDate) return '';
    return this.utcDate.toLocaleDateString('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  isFinished() {
    return this.status === 'FINISHED';
  }

  isUpcoming() {
    return ['SCHEDULED', 'TIMED'].includes(this.status);
  }

  isLive() {
    return ['IN_PLAY', 'PAUSED'].includes(this.status);
  }

  getCommentCount() {
    return this.comments?.length || 0;
  }
}

export class Area {
  constructor(data = {}) {
    this.id = data.id || null;
    this.name = data.name || '';
    this.code = data.code || '';
    this.flag = data.flag || '';
  }
}

export class Competition {
  constructor(data = {}) {
    this.id = data.id || null;
    this.name = data.name || '';
    this.code = data.code || '';
    this.type = data.type || '';
    this.emblem = data.emblem || '';
  }
}

export class Season {
  constructor(data = {}) {
    this.id = data.id || null;
    this.startDate = data.startDate ? new Date(data.startDate) : null;
    this.endDate = data.endDate ? new Date(data.endDate) : null;
    this.currentMatchday = data.currentMatchday || null;
    this.winner = data.winner ? new TeamInfo(data.winner) : null;
  }
}

export class TeamInfo {
  constructor(data = {}) {
    this.id = data.id || null;
    this.name = data.name || '';
    this.shortName = data.shortName || '';
    this.tla = data.tla || '';
    this.crest = data.crest || '';
    this.address = data.address || '';
    this.website = data.website || '';
    this.founded = data.founded || null;
    this.clubColors = data.clubColors || '';
    this.venue = data.venue || '';
    this.lastUpdated = data.lastUpdated ? new Date(data.lastUpdated) : null;
  }
}

export class Score {
  constructor(data = {}) {
    this.winner = data.winner || null; // 'HOME_TEAM', 'AWAY_TEAM', 'DRAW'
    this.duration = data.duration || 'REGULAR'; // 'REGULAR', 'EXTRA_TIME', 'PENALTY_SHOOTOUT'
    this.fullTime = data.fullTime ? new TimeScore(data.fullTime) : null;
    this.halfTime = data.halfTime ? new TimeScore(data.halfTime) : null;
  }

  getScoreDisplay() {
    if (!this.fullTime) return 'vs';
    return `${this.fullTime.home} - ${this.fullTime.away}`;
  }
}

export class TimeScore {
  constructor(data = {}) {
    this.home = data.home ?? null;
    this.away = data.away ?? null;
  }
}

export class CommentRef {
  constructor(data = {}) {
    this.id = data.id || ''; // MongoDB ObjectId as string
    this.text = data.text || '';
    this.createdAt = data.createdAt ? new Date(data.createdAt) : null;
    this.userId = data.userId || ''; // MongoDB ObjectId as string
    this.username = data.username || '';
  }
}
```

#### File: `src/models/Comment.js` (update existing)

```javascript
export class Comment {
  constructor(data = {}) {
    this.id = data.id || ''; // Changed from number to string (MongoDB ObjectId)
    this.text = data.text || '';
    this.createdAt = data.createdAt ? new Date(data.createdAt) : null;
    this.userId = data.userId || ''; // Changed from number to string
    this.username = data.username || '';
    this.userEmail = data.userEmail || '';
    this.eventId = data.eventId || null; // Still called eventId, refers to matchId
  }

  getFormattedDate() {
    if (!this.createdAt) return '';
    return this.createdAt.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }
}
```

#### File: `src/models/User.js` (update existing)

```javascript
export class User {
  constructor(data = {}) {
    this.id = data.id || ''; // Changed from number to string (MongoDB ObjectId)
    this.username = data.username || '';
    this.email = data.email || '';
    this.roles = data.roles || [];
    this.profilePicture = data.profilePicture || null;
    this.createdAt = data.createdAt ? new Date(data.createdAt) : null;
  }

  // ... rest of methods stay the same
}
```

---

### STEP 4: Update Vue Components

#### 4.1: Home.vue - Event List Page

**Major Changes:**

```vue
<script setup>
// ❌ OLD imports
import { getEventsByDateRange, getEventsByTeamName } from '@/clients/eventClient';

// ✅ NEW imports
import { getMatchesByDateRange, getMatchesByTeamId, getUpcomingMatches } from '@/clients/matchClient';
import { Match } from '@/models/Match';

// ❌ OLD
const events = ref([]);

// ✅ NEW
const matches = ref([]);

// ❌ OLD - Load events by date range
async function loadUpcomingEvents() {
  const today = new Date();
  const nextWeek = new Date(today);
  nextWeek.setDate(today.getDate() + 7);
  
  const startDate = formatDate(today);
  const endDate = formatDate(nextWeek);
  
  events.value = await getEventsByDateRange(startDate, endDate);
}

// ✅ NEW - Use dedicated upcoming endpoint or date range
async function loadUpcomingMatches() {
  // Option 1: Use dedicated endpoint
  const data = await getUpcomingMatches();
  matches.value = data.map(m => new Match(m));
  
  // Option 2: Use date range (if you want specific date control)
  // const today = new Date();
  // const nextWeek = new Date(today);
  // nextWeek.setDate(today.getDate() + 7);
  // const startDate = today.toISOString().split('T')[0];
  // const endDate = nextWeek.toISOString().split('T')[0];
  // const data = await getMatchesByDateRange(startDate, endDate);
  // matches.value = data.map(m => new Match(m));
}

// ❌ OLD - Search by team name
async function searchByTeam(teamName) {
  const results = await getEventsByTeamName(teamName);
  events.value = results;
}

// ✅ NEW - Search by team ID
// NOTE: You'll need to implement team search/lookup separately
// since the API now requires team ID, not name
async function searchByTeamId(teamId) {
  const results = await getMatchesByTeamId(teamId);
  matches.value = results.map(m => new Match(m));
}

// For team name search, you'll need to:
// 1. Fetch all matches
// 2. Filter client-side by homeTeam.name or awayTeam.name
async function searchByTeamName(teamName) {
  const allMatches = await getUpcomingMatches();
  const filtered = allMatches.filter(match => 
    match.homeTeam?.name.toLowerCase().includes(teamName.toLowerCase()) ||
    match.awayTeam?.name.toLowerCase().includes(teamName.toLowerCase())
  );
  matches.value = filtered.map(m => new Match(m));
}
</script>

<template>
  <!-- ❌ OLD -->
  <EventCard 
    v-for="event in events" 
    :key="event.id" 
    :event="event" 
  />
  
  <!-- ✅ NEW -->
  <MatchCard 
    v-for="match in matches" 
    :key="match.id" 
    :match="match" 
  />
</template>
```

#### 4.2: EventDetail.vue → MatchDetail.vue (rename)

**File Rename**: `EventDetail.vue` → `MatchDetail.vue`

**Route Change**: Update router to use `/match/:id` instead of `/event/:id`

```vue
<script setup>
// ❌ OLD imports
import { getEventById } from '@/clients/eventClient';

// ✅ NEW imports
import { getMatchById } from '@/clients/matchClient';
import { Match } from '@/models/Match';

// ❌ OLD
const event = ref(null);
const eventId = route.params.id;

// ✅ NEW
const match = ref(null);
const matchId = route.params.id;

// ❌ OLD
async function loadEvent() {
  event.value = await getEventById(eventId);
}

// ✅ NEW
async function loadMatch() {
  const data = await getMatchById(matchId);
  match.value = new Match(data);
}

// ❌ OLD - Accessing event data
const homeTeam = event.value?.match?.home?.name;
const awayTeam = event.value?.match?.away?.name;
const commentCount = event.value?.commentCount;

// ✅ NEW - Accessing match data
const homeTeam = match.value?.homeTeam?.name;
const awayTeam = match.value?.awayTeam?.name;
const commentCount = match.value?.getCommentCount();
const matchDescription = match.value?.getMatchDescription();

// ❌ OLD - Comments from event DTO
const comments = event.value?.comments || [];

// ✅ NEW - Comments embedded in match document
const comments = match.value?.comments || [];

// ❌ OLD - Creating comment
async function submitComment() {
  await createComment({
    text: commentText.value,
    userId: currentUser.id, // was number
    eventId: eventId // was number
  });
  await loadEvent(); // Refresh to see new comment
}

// ✅ NEW - Creating comment
async function submitComment() {
  await createComment({
    text: commentText.value,
    userId: currentUser.id, // now string
    eventId: matchId // eventId in API, but it's matchId (still number)
  });
  await loadMatch(); // Refresh to see new comment in embedded comments array
}
</script>

<template>
  <div v-if="match">
    <!-- ❌ OLD structure -->
    <h1>{{ event.eventType }}</h1>
    <h2>{{ event.match.home.name }} vs {{ event.match.away.name }}</h2>
    <p>{{ formatDate(event.date) }}</p>
    <p>{{ event.commentCount }} comments</p>
    
    <!-- ✅ NEW structure -->
    <div class="match-header">
      <img :src="match.competition?.emblem" :alt="match.competition?.name" />
      <h1>{{ match.competition?.name }}</h1>
      <p>{{ match.stage }} - Matchday {{ match.matchday }}</p>
    </div>
    
    <div class="teams">
      <div class="team">
        <img :src="match.homeTeam?.crest" :alt="match.homeTeam?.name" />
        <h2>{{ match.homeTeam?.name }}</h2>
      </div>
      
      <div class="score">
        <h1>{{ match.score?.getScoreDisplay() || 'vs' }}</h1>
        <p>{{ match.status }}</p>
      </div>
      
      <div class="team">
        <img :src="match.awayTeam?.crest" :alt="match.awayTeam?.name" />
        <h2>{{ match.awayTeam?.name }}</h2>
      </div>
    </div>
    
    <p>{{ match.getFormattedDate() }}</p>
    <p>{{ match.getCommentCount() }} comments</p>
    
    <!-- Comments section - structure stays similar -->
    <div class="comments">
      <div v-for="comment in match.comments" :key="comment.id">
        <p><strong>{{ comment.username }}</strong></p>
        <p>{{ comment.text }}</p>
        <p class="date">{{ new Date(comment.createdAt).toLocaleString() }}</p>
      </div>
    </div>
  </div>
</template>
```

#### 4.3: EventCard.vue → MatchCard.vue (rename and update)

**File Rename**: `EventCard.vue` → `MatchCard.vue`

```vue
<script setup>
// ❌ OLD props
const props = defineProps({
  event: {
    type: Object,
    required: true
  }
});

// ✅ NEW props
const props = defineProps({
  match: {
    type: Object,
    required: true
  }
});

// ❌ OLD data access
const eventType = props.event.eventType;
const homeTeam = props.event.match?.home?.name;
const awayTeam = props.event.match?.away?.name;
const date = props.event.date;

// ✅ NEW data access
const competition = props.match.competition?.name;
const homeTeam = props.match.homeTeam?.name;
const homeCrest = props.match.homeTeam?.crest;
const awayTeam = props.match.awayTeam?.name;
const awayCrest = props.match.awayTeam?.crest;
const date = props.match.utcDate;
const status = props.match.status;
const score = props.match.score?.getScoreDisplay();
</script>

<template>
  <!-- ❌ OLD template -->
  <div class="event-card">
    <h3>{{ event.eventType }}</h3>
    <p>{{ event.match.home.name }} vs {{ event.match.away.name }}</p>
    <p>{{ formatDate(event.date) }}</p>
  </div>
  
  <!-- ✅ NEW template -->
  <div class="match-card">
    <div class="competition">{{ match.competition?.name }}</div>
    <div class="teams">
      <div class="team">
        <img :src="match.homeTeam?.crest" :alt="match.homeTeam?.name" />
        <span>{{ match.homeTeam?.name }}</span>
      </div>
      
      <div class="score">{{ match.score?.getScoreDisplay() || 'vs' }}</div>
      
      <div class="team">
        <img :src="match.awayTeam?.crest" :alt="match.awayTeam?.name" />
        <span>{{ match.awayTeam?.name }}</span>
      </div>
    </div>
    
    <div class="info">
      <span class="status">{{ match.status }}</span>
      <span class="date">{{ match.getFormattedDate() }}</span>
    </div>
  </div>
</template>
```

#### 4.4: SearchBar.vue - Update Search Logic

```vue
<script setup>
// ❌ OLD
import { searchEvents } from '@/clients/eventClient';

// ✅ NEW - Search must be implemented differently
import { getUpcomingMatches } from '@/clients/matchClient';

// Since there's no search endpoint, implement client-side search
const suggestions = ref([]);

async function handleSearch(query) {
  if (query.length < 2) {
    suggestions.value = [];
    return;
  }
  
  // Fetch all upcoming matches and filter client-side
  const allMatches = await getUpcomingMatches();
  suggestions.value = allMatches
    .filter(match => 
      match.homeTeam?.name.toLowerCase().includes(query.toLowerCase()) ||
      match.awayTeam?.name.toLowerCase().includes(query.toLowerCase()) ||
      match.competition?.name.toLowerCase().includes(query.toLowerCase())
    )
    .slice(0, 5); // Limit to 5 suggestions
}

// Alternative: Add search endpoint to backend or use competition/team filters
</script>
```

#### 4.5: Router Updates

**File**: `src/router/index.js`

```javascript
// ❌ OLD
{
  path: '/event/:id',
  name: 'EventDetail',
  component: () => import('@/views/EventDetail.vue'),
  meta: { requiresAuth: true }
}

// ✅ NEW
{
  path: '/match/:id',
  name: 'MatchDetail',
  component: () => import('@/views/MatchDetail.vue'),
  meta: { requiresAuth: true }
}

// Also update redirects if any:
// ❌ OLD
router.push({ name: 'EventDetail', params: { id: eventId } });

// ✅ NEW
router.push({ name: 'MatchDetail', params: { id: matchId } });
```

---

### STEP 5: Update Comment Handling

#### Key Changes for Comments:

1. **Comment IDs are now strings** (MongoDB ObjectId format: 24-character hex string)
2. **User IDs are now strings** (MongoDB ObjectId)
3. **Comments are embedded in Match documents** (as `CommentRef` array)
4. **API parameter names stay the same** (`eventId` still used, but refers to `matchId`)

**Example Comment Creation:**

```javascript
// ✅ NEW comment structure
const newComment = {
  text: 'Great match!',
  userId: '507f1f77bcf86cd799439011', // MongoDB ObjectId as string
  eventId: 123456 // Match ID (still number from Football-Data.org)
};

// After creation, the comment will appear in:
// 1. The comments collection (separate document)
// 2. The match document's comments array (as CommentRef)

// When fetching a match, comments are included:
const match = await getMatchById(123456);
console.log(match.comments); // Array of CommentRef objects
// [
//   {
//     id: '507f191e810c19729de860ea', // MongoDB ObjectId
//     text: 'Great match!',
//     createdAt: '2025-12-22T10:30:00Z',
//     userId: '507f1f77bcf86cd799439011',
//     username: 'john_doe'
//   }
// ]
```

---

### STEP 6: Handle Missing Features

#### 6.1: Search Functionality

**Problem**: The new API doesn't have a general search endpoint (`/api/events/search`)

**Solutions**:

**Option A: Client-Side Search (Quick Fix)**
```javascript
async function searchMatches(query) {
  const matches = await getUpcomingMatches();
  return matches.filter(match =>
    match.homeTeam?.name.toLowerCase().includes(query.toLowerCase()) ||
    match.awayTeam?.name.toLowerCase().includes(query.toLowerCase()) ||
    match.competition?.name.toLowerCase().includes(query.toLowerCase())
  );
}
```

**Option B: Use Specific Endpoints**
```javascript
// Search by competition
const plMatches = await getMatchesByCompetitionCode('PL');

// Search by team (requires team ID)
const teamMatches = await getMatchesByTeamId(teamId);
```

**Option C: Add Search Endpoint to Backend** (Recommended)
- Add a search endpoint to `MatchController` that searches across team names, competition names, etc.

#### 6.2: Date-Based Queries

The new API has better date filtering:

```javascript
// Get today's matches
const todayMatches = await getTodayMatches();

// Get upcoming matches
const upcomingMatches = await getUpcomingMatches();

// Get finished matches
const finishedMatches = await getFinishedMatches();

// Get matches by date range
const matches = await getMatchesByDateRange('2025-12-01', '2025-12-31');
```

---

### STEP 7: Update TypeScript/JSDoc Types (if used)

If your project uses TypeScript or JSDoc comments:

```typescript
// ❌ OLD types
interface Event {
  id: number;
  eventType: string;
  match: {
    id: number;
    home: { id: number; name: string };
    away: { id: number; name: string };
  };
  date: Date;
  comments: Comment[];
  commentCount: number;
}

interface Comment {
  id: number; // Was number
  text: string;
  createdAt: Date;
  userId: number; // Was number
  username: string;
  userEmail: string;
  eventId: number;
}

// ✅ NEW types
interface Match {
  id: number; // Still number (from Football-Data.org)
  utcDate: Date;
  status: MatchStatus;
  matchday: number;
  stage: string;
  group: string;
  lastUpdated: Date;
  
  area: Area;
  competition: Competition;
  season: Season;
  homeTeam: TeamInfo;
  awayTeam: TeamInfo;
  score: Score;
  
  comments: CommentRef[]; // Embedded in match
}

interface CommentRef {
  id: string; // MongoDB ObjectId
  text: string;
  createdAt: Date;
  userId: string; // MongoDB ObjectId
  username: string;
}

interface Comment {
  id: string; // Changed to string (MongoDB ObjectId)
  text: string;
  createdAt: Date;
  userId: string; // Changed to string (MongoDB ObjectId)
  username: string;
  userEmail: string;
  eventId: number; // Still called eventId, refers to matchId
}

interface User {
  id: string; // Changed to string (MongoDB ObjectId)
  username: string;
  email: string;
  roles: string[];
  profilePicture: string | null;
  createdAt: Date | null;
}

// New nested types
interface Area {
  id: number;
  name: string;
  code: string;
  flag: string;
}

interface Competition {
  id: number;
  name: string;
  code: string;
  type: string;
  emblem: string;
}

interface Season {
  id: number;
  startDate: Date;
  endDate: Date;
  currentMatchday: number;
  winner: TeamInfo | null;
}

interface TeamInfo {
  id: number;
  name: string;
  shortName: string;
  tla: string;
  crest: string;
  address: string;
  website: string;
  founded: number;
  clubColors: string;
  venue: string;
  lastUpdated: Date;
}

interface Score {
  winner: 'HOME_TEAM' | 'AWAY_TEAM' | 'DRAW' | null;
  duration: 'REGULAR' | 'EXTRA_TIME' | 'PENALTY_SHOOTOUT';
  fullTime: TimeScore;
  halfTime: TimeScore;
}

interface TimeScore {
  home: number | null;
  away: number | null;
}

type MatchStatus = 
  | 'SCHEDULED' 
  | 'TIMED' 
  | 'IN_PLAY' 
  | 'PAUSED' 
  | 'FINISHED' 
  | 'SUSPENDED' 
  | 'POSTPONED' 
  | 'CANCELLED' 
  | 'AWARDED';
```

---

## Migration Checklist

### Phase 1: API Client Updates
- [ ] Rename `eventClient.js` to `matchClient.js`
- [ ] Update all API endpoint URLs from `/api/events` to `/api/matches`
- [ ] Rename all functions (getEvents → getMatches, etc.)
- [ ] Update endpoint paths (remove `/id/` prefix, change `daterange` to `date-range`)
- [ ] Add new Match API endpoints (getUpcomingMatches, getTodayMatches, etc.)
- [ ] Update Comment API for MongoDB ObjectId (string IDs)
- [ ] Remove or replace search functionality

### Phase 2: Data Models
- [ ] Create `Match.js` model with all nested classes
- [ ] Update `Comment.js` - change ID types to string
- [ ] Update `User.js` - change ID type to string
- [ ] Add helper methods to models (getMatchDescription, getScoreDisplay, etc.)

### Phase 3: Component Updates
- [ ] Rename `EventDetail.vue` to `MatchDetail.vue`
- [ ] Rename `EventCard.vue` to `MatchCard.vue`
- [ ] Update `Home.vue` - change from events to matches
- [ ] Update `SearchBar.vue` - implement new search logic
- [ ] Update all component props and data access patterns
- [ ] Update template bindings to use new nested structure

### Phase 4: Router Updates
- [ ] Change route from `/event/:id` to `/match/:id`
- [ ] Update all router.push() calls
- [ ] Update navigation guards if needed

### Phase 5: Testing
- [ ] Test user authentication (login/register)
- [ ] Test match listing (home page)
- [ ] Test match detail page
- [ ] Test comment creation
- [ ] Test comment display (embedded in match)
- [ ] Test search functionality
- [ ] Test date range filtering
- [ ] Test team filtering
- [ ] Verify ID types (string vs number)

### Phase 6: Edge Cases
- [ ] Handle missing nested data (use optional chaining: `match.homeTeam?.name`)
- [ ] Handle null scores for upcoming matches
- [ ] Handle matches without comments
- [ ] Handle different match statuses
- [ ] Handle timezone conversions for dates

---

## Common Issues and Solutions

### Issue 1: "Cannot read property 'name' of undefined"

**Cause**: Nested objects might be null

**Solution**: Use optional chaining
```javascript
// ❌ BAD
const teamName = match.homeTeam.name;

// ✅ GOOD
const teamName = match.homeTeam?.name || 'TBD';
```

### Issue 2: Comment IDs not working in API calls

**Cause**: Comment IDs changed from number to string

**Solution**: Ensure IDs are passed as strings
```javascript
// ❌ BAD
const commentId = parseInt(route.params.id);

// ✅ GOOD
const commentId = route.params.id; // Keep as string
```

### Issue 3: Search not working

**Cause**: `/api/events/search` endpoint no longer exists

**Solution**: Implement client-side search or use specific filters
```javascript
// Option 1: Client-side search
const results = allMatches.filter(m => 
  m.homeTeam?.name.includes(query) || 
  m.awayTeam?.name.includes(query)
);

// Option 2: Use competition filter
const results = await getMatchesByCompetitionCode('PL');
```

### Issue 4: Team search requires ID instead of name

**Cause**: API changed from team name to team ID

**Solution**: Create a team lookup system
```javascript
// Option 1: Build a team ID mapping
const teamNameToId = {
  'Manchester United': 66,
  'Liverpool FC': 64,
  // ... etc
};

// Option 2: Fetch matches and filter by name
const allMatches = await getUpcomingMatches();
const filtered = allMatches.filter(m =>
  m.homeTeam?.name === teamName ||
  m.awayTeam?.name === teamName
);
```

### Issue 5: Date format mismatches

**Cause**: Date format changed from `date` to `utcDate` with different format

**Solution**: Use proper date parsing
```javascript
// ❌ OLD
const date = new Date(event.date);

// ✅ NEW
const date = new Date(match.utcDate); // ISO 8601 format
```

---

## Performance Considerations

### 1. Embedded Comments
Comments are now embedded in Match documents, which means:
- **✅ Faster**: Single query gets match + comments
- **❌ Larger documents**: Match documents are bigger
- **Impact**: Good for matches with few comments, might need pagination for popular matches

### 2. Nested Objects
Match documents contain many nested objects:
- **✅ No joins**: All data in one document
- **❌ More bandwidth**: Larger payloads
- **Solution**: Consider creating a "light" endpoint for list views

### 3. Client-Side Search
If implementing client-side search:
- **❌ Fetch all matches**: Can be expensive
- **Solution**: Limit to upcoming matches, add backend search endpoint, or use competition filters

---

## API Endpoint Comparison Table

| Old Endpoint | New Endpoint | Notes |
|-------------|--------------|-------|
| `GET /api/events` | `GET /api/matches` | Same functionality |
| `GET /api/events/id/{id}` | `GET /api/matches/{id}` | Removed `/id/` prefix |
| `GET /api/events/date/{date}` | ❌ Removed | Use `/date-range` or `/today` instead |
| `GET /api/events/daterange?...` | `GET /api/matches/date-range?...` | Changed to hyphenated |
| `GET /api/events/team/{name}` | `GET /api/matches/team/{id}` | Changed from name to ID |
| `GET /api/events/search?...` | ❌ Removed | Implement client-side or add to backend |
| ❌ N/A | `GET /api/matches/competition/{id}` | ✅ New |
| ❌ N/A | `GET /api/matches/competition/code/{code}` | ✅ New |
| ❌ N/A | `GET /api/matches/status/{status}` | ✅ New |
| ❌ N/A | `GET /api/matches/today` | ✅ New |
| ❌ N/A | `GET /api/matches/upcoming` | ✅ New |
| ❌ N/A | `GET /api/matches/finished` | ✅ New |
| ❌ N/A | `GET /api/matches/competition/{id}/matchday/{matchday}` | ✅ New |
| ❌ N/A | `GET /api/matches/stats` | ✅ New |

---

## Testing Strategy

### 1. Unit Tests
Update unit tests for:
- Model classes (Match, Comment, User)
- API client functions
- Helper methods

### 2. Integration Tests
Test API integration:
- Fetch matches from backend
- Create comments
- Verify nested data structure
- Test ID type handling (string vs number)

### 3. E2E Tests
Test user flows:
- View match list
- Click match to see details
- Add comment
- Search for matches
- Filter by competition

---

## Rollback Plan

If issues arise during migration:

1. **Keep old code**: Don't delete `eventClient.js` immediately
2. **Feature flag**: Use environment variable to toggle between old/new API
3. **Gradual migration**: Migrate page by page, not all at once
4. **Backup**: Tag current version before starting migration

Example feature flag:
```javascript
const USE_NEW_API = import.meta.env.VITE_USE_NEW_API === 'true';

export async function getMatches() {
  if (USE_NEW_API) {
    return await fetch('/api/matches');
  } else {
    return await fetch('/api/events');
  }
}
```

---

## Timeline Estimate

- **Phase 1 (API Client)**: 2-4 hours
- **Phase 2 (Models)**: 2-3 hours
- **Phase 3 (Components)**: 4-6 hours
- **Phase 4 (Router)**: 1 hour
- **Phase 5 (Testing)**: 3-5 hours
- **Phase 6 (Edge Cases)**: 2-3 hours

**Total**: 14-22 hours

---

## Support and Resources

### Backend API Documentation
- Postman Collection: `MatchlogAPI.postman_collection.json`
- Model Documentation: `MODEL_DTO_DOCUMENTATION.md`

### Key Backend Changes
- Database: H2/JPA → MongoDB
- Architecture: Relational → Document-based (NoSQL)
- Data Strategy: Normalized → Denormalized with embedded documents

---

**Last Updated**: December 23, 2025
