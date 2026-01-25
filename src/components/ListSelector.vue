<template>
  <div class="list-selector-overlay" @click.self="$emit('close')">
    <div class="list-selector-content">
      <div class="selector-header">
        <h3>Add to List</h3>
        <button class="close-button" @click="$emit('close')">&times;</button>
      </div>

      <div class="selector-body">
        <!-- Loading State -->
        <div v-if="listStore.loading && listStore.myLists.length === 0" class="loading">
          <div class="spinner-small"></div>
          <span>Loading lists...</span>
        </div>

        <!-- Error State -->
        <div v-else-if="listStore.error" class="error">
          <p>{{ listStore.error }}</p>
        </div>

        <!-- Lists -->
        <div v-else>
          <!-- Quick Actions (Default Lists) -->
          <div v-if="defaultLists.length > 0" class="quick-actions">
            <h4>Quick Add</h4>
            <div class="quick-buttons">
              <button
                v-for="list in defaultLists"
                :key="list.id"
                :class="['quick-btn', { 'in-list': list.containsMatch(matchId) }]"
                @click="toggleList(list)"
                :disabled="isProcessing"
              >
                <span class="icon">{{ list.getIcon() }}</span>
                <span class="name">{{ list.name }}</span>
                <span v-if="list.containsMatch(matchId)" class="check">✓</span>
              </button>
            </div>
          </div>

          <!-- Custom Lists -->
          <div v-if="customLists.length > 0" class="custom-lists">
            <h4>Custom Lists</h4>
            <div class="lists-container">
              <button
                v-for="list in customLists"
                :key="list.id"
                :class="['list-item', { 'in-list': list.containsMatch(matchId) }]"
                @click="toggleList(list)"
                :disabled="isProcessing"
              >
                <span class="icon">{{ list.getIcon() }}</span>
                <div class="list-info">
                  <span class="name">{{ list.name }}</span>
                  <span class="count">{{ list.getMatchCount() }} matches</span>
                </div>
                <span v-if="list.containsMatch(matchId)" class="check">✓</span>
              </button>
            </div>
          </div>

          <!-- Create New List -->
          <div class="create-section">
            <button class="create-new-btn" @click="openCreateModal">
              <span class="icon">+</span>
              Create New List
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>

  <!-- Create List Modal -->
  <CreateListModal
    v-if="showCreateModal"
    :initial-match-id="matchId"
    @close="showCreateModal = false"
    @created="onListCreated"
  />
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { listStore } from '../store/listStore.js'
import CreateListModal from './CreateListModal.vue'

const props = defineProps({
  matchId: {
    type: Number,
    required: true
  }
})

const emit = defineEmits(['close', 'updated'])

// State
const isProcessing = ref(false)
const showCreateModal = ref(false)

// Computed
const defaultLists = computed(() => {
  return listStore.sortedLists.filter(list => list.isDefaultList())
})

const customLists = computed(() => {
  return listStore.sortedLists.filter(list => !list.isDefaultList())
})

// Methods
const toggleList = async (list) => {
  isProcessing.value = true

  try {
    await listStore.toggleMatchInList(list.id, props.matchId)
    emit('updated', list)
  } catch (err) {
    alert(`Failed to update list: ${err.message}`)
  } finally {
    isProcessing.value = false
  }
}

const openCreateModal = () => {
  showCreateModal.value = true
}

const onListCreated = (newList) => {
  showCreateModal.value = false
  emit('updated', newList)
}

// Lifecycle
onMounted(async () => {
  if (listStore.myLists.length === 0) {
    try {
      await listStore.loadMyLists()
    } catch (err) {
      console.error('Failed to load lists:', err)
    }
  }
})
</script>

<style scoped>
.list-selector-overlay {
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

.list-selector-content {
  background: white;
  border-radius: 12px;
  max-width: 450px;
  width: 100%;
  max-height: 80vh;
  display: flex;
  flex-direction: column;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
}

.selector-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px;
  border-bottom: 1px solid #e1e8ed;
}

.selector-header h3 {
  margin: 0;
  font-size: 20px;
  font-weight: 600;
  color: #2c3e50;
}

.close-button {
  background: none;
  border: none;
  font-size: 24px;
  color: #657786;
  cursor: pointer;
  padding: 4px;
  line-height: 1;
  transition: color 0.2s ease;
}

.close-button:hover {
  color: #2c3e50;
}

.selector-body {
  flex: 1;
  overflow-y: auto;
  padding: 20px;
}

.loading,
.error {
  text-align: center;
  padding: 20px;
  color: #657786;
}

.spinner-small {
  width: 24px;
  height: 24px;
  margin: 0 auto 12px;
  border: 3px solid #e1e8ed;
  border-top-color: #42b983;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.quick-actions,
.custom-lists,
.create-section {
  margin-bottom: 24px;
}

.quick-actions h4,
.custom-lists h4 {
  margin: 0 0 12px 0;
  font-size: 14px;
  font-weight: 600;
  color: #657786;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.quick-buttons {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 8px;
}

.quick-btn {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  padding: 16px 8px;
  background: white;
  border: 2px solid #e1e8ed;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
  position: relative;
}

.quick-btn:hover:not(:disabled) {
  border-color: #42b983;
  transform: translateY(-2px);
}

.quick-btn.in-list {
  border-color: #42b983;
  background: #f0fdf9;
}

.quick-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.quick-btn .icon {
  font-size: 32px;
}

.quick-btn .name {
  font-size: 12px;
  font-weight: 600;
  color: #2c3e50;
}

.quick-btn .check {
  position: absolute;
  top: 4px;
  right: 4px;
  width: 20px;
  height: 20px;
  background: #42b983;
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
}

.lists-container {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.list-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  background: white;
  border: 1px solid #e1e8ed;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
  text-align: left;
}

.list-item:hover:not(:disabled) {
  border-color: #42b983;
  background: #f5f8fa;
}

.list-item.in-list {
  border-color: #42b983;
  background: #f0fdf9;
}

.list-item:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.list-item .icon {
  font-size: 24px;
}

.list-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.list-info .name {
  font-size: 15px;
  font-weight: 600;
  color: #2c3e50;
}

.list-info .count {
  font-size: 12px;
  color: #657786;
}

.list-item .check {
  width: 24px;
  height: 24px;
  background: #42b983;
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
}

.create-new-btn {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 14px;
  background: #f0f4f8;
  border: 2px dashed #cbd5e0;
  border-radius: 8px;
  color: #2c3e50;
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
}

.create-new-btn:hover {
  background: #e1e8ed;
  border-color: #42b983;
  color: #42b983;
}

.create-new-btn .icon {
  font-size: 20px;
}

@media (max-width: 480px) {
  .quick-buttons {
    grid-template-columns: repeat(2, 1fr);
  }
}
</style>
