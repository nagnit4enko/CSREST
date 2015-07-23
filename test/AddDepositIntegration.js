import should from 'should';
import sinon from 'sinon';
import request from 'supertest';
import assert from 'assert';
import pg from 'pg';
import app from '../app';
import UpdateRound from '../modules/UpdateRound.js';
import {testSteamID, testItems} from './testdata.js';

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
      var newPlayers = [];
      UpdateRound.AddDeposit(testSteamID, testItems, function(error, data) {
        pg.connect(connectionString, function(error, client, dbdone) {
          var query = client.query("SELECT players FROM rounds ORDER BY game_id DESC LIMIT 1");
          query.on('row', function(row) {
            newPlayers.push(row.players);
          });
          query.on('end', function() {
            JSON.stringify(newPlayers[0][0]).should.equal(JSON.stringify(data[0].players[0]));
            client.end();
            done();
          });
          if(error) {
            console.log(error);
          }
        });
      });
    });
  });

  describe('AddDeposit Error', function() {
    before(function(done) {
      sinon
        .stub(UpdateRound, 'AddDeposit')
        .yields('test error');
      done();
    });

    after(function(done) {
      UpdateRound.AddDeposit.restore();
      done();
    });

    it('should return error', function(done) {
      UpdateRound.AddDeposit(testSteamID, testItems, function(error, data) {
        (data === null).should.be.true;
        error.should.equal('test error');
        done();
      });
    });
  });
});
