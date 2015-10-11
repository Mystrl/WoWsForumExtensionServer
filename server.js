var http = require('http'), url = require('url'), pg = require('pg'), async = require('async');

function init() {
	const port = 8001;

	var server = http.createServer(function(request, response) {

		if (request.url === '/favicon.ico') {
			//r.writeHead(200, {'Content-Type': 'image/x-icon'} );
			response.end();
			return;
		}

		var parsedUrl = url.parse(request.url, true);
		var queryAsObject = parsedUrl.query;

		//userid is a comma delimited array
		var userid = queryAsObject.userid;
		var idArray = userid.split(",");

		getResponseData(idArray, response);
	});
	server.listen(process.env.PORT || port);
}

/*
 *
 * @param {int array} userid - array of userids we need data for
 *
 */
 function getResponseData(userid, response) {
	//split user ids into cached and notcached
	//use getUserData to get jsons for ids not in cache
	//user getFromCache for ids in cache
	inCache(userid, function(useridInCache, useridNotCached) {
		//remember to update count
		//we build a responseJSON from cached and uncached data
		var responseJSON = {"status":"ok","meta":{"count":0},"data":{}};
		if (useridInCache.length > 0) {
			/*
			for (var cachedUserIDIndex = 0; cachedUserIDIndex < useridInCache.length; cachedUserIDIndex++) {
				var userid = useridInCache[cachedUserIDIndex]
				var jsonFromCache = getFromCache(userid);
				responseJSON.data[userid] = jsonFromCache;
				//TODO implement getFromCache
			}
			*/
			count = 0
			async.whilst(
				function () {return count < useridInCache.length},
				function (callback) {
					var userid = useridInCache[count];
					getFromCache(userid, function(jsonFromCache) {
						responseJSON.data[userid] = jsonFromCache;
						count++;
						setTimeout(callback, 50);
					});
				},
				function(err) {
					//if there are uncached user ids we need to get them from the api and then add them to responseJSON before sending it to the client
					if (useridNotCached.length > 0) {
						getUserData(useridNotCached, function(jsonString) {
						//split the user data so we can store it as individual enteries
							for (var unCachedUserIdIndex = 0; unCachedUserIdIndex < useridNotCached.length; unCachedUserIdIndex++) {
								var accessID = useridNotCached[unCachedUserIdIndex];
								var json = JSON.parse(jsonString);
								storeData(accessID, json.data[accessID]);
								responseJSON.data[accessID] = json.data[accessID];
							}
							response.end(JSON.stringify(responseJSON));
						});
					}
					//otherwise just send responseJSON
					else {
						response.end(JSON.stringify(responseJSON));
					}
				}
			);
		}
		else {
			//if there are uncached user ids we need to get them from the api and then add them to responseJSON before sending it to the client
			if (useridNotCached.length > 0) {
				getUserData(useridNotCached, function(jsonString) {
				//split the user data so we can store it as individual enteries
					for (var unCachedUserIdIndex = 0; unCachedUserIdIndex < useridNotCached.length; unCachedUserIdIndex++) {
						var accessID = useridNotCached[unCachedUserIdIndex];
						var json = JSON.parse(jsonString);
						storeData(accessID, json.data[accessID]);
						responseJSON.data[accessID] = json.data[accessID];
					}
					response.end(JSON.stringify(responseJSON));
				});
			}
			//otherwise just send responseJSON
			else {
				response.end(JSON.stringify(responseJSON));
			}
		}
	});
}

/*
 * Returns a json containing user data on all userid's in the userid array
 *
 * @param {integer array} userid - comma delimited array of userid's we want data for
 * @param {function} callback2 - used to send result back to init();
 *
 */
function getUserData(userid, getResponseDataCallback) {
	var result = '';

	var options = {
 		host: 'api.worldofwarships.com',
 		path: '/wows/account/info/?application_id=ed959007246c32a0db3ba867fe835468&extra=statistics.pve%2C%20statistics.pve_solo%2C%20statistics.pve_div2%2C%20statistics.pve_div3%2C%20statistics.pvp_solo%2C%20statistics.pvp_div2%2C%20statistics.pvp_div3&account_id=' + userid
 	};

 	callback = function(response) {
 		var str ='';

 		response.on('data', function (chunk) {
 			str += chunk;
 		});

 		response.on('end', function() {
 			getResponseDataCallback(str);
 		})
 	}

 	http.request(options, callback).end();
 }

//TODO
// should deal with outdated information in here
function inCache(userid, returnIDArrays) {
	var count = 0;

	var useridInCache = [];
	var useridNotCached = [];
	async.whilst(
		function () {return count < userid.length},
		function (callback) {
				var query = {
					text: 'SELECT COUNT(*) FROM users WHERE userid = $1',
					values: [userid[count]]
				}


				var result = executeQuery(query, function(result) {
					if (Boolean(parseInt(result.rows[0].count))) {
						useridInCache.push(userid[count]);
							count++;
							setTimeout(callback, 50);
					}
					else {
						useridNotCached.push(userid[count]);
							count++;
							setTimeout(callback, 50);
					}
				});

		},
		function (err) {
			returnIDArrays(useridInCache, useridNotCached);
		}
	);

}

/*
 *
 * @param {int} userid - primary key of the entry we want from table users
 *
 */
function getFromCache(userid,callback) {
	var query = {
		text: 'SELECT * FROM users WHERE userid = $1',
		values: [userid]
	}

	executeQuery(query, function(result) {
		callback(result.rows[0].userData);
	});
}

/*
 * Returns a json containing user data on all userid's in the userid array
 *
 * @param {integer} userid - single user id. primary key of the table entry
 * @param {string} str - string representation of a json for one userid
 *
 */
function storeData(userid, str) {
	//build parameterized query object
	var query = {
		text: 'INSERT INTO users VALUES ($1, $2)',
		values: [userid, JSON.stringify(str)]
	}
	executeQuery(query, function(res) {
	});
 }

/*
 * Returns a json containing user data on all userid's in the userid array
 *
 * @param {object} query - parameterized sql query object
 *
 * returns result of the query or an error
 *
 */
 function executeQuery(query, callbackResponse) {
 	var conString = "postgres://cfeijyxzuzivie:Uw7oiu8MRXIwP1P9Pv_pCnEarj@ec2-54-235-162-144.compute-1.amazonaws.com:5432/d2ertkkobk0u52?ssl=true";
 	console.log(process.env);
 	var client = new pg.Client(conString);
 	//var formattedJSON = recreateJSON(str);
 	client.connect(function(err) {
 		if(err) {
 			return console.error('could not connect to postgres', err);
 		}
 		client.query(query, function(err, result) {
 			if(err) {
 				return console.error('query failed', err);
 			}
 			callbackResponse(result);
 			client.end();
 		});
 	});
 }

/*
 * When we split the json response from the wargaming api into individual users we lose part of the structure. This functions adds it back in
 *
 * @param {json} str - string represent part of our json object. We'll wrap it with some stuff
 *
 */
function recreateJSON(str) {
	var json = '{"status":"ok","meta":{"count":1},"data":' + JSON.stringify(str) +'}';
	return json;
}

init();