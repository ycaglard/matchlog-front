import { ref } from 'vue'

// API base URL
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080'

// Token storage key
const TOKEN_KEY = 'matchlog_auth_token'

/**
 * Handle API responses
 * @param {Response} response - Fetch response
 * @returns {Promise<Object>} Parsed JSON response
 */
const handleResponse = async (response) => {
  if (!response.ok) {
    const errorText = await response.text()
    let errorMessage = `API Error: ${response.status} ${response.statusText}`
    
    try {
      const errorJson = JSON.parse(errorText)
      errorMessage = errorJson.message || errorMessage
    } catch {
      errorMessage = errorText || errorMessage
    }
    
    throw new Error(errorMessage)
  }
  
  // Handle 204 No Content
  if (response.status === 204) {
    return null
  }
  
  return response.json()
}

/**
 * Get authorization headers with token
 * @returns {Object} Headers object
 */
const getAuthHeaders = () => {
  const token = localStorage.getItem(TOKEN_KEY)
  const headers = {
    'Content-Type': 'application/json'
  }
  
  if (token) {
    headers['Authorization'] = `Bearer ${token}`
  }
  
  return headers
}

/**
 * Composable for Custom List API operations
 */
export function useListClient() {
  const loading = ref(false)
  const error = ref(null)

  /**
   * Get all custom lists (public)
   * @returns {Promise<Array>} Array of custom lists
   */
  const getAllLists = async () => {
    loading.value = true
    error.value = null
    
    try {
      const response = await fetch(`${API_BASE_URL}/api/lists`, {
        method: 'GET',
        headers: getAuthHeaders()
      })
      
      const data = await handleResponse(response)
      return data
    } catch (err) {
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  /**
   * Get current user's custom lists
   * @returns {Promise<Array>} Array of user's custom lists
   */
  const getMyLists = async () => {
    loading.value = true
    error.value = null
    
    try {
      const response = await fetch(`${API_BASE_URL}/api/lists/my-lists`, {
        method: 'GET',
        headers: getAuthHeaders()
      })
      
      const data = await handleResponse(response)
      return data
    } catch (err) {
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  /**
   * Get custom list by ID
   * @param {string} listId - The list ID
   * @returns {Promise<Object>} Custom list object
   */
  const getListById = async (listId) => {
    loading.value = true
    error.value = null
    
    try {
      const response = await fetch(`${API_BASE_URL}/api/lists/${listId}`, {
        method: 'GET',
        headers: getAuthHeaders()
      })
      
      const data = await handleResponse(response)
      return data
    } catch (err) {
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  /**
   * Get lists by user ID
   * @param {string} userId - The user ID
   * @returns {Promise<Array>} Array of user's custom lists
   */
  const getUserLists = async (userId) => {
    loading.value = true
    error.value = null
    
    try {
      const response = await fetch(`${API_BASE_URL}/api/lists/user/${userId}`, {
        method: 'GET',
        headers: getAuthHeaders()
      })
      
      const data = await handleResponse(response)
      return data
    } catch (err) {
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  /**
   * Create a new custom list
   * @param {string} name - List name (required)
   * @param {string} description - List description (optional)
   * @param {Array<number>} matchIds - Array of match IDs (optional)
   * @returns {Promise<Object>} Created custom list
   */
  const createList = async (name, description = '', matchIds = []) => {
    loading.value = true
    error.value = null
    
    try {
      const response = await fetch(`${API_BASE_URL}/api/lists`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({
          name,
          description,
          matchIds
        })
      })
      
      const data = await handleResponse(response)
      return data
    } catch (err) {
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  /**
   * Update an existing custom list
   * @param {string} listId - The list ID
   * @param {Object} updateData - Update data
   * @param {string} updateData.name - List name
   * @param {string} updateData.description - List description
   * @param {Array<number>} updateData.matchIds - Array of match IDs
   * @returns {Promise<Object>} Updated custom list
   */
  const updateList = async (listId, updateData) => {
    loading.value = true
    error.value = null
    
    try {
      const response = await fetch(`${API_BASE_URL}/api/lists/${listId}`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify(updateData)
      })
      
      const data = await handleResponse(response)
      return data
    } catch (err) {
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  /**
   * Delete a custom list
   * @param {string} listId - The list ID
   * @returns {Promise<void>}
   */
  const deleteList = async (listId) => {
    loading.value = true
    error.value = null
    
    try {
      const response = await fetch(`${API_BASE_URL}/api/lists/${listId}`, {
        method: 'DELETE',
        headers: getAuthHeaders()
      })
      
      await handleResponse(response)
    } catch (err) {
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  /**
   * Add a match to a custom list
   * @param {string} listId - The list ID
   * @param {number} matchId - The match ID
   * @returns {Promise<Object>} Updated custom list
   */
  const addMatchToList = async (listId, matchId) => {
    loading.value = true
    error.value = null
    
    try {
      const response = await fetch(`${API_BASE_URL}/api/lists/${listId}/matches/${matchId}`, {
        method: 'POST',
        headers: getAuthHeaders()
      })
      
      const data = await handleResponse(response)
      return data
    } catch (err) {
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  /**
   * Remove a match from a custom list
   * @param {string} listId - The list ID
   * @param {number} matchId - The match ID
   * @returns {Promise<Object>} Updated custom list
   */
  const removeMatchFromList = async (listId, matchId) => {
    loading.value = true
    error.value = null
    
    try {
      const response = await fetch(`${API_BASE_URL}/api/lists/${listId}/matches/${matchId}`, {
        method: 'DELETE',
        headers: getAuthHeaders()
      })
      
      const data = await handleResponse(response)
      return data
    } catch (err) {
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  return {
    loading,
    error,
    getAllLists,
    getMyLists,
    getListById,
    getUserLists,
    createList,
    updateList,
    deleteList,
    addMatchToList,
    removeMatchFromList
  }
}

// Export for direct use (non-composable)
export default {
  getAllLists: async () => {
    const response = await fetch(`${API_BASE_URL}/api/lists`, {
      method: 'GET',
      headers: getAuthHeaders()
    })
    return handleResponse(response)
  },
  
  getMyLists: async () => {
    const response = await fetch(`${API_BASE_URL}/api/lists/my-lists`, {
      method: 'GET',
      headers: getAuthHeaders()
    })
    return handleResponse(response)
  },
  
  getListById: async (listId) => {
    const response = await fetch(`${API_BASE_URL}/api/lists/${listId}`, {
      method: 'GET',
      headers: getAuthHeaders()
    })
    return handleResponse(response)
  },
  
  getUserLists: async (userId) => {
    const response = await fetch(`${API_BASE_URL}/api/lists/user/${userId}`, {
      method: 'GET',
      headers: getAuthHeaders()
    })
    return handleResponse(response)
  },
  
  createList: async (name, description = '', matchIds = []) => {
    const response = await fetch(`${API_BASE_URL}/api/lists`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ name, description, matchIds })
    })
    return handleResponse(response)
  },
  
  updateList: async (listId, updateData) => {
    const response = await fetch(`${API_BASE_URL}/api/lists/${listId}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(updateData)
    })
    return handleResponse(response)
  },
  
  deleteList: async (listId) => {
    const response = await fetch(`${API_BASE_URL}/api/lists/${listId}`, {
      method: 'DELETE',
      headers: getAuthHeaders()
    })
    return handleResponse(response)
  },
  
  addMatchToList: async (listId, matchId) => {
    const response = await fetch(`${API_BASE_URL}/api/lists/${listId}/matches/${matchId}`, {
      method: 'POST',
      headers: getAuthHeaders()
    })
    return handleResponse(response)
  },
  
  removeMatchFromList: async (listId, matchId) => {
    const response = await fetch(`${API_BASE_URL}/api/lists/${listId}/matches/${matchId}`, {
      method: 'DELETE',
      headers: getAuthHeaders()
    })
    return handleResponse(response)
  }
}
