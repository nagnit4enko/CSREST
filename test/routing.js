var should = require('should');
var assert =  require('assert');
var request = require('supertest');
var pg = require('pg');
var app = require('../app');

// import mock data to use in tests
var testData = require('./testdata.js');
var connectionString = process.env.DATABASE_URL || 'postgres://mitchellvaline:postgres@localhost:5432/csrest';

describe('Routing', function() {
  describe('Rounds', function() {
    var roundId;
    describe('Rounds POST', function() {
      it('should create new round', function(done) {
        request(app)
          .post('/api/rounds')
          .expect('Content-Type', /json/)
          .expect(200)
          .end(function(error, res) {
            if(error) {
              throw error;
            }
            res.body[0].game_id.should.be.instanceof(Number);
            res.body[0].complete.should.be.instanceof(Boolean);
            res.body[0].should.have.property('players');
            (res.body[0].players === null).should.be.true;
            res.body[0].total_item_value.should.be.instanceof(String);
            res.body[0].total_num_items.should.be.instanceof(Number);
            done();
          });
      });

      after(function(done) {
        pg.connect(connectionString, function(err, client, x) {
          var query = client.query("SELECT game_id FROM rounds ORDER BY game_id DESC LIMIT 1");
          query.on('row', function(row) {
            roundId=row.game_id;
            done();
          });
          query.on('end', function() {
            client.end();
          });
        });
      });
    });

    describe('Rounds GET', function() {
      it('should return all rounds JSON', function(done) {
        request(app)
          .get('/api/rounds')
          .set('Accept', 'application/json')
          .expect('Content-Type', /json/)
          .expect(200)
          .end(function(error, res) {
            if(error) {
              throw error;
            }
            res.body.should.be.instanceof(Array);
            done();
          });
      });
    });
    describe('Rounds GET single', function() {
      it('should return single round JSON', function(done) {
        request(app)
          .get('/api/rounds/'+roundId)
          .set('Accept', 'application/json')
          .expect('Content-Type', /json/)
          .expect(200)
          .end(function(error, res) {
            if(error) {
              throw error;
            }
            res.body[0].complete.should.be.instanceof(Boolean);
            res.body[0].game_id.should.be.instanceof(Number);
            res.body[0].should.have.property('players');
            res.body[0].total_item_value.should.be.instanceof(String);
            res.body[0].total_num_items.should.be.instanceof(Number);
            done();
          });
      });
    });

    describe('Latest Round GET', function() {
      it('should return latest round JSON', function(done) {
        request(app)
          .get('/api/currentround')
          .set('Accept', 'application/json')
          .expect('Content-Type', /json/)
          .expect(200)
          .end(function(error, res) {
            res.body[0].complete.should.be.instanceof(Boolean);
            res.body[0].game_id.should.equal(roundId);
            res.body[0].should.have.property('players');
            res.body[0].total_item_value.should.be.instanceof(String);
            res.body[0].total_num_items.should.be.instanceof(Number);
            done();
          });
      });
    });

    after(function(done) {
      pg.connect(connectionString, function(err, client, x) {
        client.query("DELETE FROM rounds WHERE game_id=($1)", [roundId]);
        done();
      });
    });
  });

  describe('Users', function() {
    it('should return all users JSON', function(done) {
      request(app)
        .get('/api/users')
        .set('Accept', 'application/json')
        .expect('Content-Type', /json/)
        .expect(200)
        .end(function(error, res) {
          if(error) {
            throw error;
          }
          res.body.should.be.instanceof(Array);
          done();
        });
    });

    it('should return single user JSON', function(done) {
      request(app)
        .get('/api/users/')
        .set('Accept', 'application/json')
        .expect('Content-Type', /json/)
        .expect(200)
        .end(function(error, res) {
          if(error) {
            throw error;
          }
          done();
        });
    });
  });

});
