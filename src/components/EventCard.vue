<template>
  <div class="event-card" @click="$emit('viewDetails', event)">
    <div class="event-image">
      <img :src="getEventImage()" :alt="`${getTeamNames()}`" />
    </div>
    <div class="event-teams">
      <span class="team">{{ event.match?.home?.name || 'TBD' }}</span>
      <span class="vs">vs</span>
      <span class="team">{{ event.match?.away?.name || 'TBD' }}</span>
    </div>
    <div class="event-type-badge">{{ event.eventType || 'Event' }}</div>
    <div class="event-date">
      {{ formatDate(event.date) }}
    </div>
    <div v-if="event.commentCount !== undefined" class="event-comments">
      💬 {{ event.commentCount }} {{ event.commentCount === 1 ? 'comment' : 'comments' }}
    </div>
  </div>
</template>

<script setup>
const props = defineProps({
  event: {
    type: Object,
    required: true
  }
})

defineEmits(['viewDetails'])

const formatDate = (dateString) => {
  if (!dateString) return 'No date'
  const date = new Date(dateString)
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

const getTeamNames = () => {
  const home = props.event.match?.home?.name || 'TBD'
  const away = props.event.match?.away?.name || 'TBD'
  return `${home} vs ${away}`
}

const getEventImage = () => {
  // Default placeholder image based on event type
  const eventType = props.event.eventType || 'default'
  const imageMap = {
    'LEAGUE': 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=800&h=600&fit=crop',
    'TOURNAMENT': 'https://images.unsplash.com/photo-1551958219-acbc608c6377?w=800&h=600&fit=crop',
    'FRIENDLY': 'https://images.unsplash.com/photo-1534158914592-062992fbe900?w=800&h=600&fit=crop',
    'CHAMPIONSHIP': 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800&h=600&fit=crop',
    'default': 'https://images.unsplash.com/photo-1551698618-1dfe5d97d256?w=800&h=600&fit=crop'
  }
  return imageMap[eventType.toUpperCase()] || imageMap['default']
}
</script>

<style scoped>
.event-card {
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  transition: all 0.3s ease;
  display: flex;
  flex-direction: column;
  cursor: pointer;
  width: 175px;
  min-width: 175px;
  aspect-ratio: 2 / 3;
  flex-shrink: 0;
}

.event-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.15);
}

.event-image {
  width: 100%;
  flex: 1;
  min-height: 0;
  overflow: hidden;
  background: #f3f4f6;
  display: flex;
  align-items: center;
  justify-content: center;
}

.event-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.event-teams {
  padding: 0.875rem 0.625rem;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  flex-wrap: wrap;
  flex-shrink: 0;
}

.team {
  font-size: 0.875rem;
  font-weight: 700;
  color: #1e3a8a;
}

.vs {
  font-size: 0.625rem;
  color: #6b7280;
  font-weight: 500;
  text-transform: lowercase;
}

.event-type-badge {
  padding: 0.25rem 0.5rem;
  text-align: center;
  font-size: 0.625rem;
  font-weight: 600;
  color: #1e3a8a;
  background: #dbeafe;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  flex-shrink: 0;
}

.event-date {
  padding: 0.5rem 0.625rem;
  text-align: center;
  color: #6b7280;
  font-size: 0.75rem;
  flex-shrink: 0;
  border-top: 1px solid #e5e7eb;
}

.event-comments {
  padding: 0.5rem 0.625rem 0.875rem;
  text-align: center;
  color: #6b7280;
  font-size: 0.75rem;
  flex-shrink: 0;
}

@media (prefers-color-scheme: dark) {
  .event-card {
    background: #1f2937;
  }

  .event-image {
    background: #111827;
  }

  .team {
    color: #60a5fa;
  }

  .vs {
    color: #9ca3af;
  }

  .event-type-badge {
    background: #1e3a8a;
    color: #dbeafe;
  }

  .event-date,
  .event-comments {
    color: #9ca3af;
  }

  .event-date {
    border-top-color: #374151;
  }
}
</style>

