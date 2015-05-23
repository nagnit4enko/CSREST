var pg =  require('pg');
var connectionString = process.env.DATABASE_URL || 'postgres://mitchellvaline:postgres@localhost:5432/csrest';

var client = new pg.Client(connectionString);
client.connect();
var query = client.query('CREATE TABLE rounds(game_id SERIAL PRIMARY KEY, complete BOOLEAN, total_item_value MONEY, total_num_items INTEGER, item_witheld JSON, players JSON)');
query.on('end', function() { client.end(); });