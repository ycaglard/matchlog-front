<template>
  <div class="list-detail-container">
    <!-- Loading State -->
    <div v-if="loading" class="loading-state">
      <div class="spinner"></div>
      <p>Loading list...</p>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="error-state">
      <p class="error-message">{{ error }}</p>
      <button @click="loadList" class="retry-button">Try Again</button>
    </div>

    <!-- List Content -->
    <div v-else-if="list" class="list-content">
      <!-- Header -->
      <div class="list-header">
        <button class="back-button" @click="goBack">
          ← Back to Lists
        </button>
        
        <div class="list-title-section">
          <div class="title-row">
            <span class="list-icon-large">{{ list.getIcon() }}</span>
            <h1>{{ list.name }}</h1>
            <div v-if="list.isDefaultList()" class="default-badge">Default</div>
          </div>
          <p v-if="list.description" class="list-description">{{ list.description }}</p>
          <p v-else class="list-description empty">No description</p>
        </div>

        <div v-if="canEdit" class="list-header-actions">
          <button class="action-btn edit-btn" @click="showEditModal = true">
            Edit
          </button>
          <button 
            v-if="!list.isDefaultList()" 
            class="action-btn delete-btn" 
            @click="showDeleteModal = true"
          >
            Delete
          </button>
        </div>
      </div>

      <!-- Stats Bar -->
      <div class="stats-bar">
        <div class="stat">
          <span class="stat-icon">⚽</span>
          <span class="stat-value">{{ list.getMatchCount() }}</span>
          <span class="stat-label">{{ list.getMatchCount() === 1 ? 'Match' : 'Matches' }}</span>
        </div>
        <div class="stat">
          <span class="stat-icon">👤</span>
          <span class="stat-label">Created by <strong>{{ list.username }}</strong></span>
        </div>
        <div class="stat">
          <span class="stat-icon">📆</span>
          <span class="stat-label">Updated {{ list.getFormattedUpdatedDate() }}</span>
        </div>
      </div>

      <!-- Matches Section -->
      <div class="matches-section">
        <div class="section-header">
          <h2>Matches in this list</h2>
          <button v-if="canEdit" class="add-match-btn" @click="showAddMatchModal = true">
            + Add Matches
          </button>
        </div>

        <!-- Loading Matches -->
        <div v-if="loadingMatches" class="loading-matches">
          <div class="spinner-small"></div>
          <span>Loading matches...</span>
        </div>

        <!-- No Matches -->
        <div v-else-if="!matches || matches.length === 0" class="empty-matches">
          <div class="empty-icon">⚽</div>
          <h3>No matches yet</h3>
          <p>Add matches to this list to get started</p>
          <button v-if="canEdit" class="add-match-btn-large" @click="showAddMatchModal = true">
            Add Your First Match
          </button>
        </div>

        <!-- Matches Grid -->
        <div v-else class="matches-grid">
          <div v-for="match in matches" :key="match.id" class="match-item">
            <MatchCard 
              :match="match" 
              @view-details="goToMatch(match.id)"
            />
            <button 
              v-if="canEdit" 
              class="remove-match-btn" 
              @click="confirmRemoveMatch(match)"
              title="Remove from list"
            >
              &times;
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Edit List Modal -->
    <EditListModal
      v-if="showEditModal"
      :list="list"
      @close="showEditModal = false"
      @updated="onListUpdated"
    />

    <!-- Delete List Confirmation -->
    <ConfirmModal
      v-if="showDeleteModal"
      :title="`Delete ${list?.name}?`"
      :message="deleteConfirmMessage"
      confirm-text="Delete"
      confirm-class="danger"
      @confirm="deleteList"
      @cancel="showDeleteModal = false"
    />

    <!-- Remove Match Confirmation -->
    <ConfirmModal
      v-if="showRemoveMatchModal"
      :title="`Remove match from ${list?.name}?`"
      message="This will remove the match from this list. The match itself will not be deleted."
      confirm-text="Remove"
      confirm-class="warning"
      @confirm="removeMatch"
      @cancel="showRemoveMatchModal = false"
    />

    <!-- Add Match Modal (placeholder - could be a search/browse interface) -->
    <div v-if="showAddMatchModal" class="modal-overlay" @click.self="showAddMatchModal = false">
      <div class="modal-content">
        <div class="modal-header">
          <h2>Add Matches</h2>
          <button class="close-button" @click="showAddMatchModal = false">&times;</button>
        </div>
        <div class="modal-body">
          <p>Match browsing interface coming soon. For now, add matches from the match detail page.</p>
          <button class="button button-primary" @click="showAddMatchModal = false">
            Got it
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { listStore } from '../store/listStore.js'
import { authStore } from '../store/authStore.js'
import { useMatchClient } from '../clients/matchClient.js'
import MatchCard from '../components/MatchCard.vue'
import EditListModal from '../components/EditListModal.vue'
import ConfirmModal from '../components/ConfirmModal.vue'

const route = useRoute()
const router = useRouter()
const { getMatchById } = useMatchClient()

// State
const list = ref(null)
const matches = ref([])
const loading = ref(false)
const loadingMatches = ref(false)
const error = ref(null)
const showEditModal = ref(false)
const showDeleteModal = ref(false)
const showRemoveMatchModal = ref(false)
const showAddMatchModal = ref(false)
const matchToRemove = ref(null)

// Computed
const canEdit = computed(() => {
  return authStore.user && list.value?.isOwnedBy(authStore.user.id)
})

const deleteConfirmMessage = computed(() => {
  if (!list.value) return ''
  const matchCount = list.value.getMatchCount()
  return `This list contains ${matchCount} ${matchCount === 1 ? 'match' : 'matches'}. This action cannot be undone.`
})

// Methods
const loadList = async () => {
  loading.value = true
  error.value = null

  try {
    const listId = route.params.id
    list.value = await listStore.getListById(listId, true)
    await loadMatches()
  } catch (err) {
    error.value = err.message || 'Failed to load list'
    console.error('Failed to load list:', err)
  } finally {
    loading.value = false
  }
}

const loadMatches = async () => {
  if (!list.value || list.value.matchIds.length === 0) {
    matches.value = []
    return
  }

  loadingMatches.value = true

  try {
    // Fetch all matches for this list
    const matchPromises = list.value.matchIds.map(matchId => 
      getMatchById(matchId).catch(err => {
        console.error(`Failed to load match ${matchId}:`, err)
        return null
      })
    )
    
    const fetchedMatches = await Promise.all(matchPromises)
    matches.value = fetchedMatches.filter(m => m !== null)
  } catch (err) {
    console.error('Failed to load matches:', err)
  } finally {
    loadingMatches.value = false
  }
}

const onListUpdated = async () => {
  showEditModal.value = false
  await loadList()
}

const deleteList = async () => {
  if (!list.value) return

  try {
    await listStore.deleteList(list.value.id)
    router.push('/lists')
  } catch (err) {
    alert(`Failed to delete list: ${err.message}`)
  }
}

const confirmRemoveMatch = (match) => {
  matchToRemove.value = match
  showRemoveMatchModal.value = true
}

const removeMatch = async () => {
  if (!matchToRemove.value || !list.value) return

  try {
    await listStore.removeMatchFromList(list.value.id, matchToRemove.value.id)
    showRemoveMatchModal.value = false
    matchToRemove.value = null
    await loadList()
  } catch (err) {
    alert(`Failed to remove match: ${err.message}`)
  }
}

const goToMatch = (matchId) => {
  router.push(`/match/${matchId}`)
}

const goBack = () => {
  router.push('/lists')
}

// Lifecycle
onMounted(() => {
  loadList()
})

// Watch for route changes
watch(() => route.params.id, () => {
  if (route.name === 'ListDetail') {
    loadList()
  }
})
</script>

<style scoped>
.list-detail-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 24px;
}

.loading-state,
.error-state {
  text-align: center;
  padding: 60px 20px;
}

.spinner {
  width: 50px;
  height: 50px;
  margin: 0 auto 20px;
  border: 4px solid #e1e8ed;
  border-top-color: #42b983;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.error-message {
  color: #e53e3e;
  margin-bottom: 16px;
}

.retry-button {
  padding: 10px 20px;
  background: #42b983;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
}

.list-header {
  margin-bottom: 24px;
}

.back-button {
  padding: 8px 16px;
  background: #f0f4f8;
  color: #2c3e50;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  margin-bottom: 16px;
  transition: background 0.2s ease;
}

.back-button:hover {
  background: #e1e8ed;
}

.list-title-section {
  margin-bottom: 16px;
}

.title-row {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 12px;
}

.list-icon-large {
  font-size: 40px;
}

.title-row h1 {
  flex: 1;
  margin: 0;
  font-size: 36px;
  font-weight: 700;
  color: #2c3e50;
}

.default-badge {
  background: #42b983;
  color: white;
  font-size: 12px;
  font-weight: 600;
  padding: 6px 12px;
  border-radius: 12px;
  text-transform: uppercase;
}

.list-description {
  margin: 0;
  font-size: 16px;
  color: #657786;
  line-height: 1.5;
}

.list-description.empty {
  font-style: italic;
  opacity: 0.6;
}

.list-header-actions {
  display: flex;
  gap: 12px;
}

.action-btn {
  padding: 10px 20px;
  border: none;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  gap: 6px;
}

.edit-btn {
  background: #f0f4f8;
  color: #2c3e50;
}

.edit-btn:hover {
  background: #e1e8ed;
}

.delete-btn {
  background: #fee;
  color: #e53e3e;
}

.delete-btn:hover {
  background: #fdd;
}

.stats-bar {
  display: flex;
  gap: 24px;
  padding: 20px;
  background: white;
  border: 1px solid #e1e8ed;
  border-radius: 12px;
  margin-bottom: 32px;
  flex-wrap: wrap;
}

.stat {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  color: #657786;
}

.stat-icon {
  font-size: 20px;
}

.stat-value {
  font-size: 20px;
  font-weight: 700;
  color: #2c3e50;
}

.stat-label {
  color: #657786;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.section-header h2 {
  font-size: 24px;
  font-weight: 600;
  color: #2c3e50;
  margin: 0;
}

.add-match-btn,
.add-match-btn-large {
  padding: 10px 20px;
  background: #42b983;
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
}

.add-match-btn:hover,
.add-match-btn-large:hover {
  background: #38a374;
  transform: translateY(-1px);
}

.loading-matches {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  padding: 40px;
  color: #657786;
}

.spinner-small {
  width: 24px;
  height: 24px;
  border: 3px solid #e1e8ed;
  border-top-color: #42b983;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

.empty-matches {
  text-align: center;
  padding: 60px 20px;
  background: white;
  border: 2px dashed #e1e8ed;
  border-radius: 12px;
}

.empty-icon {
  font-size: 64px;
  margin-bottom: 16px;
}

.empty-matches h3 {
  font-size: 20px;
  color: #2c3e50;
  margin-bottom: 8px;
}

.empty-matches p {
  color: #657786;
  margin-bottom: 20px;
}

.matches-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 20px;
}

.match-item {
  position: relative;
}

.remove-match-btn {
  position: absolute;
  top: 8px;
  right: 8px;
  width: 32px;
  height: 32px;
  background: rgba(229, 62, 62, 0.9);
  color: white;
  border: none;
  border-radius: 50%;
  font-size: 18px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: all 0.2s ease;
  z-index: 10;
}

.match-item:hover .remove-match-btn {
  opacity: 1;
}

.remove-match-btn:hover {
  background: rgba(197, 48, 48, 1);
  transform: scale(1.1);
}

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 20px;
}

.modal-content {
  background: white;
  border-radius: 12px;
  max-width: 500px;
  width: 100%;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 24px;
  border-bottom: 1px solid #e1e8ed;
}

.modal-header h2 {
  margin: 0;
  font-size: 24px;
  font-weight: 600;
  color: #2c3e50;
}

.close-button {
  background: none;
  border: none;
  font-size: 24px;
  color: #657786;
  cursor: pointer;
}

.modal-body {
  padding: 24px;
}

.button {
  padding: 10px 20px;
  border: none;
  border-radius: 6px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
}

.button-primary {
  background: #42b983;
  color: white;
}

@media (max-width: 768px) {
  .list-detail-container {
    padding: 16px;
  }
  
  .title-row h1 {
    font-size: 24px;
  }
  
  .stats-bar {
    flex-direction: column;
  }
  
  .matches-grid {
    grid-template-columns: 1fr;
  }
}
</style>
