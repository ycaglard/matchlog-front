<template>
  <div class="my-lists-container">
    <div class="page-header">
      <h1>My Lists</h1>
      <button class="create-button" @click="showCreateModal = true">
        <span class="button-icon">+</span>
        Create New List
      </button>
    </div>

    <!-- Loading State -->
    <div v-if="listStore.loading && listStore.myLists.length === 0" class="loading-state">
      <div class="spinner"></div>
      <p>Loading your lists...</p>
    </div>

    <!-- Error State -->
    <div v-else-if="listStore.error" class="error-state">
      <p class="error-message">{{ listStore.error }}</p>
      <button @click="loadLists" class="retry-button">Try Again</button>
    </div>

    <!-- Lists Content -->
    <div v-else class="lists-content">
      <!-- Stats Summary -->
      <div class="stats-summary">
        <div class="stat-box">
          <div class="stat-value">{{ listStore.myLists.length }}</div>
          <div class="stat-label">Total Lists</div>
        </div>
        <div class="stat-box">
          <div class="stat-value">{{ totalMatches }}</div>
          <div class="stat-label">Total Matches</div>
        </div>
        <div class="stat-box">
          <div class="stat-value">{{ listStore.customLists.length }}</div>
          <div class="stat-label">Custom Lists</div>
        </div>
      </div>

      <!-- Search/Filter -->
      <div class="search-bar">
        <input
          v-model="searchQuery"
          type="text"
          placeholder="Search lists by name..."
          class="search-input"
        />
        <button v-if="searchQuery" @click="searchQuery = ''" class="clear-button">
          &times;
        </button>
      </div>

      <!-- Empty State -->
      <div v-if="filteredLists.length === 0" class="empty-state">
        <div class="empty-icon">☰</div>
        <h2>{{ searchQuery ? 'No lists found' : 'No lists yet' }}</h2>
        <p v-if="searchQuery">Try adjusting your search query</p>
        <p v-else>Create your first custom list to organize your favorite matches</p>
        <button v-if="!searchQuery" @click="showCreateModal = true" class="create-button-large">
          Create Your First List
        </button>
      </div>

      <!-- Lists Grid -->
      <div v-else class="lists-grid">
        <ListCard
          v-for="list in filteredLists"
          :key="list.id"
          :list="list"
          :show-actions="true"
          @click="goToListDetail(list.id)"
          @edit="editList(list)"
          @delete="confirmDelete(list)"
        />
      </div>
    </div>

    <!-- Create List Modal -->
    <CreateListModal
      v-if="showCreateModal"
      @close="showCreateModal = false"
      @created="onListCreated"
    />

    <!-- Edit List Modal -->
    <EditListModal
      v-if="showEditModal"
      :list="editingList"
      @close="showEditModal = false"
      @updated="onListUpdated"
    />

    <!-- Delete Confirmation Modal -->
    <ConfirmModal
      v-if="showDeleteModal"
      :title="`Delete ${deletingList?.name}?`"
      :message="deleteConfirmMessage"
      confirm-text="Delete"
      confirm-class="danger"
      @confirm="deleteList"
      @cancel="showDeleteModal = false"
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { listStore } from '../store/listStore.js'
import ListCard from '../components/ListCard.vue'
import CreateListModal from '../components/CreateListModal.vue'
import EditListModal from '../components/EditListModal.vue'
import ConfirmModal from '../components/ConfirmModal.vue'

const router = useRouter()

// State
const searchQuery = ref('')
const showCreateModal = ref(false)
const showEditModal = ref(false)
const showDeleteModal = ref(false)
const editingList = ref(null)
const deletingList = ref(null)

// Computed
const totalMatches = computed(() => {
  return listStore.myLists.reduce((sum, list) => sum + list.getMatchCount(), 0)
})

const filteredLists = computed(() => {
  if (!searchQuery.value) {
    return listStore.sortedLists
  }
  
  const query = searchQuery.value.toLowerCase()
  return listStore.sortedLists.filter(list => 
    list.name.toLowerCase().includes(query) ||
    list.description.toLowerCase().includes(query)
  )
})

const deleteConfirmMessage = computed(() => {
  if (!deletingList.value) return ''
  
  const matchCount = deletingList.value.getMatchCount()
  return `This list contains ${matchCount} ${matchCount === 1 ? 'match' : 'matches'}. This action cannot be undone.`
})

// Methods
const loadLists = async () => {
  try {
    await listStore.loadMyLists(true)
  } catch (err) {
    console.error('Failed to load lists:', err)
  }
}

const goToListDetail = (listId) => {
  router.push(`/lists/${listId}`)
}

const editList = (list) => {
  editingList.value = list
  showEditModal.value = true
}

const confirmDelete = (list) => {
  if (list.isDefaultList()) {
    alert('Default lists cannot be deleted')
    return
  }
  
  deletingList.value = list
  showDeleteModal.value = true
}

const deleteList = async () => {
  if (!deletingList.value) return
  
  try {
    await listStore.deleteList(deletingList.value.id)
    showDeleteModal.value = false
    deletingList.value = null
  } catch (err) {
    alert(`Failed to delete list: ${err.message}`)
  }
}

const onListCreated = (newList) => {
  showCreateModal.value = false
  // Optionally navigate to the new list
  // router.push(`/lists/${newList.id}`)
}

const onListUpdated = () => {
  showEditModal.value = false
  editingList.value = null
}

// Lifecycle
onMounted(() => {
  loadLists()
})
</script>

<style scoped>
.my-lists-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 24px;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 32px;
}

.page-header h1 {
  font-size: 32px;
  font-weight: 700;
  color: #2c3e50;
  margin: 0;
}

.create-button {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 24px;
  background: #42b983;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
}

.create-button:hover {
  background: #38a374;
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(66, 185, 131, 0.3);
}

.button-icon {
  font-size: 18px;
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

.stats-summary {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;
  margin-bottom: 24px;
}

.stat-box {
  background: white;
  border: 1px solid #e1e8ed;
  border-radius: 12px;
  padding: 24px;
  text-align: center;
}

.stat-value {
  font-size: 36px;
  font-weight: 700;
  color: #42b983;
  margin-bottom: 8px;
}

.stat-label {
  font-size: 14px;
  color: #657786;
  font-weight: 500;
}

.search-bar {
  position: relative;
  margin-bottom: 24px;
}

.search-input {
  width: 100%;
  padding: 12px 40px 12px 16px;
  border: 1px solid #e1e8ed;
  border-radius: 8px;
  font-size: 16px;
  transition: border-color 0.2s ease;
}

.search-input:focus {
  outline: none;
  border-color: #42b983;
}

.clear-button {
  position: absolute;
  right: 12px;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  color: #657786;
  font-size: 18px;
  cursor: pointer;
  padding: 4px;
}

.empty-state {
  text-align: center;
  padding: 80px 20px;
}

.empty-icon {
  font-size: 64px;
  margin-bottom: 16px;
}

.empty-state h2 {
  font-size: 24px;
  color: #2c3e50;
  margin-bottom: 8px;
}

.empty-state p {
  color: #657786;
  margin-bottom: 24px;
}

.create-button-large {
  padding: 14px 28px;
  background: #42b983;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
}

.create-button-large:hover {
  background: #38a374;
  transform: translateY(-1px);
}

.lists-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 20px;
}

@media (max-width: 768px) {
  .my-lists-container {
    padding: 16px;
  }
  
  .page-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 16px;
  }
  
  .page-header h1 {
    font-size: 24px;
  }
  
  .stats-summary {
    grid-template-columns: 1fr;
  }
  
  .lists-grid {
    grid-template-columns: 1fr;
  }
}
</style>
