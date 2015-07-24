import assert from 'assert';
import should from 'should';
import sinon from 'sinon';
import Steam from 'steam';
import SteamTradeOffers from 'steam-tradeoffers';
import SteamBot from '../modules/SteamBot.js';

describe('Steam Bot', function() {

  describe('Steam Log On', function() {
    it('should log on user using credentials from environment variables', function(done) {
      this.timeout(5000);
      SteamBot.LogOn();
      SteamBot.steamClient.on('logOnResponse', function(res) {
        res.eresult.should.equal(Steam.EResult.OK);
        SteamBot.steamClient.loggedOn.should.be.true;
        done();
      });
    });
  });
});
