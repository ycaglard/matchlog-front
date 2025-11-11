import { computed } from 'vue'
import { authStore } from '../store/authStore.js'
import { createComment } from './eventClient.js'

/**
 * Composable for managing comments with authentication
 * Ensures users are authenticated before creating comments
 */
export const useAuthenticatedComments = () => {
  const currentUser = computed(() => authStore.user)
  const isAuthenticated = computed(() => authStore.isAuthenticated)
  const currentUserId = computed(() => authStore.user?.id || null)

  /**
   * Create a comment with authentication check
   * @param {Object} commentData - Comment data
   * @param {string} commentData.text - Comment text
   * @param {number} commentData.eventId - Event ID
   * @returns {Promise<Object>} Created comment
   * @throws {Error} If user is not authenticated
   */
  const createAuthenticatedComment = async (commentData) => {
    if (!isAuthenticated.value || !currentUserId.value) {
      throw new Error('You must be logged in to create a comment')
    }

    return await createComment({
      text: commentData.text,
      userId: currentUserId.value,
      eventId: commentData.eventId
    })
  }

  /**
   * Check if current user can edit/delete a comment
   * @param {number} commentUserId - User ID who created the comment
   * @returns {boolean} True if user can modify the comment
   */
  const canModifyComment = (commentUserId) => {
    if (!isAuthenticated.value || !currentUserId.value) {
      return false
    }

    // User can modify their own comments or if they're admin
    return currentUserId.value === commentUserId || authStore.user?.isAdmin()
  }

  return {
    currentUser,
    isAuthenticated,
    currentUserId,
    createAuthenticatedComment,
    canModifyComment
  }
}

export default useAuthenticatedComments
