(function (console) { "use strict";
var Control = function() { };
Control.main = function() {
	console.log("Haxe is great!");
};
Control.main();
})(typeof console != "undefined" ? console : {log:function(){}});
