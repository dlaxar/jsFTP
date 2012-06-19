var users = require('./users.js').users;
var status = require('./ftp.status.js').status;
exports.Auth = {
	setUser: function(ref, data) {
		if(this.userExists(data) >= 0) { ref.write(status['331']); ref.setProperty("user", data);}
		else {ref.write(status['430']); return false; }
	},

	setPass: function(ref, data) {
		if(ref.getProperty("user") == undefined) { ref.write(status['503']); return; }

		if(this.userExists(ref.getProperty("user")) >= 0 && users[this.userExists(ref.getProperty("user"))].password == data) { 
			ref.setProperty("pass", data);
			ref.setProperty("wd", users[this.userExists(ref.getProperty("user"))].root);
			ref.setProperty("login", 1); //set login variable
			ref.write(status['230']); 
		}
		else {ref.write(status['430']); return false; }
	},

	isLoggedIn: function(ref) {
		return ref.getProperty("login") == 1;
	},

	userExists: function(user) {
		if(user == undefined) return -1;
		user = user.toLowerCase();
		for (var i = 0; i < users.length; i++) {
			if(users[i].name.toLowerCase() == user) return i;
		}
		return -1;
	}
}