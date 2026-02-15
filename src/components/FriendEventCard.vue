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
  background: #1a1f29;
  border-radius: 6px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.3);
  overflow: hidden;
  transition: all 0.2s ease;
  display: flex;
  flex-direction: column;
  cursor: pointer;
  width: 190px;
  min-width: 190px;
  aspect-ratio: 2 / 3;
  flex-shrink: 0;
  border: 1px solid #2c3440;
}

.friend-event-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.4);
  border-color: #ff8000;
}

.event-image {
  width: 100%;
  flex: 1;
  min-height: 0;
  overflow: hidden;
  background: #2c3440;
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
  background: #14181c;
  border-bottom: 2px solid #2c3440;
  flex-shrink: 0;
}

.profile-picture {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  object-fit: cover;
  border: 2px solid #2c3440;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.3);
}

.username {
  font-size: 0.688rem;
  font-weight: 700;
  color: #ff8000;
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
  background: #1a1f29;
}

.team {
  font-size: 0.875rem;
  font-weight: 600;
  color: #cdd;
  text-align: center;
  line-height: 1.3;
}

.vs {
  font-size: 0.75rem;
  color: #678;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 1px;

}

.event-date {
  padding: 0.625rem 0.75rem;
  text-align: center;
  color: #9ab;
  font-size: 0.75rem;
  flex-shrink: 0;
  border-top: 1px solid #2c3440;
  background: #14181c;
  line-height: 1.4;
}


</style>

