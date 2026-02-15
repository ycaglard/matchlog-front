<template>
  <div class="user-detail">
    <div v-if="loading" class="loading-container">
      <div class="loading-spinner"></div>
      <p>Loading user details...</p>
    </div>

    <div v-else-if="error" class="error-container">
      <h2>Error Loading User</h2>
      <p>{{ error }}</p>
      <button @click="$router.push('/')" class="back-button">Back to Home</button>
    </div>

    <div v-else-if="user" class="user-content">
      <!-- Hero Header -->
      <div class="user-hero">
        <div class="hero-container">
          <!-- Left Side: Profile Info -->
          <div class="profile-section">
            <div class="profile-picture">
              <svg width="80" height="80" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z"/>
              </svg>
            </div>
            <div class="profile-info">
              <div class="username-row">
                <h1 class="username">{{ user.username }}</h1>
                <button class="edit-profile-btn" @click="editProfile">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/>
                  </svg>
                  Edit Profile
                </button>
              </div>
              <p class="user-bio">{{ user.bio || 'No bio yet. Share something about yourself!' }}</p>
            </div>
          </div>
          
          <!-- Right Side: Statistics -->
          <div class="stats-section">
            <div class="stat-item">
              <div class="stat-value">{{ user.followersCount || 0 }}</div>
              <div class="stat-label">Followers</div>
            </div>
            <div class="stat-item">
              <div class="stat-value">{{ user.followingCount || 0 }}</div>
              <div class="stat-label">Following</div>
            </div>
            <div class="stat-item">
              <div class="stat-value">{{ user.listsCount || 0 }}</div>
              <div class="stat-label">Lists</div>
            </div>
            <div class="stat-item">
              <div class="stat-value">{{ uniqueMatches }}</div>
              <div class="stat-label">Commented</div>
            </div>
          </div>
        </div>
      </div>

      <!-- Main Content Area -->
      <div class="content-wrapper">
        <!-- Comments Section -->
        <section class="content-section comments-section">
            <!-- Tab Navigation -->
            <div class="tabs-container">
              <button 
                @click="activeTab = 'comments'" 
                :class="['tab-button', { active: activeTab === 'comments' }]"
              >
                Comments
              </button>
              <button 
                @click="activeTab = 'watched'" 
                :class="['tab-button', { active: activeTab === 'watched' }]"
              >
                Watched Games
              </button>
              <button 
                @click="activeTab = 'favourites'" 
                :class="['tab-button', { active: activeTab === 'favourites' }]"
              >
                Favourite Games
              </button>
              <button 
                @click="activeTab = 'watchlists'" 
                :class="['tab-button', { active: activeTab === 'watchlists' }]"
              >
                Watchlists
              </button>
              <button 
                @click="activeTab = 'lists'" 
                :class="['tab-button', { active: activeTab === 'lists' }]"
              >
                Lists
              </button>
            </div>

            <!-- Comments Tab Content -->
            <div v-if="activeTab === 'comments'" class="tab-content">
              <div v-if="matchesWithComments.length === 0" class="no-content">
                <svg width="64" height="64" viewBox="0 0 24 24" fill="currentColor" opacity="0.2">
                  <path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm0 14H6l-2 2V4h16v12z"/>
                </svg>
                <p>No comments yet</p>
              </div>

              <div v-else class="activity-list">
              <div v-for="item in matchesWithComments" :key="item.match.id" class="activity-item">
                <div class="activity-match-card">
                  <MatchCard 
                    :match="item.match" 
                    @viewDetails="() => router.push(`/match/${item.match.id}`)"
                  />
                </div>
                <div class="activity-comments">
                  <div v-for="comment in item.comments" :key="comment.id" class="activity-comment">
                    <div class="comment-bubble">
                      <div class="comment-header">
                        <span class="comment-date">{{ formatCommentDate(comment.createdAt) }}</span>
                      </div>
                      <div class="comment-text">{{ comment.text }}</div>
                    </div>
                  </div>
                </div>
              </div>
              </div>
            </div>

            <!-- Watched Games Tab Content -->
            <div v-if="activeTab === 'watched'" class="tab-content">
              <div class="no-content">
                <svg width="64" height="64" viewBox="0 0 24 24" fill="currentColor" opacity="0.2">
                  <path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z"/>
                </svg>
                <p>No watched games yet</p>
              </div>
            </div>

            <!-- Favourite Games Tab Content -->
            <div v-if="activeTab === 'favourites'" class="tab-content">
              <div class="no-content">
                <svg width="64" height="64" viewBox="0 0 24 24" fill="currentColor" opacity="0.2">
                  <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
                </svg>
                <p>No favourite games yet</p>
              </div>
            </div>

            <!-- Watchlists Tab Content -->
            <div v-if="activeTab === 'watchlists'" class="tab-content">
              <div class="no-content">
                <svg width="64" height="64" viewBox="0 0 24 24" fill="currentColor" opacity="0.2">
                  <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zM9 17H7v-7h2v7zm4 0h-2V7h2v10zm4 0h-2v-4h2v4z"/>
                </svg>
                <p>No watchlists yet</p>
              </div>
            </div>

            <!-- Lists Tab Content -->
            <div v-if="activeTab === 'lists'" class="tab-content">
              <div class="no-content">
                <svg width="64" height="64" viewBox="0 0 24 24" fill="currentColor" opacity="0.2">
                  <path d="M3 13h2v-2H3v2zm0 4h2v-2H3v2zm0-8h2V7H3v2zm4 4h14v-2H7v2zm0 4h14v-2H7v2zM7 7v2h14V7H7z"/>
                </svg>
                <p>No lists yet</p>
              </div>
            </div>
          </section>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useUserClient } from '../clients/userClient.js'
import { useMatchClient } from '../clients/matchClient.js'
import MatchCard from '../components/MatchCard.vue'

const route = useRoute()
const router = useRouter()
const { loading, error, getUserByUsername, getCommentsByUserId } = useUserClient()
const { getMatchById } = useMatchClient()

const user = ref(null)
const comments = ref([])
const matchesWithComments = ref([])
const activeTab = ref('comments')

const loadUserData = async (username) => {
  if (username) {
    user.value = null
    comments.value = []
    matchesWithComments.value = []
    error.value = null
    
    try {
      console.log('Loading user by username:', username)
      
      // Load user by username
      const userData = await getUserByUsername(username)
      user.value = userData
      
      // Load comments using the user ID from the response
      if (userData && userData.id) {
        const commentsData = await getCommentsByUserId(userData.id)
        comments.value = commentsData
        
        // Fetch match data for each comment
        await loadMatchesForComments(commentsData)
      }
      
      if (!user.value) {
        error.value = 'User not found'
      }
    } catch (err) {
      console.error('Failed to load user data:', err)
    }
  }
}

const loadMatchesForComments = async (commentsData) => {
  if (!commentsData || commentsData.length === 0) return
  
  try {
    // Get unique match IDs
    const uniqueMatchIds = [...new Set(commentsData.map(c => c.eventId))]
    
    // Fetch all matches
    const matchPromises = uniqueMatchIds.map(matchId => 
      getMatchById(matchId).catch(err => {
        console.error(`Failed to fetch match ${matchId}:`, err)
        return null
      })
    )
    
    const matches = await Promise.all(matchPromises)
    
    // Combine matches with their comments
    matchesWithComments.value = matches
      .filter(match => match !== null)
      .map(match => {
        // Find all comments for this match
        const matchComments = commentsData.filter(c => c.eventId === match.id)
        return {
          match,
          comments: matchComments
        }
      })
      .sort((a, b) => {
        // Sort by most recent comment
        const aLatest = Math.max(...a.comments.map(c => new Date(c.createdAt).getTime()))
        const bLatest = Math.max(...b.comments.map(c => new Date(c.createdAt).getTime()))
        return bLatest - aLatest
      })
  } catch (err) {
    console.error('Error loading matches for comments:', err)
  }
}

onMounted(async () => {
  await loadUserData(route.params.username)
})

// Computed properties
const sortedComments = computed(() => {
  if (!comments.value) return []
  return [...comments.value].sort((a, b) => {
    return new Date(b.createdAt) - new Date(a.createdAt)
  })
})

const uniqueMatches = computed(() => {
  if (!comments.value) return 0
  const eventIds = new Set(comments.value.map(c => c.eventId))
  return eventIds.size
})

const oldestComment = computed(() => {
  if (!comments.value || comments.value.length === 0) return null
  return [...comments.value].sort((a, b) => {
    return new Date(a.createdAt) - new Date(b.createdAt)
  })[0]
})

const newestComment = computed(() => {
  if (!comments.value || comments.value.length === 0) return null
  return [...comments.value].sort((a, b) => {
    return new Date(b.createdAt) - new Date(a.createdAt)
  })[0]
})

// Helper functions
const formatDate = (date) => {
  if (!date) return ''
  const d = new Date(date)
  return d.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
}

const formatCommentDate = (date) => {
  if (!date) return ''
  const d = new Date(date)
  return d.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

const editProfile = () => {
  // TODO: Implement edit profile functionality
  console.log('Edit profile clicked')
}
</script>

<style scoped>
.user-detail {
  max-width: 1400px;
  margin: 0 auto;
  padding: 0;
  background: #14181c;
  min-height: 100vh;
}

.loading-container,
.error-container {
  text-align: center;
  padding: 4rem 2rem;
  background: #2c3440;
  margin: 2rem;
  border-radius: 8px;
  color: #9ab;
}

.loading-spinner {
  width: 50px;
  height: 50px;
  border: 4px solid #445566;
  border-top: 4px solid #ff8000;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto 1rem;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.error-container h2 {
  color: #ff8000;
  margin-bottom: 1rem;
}

.back-button {
  margin-top: 1rem;
  padding: 0.75rem 1.5rem;
  background: #ff8000;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-weight: 600;
  font-size: 0.938rem;
  transition: all 0.2s ease;
}

.back-button:hover {
  background: #e67700;
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(255, 128, 0, 0.3);
}

/* Hero Header */
.user-hero {
  background: #1a1f29;
  padding: 2rem;
  border-bottom: 1px solid #2c3440;
  margin-bottom: 2rem;
}

.hero-container {
  max-width: 1200px;
  margin: 0 auto;
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 3rem;
}

/* Profile Section (Left) */
.profile-section {
  display: flex;
  gap: 1.5rem;
  flex: 1;
  align-items: flex-start;
}

.profile-picture {
  width: 120px;
  height: 120px;
  flex-shrink: 0;
  background: linear-gradient(135deg, #ff8000 0%, #ffb347 100%);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 4px solid #2c3440;
  box-shadow: 0 8px 16px rgba(255, 128, 0, 0.2);
}

.profile-picture svg {
  width: 70px;
  height: 70px;
  color: white;
}

.profile-info {
  flex: 1;
  padding-top: 0.5rem;
}

.username-row {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 0.75rem;
}

.username {
  font-size: 2rem;
  font-weight: 700;
  margin: 0;
  color: #ffffff;
  letter-spacing: -0.5px;
}

.edit-profile-btn {
  display: flex;
  align-items: center;
  gap: 0.375rem;
  padding: 0.5rem 1rem;
  background: transparent;
  border: 1.5px solid #445566;
  border-radius: 4px;
  font-size: 0.875rem;
  font-weight: 600;
  color: #9ab;
  cursor: pointer;
  transition: all 0.2s ease;
  white-space: nowrap;
}

.edit-profile-btn:hover {
  background: rgba(255, 128, 0, 0.1);
  border-color: #ff8000;
  color: #ff8000;
  transform: translateY(-1px);
}

.edit-profile-btn svg {
  width: 14px;
  height: 14px;
}

.user-bio {
  font-size: 1rem;
  line-height: 1.6;
  color: #9ab;
  margin: 0;
  max-width: 600px;
}

/* Statistics Section (Right) */
.stats-section {
  display: flex;
  gap: 2.5rem;
  padding: 1rem 0;
}

.stat-item {
  text-align: center;
}

.stat-value {
  font-size: 2rem;
  font-weight: 700;
  color: #ff8000;
  line-height: 1;
  margin-bottom: 0.375rem;
}

.stat-label {
  font-size: 0.875rem;
  font-weight: 500;
  color: #9ab;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

/* Content Wrapper */
.content-wrapper {
  padding: 3rem 2rem;
}

.content-section {
  background: #1a1f29;
  border-radius: 8px;
  padding: 3rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.3);
  border: 1px solid #2c3440;
}

/* Section Headers */
.section-header {
  position: relative;
  margin-bottom: 1.5rem;
  display: flex;
  align-items: center;
  gap: 1rem;
}

.section-header h2 {
  font-size: 1.5rem;
  font-weight: 700;
  color: #ff8000;
  margin: 0;
  text-transform: uppercase;
  letter-spacing: 1px;
}

.section-divider {
  flex: 1;
  height: 2px;
  background: linear-gradient(to right, #ff8000, transparent);
}

/* Tab Navigation */
.tabs-container {
  display: flex;
  gap: 0.5rem;
  border-bottom: 2px solid #2c3440;
  margin-bottom: 2rem;
  flex-wrap: wrap;
}

.tab-button {
  padding: 0.75rem 1.5rem;
  background: transparent;
  border: none;
  border-bottom: 3px solid transparent;
  font-size: 0.938rem;
  font-weight: 600;
  color: #678;
  cursor: pointer;
  transition: all 0.2s ease;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  position: relative;
  bottom: -2px;
}

.tab-button:hover {
  color: #ff8000;
  background: rgba(255, 128, 0, 0.05);
}

.tab-button.active {
  color: #ff8000;
  border-bottom-color: #ff8000;
  background: transparent;
}

.tab-content {
  animation: fadeIn 0.3s ease;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* No Comments State */
.no-content {
  text-align: center;
  padding: 3rem 2rem;
  color: #678;
}

.no-content svg {
  margin-bottom: 1rem;
}

.no-content p {
  font-size: 1.125rem;
  margin: 0;
}

/* Activity List */
.activity-list {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.activity-item {
  display: grid;
  grid-template-columns: 300px 1fr;
  gap: 2rem;
  padding: 1.5rem;
  background: #14181c;
  border-radius: 8px;
  border: 1px solid #2c3440;
  transition: all 0.2s ease;
  align-items: start;
}

.activity-item:hover {
  border-color: #ff8000;
  background: #1a1f29;
  box-shadow: 0 4px 12px rgba(255, 128, 0, 0.15);
  transform: translateY(-2px);
}

.activity-match-card {
  flex-shrink: 0;
}

.activity-comments {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  min-width: 0;
}

.activity-comment {
  display: flex;
  flex-direction: column;
}

.comment-bubble {
  background: #2c3440;
  border-radius: 6px;
  padding: 1rem 1.5rem;
  border: 1px solid #445566;
  box-shadow: none;
  position: relative;
  transition: all 0.2s ease;
}

.comment-bubble:hover {
  background: #1a1f29;
  border-color: #ff8000;
  box-shadow: 0 2px 8px rgba(255, 128, 0, 0.2);
}

.comment-bubble::before {
  content: '"';
  font-size: 2rem;
  color: #445566;
  position: absolute;
  top: 0.5rem;
  left: 0.5rem;
  line-height: 1;
}

.comment-bubble::after {
  content: '"';
  font-size: 2rem;
  color: #445566;
  position: absolute;
  bottom: 0.5rem;
  right: 0.5rem;
  line-height: 1;
}

.comment-header {
  margin-bottom: 0.75rem;
}

.comment-date {
  font-size: 0.813rem;
  color: #9ab;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.comment-text {
  font-size: 0.938rem;
  line-height: 1.6;
  color: #cdd;
  font-style: italic;
  padding-left: 1.5rem;
}



/* Responsive Design */
@media (max-width: 1024px) {
  .content-wrapper {
    padding: 2rem;
  }
  
  .activity-item {
    grid-template-columns: 1fr;
    gap: 2rem;
    padding: 2rem;
  }
  
  .activity-match-card {
    justify-self: center;
  }
}

@media (max-width: 768px) {
  .user-hero {
    padding: 1.5rem;
  }

  .hero-container {
    flex-direction: column;
    gap: 2rem;
  }

  .profile-section {
    flex-direction: column;
    align-items: center;
    text-align: center;
  }

  .profile-info {
    width: 100%;
  }

  .username-row {
    flex-direction: column;
    gap: 0.75rem;
  }

  .username {
    font-size: 1.75rem;
  }

  .stats-section {
    justify-content: center;
    gap: 2rem;
    width: 100%;
  }

  .profile-picture {
    width: 100px;
    height: 100px;
  }

  .profile-picture svg {
    width: 60px;
    height: 60px;
  }

  .content-wrapper {
    padding: 1.5rem;
  }

  .content-section {
    padding: 1.5rem;
  }

  .activity-item {
    grid-template-columns: 1fr;
    gap: 1.5rem;
    padding: 1.5rem;
  }

  .activity-match-card {
    justify-self: center;
  }
  
  .hero-stats {
    gap: 2rem;
  }
  
  .hero-stat-value {
    font-size: 2rem;
  }
}

@media (max-width: 480px) {
  .username {
    font-size: 1.5rem;
  }

  .stats-section {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 1.5rem;
  }
  
  .stat-value {
    font-size: 1.5rem;
  }
  
  .profile-picture {
    width: 80px;
    height: 80px;
  }
  
  .profile-picture svg {
    width: 50px;
    height: 50px;
  }

  .activity-item {
    padding: 1.5rem;
    gap: 1rem;
  }

  .comment-bubble::before {
    font-size: 2rem;
  }

  .comment-bubble {
    padding: 1rem 1.5rem;
  }

  .comment-text {
    padding-left: 1rem;
  }
}
</style>
