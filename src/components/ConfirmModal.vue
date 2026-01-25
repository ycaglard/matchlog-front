<template>
  <div class="modal-overlay" @click.self="$emit('cancel')">
    <div class="modal-content">
      <div class="modal-header">
        <h2>{{ title }}</h2>
      </div>

      <div class="modal-body">
        <p>{{ message }}</p>
      </div>

      <div class="modal-actions">
        <button
          type="button"
          class="button button-secondary"
          @click="$emit('cancel')"
        >
          Cancel
        </button>
        <button
          type="button"
          :class="['button', `button-${confirmClass}`]"
          @click="$emit('confirm')"
        >
          {{ confirmText }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
defineProps({
  title: {
    type: String,
    required: true
  },
  message: {
    type: String,
    required: true
  },
  confirmText: {
    type: String,
    default: 'Confirm'
  },
  confirmClass: {
    type: String,
    default: 'primary',
    validator: (value) => ['primary', 'danger', 'warning'].includes(value)
  }
})

defineEmits(['confirm', 'cancel'])
</script>

<style scoped>
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
  max-width: 450px;
  width: 100%;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
}

.modal-header {
  padding: 24px 24px 16px;
}

.modal-header h2 {
  margin: 0;
  font-size: 20px;
  font-weight: 600;
  color: #2c3e50;
}

.modal-body {
  padding: 0 24px 24px;
}

.modal-body p {
  margin: 0;
  color: #657786;
  line-height: 1.5;
}

.modal-actions {
  display: flex;
  gap: 12px;
  justify-content: flex-end;
  padding: 16px 24px;
  border-top: 1px solid #e1e8ed;
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

.button-secondary {
  background: #f0f4f8;
  color: #2c3e50;
}

.button-secondary:hover {
  background: #e1e8ed;
}

.button-primary {
  background: #42b983;
  color: white;
}

.button-primary:hover {
  background: #38a374;
}

.button-danger {
  background: #e53e3e;
  color: white;
}

.button-danger:hover {
  background: #c53030;
}

.button-warning {
  background: #ed8936;
  color: white;
}

.button-warning:hover {
  background: #dd6b20;
}
</style>
