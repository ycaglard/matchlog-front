<script setup>
import { ref, onMounted, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import EventCard from '../components/EventCard.vue'
import FriendEventCard from '../components/FriendEventCard.vue'
import NewsCard from '../components/NewsCard.vue'
import { useEventClient } from '../clients/eventClient.js'

const router = useRouter()
const route = useRoute()

// Events data from backend
const events = ref([])
const isSearchActive = ref(false)
const searchedTeamName = ref('')

// Initialize event client with loading and error states
const { loading, error, getEventsByDateRange, getEventsByTeamName } = useEventClient()

// Fetch events from backend on component mount
onMounted(async () => {
  // Check if there's a team query parameter from navbar search
  if (route.query.team) {
    await handleSearch(route.query.team)
  } else {
    await loadUpcomingEvents()
  }
})

// Watch for route query changes (from navbar search)
watch(() => route.query.team, (teamName) => {
  if (teamName) {
    handleSearch(teamName)
  } else {
    loadUpcomingEvents()
  }
})

// Load upcoming events (next 7 days)
const loadUpcomingEvents = async () => {
  try {
    // Calculate today and 7 days from now
    const today = new Date()
    const sevenDaysLater = new Date()
    sevenDaysLater.setDate(today.getDate() + 7)
    
    // Fetch events in the next 7 days
    const eventsData = await getEventsByDateRange(today, sevenDaysLater)
    events.value = eventsData
    isSearchActive.value = false
    searchedTeamName.value = ''
    console.log('Events loaded from backend (next 7 days):', eventsData)
  } catch (err) {
    console.error('Failed to fetch events:', err)
  }
}

// Handle search by team name
const handleSearch = async (teamName) => {
  try {
    const eventsData = await getEventsByTeamName(teamName)
    events.value = eventsData
    isSearchActive.value = true
    searchedTeamName.value = teamName
    console.log('Events loaded for team:', teamName, eventsData)
  } catch (err) {
    console.error('Failed to search events:', err)
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

// Handle event card click - navigate to event detail page
const handleViewDetails = (event) => {
  console.log('Navigating to event detail:', event.id)
  router.push(`/event/${event.id}`)
}
</script>

<template>
  <main class="main-content">
    <!-- Loading indicator -->
    <div v-if="loading" class="loading-indicator">
      Loading events...
    </div>
    
    <!-- Error message -->
    <div v-if="error" class="error-message">
      Error: {{ error }}
    </div>
    
    <section class="events-section">
      <h1 class="section-title">
        {{ isSearchActive ? `Events for "${searchedTeamName}"` : 'Upcoming Events' }}
      </h1>
      <div v-if="events.length === 0 && !loading" class="no-results">
        {{ isSearchActive ? 'No events found for this team.' : 'No upcoming events in the next 7 days.' }}
      </div>
      <div class="events-grid" v-else>
        <EventCard
          v-for="event in events"
          :key="event.id"
          :event="event"
          @view-details="handleViewDetails"
        />
      </div>
    </section>
    <section class="events-section">
      <h1 class="section-title">Logged by Friends</h1>
      <div class="events-grid">
        <FriendEventCard
          v-for="event in friendEvents"
          :key="event.id"
          :event="event"
          @view-details="handleViewDetails"
        />
      </div>
    </section>
    <section class="events-section">
      <h1 class="section-title">Tournament News</h1>
      <div class="events-grid">
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
  padding: 2rem;
  max-width: 1400px;
  margin: 0 auto;
  width: 100%;
}

.events-section {
  width: 100%;
  margin-bottom: 3rem;
}

.events-section:last-child {
  margin-bottom: 0;
}

.section-title {
  font-size: 2.5rem;
  font-weight: 700;
  color: #1e3a8a;
  margin-bottom: 2rem;
  text-align: center;
}

.events-grid {
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

.events-grid::-webkit-scrollbar {
  height: 8px;
}

.events-grid::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 10px;
}

.events-grid::-webkit-scrollbar-thumb {
  background: #1e3a8a;
  border-radius: 10px;
}

.events-grid::-webkit-scrollbar-thumb:hover {
  background: #1e40af;
}

@media (max-width: 768px) {
  .main-content {
    padding: 1.5rem 1rem;
  }

  .section-title {
    font-size: 2rem;
    margin-bottom: 1.5rem;
  }

  .events-grid {
    gap: 1rem;
    padding: 0.5rem 0 1.5rem;
  }
}

.loading-indicator {
  padding: 1rem;
  background: #dbeafe;
  color: #1e40af;
  border-radius: 8px;
  margin-bottom: 1rem;
  text-align: center;
  font-weight: 500;
}

.error-message {
  padding: 1rem;
  background: #fee2e2;
  color: #991b1b;
  border-radius: 8px;
  margin-bottom: 1rem;
  text-align: center;
  font-weight: 500;
}

.no-results {
  padding: 3rem 2rem;
  text-align: center;
  color: #6b7280;
  font-size: 1.125rem;
  background: #f9fafb;
  border-radius: 12px;
  border: 2px dashed #d1d5db;
}
</style>

