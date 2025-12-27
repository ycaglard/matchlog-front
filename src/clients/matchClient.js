import { ref } from 'vue'

// API base URL - adjust this to match your backend API
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080'

/**
 * Match structure from the new MongoDB API
 * @typedef {Object} Area
 * @property {number} id - Area ID
 * @property {string} name - Area name
 * @property {string} code - Area code
 * @property {string} flag - Area flag URL
 * 
 * @typedef {Object} Competition
 * @property {number} id - Competition ID
 * @property {string} name - Competition name
 * @property {string} code - Competition code
 * @property {string} type - Competition type
 * @property {string} emblem - Competition emblem URL
 * 
 * @typedef {Object} Season
 * @property {number} id - Season ID
 * @property {string} startDate - Season start date
 * @property {string} endDate - Season end date
 * @property {number} currentMatchday - Current matchday
 * @property {TeamInfo|null} winner - Season winner
 * 
 * @typedef {Object} TeamInfo
 * @property {number} id - Team ID
 * @property {string} name - Team name
 * @property {string} shortName - Team short name
 * @property {string} tla - Team TLA
 * @property {string} crest - Team crest URL
 * 
 * @typedef {Object} TimeScore
 * @property {number|null} home - Home team score
 * @property {number|null} away - Away team score
 * 
 * @typedef {Object} Score
 * @property {string|null} winner - Match winner ('HOME_TEAM', 'AWAY_TEAM', 'DRAW')
 * @property {string} duration - Match duration ('REGULAR', 'EXTRA_TIME', 'PENALTY_SHOOTOUT')
 * @property {TimeScore} fullTime - Full time score
 * @property {TimeScore} halfTime - Half time score
 * 
 * @typedef {Object} CommentRef
 * @property {string} id - Comment ID (MongoDB ObjectId)
 * @property {string} text - Comment text
 * @property {string|Date} createdAt - Comment creation date
 * @property {string} userId - User ID (MongoDB ObjectId)
 * @property {string} username - Username
 * 
 * @typedef {Object} Match
 * @property {number} id - Match ID (from Football-Data.org)
 * @property {string|Date} utcDate - Match date in UTC
 * @property {string} status - Match status
 * @property {number} matchday - Matchday number
 * @property {string} stage - Match stage
 * @property {string|null} group - Match group
 * @property {string|Date} lastUpdated - Last update date
 * @property {Area} area - Area information
 * @property {Competition} competition - Competition information
 * @property {Season} season - Season information
 * @property {TeamInfo} homeTeam - Home team information
 * @property {TeamInfo} awayTeam - Away team information
 * @property {Score} score - Match score
 * @property {CommentRef[]} comments - Match comments
 */

/**
 * Parse Match from API response
 * @param {Object} data - Raw API response data
 * @returns {Match} Parsed match
 */
const parseMatch = (data) => {
  return {
    id: data.id,
    utcDate: data.utcDate ? new Date(data.utcDate) : null,
    status: data.status,
    matchday: data.matchday,
    stage: data.stage,
    group: data.group,
    lastUpdated: data.lastUpdated ? new Date(data.lastUpdated) : null,
    area: data.area || null,
    competition: data.competition || null,
    season: data.season ? {
      ...data.season,
      startDate: data.season.startDate ? new Date(data.season.startDate) : null,
      endDate: data.season.endDate ? new Date(data.season.endDate) : null
    } : null,
    homeTeam: data.homeTeam || null,
    awayTeam: data.awayTeam || null,
    score: data.score || null,
    comments: Array.isArray(data.comments) ? data.comments.map(c => ({
      ...c,
      createdAt: c.createdAt ? new Date(c.createdAt) : null
    })) : []
  }
}

/**
 * Handle API errors
 * @param {Response} response - Fetch response object
 * @returns {Promise} Response or throws error
 */
const handleResponse = async (response) => {
  if (!response.ok) {
    const errorText = await response.text()
    throw new Error(`API Error: ${response.status} ${response.statusText} - ${errorText}`)
  }
  return response.json()
}

/**
 * Get all matches
 * @returns {Promise<Match[]>} List of matches
 */
export const getMatches = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/matches`, {
      method: 'GET',
      headers: getAuthHeaders()
    })
    
    const data = await handleResponse(response)
    return Array.isArray(data) ? data.map(parseMatch) : []
  } catch (error) {
    console.error('Error fetching matches:', error)
    throw error
  }
}

/**
 * Get match by ID
 * @param {number} id - Match ID
 * @returns {Promise<Match>} Match data
 */
export const getMatchById = async (id) => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/matches/${id}`, {
      method: 'GET',
      headers: getAuthHeaders()
    })
    
    const data = await handleResponse(response)
    return parseMatch(data)
  } catch (error) {
    console.error('Error fetching match by ID:', error)
    throw error
  }
}

/**
 * Get matches by date range
 * @param {string|Date} startDate - Start date in format 'yyyy-MM-dd' or Date object
 * @param {string|Date} endDate - End date in format 'yyyy-MM-dd' or Date object
 * @returns {Promise<Match[]>} List of matches within the specified date range
 */
export const getMatchesByDateRange = async (startDate, endDate) => {
  try {
    // Convert Date objects to strings if needed
    const formatDate = (date) => {
      if (date instanceof Date) {
        const year = date.getFullYear()
        const month = String(date.getMonth() + 1).padStart(2, '0')
        const day = String(date.getDate()).padStart(2, '0')
        return `${year}-${month}-${day}`
      }
      return date
    }
    
    const startDateString = formatDate(startDate)
    const endDateString = formatDate(endDate)
    
    const response = await fetch(`${API_BASE_URL}/api/matches/date-range?startDate=${startDateString}&endDate=${endDateString}`, {
      method: 'GET',
      headers: getAuthHeaders()
    })
    
    const data = await handleResponse(response)
    return Array.isArray(data) ? data.map(parseMatch) : []
  } catch (error) {
    console.error('Error fetching matches by date range:', error)
    throw error
  }
}

/**
 * Get matches by team ID
 * @param {number} teamId - Team ID
 * @returns {Promise<Match[]>} List of matches for the specified team
 */
export const getMatchesByTeamId = async (teamId) => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/matches/team/${teamId}`, {
      method: 'GET',
      headers: getAuthHeaders()
    })
    
    const data = await handleResponse(response)
    return Array.isArray(data) ? data.map(parseMatch) : []
  } catch (error) {
    console.error('Error fetching matches by team ID:', error)
    throw error
  }
}

/**
 * Get matches by competition ID
 * @param {number} competitionId - Competition ID
 * @returns {Promise<Match[]>} List of matches for the specified competition
 */
export const getMatchesByCompetition = async (competitionId) => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/matches/competition/${competitionId}`, {
      method: 'GET',
      headers: getAuthHeaders()
    })
    
    const data = await handleResponse(response)
    return Array.isArray(data) ? data.map(parseMatch) : []
  } catch (error) {
    console.error('Error fetching matches by competition:', error)
    throw error
  }
}

/**
 * Get matches by competition code
 * @param {string} code - Competition code (e.g., 'PL', 'CL', 'BSA')
 * @returns {Promise<Match[]>} List of matches for the specified competition
 */
export const getMatchesByCompetitionCode = async (code) => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/matches/competition/code/${code}`, {
      method: 'GET',
      headers: getAuthHeaders()
    })
    
    const data = await handleResponse(response)
    return Array.isArray(data) ? data.map(parseMatch) : []
  } catch (error) {
    console.error('Error fetching matches by competition code:', error)
    throw error
  }
}

/**
 * Get matches by status
 * @param {string} status - Match status (e.g., 'SCHEDULED', 'FINISHED', 'IN_PLAY')
 * @returns {Promise<Match[]>} List of matches with the specified status
 */
export const getMatchesByStatus = async (status) => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/matches/status/${status}`, {
      method: 'GET',
      headers: getAuthHeaders()
    })
    
    const data = await handleResponse(response)
    return Array.isArray(data) ? data.map(parseMatch) : []
  } catch (error) {
    console.error('Error fetching matches by status:', error)
    throw error
  }
}

/**
 * Get today's matches
 * @returns {Promise<Match[]>} List of today's matches
 */
export const getTodayMatches = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/matches/today`, {
      method: 'GET',
      headers: getAuthHeaders()
    })
    
    const data = await handleResponse(response)
    return Array.isArray(data) ? data.map(parseMatch) : []
  } catch (error) {
    console.error('Error fetching today matches:', error)
    throw error
  }
}

/**
 * Get upcoming matches
 * @returns {Promise<Match[]>} List of upcoming matches
 */
export const getUpcomingMatches = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/matches/upcoming`, {
      method: 'GET',
      headers: getAuthHeaders()
    })
    
    const data = await handleResponse(response)
    return Array.isArray(data) ? data.map(parseMatch) : []
  } catch (error) {
    console.error('Error fetching upcoming matches:', error)
    throw error
  }
}

/**
 * Get finished matches
 * @returns {Promise<Match[]>} List of finished matches
 */
export const getFinishedMatches = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/matches/finished`, {
      method: 'GET',
      headers: getAuthHeaders()
    })
    
    const data = await handleResponse(response)
    return Array.isArray(data) ? data.map(parseMatch) : []
  } catch (error) {
    console.error('Error fetching finished matches:', error)
    throw error
  }
}

/**
 * Get matches by competition and matchday
 * @param {number} competitionId - Competition ID
 * @param {number} matchday - Matchday number
 * @returns {Promise<Match[]>} List of matches
 */
export const getMatchesByCompetitionAndMatchday = async (competitionId, matchday) => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/matches/competition/${competitionId}/matchday/${matchday}`, {
      method: 'GET',
      headers: getAuthHeaders()
    })
    
    const data = await handleResponse(response)
    return Array.isArray(data) ? data.map(parseMatch) : []
  } catch (error) {
    console.error('Error fetching matches by competition and matchday:', error)
    throw error
  }
}

/**
 * Get match statistics
 * @returns {Promise<Object>} Match statistics
 */
export const getMatchStats = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/matches/stats`, {
      method: 'GET',
      headers: getAuthHeaders()
    })
    
    return await handleResponse(response)
  } catch (error) {
    console.error('Error fetching match stats:', error)
    throw error
  }
}

/**
 * Get authorization headers with token
 * @returns {Object} Headers object with Authorization if token exists
 */
const getAuthHeaders = () => {
  const token = localStorage.getItem('matchlog_auth_token')
  const headers = {
    'Content-Type': 'application/json'
  }
  
  if (token) {
    headers['Authorization'] = `Bearer ${token}`
  }
  
  return headers
}

/**
 * Create a new comment for a match
 * Requires authentication - JWT token must be present
 * @param {Object} commentData - Comment data
 * @param {string} commentData.text - Comment text
 * @param {string} commentData.userId - User ID (MongoDB ObjectId)
 * @param {number} commentData.eventId - Match ID (still called eventId for API compatibility)
 * @returns {Promise<Object>} Created comment
 */
export const createComment = async (commentData) => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/comments`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({
        text: commentData.text,
        userId: commentData.userId,
        eventId: commentData.eventId
      })
    })
    
    const data = await handleResponse(response)
    return {
      ...data,
      createdAt: data.createdAt ? new Date(data.createdAt) : null
    }
  } catch (error) {
    console.error('Error creating comment:', error)
    throw error
  }
}

/**
 * Client-side search for matches
 * Since the search endpoint was removed, this implements local filtering
 * @param {Match[]} matches - Array of matches to search
 * @param {string} query - Search query
 * @returns {Match[]} Filtered matches
 */
export const searchMatchesLocal = (matches, query) => {
  if (!query || query.length < 2) return matches
  
  const lowerQuery = query.toLowerCase()
  return matches.filter(match =>
    match.homeTeam?.name.toLowerCase().includes(lowerQuery) ||
    match.awayTeam?.name.toLowerCase().includes(lowerQuery) ||
    match.competition?.name.toLowerCase().includes(lowerQuery) ||
    match.competition?.code.toLowerCase().includes(lowerQuery)
  )
}

// Default export with all methods
export default {
  getMatches,
  getMatchById,
  getMatchesByDateRange,
  getMatchesByTeamId,
  getMatchesByCompetition,
  getMatchesByCompetitionCode,
  getMatchesByStatus,
  getTodayMatches,
  getUpcomingMatches,
  getFinishedMatches,
  getMatchesByCompetitionAndMatchday,
  getMatchStats,
  createComment,
  searchMatchesLocal
}

/**
 * Composable function for using MatchClient in Vue components
 * Provides reactive loading and error states along with API methods
 */
export const useMatchClient = () => {
  const loading = ref(false)
  const error = ref(null)

  const executeWithLoading = async (apiCall) => {
    loading.value = true
    error.value = null
    try {
      const result = await apiCall()
      return result
    } catch (err) {
      error.value = err.message || 'An error occurred'
      throw err
    } finally {
      loading.value = false
    }
  }

  return {
    loading,
    error,
    getMatches: () => executeWithLoading(getMatches),
    getMatchById: (id) => executeWithLoading(() => getMatchById(id)),
    getMatchesByDateRange: (startDate, endDate) => executeWithLoading(() => getMatchesByDateRange(startDate, endDate)),
    getMatchesByTeamId: (teamId) => executeWithLoading(() => getMatchesByTeamId(teamId)),
    getMatchesByCompetition: (competitionId) => executeWithLoading(() => getMatchesByCompetition(competitionId)),
    getMatchesByCompetitionCode: (code) => executeWithLoading(() => getMatchesByCompetitionCode(code)),
    getMatchesByStatus: (status) => executeWithLoading(() => getMatchesByStatus(status)),
    getTodayMatches: () => executeWithLoading(getTodayMatches),
    getUpcomingMatches: () => executeWithLoading(getUpcomingMatches),
    getFinishedMatches: () => executeWithLoading(getFinishedMatches),
    getMatchesByCompetitionAndMatchday: (competitionId, matchday) => executeWithLoading(() => getMatchesByCompetitionAndMatchday(competitionId, matchday)),
    getMatchStats: () => executeWithLoading(getMatchStats),
    createComment: (commentData) => executeWithLoading(() => createComment(commentData)),
    searchMatchesLocal
  }
}
