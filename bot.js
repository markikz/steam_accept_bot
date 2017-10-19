var Steam = require('steam');
var SteamTotp = require('steam-totp');
var SteamUser = require('steam-user');
var client = new SteamUser();
var fs = require('fs');
var request = require('request');
var data;
var tmp;
var key = ""; //csgo.tm APIkey

//? нз что это
var express = require('express');
var app = express();


var SteamCommunity = require("steamcommunity");
var community = new SteamCommunity();

var SteamTrade = require("steam-trade");
var steamTrade = new SteamTrade();

var config;

//? 
app.set('port', (process.env.PORT || 5000));
app.listen(app.get('port'), function() {
  console.log('Node app is running on port', app.get('port'));
});

try{
    config = JSON.parse(fs.readFileSync('./config.json'));
} catch (err){
    console.log('Error: unable to parse config.json.');
    console.log(err);
    process.exit(1);
}

client.setOption('promptSteamGuardCode', false);
//console.log(SteamTotp.generateAuthCode(config.sharedsecret));

client.logOn({
    "accountName": config.username,
    "password": config.password
});
var TradeOfferManager = require('steam-tradeoffer-manager');
var manager =  new TradeOfferManager({
    "community": community,
    "language": "en",
    "pollInterval": 10000
});


client.on("webSession", function (steamID, cookies) {
    community.setCookies(cookies);
    manager.setCookies(cookies);
    SteamTotp.sessionID = steamID;
    community.startConfirmationChecker(4500, config.identitysecret);
    //console.log(steamTrade.sessionID);
    console.log(SteamTotp.generateAuthCode(config.sharedsecret));
});


client.on("loggedOn", function(details){
	client.setPersona(Steam.EPersonaState.Online, "nanorukik");
	client.gamesPlayed(440);

	console.log('Logged no to Steam');
});

client.on("steamGuard", function(domain, callback, lastCodeWrong){
	if(lastCodeWrong){
		console.log("Last code wrong, tying again!");
	}

	var shared_secret = config.sharedsecret;
    callback(SteamTotp.generateAuthCode(shared_secret));
});

community.on("confKeyNeeded", function(tag, callback){
    var time = Math.floor(Date.now/1000);
    callback(null, time, SteamTotp.getConfirmationKey(config.identitysecret, time, tag));
});

community.on("newConfirmations", function(conf){
    conf.respond(Math.floor(Date.now()/1000), SteamTotp.getConfirmationKey(config.identitysecret, Math.floor(Date.now()/1000),"allow"),true,function(err){
        if(err)
        {
            console.log("Confirmation failed: " + err);
            return;
        }
        console.log("Trade confirmed");
    });
});

manager.on("newOffer", function(offer) {
    if(offer.isOurOffer){
        offer.accept();
    }else {
        offer.accept();
    }
});


/*
var timerId1 = setTimeout(function tick() {
  sendCSGO();
  timerId = setTimeout(tick, 60000);
}, 60000);


function sendCSGO(){
    request('https://market.csgo.com/api/ItemRequest/in/1/?key=' + key, function (error, response, body) {
        if (!error && response.statusCode == 200)
        {
            tmp = JSON.parse(body); 
            console.log(body.success);
        }
    });
}
*/