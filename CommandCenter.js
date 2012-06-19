function CommandCenter(socket) {
	this.socket;
	this.history;
	this.status = require('./ftp.status.js').status;

	//-- constructor
	this.socket = socket;
	this.history = new Array();
	console.log(this.history);

	//-- methods
	this.doCommand = function(command) {
		command = command.substring(0, command.length-2).toLowerCase();
		var data;
		if(command.indexOf(' ') > 0) {
			data = command.substring(command.indexOf(' ')+1, command.length);
			command = command.substring(0, command.indexOf(' '));
		}
		console.log(command + " " + data + " - beeing exec");
		switch(command) {
			case "user": 
				require('./Auth.js').Auth.setUser(this, data); 
				break;

			case "pass": 
				require('./Auth.js').Auth.setPass(this, data); 
				break;

			case "pasv": 
				var p;
				var ip = require('./server.js').Server.configuration.serverIP.split('.').join(',');
				if((p = this.startPassive(this)) > 0) { 
					this.write(require('./ftp.status.js').status['227'] + ' (' + ip + ',' + (p>>8) + ',' + (p&255) + ')\r\n'); 
					this.setProperty("passivePort", p);
				}
				else { console.log("Passive on " + p + " failed"); }
				break;

			case "ls":
			case "list": 
			case "mlsd":
				this.setProperty("dataQueue", require('./Filesystem').Filesystem.list((data != null) ? data : this.getProperty("wd"), this));
				break;

			case "feat": 
				this.write(require('./ftp.status.js').status['211']); 
				break;

			case "type": 
				if(this.setType(data) == true) this.write(this.getStreamTypeMessage() + "\r\n");
				else this.write(require('./ftp.status.js').status['501']);
				break;

			case "pwd": 
				this.write(require('./Filesystem.js').Filesystem.pwd(this.getProperty("wd"))); 
				break;

			case "cwd":
				var wd;
				if((wd = require('./Filesystem.js').Filesystem.cd(data, this.getProperty("wd"))) != false) {
					wd = require('path').normalize(wd);
					this.setProperty('wd', wd);
					this.write(require('./ftp.status.js').status['250'] + wd + '\r\n');
				}
				else {
					this.write(require('./ftp.status.js').status['550']);
				}
				break;

			case "cdup":
				var wd;
				if((wd = require('./Filesystem.js').Filesystem.cd('..', this.getProperty("wd"))) != false) {
					this.setProperty('wd', wd);
					this.write(require('./ftp.status.js').status['250'] + wd + '\r\n');
				}
				else {
					this.write(require('./ftp.status.js').status['550']);
				}
				break;

			case "syst": 
				this.write(require('./ftp.status.js').status['215']); 
				break;

			case "close": this.end(); 
				break;

			case "retr":
				var s = require('./Filesystem').Filesystem.read(this.getProperty("wd"), data, require('./server.js').Server.typeToEncoding(this.streamType));
				if(s == false) {
					this.write(require('./ftp.status.js').status['550']);
				}
				else {
					this.setProperty("dataQueue", s);
				}
				break;

			case "rnfr":
				if(this.fs.fileExists(this.getProperty("wd"), data)) {
					this.setProperty("rnfr", data);
					this.write(this.status['350']);
				}
				else {
					this.write(this.status['550']);
				}
				break;
				
			case "rnto":
				if(this.getProperty("rnfr") == null || this.getProperty("rnfr") == undefined) {
					this.write(this.status['503']);
				}
				else {
					this.write(this.fs.rename(this.getProperty("wd"), this.getProperty("rnfr"), data));
					this.setProperty("rnfr", null);
				}
				break;

			case "stor":
				this.setProperty("do", function(d, ref, args){
					//console.log("data: " + d);
					//console.log("args: " + args);
					require('./Filesystem').Filesystem.write(ref.getProperty("wd"), args[0], require('./server.js').Server.typeToEncoding(ref.streamType), d);
				});
				this.setProperty("doargs", [data]);
				break;

			case "mkd":
				if(this.fs.mkdir(this.getProperty("wd"), data)) this.write('257 "' + data + '" created\r\n');
				else this.write(this.status['550']);
				break;

			case "dele":
				if(this.fs.rmfile(this.getProperty("wd"), data)) this.write(this.status['250'] + this.getProperty("wd") + '\r\n');
				else this.write(this.status['550']);
				break;

			case "rmd":
				if(this.fs.rmdir(this.getProperty("wd"), data)) this.write(this.status['250'] + this.getProperty("wd") + '\r\n');
				else this.write(this.status['550']);
				break;

			case "quit":
				this.write(this.status['221']);
				break;

 			default: 
 				this.write(require('./ftp.status.js').status['500'])
				console.log("No command executed");
		}
	};

	//-- action listeners
	this.socket.on('data', this.doCommand);

	this.socket.status = this.status;
	this.socket.fs = require('./Filesystem').Filesystem;
	this.socket.write(this.status['220']);
	this.socket.setProperty("dataQueue", null);
	this.socket.setProperty("commandCenter", this);

};

exports.CommandCenter = CommandCenter;
