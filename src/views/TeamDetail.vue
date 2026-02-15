<template>
  <div class="team-detail">
    <div v-if="loading" class="loading-container">
      <div class="loading-spinner"></div>
      <p>Loading team details...</p>
    </div>

    <div v-else-if="error" class="error-container">
      <h2>Error Loading Team</h2>
      <p>{{ error }}</p>
      <button @click="$router.push('/')" class="back-button">Back to Home</button>
    </div>

    <div v-else-if="team" class="team-content">
      <!-- Hero Header -->
      <div class="team-hero" :style="heroStyle">
        <div class="hero-background">
          <img v-if="team.crest" :src="team.crest" :alt="team.name" class="hero-crest" />
        </div>
        <div class="hero-content">
          <h1 class="team-name">{{ team.name }}</h1>
          <p v-if="team.shortName" class="team-subtitle">{{ team.shortName }} • {{ team.tla }}</p>
          <div class="hero-meta">
            <span v-if="team.founded" class="meta-badge">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                <path d="M8 1a7 7 0 100 14A7 7 0 008 1zm0 12.5A5.5 5.5 0 1113.5 8 5.506 5.506 0 018 13.5z"/>
                <path d="M8 4v4.5l3 1.5"/>
              </svg>
              Founded {{ team.founded }}
            </span>
            <span v-if="team.venue" class="meta-badge">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                <path d="M8 1L2 6v8h12V6L8 1zm4 12H4V6.5L8 3l4 3.5V13z"/>
              </svg>
              {{ team.venue }}
            </span>
            <span v-if="team.clubColors" class="meta-badge">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                <path d="M4 2h8a2 2 0 012 2v8a2 2 0 01-2 2H4a2 2 0 01-2-2V4a2 2 0 012-2z"/>
              </svg>
              {{ team.clubColors }}
            </span>
          </div>
        </div>
      </div>

      <!-- Main Content Area -->
      <div class="content-wrapper">
        <!-- First Row: Manager, Location, and Official Website -->
        <div class="info-row">
          <!-- Manager Card -->
          <section v-if="team.coach" class="info-card">
            <div class="section-header">
              <h2 :style="{ color: teamColors.primary }">Manager</h2>
              <div class="section-divider" :style="{ background: teamColors.primary }"></div>
            </div>
            <div class="coach-profile">
              <h3 class="coach-name" :style="{ color: teamColors.primary }">{{ team.coach.name }}</h3>
              <div class="profile-details">
                <div v-if="team.coach.nationality" class="detail-row">
                  <span class="detail-label">Nationality</span>
                  <span class="detail-value">{{ team.coach.nationality }}</span>
                </div>
                <div v-if="team.coach.dateOfBirth" class="detail-row">
                  <span class="detail-label">Date of Birth</span>
                  <span class="detail-value">{{ formatDate(team.coach.dateOfBirth) }}</span>
                </div>
                <div v-if="team.coach.contract" class="detail-row contract-row">
                  <span class="detail-label">Contract Period</span>
                  <span class="detail-value">{{ formatDate(team.coach.contract.start) }} — {{ formatDate(team.coach.contract.until) }}</span>
                </div>
              </div>
            </div>
          </section>

          <!-- Location Card -->
          <section v-if="team.area" class="info-card">
            <div class="section-header">
              <h2 :style="{ color: teamColors.primary }">Location</h2>
              <div class="section-divider" :style="{ background: teamColors.primary }"></div>
            </div>
            <div class="location-content">
              <img v-if="team.area.flag" :src="team.area.flag" :alt="team.area.name" class="flag-image" />
              <div class="location-info">
                <p class="location-name">{{ team.area.name }}</p>
                <p v-if="team.address" class="location-address">{{ team.address }}</p>
              </div>
            </div>
          </section>

          <!-- Official Website Card -->
          <section v-if="team.website" class="info-card website-card" :style="heroStyle">
            <div class="section-header">
              <h2 class="sidebar-title">Official Website</h2>
              <div class="section-divider" :style="{ background: 'rgba(255, 255, 255, 0.3)' }"></div>
            </div>
            <a :href="team.website" target="_blank" class="website-button" :style="{ color: teamColors.primary }">
              Visit Website
              <svg width="12" height="16" viewBox="0 0 12 12" fill="currentColor">
                <path d="M9 2L13 6L9 10M3 6h10"/>
              </svg>
            </a>
          </section>
        </div>

        <!-- Upcoming Matches Section - Full Width -->
        <section v-if="upcomingMatches.length > 0 || loadingMatches" class="content-section matches-section-full">
          <div class="section-header">
            <h2 :style="{ color: teamColors.primary }">Upcoming Matches</h2>
            <span class="matches-count" :style="{ color: teamColors.primary }">{{ upcomingMatches.length }} Matches</span>
            <div class="section-divider" :style="{ background: teamColors.primary }"></div>
          </div>
          <div v-if="loadingMatches" class="matches-loading">
            <div class="loading-spinner-small"></div>
            <p>Loading matches...</p>
          </div>
          <div v-else class="matches-grid">
            <MatchCard
              v-for="match in upcomingMatches"
              :key="match.id"
              :match="match"
              @viewDetails="handleViewMatchDetails"
            />
          </div>
        </section>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useTeamClient } from '../clients/teamClient.js'
import MatchCard from '../components/MatchCard.vue'

const route = useRoute()
const router = useRouter()
const { loading, error, getTeamById, getUpcomingMatchesByTeamId } = useTeamClient()

const team = ref(null)
const upcomingMatches = ref([])
const loadingMatches = ref(false)

// Extract team colors for dynamic theming
const teamColors = computed(() => {
  if (!team.value?.clubColors) return { primary: '#1e3a8a', secondary: '#2563eb' }
  
  const colors = team.value.clubColors.toLowerCase()
  const colorMap = {
    'red': '#dc2626',
    'blue': '#2563eb',
    'green': '#16a34a',
    'yellow': '#eab308',
    'orange': '#ea580c',
    'purple': '#9333ea',
    'black': '#1f2937',
    'white': '#f9fafb',
    'gold': '#f59e0b',
    'silver': '#9ca3af',
    'navy': '#1e3a8a',
    'sky blue': '#0ea5e9',
    'light blue': '#3b82f6',
    'dark blue': '#1e40af',
    'royal blue': '#2563eb',
    'maroon': '#991b1b',
    'burgundy': '#991b1b',
    'crimson': '#dc2626',
    'pink': '#ec4899',
    'brown': '#92400e',
    'grey': '#6b7280',
    'gray': '#6b7280'
  }
  
  // Extract first two colors
  let primaryColor = '#1e3a8a'
  let secondaryColor = '#2563eb'
  
  for (const [colorName, colorValue] of Object.entries(colorMap)) {
    if (colors.includes(colorName)) {
      primaryColor = colorValue
      break
    }
  }
  
  // Find secondary color (skip the first match)
  let foundFirst = false
  for (const [colorName, colorValue] of Object.entries(colorMap)) {
    if (colors.includes(colorName)) {
      if (foundFirst && colorValue !== primaryColor) {
        secondaryColor = colorValue
        break
      }
      foundFirst = true
    }
  }
  
  // If secondary is same as primary, create a lighter/darker variant
  if (secondaryColor === primaryColor) {
    secondaryColor = adjustColor(primaryColor, 20)
  }
  
  return { primary: primaryColor, secondary: secondaryColor }
})

// Helper function to adjust color brightness
const adjustColor = (color, percent) => {
  const num = parseInt(color.replace('#', ''), 16)
  const amt = Math.round(2.55 * percent)
  const R = (num >> 16) + amt
  const G = (num >> 8 & 0x00FF) + amt
  const B = (num & 0x0000FF) + amt
  return '#' + (
    0x1000000 +
    (R < 255 ? (R < 1 ? 0 : R) : 255) * 0x10000 +
    (G < 255 ? (G < 1 ? 0 : G) : 255) * 0x100 +
    (B < 255 ? (B < 1 ? 0 : B) : 255)
  ).toString(16).slice(1)
}

const heroStyle = computed(() => ({
  background: `linear-gradient(135deg, ${teamColors.value.primary} 0%, ${teamColors.value.secondary} 100%)`
}))

const loadTeam = async (teamId) => {
  if (teamId) {
    team.value = null
    error.value = null
    team.value = await getTeamById(teamId)
    if (!team.value) {
      error.value = 'Team not found'
    } else {
      // Load upcoming matches for this team
      await loadUpcomingMatches(teamId)
    }
  }
}

const loadUpcomingMatches = async (teamId) => {
  if (teamId) {
    loadingMatches.value = true
    try {
      upcomingMatches.value = await getUpcomingMatchesByTeamId(teamId)
    } catch (err) {
      console.error('Error loading upcoming matches:', err)
    } finally {
      loadingMatches.value = false
    }
  }
}

const handleViewMatchDetails = (match) => {
  router.push(`/match/${match.id}`)
}

onMounted(async () => {
  await loadTeam(route.params.id)
})

// Watch for route parameter changes to reload team data
watch(() => route.params.id, async (newId) => {
  if (newId) {
    await loadTeam(newId)
  }
})

const formatDate = (date) => {
  if (!date) return ''
  const d = new Date(date)
  return d.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
}

const calculateAge = (dateOfBirth) => {
  if (!dateOfBirth) return ''
  const today = new Date()
  const birthDate = new Date(dateOfBirth)
  let age = today.getFullYear() - birthDate.getFullYear()
  const monthDiff = today.getMonth() - birthDate.getMonth()
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--
  }
  return age
}
</script>

<style scoped>
.team-detail {
  width: 100%;
  margin: 0;
  padding: 0;
  background: #14181c;
  min-height: 100vh;
}

.loading-container,
.error-container {
  text-align: center;
  padding: 4rem 2rem;
  background: #1a1f29;
  margin: 2rem;
  border-radius: 8px;
}

.loading-spinner {
  width: 50px;
  height: 50px;
  border: 4px solid #2c3440;
  border-top: 4px solid #ff8000;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto 1rem;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.error-container h2 {
  color: #ff8000;
  margin-bottom: 1rem;
}

.back-button {
  margin-top: 1rem;
  padding: 0.75rem 1.5rem;
  background: #ff8000;
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 600;
  font-size: 0.938rem;
}

.back-button:hover {
  background: #ff9500;
}

/* Hero Header - Classic Banner Style */
.team-hero {
  position: relative;
  background: #2c3440;
  color: white;
  padding: 3rem 2rem;
  overflow: hidden;
}

.hero-background {
  position: absolute;
  opacity: 1;
  top: 0;
  right: 0;
  bottom: 0;
  width: 50%;
  display: flex;
  align-items: center;
  justify-content: flex-end;
  pointer-events: none;
}

.hero-crest {
  width: 280px;
  height: 280px;
  object-fit: contain;
  filter: drop-shadow(0 10px 30px rgba(0, 0, 0, 0.3));
  transform: translateX(20px);
}

.hero-content {
  position: relative;
  z-index: 1;
  max-width: 1200px;
  margin: 0 auto;
}

.team-name {
  font-size: 3rem;
  font-weight: 700;
  margin: 0 0 0.5rem 0;
  letter-spacing: -0.5px;
  line-height: 1.1;
}

.team-subtitle {
  font-size: 1.25rem;
  margin: 0 0 1.5rem 0;
  opacity: 0.9;
  font-weight: 300;
  letter-spacing: 0.5px;
}

.hero-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
}

.meta-badge {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  background: rgba(255, 255, 255, 0.15);
  border-radius: 50px;
  font-size: 0.938rem;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.meta-badge svg {
  opacity: 0.9;
}

/* Content Wrapper - New Layout */
.content-wrapper {
  max-width: 1400px;
  width: 100%;
  margin: 0 auto;
  padding: 1.5rem 2rem;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

/* First Row - Manager, Location, Website */
.info-row {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1.25rem;
}

.info-card {
  background: #1a1f29;
  border-radius: 6px;
  padding: 1rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.3);
}

/* Main Column */
.main-column {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.content-section {
  background: #1a1f29;
  border-radius: 8px;
  padding: 2rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.3);
}

/* Section Headers - Classic Typography */
.section-header {
  position: relative;
  margin-bottom: 1rem;
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.section-header h2 {
  font-size: 1.125rem;
  font-weight: 700;
  color: #ff8000;
  margin: 0;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.squad-count {
  font-size: 0.875rem;
  color: #9ab;
  font-weight: 500;
}

.section-divider {
  flex: 1;
  height: 2px;
  background: linear-gradient(to right, #ff8000, transparent);
}

/* Competition Details */
.competition-details {
  line-height: 1.8;
}

.competition-name {
  font-size: 1.5rem;
  font-weight: 600;
  color: #1f2937;
  margin: 0 0 0.5rem 0;
}

.competition-code {
  color: #6b7280;
  font-size: 0.938rem;
  margin: 0 0 1.5rem 0;
  font-weight: 500;
}

.season-details {
  border-left: 3px solid #ff8000;
  padding-left: 1rem;
}

.detail-row {
  display: flex;
  justify-content: space-between;
  padding: 0.5rem 0;
  border-bottom: 1px solid #2c3440;
}

.detail-row:last-child {
  border-bottom: none;
}

.detail-label {
  font-weight: 600;
  color: #9ab;
  font-size: 0.813rem;
}

.detail-value {
  color: #cdd;
  font-size: 0.813rem;
}

/* Coach Profile */
.coach-profile {
  line-height: 1.6;
}

.coach-name {
  font-size: 1.25rem;
  font-weight: 600;
  color: #cdd;
  margin: 0 0 0.75rem 0;
}

.profile-details {
  display: flex;
  flex-direction: column;
  gap: 0;
}

.contract-row {
  margin-top: 0.5rem;
  padding-top: 1.5rem;
  border-top: 2px solid #2c3440;
}

/* Squad List - Classic Table-like Layout */
.squad-list {
  display: flex;
  flex-direction: column;
}

.player-row {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  border-bottom: 1px solid #2c3440;
  transition: background-color 0.2s ease;
}

.player-row:hover {
  background-color: #14181c;
}

.player-row:last-child {
  border-bottom: none;
}

.player-number-badge {
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #ff8000;
  color: white;
  border-radius: 4px;
  font-size: 1.125rem;
  font-weight: 700;
  flex-shrink: 0;
}

.player-details-row {
  flex: 1;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;
  min-width: 0;
}

.player-main {
  display: flex;
  align-items: baseline;
  gap: 0.75rem;
  min-width: 0;
  flex: 1;
}

.player-name-text {
  font-size: 1rem;
  font-weight: 600;
  color: #cdd;
  margin: 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.player-position-text {
  font-size: 0.875rem;
  color: #ff8000;
  font-weight: 500;
  white-space: nowrap;
}

.player-meta {
  display: flex;
  gap: 1rem;
  font-size: 0.875rem;
  color: #9ab;
  flex-shrink: 0;
}

.player-nationality-text,
.player-age-text {
  white-space: nowrap;
}

.sidebar-title {
  font-size: 0.75rem;
  font-weight: 700;
  color: #9ab;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin: 0 0 0.75rem 0;
}

/* Location Card */
.location-content {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.flag-image {
  width: 100%;
  height: 80px;
  object-fit: contain;
  border-radius: 4px;
  background: #14181c;
}

.location-info {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.location-name {
  font-size: 1rem;
  font-weight: 600;
  color: #cdd;
  margin: 0;
}

.location-address {
  font-size: 0.813rem;
  color: #9ab;
  line-height: 1.5;
  margin: 0;
}

/* Matches Section - Full Width */
.matches-section-full {
  background: #1a1f29;
  border-radius: 6px;
  padding: 1.5rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.3);
}

.matches-section {
  margin-bottom: 2rem;
}

.matches-count {
  font-size: 0.938rem;
  font-weight: 500;
  margin-left: auto;
  padding: 0.25rem 0.75rem;
  background: rgba(255, 128, 0, 0.15);
  border-radius: 12px;
  color: #ff8000;
}

.matches-loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 3rem;
  gap: 1rem;
}

.loading-spinner-small {
  width: 40px;
  height: 40px;
  border: 3px solid #2c3440;
  border-top: 3px solid #ff8000;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

.matches-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
  gap: 1.5rem;
  padding: 0.5rem 0;
}

/* Website Card */
.website-card {
  background: #2c3440;
  color: white;
}

.website-card .section-header h2,
.website-card .sidebar-title {
  color: rgba(255, 255, 255, 0.9);
}

.website-button {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  width: 100%;
  padding: 0.625rem;
  background: #ff8000;
  color: white;
  border-radius: 4px;
  text-decoration: none;
  font-weight: 600;
  font-size: 0.813rem;
  transition: all 0.2s ease;
}

.website-button:hover {
  background: #ff9500;
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.4);
}

/* Responsive Design */
@media (max-width: 1024px) {
  .content-wrapper {
    padding: 1.5rem;
  }

  .info-row {
    grid-template-columns: 1fr;
    gap: 1.5rem;
  }

  .matches-grid {
    grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
    gap: 1rem;
  }
}

@media (max-width: 768px) {
  .team-hero {
    padding: 2rem 1rem;
  }

  .team-name {
    font-size: 2rem;
  }

  .team-subtitle {
    font-size: 1rem;
  }

  .hero-background {
    width: 70%;
  }

  .hero-crest {
    width: 200px;
    height: 200px;
  }

  .content-wrapper {
    padding: 1rem;
    gap: 1rem;
  }

  .content-section {
    padding: 1.5rem;
  }

  .section-header h2 {
    font-size: 1.25rem;
  }

  .info-card {
    padding: 1.25rem;
  }

  .player-row {
    padding: 0.75rem;
  }

  .player-details-row {
    flex-direction: column;
    align-items: flex-start;
  }

  .player-meta {
    padding-left: 0;
  }

  .detail-row {
    flex-direction: column;
    gap: 0.25rem;
    align-items: flex-start;
  }

  .matches-grid {
    grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
    gap: 1rem;
  }
}

@media (max-width: 480px) {
  .team-name {
    font-size: 1.75rem;
  }

  .hero-meta {
    flex-direction: column;
  }

  .meta-badge {
    font-size: 0.813rem;
  }

  .player-main {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.25rem;
  }
}
</style>
