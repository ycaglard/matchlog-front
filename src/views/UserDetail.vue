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
        <div class="hero-content">
          <div class="user-avatar">
            <svg width="80" height="80" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z"/>
            </svg>
          </div>
          <h1 class="user-name">{{ user.username }}</h1>
          <p class="user-email">{{ user.email }}</p>
          <div class="hero-stats" v-if="uniqueMatches > 0">
            <div class="hero-stat-item">
              <div class="hero-stat-value">{{ uniqueMatches }}</div>
              <div class="hero-stat-label">Matches</div>
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
</script>

<style scoped>
.user-detail {
  max-width: 1400px;
  margin: 0 auto;
  padding: 0;
  background: #f8f9fa;
  min-height: 100vh;
}

.loading-container,
.error-container {
  text-align: center;
  padding: 4rem 2rem;
  background: white;
  margin: 2rem;
  border-radius: 8px;
}

.loading-spinner {
  width: 50px;
  height: 50px;
  border: 4px solid #f3f4f6;
  border-top: 4px solid #1e3a8a;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto 1rem;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.error-container h2 {
  color: #ef4444;
  margin-bottom: 1rem;
}

.back-button {
  margin-top: 1rem;
  padding: 0.75rem 1.5rem;
  background: #1e3a8a;
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 600;
  font-size: 0.938rem;
}

.back-button:hover {
  background: #1e40af;
}

/* Hero Header */
.user-hero {
  position: relative;
  background: linear-gradient(135deg, #1e3a8a 0%, #2563eb 100%);
  color: white;
  padding: 3rem 2rem;
  text-align: center;
}

.hero-content {
  position: relative;
  z-index: 1;
  margin: 0 auto;
}

.user-avatar {
  width: 120px;
  height: 120px;
  margin: 0 auto 1.5rem;
  background: rgba(255, 255, 255, 0.15);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 3px solid rgba(255, 255, 255, 0.3);
  backdrop-filter: blur(10px);
}

.user-avatar svg {
  width: 80px;
  height: 80px;
  opacity: 0.9;
}

.user-name {
  font-size: 2.5rem;
  font-weight: 700;
  margin: 0 0 0.5rem 0;
  letter-spacing: -0.5px;
  line-height: 1.1;
}

.user-email {
  font-size: 1.125rem;
  margin: 0 0 1.5rem 0;
  opacity: 0.85;
  font-weight: 300;
}

.hero-stats {
  display: flex;
  gap: 3rem;
  justify-content: center;
  align-items: center;
  margin-top: 2rem;
}

.hero-stat-item {
  text-align: center;
}

.hero-stat-value {
  font-size: 2.5rem;
  font-weight: 700;
  line-height: 1;
  margin-bottom: 0.5rem;
}

.hero-stat-label {
  font-size: 0.875rem;
  text-transform: uppercase;
  letter-spacing: 1px;
  opacity: 0.85;
}

.hero-stat-divider {
  width: 1px;
  height: 3rem;
  background: rgba(255, 255, 255, 0.3);
}

.hero-stats {
  display: flex;
  gap: 3rem;
  justify-content: center;
  align-items: center;
  margin-top: 2rem;
}

.hero-stat-item {
  text-align: center;
}

.hero-stat-value {
  font-size: 2.5rem;
  font-weight: 700;
  line-height: 1;
  margin-bottom: 0.5rem;
}

.hero-stat-label {
  font-size: 0.875rem;
  text-transform: uppercase;
  letter-spacing: 1px;
  opacity: 0.85;
}

.hero-stat-divider {
  width: 1px;
  height: 3rem;
  background: rgba(255, 255, 255, 0.3);
}

.hero-stats {
  display: flex;
  gap: 3rem;
  justify-content: center;
  align-items: center;
  margin-top: 2rem;
}

.hero-stat-item {
  text-align: center;
}

.hero-stat-value {
  font-size: 2.5rem;
  font-weight: 700;
  line-height: 1;
  margin-bottom: 0.5rem;
}

.hero-stat-label {
  font-size: 0.875rem;
  text-transform: uppercase;
  letter-spacing: 1px;
  opacity: 0.85;
}

.hero-stat-divider {
  width: 1px;
  height: 3rem;
  background: rgba(255, 255, 255, 0.3);
}

/* Content Wrapper */
.content-wrapper {
  padding: 3rem 2rem;
}

.content-section {
  background: white;
  border-radius: 8px;
  padding: 3rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
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
  color: #1e3a8a;
  margin: 0;
  text-transform: uppercase;
  letter-spacing: 1px;
  font-family: Georgia, 'Times New Roman', serif;
}

.section-divider {
  flex: 1;
  height: 2px;
  background: linear-gradient(to right, #1e3a8a, transparent);
}

/* Tab Navigation */
.tabs-container {
  display: flex;
  gap: 0.5rem;
  border-bottom: 2px solid #e5e7eb;
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
  color: #6b7280;
  cursor: pointer;
  transition: all 0.2s ease;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  font-family: Georgia, 'Times New Roman', serif;
  position: relative;
  bottom: -2px;
}

.tab-button:hover {
  color: #1e3a8a;
  background: #f9fafb;
}

.tab-button.active {
  color: #1e3a8a;
  border-bottom-color: #1e3a8a;
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
  color: #9ca3af;
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
  background: #fafafa;
  border-radius: 8px;
  border: 1px solid #e5e7eb;
  transition: all 0.2s ease;
  align-items: start;
}

.activity-item:hover {
  border-color: #1e3a8a;
  box-shadow: 0 2px 8px rgba(30, 58, 138, 0.08);
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
  background: #f9fafb;
  border-radius: 6px;
  padding: 1rem 1.5rem;
  border: 1px solid #e5e7eb;
  box-shadow: none;
  position: relative;
  transition: all 0.2s ease;
}

.comment-bubble:hover {
  background: white;
  border-color: #1e3a8a;
  box-shadow: 0 1px 3px rgba(30, 58, 138, 0.1);
}

.comment-bubble::before {
  content: '"';
  font-size: 2rem;
  color: #d1d5db;
  position: absolute;
  top: 0.5rem;
  left: 0.5rem;
  font-family: Georgia, 'Times New Roman', serif;
  line-height: 1;
}

.comment-bubble::after {
  content: '"';
  font-size: 2rem;
  color: #d1d5db;
  position: absolute;
  bottom: 0.5rem;
  right: 0.5rem;
  font-family: Georgia, 'Times New Roman', serif;
  line-height: 1;
}

.comment-header {
  margin-bottom: 0.75rem;
}

.comment-date {
  font-size: 0.813rem;
  color: #6b7280;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.comment-text {
  font-size: 0.938rem;
  line-height: 1.6;
  color: #1f2937;
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
    padding: 2rem 1rem;
  }

  .user-name {
    font-size: 2rem;
  }

  .user-avatar {
    width: 100px;
    height: 100px;
  }

  .user-avatar svg {
    width: 64px;
    height: 64px;
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
  .user-name {
    font-size: 1.75rem;
  }

  .hero-stats {
    flex-direction: column;
    gap: 1.5rem;
  }
  
  .hero-stat-divider {
    display: none;
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
