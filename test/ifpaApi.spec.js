/* eslint-env mocha */
'use strict';

const assert = require('chai').assert;
const nock = require('nock');
const IfpaApi = require('../src/ifpaApi');

const apiKey = 'testKey';
const ifpaApi = new IfpaApi(apiKey);

describe('ifpaApi', () => {
  beforeEach(() => {
    assert(nock.isDone());
    nock.disableNetConnect();
  });

  afterEach(() => {
    nock.enableNetConnect();
  });

  describe('_getTournamentIdDictionary', () => {
    it('should create dictionary from calendar', () => {
      const calendar = [
        { state: 'Yukon', tournament_id: 1 },
        { state: 'Alberta', tournament_id: 2 }
      ];

      const expected = {
        1: { state: 'Yukon', tournament_id: 1 },
        2: { state: 'Alberta', tournament_id: 2 }
      };

      const dictionary = ifpaApi._getTournamentIdDictionary(calendar);
      assert.deepEqual(dictionary, expected);
    });

    it('should handle missing calendar', () => {
      const expected = {};

      const dictionary = ifpaApi._getTournamentIdDictionary();
      assert.deepEqual(dictionary, expected);
    });
  });

  describe('_getFilteredResults', () => {
    it('should filter calendar and dictionary by state', () => {
      const state = 'Yukon';
      const results = {
        calendar: [
          { state: 'Yukon', tournament_id: 1 },
          { state: 'Alberta', tournament_id: 2 }
        ]
      };

      const expected = {
        calendar: [
          { state: 'Yukon', tournament_id: 1 }
        ],
        dictionary: {
          1: { state: 'Yukon', tournament_id: 1 }
        }
      };

      const ret = ifpaApi._getFilteredResults(results, state);
      assert.deepEqual(ret, expected);
    });

    it('should work without state filter', () => {
      const results = {
        calendar: [
          { state: 'Yukon', tournament_id: 1 },
          { state: 'Alberta', tournament_id: 2 }
        ]
      };

      const expected = {
        calendar: [
          { state: 'Yukon', tournament_id: 1 },
          { state: 'Alberta', tournament_id: 2 }
        ],
        dictionary: {
          1: { state: 'Yukon', tournament_id: 1 },
          2: { state: 'Alberta', tournament_id: 2 }
        }
      };

      const ret = ifpaApi._getFilteredResults(results);
      assert.deepEqual(ret, expected);
    });

    it('should handle missing calendar', () => {
      const results = {};
      const expected = {};

      const ret = ifpaApi._getFilteredResults(results);
      assert.deepEqual(ret, expected);
    });

    it('should handle missing results', () => {
      const expected = {};

      const ret = ifpaApi._getFilteredResults();
      assert.deepEqual(ret, expected);
    });
  });

  describe('getPastCalendarEvents', () => {
    it('should default to United States', () => {
      nock(ifpaApi.baseUrl)
        .get('/v1/calendar/history')
        .query({
          apiKey,
          country: 'United States'
        })
        .reply(200);

      return ifpaApi.getPastCalendarEvents();
    });

    it('should request specified country', () => {
      nock(ifpaApi.baseUrl)
        .get('/v1/calendar/history')
        .query({
          apiKey,
          country: 'Canada'
        })
        .reply(200);

      return ifpaApi.getPastCalendarEvents('Canada');
    });

    it('should add dictionary by tournamentId to results', () => {
      nock(ifpaApi.baseUrl)
        .get('/v1/calendar/history')
        .query({
          apiKey,
          country: 'Canada'
        })
        .reply(200, {
          calendar: [
            { state: 'Yukon', tournament_id: 1 },
            { state: 'Alberta', tournament_id: 2 }
          ]
        });

      return ifpaApi.getPastCalendarEvents('Canada')
        .then(results => {
          assert.deepEqual(results.dictionary, {
            1: { state: 'Yukon', tournament_id: 1 },
            2: { state: 'Alberta', tournament_id: 2 }
          });
        });
    });

    it('should filter calendar and dictionary by state', () => {
      nock(ifpaApi.baseUrl)
        .get('/v1/calendar/history')
        .query({
          apiKey,
          country: 'Canada'
        })
        .reply(200, {
          calendar: [
            { state: 'Yukon', tournament_id: 1 },
            { state: 'Alberta', tournament_id: 2 }
          ]
        });

      return ifpaApi.getPastCalendarEvents('Canada', 'Yukon')
        .then(results => {
          assert.deepEqual(results, {
            calendar: [
              { state: 'Yukon', tournament_id: 1 }
            ],
            dictionary: {
              1: { state: 'Yukon', tournament_id: 1 }
            }
          });
        });
    });
  });

  describe('getActiveCalendarEvents', () => {
    it('should default to United States', () => {
      nock(ifpaApi.baseUrl)
        .get('/v1/calendar/active')
        .query({
          apiKey,
          country: 'United States'
        })
        .reply(200);

      return ifpaApi.getActiveCalendarEvents();
    });

    it('should request specified country', () => {
      nock(ifpaApi.baseUrl)
        .get('/v1/calendar/active')
        .query({
          apiKey,
          country: 'Canada'
        })
        .reply(200);

      return ifpaApi.getActiveCalendarEvents('Canada');
    });

    it('should add dictionary by tournamentId to results', () => {
      nock(ifpaApi.baseUrl)
        .get('/v1/calendar/active')
        .query({
          apiKey,
          country: 'Canada'
        })
        .reply(200, {
          calendar: [
            { state: 'Yukon', tournament_id: 1 },
            { state: 'Alberta', tournament_id: 2 }
          ]
        });

      return ifpaApi.getActiveCalendarEvents('Canada')
        .then(results => {
          assert.deepEqual(results.dictionary, {
            1: { state: 'Yukon', tournament_id: 1 },
            2: { state: 'Alberta', tournament_id: 2 }
          });
        });
    });

    it('should filter calendar and dictionary by state', () => {
      nock(ifpaApi.baseUrl)
        .get('/v1/calendar/active')
        .query({
          apiKey,
          country: 'Canada'
        })
        .reply(200, {
          calendar: [
            { state: 'Yukon', tournament_id: 1 },
            { state: 'Alberta', tournament_id: 2 }
          ]
        });

      return ifpaApi.getActiveCalendarEvents('Canada', 'Yukon')
        .then(results => {
          assert.deepEqual(results, {
            calendar: [
              { state: 'Yukon', tournament_id: 1 }
            ],
            dictionary: {
              1: { state: 'Yukon', tournament_id: 1 }
            }
          });
        });
    });
  });

  describe('getPlayerVsPlayer', () => {
    it('should request specified playerId', () => {
      nock(ifpaApi.baseUrl)
        .get('/v1/player/1/pvp')
        .query({
          apiKey
        })
        .reply(200);

      return ifpaApi.getPlayerVsPlayer(1);
    });

    it('should reject on missing playerId', () => {
      return ifpaApi.getPlayerVsPlayer()
        .catch(err => {
          assert.strictEqual(err.message, 'playerId required');
        });
    });
  });

  describe('getPlayerInformation', () => {
    it('should request specified playerId', () => {
      nock(ifpaApi.baseUrl)
        .get('/v1/player/1')
        .query({
          apiKey
        })
        .reply(200);

      return ifpaApi.getPlayerInformation(1);
    });

    it('should reject on missing playerId', () => {
      return ifpaApi.getPlayerInformation()
        .catch(err => {
          assert.strictEqual(err.message, 'playerId required');
        });
    });
  });

  describe('getPlayerHistory', () => {
    it('should request specified playerId', () => {
      nock(ifpaApi.baseUrl)
        .get('/v1/player/1/history')
        .query({
          apiKey
        })
        .reply(200);

      return ifpaApi.getPlayerHistory(1);
    });

    it('should reject on missing playerId', () => {
      return ifpaApi.getPlayerHistory()
        .catch(err => {
          assert.strictEqual(err.message, 'playerId required');
        });
    });
  });

  describe('getPlayerResults', () => {
    it('should request specified playerId', () => {
      nock(ifpaApi.baseUrl)
        .get('/v1/player/1/results')
        .query({
          apiKey
        })
        .reply(200);

      return ifpaApi.getPlayerResults(1);
    });

    it('should reject on missing playerId', () => {
      return ifpaApi.getPlayerHistory()
        .catch(err => {
          assert.strictEqual(err.message, 'playerId required');
        });
    });
  });

  describe('getCountryDirectors', () => {
    it('should make expected request', () => {
      nock(ifpaApi.baseUrl)
        .get('/v1/player/country_directors')
        .query({
          apiKey
        })
        .reply(200);

      return ifpaApi.getCountryDirectors(1);
    });
  });

  describe('searchPlayersByName', () => {
    it('should request specified name', () => {
      const name = 'Bob';

      nock(ifpaApi.baseUrl)
        .get('/v1/player/search')
        .query({
          q: name,
          apiKey
        })
        .reply(200);

      return ifpaApi.searchPlayersByName(name);
    });

    it('should reject on missing name', () => {
      return ifpaApi.searchPlayersByName()
        .catch(err => {
          assert.strictEqual(err.message, 'name required');
        });
    });
  });

  describe('searchPlayersByEmail', () => {
    it('should request specified email', () => {
      const email = 'bob@gmail.com';

      nock(ifpaApi.baseUrl)
        .get('/v1/player/search')
        .query({
          email,
          apiKey
        })
        .reply(200);

      return ifpaApi.searchPlayersByEmail(email);
    });

    it('should reject on missing email', () => {
      return ifpaApi.searchPlayersByEmail()
        .catch(err => {
          assert.strictEqual(err.message, 'email required');
        });
    });
  });

  describe('getRankings', () => {
    it('should make expected default request', () => {
      nock(ifpaApi.baseUrl)
        .get('/v1/rankings')
        .query({
          apiKey
        })
        .reply(200);

      return ifpaApi.getRankings();
    });

    it('should make expected request with parameters', () => {
      const startPos = 10;
      const count = 10;
      const order = 'eff_pct';

      nock(ifpaApi.baseUrl)
        .get('/v1/rankings')
        .query({
          start_pos: startPos,
          count,
          order,
          apiKey
        })
        .reply(200);

      return ifpaApi.getRankings(startPos, count, order);
    });
  });

  describe('getBiggestMovers', () => {
    it('should make expected request', () => {
      nock(ifpaApi.baseUrl)
        .get('/v1/stats/biggest_movers')
        .query({
          apiKey
        })
        .reply(200);

      return ifpaApi.getBiggestMovers();
    });
  });
});
