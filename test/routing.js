var should = require('should');
var assert =  require('assert');
var request = require('supertest');
var pg = require('pg');
var app = require('../app');

describe('Routing', function() {

  describe('Rounds', function() {
    it('should return all rounds JSON', function(done) {
      request(app)
        .get('/api/rounds')
        .set('Accept', 'application/json')
        .expect('Content-Type', /json/)
        .expect(200, done);
    });

    it('should return single round JSON', function(done) {
      request(app)
        .get('/api/rounds/4')
        .set('Accept', 'application/json')
        .expect('Content-Type', /json/)
        .expect(200)
        .end(function(error, res) {
          if(error) {
            throw error;
          }
          res.body[0].complete.should.be.instanceof(Boolean);
          res.body[0].game_id.should.be.instanceof(Number);
          res.body[0].players.should.be.instanceof(Array);
          res.body[0].total_item_value.should.be.instanceof(String);
          res.body[0].total_num_items.should.be.instanceof(Number);
          done();
        });
    });
  });

});
