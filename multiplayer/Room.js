/**
 * @typedef {String} PlayerId
 */

/**
 * @typedef {Object} PlayerPOJO
 * @property {Array} xyz - Initial position
 * @property {Array} rot - Initial rotation
 * @property {Array} url - Avatar URL
 * @property {Array} usr - Username
 */

/**
 * @typedef {Object} SpatialPOJO
 * @property {Array<Number>} xyz - Updated position.
 * @property {Array<Number>} rot - Updated rotation.
 * @property {string} fsm - The FSM state.
 */

/** @constructor */
export default function Room(roomId) {
  /**
   * store players scores
   * @type Map<PlayerId, PlayerPOJO> */
  const players = new Map();

  /**
   * store players teams
   * @type Set<PlayerId> */
  const teamA = new Set();
  const teamB = new Set();

  /** STORE SCREENS DONE */
  const screens = new Set();

  /** Add a player to allowed player's list
   * @param {PlayerId} playerId
   * @param {PlayerPOJO} player
   */
  this.add = (playerId, player) => {
    if (
      !players.has(playerId) &&
      !teamA.has(playerId) &&
      !teamB.has(playerId)
    ) {
      if (teamA.size < 2 && teamB.size < 2) {
        if (teamA.size <= teamB.size) {
          teamA.add(playerId);
        } else {
          teamB.add(playerId);
        }
      } else if (teamA.size < 2) {
        teamA.add(playerId);
      } else if (teamB.size < 2) {
        teamB.add(playerId);
      }
      players.set(playerId, player);
    }
  };

  /**
   * Returns a player that's in this room.
   * @param {PlayerId} playerId
   * @returns
   */
  this.get = (playerId) => {
    if (players.has(playerId)) {
      return players.get(playerId);
    }
  };

  /**
   * Delete all trace of this player's in this room.
   * @param {PlayerId} playerId
   */
  this.delete = (playerId) => {
    players.has(playerId) && players.delete(playerId);
    teamA.has(playerId) && teamA.delete(playerId);
    teamB.has(playerId) && teamB.delete(playerId);
    screens.clear();
  };

  /**
   * Update spatial data
   * @param {PlayerId} playerId - The player's connection id.
   * @param {SpatialPOJO} nextData - The next data received from client.
   */
  this.update = (playerId, nextData) => {
    if (!screens.has(nextData.screenId)) {
      screens.add(nextData.screenId);
      const p = players.get(playerId);
      if (p && p.hasOwnProperty("score")) {
        p.score += 10;
        players.set(playerId, p);
      }
    }
  };

  /** Return all player id's in this room */
  this.connections = () => [
    ...Array.from(teamA.values()),
    ...Array.from(teamB.values()),
  ];

  this.playersPerTeam = () => {
    const ppt = {
      a: Array.from(teamA).map((sktId) => players.get(sktId)),
      b: Array.from(teamB).map((sktId) => players.get(sktId)),
    };
    return ppt;
  };

  this.$ids = () => [...Array.from(teamA), ...Array.from(teamB)];

  this.$id = () => roomId;
}
