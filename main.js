var hacker = require('d2l-hacker');
var d3 = require('d3-dsv');
var fs = require('fs');
var output = []

var settings = {
	executionTimeout: 10 * 60 * 1000
}
hacker.run(settings, function (nightmare, data) {
	return nightmare
		.goto(`https://${data.domain}.brightspace.com/d2l/le/content/${data.ou}/Home`)
		.evaluate((callback) => {
			var sim = $(`<div id="simple" style="position:fixed;font-size:50px;top:200px;left:50px;background-color:#CCC;color:#000;padding:50px">Simple</div>`).appendTo('body').hide()
			var com = $(`<div id="complex" style="position:fixed;font-size:50px;top:200px;right:50px;background-color:#CCC;color:#000;padding:50px">Complex</div>`).appendTo('body').hide()
			var whatTheyChose;
			window.onkeydown = function (e) {
				switch (e.keyCode) {
					case 37: // left
						sim.show()
						com.hide()
						whatTheyChose = 'simple'
						break;
					case 39: // right
						sim.hide()
						com.show()
						whatTheyChose = 'complex'
						break;
					case 13:
						if (whatTheyChose) {
							callback(null, whatTheyChose)
						}
						break;
					default:
						return;
				}
				e.preventDefault();
			}
		})
},result => {
	fs.writeFileSync('results.csv',d3.csvFormat(result.map(elm => {elm.elements.complexity = elm.result; return elm.elements})))
})
