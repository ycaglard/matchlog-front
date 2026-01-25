/**
 * Team Model
 */
export class Team {
  constructor(data) {
    this.id = data.id
    this.name = data.name
    this.shortName = data.shortName
    this.tla = data.tla
    this.crest = data.crest
    this.address = data.address || ''
    this.website = data.website || ''
    this.founded = data.founded || null
    this.clubColors = data.clubColors || ''
    this.venue = data.venue || ''
    this.competitionId = data.competitionId || null
    this.competitionName = data.competitionName || ''
    this.competitionCode = data.competitionCode || ''
    this.area = data.area || null
    this.season = data.season || null
    this.coach = data.coach || null
    this.squad = data.squad || []
  }

  /**
   * Get team's display name
   * @returns {string}
   */
  getDisplayName() {
    return this.shortName || this.name
  }

  /**
   * Get team's logo/crest URL
   * @returns {string}
   */
  getCrestUrl() {
    return this.crest || ''
  }

  /**
   * Check if team has a squad
   * @returns {boolean}
   */
  hasSquad() {
    return Array.isArray(this.squad) && this.squad.length > 0
  }

  /**
   * Get coach name
   * @returns {string}
   */
  getCoachName() {
    return this.coach?.name || 'Unknown'
  }

  /**
   * Get formatted founded year
   * @returns {string}
   */
  getFoundedYear() {
    return this.founded ? `Founded ${this.founded}` : ''
  }

  /**
   * Static method to create Team from API response
   * @param {Object} data - Raw API response data
   * @returns {Team}
   */
  static fromApiResponse(data) {
    return new Team(data)
  }
}

export default Team
