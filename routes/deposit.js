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

bot.on('tradeOffers', function(number) {
  if(number > 0) {
    offers.getOffers({
      get_received_offers: 1,
      active_only:1,
      time_historical_cutoff: Math.round(Date.now() / 1000)
    }, function(error, body) {
      if(body.response.trade_offers_received) {
        body.response.trade_offers_received.forEach(function(offer) {
          if(offer.trade_offer_state == 2) {
            console.log(offer);
            console.log('Received trade offer: ' + offer.tradeofferid);
            if(!offer.items_to_give) {
              offers.acceptOffer({
                tradeOfferId: offer.tradeofferid
              }, function(error, res) {
                offers.getItems({
                  tradeId: res.tradeid
                }, function(error, items) {
                  async.parallel([
                    function(callback) {
                      SteamWebApi.GetSteamUserInfo(offer.steamid_other, function(error, userData) {
                        callback(null, userData);
                      });
                    },
                    function(callback) {
                      SteamWebApi.GetItemsPrice(items, function(itemsData) {
                        callback(null, itemsData);
                      });
                    }
                  ],
                  function(error, results) {
                    var itemsData = results[1];
                    var total_item_value = 0.00;
                    for(i = 0; i < itemsData.length; i++) {
                      var itemPrice = itemsData[i].median_price;
                      total_item_value += itemPrice;
                    }
                    results[0].total_item_value = total_item_value;
                    results[0].items = results[1];
                    var playerResults = results[0];
                    var players = [];
                    pg.connect(connectionString, function(err, client, done) {
                      var query = client.query("SELECT players FROM rounds ORDER BY game_id DESC LIMIT 1");
                      query.on('row', function(row) {
                       players.push(row.players);
                      });
                      query.on('end', function() {
                        var updated = [];
                        if(players[0] === null) {
                          updated = [playerResults];
                        }
                        else {
                          updated = players[0].concat(playerResults);
                        }
                        console.log(updated);
                        var newPlayers = [];
                        pg.connect(connectionString, function(err, client, done) {
                          client.query("UPDATE rounds SET players=($1), total_item_value=total_item_value+($2), total_num_items=total_num_items+($3) WHERE game_id=(SELECT MAX(game_id) FROM rounds)", [JSON.stringify(updated), playerResults.total_item_value, playerResults.items.length]);
                          var query = client.query("SELECT players FROM rounds ORDER BY game_id DESC LIMIT 1");
                          query.on('row', function(row) {
                            newPlayers.push(row);
                          });
                          query.on('end', function() {
                            client.end();
                            console.log(newPlayers);
                          });
                          if (err) {
                            console.log(err);
                          }
                        });
                      });
                      if (err) {
                        console.log(err);
                      }
                    });
                  });
                });
              });
              console.log('Offer Accepted');
              bot.sendMessage(offer.steamid_other, 'Thanks for the deposit');
            }
            else {
              offers.declineOffer({tradeOfferId: offer.tradeofferid});
              console.log('Offer declined');
              bot.sendMessage(offer.steamid_other, 'Gifts only');
            }
          }
        });
      }
    });
  }
});

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
