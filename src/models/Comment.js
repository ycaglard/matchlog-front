/**
 * Comment class representing a comment on a match
 */
export class Comment {
  /**
   * Create a new Comment instance
   * @param {Object} data - Comment data
   * @param {string} data.id - Comment ID (MongoDB ObjectId)
   * @param {string} data.text - Comment text
   * @param {Date|string} data.createdAt - Creation date
   * @param {string} data.userId - User ID (MongoDB ObjectId)
   * @param {string} data.username - Username
   * @param {string} data.userEmail - User email
   * @param {number} data.eventId - Match ID (still called eventId for API compatibility)
   */
  constructor(data = {}) {
    this.id = data.id || '' // Changed from number to string (MongoDB ObjectId)
    this.text = data.text || ''
    this.createdAt = data.createdAt ? new Date(data.createdAt) : null
    this.userId = data.userId || '' // Changed from number to string (MongoDB ObjectId)
    this.username = data.username || ''
    this.userEmail = data.userEmail || ''
    this.eventId = data.eventId || null // Still called eventId, refers to matchId
  }

  /**
   * Get formatted date
   * @returns {string} Formatted date string
   */
  getFormattedDate() {
    if (!this.createdAt) return ''
    return this.createdAt.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  /**
   * Convert comment to plain object (for API requests)
   * @returns {Object} Plain object representation
   */
  toJSON() {
    return {
      id: this.id,
      text: this.text,
      createdAt: this.createdAt?.toISOString(),
      userId: this.userId,
      username: this.username,
      userEmail: this.userEmail,
      eventId: this.eventId
    }
  }

  /**
   * Create Comment instance from API response
   * @param {Object} data - API response data
   * @returns {Comment} Comment instance
   */
  static fromJSON(data) {
    return new Comment(data)
  }
}

export default Comment
