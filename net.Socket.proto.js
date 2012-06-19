require('net').Socket.prototype.createHistory = function() {
			this.history = [];
		};
require('net').Socket.prototype.getHistory = function() {
	return this.history;
};
require('net').Socket.prototype.setProperty = function(property, value) {
	if(undefined == this.properties) this.properties = [];
	this.properties[property] = value;
	//console.log("Setting " + property + "=" + this.properties[property]);
};
require('net').Socket.prototype.getProperty = function(property) {
	if(undefined == this.properties) this.properties = [];
	if(!(property in this.properties)) return undefined;
	return this.properties[property];
};

require('net').Socket.prototype.flushProperties = function() {
	this.properties = [];
};

require('net').Socket.prototype.startPassive = function(ref) {
	var callback = function(socket) {
		var parent = require('./server.js').Server.reserver[require('./server.js').Server.ports.indexOf(socket.address().port)].getProperty("commandCenter").socket;

		console.log("encoding: " + require('./server.js').Server.typeToEncoding(parent.streamType));
		
		//socket.setEncoding(require('./server.js').Server.typeToEncoding(parent.streamType));
		socket.setProperty("input", "");

		parent.write(require('./ftp.status.js').status['150']);

		socket.on('data', function(data) {
			//console.log("input from connection: " + data);
			if(Buffer.isBuffer(data)) {
				if(socket.getProperty("input") == "") this.setProperty("input", data);
				else {
					var b = new Buffer(data.length + this.getProperty("input"));
					this.getProperty("input").copy(b);
					data.copy(b, this.getProperty("input").length);
					this.setProperty("input", b);
				}
			}
			else this.setProperty("input", this.getProperty("input") + data);
			//console.log("input: " + this.getProperty("input"));
		});
		socket.on('end', function() {
			//console.log("input: " + this.getProperty("input"));
			parent.setProperty("inputData", this.getProperty("input"));
			parent.write("226 file action successfull\r\n");
			require('./server.js').Server.releasePort(parent);
			parent.passiveEnded(this.getProperty("input"));
		});

		if(parent.getProperty("dataQueue") != null && parent.getProperty("dataQueue") != undefined) {
			//console.log("Output starting");	
			socket.write(parent.getProperty("dataQueue"));
			socket.end();
			return;
		}
	};

	this.passive = require('net').createServer(callback);

	var p;
	if(require('./server.js').Server.reservePort(p = require('./server.js').Server.getFreePort(), ref)) {
		this.passive.listen(p);
		return p;
	}
	else {
		console.log("failed to register port");
		return -1;
	}
};


require('net').Socket.prototype.passiveEnded = function(data) {
	if(this.getProperty("do") != null && this.getProperty("do") != undefined && this.getProperty("doargs") != null && this.getProperty("doargs") != undefined) {
		this.getProperty("do")(data, this, this.getProperty("doargs"));
	}
	this.setProperty("do", null);
	this.setProperty("doargs", null);
};

require('net').Socket.prototype.setType = function(type) {

	type = type.toLowerCase();

	var major = type.substr(0, 1);
	var minor;
	if(major == "a" || major == "e") {
		if(type.length < 2) minor = "n";
		else minor = type.substr(1, 1);
		
		if(minor != "n" && minor != "t" && minor != "c") {
			return false;
		}

		this.streamType = major + "" + minor;
		return true;
	}
	else if(major == "i" || major == "l") {
		this.streamType = major;
		return true;
	}
	else return false;
};

require('net').Socket.prototype.getStreamTypeMessage = function() {
	var out = '200 TYPE is now '
	switch(this.streamType) {
		case "i": return out + "8-bit binary";
		case "l": return out + "8b";
		case "an": return out + "ASCII Non-Print (AN)"; 
		case "at": return out + "8b binary"; // |
		case "ac": return out + "8b binary"; // | not implemented
		case "en": return out + "8b binary"; // v
		case "et": return out + "8b binary";
		case "ec": return out + "8b binary";
		default: return '501 Unknown type';
	}
};

