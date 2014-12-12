var request = require('request');
var Q = require('q');

var ifpaApi = function(API_KEY){
	var apiKey = API_KEY;
	var baseUrl = 'https://api.ifpapinball.com/v1/';

	var getIfpaError = function(httpStatusCode){
		var errorMessage = 'An error occured while accessing IFPA API';

		if(httpStatusCode !== null && typeof httpStatusCode === 'number'){
			switch(httpStatusCode){
				case 400:
		       		errorMessage = 'A parameter is missing or is invalid';
		        	break;
		    	case 401:
		        	errorMessage = 'Authentication failed';
		        	break;
		        case 404:
		        	errorMessage = 'Resource cannot be found';
		        	break;
		        case 405:
		        	errorMessage = 'HTTP method not allowed';
		        case 429:
		        	errorMessage = 'Rate limit exceeded';
		        	break;
		        case 500:
		        	errorMessage = 'Server error';
		        	break;
			    default:
	        		errorMessage = 'Got HTTP status code ' + httpStatusCode;
        	}
		}

		return errorMessage;
    };

	var makeRequest = function(url){
		var deferred = Q.defer();
		request.get(url, function (err, res, body) {
		    if (err){
		    	if(res && typeof res.statusCode !== null){
		    		console.log(getIfpaError(res.statusCode));
		    	}

		    	deferred.reject(err);
		    }
    		else {
			    deferred.resolve(JSON.parse(body));
    		}
		});

		return deferred.promise;
	};

	/**
	 * Search players by name or email.
	 * @param  {string} param The name or email to search
	 * @param  {string} [type] Whether this is a name search or an email search
	 * @return {object} Returns a Q deferred promise.
	 */
	var searchPlayers = function(param, type) {
	    // The player search function only works with email OR name searches, not both.
	    var fragment = '&q=';
	    if (type == 'email') {
	      fragment = '&email=';
	    }

	    var url = baseUrl + 'player/search?api_key=' + apiKey + fragment + param;
	   	return makeRequest(url);
  	}

  	/**
  	 * Get calendar events.
  	 * @param  {string} [country] The country whose events you wish to display. Defaults to 'United States'.
  	 * @param  {string} [state]	The state whose events you wish to display. If specified, only this state's
  	 * results will be returned. Note that the state field for countries outside of the US and Canada 
  	 * doesn't really work very well.
  	 * @param  {[boolean]} past If set to true, return past events rather than current events. Defaults
   *   to false. NOTE: Historical result sets can be very large.
  	 * @return {object} Returns a Q deferred promise.
  	 */
	this.getCalendarEvents = function(country, state, past){
		var deferred = Q.defer();

		country = country || 'United States';
		var type = past === true ? 'history' : 'active';

		var url = baseUrl + 'calendar/' + type + '?api_key=' + apiKey + '&country=' + encodeURIComponent(country);
		makeRequest(url).then(
			function(results) {
				if (results.total_entries) {
					// convert to dictionary by id
			    	var idDictionary = {};
			    	var matches = 0;
			    	for(var i=0; i<results.calendar.length; i++){
			    		var result = results.calendar[i];
			    		// filter by state if provided
						if (!state || (state && result.state == state)) {
							matches++;
							idDictionary[result.calendar_id] = result;
						}
			    	}

					results.calendar = idDictionary;
					results.total_entries = matches;
				}

				deferred.resolve(results);
			},
			function(err){
				deferred.reject(err);
			}
		);

		return deferred.promise;
	};

	/**
	 * Retrieve player vs player information.
	 * @param  {Number} playerId The player's unique ID.
	 * @return {object} Returns a Q deferred promise.
	 */
	this.getPlayerVsPlayer = function(playerId){
		var url = baseUrl + 'player/' + playerId + '/pvp?api_key=' + apiKey;
		return makeRequest(url);
	};

	/**
	 * Retrieve information for a specified player.
	 * @param  {Number} playerId The player's unique ID.
	 * @return {object} Returns a Q deferred promise.
	 */
	this.getPlayerInformation = function(playerId){
		var url = baseUrl + 'player/' + playerId + '?api_key=' + apiKey;
		return makeRequest(url);
	};

	/**
	 * Retrieve history for a specified player.
	 * @param  {Number} playerId The player's unique ID.
	 * @return {object} Returns a Q deferred promise.
	 */
	this.getPlayerHistory = function(playerId){
		var url = baseUrl + 'player/' + playerId + '/history?api_key=' + apiKey;
		return makeRequest(url);
	};

	/**
	 * Retrieve list of country directors.
	 * @return {object} Returns a Q deferred promise.
	 */
	this.getCountryDirectors = function(){
		var url = baseUrl + 'player/country_directors?api_key=' + apiKey;
		return makeRequest(url);
	};

	/**
	 * Search IFPA players by name.
	 * @param  {string} name The player's name to search. This will match any part of a player's first or last names.
	 * @return {object} Returns a Q deferred promise.
	 */
	this.searchPlayersByName = function(name){
		return searchPlayers(name, 'name');
	};

	/**
	 * Search IFPA players by email.
	 * @param  {string} The player's email to search.
	 * @return {object} Returns a Q deferred promise.
	 */
	this.searchPlayersByEmail = function(email){
		return searchPlayers(email, 'email');
	};
};

module.exports = ifpaApi;