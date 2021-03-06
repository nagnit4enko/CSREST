var express = require('express');
var router = express.Router();
var request = require('request');

/* GET inventory */
router.get('/:steam_id', function(req, res) {
    var id = req.params.steam_id;
    var connectionString = 'http://steamcommunity.com/profiles/' + id + '/inventory/json/730/2';

    request({
      uri: connectionString
    }, function(error, response, body) {
      res.send(body);
    });
});

module.exports = router;
