<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useMatchClient } from '../clients/matchClient.js'
import { authStore } from '../store/authStore.js'
import { listStore } from '../store/listStore.js'
import ListSelector from '../components/ListSelector.vue'

const route = useRoute()
const router = useRouter()
const { loading, error, getMatchById, createComment } = useMatchClient()

const match = ref(null)
const newCommentText = ref('')
const isSubmitting = ref(false)
const commentError = ref(null)
const showListSelector = ref(false)

// Get current user ID from auth store
const currentUserId = computed(() => authStore.user?.id || null)
const currentUsername = computed(() => authStore.user?.username || 'User')

// Get lists containing this match
const listsContainingMatch = computed(() => {
  if (!match.value) return []
  return listStore.getListsContainingMatch(match.value.id)
})

const isInFavourites = computed(() => {
  if (!match.value) return false
  return listStore.isMatchInDefaultList(match.value.id, 'favourites')
})

// Fetch match details when component mounts
onMounted(async () => {
  const matchId = route.params.id
  if (matchId) {
    try {
      const matchData = await getMatchById(matchId)
      match.value = matchData
      console.log('Match details loaded:', matchData)
      
      // Load lists if authenticated
      if (authStore.isAuthenticated && listStore.myLists.length === 0) {
        await listStore.loadMyLists()
      }
    } catch (err) {
      console.error('Failed to fetch match details:', err)
    }
  }
})

const formatDate = (dateString) => {
  if (!dateString) return 'No date'
  const date = new Date(dateString)
  return date.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

const formatCommentDate = (dateString) => {
  if (!dateString) return ''
  const date = new Date(dateString)
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

const goBack = () => {
  router.push('/')
}

const handleSubmitComment = async () => {
  // Check if user is authenticated
  if (!currentUserId.value) {
    commentError.value = 'You must be logged in to comment'
    return
  }

  if (!newCommentText.value.trim()) {
    commentError.value = 'Comment text cannot be empty'
    return
  }

  isSubmitting.value = true
  commentError.value = null

  try {
    const commentData = {
      text: newCommentText.value.trim(),
      userId: currentUserId.value,
      eventId: match.value.id // Still called eventId for API compatibility
    }

    const newComment = await createComment(commentData)
    
    console.log('Comment created successfully:', newComment)
    
    // Refresh the entire match data from the backend to get the updated comments
    const refreshedMatch = await getMatchById(match.value.id)
    match.value = refreshedMatch
    
    // Clear the form
    newCommentText.value = ''
    
    console.log('Match refreshed with new comment:', refreshedMatch)
  } catch (err) {
    console.error('Failed to create comment:', err)
    commentError.value = err.message || 'Failed to create comment. Please try again.'
  } finally {
    isSubmitting.value = false
  }
}

const getScoreDisplay = () => {
  if (!match.value?.score || !match.value.score.fullTime) {
    return 'vs'
  }
  const home = match.value.score.fullTime.home
  const away = match.value.score.fullTime.away
  if (home === null || away === null) {
    return 'vs'
  }
  return `${home} - ${away}`
}

const getStatusClass = () => {
  const status = match.value?.status?.toUpperCase()
  if (['FINISHED'].includes(status)) return 'status-finished'
  if (['IN_PLAY', 'PAUSED'].includes(status)) return 'status-live'
  if (['SCHEDULED', 'TIMED'].includes(status)) return 'status-scheduled'
  return 'status-default'
}

const goToTeamDetail = (teamId) => {
  if (teamId) {
    router.push(`/team/${teamId}`)
  }
}

const handleListUpdated = () => {
  // List was updated, could show a toast notification
  console.log('Match added/removed from list')
}

// Tab management
const activeTab = ref('squads')

const setActiveTab = (tab) => {
  activeTab.value = tab
}
</script>

<template>
  <main class="match-detail-container">
    <!-- Loading State -->
    <div v-if="loading" class="loading-state">
      <div class="spinner"></div>
      <p>Loading match details...</p>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="error-state">
      <h2>Error Loading Match</h2>
      <p>{{ error }}</p>
      <button @click="goBack" class="back-button">Go Back Home</button>
    </div>

    <!-- Match Details -->
    <div v-else-if="match" class="match-detail">
      <!-- Hero Header -->
      <div class="match-hero">
        <div class="hero-back">
          <button @click="goBack" class="hero-back-button">
            <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
              <path d="M12 4L6 10l6 6" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
            Back to Matches
          </button>
        </div>
        
        <div class="hero-content">
          <!-- Competition Badge -->
          <div class="competition-badge">
            <img v-if="match.competition?.emblem" :src="match.competition.emblem" :alt="match.competition?.name" class="competition-emblem-small" />
            <div class="competition-text">
              <h2 class="competition-title">{{ match.competition?.name || 'Competition' }}</h2>
              <p class="competition-subtitle">{{ match.stage }} • Matchday {{ match.matchday }}</p>
            </div>
          </div>

          <!-- Match Status Badge -->
          <div class="status-badge" :class="getStatusClass()">
            {{ match.status }}
          </div>
        </div>
      </div>

      <!-- Score Hero Section -->
      <div class="score-hero">
        <div class="score-hero-content">
          <div class="team-column home-column clickable-team" @click="goToTeamDetail(match.homeTeam?.id)">
            <img v-if="match.homeTeam?.crest" :src="match.homeTeam.crest" :alt="match.homeTeam?.name" class="hero-team-crest" />
            <h1 class="hero-team-name">{{ match.homeTeam?.name || 'TBD' }}</h1>
            <span class="hero-team-label">Home</span>
          </div>
          
          <div class="score-column">
            <div class="hero-score">{{ getScoreDisplay() }}</div>
            <div v-if="match.score?.halfTime" class="hero-halftime">
              Half-Time: {{ match.score.halfTime.home ?? '-' }} — {{ match.score.halfTime.away ?? '-' }}
            </div>
            <div class="match-datetime">{{ formatDate(match.utcDate) }}</div>
          </div>
          
          <div class="team-column away-column clickable-team" @click="goToTeamDetail(match.awayTeam?.id)">
            <img v-if="match.awayTeam?.crest" :src="match.awayTeam.crest" :alt="match.awayTeam?.name" class="hero-team-crest" />
            <h1 class="hero-team-name">{{ match.awayTeam?.name || 'TBD' }}</h1>
            <span class="hero-team-label">Away</span>
          </div>
        </div>
        
        <!-- Add to List Section -->
        <div v-if="authStore.isAuthenticated" class="list-actions">
          <button 
            class="add-to-list-btn" 
            @click="showListSelector = true"
            :title="listsContainingMatch.length > 0 ? `In ${listsContainingMatch.length} list(s)` : 'Add to list'"
          >
            <span class="btn-icon">{{ isInFavourites ? '★' : '☰' }}</span>
            <span class="btn-text">Add to List</span>
            <span v-if="listsContainingMatch.length > 0" class="badge">{{ listsContainingMatch.length }}</span>
          </button>
          
          <div v-if="listsContainingMatch.length > 0" class="in-lists-indicator">
            <span class="indicator-text">In: </span>
            <span v-for="list in listsContainingMatch.slice(0, 3)" :key="list.id" class="list-tag">
              {{ list.getIcon() }} {{ list.name }}
            </span>
            <span v-if="listsContainingMatch.length > 3" class="more-lists">
              +{{ listsContainingMatch.length - 3 }} more
            </span>
          </div>
        </div>
      </div>

      <!-- Main Content Area -->
      <div class="content-wrapper">
        <!-- Main Column -->
        <div class="main-column">
          <!-- Tabbed Section -->
          <section class="content-section tabbed-section">
            <div class="tabs-navigation">
              <button 
                class="tab-button" 
                :class="{ active: activeTab === 'squads' }"
                @click="setActiveTab('squads')"
              >
                Squads
              </button>
              <button 
                class="tab-button" 
                :class="{ active: activeTab === 'details' }"
                @click="setActiveTab('details')"
              >
                Match Details
              </button>
              <button 
                class="tab-button" 
                :class="{ active: activeTab === 'statistics' }"
                @click="setActiveTab('statistics')"
              >
                Statistics
              </button>
            </div>

            <div class="tab-content">
              <!-- Squads Tab -->
              <div v-show="activeTab === 'squads'" class="tab-panel">
                <div class="squads-container">
                  <div class="squad-column">
                    <h3 class="squad-title">{{ match.homeTeam?.name }}</h3>
                    <p class="squad-placeholder">Squad information will be displayed here</p>
                  </div>
                  <div class="squad-column">
                    <h3 class="squad-title">{{ match.awayTeam?.name }}</h3>
                    <p class="squad-placeholder">Squad information will be displayed here</p>
                  </div>
                </div>
              </div>

              <!-- Match Details Tab -->
              <div v-show="activeTab === 'details'" class="tab-panel">
                <div class="details-list">
                  <div class="detail-row">
                    <span class="detail-label">Competition</span>
                    <span class="detail-value">{{ match.competition?.name }}</span>
                  </div>
                  <div class="detail-row">
                    <span class="detail-label">Stage</span>
                    <span class="detail-value">{{ match.stage }}</span>
                  </div>
                  <div class="detail-row">
                    <span class="detail-label">Matchday</span>
                    <span class="detail-value">{{ match.matchday }}</span>
                  </div>
                  <div v-if="match.area" class="detail-row">
                    <span class="detail-label">Area</span>
                    <span class="detail-value">{{ match.area.name }}</span>
                  </div>
                  <div class="detail-row">
                    <span class="detail-label">Status</span>
                    <span class="detail-value status-inline" :class="getStatusClass()">{{ match.status }}</span>
                  </div>
                  <div class="detail-row">
                    <span class="detail-label">Date & Time</span>
                    <span class="detail-value">{{ formatDate(match.utcDate) }}</span>
                  </div>
                  <div v-if="match.score?.duration" class="detail-row">
                    <span class="detail-label">Duration</span>
                    <span class="detail-value">{{ match.score.duration }}</span>
                  </div>
                </div>
              </div>

              <!-- Statistics Tab -->
              <div v-show="activeTab === 'statistics'" class="tab-panel">
                <div class="statistics-placeholder">
                  <p>Match statistics will be displayed here</p>
                </div>
              </div>
            </div>
          </section>

          <!-- Comments Section -->
          <section class="content-section comments-section">
            <div class="section-header">
              <h2>Discussion</h2>
              <span class="comment-count">{{ match.comments?.length || 0 }} {{ match.comments?.length === 1 ? 'comment' : 'comments' }}</span>
              <div class="section-divider"></div>
            </div>

            <!-- Add Comment Form -->
            <div class="add-comment-area">
              <h3 class="comment-form-title">Share Your Thoughts</h3>
              <textarea
                v-model="newCommentText"
                placeholder="What did you think of the match?"
                rows="4"
                class="comment-textarea"
                :disabled="isSubmitting"
              ></textarea>
              <div v-if="commentError" class="comment-error">
                {{ commentError }}
              </div>
              <button
                @click="handleSubmitComment"
                :disabled="isSubmitting || !newCommentText.trim()"
                class="submit-comment-button"
              >
                {{ isSubmitting ? 'Posting...' : 'Post Comment' }}
              </button>
            </div>

            <!-- Comments List -->
            <div v-if="match.comments && match.comments.length > 0" class="comments-list">
              <div v-for="comment in match.comments" :key="comment.id" class="comment-item">
                <div class="comment-avatar">{{ comment.username?.charAt(0).toUpperCase() || 'U' }}</div>
                <div class="comment-content">
                  <div class="comment-meta">
                    <span class="comment-author">{{ comment.username }}</span>
                    <span class="comment-timestamp">{{ formatCommentDate(comment.createdAt) }}</span>
                  </div>
                  <p class="comment-text">{{ comment.text }}</p>
                </div>
              </div>
            </div>
            <div v-else class="comments-empty">
              <p>No comments yet. Be the first to share your thoughts on this match!</p>
            </div>
          </section>
        </div>

        <!-- Sidebar Column -->
        <aside class="sidebar-column">
        </aside>
      </div>
    </div>

    <!-- No Match Found -->
    <div v-else class="no-match">
      <h2>Match Not Found</h2>
      <button @click="goBack" class="back-button">Go Back Home</button>
    </div>
    
    <!-- List Selector Modal -->
    <ListSelector
      v-if="showListSelector && match"
      :match-id="match.id"
      @close="showListSelector = false"
      @updated="handleListUpdated"
    />
  </main>
</template>

<style scoped>
.match-detail-container {
  min-height: 100vh;
  background: #f8f9fa;
}

.loading-state,
.error-state,
.no-match {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 60vh;
  padding: 2rem;
  background: white;
  margin: 2rem;
  border-radius: 8px;
}

.spinner {
  width: 50px;
  height: 50px;
  border: 4px solid #f3f4f6;
  border-top-color: #1e3a8a;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.loading-state p,
.error-state p {
  margin-top: 1rem;
  color: #6b7280;
  font-size: 1.125rem;
}

.error-state h2,
.no-match h2 {
  color: #991b1b;
  margin-bottom: 1rem;
}

.back-button {
  padding: 0.75rem 1.5rem;
  background: #1e3a8a;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 0.938rem;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.2s ease;
}

.back-button:hover {
  background: #1e40af;
}

/* Hero Header */
.match-hero {
  background: linear-gradient(135deg, #1e3a8a 0%, #2563eb 100%);
  color: white;
  padding: 1.5rem 2rem 1rem;
}

.hero-back {
  max-width: 1200px;
  margin: 0 auto 1rem;
}

.hero-back-button {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  background: rgba(255, 255, 255, 0.15);
  color: white;
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 50px;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  backdrop-filter: blur(10px);
}

.hero-back-button:hover {
  background: rgba(255, 255, 255, 0.25);
}

.hero-content {
  max-width: 1200px;
  margin: 0 auto;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 2rem;
}

.competition-badge {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.competition-emblem-small {
  width: 48px;
  height: 48px;
  object-fit: contain;
}

.competition-text {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.competition-title {
  font-size: 1.25rem;
  font-weight: 600;
  margin: 0;
  letter-spacing: 0.3px;
}

.competition-subtitle {
  font-size: 0.875rem;
  margin: 0;
  opacity: 0.9;
}

.status-badge {
  padding: 0.5rem 1rem;
  border-radius: 50px;
  font-size: 0.813rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.status-scheduled {
  background: rgba(219, 234, 254, 0.95);
  color: #1e40af;
}

.status-live {
  background: rgba(254, 226, 226, 0.95);
  color: #991b1b;
  animation: pulse 2s infinite;
}

.status-finished {
  background: rgba(209, 250, 229, 0.95);
  color: #065f46;
}

.status-default {
  background: rgba(243, 244, 246, 0.95);
  color: #6b7280;
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.7; }
}

/* Score Hero Section */
.score-hero {
  background: white;
  border-bottom: 1px solid #e5e7eb;
  padding: 3rem 2rem;
}

.score-hero-content {
  max-width: 1200px;
  margin: 0 auto;
  display: grid;
  grid-template-columns: 1fr auto 1fr;
  gap: 3rem;
  align-items: center;
}

.team-column {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.75rem;
}

.clickable-team {
  cursor: pointer;
  padding: 1rem;
  border-radius: 12px;
  transition: all 0.3s ease;
}

.clickable-team:hover {
  background: rgba(30, 58, 138, 0.05);
  transform: translateY(-4px);
}

.clickable-team:hover .hero-team-crest {
  transform: scale(1.1);
}

.clickable-team:hover .hero-team-name {
  color: #2563eb;
}

.hero-team-crest {
  transition: transform 0.3s ease;
  width: 90px;
  height: 90px;
  object-fit: contain;
}

.hero-team-name {
  font-size: 1.5rem;
  font-weight: 700;
  color: #1e3a8a;
  margin: 0;
  text-align: center;
  font-family: Georgia, 'Times New Roman', serif;
}

.hero-team-label {
  font-size: 0.75rem;
  color: #6b7280;
  text-transform: uppercase;
  letter-spacing: 1px;
  font-weight: 600;
}

.score-column {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
  min-width: 200px;
}

.hero-score {
  font-size: 3.5rem;
  font-weight: 700;
  color: #1e3a8a;
  line-height: 1;
  font-family: Georgia, 'Times New Roman', serif;
}

.hero-halftime {
  font-size: 0.875rem;
  color: #6b7280;
  font-weight: 500;
}

.match-datetime {
  font-size: 0.938rem;
  color: #4b5563;
  margin-top: 0.5rem;
  text-align: center;
  line-height: 1.5;
}

/* List Actions */
.list-actions {
  margin-top: 1.5rem;
  padding-top: 1.5rem;
  border-top: 1px solid rgba(255, 255, 255, 0.2);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
}

.add-to-list-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 24px;
  background: rgba(255, 255, 255, 0.95);
  color: #1e3a8a;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-radius: 8px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.add-to-list-btn:hover {
  background: white;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.add-to-list-btn .btn-icon {
  font-size: 20px;
}

.add-to-list-btn .badge {
  background: #42b983;
  color: white;
  font-size: 12px;
  font-weight: 700;
  padding: 2px 8px;
  border-radius: 12px;
  min-width: 20px;
  text-align: center;
}

.in-lists-indicator {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
  justify-content: center;
  font-size: 14px;
}

.indicator-text {
  color: rgba(255, 255, 255, 0.8);
  font-weight: 500;
}

.list-tag {
  background: rgba(255, 255, 255, 0.9);
  color: #1e3a8a;
  padding: 4px 10px;
  border-radius: 12px;
  font-size: 13px;
  font-weight: 500;
  white-space: nowrap;
}

.more-lists {
  color: rgba(255, 255, 255, 0.9);
  font-size: 12px;
  font-weight: 500;
}

/* Content Wrapper */
.content-wrapper {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
  display: grid;
  grid-template-columns: 1fr 300px;
  gap: 2rem;
  align-items: start;
}

.main-column {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.content-section {
  background: white;
  border-radius: 8px;
  padding: 2rem;
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

.comment-count {
  font-size: 0.875rem;
  color: #6b7280;
  font-weight: 500;
}

.section-divider {
  flex: 1;
  height: 2px;
  background: linear-gradient(to right, #1e3a8a, transparent);
}

/* Details List */
.details-list {
  display: flex;
  flex-direction: column;
}

.detail-row {
  display: flex;
  justify-content: space-between;
  padding: 0.75rem 0;
  border-bottom: 1px solid #f3f4f6;
}

.detail-row:last-child {
  border-bottom: none;
}

.detail-label {
  font-weight: 600;
  color: #4b5563;
  font-size: 0.938rem;
}

.detail-value {
  color: #1f2937;
  font-size: 0.938rem;
  text-align: right;
}

.status-inline {
  padding: 0.25rem 0.75rem;
  border-radius: 50px;
  font-size: 0.813rem;
  font-weight: 600;
}

/* Tabbed Section */
.tabbed-section {
  padding: 0;
  overflow: hidden;
}

.tabs-navigation {
  display: flex;
  border-bottom: 2px solid #e5e7eb;
  background: #f9fafb;
}

.tab-button {
  flex: 1;
  padding: 1rem 1.5rem;
  background: transparent;
  border: none;
  font-size: 1rem;
  font-weight: 600;
  color: #6b7280;
  cursor: pointer;
  transition: all 0.3s ease;
  position: relative;
}

.tab-button:hover {
  background: rgba(30, 58, 138, 0.05);
  color: #1e3a8a;
}

.tab-button.active {
  color: #1e3a8a;
  background: white;
}

.tab-button.active::after {
  content: '';
  position: absolute;
  bottom: -2px;
  left: 0;
  right: 0;
  height: 2px;
  background: #1e3a8a;
}

.tab-content {
  padding: 2rem;
  background: white;
  min-height: 300px;
}

.tab-panel {
  animation: fadeIn 0.3s ease-in;
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

/* Squads Tab */
.squads-container {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 2rem;
}

.squad-column {
  padding: 1.5rem;
  background: #f9fafb;
  border-radius: 8px;
  border: 1px solid #e5e7eb;
}

.squad-title {
  font-size: 1.25rem;
  font-weight: 700;
  color: #1e3a8a;
  margin: 0 0 1rem 0;
  text-align: center;
}

.squad-placeholder {
  text-align: center;
  color: #9ca3af;
  padding: 2rem;
  font-size: 0.938rem;
}

/* Statistics Tab */
.statistics-placeholder {
  text-align: center;
  color: #9ca3af;
  padding: 3rem;
  font-size: 0.938rem;
}

/* Comments Section */
.add-comment-area {
  margin-bottom: 2rem;
  padding: 1.5rem;
  background: #f9fafb;
  border-radius: 8px;
  border: 1px solid #e5e7eb;
}

.comment-form-title {
  font-size: 1.125rem;
  font-weight: 600;
  color: #1e3a8a;
  margin: 0 0 1rem 0;
}

.comment-textarea {
  width: 100%;
  padding: 0.875rem;
  border: 2px solid #e5e7eb;
  border-radius: 6px;
  font-family: inherit;
  font-size: 0.938rem;
  line-height: 1.6;
  resize: vertical;
  transition: border-color 0.2s ease;
  background: white;
}

.comment-textarea:focus {
  outline: none;
  border-color: #1e3a8a;
}

.comment-textarea:disabled {
  background: #f3f4f6;
  cursor: not-allowed;
}

.comment-error {
  margin-top: 0.75rem;
  padding: 0.75rem;
  background: #fee2e2;
  color: #991b1b;
  border-radius: 6px;
  font-size: 0.875rem;
  font-weight: 500;
}

.submit-comment-button {
  margin-top: 1rem;
  padding: 0.75rem 1.5rem;
  background: #1e3a8a;
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 0.938rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
}

.submit-comment-button:hover:not(:disabled) {
  background: #1e40af;
  transform: translateY(-1px);
}

.submit-comment-button:disabled {
  background: #9ca3af;
  cursor: not-allowed;
}

.comments-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.comment-item {
  display: flex;
  gap: 1rem;
  padding: 1rem 0;
  border-bottom: 1px solid #f3f4f6;
}

.comment-item:last-child {
  border-bottom: none;
}

.comment-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: #1e3a8a;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 1.125rem;
  flex-shrink: 0;
}

.comment-content {
  flex: 1;
  min-width: 0;
}

.comment-meta {
  display: flex;
  align-items: baseline;
  gap: 0.75rem;
  margin-bottom: 0.5rem;
}

.comment-author {
  font-weight: 600;
  color: #1f2937;
  font-size: 0.938rem;
}

.comment-timestamp {
  font-size: 0.813rem;
  color: #9ca3af;
}

.comment-text {
  margin: 0;
  color: #4b5563;
  line-height: 1.6;
  font-size: 0.938rem;
}

.comments-empty {
  padding: 3rem 2rem;
  text-align: center;
  color: #9ca3af;
  background: #f9fafb;
  border-radius: 6px;
  font-size: 0.938rem;
}

.comments-empty p {
  margin: 0;
}

/* Sidebar */
.sidebar-column {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  position: sticky;
  top: 2rem;
}

.sidebar-card {
  background: white;
  border-radius: 8px;
  padding: 1.5rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.sidebar-title {
  font-size: 0.875rem;
  font-weight: 700;
  color: #6b7280;
  text-transform: uppercase;
  letter-spacing: 1px;
  margin: 0 0 1rem 0;
}

.quick-info-list {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.quick-info-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  font-size: 0.875rem;
  color: #4b5563;
  line-height: 1.5;
}

.quick-info-item svg {
  flex-shrink: 0;
  color: #1e3a8a;
}

.competition-card {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem 1.5rem;
  background: linear-gradient(135deg, #f9fafb 0%, #ffffff 100%);
}

.sidebar-competition-emblem {
  width: 100%;
  max-width: 150px;
  height: auto;
  object-fit: contain;
}

/* Responsive Design */
@media (max-width: 1024px) {
  .content-wrapper {
    grid-template-columns: 1fr;
    padding: 1.5rem;
  }

  .sidebar-column {
    position: static;
    display: grid;
    grid-template-columns: repeat(2, 1fr);
  }

  .score-hero-content {
    gap: 2rem;
  }
}

@media (max-width: 768px) {
  .match-hero {
    padding: 1rem 1rem 0.75rem;
  }

  .hero-content {
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
  }

  .status-badge {
    align-self: flex-start;
  }

  .score-hero {
    padding: 2rem 1rem;
  }

  .score-hero-content {
    grid-template-columns: 1fr;
    gap: 2rem;
  }

  .team-column {
    flex-direction: row;
    justify-content: center;
  }

  .hero-team-crest {
    width: 60px;
    height: 60px;
  }

  .hero-team-name {
    font-size: 1.25rem;
    text-align: left;
  }

  .score-column {
    order: -1;
  }

  .hero-score {
    font-size: 2.5rem;
  }

  .content-wrapper {
    padding: 1rem;
    gap: 1rem;
  }

  .content-section {
    padding: 1.5rem;
  }

  .section-header h2 {
    font-size: 1.25rem;
  }

  .sidebar-column {
    grid-template-columns: 1fr;
  }

  .detail-row {
    flex-direction: column;
    gap: 0.25rem;
  }

  .detail-value {
    text-align: left;
  }

  .squads-container {
    grid-template-columns: 1fr;
    gap: 1rem;
  }

  .tab-button {
    padding: 0.875rem 1rem;
    font-size: 0.875rem;
  }

  .tab-content {
    padding: 1.5rem;
  }
}

@media (max-width: 480px) {
  .competition-badge {
    flex-direction: column;
    align-items: flex-start;
  }

  .hero-team-name {
    font-size: 1.125rem;
  }

  .hero-score {
    font-size: 2rem;
  }

  .team-column {
    flex-direction: column;
  }

  .tab-button {
    padding: 0.75rem 0.5rem;
    font-size: 0.813rem;
  }

  .tab-content {
    padding: 1rem;
  }
}
</style>
