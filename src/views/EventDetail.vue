<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useEventClient } from '../clients/eventClient.js'
import { authStore } from '../store/authStore.js'

const route = useRoute()
const router = useRouter()
const { loading, error, getEventById, createComment } = useEventClient()

const event = ref(null)
const newCommentText = ref('')
const isSubmitting = ref(false)
const commentError = ref(null)

// Get current user ID from auth store
const currentUserId = computed(() => authStore.user?.id || null)
const currentUsername = computed(() => authStore.user?.username || 'User')

// Fetch event details when component mounts
onMounted(async () => {
  const eventId = route.params.id
  if (eventId) {
    try {
      const eventData = await getEventById(eventId)
      event.value = eventData
      console.log('Event details loaded:', eventData)
    } catch (err) {
      console.error('Failed to fetch event details:', err)
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
      eventId: event.value.id
    }

    const newComment = await createComment(commentData)
    
    console.log('Comment created successfully:', newComment)
    
    // Refresh the entire event data from the backend to get the updated comments
    const refreshedEvent = await getEventById(event.value.id)
    event.value = refreshedEvent
    
    // Clear the form
    newCommentText.value = ''
    
    console.log('Event refreshed with new comment:', refreshedEvent)
  } catch (err) {
    console.error('Failed to create comment:', err)
    commentError.value = err.message || 'Failed to create comment. Please try again.'
  } finally {
    isSubmitting.value = false
  }
}

const getEventImage = (eventType) => {
  const imageMap = {
    'LEAGUE': 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=1200&h=800&fit=crop',
    'TOURNAMENT': 'https://images.unsplash.com/photo-1551958219-acbc608c6377?w=1200&h=800&fit=crop',
    'FRIENDLY': 'https://images.unsplash.com/photo-1534158914592-062992fbe900?w=1200&h=800&fit=crop',
    'CHAMPIONSHIP': 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=1200&h=800&fit=crop',
    'default': 'https://images.unsplash.com/photo-1551698618-1dfe5d97d256?w=1200&h=800&fit=crop'
  }
  return imageMap[eventType?.toUpperCase()] || imageMap['default']
}
</script>

<template>
  <main class="event-detail-container">
    <!-- Loading State -->
    <div v-if="loading" class="loading-state">
      <div class="spinner"></div>
      <p>Loading event details...</p>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="error-state">
      <h2>Error Loading Event</h2>
      <p>{{ error }}</p>
      <button @click="goBack" class="back-button">Go Back Home</button>
    </div>

    <!-- Event Details -->
    <div v-else-if="event" class="event-detail">
      <!-- Header with Back Button -->
      <div class="header">
        <button @click="goBack" class="back-button">
          ← Back to Events
        </button>
      </div>

      <!-- Event Image Banner -->
      <div class="event-banner">
        <img :src="getEventImage(event.eventType)" :alt="`${event.match?.home?.name} vs ${event.match?.away?.name}`" />
        <div class="event-type-overlay">{{ event.eventType }}</div>
      </div>

      <!-- Main Content -->
      <div class="content">
        <!-- Teams Section -->
        <div class="teams-section">
          <div class="team home-team">
            <div class="team-name">{{ event.match?.home?.name || 'TBD' }}</div>
            <div class="team-label">Home</div>
          </div>
          <div class="vs-divider">VS</div>
          <div class="team away-team">
            <div class="team-name">{{ event.match?.away?.name || 'TBD' }}</div>
            <div class="team-label">Away</div>
          </div>
        </div>

        <!-- Event Information -->
        <div class="info-section">
          <h2>Event Information</h2>
          <div class="info-grid">
            <div class="info-item">
              <span class="info-label">Event Type:</span>
              <span class="info-value event-type-badge">{{ event.eventType }}</span>
            </div>
            <div class="info-item">
              <span class="info-label">Date & Time:</span>
              <span class="info-value">{{ formatDate(event.date) }}</span>
            </div>
            <div class="info-item">
              <span class="info-label">Comments:</span>
              <span class="info-value">{{ event.commentCount }} {{ event.commentCount === 1 ? 'comment' : 'comments' }}</span>
            </div>
          </div>
        </div>

        <!-- Comments Section -->
        <div class="comments-section">
          <h2>Comments ({{ event.commentCount }})</h2>
          
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
          <div v-if="event.comments && event.comments.length > 0" class="comments-list">
            <div v-for="comment in event.comments" :key="comment.id" class="comment-card">
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

    <!-- No Event Found -->
    <div v-else class="no-event">
      <h2>Event Not Found</h2>
      <button @click="goBack" class="back-button">Go Back Home</button>
    </div>
  </main>
</template>

<style scoped>
.event-detail-container {
  min-height: 100vh;
  background: #f9fafb;
}

.loading-state,
.error-state,
.no-event {
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
.no-event h2 {
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

.event-banner {
  position: relative;
  width: 100%;
  height: 400px;
  overflow: hidden;
}

.event-banner img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.event-type-overlay {
  position: absolute;
  top: 20px;
  right: 20px;
  padding: 0.75rem 1.5rem;
  background: rgba(30, 58, 138, 0.95);
  color: white;
  font-weight: 700;
  font-size: 1.25rem;
  border-radius: 8px;
  text-transform: uppercase;
  letter-spacing: 1px;
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
  max-width: 300px;
}

.team-name {
  font-size: 2.5rem;
  font-weight: 700;
  color: #1e3a8a;
  margin-bottom: 0.5rem;
}

.team-label {
  font-size: 1rem;
  color: #6b7280;
  text-transform: uppercase;
  letter-spacing: 1px;
  font-weight: 600;
}

.vs-divider {
  font-size: 2rem;
  font-weight: 700;
  color: #9ca3af;
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

.event-type-badge {
  display: inline-block;
  padding: 0.5rem 1rem;
  background: #dbeafe;
  color: #1e3a8a;
  border-radius: 6px;
  font-size: 1rem;
  text-transform: uppercase;
  letter-spacing: 1px;
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
  .event-banner {
    height: 250px;
  }

  .teams-section {
    flex-direction: column;
    gap: 1.5rem;
    padding: 2rem;
  }

  .team-name {
    font-size: 1.75rem;
  }

  .vs-divider {
    font-size: 1.5rem;
  }

  .content {
    padding: 1rem;
  }

  .info-grid {
    grid-template-columns: 1fr;
  }
}

@media (prefers-color-scheme: dark) {
  .event-detail-container {
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

  .team-name {
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
