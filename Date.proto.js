Date.prototype.format = function(format) {
	var pad = function(str, num, wit) {str+="";for(var i = str.length; i < num; i++) {str=wit+str;}return str;};
	format = format.replace(/Y/, this.getFullYear());
	format = format.replace(/m/, pad(this.getMonth()+1, 2, 0));
	format = format.replace(/D/, pad(this.getDate(), 2, 0));
	format = format.replace(/H/, pad(this.getHours(), 2, 0));
	format = format.replace(/M/, pad(this.getMinutes(), 2, 0));
	format = format.replace(/S/, pad(this.getSeconds(), 2, 0));
	return format;
};


