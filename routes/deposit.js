var express = require('express');
var router = express.Router();
var pg = require('pg');
var request = require('request');
var Steam = require('steam');
var SteamTradeOffers = require('steam-tradeoffers');
var async = require('async');

// some valve api calls used when trades complete
var SteamWebApi = require('../modules/SteamWebApi');

var connectionString = process.env.DATABASE_URL || 'postgres://mitchellvaline:postgres@localhost:5432/csrest';

var SteamBot = require('../modules/SteamBot.js');
var bot = SteamBot.bot;
SteamBot.LogOn();

/* POST user deposits items */
router.post('/:steam_id', function(req, res) {

  var id = req.params.steam_id;
  var items = req.body.items;

  offers.makeOffer({
    partnerSteamId: id,
    itemsFromMe: items,
    itemsFromThem: [],
    message: 'test trade offer'
  }, function(err, response) {
    if(err) {
      throw err;
    }
    console.log(response);
    return res.json(response);
  });
});



module.exports = router;
