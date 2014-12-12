var request = require('request');
var Q = require('q');

var ifpaApi = function(API_KEY){
	var apiKey = API_KEY;
	var baseUrl = "https://api.ifpapinball.com/v1/";

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

	this.getCalendarEvents = function(country, state, past){
		var deferred = Q.defer();

		country = country || 'United States';
		var type = past === false ? 'history' : 'active';

		var url = baseUrl + 'calendar/' + type + "?api_key=" + apiKey + '&country=' + encodeURIComponent(country);
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

	this.getPlayerVsPlayer = function(playerId){
		var url = baseUrl + 'player/' + playerId + "/pvp?api_key=" + apiKey;
		return makeRequest(url);
	};
};

module.exports = ifpaApi;