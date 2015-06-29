require('dotenv').load(); //load environment variables from .env files


var express = require('express');
var router = express.Router();
var pg = require('pg');
var request = require('request');
var Steam = require('steam');
var SteamTradeOffers = require('steam-tradeoffers');

var connectionString = process.env.DATABASE_URL || 'postgres://mitchellvaline:postgres@localhost:5432/csrest';

/// Steam bot account log on
var bot = new Steam.SteamClient();
var offers = new SteamTradeOffers();

var logOnOptions = {
  accountName: process.env.STEAM_USERNAME,
  password: process.env.STEAM_PASSWORD,
};

var authCode = '';

if (require('fs').existsSync('sentryfile')) {
  logOnOptions['shaSentryfile'] = require('fs').readFileSync('sentryfile');
} else if (authCode != '') {
  logOnOptions['authCode'] = authCode;
}

bot.logOn(logOnOptions);

bot.on('loggedOn', function() {
  console.log('logged in');
  bot.setPersonaState(Steam.EPersonaState.Online);
});

bot.on('sentry',function(sentryHash) {
  require('fs').writeFile('sentryfile',sentryHash,function(err) {
    if(err){
      console.log(err);
    }
    else {
      console.log('Saved sentry file hash as "sentryfile"');
    }
  });
});

// bot.on('chatInvite', function(chatRoomID, chatRoomName, patronID) {
//   console.log('Got an invite to ' + chatRoomName + ' from ' + bot.users[patronID].playerName);
//   bot.joinChat(chatRoomID); // autojoin on invite
// });
//
// bot.on('message', function(source, message, type, chatter) {
//   // respond to both chat room and private messages
//   console.log('Received message: ' + message);
//   bot.sendMessage(source, 'Autoresponse from Bot', Steam.EChatEntryType.ChatMsg); // ChatMsg by default
// });

bot.on('webSessionID', function(sessionID) {
  bot.webLogOn(function(newCookie) {
    offers.setup( {
      sessionID: sessionID,
      webCookie: newCookie
    }, function(err) {
      if(err) {
        throw err;
      }
    });
  });
});

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
                  // GetSteamUserInfo(offer.steamid_other, function(userData) {
                  //   var playerJson = JSON.parse(userData);
                  //   var player = personJson.response.players[0];
                  //   console.log("Player: ");
                  //   console.log(player);

                    var playerItems = [];
                    for(var i = 0; i < items.length; i++) {
                      var item = items[i];
                      GetItemPrice(item["market_hash_name"], function(itemData) {
                        itemJson = JSON.parse(itemData);

                        playerItem = {
                          "appid": itemJson["appid"],
                          "contextid": itemJson["contextid"],
                          "classid": itemJson["classid"],
                          "instanceid": itemJson["instanceid"],
                          "icon_url": itemJson["icon_url"],
                          "name": itemJson["name"],
                          "market_hash_name": itemJson["market_hash_name"],
                          "median_price": itemJson["median_price"]
                        }
                        playerItems.push(playerItem);
                        console.log(playerItems);

                      })
                    }
                  // });
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

function GetSteamUserInfo(steamid) {
  var uriString = 'http://api.steampowered.com/ISteamUser/GetPlayerSummaries/v0002/?key=' + 'apiKeyAsString' + '&steamids=' + steamid;

  // begin GET http request
  request({
    uri: uriString
  }, function(error, response, body) {
    if(!error && response.statusCode == 200) {
      callback(body);
    }
    else if(error) {
      console.log(error);
    }
    else {
      console.log(response.statusCode);
    }
  });
}

function GetItemPrice(marketHashName, callback) {
  var connectionString = 'https://steamcommunity.com/market/priceoverview/?currency=1&appid=730&market_hash_name=' + marketHashName;

  // begin GET http request
  request({
    uri: connectionString
  }, function(error, response, body) {
    if(!error && response.statusCode == 200) {
      callback(body);
    }
    else if(error) {
      console.log(error);
    }
    else {
      console.log(response.statusCode);
    }
  });
}

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
