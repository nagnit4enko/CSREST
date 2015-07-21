var should = require('should');
var assert =  require('assert');
var sinon = require('sinon');
var request = require('supertest');
var pg = require('pg');
var app = require('../app');

var UpdateRound = require('../modules/UpdateRound.js');

var testDepositJson = require('./testdata.js').testDepositJson;
var testSteamID = require('./testdata.js').testSteamID;
var testItems = require('./testdata.js').testItems;

var connectionString = process.env.DATABASE_URL || 'postgres://mitchellvaline:postgres@localhost:5432/csrest';

before(function(done) {
  request(app)
    .post('/api/rounds')
    .expect(200, done);
});

after(function(done) {
  pg.connect(connectionString, function(err, client, dbdone) {
    client.query("DELETE FROM rounds WHERE game_id=(SELECT MAX(game_id) FROM rounds)");
    done();
  });
});

describe('Update Current Round Players', function() {
  describe('Get Players JSON From Current Round, Add New Deposit To Array', function() {
    describe('GetPlayers', function() {
      it('return JSON array of players with testDepositJson added', function(done) {
        UpdateRound.GetPlayers(testDepositJson, function(error, data) {
          data[data.length-1].steamid.should.equal(testDepositJson.steamid);
          data[data.length-1].items.should.equal(testDepositJson.items);
          done();
        });
      });
    });

    describe('GetPlayers Error', function() {
      before(function(done) {
        sinon
          .stub(UpdateRound, 'GetPlayers')
          .yields('test error');
        done();
      });

      after(function(done) {
        UpdateRound.GetPlayers.restore();
        done();
      });

      it('should return error', function(done) {
        UpdateRound.GetPlayers(testDepositJson, function(error, data) {
          (data === null).should.be.true;
          error.should.equal('test error');
          done();
        });
      });
    });
  });

  describe('Update Players JSON In Current Round', function() {
    var currentPlayers = [];
    var updated = [];
    before(function(done) {
      pg.connect(connectionString, function(error, client, dbdone) {
        var query = client.query("SELECT players FROM rounds ORDER BY game_id DESC LIMIT 1");
        query.on('row', function(row) {
          currentPlayers.push(row.players);
        });
        query.on('end', function() {
          client.end();
          done();
        });
        if(error) {
          console.log(error);
        }
      });
      if(currentPlayers.length === 0) {
        updated = [testDepositJson];
      }
      else {
        updated = currentPlayers[0].concat(playerResults);
      }
    });

    describe('UpdatePlayers', function() {
      it('should update current round players with testDepositJson', function(done) {
        UpdateRound.UpdatePlayers(updated, function(error, data) {
          var players = data[0].players;
          players.length.should.equal(1);
          players[players.length-1].steamid.should.equal(testDepositJson.steamid);
          players[players.length-1].items.length.should.equal(testDepositJson.items.length);
          done();
        });
      });
    });
  });

});
