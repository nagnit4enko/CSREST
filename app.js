// require('dotenv').load(); //load environment variables from .env files

var express = require('express');
var cors =  require('cors');
var path = require('path');
var favicon = require('static-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var Steam = require('steam');
var SteamTradeOffers = require('steam-tradeoffers');
var fs = require('fs');

var routes = require('./routes/index');
var rounds = require('./routes/rounds');
var users = require('./routes/users');
var inventory = require('./routes/inventory');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(favicon());
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded());
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use(cors());

app.use('/', routes);
app.use('/api/rounds', rounds);
app.use('/api/users', users);
app.use('/api/inventory', inventory);


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


/// catch 404 and forwarding to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

/// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
      message: err.message,
      error: err
    });
  });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: {}
  });
});


module.exports = app;
