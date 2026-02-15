<template>
  <div class="list-card" @click="$emit('click', list)">
    <div class="list-header">
      <div class="list-icon">{{ list.getIcon() }}</div>
      <h3 class="list-name">{{ list.name }}</h3>
      <div v-if="list.isDefaultList()" class="default-badge">Default</div>
    </div>
    
    <p v-if="list.description" class="list-description">{{ list.description }}</p>
    <p v-else class="list-description empty">No description</p>
    
    <div class="list-stats">
      <div class="stat">
        <span class="stat-icon">⚽</span>
        <span class="stat-value">{{ list.getMatchCount() }}</span>
        <span class="stat-label">{{ list.getMatchCount() === 1 ? 'Match' : 'Matches' }}</span>
      </div>
      
      <div class="stat">
        <span class="stat-icon">📆</span>
        <span class="stat-value">{{ list.getFormattedUpdatedDate() }}</span>
      </div>
    </div>
    
    <div v-if="showActions && canEdit" class="list-actions" @click.stop>
      <button 
        class="action-button edit-button" 
        @click="$emit('edit', list)"
        title="Edit list"
      >
        Edit
      </button>
      <button 
        class="action-button delete-button" 
        @click="$emit('delete', list)"
        :disabled="list.isDefaultList()"
        :title="list.isDefaultList() ? 'Cannot delete default lists' : 'Delete list'"
      >
        Delete
      </button>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { authStore } from '../store/authStore.js'

const props = defineProps({
  list: {
    type: Object,
    required: true
  },
  showActions: {
    type: Boolean,
    default: true
  }
})

const emit = defineEmits(['click', 'edit', 'delete'])

const canEdit = computed(() => {
  return authStore.user && props.list.isOwnedBy(authStore.user.id)
})
</script>

<style scoped>
.list-card {
  background: #1a1f29;
  border: 1px solid #2c3440;
  border-radius: 12px;
  padding: 20px;
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
}

.list-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
  border-color: #ff8000;
}

.list-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 12px;
}

.list-icon {
  font-size: 24px;
  line-height: 1;
}

.list-name {
  flex: 1;
  margin: 0;
  font-size: 20px;
  font-weight: 600;
  color: #cdd;
}

.default-badge {
  background: #00dc82;
  color: #14181c;
  font-size: 11px;
  font-weight: 600;
  padding: 4px 8px;
  border-radius: 12px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.list-description {
  margin: 0 0 16px 0;
  color: #9ab;
  font-size: 14px;
  line-height: 1.5;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
}

.list-description.empty {
  font-style: italic;
  opacity: 0.6;
}

.list-stats {
  display: flex;
  gap: 20px;
  margin-bottom: 16px;
  padding-top: 12px;
  border-top: 1px solid #2c3440;
}

.stat {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  color: #9ab;
}

.stat-icon {
  font-size: 16px;
}

.stat-value {
  font-weight: 600;
  color: #cdd;
}

.stat-label {
  color: #9ab;
}

.list-actions {
  display: flex;
  gap: 8px;
  padding-top: 12px;
  border-top: 1px solid #2c3440;
}

.action-button {
  flex: 1;
  padding: 8px 16px;
  border: none;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
}

.edit-button {
  background: #2c3440;
  color: #cdd;
}

.edit-button:hover {
  background: #445566;
}

.delete-button {
  background: rgba(255, 128, 0, 0.1);
  color: #ff8000;
}

.delete-button:hover:not(:disabled) {
  background: rgba(255, 128, 0, 0.2);
}

.delete-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

@media (max-width: 768px) {
  .list-card {
    padding: 16px;
  }
  
  .list-name {
    font-size: 18px;
  }
  
  .list-stats {
    flex-direction: column;
    gap: 8px;
  }
}
</style>
