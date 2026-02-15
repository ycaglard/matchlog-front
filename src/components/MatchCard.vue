<template>
  <div class="match-card" @click="$emit('viewDetails', match)">
    <div class="match-image">
      <img v-if="match.competition?.emblem" :src="match.competition.emblem" :alt="match.competition?.name" class="competition-emblem" />
      <div v-else class="placeholder-emblem">{{ match.competition?.code || '?' }}</div>
    </div>
    <div class="match-competition">
      {{ match.competition?.name || 'Competition' }}
    </div>
    <div class="match-teams">
      <div class="team-info">
        <img v-if="match.homeTeam?.crest" :src="match.homeTeam.crest" :alt="match.homeTeam?.name" class="team-crest" />
        <span class="team-name">{{ match.homeTeam?.shortName || match.homeTeam?.name || 'TBD' }}</span>
      </div>
      <div class="score-divider">
        <span class="score">{{ getScoreDisplay() }}</span>
      </div>
      <div class="team-info">
        <img v-if="match.awayTeam?.crest" :src="match.awayTeam.crest" :alt="match.awayTeam?.name" class="team-crest" />
        <span class="team-name">{{ match.awayTeam?.shortName || match.awayTeam?.name || 'TBD' }}</span>
      </div>
    </div>
    <div class="match-status-badge" :class="getStatusClass()">
      {{ match.status || 'SCHEDULED' }}
    </div>
    <div class="match-date">
      {{ formatDate(match.utcDate) }}
    </div>
    <div v-if="match.comments && match.comments.length > 0" class="match-comments">
      💬 {{ match.comments.length }} {{ match.comments.length === 1 ? 'comment' : 'comments' }}
    </div>
  </div>
</template>

<script setup>
const props = defineProps({
  match: {
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

const getScoreDisplay = () => {
  if (!props.match.score || !props.match.score.fullTime) {
    return 'vs'
  }
  const home = props.match.score.fullTime.home
  const away = props.match.score.fullTime.away
  if (home === null || away === null) {
    return 'vs'
  }
  return `${home} - ${away}`
}

const getStatusClass = () => {
  const status = props.match.status?.toUpperCase()
  if (['FINISHED'].includes(status)) return 'status-finished'
  if (['IN_PLAY', 'PAUSED'].includes(status)) return 'status-live'
  if (['SCHEDULED', 'TIMED'].includes(status)) return 'status-scheduled'
  return 'status-default'
}
</script>

<style scoped>
.match-card {
  background: #1a1f29;
  border-radius: 6px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.3);
  overflow: hidden;
  transition: all 0.2s ease;
  display: flex;
  flex-direction: column;
  cursor: pointer;
  width: 220px;
  min-width: 220px;
  flex-shrink: 0;
  border: 1px solid #2c3440;
}

.match-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.4);
  border-color: #ff8000;
}

.match-image {
  width: 100%;
  height: 90px;
  background: #2c3440;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  position: relative;
}

.competition-emblem {
  height: 55px;
  width: auto;
  object-fit: contain;
  filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.2));
}

.placeholder-emblem {
  font-size: 2rem;
  font-weight: 700;
  color: white;
}

.match-competition {
  padding: 0.625rem 0.75rem;
  text-align: center;
  font-size: 0.688rem;
  font-weight: 700;
  color: #ff8000;
  background: #14181c;
  border-bottom: 2px solid #2c3440;
  flex-shrink: 0;
  min-height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  line-height: 1.3;
}

.match-teams {
  padding: 1.25rem 1rem;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  flex-shrink: 0;
  background: #1a1f29;
}

.team-info {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
}

.team-crest {
  width: 22px;
  height: 22px;
  object-fit: contain;
  flex-shrink: 0;
}

.team-name {
  font-size: 0.875rem;
  font-weight: 600;
  color: #cdd;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.score-divider {
  text-align: center;
  padding: 0.375rem 0;
  border-top: 1px solid #2c3440;
  border-bottom: 1px solid #2c3440;
}

.score {
  font-size: 1.125rem;
  font-weight: 700;
  color: #ff8000;
}

.match-status-badge {
  padding: 0.375rem 0.75rem;
  text-align: center;
  font-size: 0.625rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.75px;
  flex-shrink: 0;
}

.status-scheduled {
  background: rgba(255, 128, 0, 0.15);
  color: #ff8000;
}

.status-live {
  background: rgba(255, 128, 0, 0.1);
  color: #ff8000;
  animation: pulse 2s infinite;
}

.status-finished {
  background: rgba(0, 220, 130, 0.15);
  color: #00dc82;
}

.status-default {
  background: #2c3440;
  color: #9ab;
}

@keyframes pulse {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.7;
  }
}

.match-date {
  padding: 0.625rem 0.75rem;
  text-align: center;
  color: #9ab;
  font-size: 0.75rem;
  flex-shrink: 0;
  border-top: 1px solid #2c3440;
  background: #14181c;
  line-height: 1.4;
}

.match-comments {
  padding: 0.5rem 0.75rem;
  text-align: center;
  color: #9ab;
  font-size: 0.75rem;
  flex-shrink: 0;
  font-weight: 500;
}


</style>
