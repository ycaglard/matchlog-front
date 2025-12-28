<script setup>
import { ref, watch } from 'vue'

const emit = defineEmits(['search', 'clear', 'input', 'select-event'])
const props = defineProps({
  suggestions: {
    type: Array,
    default: () => []
  },
  isLoadingSuggestions: {
    type: Boolean,
    default: false
  }
})

const searchQuery = ref('')
const showSuggestions = ref(false)
const selectedIndex = ref(-1)

// Watch for input changes and emit to parent for fetching suggestions
watch(searchQuery, (newValue) => {
  if (newValue.trim().length > 0) {
    emit('input', newValue.trim())
    showSuggestions.value = true
    selectedIndex.value = -1
  } else {
    showSuggestions.value = false
  }
})

const handleSearch = (query = null) => {
  const searchValue = query || searchQuery.value.trim()
  if (searchValue) {
    emit('search', searchValue)
    showSuggestions.value = false
  }
}

const handleClear = () => {
  searchQuery.value = ''
  showSuggestions.value = false
  selectedIndex.value = -1
  emit('clear')
}

const handleSuggestionClick = (suggestion) => {
  // Navigate to event detail page
  emit('select-event', suggestion.id)
  showSuggestions.value = false
  searchQuery.value = ''
}

const handleKeyDown = (event) => {
  if (!showSuggestions.value || props.suggestions.length === 0) {
    if (event.key === 'Enter') {
      handleSearch()
    }
    return
  }

  switch (event.key) {
    case 'ArrowDown':
      event.preventDefault()
      selectedIndex.value = Math.min(selectedIndex.value + 1, props.suggestions.length - 1)
      break
    case 'ArrowUp':
      event.preventDefault()
      selectedIndex.value = Math.max(selectedIndex.value - 1, -1)
      break
    case 'Enter':
      event.preventDefault()
      if (selectedIndex.value >= 0) {
        handleSuggestionClick(props.suggestions[selectedIndex.value])
      } else {
        handleSearch()
      }
      break
    case 'Escape':
      showSuggestions.value = false
      selectedIndex.value = -1
      break
  }
}

const closeSuggestions = () => {
  setTimeout(() => {
    showSuggestions.value = false
    selectedIndex.value = -1
  }, 200)
}

const formatDate = (date) => {
  if (!date) return ''
  const d = new Date(date)
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}
</script>

<template>
  <div class="search-bar">
    <div class="search-container">
      <input
        v-model="searchQuery"
        type="text"
        class="search-input"
        placeholder="Search matches by team name..."
        @keydown="handleKeyDown"
        @blur="closeSuggestions"
      />
      <button
        v-if="searchQuery"
        class="clear-button"
        @click="handleClear"
        aria-label="Clear search"
      >
        ✕
      </button>
      <button
        class="search-button"
        @click="() => handleSearch()"
        :disabled="!searchQuery.trim()"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          class="search-icon"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
          />
        </svg>
        Search
      </button>
      
      <!-- Suggestions Dropdown -->
      <div 
        v-if="showSuggestions && (suggestions.length > 0 || isLoadingSuggestions)" 
        class="suggestions-dropdown"
      >
        <div v-if="isLoadingSuggestions" class="suggestion-item loading">
          Searching...
        </div>
        <div
          v-else
          v-for="(suggestion, index) in suggestions"
          :key="suggestion.id"
          class="suggestion-item"
          :class="{ selected: index === selectedIndex }"
          @mousedown="handleSuggestionClick(suggestion)"
          @mouseenter="selectedIndex = index"
        >
          <div class="suggestion-content">
            <div class="suggestion-teams">
              <span class="team-name">{{ suggestion.homeTeam?.name }}</span>
              <span class="vs">vs</span>
              <span class="team-name">{{ suggestion.awayTeam?.name }}</span>
            </div>
            <div class="suggestion-meta">
              <span class="event-type">{{ suggestion.competition?.name }}</span>
              <span class="event-date">{{ formatDate(suggestion.utcDate) }}</span>
            </div>
          </div>
        </div>
        <div v-if="!isLoadingSuggestions && suggestions.length === 0" class="suggestion-item no-results">
          No matches found
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.search-bar {
  width: 100%;
  margin: 0;
  position: relative;
}

.search-container {
  position: relative;
  display: flex;
  align-items: center;
  background: rgba(255, 255, 255, 0.95);
  border-radius: 8px;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.1);
  overflow: visible;
  transition: box-shadow 0.3s ease;
  height: 40px;
}

.search-container:focus-within {
  box-shadow: 0 2px 8px rgba(255, 255, 255, 0.3);
  background: white;
}

.search-input {
  flex: 1;
  padding: 0.5rem 0.75rem;
  border: none;
  font-size: 0.875rem;
  outline: none;
  background: transparent;
  border-radius: 8px 0 0 8px;
  color: #000000;
}

.search-input::placeholder {
  color: #9ca3af;
  font-size: 0.875rem;
}

.clear-button {
  padding: 0.25rem 0.5rem;
  background: transparent;
  border: none;
  color: #6b7280;
  cursor: pointer;
  font-size: 1rem;
  transition: color 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
}

.clear-button:hover {
  color: #1e3a8a;
}

.search-button {
  display: flex;
  align-items: center;
  margin-right: 0.15rem;
  gap: 0.375rem;
  padding: 0.5rem 0.875rem;
  background: #1e3a8a;
  color: white;
  border: none;
  font-size: 0.875rem;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.3s ease;
  border-radius: 8px 8px 8px 8px;
  white-space: nowrap;
}

.search-button:hover:not(:disabled) {
  background: #1e40af;
}

.search-button:disabled {
  background: #9ca3af;
  cursor: not-allowed;
}

.search-icon {
  width: 1rem;
  height: 1rem;
}

/* Suggestions Dropdown */
.suggestions-dropdown {
  position: absolute;
  top: calc(100% + 0.5rem);
  left: 0;
  right: 0;
  background: white;
  border-radius: 8px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
  max-height: 350px;
  overflow-y: auto;
  z-index: 1000;
}

.suggestion-item {
  padding: 0.75rem 1rem;
  cursor: pointer;
  border-bottom: 1px solid #f3f4f6;
  transition: background 0.2s ease;
}

.suggestion-item:last-child {
  border-bottom: none;
}

.suggestion-item:hover,
.suggestion-item.selected {
  background: #eff6ff;
}

.suggestion-item.loading,
.suggestion-item.no-results {
  cursor: default;
  color: #6b7280;
  text-align: center;
  font-style: italic;
  font-size: 0.875rem;
}

.suggestion-item.loading:hover,
.suggestion-item.no-results:hover {
  background: white;
}

.suggestion-content {
  display: flex;
  flex-direction: column;
  gap: 0.375rem;
}

.suggestion-teams {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-weight: 600;
  color: #1e3a8a;
  font-size: 0.875rem;
}

.team-name {
  font-size: 0.875rem;
}

.vs {
  color: #6b7280;
  font-weight: 400;
  font-size: 0.75rem;
}

.suggestion-meta {
  display: flex;
  gap: 0.75rem;
  font-size: 0.75rem;
  color: #6b7280;
}

.event-type {
  font-weight: 500;
  color: #1e40af;
}

.event-date {
  color: #9ca3af;
}

@media (max-width: 768px) {
  .search-container {
    height: 38px;
  }

  .search-input {
    padding: 0.5rem;
    font-size: 0.813rem;
  }

  .search-input::placeholder {
    font-size: 0.813rem;
  }

  .search-button {
    padding: 0.5rem 0.75rem;
    font-size: 0.813rem;
  }

  .search-button span {
    display: none;
  }

  .search-icon {
    width: 0.875rem;
    height: 0.875rem;
  }

  .suggestion-item {
    padding: 0.625rem 0.75rem;
  }

  .suggestion-teams {
    font-size: 0.813rem;
  }

  .suggestion-meta {
    font-size: 0.688rem;
  }
}
</style>
