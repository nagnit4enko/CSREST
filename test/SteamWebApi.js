var should = require('should');
var assert =  require('assert');
var sinon = require('sinon');

var SteamWebApi = require('../modules/SteamWebApi');

var testUser = require('./testdata.js').testUser;
var testItems = require('./testdata.js').testItems;
var testSteamID = require('./testdata.js').testSteamID;
var testDepositJson = require('./testdata.js').testDepositJson;


describe('Valve API Interfacing', function() {
  describe('Item Info', function() {
    describe('Get Item Price', function() {
      before(function(done) {
        sinon
          .stub(SteamWebApi, 'GetItemPrice')
          .yields(null, testItems[0]);
        done();
      });

      after(function(done) {
        SteamWebApi.GetItemPrice.restore();
        done();
      });

      it('should get item price and return item JSON', function(done) {
        SteamWebApi.GetItemPrice(testItems[0], function(error, data) {
          data.id.should.be.instanceof(String);
          data.appid.should.be.instanceof(Number);
          data.contextid.should.be.instanceof(Number);
          data.classid.should.be.instanceof(String);
          data.instanceid.should.be.instanceof(String);
          data.icon_url.should.be.instanceof(String);
          data.icon_url_large.should.be.instanceof(String);
          data.name.should.be.instanceof(String);
          data.market_hash_name.should.be.instanceof(String);
          data.market_name.should.be.instanceof(String);
          data.name_color.should.be.instanceof(String);
          data.median_price.should.be.instanceof(Number);
          (error === null).should.be.true;
          done();
        });
      });
    });

    describe('Error', function() {
      before(function(done) {
        sinon
          .stub(SteamWebApi, 'GetItemPrice')
          .yields('test error');
        done();
      });

      after(function(done) {
        SteamWebApi.GetItemPrice.restore();
        done();
      });

      it('should return error', function(done) {
        SteamWebApi.GetItemPrice(testItems[0], function(error, data) {
          (data === null).should.be.true;
          error.should.equal('test error');
          done();
        });
      });
    });

    describe('Get Items Price', function() {
      before(function(done) {
        sinon
          .stub(SteamWebApi, 'GetItemsPrice')
          .yields(testItems);
        done();
      });

      after(function(done) {
        SteamWebApi.GetItemsPrice.restore();
        done();
      });

      it('should get multiple items price and return as JSON array', function(done) {
        SteamWebApi.GetItemsPrice(testItems, function(data) {
          data.should.be.instanceof(Array);
          data.length.should.equal(2);
          done();
        });
      });
    });
  });

  describe('Steam User Info', function() {
    describe('Successful GET', function() {
      before(function(done) {
        sinon
          .stub(SteamWebApi, 'GetSteamUserInfo')
          .yields(null, testUser);
        done();
      });

      after(function(done) {
        SteamWebApi.GetSteamUserInfo.restore();
        done();
      });

      it('should get steam user info as JSON', function(done) {
        SteamWebApi.GetSteamUserInfo(testSteamID, function(error, data) {
          console.log(data);
          data.steamid.should.equal(testSteamID);
          (error === null).should.be.true;
          done();
        });
      });
    });

    describe('Error', function() {
      before(function(done) {
        sinon
          .stub(SteamWebApi, 'GetSteamUserInfo')
          .yields('test error');
        done();
      });

      after(function(done) {
        SteamWebApi.GetSteamUserInfo.restore();
        done();
      });

      it('should return error', function(done) {
        SteamWebApi.GetSteamUserInfo(testSteamID, function(error, data) {
          (data === null).should.be.true;
          error.should.equal('test error');
          done();
        });
      });
    });
  });

  describe('Deposit Info', function() {
    describe('Get Deposit JSON', function() {
      before(function(done) {
        sinon
          .stub(SteamWebApi, 'GetDepositInfo')
          .yields(null, testDepositJson);
        done();
      });

      after(function(done) {
        SteamWebApi.GetDepositInfo.restore();
        done();
      });

      it('should return player json object with array of items deposited', function(done) {
        SteamWebApi.GetDepositInfo(testSteamID, testItems, function(error, data) {
          data.steamid.should.be.instanceof(String).and.equal(testSteamID);
          data.communityvisibilitystate.should.be.instanceof(Number);
          data.profilestate.should.be.instanceof(Number);
          data.personaname.should.be.instanceof(String);
          data.lastlogoff.should.be.instanceof(Number);
          data.commentpermission.should.be.instanceof(Number);
          data.profileurl.should.be.instanceof(String);
          data.avatar.should.be.instanceof(String);
          data.avatarmedium.should.be.instanceof(String);
          data.avatarfull.should.be.instanceof(String);
          data.personastate.should.be.instanceof(Number);
          data.realname.should.be.instanceof(String);
          data.primaryclanid.should.be.instanceof(String);
          data.timecreated.should.be.instanceof(Number);
          data.personastateflags.should.be.instanceof(Number);
          data.loccountrycode.should.be.instanceof(String);
          data.locstatecode.should.be.instanceof(String);
          data.total_item_value.should.be.instanceof(Number);
          data.items.should.be.instanceof(Array);
          data.items[0].id.should.be.instanceof(String);
          data.items[0].appid.should.be.instanceof(Number);
          data.items[0].contextid.should.be.instanceof(Number);
          data.items[0].classid.should.be.instanceof(String);
          data.items[0].instanceid.should.be.instanceof(String);
          data.items[0].icon_url.should.be.instanceof(String);
          data.items[0].icon_url_large.should.be.instanceof(String);
          data.items[0].name.should.be.instanceof(String);
          data.items[0].market_hash_name.should.be.instanceof(String);
          data.items[0].market_name.should.be.instanceof(String);
          data.items[0].name_color.should.be.instanceof(String);
          data.items[0].median_price.should.be.instanceof(Number);
          done();
        });
      });
    });

    describe('Error', function() {
      before(function(done) {
        sinon
          .stub(SteamWebApi, 'GetDepositInfo')
          .yields('test error');
        done();
      });

      after(function(done) {
        SteamWebApi.GetDepositInfo.restore();
        done();
      });

      it('should return error', function(done) {
        SteamWebApi.GetDepositInfo(testSteamID, testItems, function(error, data) {
          (data === null).should.be.true;
          error.should.equal('test error');
          done();
        });
      });
    });
  });
});
