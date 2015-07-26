var request = require('request');
var async = require('async');

function GetSteamUserInfo(steamid, callback) {
  var connectionString = 'http://api.steampowered.com/ISteamUser/GetPlayerSummaries/v0002/?key=' + process.env.STEAM_API_KEY + '&steamids=' + steamid;

  request.get(connectionString, function(error, response, body) {
    if(!error && response.statusCode == 200) {
      var playerJson = JSON.parse(body);
      var player = playerJson.response.players[0];
      callback(null, player);
    }
    else if(error) {
      callback(error);
    }
    else {
      callback(response.statusCode);
    }
  });
}

function GetItemPrice(item, callback) {
  var itemJson = {
    "id": item.id,
    "appid": item.appid,
    "contextid": item.contextid,
    "classid": item.classid,
    "instanceid": item.instanceid,
    "icon_url": item.icon_url,
    "icon_url_large": item.icon_url_large,
    "name": item.name,
    "market_hash_name": item.market_hash_name,
    "market_name":item.market_name,
    "name_color": item.name_color,
    "median_price": null
  };

  var connectionString = 'https://steamcommunity.com/market/priceoverview/?currency=1&appid=730&market_hash_name=' + item.market_hash_name;

  request.get(connectionString, function(error, response, body) {
    if(!error && response.statusCode == 200) {
      var bodyJson = JSON.parse(body);
      itemJson.median_price = Number(bodyJson.median_price.replace("&#36;", ""));
      callback(null, itemJson);
    }
    else if(error) {
      callback(error);
    }
    else {
      callback(response.statusCode);
    }
  });
}

function GetItemsPrice(items, callback) {
  async.map(items,
    GetItemPrice,
    function(err, results){
      // All tasks are done now
      callback(results);
    }
  );
}

function GetDepositInfo(steamid, items, mainCallback) {
  async.parallel([
    function(callback) {
      GetSteamUserInfo(steamid, function(error, userData) {
        if(!error){
          callback(null, userData);
        }
        else {
          callback(error);
        }
      });
    },
    function(callback) {
      GetItemsPrice(items, function(itemsData) {
        callback(null, itemsData);
      });
    }
  ], function(error, results) {
    if(!error) {
      var itemsData = results[1];
      var total_item_value = 0.00;
      for(var i = 0; i < itemsData.length; i++) {
        var itemPrice = itemsData[i].median_price;
        total_item_value += itemPrice;
      }
      results[0].total_item_value = total_item_value;
      results[0].items = results[1];
      var playerResults = results[0];
      mainCallback(null, playerResults);
    }
    else {
      mainCallback(error);
    }
  });
}

exports.GetSteamUserInfo = GetSteamUserInfo;
exports.GetItemPrice = GetItemPrice;
exports.GetItemsPrice = GetItemsPrice;
exports.GetDepositInfo = GetDepositInfo;
