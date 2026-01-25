/**
 * CustomList Model
 * Represents a user's custom list of matches
 */
export default class CustomList {
  /**
   * Create a CustomList instance
   * @param {Object} data - List data from API
   */
  constructor(data) {
    this.id = data.id || data._id || null
    this.name = data.name || ''
    this.description = data.description || ''
    this.createdAt = data.createdAt ? new Date(data.createdAt) : null
    this.updatedAt = data.updatedAt ? new Date(data.updatedAt) : null
    this.userId = data.userId || null
    this.username = data.username || ''
    this.matchIds = data.matchIds || []
  }

  /**
   * Check if this list contains a specific match
   * @param {number} matchId - Match ID to check
   * @returns {boolean} True if match is in the list
   */
  containsMatch(matchId) {
    return this.matchIds.includes(Number(matchId))
  }

  /**
   * Check if this list is owned by a specific user
   * @param {string} userId - User ID to check
   * @returns {boolean} True if user owns this list
   */
  isOwnedBy(userId) {
    return this.userId === userId
  }

  /**
   * Get the number of matches in this list
   * @returns {number} Match count
   */
  getMatchCount() {
    return this.matchIds.length
  }

  /**
   * Check if this is one of the default lists
   * @returns {boolean} True if this is a default list
   */
  isDefaultList() {
    const defaultNames = ['Favourites', 'Watched', 'Reviewed']
    return defaultNames.includes(this.name)
  }

  /**
   * Get the default list type
   * @returns {string|null} 'favourites', 'watched', 'reviewed', or null
   */
  getDefaultListType() {
    const typeMap = {
      'Favourites': 'favourites',
      'Watched': 'watched',
      'Reviewed': 'reviewed'
    }
    return typeMap[this.name] || null
  }

  /**
   * Get icon for default lists
   * @returns {string} Icon name or empty string
   */
  getIcon() {
    const iconMap = {
      'Favourites': '★',
      'Watched': '👁',
      'Reviewed': '✎'
    }
    return iconMap[this.name] || '☰'
  }

  /**
   * Get a formatted creation date
   * @returns {string} Formatted date string
   */
  getFormattedCreatedDate() {
    if (!this.createdAt) return 'Unknown'
    return this.createdAt.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  /**
   * Get a formatted updated date
   * @returns {string} Formatted date string
   */
  getFormattedUpdatedDate() {
    if (!this.updatedAt) return 'Unknown'
    return this.updatedAt.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  /**
   * Convert to plain object (for API requests)
   * @returns {Object} Plain object representation
   */
  toJSON() {
    return {
      id: this.id,
      name: this.name,
      description: this.description,
      matchIds: this.matchIds
    }
  }

  /**
   * Create CustomList from API response
   * @param {Object} data - API response data
   * @returns {CustomList} CustomList instance
   */
  static fromAPI(data) {
    return new CustomList(data)
  }

  /**
   * Create multiple CustomLists from API response array
   * @param {Array} dataArray - Array of API response data
   * @returns {Array<CustomList>} Array of CustomList instances
   */
  static fromAPIArray(dataArray) {
    if (!Array.isArray(dataArray)) return []
    return dataArray.map(data => new CustomList(data))
  }

  /**
   * Find default lists from an array of lists
   * @param {Array<CustomList>} lists - Array of CustomList instances
   * @returns {Object} Object with favourites, watched, and reviewed lists
   */
  static findDefaultLists(lists) {
    return {
      favourites: lists.find(list => list.name === 'Favourites') || null,
      watched: lists.find(list => list.name === 'Watched') || null,
      reviewed: lists.find(list => list.name === 'Reviewed') || null
    }
  }

  /**
   * Sort lists with default lists first
   * @param {Array<CustomList>} lists - Array of CustomList instances
   * @returns {Array<CustomList>} Sorted array
   */
  static sortWithDefaultsFirst(lists) {
    const defaultOrder = ['Favourites', 'Watched', 'Reviewed']
    
    return [...lists].sort((a, b) => {
      const aIndex = defaultOrder.indexOf(a.name)
      const bIndex = defaultOrder.indexOf(b.name)
      
      // Both are default lists
      if (aIndex !== -1 && bIndex !== -1) {
        return aIndex - bIndex
      }
      
      // Only a is default
      if (aIndex !== -1) return -1
      
      // Only b is default
      if (bIndex !== -1) return 1
      
      // Neither is default, sort by name
      return a.name.localeCompare(b.name)
    })
  }
}
