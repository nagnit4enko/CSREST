var Steam = require('steam');
var SteamWebLogOn = require('steam-weblogon');
var SteamTradeOffers = require('steam-tradeoffers');
var crypto = require('crypto');
var fs = require('fs');
var async = require('async');
var UpdateRound = require('./UpdateRound.js');

var steamClient = new Steam.SteamClient();
var bot = new Steam.SteamUser(steamClient);
var offers = new SteamTradeOffers();

var steamWebLogOn = new SteamWebLogOn(steamClient, bot);

function LogOn() {
  var logOnOptions = {
    account_name: process.env.STEAM_USERNAME,
    password: process.env.STEAM_PASSWORD,
  };

  var authCode = process.env.STEAM_AUTHCODE || '';

  try {
    logOnOptions.sha_sentryfile = getSHA1(fs.readFileSync('sentryfile'));
  } catch (e) {
    if (authCode !== '') {
      logOnOptions.auth_code = authCode;
    }
  }

  steamClient.connect();
  steamClient.on('connected', function() {
    bot.logOn(logOnOptions);
  });
}

function CheckOffer() {
  offers.getOffers({
    get_received_offers: 1,
    active_only: 1,
    time_historical_cutoff: Math.round(Date.now() /1000)
  }, function(error, body) {
    if(body.response.trade_offers_received) {
      body.response.trade_offers_received.forEach(function(offer) {
        if(offer.trade_offer_state == 2) {
          if(!offer.items_to_give) {
            AcceptOffer(offer);
          }
          else {
            DeclineOffer(offer);
          }
        }
      });
    }
  });
}

function AcceptOffer(offer) {
  offers.acceptOffer({
    tradeOfferId: offer.tradeofferid
  }, function(error, res) {
      if(error)
        console.log(error);
      else{
        offers.getItems({
          tradeId: res.tradeid
        }, function(error, items) {
            if(!error) {
              UpdateRound.AddDeposit(offer.steamid_other, items, function(err, response) {
                if(!err) {
                  console.log('Deposit Added To Current Round');
                }
                else {
                  console.log(error);
                }
              });
            }
            else {
              console.log(error);
            }
        });
      }
  });
}

function DeclineOffer(offer) {
  offers.declineOffer({tradeOfferId: offer.tradeofferid});
  bot.sendMessage(offer.steamid_other, 'Gifts Only');
}

steamClient.on('logOnResponse', function(res) {
  if (res.eresult == Steam.EResult.OK) {
    console.log('Steam User Logged On');
    steamWebLogOn.webLogOn(function(sessionID, newCookie) {
      offers.setup({
        sessionID: sessionID,
        webCookie: newCookie,
        APIKey: process.env.STEAM_API_KEY
      });
    });
  }
});

bot.on('updateMachineAuth', function(sentry, callback) {
  fs.writeFileSync('sentryfile', sentry.bytes);
  callback({ sha_file: getSHA1(sentry.bytes) });
});

bot.on('tradeOffers', function(number) {
  if(number > 0) {
    CheckOffer();
  }
});

function getSHA1(bytes) {
  var shasum = crypto.createHash('sha1');
  shasum.end(bytes);
  return shasum.read();
}

exports.steamClient = steamClient;
exports.bot = bot;
exports.offers = offers;
exports.LogOn = LogOn;
