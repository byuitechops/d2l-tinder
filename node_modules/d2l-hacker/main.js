var Nightmare = require('nightmare')
var prompt = require('prompt')
var d3 = require('d3-dsv')
var fs = require('fs')

var list, doStuff, resultsFile, masterCallback, results = []

module.exports = {
	run: function (logInData, theirFunction, callback) {
		masterCallback = callback
		doStuff = theirFunction
		getPromptData(logInData)
	},
	evalEach: function (nightmare, array, theirFunction) {
		nightmare = array.reduce((knight, elm) => knight.evaluate(thierFunction, elm), nightmare)
	},
	forEach: function (nightmare, array, theirFunction) {
		nightmare = array.reduce((knight, elm) => theirFunction(nightmare, elm), nightmare)
	}
}

function generatePromptProps(logInData) {
	var promptProps = []
	// push them through
	if (!logInData.username) {
		promptProps.push({
			name: 'username',
			required: true
		})
	}
	if (!logInData.password) {
		promptProps.push({
			name: 'password',
			hidden: 'true',
			replace: '*',
			required: true
		})
	}
	if (!logInData.csv) {
		promptProps.push({
			name: 'csv',
			required: true,
			conform: fs.existsSync,
			message: "Please make sure that file exists"
		})
	}
	// knock them out of our object
	var copy = Object.assign({}, logInData)
	delete copy.username
	delete copy.password
	// go through the rest of the list
	for (var key in copy)
		promptProps.push({
			name: key,
			default: copy[key]
		})
	return promptProps;
}

function getPromptData(logInData, callback) {
	prompt.start()
	prompt.get(generatePromptProps(logInData), function (err, result) {
		var promptData = Object.assign({}, result)

		// here are our defaults
		var defaults = {
			username: logInData.username,
			password: logInData.password,
			csv: logInData.csv,
			domain: 'byui',
			show: true,
			openDevTools: false,
			waitTimeout: 30000,
			executionTimeout: 30000,
			gotoTimeout: 30000
		}
		for (var key in defaults)
			promptData[key] = promptData[key] || defaults[key]

		resultsFile = result.resultsFile || logInData.resultsFile || './results.json'

		list = readCSV(promptData.csv)
		list.forEach(row => row.domain = promptData.domain)
		logIn(promptData)
	})
}

function readCSV(fileName) {
	// make sure the file exists
	var file
	try {
		file = fs.readFileSync(fileName, "UTF-8")
	} catch (e) {
		throw ("Reading the csv failed:\n" + e)
	}
	return d3.csvParse(file)
}

function logIn(promptData) {
	var nightmare = Nightmare({
		show: promptData.show,
		openDevTools: promptData.openDevTools,
		waitTimeout: promptData.waitTimeout,
		executionTimeout: promptData.executionTimeout,
		gotoTimeout: promptData.gotoTimeout
	})
	nightmare
		.goto('https://' + promptData.domain + '.brightspace.com/d2l/login?noredirect=true')
		.wait('#password')
		.insert('#userName', promptData.username)
		.insert('#password', promptData.password)
		.click('#formId div a')
		.wait(() => window.location.pathname == "/d2l/home")
		.then(() => {
			run(nightmare, 0)
		})
		.catch(console.error)
}

function run(nightmare, index) {
	nightmare
		.then(() => {
			return doStuff(nightmare, list[index])
		})
		.then((result) => {
			var message = "Row " + (index + 2) + " Succeded: " + result
			results.push({
				status: "Succeded",
				result: result,
				message: message,
				row: index + 2,
				elements: list[index]
			})
			console.error(message)
		})
		.catch((e) => {
			var message = "Row " + (index + 2) + " Failed: " + JSON.stringify(e)
			results.push({
				status: "Failed",
				result: JSON.stringify(e),
				message: message,
				row: index + 2,
				elements: list[index]
			})
			console.error(message)
		})
		.then(() => {
			if (index < list.length - 1) {
				run(nightmare, index + 1)
			} else {
				fs.writeFileSync(resultsFile, JSON.stringify(results))
				if(masterCallback){
					masterCallback(results)
				}
				return nightmare.end()
			}
		})
		.catch(console.error)
}
