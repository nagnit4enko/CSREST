var should = require('should');
var assert =  require('assert');
var request = require('supertest');

describe('Math', function() {
  it('should return max value of parameters', function(done) {
    var max = Math.max(1,2,10,3);
    max.should.equal(10);
    done();
  });
});
