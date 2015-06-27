var express = require('express');
var router = express.Router();
var pg = require('pg');
var connectionString = process.env.DATABASE_URL || 'postgres://mitchellvaline:postgres@localhost:5432/csrest';
var schema = require('../models/schema');

console.log(schema.roundSchema);




router.get('/', function(req, res) {
  var results = [];

  pg.connect(connectionString, function(err, client, done) {
    var query = client.query("SELECT * FROM rounds ORDER BY game_id ASC LIMIT 1");

    query.on('row', function(row) {
      results.push(row);
    });

    query.on('end', function() {
      client.end();
      return res.json(results);
    });

    if(err) {
      console.log(err);
    }

  });
});

module.exports = router;
