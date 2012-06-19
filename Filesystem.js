exports.Filesystem = {
	conf: require('./conf.js').conf,
	fs: require('fs'),

	list: function(dir, ref) {
		
		var listing = this.fs.readdirSync(this.conf.rootDirectory + dir);
		listing.push('..');
		listing.push('.');
		var output = "";
		var stats;
		for(var f in listing) {
			stats = this.fs.statSync(this.conf.rootDirectory + dir + listing[f]);
			if(listing[f] == "..") {
				output += "type=pdir;";
			}
			else if(listing[f] == ".") {
				output += "type=cdir;";
			}
			else output += "type=" + ((stats.isFile()) ? "file" : "dir")  + ";";

			output += "siz" + ((stats.isFile()) ? "e" : "d") + "=" + stats.size + ";";
			output += "modify=" + stats.mtime.format('YmDHMS') + ";";
			output += "UNIX.mode=" + /*stats.mode*/"0600" + ";";
			output += "UNIX.uid=" + stats.uid + ";";
			output += "UNIX.gid=" + stats.gid + ";"; //gid!
			output += "unique=" + stats.ino + "; ";
			output += listing[f] + "\r\n";
		}

		//console.log(output);
		return output;
	},

	pwd: function(dir) {
		return '257 "' + dir + '" is your current location \r\n';
	},

	cd: function(dir, wd) {
		if(dir == '.') return wd;
		if(!dir.startsWith('/')) {
			wd = require('path').normalize(wd + dir);
		}
		else {
			wd = dir;
		}
		
		if(require('path').existsSync(this.conf.rootDirectory + wd) && this.fs.statSync(this.conf.rootDirectory + wd).isDirectory()) {
			//console.log('The current directory is ' + wd + '/');
			return wd + '/';
		}
		return false;
	},

	fileExists: function(wd, filename) {
		if(filename.startsWith('/')) filename = this.conf.rootDirectory + filename;
		else filename = this.conf.rootDirectory + wd + filename;

		return require('path').existsSync(filename) && this.fs.statSync(filename).isFile();
	},

	extFileExists: function(filename) {
		return require('path').existsSync(filename) && this.fs.statSync(filename).isFile();	
	},

	rename: function(wd, filename, to) {
		if(filename.startsWith('/')) filename = this.conf.rootDirectory + filename;
		else filename = this.conf.rootDirectory + wd + filename;

		if(to.startsWith('/')) to = this.conf.rootDirectory + to;
		else to = this.conf.rootDirectory + wd + to;

		if(this.extFileExists(filename) && ! this.extFileExists(to)) {
			this.fs.rename(filename, to);
			return require('./ftp.status.js').status['250'] + wd + "\r\n";
		}
		else if(this.extFileExists(to)) {
			//target file exists
			return require('./ftp.status.js').status['450'] + "Destination exists!" + "\r\n";
		}
		else if(!this.extFileExists()) {
			//source file not found
			return require('./ftp.status.js').status['450'] + "Source file not found." + "\r\n";
		}
	},

	read: function(wd, filename, encoding) {
		if(filename.startsWith('/')) filename = this.conf.rootDirectory + filename;
		else filename = this.conf.rootDirectory + wd + filename;

		if(!require('path').existsSync(filename)) return false;
		if(!this.fs.statSync(filename).isFile()) return false;

		if(encoding != null) return this.fs.readFileSync(filename, encoding);
		else {
			var fd = this.fs.openSync(filename, 'r');
			var b = new Buffer(this.fs.statSync(filename).size);
			this.fs.readSync(fd, b, 0, this.fs.statSync(filename).size, 0);
			return b;
		}
		
	},

	write: function(wd, filename, encoding, data) {
		if(filename.startsWith('/')) filename = this.conf.rootDirectory + filename;
		else filename = this.conf.rootDirectory + wd + filename;

		if(encoding != null) this.fs.writeFileSync(filename, data, encoding);
		else {
			var fd = this.fs.openSync(filename, 'w');
			this.fs.writeSync(fd, data, 0, data.length, 0);
		}
	},

	mkdir: function(wd, path) {
		if(path.startsWith('/')) path = this.conf.rootDirectory + path;
		else path = this.conf.rootDirectory + wd + path;

		if(require('path').existsSync(path)) return false;

		this.fs.mkdirSync(path);
		return true;
	},

	rmdir: function(wd, path) {
		if(path.startsWith('/')) path = this.conf.rootDirectory + path;
		else path = this.conf.rootDirectory + wd + path;

		if(!require('path').existsSync(path)) return false;

		console.log("removing");
		this.fs.rmdir(path, null);
		console.log("finished removing");
		return true;
	},

	rmfile: function(wd, path) {
		if(path.startsWith('/')) path = this.conf.rootDirectory + path;
		else path = this.conf.rootDirectory + wd + path;

		if(!require('path').existsSync(path)) return false;

		console.log("unlinking");
		this.fs.unlink(path, null);
		console.log("finished unlinking");
		return true;
	}
}