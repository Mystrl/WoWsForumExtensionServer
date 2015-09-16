var http, res, x;

http = require('http');
res = '{"status":"ok","meta":{"count":1},"data":{"1013356250":{"last_battle_time":1442391283,"account_id":1013356250,"leveling_tier":9,"created_at":1435262988,"leveling_points":2104323,"updated_at":1442392250,"private":null,"logout_at":1442392240,"statistics":{"distance":38441,"pvp_solo":{"max_xp":4185,"main_battery":{"max_frags_battle":5,"frags":424,"hits":27091,"max_frags_ship_id":4288624624,"shots":81420},"max_xp_ship_id":4277122768,"second_battery":{"max_frags_battle":1,"frags":11,"hits":381,"max_frags_ship_id":4279219920,"shots":2691},"max_frags_ship_id":4282365648,"xp":1885113,"survived_battles":489,"dropped_capture_points":7346,"draws":64,"planes_killed":6149,"battles":945,"survived_wins":389,"frags":1646,"max_frags_battle":8,"capture_points":779,"ramming":{"max_frags_battle":1,"frags":7,"max_frags_ship_id":4288624624},"torpedoes":{"max_frags_battle":2,"frags":38,"hits":146,"max_frags_ship_id":4292753104,"shots":1889},"max_planes_killed_ship_id":4279219920,"aircraft":{"max_frags_battle":6,"frags":779,"max_frags_ship_id":4277122768},"max_damage_dealt":273842,"max_damage_dealt_ship_id":4277122768,"wins":582,"losses":299,"damage_dealt":65835815,"max_planes_killed":71},"battles":1046,"pvp":{"max_xp":4185,"main_battery":{"max_frags_battle":5,"frags":492,"hits":29392,"max_frags_ship_id":4288624624,"shots":89675},"max_xp_ship_id":4277122768,"second_battery":{"max_frags_battle":1,"frags":14,"hits":425,"max_frags_ship_id":4287543280,"shots":2989},"max_frags_ship_id":4282365648,"xp":2085304,"survived_battles":548,"dropped_capture_points":7866,"draws":70,"planes_killed":6725,"battles":1044,"survived_wins":436,"frags":1823,"max_frags_battle":8,"capture_points":850,"ramming":{"max_frags_battle":1,"frags":8,"max_frags_ship_id":4259264496},"torpedoes":{"max_frags_battle":2,"frags":39,"hits":156,"max_frags_ship_id":4292753104,"shots":1945},"max_planes_killed_ship_id":4279219920,"aircraft":{"max_frags_battle":6,"frags":850,"max_frags_ship_id":4277122768},"max_damage_dealt":273842,"max_damage_dealt_ship_id":4277122768,"wins":647,"losses":327,"damage_dealt":73400268,"max_planes_killed":71}},"nickname":"Mystrl"}}}';
x = 0;

const port = 8001;

var server = http.createServer(function(request, response) {
	response.setHeader('Access-Control-Allow-Origin', 'example.com');
    response.setHeader('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
    response.setHeader('Access-Control-Allow-Headers', 'Content-Type');

	console.log(x);
	x++;
	response.end(res);

});
server.listen(port);