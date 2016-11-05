var request = require('request');

var watson = require('watson-developer-cloud');
var alchemy_language = watson.alchemy_language({
	api_key: 'a0980d6813f71ed464520f49f2ab0e0c90c2cc5b'
})

var Botkit = require('botkit');

var controller = Botkit.slackbot();

var bot = controller.spawn({
	token: "xoxb-101465156790-NlQkVDpfDeKRp3vQlsxGypTx"
})

const PORT = process.env.PORT || 8080;

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

var getProductEntity = function(inputText, callback) {
	alchemy_language.entities({
		text: inputText
	}, function (err, response) {
		if (err)
			console.log('Error while trying to extract entities: ', err);
		else {
			var entities = response.entities;

			var responseText = "";

			for (var i = 0; i < entities.length; i++) {
				responseText += "Entity: \n" + JSON.stringify(entities[i], null, 2) + "\n";
			}

			if (entities.length === 0) {
				responseText = "unknown";
			}

			callback(responseText);
		}
	});
}

var formatUptime = function(uptime) {
    var unit = 'second';
    if (uptime > 60) {
        uptime = uptime / 60;
        unit = 'minute';
    }
    if (uptime > 60) {
        uptime = uptime / 60;
        unit = 'hour';
    }
    if (uptime != 1) {
        unit = unit + 's';
    }

    uptime = uptime + ' ' + unit;
    return uptime;
}

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
	bot.startConversation(message, function(err, convo) {
		if (!err) {
			convo.say('Searching for lowest prices...');
			convo.say('DEBUG: message = ' + JSON.stringify(message, null, 4));

			getProductEntity(message.text, (targetEntity) => {
				convo.say(targetEntity);
			});
		}
	})
});

controller.hears(['uptime', 'identify yourself', 'who are you', 'what is your name'],
	'direct_message', function(bot, message) {
	var hostname = os.hostname();
	var uptime = formatUptime(process.uptime());

	bot.reply(message,
		':robot_face: I am a bot named <@' + bot.identity.name +
		'>. I have been running for ' + uptime + ' on ' + hostname + '.');
});

console.log("LeGaCy of TeJaCy");

//walmartSearchItem("smart watch");