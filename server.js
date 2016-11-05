var ConversationV1 = require('watson-developer-cloud/conversation/v1');

var conversation = new ConversationV1({
	username: '02917926-80b7-4368-a73a-8368209aaf9f',
	password: 'lizyVQKqxRTe',
	version_date: '2016-07-01'
});

var request = require('request');

var readline = require('readline');

const rl = readline.createInterface({
	input: process.stdin,
	output: process.stdout
});

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

var handleBotResponse = function(userText, callback) {
	conversation.message({
		input: { text: userText },
		workspace_id: 'c4a9903a-b14a-45c0-8a30-c013b4ff3a6a'
	}, callback);
}

rl.question("Hi there! What would you like me to do?", function(answer) {
	handleBotResponse(answer, function(err, response) {
		if (err) {
			console.log(err);
		} else {
			console.log(response.output);
		}

		rl.close();
	})
})

/*handleBotResponse("Best prices for bananas", function(err, response) {
	if (err) {
		console.log(err);
	} else {
		console.log("$59.99");
	}
});*/

walmartSearchItem("smart watch")