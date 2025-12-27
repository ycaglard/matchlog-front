/**
 * User class representing a user in the system
 */
export class User {
  /**
   * Create a new User instance
   * @param {Object} data - User data
   * @param {string} data.id - User ID (MongoDB ObjectId)
   * @param {string} data.username - Username
   * @param {string} data.email - User email
   * @param {string[]} [data.roles] - User roles for authorization
   * @param {string} [data.profilePicture] - Profile picture URL
   * @param {Date|string} [data.createdAt] - Account creation date
   */
  constructor(data = {}) {
    this.id = data.id || ''
    this.username = data.username || ''
    this.email = data.email || ''
    this.roles = data.roles || ['USER']
    this.profilePicture = data.profilePicture || null
    this.createdAt = data.createdAt ? new Date(data.createdAt) : null
  }

  /**
   * Check if user has a specific role
   * @param {string} role - Role to check
   * @returns {boolean} True if user has the role
   */
  hasRole(role) {
    return this.roles.includes(role)
  }

  /**
   * Check if user is an admin
   * @returns {boolean} True if user is an admin
   */
  isAdmin() {
    return this.hasRole('ADMIN')
  }

  /**
   * Check if user is a moderator
   * @returns {boolean} True if user is a moderator
   */
  isModerator() {
    return this.hasRole('MODERATOR')
  }

  /**
   * Get user's display name
   * @returns {string} Display name (username or email)
   */
  getDisplayName() {
    return this.username || this.email
  }

  /**
   * Get user's initials for avatar
   * @returns {string} User initials
   */
  getInitials() {
    if (this.username) {
      const parts = this.username.split(' ')
      if (parts.length > 1) {
        return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
      }
      return this.username.substring(0, 2).toUpperCase()
    }
    return this.email ? this.email[0].toUpperCase() : 'U'
  }

  /**
   * Convert user to plain object (for API requests)
   * @returns {Object} Plain object representation
   */
  toJSON() {
    return {
      id: this.id,
      username: this.username,
      email: this.email,
      roles: this.roles,
      profilePicture: this.profilePicture,
      createdAt: this.createdAt
    }
  }

  /**
   * Create User instance from API response
   * @param {Object} data - API response data
   * @returns {User} User instance
   */
  static fromJSON(data) {
    return new User(data)
  }
}

export default User
