import { ref } from 'vue'
import { Team } from '../models/Team.js'

// API base URL - adjust this to match your backend API
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080'

/**
 * Parse Team from API response
 * @param {Object} data - Raw API response data
 * @returns {Team} Parsed team
 */
const parseTeam = (data) => {
  return Team.fromApiResponse(data)
}

/**
 * Composable for team-related API calls
 * @returns {Object} Team API methods and state
 */
export const useTeamClient = () => {
  const loading = ref(false)
  const error = ref(null)

  /**
   * Get team suggestions based on query
   * @param {string} query - Search query
   * @param {number} limit - Maximum number of results (default: 5)
   * @returns {Promise<Team[]>} Array of team suggestions
   */
  const getTeamSuggestions = async (query, limit = 5) => {
    if (!query || query.trim().length === 0) {
      return []
    }

    loading.value = true
    error.value = null

    try {
      const response = await fetch(
        `${API_BASE_URL}/api/teams/suggestions?query=${encodeURIComponent(query)}&limit=${limit}`
      )

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      return Array.isArray(data) ? data.map(parseTeam) : []
    } catch (err) {
      error.value = err.message
      console.error('Error fetching team suggestions:', err)
      return []
    } finally {
      loading.value = false
    }
  }

  /**
   * Search teams by query
   * @param {string} query - Search query
   * @param {number} limit - Maximum number of results (default: 10)
   * @returns {Promise<Team[]>} Array of teams
   */
  const searchTeams = async (query, limit = 10) => {
    if (!query || query.trim().length === 0) {
      return []
    }

    loading.value = true
    error.value = null

    try {
      const response = await fetch(
        `${API_BASE_URL}/api/teams/search?query=${encodeURIComponent(query)}&limit=${limit}`
      )

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      return Array.isArray(data) ? data.map(parseTeam) : []
    } catch (err) {
      error.value = err.message
      console.error('Error searching teams:', err)
      return []
    } finally {
      loading.value = false
    }
  }

  /**
   * Get team by ID
   * @param {number} teamId - Team ID
   * @returns {Promise<Team|null>} Team object or null if not found
   */
  const getTeamById = async (teamId) => {
    if (!teamId) {
      return null
    }

    loading.value = true
    error.value = null

    try {
      const response = await fetch(`${API_BASE_URL}/api/teams/${teamId}`)

      if (!response.ok) {
        if (response.status === 404) {
          return null
        }
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      return parseTeam(data)
    } catch (err) {
      error.value = err.message
      console.error('Error fetching team:', err)
      return null
    } finally {
      loading.value = false
    }
  }

  /**
   * Get upcoming matches for a team
   * @param {number} teamId - Team ID
   * @returns {Promise<Match[]>} Array of upcoming matches
   */
  const getUpcomingMatchesByTeamId = async (teamId) => {
    if (!teamId) {
      return []
    }

    loading.value = true
    error.value = null

    try {
      const response = await fetch(`${API_BASE_URL}/api/matches/team/${teamId}?status=SCHEDULED,TIMED`)

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      
      // Filter for upcoming matches (future dates only)
      const now = new Date()
      const upcomingMatches = Array.isArray(data) 
        ? data.filter(match => {
            const matchDate = new Date(match.utcDate)
            return matchDate > now
          }).sort((a, b) => new Date(a.utcDate) - new Date(b.utcDate))
        : []
      
      return upcomingMatches
    } catch (err) {
      error.value = err.message
      console.error('Error fetching upcoming matches for team:', err)
      return []
    } finally {
      loading.value = false
    }
  }

  return {
    loading,
    error,
    getTeamSuggestions,
    searchTeams,
    getTeamById,
    getUpcomingMatchesByTeamId
  }
}

export default useTeamClient
