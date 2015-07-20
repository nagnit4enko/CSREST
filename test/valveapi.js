var should = require('should');
var assert =  require('assert');
var request = require('supertest');
var sinon = require('sinon');

var valveapi = require('../functions/valveapi');

var testItems = require('./testdata.js').testItems;
var testSteamID = require('./testdata.js').testSteamID;

describe('Valve API Interfacing', function() {
  describe('Item Info', function() {

    describe('Get Item Price', function() {
      it('should get item price and return item JSON', function(done) {
        valveapi.GetItemPrice(testItems[0], function(error, data) {
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
          .stub(valveapi, 'GetItemPrice')
          .yields('test error');
        done();
      });

      after(function(done) {
        valveapi.GetItemPrice.restore();
        done();
      });

      it('should return error', function(done) {
        valveapi.GetItemPrice(testItems[0], function(error, data) {
          (data === null).should.be.true;
          error.should.equal('test error');
          done();
        });
      });
    });

    describe('Get Items Price', function() {
      it('should get multiple items price and return as JSON array', function(done) {
        valveapi.GetItemsPrice(testItems, function(data) {
          data.should.be.instanceof(Array);
          data.length.should.equal(2);
          done();
        });
      });
    });
  });

  describe('Steam User Info', function() {

    describe('Successful GET', function() {
      it('should get steam user info as JSON', function(done) {
        valveapi.GetSteamUserInfo(testSteamID, function(error, data) {
          data.steamid.should.equal(testSteamID);
          (error === null).should.be.true;
          done();
        });
      });
    });

    describe('Error', function() {
      before(function(done) {
        sinon
          .stub(valveapi, 'GetSteamUserInfo')
          .yields('test error');
        done();
      });

      after(function(done) {
        valveapi.GetSteamUserInfo.restore();
        done();
      });

      it('should return error', function(done) {
        valveapi.GetSteamUserInfo(testSteamID, function(error, data) {
          (data === null).should.be.true;
          error.should.equal('test error');
          done();
        });
      });
    });
  });
});
