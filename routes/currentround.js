var express = require('express');
var router = express.Router();
var pg = require('pg');
var connectionString = process.env.DATABASE_URL || 'postgres://mitchellvaline:postgres@localhost:5432/csrest';
var schema = require('../models/schema');





function NextRound() {
  var newRound = schema.roundSchema;

  pg.connect(connectionString, function(err, client, done) {
    client.query("INSERT INTO rounds(complete, total_item_value, total_num_items, item_witheld, players) values($1, $2, $3, $4, $5)", [newRound.complete, newRound.total_item_value, newRound.total_num_items, newRound.item_witheld, newRound.players]);
  });
}

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
