'use strict';

const rp = require('request-promise');
const urlUtil = require('url');

class IfpaApi {
  constructor (API_KEY) {
    this.apiKey = API_KEY;
    this.baseUrl = 'https://api.ifpapinball.com';
  }

  makeRequest (path, query) {
    return rp.get({
      url: urlUtil.resolve(this.baseUrl, path),
      qs: Object.assign({ apiKey: this.apiKey }, query),
      json: true
    });
  }

  /**
   * Get past calendar events.
   * @param  {string} [country] The country whose events you wish to display. Defaults to 'United States'.
   * @param  {string} [state] The state whose events you wish to display. If specified, only this state's
   * results will be returned. Note that the state field for countries outside of the US and Canada
   * doesn't really work very well.
   * @return {object} Promise
   */
  getPastCalendarEvents (country = 'United States', state) {
    return this.makeRequest('/v1/calendar/history', { country })
      .then(results => this._getFilteredResults(results, state));
  }

  /**
   * Get active calendar events.
   * @param  {string} [country] The country whose events you wish to display. Defaults to 'United States'.
   * @param  {string} [state] The state whose events you wish to display. If specified, only this state's
   * results will be returned. Note that the state field for countries outside of the US and Canada
   * doesn't really work very well.
   * @return {object} Promise
   */
  getActiveCalendarEvents (country = 'United States', state) {
    return this.makeRequest('/v1/calendar/active', { country })
      .then(results => this._getFilteredResults(results, state));
  }

  /**
   * Retrieve player vs player information.
   * @param  {Number} playerId The player's unique ID.
   * @return {object} Returns a promise.
   */
  getPlayerVsPlayer (playerId) {
    if (!playerId) {
      return Promise.reject(new Error('playerId required'));
    }

    return this.makeRequest(`/v1/player/${playerId}/pvp`);
  }

  /**
   * Retrieve information for a specified player.
   * @param  {Number} playerId The player's unique ID.
   * @return {object} Returns a promise.
   */
  getPlayerInformation (playerId) {
    if (!playerId) {
      return Promise.reject(new Error('playerId required'));
    }

    return this.makeRequest(`/v1/player/${playerId}`);
  }

  /**
   * Retrieve history for a specified player.
   * @param  {Number} playerId The player's unique ID.
   * @return {object} Returns a promise.
   */
  getPlayerHistory (playerId) {
    if (!playerId) {
      return Promise.reject(new Error('playerId required'));
    }

    return this.makeRequest(`/v1/player/${playerId}/history`);
  }

  /**
   * Retrieve tournament results for a specified player.
   * @param  {Number} playerId The player's unique ID.
   * @return {object} Returns a promise.
   */
  getPlayerResults (playerId) {
    if (!playerId) {
      return Promise.reject(new Error('playerId required'));
    }

    return this.makeRequest(`/v1/player/${playerId}/results`);
  }

  /**
   * Retrieve list of country directors.
   * @return {object} Returns a promise.
   */
  getCountryDirectors () {
    return this.makeRequest('/v1/player/country_directors');
  }

  /**
   * Search IFPA players by name.
   * @param  {string} name The player's name to search. This will match any part of a player's first or last names.
   * @return {object} Returns a promise.
   */
  searchPlayersByName (name) {
    if (!name) {
      return Promise.reject(new Error('name required'));
    }

    return this.makeRequest('/v1/player/search', { q: name });
  }

  /**
   * Search IFPA players by email.
   * @param  {string} The player's email to search.
   * @return {object} Returns a promise.
   */
  searchPlayersByEmail (email) {
    if (!email) {
      return Promise.reject(new Error('email required'));
    }

    return this.makeRequest('/v1/player/search', { email });
  }

  /**
   * Get IFPA rankings.
   * @param  {integer} startPos Return rankings starting from this position.
   * @param  {integer} count    The number of rankings to be returned.
   * @param  {string} order    Order rankings based on any of 'points', 'rating', 'eff_pct'.
   * @return {object}          Rankings object.
   */
  getRankings (startPos, count, order) {
    const query = {};
    if (startPos) {
      query.start_pos = startPos;
    }

    if (count) {
      query.count = count;
    }

    if (order) {
      query.order = order;
    }

    return this.makeRequest('/v1/rankings', query);
  }

  /**
   * Get biggest movers in terms of ranking position this year (top 250).
   */
  getBiggestMovers () {
    return this.makeRequest('/v1/stats/biggest_movers');
  }

  _getFilteredResults (results = {}, state) {
    const filteredResults = {};
    if (results.calendar) {
      filteredResults.calendar = state ? results.calendar.filter(item => item.state === state) : [].concat(results.calendar);
      filteredResults.dictionary = this._getTournamentIdDictionary(filteredResults.calendar);
    }

    return filteredResults;
  }

  _getTournamentIdDictionary (calendar = []) {
    return calendar.reduce((dictionary, result) => {
      dictionary[result.tournament_id] = result;
      return dictionary;
    }, {});
  }
}

module.exports = IfpaApi;
