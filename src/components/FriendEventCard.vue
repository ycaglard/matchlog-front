<template>
  <div class="friend-event-card" @click="$emit('viewDetails', event)">
    <div class="event-image">
      <img :src="event.image" :alt="`${event.team1} vs ${event.team2}`" />
    </div>
    <div class="user-info">
      <img :src="event.user.profilePicture" :alt="event.user.name" class="profile-picture" />
      <span class="username">{{ event.user.name }}</span>
    </div>
    <div class="event-teams">
      <span class="team">{{ event.team1 }}</span>
      <span class="vs">vs</span>
      <span class="team">{{ event.team2 }}</span>
    </div>
    <div class="event-date">
      {{ formatDate(event.date) }}
    </div>
  </div>
</template>

<script setup>
defineProps({
  event: {
    type: Object,
    required: true
  }
})

defineEmits(['viewDetails'])

const formatDate = (dateString) => {
  const date = new Date(dateString)
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}
</script>

<style scoped>
.friend-event-card {
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

.friend-event-card:hover {
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

.user-info {
  padding: 0.5rem 0.625rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background: #f9fafb;
  border-bottom: 1px solid #e5e7eb;
  flex-shrink: 0;
}

.profile-picture {
  width: 22px;
  height: 22px;
  border-radius: 50%;
  object-fit: cover;
  border: 1px solid #e5e7eb;
}

.username {
  font-size: 0.625rem;
  font-weight: 600;
  color: #1e3a8a;
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

.event-date {
  padding: 0.5rem 0.625rem 0.875rem;
  text-align: center;
  color: #6b7280;
  font-size: 0.75rem;
  flex-shrink: 0;
}

@media (prefers-color-scheme: dark) {
  .friend-event-card {
    background: #1f2937;
  }

  .event-image {
    background: #111827;
  }

  .user-info {
    background: #111827;
    border-bottom-color: #374151;
  }

  .profile-picture {
    border-color: #374151;
  }

  .username {
    color: #60a5fa;
  }

  .team {
    color: #60a5fa;
  }

  .vs {
    color: #9ca3af;
  }

  .event-date {
    color: #9ca3af;
  }
}
</style>

