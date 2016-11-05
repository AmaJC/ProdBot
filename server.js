var request = require('request');



var watson = require('watson-developer-cloud');
var alchemy_language = watson.alchemy_language({
	api_key: 'API_KEY'
})

alchemy_language.entities({
	text: 'http://www-03.ibm.com/press/us/en/pressrelease/49384.wss'
}, function (err, response) {
	if (err)
		console.log('error:', err);
	else
		console.log(JSON.stringify(response, null, 2));
});





var Botkit = require('botkit');

var controller = Botkit.slackbot();

var bot = controller.spawn({
	token: "xoxb-100078757376-chghUOBXaiXJrlIqlPl8gyPy"
})

bot.startRTM(function(err,bot,payload) {
	if (err) {
		throw new Error('Could not connect to Slack');
	}

	// close the RTM for the sake of it in 5 seconds
	/*setTimeout(function() {
		bot.closeRTM();
	}, 5000);*/
});

controller.hears(['best prices', 'cheapest prices', 'lowest prices'], 'direct_message', function(bot, message) {
	bot.reply("Searching for lowest prices of " + message.split(" ").pop())

	controller.storage.users.get(message.user, function(err, user) {
		if (user && user.name) {
			bot.reply(message, 'Hello ' + user.name + '!!');
		} else {
			bot.reply(message, 'Hello.');
		}
	});
});

controller.hears(['uptime', 'identify yourself', 'who are you', 'what is your name'],
	'direct_message', function(bot, message) {
	var hostname = os.hostname();
	var uptime = formatUptime(process.uptime());

	bot.reply(message,
		':robot_face: I am a bot named <@' + bot.identity.name +
		'>. I have been running for ' + uptime + ' on ' + hostname + '.');
});

const PORT = process.env.PORT || 8080;

console.log("LeGaCy of TeJaCy");

var walmartKey = "x8skm2cduv6h8znkr76as5ck";

var walmartSearchItem = function(item) {
	var url = "http://api.walmartlabs.com/v1/search?apiKey=" + walmartKey + "&query=" + item;
	
	request(url, function (error, response, body) {
		if (!error && response.statusCode == 200) {
			var crap = JSON.parse(body);
			for (var i = 0; i < crap.items.length; i++) {
				var prod = crap.items[i];
				//console.log("name: " + prod.name + "\n price: " + prod.sale/Pric);
				//console.log(prod.thumbnailImage);
			}
		}
	})
}

walmartSearchItem("smart watch");