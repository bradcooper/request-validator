const express = require('express');
const app = express();
const raml1Parser = require('raml-1-parser');
const fs = require('fs');
const bodyParser = require('body-parser');
const _ = require('underscore');
const unzip = require('unzip');
const request = require('request');

var apiTypes = new Array();

function reload() {
	console.log("Starting reload of API.");
	var r = process.env.HTTP_PROXY === empty ? request.defaults() : request.defaults({ proxy: process.env.HTTP_PROXY });
	r({
		method: 'POST',
		url: 'https://anypoint.mulesoft.com/accounts/login',
		json: true,
		body: {username: process.env.ANYPOINT_USERNAME, password: process.env.ANYPOINT_PASSWORD}
	}, 
	function (error, response, body) {
		if (response.statusCode == 200) {			
			var auth = body.token_type + ' ' + body.access_token;
			console.log("Successfully authenticated with Anypoint. Token = " + auth);
		} else {
			console.log('error:', error); 
			console.log('statusCode:', response && response.statusCode);
			console.log('body:', body);
		}
	});
}

app.use(bodyParser.json({type: 'application/json'}));
app.use(bodyParser.text({type: 'text/plain'}));

app.get('/', function (req, res) {
	res.sendFile(__dirname + '/index.html');
});

app.get("/k", function (req, res) {
	res.json(_.keys(apiTypes).sort());
});

app.post('/v', function(req, res) {
	var response = '';
	apiTypes[req.query.t].validateInstanceWithDetailedStatuses(req.body).forEach(
		function (sts) {
			response += '/' + sts.getValidationPathAsString() + ': ' + sts.getMessage() + '\n';
		}
	);	
	res.send(response == '' ? 'Request is valid' : 'Request contains errors:\n' + response);
});

app.get('/reload', function(req, res) {
	reload();
	res.send('Reload requested');
});

var server_port = 8081; 
var server_ip_address = '127.0.0.1';

console.log("About to start app...");

app.listen(server_port, server_ip_address, function () {
	console.log("Listening on " + server_ip_address + ", port " + server_port);
});

reload();
