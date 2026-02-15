<template>
  <div class="modal-overlay" @click.self="$emit('close')">
    <div class="modal-content">
      <div class="modal-header">
        <h2>Edit List</h2>
        <button class="close-button" @click="$emit('close')">&times;</button>
      </div>

      <form @submit.prevent="handleSubmit" class="modal-body">
        <!-- Name Field -->
        <div class="form-group">
          <label for="list-name" class="form-label">
            List Name <span class="required">*</span>
          </label>
          <input
            id="list-name"
            v-model="formData.name"
            type="text"
            class="form-input"
            placeholder="List name"
            maxlength="100"
            required
            :disabled="isSubmitting"
          />
          <div class="form-hint">{{ formData.name.length }}/100 characters</div>
        </div>

        <!-- Description Field -->
        <div class="form-group">
          <label for="list-description" class="form-label">
            Description <span class="optional">(optional)</span>
          </label>
          <textarea
            id="list-description"
            v-model="formData.description"
            class="form-textarea"
            placeholder="Describe what this list is about..."
            maxlength="500"
            rows="4"
            :disabled="isSubmitting"
          ></textarea>
          <div class="form-hint">{{ formData.description.length }}/500 characters</div>
        </div>

        <!-- Error Message -->
        <div v-if="error" class="error-message">
          {{ error }}
        </div>

        <!-- Actions -->
        <div class="modal-actions">
          <button
            type="button"
            class="button button-secondary"
            @click="$emit('close')"
            :disabled="isSubmitting"
          >
            Cancel
          </button>
          <button
            type="submit"
            class="button button-primary"
            :disabled="isSubmitting || !formData.name.trim() || !hasChanges"
          >
            <span v-if="isSubmitting">Updating...</span>
            <span v-else>Update List</span>
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed } from 'vue'
import { listStore } from '../store/listStore.js'

const props = defineProps({
  list: {
    type: Object,
    required: true
  }
})

const emit = defineEmits(['close', 'updated'])

// State
const isSubmitting = ref(false)
const error = ref(null)

const formData = reactive({
  name: props.list.name,
  description: props.list.description || ''
})

// Computed
const hasChanges = computed(() => {
  return formData.name !== props.list.name || 
         formData.description !== (props.list.description || '')
})

// Methods
const handleSubmit = async () => {
  if (!formData.name.trim()) {
    error.value = 'List name is required'
    return
  }

  if (!hasChanges.value) {
    emit('close')
    return
  }

  isSubmitting.value = true
  error.value = null

  try {
    await listStore.updateList(props.list.id, {
      name: formData.name.trim(),
      description: formData.description.trim(),
      matchIds: props.list.matchIds
    })

    emit('updated')
  } catch (err) {
    error.value = err.message || 'Failed to update list'
    isSubmitting.value = false
  }
}
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 20px;
}

.modal-content {
  background: #1a1f29;
  border-radius: 12px;
  max-width: 500px;
  width: 100%;
  max-height: 90vh;
  overflow: auto;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.6);
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 24px;
  border-bottom: 1px solid #2c3440;
}

.modal-header h2 {
  margin: 0;
  font-size: 24px;
  font-weight: 600;
  color: #cdd;
}

.close-button {
  background: none;
  border: none;
  font-size: 24px;
  color: #9ab;
  cursor: pointer;
  padding: 4px;
  line-height: 1;
  transition: color 0.2s ease;
}

.close-button:hover {
  color: #cdd;
}

.modal-body {
  padding: 24px;
}

.form-group {
  margin-bottom: 20px;
}

.form-label {
  display: block;
  margin-bottom: 8px;
  font-weight: 600;
  color: #cdd;
  font-size: 14px;
}

.required {
  color: #ff8000;
}

.optional {
  color: #9ab;
  font-weight: 400;
}

.form-input,
.form-textarea {
  width: 100%;
  padding: 10px 12px;
  border: 1px solid #2c3440;
  border-radius: 6px;
  font-size: 16px;
  font-family: inherit;
  transition: border-color 0.2s ease;
  background: #14181c;
  color: #cdd;
}

.form-input:focus,
.form-textarea:focus {
  outline: none;
  border-color: #ff8000;
}

.form-input:disabled,
.form-textarea:disabled {
  background: #0d1117;
  cursor: not-allowed;
  opacity: 0.6;
}

.form-textarea {
  resize: vertical;
  min-height: 80px;
}

.form-hint {
  margin-top: 4px;
  font-size: 12px;
  color: #678;
}

.error-message {
  padding: 12px;
  background: rgba(255, 128, 0, 0.1);
  border: 1px solid rgba(255, 128, 0, 0.3);
  border-radius: 6px;
  color: #ff8000;
  font-size: 14px;
  margin-bottom: 16px;
}

.modal-actions {
  display: flex;
  gap: 12px;
  justify-content: flex-end;
}

.button {
  padding: 10px 20px;
  border: none;
  border-radius: 6px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
}

.button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.button-secondary {
  background: #2c3440;
  color: #cdd;
}

.button-secondary:hover:not(:disabled) {
  background: #445566;
}

.button-primary {
  background: #ff8000;
  color: #14181c;
}

.button-primary:hover:not(:disabled) {
  background: #ff9500;
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(255, 128, 0, 0.4);
}
</style>
