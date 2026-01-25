<script setup>
import { ref, onMounted, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import MatchCard from '../components/MatchCard.vue'
import FriendEventCard from '../components/FriendEventCard.vue'
import NewsCard from '../components/NewsCard.vue'
import { useMatchClient, searchMatchesLocal } from '../clients/matchClient.js'

const router = useRouter()
const route = useRoute()

// Matches data from backend
const matches = ref([])
const isSearchActive = ref(false)
const searchedTeamName = ref('')

// Initialize match client with loading and error states
const { loading, error, getTodayMatches } = useMatchClient()

// Fetch matches from backend on component mount
onMounted(async () => {
  // Check if there's a team query parameter from navbar search
  if (route.query.team) {
    await handleSearch(route.query.team)
  } else {
    await loadTodayMatches()
  }
})

// Watch for route query changes (from navbar search)
watch(() => route.query.team, (teamName) => {
  if (teamName) {
    handleSearch(teamName)
  } else {
    loadTodayMatches()
  }
})

// Load today's matches
const loadTodayMatches = async () => {
  try {
    // Use the dedicated today endpoint
    const matchesData = await getTodayMatches()
    matches.value = matchesData
    isSearchActive.value = false
    searchedTeamName.value = ''
    console.log('Matches loaded from backend (today):', matchesData)
  } catch (err) {
    console.error('Failed to fetch matches:', err)
  }
}

// Handle search by team name (client-side filtering since API requires team ID)
const handleSearch = async (teamName) => {
  try {
    // First load all today's matches
    const allMatches = await getTodayMatches()
    // Then filter client-side by team name
    const filteredMatches = searchMatchesLocal(allMatches, teamName)
    matches.value = filteredMatches
    isSearchActive.value = true
    searchedTeamName.value = teamName
    console.log('Matches loaded for team:', teamName, filteredMatches)
  } catch (err) {
    console.error('Failed to search matches:', err)
  }
}

// Friend-logged events data
const friendEvents = ref([
  {
    id: 101,
    image: 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=800&h=600&fit=crop',
    team1: 'Chelsea',
    team2: 'Arsenal',
    date: '2024-12-18T20:00:00',
    user: {
      name: 'John Smith',
      profilePicture: 'https://i.pravatar.cc/150?img=12'
    }
  },
  {
    id: 102,
    image: 'https://images.unsplash.com/photo-1551958219-acbc608c6377?w=800&h=600&fit=crop',
    team1: 'Dodgers',
    team2: 'Giants',
    date: '2024-12-14T19:30:00',
    user: {
      name: 'Sarah Johnson',
      profilePicture: 'https://i.pravatar.cc/150?img=47'
    }
  },
  {
    id: 103,
    image: 'https://images.unsplash.com/photo-1534158914592-062992fbe900?w=800&h=600&fit=crop',
    team1: 'Patriots',
    team2: 'Bills',
    date: '2024-12-16T17:00:00',
    user: {
      name: 'Mike Davis',
      profilePicture: 'https://i.pravatar.cc/150?img=33'
    }
  },
  {
    id: 104,
    image: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800&h=600&fit=crop',
    team1: 'Rockets',
    team2: 'Spurs',
    date: '2024-12-13T21:00:00',
    user: {
      name: 'Emily Chen',
      profilePicture: 'https://i.pravatar.cc/150?img=68'
    }
  },
  {
    id: 105,
    image: 'https://images.unsplash.com/photo-1551698618-1dfe5d97d256?w=800&h=600&fit=crop',
    team1: 'Packers',
    team2: 'Vikings',
    date: '2024-12-17T18:30:00',
    user: {
      name: 'David Wilson',
      profilePicture: 'https://i.pravatar.cc/150?img=51'
    }
  },
  {
    id: 106,
    image: 'https://images.unsplash.com/photo-1551698618-1dfe5d97d256?w=800&h=600&fit=crop',
    team1: 'Bruins',
    team2: 'Maple Leafs',
    date: '2024-12-19T20:30:00',
    user: {
      name: 'Lisa Anderson',
      profilePicture: 'https://i.pravatar.cc/150?img=45'
    }
  }
])

// Tournament news data
const tournamentNews = ref([
  {
    id: 201,
    title: 'Champions League Finals Set for Next Month',
    excerpt: 'The highly anticipated Champions League finals have been scheduled for next month, featuring the top teams from across Europe competing for the prestigious title.',
    image: 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=800&h=600&fit=crop',
    date: '2024-12-10T10:00:00',
    category: 'Football'
  },
  {
    id: 202,
    title: 'NBA Playoffs Schedule Announced',
    excerpt: 'The NBA has officially released the playoff schedule for the upcoming season. Top seeded teams will face off in what promises to be an exciting postseason.',
    image: 'https://images.unsplash.com/photo-1551698618-1dfe5d97d256?w=800&h=600&fit=crop',
    date: '2024-12-08T14:30:00',
    category: 'Basketball'
  },
  {
    id: 203,
    title: 'Wimbledon 2025 Registration Opens',
    excerpt: 'Registration for the prestigious Wimbledon tournament is now open. Players from around the world are expected to compete in this grand slam event.',
    image: 'https://images.unsplash.com/photo-1534158914592-062992fbe900?w=800&h=600&fit=crop',
    date: '2024-12-12T09:00:00',
    category: 'Tennis'
  },
  {
    id: 204,
    title: 'World Cup Qualifiers Begin Next Week',
    excerpt: 'The qualifying rounds for the upcoming World Cup will commence next week. National teams will compete for a chance to represent their countries on the world stage.',
    image: 'https://images.unsplash.com/photo-1551958219-acbc608c6377?w=800&h=600&fit=crop',
    date: '2024-12-11T16:00:00',
    category: 'Football'
  },
  {
    id: 205,
    title: 'Olympic Games Preparations Underway',
    excerpt: 'Preparations for the next Olympic Games are in full swing. Athletes from various disciplines are training intensively for the upcoming competition.',
    image: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800&h=600&fit=crop',
    date: '2024-12-09T11:30:00',
    category: 'Multi-Sport'
  },
  {
    id: 206,
    title: 'Super Bowl LVIII Tickets on Sale',
    excerpt: 'Tickets for Super Bowl LVIII are now available for purchase. Football fans can secure their seats for the biggest game of the year.',
    image: 'https://images.unsplash.com/photo-1551698618-1dfe5d97d256?w=800&h=600&fit=crop',
    date: '2024-12-07T13:00:00',
    category: 'Football'
  }
])

// Handle match card click - navigate to match detail page
const handleViewDetails = (match) => {
  console.log('Navigating to match detail:', match.id)
  router.push(`/match/${match.id}`)
}
</script>

<template>
  <main class="main-content">
    <!-- Loading indicator -->
    <div v-if="loading" class="loading-container">
      <div class="loading-spinner"></div>
      <p>Loading matches...</p>
    </div>
    
    <!-- Error message -->
    <div v-if="error" class="error-container">
      <p>{{ error }}</p>
    </div>
    
    <!-- Today's Matches Section -->
    <section class="content-section">
      <div class="section-header">
        <h2>{{ isSearchActive ? `Matches for "${searchedTeamName}"` : "Today's Matches" }}</h2>
        <div class="section-divider"></div>
      </div>
      <div v-if="matches.length === 0 && !loading" class="no-results">
        <p>{{ isSearchActive ? 'No matches found for this team.' : 'No matches scheduled for today.' }}</p>
      </div>
      <div class="matches-carousel" v-else>
        <MatchCard
          v-for="match in matches"
          :key="match.id"
          :match="match"
          @view-details="handleViewDetails"
        />
      </div>
    </section>

    <!-- Friends Section -->
    <section class="content-section">
      <div class="section-header">
        <h2>Logged by Friends</h2>
        <div class="section-divider"></div>
      </div>
      <div class="matches-carousel">
        <FriendEventCard
          v-for="event in friendEvents"
          :key="event.id"
          :event="event"
          @view-details="handleViewDetails"
        />
      </div>
    </section>

    <!-- Tournament News Section -->
    <section class="content-section">
      <div class="section-header">
        <h2>Tournament News</h2>
        <div class="section-divider"></div>
      </div>
      <div class="matches-carousel">
        <NewsCard
          v-for="news in tournamentNews"
          :key="news.id"
          :news="news"
          @view-details="handleViewDetails"
        />
      </div>
    </section>
  </main>
</template>

<style scoped>
.main-content {
  flex: 1;
  width: 100%;
  background: #f8f9fa;
  min-height: 100vh;
  padding-top: 2rem;
}

/* Loading and Error States */
.loading-container,
.error-container {
  max-width: 1400px;
  margin: 0 auto 2rem;
  padding: 2rem;
  text-align: center;
  background: white;
  border-radius: 8px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.loading-spinner {
  width: 50px;
  height: 50px;
  border: 4px solid #f3f4f6;
  border-top: 4px solid #1e3a8a;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto 1rem;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.loading-container p,
.error-container p {
  color: #6b7280;
  font-size: 1.125rem;
  margin: 0;
}

.error-container {
  background: #fee2e2;
}

.error-container p {
  color: #991b1b;
  font-weight: 500;
}

/* Content Sections */
.content-section {
  max-width: 1400px;
  margin: 0 auto 3rem;
  padding: 0 2rem;
}

.content-section:last-child {
  margin-bottom: 3rem;
}

/* Section Headers - Classic Typography */
.section-header {
  position: relative;
  margin-bottom: 2rem;
  display: flex;
  align-items: center;
  gap: 1rem;
}

.section-header h2 {
  font-size: 1.75rem;
  font-weight: 700;
  color: #1e3a8a;
  margin: 0;
  text-transform: uppercase;
  letter-spacing: 1.5px;
  font-family: Georgia, 'Times New Roman', serif;
  white-space: nowrap;
}

.section-divider {
  flex: 1;
  height: 2px;
  background: linear-gradient(to right, #1e3a8a, transparent);
}

/* Carousel Layout */
.matches-carousel {
  display: flex;
  flex-direction: row;
  gap: 1.5rem;
  overflow-x: auto;
  overflow-y: hidden;
  padding: 1rem 0 2rem;
  width: 100%;
  scroll-behavior: smooth;
  -webkit-overflow-scrolling: touch;
}

/* Scrollbar Styling */
.matches-carousel::-webkit-scrollbar {
  height: 8px;
}

.events-grid::-webkit-scrollbar-track {
  background: #f1f1f1;
  background: rgba(73, 77, 83, 0.7);
  border-radius: 10px;
}

.events-grid::-webkit-scrollbar-thumb {
  background: #6b7280;
  border-radius: 10px;
  transition: background 0.2s ease;
}

.events-grid::-webkit-scrollbar-thumb:hover {
  background: #9ca3af;
}

/* No Results State */
.no-results {
  padding: 3rem 2rem;
  text-align: center;
  background: white;
  border-radius: 8px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.no-results p {
  color: #9ca3af;
  font-size: 1.125rem;
  margin: 0;
  font-weight: 500;
}

/* Responsive Design */
@media (max-width: 1024px) {
  .content-section {
    padding: 0 1.5rem;
  }
}

@media (max-width: 768px) {
  .main-content {
    padding-top: 1rem;
  }

  .content-section {
    padding: 0 1rem;
    margin-bottom: 2rem;
  }

  .section-header {
    margin-bottom: 1.5rem;
  }

  .section-header h2 {
    font-size: 1.25rem;
    letter-spacing: 1px;
  }

  .matches-carousel {
    gap: 1rem;
    padding: 0.5rem 0 1.5rem;
  }

  .loading-container,
  .error-container {
    padding: 1.5rem;
    margin: 0 1rem 1.5rem;
  }

  .no-results {
    padding: 2rem 1.5rem;
  }

  .no-results p {
    font-size: 1rem;
  }
}

@media (max-width: 480px) {
  .section-header h2 {
    font-size: 1.125rem;
  }
}
</style>


