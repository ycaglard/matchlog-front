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
  background: white;
  border-radius: 6px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  transition: all 0.2s ease;
  display: flex;
  flex-direction: column;
  cursor: pointer;
  width: 220px;
  min-width: 220px;
  flex-shrink: 0;
  border: 1px solid #e5e7eb;
}

.match-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.12);
  border-color: #1e3a8a;
}

.match-image {
  width: 100%;
  height: 90px;
  background: linear-gradient(135deg, #1e3a8a 0%, #2563eb 100%);
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
  font-family: Georgia, 'Times New Roman', serif;
}

.match-competition {
  padding: 0.625rem 0.75rem;
  text-align: center;
  font-size: 0.688rem;
  font-weight: 700;
  color: #1e3a8a;
  background: #f8f9fa;
  border-bottom: 2px solid #e5e7eb;
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
  background: white;
}

.team-info {
  display: flex;
  align-items: center;
  gap: 0.625rem;
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
  color: #1f2937;
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.score-divider {
  text-align: center;
  padding: 0.375rem 0;
  border-top: 1px solid #f3f4f6;
  border-bottom: 1px solid #f3f4f6;
}

.score {
  font-size: 1.125rem;
  font-weight: 700;
  color: #1e3a8a;
  font-family: Georgia, 'Times New Roman', serif;
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
  background: #dbeafe;
  color: #1e40af;
}

.status-live {
  background: #fee2e2;
  color: #991b1b;
  animation: pulse 2s infinite;
}

.status-finished {
  background: #d1fae5;
  color: #065f46;
}

.status-default {
  background: #f3f4f6;
  color: #6b7280;
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
  color: #6b7280;
  font-size: 0.75rem;
  flex-shrink: 0;
  border-top: 1px solid #e5e7eb;
  background: #fafbfc;
  line-height: 1.4;
}

.match-comments {
  padding: 0.5rem 0.75rem;
  text-align: center;
  color: #6b7280;
  font-size: 0.75rem;
  flex-shrink: 0;
  font-weight: 500;
}

@media (prefers-color-scheme: dark) {
  .match-card {
    background: #1f2937;
    border-color: #374151;
  }

  .match-card:hover {
    border-color: #60a5fa;
  }

  .match-competition {
    background: #111827;
    border-bottom-color: #374151;
    color: #60a5fa;
  }

  .match-teams {
    background: #1f2937;
  }

  .team-name {
    color: #f9fafb;
  }

  .score {
    color: #60a5fa;
  }

  .match-date {
    background: #111827;
    border-top-color: #374151;
    color: #9ca3af;
  }

  .match-comments {
    color: #9ca3af;
  }
}
</style>
