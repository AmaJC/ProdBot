var async = require('async');

/*var watson = require('watson-developer-cloud');
var alchemy_language = watson.alchemy_language({
	api_key: 'a0980d6813f71ed464520f49f2ab0e0c90c2cc5b'
})*/

var Botkit = require('botkit');

var controller = Botkit.slackbot();

var bot = controller.spawn({
	token: "xoxb-101465156790-NlQkVDpfDeKRp3vQlsxGypTx"
})

const MAX_QUERY_ITEMS = 25;
const MAX_DISPLAY_ITEMS = 5;

const PORT = process.env.PORT || 8080;

var ebay = require('ebay-api');

var walmart = require('walmart')("x8skm2cduv6h8znkr76as5ck");

var ebaySearchItem = function(item, callback) {
	ebay.xmlRequest({
		serviceName: 'Finding',
		opType: 'findItemsByKeywords',
		appId: 'TejasSha-ProdBot-SBX-dbff92a48-6a3cafaa', // FILL IN YOUR OWN APP KEY, GET ONE HERE: https://publisher.ebaypartnernetwork.com/PublisherToolsAPI
		params: {
			keywords: item.split(" "),
			
			paginationInput: {
				entriesPerPage: MAX_QUERY_ITEMS
			}
		},
		sandbox: true,
		parser: ebay.parseResponseJson // (default)
	},
	// gets all the items together in a merged array
	(error, itemsResponse) => {
		if (error) {
			console.log(error);
		} else {
			var resultingList = [];
			var items = itemsResponse.searchResult.item;

			for (var i = 0; i < items.length; i++) {
				var prod = items[i];
				resultingList.push({
					"name": prod.title,
					"price": prod.sellingStatus.currentPrice.amount,
					"provider": "ebay",
					"url": "http://www.ebay.com/itm/" + prod.productId,
					"image": prod.galleryURL
				});
				/*console.log("name:", prod.title);
				console.log("price:", prod.sellingStatus.currentPrice.amount);*/
			}

			callback(resultingList);
		}
	});
}

var walmartSearchItem = function(item, callback) {
	var resultingList = [];
	walmart.search(item, {numItems: MAX_QUERY_ITEMS}).then((result) => {
		for (var i = 0; i < result.items.length; i++) {
			var prod = result.items[i];
			resultingList.push({
				"name": prod.name,
				"price": prod.salePrice,
				"provider": "Walmart",
				"url": prod.productUrl,
				"image": prod.thumbnailImage
			});
		}

		callback(resultingList);
	});
}

/*var getProductEntity = function(inputText, callback) {
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
}*/

var getProductEntity_ForDummies = function(inputText) {
	var words = inputText.split(" ");
	var resultText = "";
	
	for (var i = 0; i < words.length; i++) {
		var word = words[i];

		if (word[0] === word[0].toUpperCase()) {
			resultText += word + " ";
		}
	}

	if (resultText === "") {
		resultText = "unknown";
	} else {
		resultText = resultText.substring(0, resultText.length - 1);
	}

	return resultText;
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
});

controller.hears(['best prices', 'cheapest prices', 'lowest prices'], 'direct_message', function(bot, message) {
	bot.startConversation(message, function(err, convo) {
		if (!err) {
			//convo.say('DEBUG: message = ' + JSON.stringify(message, null, 4));

			var targetEntity = getProductEntity_ForDummies(message.text);
			convo.say('Searching for the best prices of ' + targetEntity + '...');

			async.parallel([
				function(callback) {
					walmartSearchItem(targetEntity, (list) => {
						callback(null, list);
					})
				},
				function(callback) {
					ebaySearchItem(targetEntity, (list) => {
						callback(null, list);
					})
				}
			], function(err, results) {
				var megaList = [];
				
				for (var i = 0; i < results[0].length; i++) {
					megaList.push(results[0][i]);
				}

				for (var i = 0; i < results[1].length; i++) {
					megaList.push(results[1][i]);
				}

				megaList.sort(function(a, b) {
					return parseFloat(a.price) - parseFloat(b.price);
				});

				//console.log(megaList);
				//convo.say(megaList.slice(0, 3));
				const ACTUAL_DISPLAY_ITEMS = (MAX_DISPLAY_ITEMS > megaList.length ? megaList.length : MAX_DISPLAY_ITEMS);

				var bestList = megaList.slice(0, ACTUAL_DISPLAY_ITEMS);

				convo.say(message, "Here are the top " + ACTUAL_DISPLAY_ITEMS + " lowest-priced products:");
				for (var i = 0; i < bestList.length; i++) {
					var item = bestList[i];

					var bodyText =	(i + 1) + ". " + item.name + " - " + item.provider + "\n" + 
									" - Price: " + item.price + "\n" + 
									" - Link: " + item.url;

					/*var response = {
						//'username': 'ProdBot'
						'text': bodyText,
						'icon_url': item.image
					}*/

					convo.say(message, bodyText);
				}
			});
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

console.log("LeGaCy of TeJaCy");

//walmartSearchItem("Skateboard Helmets");
//ebaySearchItem("Skateboard Helmets");