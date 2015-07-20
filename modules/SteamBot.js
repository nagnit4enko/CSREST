var Steam = require('steam');
var SteamTradeOffers = require('steam-tradeoffers');

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
};

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

exports.bot = bot;
exports.LogOn = LogOn;
