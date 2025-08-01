"use strict";
const http = require('http');
const fs = require('fs');
const path = require('path');
const express = require("express");
const app = express();
app.use(express.static('public'));
app.use(express.static('FINAL_PROJECT'));
const bodyParser = require("body-parser");
const axios = require('axios');
require("dotenv").config({ path: path.resolve(__dirname, 'creds/.env') })
const uri =
`mongodb+srv://${process.env.MONGO_DB_USERNAME}:${process.env.MONGO_DB_PASSWORD}@summercampapplication0.vsrxw.mongodb.net/?retryWrites=true&w=majority&appName=SummerCampApplication0`;
const databaseAndCollection = {db: "Real_Time_Rail_Predictions", collection:"railPredictions"};
const { MongoClient, ServerApiVersion } = require('mongodb');
const client = new MongoClient(uri, { serverApi: ServerApiVersion.v1 });
let counter = 0;

/*WMATA keys to access the data and the URL*/
const primaryKey = "ef1e5a59812e4481b9fb6ae7ab523932";
const secondaryKey = "dc71d44928524d209537ae5b12f6949c";
let stationName = "ALL"
const URL = `https://api.wmata.com/StationPrediction.svc/json/GetPrediction/${stationName}?api_key=${primaryKey}`;

async function insertInformation(client, databaseAndCollection, newInformation) {
	const result =
    await client.db(databaseAndCollection.db).collection(databaseAndCollection.collection).insertOne(newInformation);
	return result;
}
class Shutdown {
	#message = "";
	constructor(message) {
		this.#message = message;
	}
	displayMessage() {
		process.stdout.write(`${this.#message}`);
	}
}
const message = "Shutting down the server\n";
const shutDownMessage = new Shutdown(message);
process.stdin.setEncoding("utf8");
if (process.argv.length != 3) {
    process.stdout.write(`Usage ${path.basename(process.argv[1])} jsonFile`);
	  process.stdout.write("\n");
    process.exit(1);
}
const file = process.argv[1];
const fileName = path.parse(process.argv[1]).name;
const portNumber = process.env.PORT || 10000;
process.stdout.write(`Web server started and running at http://localhost:${portNumber}\n`);
const prompt = `Stop to shutdown the server: `;
process.stdout.write(prompt);
process.stdin.on("readable", function () {
	const dataInput = process.stdin.read();
	if (dataInput !== null) {
	  const command = dataInput.trim();
	  if (command === "stop") {
			shutDownMessage.displayMessage();
			process.exit(0);
	  }
	  else if (command !== "stop") {
		process.stdout.write(`Invalid command: ${command}`);
		process.stdout.write("\n");
		process.stdout.write(prompt);
	  }
	  process.stdin.resume();
	}
  });
  	app.get("/", (request, response) => {
		const variables = {
			portNumber: portNumber
		};
		response.render("index", variables);
	});
	app.listen(portNumber, '0.0.0.0');
	app.set("views", path.resolve(__dirname, "templates"));
	app.set("view engine", "ejs");
	app.use(bodyParser.urlencoded({extended:true}));
	app.get("/feedbackForUs", (request, response) => {
		const variables = {
			portNumber: portNumber
		};
		response.render("feedbackForUs", variables);
	});
	app.post("/feedbackForUs", async (request, response) => {
		counter++;
		let time = new Date();
			let {name, email, feedback} =  request.body;
			const variables = {
				name: name,
				email: email,
				feedback: feedback,
				time: time,
				portNumber: portNumber
			};
			let travelerFeedback = { feedback: feedback, time: time, portNumber: portNumber};
		await client.connect();
		await insertInformation(client, databaseAndCollection, travelerFeedback);
			response.render("feedbackData", variables);
		});
	app.get("/displayTrains", async (request, response) => {
		await client.connect();
		const res = await axios.get(URL);
		const stations = res.data.Trains;
		stations.sort((a, b) => a.LocationName.localeCompare(b.LocationName));
		let output = "";
		stations.forEach((element) => {
			output += `<option value = "${element.LocationName}"> ${element.LocationName}</option>`;
		});
		const variables = {
			items: output,
			portNumber: portNumber
		};
		response.render("displayTrains", variables);
	});
	app.post("/displayTrains", async (request, response) => {
		const selectedStation = request.body.LocationName;
		await client.connect();
		const res = await axios.get(URL);
		const stations = res.data.Trains;
		const selectedInfo = stations.filter(element => element.LocationName === selectedStation);
		let output =
		"<table border='1'><thead><th>Train Destination(direction)</th>"
		output += "<th>Minutes away from selected station</th><th>Line(Train color)</th><th># of Cars</th></thead>";
		selectedInfo.forEach(element => {
			output += `<tr><td>${element.Destination}</td><td>${(element.Min)}</td><td>${(element.Line)}</td><td>${(element.Car)}</td></tr>`;
		})
		output += "</table>";
		const variables = {
			trainTable: output,
			portNumber: portNumber
		};
		response.render("trainData", variables);
	});
	app.get("/clearAll", (request, response) => {
		const variables = {
			portNumber: portNumber
		};
		response.render("clearAll", variables);
	});
	app.post("/clearAll", async (request, response) => {
		await client.connect();
		let temp = counter;
		counter = 0;
		const variables = {
			counter: temp,
			portNumber: portNumber
		};
		const result = await client.db(databaseAndCollection.db).collection(databaseAndCollection.collection).deleteMany({});
		response.render("clearing", variables);
	});