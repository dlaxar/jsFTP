String.prototype.startsWith = function(start) {
	return this.indexOf(start) == 0;
};

String.prototype.endsWith = function(end) {
	return this.indexOf(end) == this.length-end.length;
};