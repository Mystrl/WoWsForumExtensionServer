var http = require('http'), url = require('url'), express = require('express'), pg = require('pg');

function init() {
	const port = 8001;

	var server = http.createServer(function(request, response) {
		response.setHeader('Access-Control-Allow-Origin', 'chrome-extension://pmbkfeiiphpkcbenfodfeoclgbinpdmb');
		response.setHeader('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
		response.setHeader('Access-Control-Allow-Headers', 'Content-Type');

		var parsedUrl = url.parse(request.url, true);
		var queryAsObject = parsedUrl.query;

		var userid = queryAsObject.userid;

		getUserData(userid, function(response2) {
			response.end(response2);
		})
	});
	server.listen(process.env.PORT || port);
}

function getUserData(userid, callback2) {
	var result = '';
	var options = {
		host: 'api.worldofwarships.com',
		path: '/wows/account/info/?application_id=demo&extra=statistics.pvp_solo&account_id=' + userid
	};

	callback = function(response) {
		var str ='';

		response.on('data', function (chunk) {
			str += chunk;
		});

		response.on('end', function() {
			storeData(userid, str);
			return callback2(str);
		})
	}
	
	http.request(options, callback).end();
}

function storeData(userid, str) {
	var conString = "postgres://postgres:@localhost/extensionCache";
	var client = new pg.Client(process.env.DATABASE_URL);
	client.connect(function(err) {
		if(err) {
			return console.error('could not connect to postgres', err);
		}
		client.query('INSERT INTO users VALUES (' + userid + ", '" + str +"');", function(err, result) {
			if(err) {
				return;
			}
			client.end();
		});
	});

}

init();