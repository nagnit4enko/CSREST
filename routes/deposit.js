require('dotenv').load(); //load environment variables from .env files


var express = require('express');
var router = express.Router();
var request = require('request');
var Steam = require('steam');
var SteamTradeOffers = require('steam-tradeoffers');

/// Steam bot account log on
var bot = new Steam.SteamClient();
var offers = new SteamTradeOffers();

var logOnOptions = {
  accountName: process.env.STEAM_USERNAME,
  password: process.env.STEAM_PASSWORD,
};

var authCode = ''

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

bot.on('chatInvite', function(chatRoomID, chatRoomName, patronID) {
  console.log('Got an invite to ' + chatRoomName + ' from ' + bot.users[patronID].playerName);
  bot.joinChat(chatRoomID); // autojoin on invite
});

bot.on('message', function(source, message, type, chatter) {
  // respond to both chat room and private messages
  console.log('Received message: ' + message);
  bot.sendMessage(source, 'Autoresponse from Bot', Steam.EChatEntryType.ChatMsg); // ChatMsg by default
});

bot.on('webSessionID', function(sessionID) {
  bot.webLogOn(function(newCookie) {
    offers.setup( {
      sessionID: sessionID,
      webCookie: newCookie
    });
  });
});

/* POST user deposits items */
router.post('/:steam_id', function(req, res) {

  var id = req.params.steam_id;
  var items = req.body.items;

  offers.makeOffer({
    partnerSteamID: id,
    itemsFromMe: [],
    itemsFromThem: items,
    message: 'test trade offer'
  }, function(err, response) {
    if(err) {
      throw err;
    }
    console.log(response);
    res.send(response);
  });
})



module.exports = router;
