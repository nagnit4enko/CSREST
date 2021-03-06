var express = require('express');
var router = express.Router();
var pg = require('pg');
var connectionString = process.env.DATABASE_URL || 'postgres://mitchellvaline:postgres@localhost:5432/csrest';

/* POST */
router.post('/', function(req, res) {
  var results = [];
  pg.connect(connectionString, function(err, client, done) {
    client.query("INSERT INTO rounds(complete, total_item_value, total_num_items, players) values($1, $2, $3, $4)", [false, 0.00, 0, null]);
    var query = client.query("SELECT * FROM rounds ORDER BY game_id DESC");
    query.on('row', function(row) {
      results.push(row);
    });
    query.on('end', function() {
      client.end();
      return res.json(results);
    });
    if (err) {
      console.log(err);
    }

  });
});

/* GET all */
router.get('/', function(req, res) {
  var results = [];
  pg.connect(connectionString, function(err, client, done) {
    var query = client.query("SELECT * FROM rounds ORDER BY game_id ASC");
    query.on('row', function(row) {
      results.push(row);
    });
    query.on('end', function() {
      client.end();
      return res.json(results);
    });
    if (err) {
      console.log(err);
    }
  });
});

/* GET single */
router.get('/:game_id', function(req, res) {
  var results = [];
  var id = req.params.game_id;
  pg.connect(connectionString, function(err, client, done) {
    var query = client.query("SELECT * FROM rounds WHERE game_id=($1)", [id]);
    query.on('row', function(row) {
      results.push(row);
    });
    query.on('end', function() {
      client.end();
      return res.json(results);
    });
    if (err) {
      console.log(err);
    }
  });
});

module.exports = router;
