var should = require('should');
var assert =  require('assert');
var Steam = require('steam');
var SteamTradeOffers = require('steam-tradeoffers');

var SteamBot = require('../modules/SteamBot.js');

describe('Steam Bot', function() {
  describe('Steam Log On', function() {
    it('should log on user using credentials from environment variables', function(done) {
      SteamBot.LogOn();
      done();
    });
  });
});
