var Steam = require('steam');
var SteamTradeOffers = require('steam-tradeoffers');
var async = require('async');
var UpdateRound = require('./UpdateRound.js');

var bot = new Steam.SteamClient();
var offers = new SteamTradeOffers();

function LogOn() {
  var logOnOptions = {
    accountName: process.env.STEAM_USERNAME,
    password: process.env.STEAM_PASSWORD,
  };
  var authCode = process.env.STEAM_AUTHCODE || '';

  if (require('fs').existsSync('sentryfile')) {
    logOnOptions.shaSentryfile = require('fs').readFileSync('sentryfile');
  } else if (authCode !== '') {
    logOnOptions.authCode = authCode;
  }

  bot.logOn(logOnOptions);

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
              UpdateRound.AddDeposit(offer.steamid_other, items);
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

bot.on('loggedOn', function() {
  console.log('logged in');
  bot.setPersonaState(Steam.EPersonaState.Online);
});

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
    CheckOffer();
  }
});

exports.bot = bot;
exports.offers = offers;
exports.LogOn = LogOn;
