var express = require('express');
var router = express.Router();
var pg = require('pg');
var connectionString = process.env.DATABASE_URL || 'postgres://mitchellvaline:postgres@localhost:5432/csrest';

/* POST */
router.post('/', function(req, res) {

  var results = [];

  // Get a Postgres client from the connection pool
  pg.connect(connectionString, function(err, client, done) {

    // SQL Query > Insert Data
    client.query("INSERT INTO rounds(complete, total_item_value, total_num_items, players) values($1, $2, $3, $4)", [false, 0.00, 0, null]);

    // SQL Query > Select Data
    var query = client.query("SELECT * FROM rounds ORDER BY game_id DESC");

    // Stream results back one row at a time
    query.on('row', function(row) {
      results.push(row);
    });

    // After all data is returned, close connection and return results
    query.on('end', function() {
      client.end();
      return res.json(results);
    });

    // Handle Errors
    if (err) {
      console.log(err);
    }

  });
});

/* GET all */
router.get('/', function(req, res) {

  var results = [];

  // Get a Postgres client from the connection pool
  pg.connect(connectionString, function(err, client, done) {

    // SQL Query > Select Data
    var query = client.query("SELECT * FROM rounds ORDER BY game_id ASC");

    // Stream results back one row at a time
    query.on('row', function(row) {
      results.push(row);
    });

    // After all data is returned, close connection and return results
    query.on('end', function() {
      client.end();
      return res.json(results);
    });

    // Handle Errors
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


/* DELETE */
router.delete('/:game_id', function(req, res) {

  var results = [];

  // Grab data from the URL parameters
  var id = req.params.game_id;


  // Get a Postgres client from the connection pool
  pg.connect(connectionString, function(err, client, done) {

    // SQL Query > Delete Data
    client.query("DELETE FROM rounds WHERE game_id=($1)", [id]);

    // SQL Query > Select Data
    var query = client.query("SELECT * FROM rounds ORDER BY game_id ASC");

    // Stream results back one row at a time
    query.on('row', function(row) {
      results.push(row);
    });

    // After all data is returned, close connection and return results
    query.on('end', function() {
      client.end();
      return res.json(results);
    });

    // Handle Errors
    if (err) {
      console.log(err);
    }

  });

});

module.exports = router;
