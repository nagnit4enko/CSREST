var pg =  require('pg');
var connectionString = process.env.DATABASE_URL || 'postgres://mitchellvaline:postgres@localhost:5432/csrest';

var client = new pg.Client(connectionString);
client.connect();
var rounds = client.query('CREATE TABLE rounds(game_id SERIAL PRIMARY KEY, complete BOOLEAN, total_item_value MONEY, total_num_items INTEGER, item_witheld JSON, players JSON)');
var users = client.query('CREATE TABLE users(steam_id VARCHAR(20) PRIMARY KEY not null, join_date DATE, game_history JSON)');
rounds.on('end', function() { client.end(); });
users.on('end', function() { client.end(); });