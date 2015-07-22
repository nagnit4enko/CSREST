var should = require('should');
var assert =  require('assert');
var sinon = require('sinon');
var request = require('supertest');
var pg = require('pg');
var app = require('../app');

var UpdateRound = require('../modules/UpdateRound.js');

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

describe('Add Deposit Waterfall', function() {
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
  });

  describe('Waterfall Data Callbacks From Valve API to DB Save', function() {
    it('should add deposit to current round in DB from testSteamID and testItems', function(done) {
      UpdateRound.AddDeposit(testSteamID, testItems);
      var newPlayers = [];
      pg.connect(connectionString, function(error, client, dbdone) {
        var query = client.query("SELECT players FROM rounds ORDER BY game_id DESC LIMIT 1");
        query.on('row', function(row) {
          newPlayers.push(row.players);
        });
        query.on('end', function() {
          client.end();
          data[0].players[0].steamid.should.equal(newPlayers[0][0].steamid);
          data[0].players[0].items.length.should.equal(newPlayers[0][0].items.length);
          done();
        });
        if(error) {
          console.log(error);
        }
      });
    });
  });
});
