var pg = require('pg');
var async = require('async');

var SteamWebApi = require('./SteamWebApi.js');

var connectionString = process.env.DATABASE_URL || 'postgres://mitchellvaline:postgres@localhost:5432/csrest';

function AddDeposit(steamid, items) {
  async.waterfall([
    function(callback) {
      SteamWebApi.GetDepositInfo(steamid, items, function(error, depositJson) {
        if(error) {
          callback(error);
        }
        else{
          callback(null, depositJson);
        }
      });
    },
    function(depositJson, callback) {
      GetPlayers(function(error, players) {
        if(error){
          callback(error);
        }
        else{
          callback(null, players);
        }
      });
    },
    function(currentPlayers, callback) {
      UpdatePlayers(currentPlayers, function(error, newPlayers) {
        if(error) {
          callback(error);
        }
        else {
          callback(null, newPlayers);
        }
      });
    }
  ]);
}

function GetPlayers(playerResults, callback) {
  pg.connect(connectionString, function(error, client, done) {
    var players = [];
    var query = client.query("SELECT players FROM rounds ORDER BY game_id DESC LIMIT 1");
    query.on('row', function(row) {
      players.push(row.players);
    });
    query.on('end', function() {
      var updated = [];
      if(players[0] === null) {
        updated = [playerResults];
      }
      else {
        updated = players[0].concat(playerResults);
      }
      callback(null, updated);
    });

    if(error) {
      callback(error);
    }
  });
}

function UpdatePlayers(currentPlayers, callback) {
  pg.connect(connectionString, function(error, client, done) {
    client.query("UPDATE rounds SET players=($1), total_item_value=total_item_value+($2), total_num_items=total_num_items+($3) WHERE game_id=(SELECT MAX(game_id) FROM rounds)", [JSON.stringify(currentPlayers), playerResults.total_item_value, playerResults.items.length]);
    var query = client.query("SELECT players FROM rounds ORDER BY game_id DESC LIMIT 1");
    query.on('row', function(row) {
      newPlayers.push(row);
    });
    query.on('end', function() {
      client.end();
      callback(null, newPlayers);
    });
    if (error) {
      callback(error);
    }
  });
}
