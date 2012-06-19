//-- includes
require('./net.Socket.proto.js');
require('./Date.proto.js');
require('./String.proto.js');

var c = require('./CommandCenter');
var CommandCenter = c.CommandCenter;

var Server = {
	ftp: require("net"),
	server:null,
	ports:[21],
	reserver:[this],
	configuration: require('./conf.js').conf,

	start: function() {
		console.log("Starting Server!");
		process.stdin.resume();
		process.stdin.setEncoding("utf8");

		process.stdin.on('data', function(command) {
			var t = require('./server.js').Server;
			command = command.substring(0, command.length-1).toLowerCase();
			var data;
			if(command.indexOf(' ') > 0) {
				data = command.substring(command.indexOf(' ')+1, command.length);
				command = command.substring(0, command.indexOf(' '));
			}
			var l = console.log;

			console.log = function(text) {
				process.stdout.write("> " + require("util").format.apply(this, arguments) + '\n');
			}

			switch(command) {
				case "quit":
					console.log("exiting on admin request");
					process.exit();
					break;
				case "stat":
					console.log("Statistics follow: ");
					console.log("PID: " + process.pid);
					console.log("Memory usage: " + require("util").inspect(process.memoryUsage()));
					console.log("Ports reserved: " + t.ports.length);
					break;

				case "ports": {
					console.log("The following ports are reserved/in use by either a data or control socket");
					console.log(t.ports);
				}
			};

			console.log = l;
		});
		this.server = this.ftp.createServer(this.request);
		this.server.listen(5000);
	},

	request: function(socket) {
		//console.log("Request recieved");
		socket.setEncoding("utf8");
		socket.createHistory();
		new CommandCenter(socket);
	},

	getFreePort: function() {
		var p;
		do {
			p = Math.floor(Math.random()*(Math.pow(2, 16)-1024)+1024);
		} while(p in this.ports);
		return p;
	},

	portIsReserved: function(port) {
		return port in this.ports;
	},

	reservePort: function(port, reserver) {
		console.log("attempt to reserve port " + port);
		if(!this.portIsReserved(port)) {
			this.ports.push(port);
			this.reserver.push(reserver);
			return true;
		}
		return false;

	}, 

	releasePort: function(reserver) {
		//console.log("releasing port");
		var i = this.reserver.indexOf(reserver);
		if(i >= 0) {
			this.ports.splice(i, 1);
			this.reserver.splice(i, 1);
			return true;
		}
		return false;
	},

	typeToEncoding: function(type) {
		type = type.toLowerCase();
		if(type.startsWith("a")) return "ASCII";
		if(type.startsWith("i")) return null;
		return "ASCII";
	}
};

exports.Server = Server;
Server.start();