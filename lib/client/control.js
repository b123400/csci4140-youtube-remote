(function (console, $hx_exports) { "use strict";
function $extend(from, fields) {
	function Inherit() {} Inherit.prototype = from; var proto = new Inherit();
	for (var name in fields) proto[name] = fields[name];
	if( fields.toString !== Object.prototype.toString ) proto.toString = fields.toString;
	return proto;
}
var ArrayExtension = function() { };
ArrayExtension.__name__ = true;
ArrayExtension.indexSatisfingCondition = function(array,f) {
	var _g1 = 0;
	var _g = array.length;
	while(_g1 < _g) {
		var i = _g1++;
		if(f(array[i])) return i;
	}
	return -1;
};
var PlayList = function() {
	this.videos = [];
	this.element = window.document.createElement("div");
};
PlayList.__name__ = true;
PlayList.prototype = {
	addVideoByID: function(videoID) {
		var _g = this;
		SocketManager.client.getVideoTitle(videoID,function(title) {
			if(title == null) {
				window.alert("Wrong youtube video id");
				return;
			}
			var newVideo = new Video(videoID,title);
			_g.addVideo(newVideo);
		});
	}
	,addVideo: function(newVideo) {
		this.videos.push(newVideo);
		this.reloadElement();
		this.playlistUpdated();
	}
	,importVideos: function(videos) {
		this.videos = videos.map(function(video) {
			return new Video(video.id,video.name);
		});
		this.reloadElement();
	}
	,removeVideo: function(thisVideo) {
		var index = HxOverrides.indexOf(this.videos,thisVideo,0);
		this.videos.splice(index,1);
		this.reloadElement();
		this.playlistUpdated();
	}
	,clearAllVideos: function() {
		this.videos = [];
		this.reloadElement();
		this.playlistUpdated();
	}
	,playlistUpdated: function() {
		var win = window;
		win.updateOthersPlaylist();
	}
	,reloadElement: function() {
		var _g = this;
		this.element.innerHTML = "";
		var _g1 = 0;
		var _g11 = this.videos;
		while(_g1 < _g11.length) {
			var video = _g11[_g1];
			++_g1;
			this.element.appendChild(video.element);
		}
		var input;
		input = js_Boot.__cast(window.document.createElement("input") , HTMLInputElement);
		var okButton = window.document.createElement("button");
		okButton.innerHTML = "ok";
		okButton.addEventListener("click",function() {
			_g.addVideoByID(input.value);
		});
		this.element.appendChild(input);
		this.element.appendChild(okButton);
	}
	,currentVideoIndex: function() {
		var currentVideoId = YoutubeAPI.shared.currentVideoId;
		return ArrayExtension.indexSatisfingCondition(this.videos,function(video) {
			return video.videoID == currentVideoId;
		});
	}
	,currentVideo: function() {
		return this.videos[this.currentVideoIndex()];
	}
	,toJSON: function() {
		return this.videos;
	}
	,__class__: PlayList
};
var Control = $hx_exports.Control = function() { };
Control.__name__ = true;
Control.main = function() {
	window.addEventListener("load",function(e) {
		Control.init(window);
	});
};
Control.isDesktopMode = function() {
	return window.document.body.offsetWidth >= 992;
};
Control.applyCommand = function(command) {
	var $it0 = Control.buttons.iterator();
	while( $it0.hasNext() ) {
		var button = $it0.next();
		if(button.command() == command) {
			button.clicked(null);
			break;
		}
	}
};
Control.init = function(global) {
	var playlist = Control.playlist;
	var _g = new haxe_ds_StringMap();
	var value = new PlayButton();
	if(__map_reserved.play != null) _g.setReserved("play",value); else _g.h["play"] = value;
	var value1 = new PauseButton();
	if(__map_reserved.pause != null) _g.setReserved("pause",value1); else _g.h["pause"] = value1;
	var value2 = new StopButton();
	if(__map_reserved.stop != null) _g.setReserved("stop",value2); else _g.h["stop"] = value2;
	var value3 = new PreviousButton();
	if(__map_reserved.previous != null) _g.setReserved("previous",value3); else _g.h["previous"] = value3;
	var value4 = new NextButton();
	if(__map_reserved.next != null) _g.setReserved("next",value4); else _g.h["next"] = value4;
	var value5 = new RewindButton();
	if(__map_reserved.rewind != null) _g.setReserved("rewind",value5); else _g.h["rewind"] = value5;
	var value6 = new FastForwardButton();
	if(__map_reserved.fastForward != null) _g.setReserved("fastForward",value6); else _g.h["fastForward"] = value6;
	var value7 = new MuteButton();
	if(__map_reserved.mute != null) _g.setReserved("mute",value7); else _g.h["mute"] = value7;
	var value8 = new UnmuteButton();
	if(__map_reserved.unmute != null) _g.setReserved("unmute",value8); else _g.h["unmute"] = value8;
	Control.buttons = _g;
	global.buttons = Control.buttons;
	var wrapper = window.document.getElementsByTagName("body")[0];
	wrapper.appendChild(YoutubeAPI.shared.elementToInsert());
	var buttonWrapper = window.document.createElement("div");
	buttonWrapper.className = "buttons";
	var $it0 = Control.buttons.iterator();
	while( $it0.hasNext() ) {
		var button = $it0.next();
		buttonWrapper.appendChild(button.element);
	}
	wrapper.appendChild(buttonWrapper);
	wrapper.appendChild(playlist.element);
	playlist.reloadElement();
};
var Button = function() {
	this.element = window.document.createElement("div");
	this.element.addEventListener("click",$bind(this,this.clickHandler));
};
Button.__name__ = true;
Button.prototype = {
	setDisplayText: function(text) {
		this.element.innerHTML = text;
	}
	,clickHandler: function(e) {
		if(Control.isDesktopMode()) this.clicked(e); else {
			var client = window.client;
			client.broadcastCommand(this.command());
		}
	}
	,command: function() {
		return "null";
	}
	,clicked: function(e) {
	}
	,__class__: Button
};
var PlayButton = function() {
	Button.call(this);
	this.setDisplayText("Play");
};
PlayButton.__name__ = true;
PlayButton.__super__ = Button;
PlayButton.prototype = $extend(Button.prototype,{
	command: function() {
		return "play";
	}
	,clicked: function(e) {
		YoutubeAPI.shared.play();
	}
	,__class__: PlayButton
});
var PauseButton = function() {
	Button.call(this);
	this.setDisplayText("Pause");
};
PauseButton.__name__ = true;
PauseButton.__super__ = Button;
PauseButton.prototype = $extend(Button.prototype,{
	command: function() {
		return "pause";
	}
	,clicked: function(e) {
		YoutubeAPI.shared.pause();
	}
	,__class__: PauseButton
});
var StopButton = function() {
	Button.call(this);
	this.setDisplayText("Stop");
};
StopButton.__name__ = true;
StopButton.__super__ = Button;
StopButton.prototype = $extend(Button.prototype,{
	command: function() {
		return "stop";
	}
	,clicked: function(e) {
		YoutubeAPI.shared.loadVideo(Control.playlist.videos[0].videoID);
		YoutubeAPI.shared.stop();
	}
	,__class__: StopButton
});
var PreviousButton = function() {
	Button.call(this);
	this.setDisplayText("Previous");
};
PreviousButton.__name__ = true;
PreviousButton.__super__ = Button;
PreviousButton.prototype = $extend(Button.prototype,{
	command: function() {
		return "previous";
	}
	,clicked: function(e) {
		var currentVideoIndex = Control.playlist.currentVideoIndex();
		var nextVideo = Control.playlist.videos[currentVideoIndex - 1];
		if(nextVideo != null) YoutubeAPI.shared.play(nextVideo.videoID);
	}
	,__class__: PreviousButton
});
var NextButton = function() {
	Button.call(this);
	this.setDisplayText("Next");
};
NextButton.__name__ = true;
NextButton.__super__ = Button;
NextButton.prototype = $extend(Button.prototype,{
	command: function() {
		return "next";
	}
	,clicked: function(e) {
		var currentVideoIndex = Control.playlist.currentVideoIndex();
		var nextVideo = Control.playlist.videos[currentVideoIndex + 1];
		if(nextVideo != null) YoutubeAPI.shared.play(nextVideo.videoID);
	}
	,__class__: NextButton
});
var RewindButton = function() {
	Button.call(this);
	this.setDisplayText("Rewind");
};
RewindButton.__name__ = true;
RewindButton.__super__ = Button;
RewindButton.prototype = $extend(Button.prototype,{
	command: function() {
		return "rewind";
	}
	,clicked: function(e) {
		YoutubeAPI.shared.rewind();
	}
	,__class__: RewindButton
});
var FastForwardButton = function() {
	Button.call(this);
	this.setDisplayText("Fast forward");
};
FastForwardButton.__name__ = true;
FastForwardButton.__super__ = Button;
FastForwardButton.prototype = $extend(Button.prototype,{
	command: function() {
		return "fastForward";
	}
	,clicked: function(e) {
		YoutubeAPI.shared.fastForward();
	}
	,__class__: FastForwardButton
});
var MuteButton = function() {
	Button.call(this);
	this.setDisplayText("Mute");
};
MuteButton.__name__ = true;
MuteButton.__super__ = Button;
MuteButton.prototype = $extend(Button.prototype,{
	command: function() {
		return "mute";
	}
	,clicked: function(e) {
		YoutubeAPI.shared.mute();
	}
	,__class__: MuteButton
});
var UnmuteButton = function() {
	Button.call(this);
	this.setDisplayText("Unmute");
};
UnmuteButton.__name__ = true;
UnmuteButton.__super__ = Button;
UnmuteButton.prototype = $extend(Button.prototype,{
	command: function() {
		return "unmute";
	}
	,clicked: function(e) {
		YoutubeAPI.shared.unmute();
	}
	,__class__: UnmuteButton
});
var Video = function(videoID,name) {
	this.videoID = videoID;
	this.element = window.document.createElement("div");
	this.element.addEventListener("click",$bind(this,this.play));
	this.set_name(name);
};
Video.__name__ = true;
Video.prototype = {
	play: function() {
		YoutubeAPI.shared.play(this.videoID);
	}
	,set_name: function(newName) {
		this.name = newName;
		this.makeElementContent();
		return newName;
	}
	,makeElementContent: function() {
		this.element.innerHTML = "" + this.name + " / " + this.videoID;
	}
	,toJSON: function() {
		return { id : this.videoID, name : this.name};
	}
	,__class__: Video
};
var HxOverrides = function() { };
HxOverrides.__name__ = true;
HxOverrides.indexOf = function(a,obj,i) {
	var len = a.length;
	if(i < 0) {
		i += len;
		if(i < 0) i = 0;
	}
	while(i < len) {
		if(a[i] === obj) return i;
		i++;
	}
	return -1;
};
Math.__name__ = true;
var Std = function() { };
Std.__name__ = true;
Std.string = function(s) {
	return js_Boot.__string_rec(s,"");
};
var haxe_IMap = function() { };
haxe_IMap.__name__ = true;
var haxe_ds__$StringMap_StringMapIterator = function(map,keys) {
	this.map = map;
	this.keys = keys;
	this.index = 0;
	this.count = keys.length;
};
haxe_ds__$StringMap_StringMapIterator.__name__ = true;
haxe_ds__$StringMap_StringMapIterator.prototype = {
	hasNext: function() {
		return this.index < this.count;
	}
	,next: function() {
		return this.map.get(this.keys[this.index++]);
	}
	,__class__: haxe_ds__$StringMap_StringMapIterator
};
var haxe_ds_StringMap = function() {
	this.h = { };
};
haxe_ds_StringMap.__name__ = true;
haxe_ds_StringMap.__interfaces__ = [haxe_IMap];
haxe_ds_StringMap.prototype = {
	get: function(key) {
		if(__map_reserved[key] != null) return this.getReserved(key);
		return this.h[key];
	}
	,setReserved: function(key,value) {
		if(this.rh == null) this.rh = { };
		this.rh["$" + key] = value;
	}
	,getReserved: function(key) {
		if(this.rh == null) return null; else return this.rh["$" + key];
	}
	,arrayKeys: function() {
		var out = [];
		for( var key in this.h ) {
		if(this.h.hasOwnProperty(key)) out.push(key);
		}
		if(this.rh != null) {
			for( var key in this.rh ) {
			if(key.charCodeAt(0) == 36) out.push(key.substr(1));
			}
		}
		return out;
	}
	,iterator: function() {
		return new haxe_ds__$StringMap_StringMapIterator(this,this.arrayKeys());
	}
	,__class__: haxe_ds_StringMap
};
var js_Boot = function() { };
js_Boot.__name__ = true;
js_Boot.getClass = function(o) {
	if((o instanceof Array) && o.__enum__ == null) return Array; else {
		var cl = o.__class__;
		if(cl != null) return cl;
		var name = js_Boot.__nativeClassName(o);
		if(name != null) return js_Boot.__resolveNativeClass(name);
		return null;
	}
};
js_Boot.__string_rec = function(o,s) {
	if(o == null) return "null";
	if(s.length >= 5) return "<...>";
	var t = typeof(o);
	if(t == "function" && (o.__name__ || o.__ename__)) t = "object";
	switch(t) {
	case "object":
		if(o instanceof Array) {
			if(o.__enum__) {
				if(o.length == 2) return o[0];
				var str2 = o[0] + "(";
				s += "\t";
				var _g1 = 2;
				var _g = o.length;
				while(_g1 < _g) {
					var i1 = _g1++;
					if(i1 != 2) str2 += "," + js_Boot.__string_rec(o[i1],s); else str2 += js_Boot.__string_rec(o[i1],s);
				}
				return str2 + ")";
			}
			var l = o.length;
			var i;
			var str1 = "[";
			s += "\t";
			var _g2 = 0;
			while(_g2 < l) {
				var i2 = _g2++;
				str1 += (i2 > 0?",":"") + js_Boot.__string_rec(o[i2],s);
			}
			str1 += "]";
			return str1;
		}
		var tostr;
		try {
			tostr = o.toString;
		} catch( e ) {
			return "???";
		}
		if(tostr != null && tostr != Object.toString && typeof(tostr) == "function") {
			var s2 = o.toString();
			if(s2 != "[object Object]") return s2;
		}
		var k = null;
		var str = "{\n";
		s += "\t";
		var hasp = o.hasOwnProperty != null;
		for( var k in o ) {
		if(hasp && !o.hasOwnProperty(k)) {
			continue;
		}
		if(k == "prototype" || k == "__class__" || k == "__super__" || k == "__interfaces__" || k == "__properties__") {
			continue;
		}
		if(str.length != 2) str += ", \n";
		str += s + k + " : " + js_Boot.__string_rec(o[k],s);
		}
		s = s.substring(1);
		str += "\n" + s + "}";
		return str;
	case "function":
		return "<function>";
	case "string":
		return o;
	default:
		return String(o);
	}
};
js_Boot.__interfLoop = function(cc,cl) {
	if(cc == null) return false;
	if(cc == cl) return true;
	var intf = cc.__interfaces__;
	if(intf != null) {
		var _g1 = 0;
		var _g = intf.length;
		while(_g1 < _g) {
			var i = _g1++;
			var i1 = intf[i];
			if(i1 == cl || js_Boot.__interfLoop(i1,cl)) return true;
		}
	}
	return js_Boot.__interfLoop(cc.__super__,cl);
};
js_Boot.__instanceof = function(o,cl) {
	if(cl == null) return false;
	switch(cl) {
	case Int:
		return (o|0) === o;
	case Float:
		return typeof(o) == "number";
	case Bool:
		return typeof(o) == "boolean";
	case String:
		return typeof(o) == "string";
	case Array:
		return (o instanceof Array) && o.__enum__ == null;
	case Dynamic:
		return true;
	default:
		if(o != null) {
			if(typeof(cl) == "function") {
				if(o instanceof cl) return true;
				if(js_Boot.__interfLoop(js_Boot.getClass(o),cl)) return true;
			} else if(typeof(cl) == "object" && js_Boot.__isNativeObj(cl)) {
				if(o instanceof cl) return true;
			}
		} else return false;
		if(cl == Class && o.__name__ != null) return true;
		if(cl == Enum && o.__ename__ != null) return true;
		return o.__enum__ == cl;
	}
};
js_Boot.__cast = function(o,t) {
	if(js_Boot.__instanceof(o,t)) return o; else throw "Cannot cast " + Std.string(o) + " to " + Std.string(t);
};
js_Boot.__nativeClassName = function(o) {
	var name = js_Boot.__toStr.call(o).slice(8,-1);
	if(name == "Object" || name == "Function" || name == "Math" || name == "JSON") return null;
	return name;
};
js_Boot.__isNativeObj = function(o) {
	return js_Boot.__nativeClassName(o) != null;
};
js_Boot.__resolveNativeClass = function(name) {
	if(typeof window != "undefined") return window[name]; else return global[name];
};
var $_, $fid = 0;
function $bind(o,m) { if( m == null ) return null; if( m.__id__ == null ) m.__id__ = $fid++; var f; if( o.hx__closures__ == null ) o.hx__closures__ = {}; else f = o.hx__closures__[m.__id__]; if( f == null ) { f = function(){ return f.method.apply(f.scope, arguments); }; f.scope = o; f.method = m; o.hx__closures__[m.__id__] = f; } return f; }
if(Array.prototype.indexOf) HxOverrides.indexOf = function(a,o,i) {
	return Array.prototype.indexOf.call(a,o,i);
};
String.prototype.__class__ = String;
String.__name__ = true;
Array.__name__ = true;
var Int = { __name__ : ["Int"]};
var Dynamic = { __name__ : ["Dynamic"]};
var Float = Number;
Float.__name__ = ["Float"];
var Bool = Boolean;
Bool.__ename__ = ["Bool"];
var Class = { __name__ : ["Class"]};
var Enum = { };
var __map_reserved = {}
Control.playlist = new PlayList();
js_Boot.__toStr = {}.toString;
Control.main();
})(typeof console != "undefined" ? console : {log:function(){}}, typeof window != "undefined" ? window : exports);
