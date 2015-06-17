var express = require('express');
var router = express.Router();
var http = require('http');

// Steam CSGO inventory url 'http://steamcommunity.com/profiles/<STEAMID>/inventory/json/730/2'

/* GET inventory */
router.get('/:steam_id', function(req, res) {
    var results = [];

    var apiKey = 'C1797373C07E4F2F658C1E6E2C2679D4';
    var id = req.params.steam_id;
    var pathParams = '/IEconItems_730/GetPlayerItems/v1/?key=' + apiKey + '&format=json&steamid=' + id;

    //var connectionString = 'http://steamcommunity.com/profiles/' + id + '/inventory/json/730/2';

    var options = {
        host: 'api.steampowered.com',
        path: pathParams,
        method: 'GET'
    };

    http.get(options, function(response) {
        var body = '';
        response.on('data', function(chunk) {
            body += chunk;
        });
        response.on('end', function() {
            var results = JSON.parse(body);
            return res.json(results);
        });
        response.on('error', function(err) {
            console.log(err.message);
            return err;
        })
    });

});

module.exports = router;
