var express = require('express');
var router = express.Router();
var pg = require('pg');
var connectionString = process.env.DATABASE_URL || 'postgres://mitchellvaline:postgres@localhost:5432/csrest';

/* POST */
router.post('/', function(req, res) {
    var results = [];

    var id = req.body.steam_id;

    pg.connect(connectionString, function(err, client, done) {
        client.query("INSERT INTO users(steam_id, join_date, game_history) values($1, $2, $3)", [id, new Date().toDateString(), []], function(error, result) {
          if(error) {
            res.send(400);
          }
        });
        var query = client.query("SELECT * FROM users WHERE steam_id=($1)", [id]);
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

/* GET all */
router.get('/', function(req, res) {
    var results = [];

    pg.connect(connectionString, function(err, client, done) {

        var query = client.query("SELECT * FROM users ORDER BY join_date DESC");

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

/* GET single */
router.get('/:steam_id', function(req, res) {
    var results = [];

    var id = req.params.steam_id;

    pg.connect(connectionString, function(err, client, done) {
        var query = client.query("SELECT * FROM users WHERE steam_id=($1)", [id]);

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

/* PUT */
router.put('/:steam_id', function(req, res) {

    var results = [];

    var id = req.params.steam_id;

    var data = {game_history: req.body.game_history};

    pg.connect(connectionString, function(err, client, done) {
        client.query("UPDATE users SET game_history=($1) WHERE steam_id=($2)",
            [data.game_history, id]
        );

        var query = client.query("SELECT * FROM users WHERE steam_id=($1)", [id]);

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

/* DELETE */
router.delete('/:steam_id', function(req, res) {

    var results = [];

    var id = req.params.steam_id;

    pg.connect(connectionString, function(err, client, done) {

        client.query("DELETE FROM users WHERE steam_id=($1)", [id]);

        var query =  client.query("SELECT * FROM users ORDER BY join_date DESC");

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
