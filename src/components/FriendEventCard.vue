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
  border-radius: 6px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  transition: all 0.2s ease;
  display: flex;
  flex-direction: column;
  cursor: pointer;
  width: 190px;
  min-width: 190px;
  aspect-ratio: 2 / 3;
  flex-shrink: 0;
  border: 1px solid #e5e7eb;
}

.friend-event-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.12);
  border-color: #1e3a8a;
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
  position: relative;
}

.event-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.user-info {
  padding: 0.625rem 0.75rem;
  display: flex;
  align-items: center;
  gap: 0.625rem;
  background: #f8f9fa;
  border-bottom: 2px solid #e5e7eb;
  flex-shrink: 0;
}

.profile-picture {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  object-fit: cover;
  border: 2px solid white;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.username {
  font-size: 0.688rem;
  font-weight: 700;
  color: #1e3a8a;
  text-transform: uppercase;
  letter-spacing: 0.3px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.event-teams {
  padding: 1rem 0.75rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
  flex-shrink: 0;
  background: white;
}

.team {
  font-size: 0.875rem;
  font-weight: 600;
  color: #1f2937;
  text-align: center;
  line-height: 1.3;
}

.vs {
  font-size: 0.75rem;
  color: #9ca3af;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 1px;
  font-family: Georgia, 'Times New Roman', serif;
}

.event-date {
  padding: 0.625rem 0.75rem;
  text-align: center;
  color: #6b7280;
  font-size: 0.75rem;
  flex-shrink: 0;
  border-top: 1px solid #e5e7eb;
  background: #fafbfc;
  line-height: 1.4;
}

@media (prefers-color-scheme: dark) {
  .friend-event-card {
    background: #1f2937;
    border-color: #374151;
  }

  .friend-event-card:hover {
    border-color: #60a5fa;
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

  .event-teams {
    background: #1f2937;
  }

  .team {
    color: #f9fafb;
  }

  .vs {
    color: #6b7280;
  }

  .event-date {
    background: #111827;
    border-top-color: #374151;
    color: #9ca3af;
  }
}
</style>

