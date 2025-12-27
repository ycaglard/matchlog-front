<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useMatchClient } from '../clients/matchClient.js'
import { authStore } from '../store/authStore.js'

const route = useRoute()
const router = useRouter()
const { loading, error, getMatchById, createComment } = useMatchClient()

const match = ref(null)
const newCommentText = ref('')
const isSubmitting = ref(false)
const commentError = ref(null)

// Get current user ID from auth store
const currentUserId = computed(() => authStore.user?.id || null)
const currentUsername = computed(() => authStore.user?.username || 'User')

// Fetch match details when component mounts
onMounted(async () => {
  const matchId = route.params.id
  if (matchId) {
    try {
      const matchData = await getMatchById(matchId)
      match.value = matchData
      console.log('Match details loaded:', matchData)
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
      <!-- Header with Back Button -->
      <div class="header">
        <button @click="goBack" class="back-button">
          ← Back to Matches
        </button>
      </div>

      <!-- Competition Banner -->
      <div class="competition-banner">
        <div class="competition-emblem-container">
          <img v-if="match.competition?.emblem" :src="match.competition.emblem" :alt="match.competition?.name" class="competition-emblem" />
        </div>
        <div class="competition-info">
          <h1>{{ match.competition?.name || 'Competition' }}</h1>
          <p>{{ match.stage }} - Matchday {{ match.matchday }}</p>
        </div>
        <div class="match-status-overlay" :class="getStatusClass()">
          {{ match.status }}
        </div>
      </div>

      <!-- Main Content -->
      <div class="content">
        <!-- Teams Section -->
        <div class="teams-section">
          <div class="team home-team">
            <img v-if="match.homeTeam?.crest" :src="match.homeTeam.crest" :alt="match.homeTeam?.name" class="team-crest" />
            <div class="team-name">{{ match.homeTeam?.name || 'TBD' }}</div>
            <div class="team-label">Home</div>
          </div>
          <div class="score-section">
            <div class="score-display">{{ getScoreDisplay() }}</div>
            <div v-if="match.score?.halfTime" class="halftime-score">
              HT: {{ match.score.halfTime.home ?? '-' }} - {{ match.score.halfTime.away ?? '-' }}
            </div>
          </div>
          <div class="team away-team">
            <img v-if="match.awayTeam?.crest" :src="match.awayTeam.crest" :alt="match.awayTeam?.name" class="team-crest" />
            <div class="team-name">{{ match.awayTeam?.name || 'TBD' }}</div>
            <div class="team-label">Away</div>
          </div>
        </div>

        <!-- Match Information -->
        <div class="info-section">
          <h2>Match Information</h2>
          <div class="info-grid">
            <div class="info-item">
              <span class="info-label">Competition:</span>
              <span class="info-value">{{ match.competition?.name }}</span>
            </div>
            <div class="info-item">
              <span class="info-label">Date & Time:</span>
              <span class="info-value">{{ formatDate(match.utcDate) }}</span>
            </div>
            <div class="info-item">
              <span class="info-label">Status:</span>
              <span class="info-value" :class="getStatusClass()">{{ match.status }}</span>
            </div>
            <div class="info-item">
              <span class="info-label">Matchday:</span>
              <span class="info-value">{{ match.matchday }}</span>
            </div>
            <div v-if="match.area" class="info-item">
              <span class="info-label">Area:</span>
              <span class="info-value">{{ match.area.name }}</span>
            </div>
            <div class="info-item">
              <span class="info-label">Comments:</span>
              <span class="info-value">{{ match.comments?.length || 0 }} {{ match.comments?.length === 1 ? 'comment' : 'comments' }}</span>
            </div>
          </div>
        </div>

        <!-- Comments Section -->
        <div class="comments-section">
          <h2>Comments ({{ match.comments?.length || 0 }})</h2>
          
          <!-- Add Comment Form -->
          <div class="add-comment-form">
            <h3>Add a Comment</h3>
            <textarea
              v-model="newCommentText"
              placeholder="Write your comment here..."
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
            <div v-for="comment in match.comments" :key="comment.id" class="comment-card">
              <div class="comment-header">
                <div class="comment-user">
                  <div class="user-avatar">{{ comment.username?.charAt(0).toUpperCase() || 'U' }}</div>
                  <div class="user-info">
                    <div class="username">{{ comment.username }}</div>
                    <div class="comment-date">{{ formatCommentDate(comment.createdAt) }}</div>
                  </div>
                </div>
              </div>
              <div class="comment-body">
                <p>{{ comment.text }}</p>
              </div>
            </div>
          </div>
          <div v-else class="comments-placeholder">
            <p>No comments yet. Be the first to comment!</p>
          </div>
        </div>
      </div>
    </div>

    <!-- No Match Found -->
    <div v-else class="no-match">
      <h2>Match Not Found</h2>
      <button @click="goBack" class="back-button">Go Back Home</button>
    </div>
  </main>
</template>

<style scoped>
.match-detail-container {
  min-height: 100vh;
  background: #f9fafb;
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
}

.spinner {
  width: 50px;
  height: 50px;
  border: 4px solid #e5e7eb;
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

.header {
  padding: 1.5rem 2rem;
  background: white;
  border-bottom: 1px solid #e5e7eb;
}

.back-button {
  padding: 0.75rem 1.5rem;
  background: #1e3a8a;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.3s ease;
}

.back-button:hover {
  background: #1e40af;
}

.competition-banner {
  position: relative;
  width: 100%;
  max-width: 1200px;
  margin: 0 auto;
  min-height: 200px;
  max-height: 300px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 2rem;
  color: white;
  overflow: hidden;
}

.competition-emblem-container {
  margin-bottom: 1rem;
  flex-shrink: 0;
}

.competition-emblem {
  height: 80px;
  max-height: 80px;
  width: auto;
  max-width: 200px;
  object-fit: contain;
  filter: drop-shadow(0 4px 6px rgba(0, 0, 0, 0.3));
}

.competition-info {
  text-align: center;
  max-width: 100%;
  overflow: hidden;
}

.competition-info h1 {
  font-size: clamp(1.25rem, 4vw, 2rem);
  font-weight: 700;
  margin: 0 0 0.5rem 0;
  word-wrap: break-word;
  overflow-wrap: break-word;
  hyphens: auto;
}

.competition-info p {
  font-size: clamp(0.875rem, 2.5vw, 1.125rem);
  opacity: 0.9;
  margin: 0;
  word-wrap: break-word;
}

.match-status-overlay {
  position: absolute;
  top: 20px;
  right: 20px;
  padding: 0.75rem 1.5rem;
  font-weight: 700;
  font-size: 1rem;
  border-radius: 8px;
  text-transform: uppercase;
  letter-spacing: 1px;
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

.content {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
}

.teams-section {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 3rem;
  margin-bottom: 3rem;
  padding: 3rem;
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.team {
  text-align: center;
  flex: 1;
  max-width: 250px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.75rem;
}

.team-crest {
  height: 80px;
  width: auto;
  object-fit: contain;
}

.team-name {
  font-size: 1.5rem;
  font-weight: 700;
  color: #1e3a8a;
}

.team-label {
  font-size: 0.875rem;
  color: #6b7280;
  text-transform: uppercase;
  letter-spacing: 1px;
  font-weight: 600;
}

.score-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
}

.score-display {
  font-size: 3rem;
  font-weight: 700;
  color: #1e3a8a;
}

.halftime-score {
  font-size: 0.875rem;
  color: #6b7280;
  font-weight: 600;
}

.info-section,
.comments-section {
  background: white;
  padding: 2rem;
  border-radius: 12px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  margin-bottom: 2rem;
}

.info-section h2,
.comments-section h2 {
  color: #1e3a8a;
  font-size: 1.75rem;
  margin-bottom: 1.5rem;
  border-bottom: 2px solid #e5e7eb;
  padding-bottom: 0.75rem;
}

.info-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
}

.info-item {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.info-label {
  font-size: 0.875rem;
  color: #6b7280;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.info-value {
  font-size: 1.125rem;
  color: #111827;
  font-weight: 600;
}

.comments-placeholder {
  padding: 3rem;
  text-align: center;
  color: #9ca3af;
  background: #f9fafb;
  border-radius: 8px;
  border: 2px dashed #e5e7eb;
}

.add-comment-form {
  margin-bottom: 2rem;
  padding: 1.5rem;
  background: #f9fafb;
  border-radius: 8px;
  border: 2px solid #e5e7eb;
}

.add-comment-form h3 {
  margin: 0 0 1rem 0;
  color: #1e3a8a;
  font-size: 1.25rem;
}

.comment-textarea {
  width: 100%;
  padding: 0.875rem;
  border: 2px solid #e5e7eb;
  border-radius: 8px;
  font-family: inherit;
  font-size: 0.9375rem;
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
  margin-top: 0.5rem;
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
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.3s ease;
}

.submit-comment-button:hover:not(:disabled) {
  background: #1e40af;
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

.comment-card {
  background: #f9fafb;
  border-radius: 8px;
  padding: 1.25rem;
  border-left: 4px solid #1e3a8a;
  transition: all 0.2s ease;
}

.comment-card:hover {
  background: #f3f4f6;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

.comment-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 0.75rem;
}

.comment-user {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.user-avatar {
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
}

.user-info {
  display: flex;
  flex-direction: column;
  gap: 0.125rem;
}

.username {
  font-weight: 600;
  color: #111827;
  font-size: 0.9375rem;
}

.comment-date {
  font-size: 0.75rem;
  color: #6b7280;
}

.comment-body {
  margin-top: 0.5rem;
}

.comment-body p {
  margin: 0;
  color: #374151;
  line-height: 1.6;
  font-size: 0.9375rem;
}

@media (max-width: 768px) {
  .competition-banner {
    min-height: 150px;
    padding: 1.5rem;
  }

  .competition-emblem {
    height: 60px;
  }

  .competition-info h1 {
    font-size: 1.5rem;
  }

  .competition-info p {
    font-size: 1rem;
  }

  .teams-section {
    flex-direction: column;
    gap: 1.5rem;
    padding: 2rem;
  }

  .team-name {
    font-size: 1.25rem;
  }

  .team-crest {
    height: 60px;
  }

  .score-display {
    font-size: 2rem;
  }

  .content {
    padding: 1rem;
  }

  .info-grid {
    grid-template-columns: 1fr;
  }

  .match-status-overlay {
    position: relative;
    top: auto;
    right: auto;
    margin-top: 1rem;
  }
}

@media (prefers-color-scheme: dark) {
  .match-detail-container {
    background: #111827;
  }

  .header {
    background: #1f2937;
    border-bottom-color: #374151;
  }

  .teams-section,
  .info-section,
  .comments-section {
    background: #1f2937;
  }

  .team-name,
  .score-display {
    color: #60a5fa;
  }

  .info-section h2,
  .comments-section h2 {
    color: #60a5fa;
    border-bottom-color: #374151;
  }

  .info-value {
    color: #f9fafb;
  }

  .comments-placeholder {
    background: #111827;
    border-color: #374151;
  }

  .add-comment-form {
    background: #111827;
    border-color: #374151;
  }

  .add-comment-form h3 {
    color: #60a5fa;
  }

  .comment-textarea {
    background: #1f2937;
    border-color: #374151;
    color: #f9fafb;
  }

  .comment-textarea:focus {
    border-color: #60a5fa;
  }

  .comment-textarea:disabled {
    background: #111827;
  }

  .comment-card {
    background: #111827;
    border-left-color: #60a5fa;
  }

  .comment-card:hover {
    background: #0f172a;
  }

  .user-avatar {
    background: #60a5fa;
  }

  .username {
    color: #f9fafb;
  }

  .comment-body p {
    color: #d1d5db;
  }
}
</style>
