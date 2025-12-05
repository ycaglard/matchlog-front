import { ref } from 'vue'

// API base URL - adjust this to match your backend API
// You can set this via environment variable VITE_API_BASE_URL
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080'

/**
 * EventDTO structure from the API
 * @typedef {Object} Team
 * @property {number} id - Team ID
 * @property {string} name - Team name
 * 
 * @typedef {Object} Match
 * @property {number} id - Match ID
 * @property {Team} home - Home team
 * @property {Team} away - Away team
 * 
 * @typedef {Object} Comment
 * @property {number} id - Comment ID
 * @property {string} text - Comment text
 * @property {string|Date} createdAt - Comment creation date
 * @property {number} userId - User ID who created the comment
 * @property {string} username - Username
 * @property {string} userEmail - User email
 * @property {number} eventId - Event ID
 * 
 * @typedef {Object} EventDTO
 * @property {number} id - Event ID
 * @property {string} eventType - Type of event
 * @property {Match} match - Match details with home and away teams
 * @property {string|Date} date - Event date (parsed from ISO string)
 * @property {Comment[]} comments - Array of comments
 * @property {number} commentCount - Number of comments
 */

/**
 * Parse Comment from API response
 * @param {Object} data - Raw comment data
 * @returns {Comment} Parsed comment
 */
const parseComment = (data) => {
  return {
    id: data.id,
    text: data.text,
    createdAt: data.createdAt ? new Date(data.createdAt) : null,
    userId: data.userId,
    username: data.username,
    userEmail: data.userEmail,
    eventId: data.eventId
  }
}

/**
 * Parse EventDTO from API response
 * @param {Object} data - Raw API response data
 * @returns {EventDTO} Parsed event DTO
 */
const parseEventDTO = (data) => {
  return {
    id: data.id,
    eventType: data.eventType,
    match: data.match ? {
      id: data.match.id,
      home: data.match.home ? {
        id: data.match.home.id,
        name: data.match.home.name
      } : null,
      away: data.match.away ? {
        id: data.match.away.id,
        name: data.match.away.name
      } : null
    } : null,
    date: data.date ? new Date(data.date) : null,
    comments: Array.isArray(data.comments) ? data.comments.map(parseComment) : [],
    commentCount: data.commentCount || 0
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
 * Get all events
 * @returns {Promise<EventDTO[]>} List of events
 */
export const getEvents = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/events`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    })
    
    const data = await handleResponse(response)
    return Array.isArray(data) ? data.map(parseEventDTO) : []
  } catch (error) {
    console.error('Error fetching events:', error)
    throw error
  }
}

/**
 * Get events by date
 * @param {string|Date} date - Date in format 'yyyy-MM-dd' or Date object
 * @returns {Promise<EventDTO[]>} List of events for the specified date
 */
export const getEventsByDate = async (date) => {
  try {
    // Convert Date object to string if needed
    let dateString = date
    if (date instanceof Date) {
      const year = date.getFullYear()
      const month = String(date.getMonth() + 1).padStart(2, '0')
      const day = String(date.getDate()).padStart(2, '0')
      dateString = `${year}-${month}-${day}`
    }
    
    const response = await fetch(`${API_BASE_URL}/api/events/date/${dateString}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    })
    
    const data = await handleResponse(response)
    return Array.isArray(data) ? data.map(parseEventDTO) : []
  } catch (error) {
    console.error('Error fetching events by date:', error)
    throw error
  }
}

/**
 * Get event by ID
 * @param {number} id - Event ID
 * @returns {Promise<EventDTO>} Event DTO
 */
export const getEventById = async (id) => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/events/id/${id}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    })
    
    const data = await handleResponse(response)
    return parseEventDTO(data)
  } catch (error) {
    console.error('Error fetching event by ID:', error)
    throw error
  }
}

/**
 * Get events by team name
 * @param {string} teamName - Team name
 * @returns {Promise<EventDTO[]>} List of events for the specified team
 */
export const getEventsByTeamName = async (teamName) => {
  try {
    const encodedTeamName = encodeURIComponent(teamName)
    const response = await fetch(`${API_BASE_URL}/api/events/team/${encodedTeamName}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    })
    
    const data = await handleResponse(response)
    return Array.isArray(data) ? data.map(parseEventDTO) : []
  } catch (error) {
    console.error('Error fetching events by team name:', error)
    throw error
  }
}

/**
 * Get events by date range
 * @param {string|Date} startDate - Start date in format 'yyyy-MM-dd' or Date object
 * @param {string|Date} endDate - End date in format 'yyyy-MM-dd' or Date object
 * @returns {Promise<EventDTO[]>} List of events within the specified date range
 */
export const getEventsByDateRange = async (startDate, endDate) => {
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
    
    const response = await fetch(`${API_BASE_URL}/api/events/daterange?startDate=${startDateString}&endDate=${endDateString}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    })
    
    const data = await handleResponse(response)
    return Array.isArray(data) ? data.map(parseEventDTO) : []
  } catch (error) {
    console.error('Error fetching events by date range:', error)
    throw error
  }
}

/**
 * Search events by query string
 * @param {string} query - Search query string
 * @param {number} [limit=10] - Maximum number of results to return (default: 10)
 * @returns {Promise<EventDTO[]>} List of matching events
 */
export const searchEvents = async (query, limit = 10) => {
  try {
    const encodedQuery = encodeURIComponent(query)
    const url = `${API_BASE_URL}/api/events/search?query=${encodedQuery}&limit=${limit}`
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    })
    
    const data = await handleResponse(response)
    return Array.isArray(data) ? data.map(parseEventDTO) : []
  } catch (error) {
    console.error('Error searching events:', error)
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
 * Create a new comment for an event
 * Requires authentication - JWT token must be present
 * @param {Object} commentData - Comment data
 * @param {string} commentData.text - Comment text
 * @param {number} commentData.userId - User ID
 * @param {number} commentData.eventId - Event ID
 * @returns {Promise<Comment>} Created comment
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
    return parseComment(data)
  } catch (error) {
    console.error('Error creating comment:', error)
    throw error
  }
}

// Default export with all methods
export default {
  getEvents,
  getEventsByDate,
  getEventById,
  getEventsByTeamName,
  getEventsByDateRange,
  searchEvents,
  createComment
}

/**
 * Composable function for using EventClient in Vue components
 * Provides reactive loading and error states along with API methods
 * 
 * @example
 * import { useEventClient } from '@/clients/eventClient.js'
 * const { loading, error, getEvents } = useEventClient()
 * const events = await getEvents()
 */
export const useEventClient = () => {
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
    getEvents: () => executeWithLoading(getEvents),
    getEventsByDate: (date) => executeWithLoading(() => getEventsByDate(date)),
    getEventById: (id) => executeWithLoading(() => getEventById(id)),
    getEventsByTeamName: (teamName) => executeWithLoading(() => getEventsByTeamName(teamName)),
    getEventsByDateRange: (startDate, endDate) => executeWithLoading(() => getEventsByDateRange(startDate, endDate)),
    searchEvents: (query, limit) => executeWithLoading(() => searchEvents(query, limit)),
    createComment: (commentData) => executeWithLoading(() => createComment(commentData))
  }
}

