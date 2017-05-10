# D2L Hacker
Manages the cli, login, and saving results for d2l/nightmare projects

## Example
``` javascript
var hacker = require('d2l-hacker');

hacker.run({},function(nightmare,data) {
	return nightmare
		.goto('https://'+data.domain+'.brightspace.com/d2l/lms/dropbox/admin/folders_manage.d2l?ou='+data.ou)
		.evaluate(() => {
			return $('span.ds_i').text()
		})
})
```
This will prompt for username, password, and csv from the user. 
Then log into byui and call the passed function on every row of the csv, passing you the row data and domain as a property.
All you have to do is return the nightmare you want run every time.
I will catch and save all the errors thrown, and values returned if any. Saving them all to a json file. 

---

These are my default settings, you can change any of these in the passed settings object. 
Any passed settings (with the exception of `username` and `password`) will be double checked in the cli as the default value
``` javascript
{
  username:     logInData.username,
  password:     logInData.password,
  csv:          logInData.csv,
  domain:       'byui',
  show:         true,
  openDevTools: false,
  waitTimeout:  30000,
  resultsFile:  './results.json'
}
```
