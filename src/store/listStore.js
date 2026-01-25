import { reactive, computed } from 'vue'
import listClient from '../clients/listClient.js'
import CustomList from '../models/CustomList.js'
import { authStore } from './authStore.js'

/**
 * Global store for managing custom lists
 */
export const listStore = reactive({
  // State
  myLists: [],
  selectedList: null,
  loading: false,
  error: null,
  lastFetched: null,

  // Computed: Default lists
  get defaultLists() {
    return CustomList.findDefaultLists(this.myLists)
  },

  get favouritesList() {
    return this.defaultLists.favourites
  },

  get watchedList() {
    return this.defaultLists.watched
  },

  get reviewedList() {
    return this.defaultLists.reviewed
  },

  // Computed: Custom (non-default) lists
  get customLists() {
    return this.myLists.filter(list => !list.isDefaultList())
  },

  // Computed: Sorted lists (defaults first)
  get sortedLists() {
    return CustomList.sortWithDefaultsFirst(this.myLists)
  },

  /**
   * Load current user's lists
   * @param {boolean} forceRefresh - Force refresh even if recently fetched
   */
  async loadMyLists(forceRefresh = false) {
    // Check if we need to refresh
    if (!forceRefresh && this.lastFetched && Date.now() - this.lastFetched < 30000) {
      return this.myLists
    }

    this.loading = true
    this.error = null

    try {
      const data = await listClient.getMyLists()
      this.myLists = CustomList.fromAPIArray(data)
      this.lastFetched = Date.now()
      return this.myLists
    } catch (err) {
      this.error = err.message
      console.error('Failed to load lists:', err)
      throw err
    } finally {
      this.loading = false
    }
  },

  /**
   * Get a specific list by ID
   * @param {string} listId - List ID
   * @param {boolean} forceRefresh - Force refresh from API
   */
  async getListById(listId, forceRefresh = false) {
    // Try to find in cache first
    if (!forceRefresh) {
      const cached = this.myLists.find(list => list.id === listId)
      if (cached) return cached
    }

    this.loading = true
    this.error = null

    try {
      const data = await listClient.getListById(listId)
      const list = CustomList.fromAPI(data)
      
      // Update cache
      const index = this.myLists.findIndex(l => l.id === listId)
      if (index !== -1) {
        this.myLists[index] = list
      } else {
        this.myLists.push(list)
      }
      
      return list
    } catch (err) {
      this.error = err.message
      console.error('Failed to load list:', err)
      throw err
    } finally {
      this.loading = false
    }
  },

  /**
   * Create a new list
   * @param {string} name - List name
   * @param {string} description - List description
   * @param {Array<number>} matchIds - Initial match IDs
   */
  async createList(name, description = '', matchIds = []) {
    this.loading = true
    this.error = null

    try {
      const data = await listClient.createList(name, description, matchIds)
      const newList = CustomList.fromAPI(data)
      this.myLists.push(newList)
      return newList
    } catch (err) {
      this.error = err.message
      console.error('Failed to create list:', err)
      throw err
    } finally {
      this.loading = false
    }
  },

  /**
   * Update an existing list
   * @param {string} listId - List ID
   * @param {Object} updateData - Update data
   */
  async updateList(listId, updateData) {
    this.loading = true
    this.error = null

    try {
      const data = await listClient.updateList(listId, updateData)
      const updatedList = CustomList.fromAPI(data)
      
      // Update in cache
      const index = this.myLists.findIndex(l => l.id === listId)
      if (index !== -1) {
        this.myLists[index] = updatedList
      }
      
      // Update selected list if it's the one being updated
      if (this.selectedList?.id === listId) {
        this.selectedList = updatedList
      }
      
      return updatedList
    } catch (err) {
      this.error = err.message
      console.error('Failed to update list:', err)
      throw err
    } finally {
      this.loading = false
    }
  },

  /**
   * Delete a list
   * @param {string} listId - List ID
   */
  async deleteList(listId) {
    this.loading = true
    this.error = null

    try {
      await listClient.deleteList(listId)
      
      // Remove from cache
      this.myLists = this.myLists.filter(l => l.id !== listId)
      
      // Clear selected if it was deleted
      if (this.selectedList?.id === listId) {
        this.selectedList = null
      }
    } catch (err) {
      this.error = err.message
      console.error('Failed to delete list:', err)
      throw err
    } finally {
      this.loading = false
    }
  },

  /**
   * Add a match to a list
   * @param {string} listId - List ID
   * @param {number} matchId - Match ID
   */
  async addMatchToList(listId, matchId) {
    this.loading = true
    this.error = null

    try {
      const data = await listClient.addMatchToList(listId, matchId)
      const updatedList = CustomList.fromAPI(data)
      
      // Update in cache
      const index = this.myLists.findIndex(l => l.id === listId)
      if (index !== -1) {
        this.myLists[index] = updatedList
      }
      
      // Update selected list if it's the one being updated
      if (this.selectedList?.id === listId) {
        this.selectedList = updatedList
      }
      
      return updatedList
    } catch (err) {
      this.error = err.message
      console.error('Failed to add match to list:', err)
      throw err
    } finally {
      this.loading = false
    }
  },

  /**
   * Remove a match from a list
   * @param {string} listId - List ID
   * @param {number} matchId - Match ID
   */
  async removeMatchFromList(listId, matchId) {
    this.loading = true
    this.error = null

    try {
      const data = await listClient.removeMatchFromList(listId, matchId)
      const updatedList = CustomList.fromAPI(data)
      
      // Update in cache
      const index = this.myLists.findIndex(l => l.id === listId)
      if (index !== -1) {
        this.myLists[index] = updatedList
      }
      
      // Update selected list if it's the one being updated
      if (this.selectedList?.id === listId) {
        this.selectedList = updatedList
      }
      
      return updatedList
    } catch (err) {
      this.error = err.message
      console.error('Failed to remove match from list:', err)
      throw err
    } finally {
      this.loading = false
    }
  },

  /**
   * Toggle a match in a list (add if not present, remove if present)
   * @param {string} listId - List ID
   * @param {number} matchId - Match ID
   */
  async toggleMatchInList(listId, matchId) {
    const list = this.myLists.find(l => l.id === listId)
    if (!list) {
      throw new Error('List not found')
    }

    if (list.containsMatch(matchId)) {
      return await this.removeMatchFromList(listId, matchId)
    } else {
      return await this.addMatchToList(listId, matchId)
    }
  },

  /**
   * Check if a match is in any list
   * @param {number} matchId - Match ID
   * @returns {Array<CustomList>} Lists containing this match
   */
  getListsContainingMatch(matchId) {
    return this.myLists.filter(list => list.containsMatch(matchId))
  },

  /**
   * Check if a match is in a specific default list
   * @param {number} matchId - Match ID
   * @param {string} listType - 'favourites', 'watched', or 'reviewed'
   * @returns {boolean}
   */
  isMatchInDefaultList(matchId, listType) {
    const list = this.defaultLists[listType]
    return list ? list.containsMatch(matchId) : false
  },

  /**
   * Select a list as the active list
   * @param {string} listId - List ID
   */
  selectList(listId) {
    const list = this.myLists.find(l => l.id === listId)
    this.selectedList = list || null
  },

  /**
   * Clear the selected list
   */
  clearSelection() {
    this.selectedList = null
  },

  /**
   * Reset the store (e.g., on logout)
   */
  reset() {
    this.myLists = []
    this.selectedList = null
    this.loading = false
    this.error = null
    this.lastFetched = null
  },

  /**
   * Initialize the store (load lists if authenticated)
   */
  async initialize() {
    if (authStore.isAuthenticated) {
      try {
        await this.loadMyLists()
      } catch (err) {
        console.error('Failed to initialize list store:', err)
      }
    }
  }
})

// Auto-initialize when auth state changes
if (typeof window !== 'undefined') {
  // Watch for auth changes
  const originalLogin = authStore.login
  authStore.login = async function(...args) {
    const result = await originalLogin.apply(this, args)
    await listStore.initialize()
    return result
  }

  const originalLogout = authStore.logout
  authStore.logout = function(...args) {
    listStore.reset()
    return originalLogout.apply(this, args)
  }
}
