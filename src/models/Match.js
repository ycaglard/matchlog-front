/**
 * Match class representing a football match with all nested data
 */
export class Match {
  constructor(data = {}) {
    this.id = data.id || null
    this.utcDate = data.utcDate ? new Date(data.utcDate) : null
    this.status = data.status || 'SCHEDULED'
    this.matchday = data.matchday || null
    this.stage = data.stage || null
    this.group = data.group || null
    this.lastUpdated = data.lastUpdated ? new Date(data.lastUpdated) : null
    
    // Nested objects
    this.area = data.area ? new Area(data.area) : null
    this.competition = data.competition ? new Competition(data.competition) : null
    this.season = data.season ? new Season(data.season) : null
    this.homeTeam = data.homeTeam ? new TeamInfo(data.homeTeam) : null
    this.awayTeam = data.awayTeam ? new TeamInfo(data.awayTeam) : null
    this.score = data.score ? new Score(data.score) : null
    
    // Comments embedded in match
    this.comments = data.comments ? data.comments.map(c => new CommentRef(c)) : []
  }

  /**
   * Get match description
   * @returns {string} Match description
   */
  getMatchDescription() {
    return `${this.homeTeam?.name || 'TBD'} vs ${this.awayTeam?.name || 'TBD'}`
  }

  /**
   * Get formatted date
   * @returns {string} Formatted date string
   */
  getFormattedDate() {
    if (!this.utcDate) return ''
    return this.utcDate.toLocaleDateString('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  /**
   * Check if match is finished
   * @returns {boolean} True if match is finished
   */
  isFinished() {
    return this.status === 'FINISHED'
  }

  /**
   * Check if match is upcoming
   * @returns {boolean} True if match is upcoming
   */
  isUpcoming() {
    return ['SCHEDULED', 'TIMED'].includes(this.status)
  }

  /**
   * Check if match is live
   * @returns {boolean} True if match is live
   */
  isLive() {
    return ['IN_PLAY', 'PAUSED'].includes(this.status)
  }

  /**
   * Get comment count
   * @returns {number} Number of comments
   */
  getCommentCount() {
    return this.comments?.length || 0
  }

  /**
   * Convert to JSON
   * @returns {Object} JSON representation
   */
  toJSON() {
    return {
      id: this.id,
      utcDate: this.utcDate?.toISOString(),
      status: this.status,
      matchday: this.matchday,
      stage: this.stage,
      group: this.group,
      lastUpdated: this.lastUpdated?.toISOString(),
      area: this.area?.toJSON(),
      competition: this.competition?.toJSON(),
      season: this.season?.toJSON(),
      homeTeam: this.homeTeam?.toJSON(),
      awayTeam: this.awayTeam?.toJSON(),
      score: this.score?.toJSON(),
      comments: this.comments?.map(c => c.toJSON())
    }
  }

  /**
   * Create Match from JSON
   * @param {Object} json - JSON object
   * @returns {Match} Match instance
   */
  static fromJSON(json) {
    return new Match(json)
  }
}

/**
 * Area class representing geographical area
 */
export class Area {
  constructor(data = {}) {
    this.id = data.id || null
    this.name = data.name || ''
    this.code = data.code || ''
    this.flag = data.flag || ''
  }

  toJSON() {
    return {
      id: this.id,
      name: this.name,
      code: this.code,
      flag: this.flag
    }
  }
}

/**
 * Competition class representing a football competition
 */
export class Competition {
  constructor(data = {}) {
    this.id = data.id || null
    this.name = data.name || ''
    this.code = data.code || ''
    this.type = data.type || ''
    this.emblem = data.emblem || ''
  }

  toJSON() {
    return {
      id: this.id,
      name: this.name,
      code: this.code,
      type: this.type,
      emblem: this.emblem
    }
  }
}

/**
 * Season class representing a competition season
 */
export class Season {
  constructor(data = {}) {
    this.id = data.id || null
    this.startDate = data.startDate ? new Date(data.startDate) : null
    this.endDate = data.endDate ? new Date(data.endDate) : null
    this.currentMatchday = data.currentMatchday || null
    this.winner = data.winner ? new TeamInfo(data.winner) : null
  }

  toJSON() {
    return {
      id: this.id,
      startDate: this.startDate?.toISOString(),
      endDate: this.endDate?.toISOString(),
      currentMatchday: this.currentMatchday,
      winner: this.winner?.toJSON()
    }
  }
}

/**
 * TeamInfo class representing team information
 */
export class TeamInfo {
  constructor(data = {}) {
    this.id = data.id || null
    this.name = data.name || ''
    this.shortName = data.shortName || ''
    this.tla = data.tla || ''
    this.crest = data.crest || ''
    this.address = data.address || ''
    this.website = data.website || ''
    this.founded = data.founded || null
    this.clubColors = data.clubColors || ''
    this.venue = data.venue || ''
    this.lastUpdated = data.lastUpdated ? new Date(data.lastUpdated) : null
  }

  toJSON() {
    return {
      id: this.id,
      name: this.name,
      shortName: this.shortName,
      tla: this.tla,
      crest: this.crest,
      address: this.address,
      website: this.website,
      founded: this.founded,
      clubColors: this.clubColors,
      venue: this.venue,
      lastUpdated: this.lastUpdated?.toISOString()
    }
  }
}

/**
 * Score class representing match score
 */
export class Score {
  constructor(data = {}) {
    this.winner = data.winner || null // 'HOME_TEAM', 'AWAY_TEAM', 'DRAW'
    this.duration = data.duration || 'REGULAR' // 'REGULAR', 'EXTRA_TIME', 'PENALTY_SHOOTOUT'
    this.fullTime = data.fullTime ? new TimeScore(data.fullTime) : null
    this.halfTime = data.halfTime ? new TimeScore(data.halfTime) : null
  }

  /**
   * Get score display string
   * @returns {string} Score display (e.g., "2 - 1" or "vs")
   */
  getScoreDisplay() {
    if (!this.fullTime || (this.fullTime.home === null && this.fullTime.away === null)) {
      return 'vs'
    }
    return `${this.fullTime.home ?? '-'} - ${this.fullTime.away ?? '-'}`
  }

  toJSON() {
    return {
      winner: this.winner,
      duration: this.duration,
      fullTime: this.fullTime?.toJSON(),
      halfTime: this.halfTime?.toJSON()
    }
  }
}

/**
 * TimeScore class representing score at a specific time
 */
export class TimeScore {
  constructor(data = {}) {
    this.home = data.home ?? null
    this.away = data.away ?? null
  }

  toJSON() {
    return {
      home: this.home,
      away: this.away
    }
  }
}

/**
 * CommentRef class representing a comment reference embedded in match
 */
export class CommentRef {
  constructor(data = {}) {
    this.id = data.id || '' // MongoDB ObjectId as string
    this.text = data.text || ''
    this.createdAt = data.createdAt ? new Date(data.createdAt) : null
    this.userId = data.userId || '' // MongoDB ObjectId as string
    this.username = data.username || ''
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

  toJSON() {
    return {
      id: this.id,
      text: this.text,
      createdAt: this.createdAt?.toISOString(),
      userId: this.userId,
      username: this.username
    }
  }
}

// Export all classes
export default {
  Match,
  Area,
  Competition,
  Season,
  TeamInfo,
  Score,
  TimeScore,
  CommentRef
}
