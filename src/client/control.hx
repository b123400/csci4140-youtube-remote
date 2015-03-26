using Control.ArrayExtension;

extern class YoutubeAPI {
  static var shared:YoutubeAPI;
  var currentVideoId: String;
  function elementToInsert(): js.html.Element;
  function play(?videoId:String): Void;
  function loadVideo(videoId:String, ?callback:String->Void): Void;
  function pause(): Void;
  function stop(): Void;
  function rewind(): Void;
  function fastForward(): Void;
  function mute(): Void;
  function unmute(): Void;
}

extern class SocketManager {
  static var client:SocketManager;
  function getVideoTitle(videoID:String, callback:(String->Void)):Void;
}

class ArrayExtension {
  static public function indexSatisfingCondition<T>(array:Array<T>, f:T->Bool):Int {
    for (i in 0...array.length) {
      if (f(array[i])) return i;
    }
    return -1;
  }
}

@:expose("Control")
class Control {

  public static var playlist : PlayList = new PlayList();
  public static var buttons : Map<String, Button>;

  static function main() {
    js.Browser.window.addEventListener('load', function(e:js.html.Event):Void {
      Control.init(untyped js.Browser.window);
    });
  }

  public static function isDesktopMode():Bool {
    return untyped js.Browser.window.document.body.offsetWidth >= 992;
  }

  public static function applyCommand(command:String, ?option:String) {
    if (!Control.isDesktopMode()) return;
    if (command == "play" && option != null) {
      YoutubeAPI.shared.play(option);
      return;
    }
    for (button in Control.buttons) {
      if (button.command() == command) {
        button.clicked(null);
        break;
      }
    }
  }

  public static function init(global) {
    var playlist = Control.playlist;

    Control.buttons = [
      "play"        => new PlayButton(),
      "pause"       => new PauseButton(),
      "stop"        => new StopButton(),
      "previous"    => new PreviousButton(),
      "next"        => new NextButton(),
      "rewind"      => new RewindButton(),
      "fastForward" => new FastForwardButton(),
      "mute"        => new MuteButton(),
      "unmute"      => new UnmuteButton()
    ];
    global.buttons = Control.buttons;

    var wrapper = js.Browser.window.document.getElementsByClassName("player-wrapper")[0];
    var body = js.Browser.window.document.getElementsByTagName("body")[0];
    wrapper.appendChild(YoutubeAPI.shared.elementToInsert());
    
    var buttonWrapper = js.Browser.window.document.createElement("div");
    buttonWrapper.className = "buttons";
    for (button in Control.buttons) {
      buttonWrapper.appendChild(button.element);
    }
    wrapper.appendChild(buttonWrapper);
    body.appendChild(playlist.element);
    playlist.reloadElement();
  }
}

class Button {
  public var element:js.html.Element;

  public function new() {
    this.element = js.Browser.window.document.createElement("div");
    this.element.addEventListener('click', this.clickHandler);
    this.element.className = this.command();
  }

  function setDisplayText(text:String):Void {
    this.element.innerHTML = text;
  }

  function prependElement(tagName:String, className:String):js.html.Element {
    var newElement = js.Browser.window.document.createElement(tagName);
    newElement.className = className;
    this.element.insertBefore(newElement, this.element.firstChild);
    return newElement;
  }

  function clickHandler(e:js.html.Event):Void {
    if (Control.isDesktopMode()) {
      this.clicked(e);
    } else {
      var client = untyped js.Browser.window.client;
      client.broadcastCommand(this.command());
    }
  }

  public function command():String {
    return "null";
  }

  public function clicked(e:js.html.Event):Void {
    // override me
  }
}

class PlayButton extends Button {
  public function new() {
    super();
    this.setDisplayText("Play");
    this.prependElement("i","fa fa-play");
  }

  override function command():String {
    return "play";
  }

  override function clicked(e:js.html.Event):Void {
    YoutubeAPI.shared.play();
  }
}

class PauseButton extends Button {
  public function new() {
    super();
    this.setDisplayText("Pause");
    this.prependElement("i","fa fa-pause");
  }

  override function command():String {
    return "pause";
  }

  override function clicked(e:js.html.Event) {
    YoutubeAPI.shared.pause();
  }
}

class StopButton extends Button {
  public function new() {
    super();
    this.setDisplayText("Stop");
    this.prependElement("i","fa fa-stop");
  }

  override function command():String {
    return "stop";
  }

  override function clicked(e:js.html.Event):Void {
    YoutubeAPI.shared.loadVideo(Control.playlist.videos[0].videoID);
    YoutubeAPI.shared.stop();
  }
}

class PreviousButton extends Button {
  public function new() {
    super();
    this.setDisplayText("Previous");
    this.prependElement("i","fa fa-fast-backward");
  }

  override function command():String {
    return "previous";
  }

  override function clicked(e:js.html.Event):Void {
    var currentVideoIndex = Control.playlist.currentVideoIndex();
    var nextVideo = Control.playlist.videos[currentVideoIndex-1];
    if (nextVideo != null) {
      YoutubeAPI.shared.play(nextVideo.videoID);
    }
  }
}

class NextButton extends Button {
  public function new() {
    super();
    this.setDisplayText("Next");
    this.prependElement("i","fa fa-fast-forward");
  }

  override function command():String {
    return "next";
  }

  override function clicked(e:js.html.Event):Void {
    var currentVideoIndex = Control.playlist.currentVideoIndex();
    var nextVideo = Control.playlist.videos[currentVideoIndex+1];
    if (nextVideo != null) {
      YoutubeAPI.shared.play(nextVideo.videoID);
    }
  }
}

class RewindButton extends Button {
  public function new() {
    super();
    this.setDisplayText("Rewind");
    this.prependElement("i","fa fa-backward");
  }

  override function command():String {
    return "rewind";
  }

  override function clicked(e:js.html.Event):Void {
    YoutubeAPI.shared.rewind();
  }
}

class FastForwardButton extends Button {
  public function new() {
    super();
    this.setDisplayText("Fast forward");
    this.prependElement("i","fa fa-forward");
  }

  override function command():String {
    return "fastforward";
  }

  override function clicked(e:js.html.Event):Void {
    YoutubeAPI.shared.fastForward();
  }
}

class MuteButton extends Button {
  public function new() {
    super();
    this.setDisplayText("Mute");
    this.prependElement("i","fa fa-volume-off");
  }

  override function command():String {
    return "mute";
  }

  override function clicked(e:js.html.Event):Void {
    YoutubeAPI.shared.mute();
  }
}

class UnmuteButton extends Button {
  public function new() {
    super();
    this.setDisplayText("Unmute");
    this.prependElement("i","fa fa-volume-up");
  }

  override function command():String {
    return "unmute";
  }

  override function clicked(e:js.html.Event):Void {
    YoutubeAPI.shared.unmute();
  }
}

class Video {
  public var videoID (default, null) : String;
  public var name (default, set) : String;
  public var element (default, null) : js.html.Element;
  public var closeButtonElement (default, null): js.html.Element;

  public function new(videoID:String, name:String) {
    this.videoID = videoID;
    this.element = js.Browser.window.document.createElement("div");
    this.element.addEventListener('click', play);
    this.name = name;
  }

  function play():Void {
    if (Control.isDesktopMode()) {
      YoutubeAPI.shared.play(videoID);
      } else {
        var client = untyped js.Browser.window.client;
        client.broadcastCommand("play", videoID);
      }
  }

  function set_name(newName:String):String {
    this.name = newName;
    this.makeElementContent();
    return newName;
  }

  function makeElementContent() {
    this.element.innerHTML = '$name / $videoID';

    if (this.closeButtonElement == null) {
      this.closeButtonElement = js.Browser.window.document.createElement("div");
      this.closeButtonElement.innerHTML = "x";
      this.closeButtonElement.className = "close-button";
      this.closeButtonElement.addEventListener("click", function(e:js.html.Event){
        e.stopPropagation();
        Control.playlist.removeVideo(this);
      });
    }
    this.element.appendChild(this.closeButtonElement);
  }

  function toJSON() {
    return {
      id : this.videoID,
      name : name
    }
  }
}

class PlayList {
  public var videos(default, null):Array<Video>;
  public var element(default, null):js.html.Element;

  public function new() {
    this.videos = [];
    this.element = js.Browser.window.document.createElement("div");
    this.element.className = "playList";
  }

  public function addVideoByID(videoID:String):Void {
    // Loading
    SocketManager.client.getVideoTitle(videoID, function(title:String){
      if (title == null) {
        js.Browser.window.alert("Wrong youtube video id");
        return;
      }
      var newVideo = new Video(videoID, title);
      this.addVideo(newVideo);
    });
  }

  public function addVideo(newVideo:Video):Void {
    this.videos.push(newVideo);
    this.reloadElement();
    this.playlistUpdated();
  }

  public function importVideos(videos) {
    this.videos = videos.map(function(video){
      return new Video(video.id, video.name);
    });
    this.reloadElement();
  }

  public function removeVideo(thisVideo:Video):Void {
    var index = this.videos.indexOf(thisVideo);
    this.videos.splice(index, 1);
    this.reloadElement();
    this.playlistUpdated();
  }

  function clearAllVideos():Void {
    this.videos = [];
    this.reloadElement();
    this.playlistUpdated();
  }

  function playlistUpdated() {
    var win = untyped js.Browser.window;
    win.updateOthersPlaylist();
  }

  public function reloadElement():Void {
    this.element.innerHTML = "";
    for (video in this.videos) {
      this.element.appendChild(video.element);
    }
    var clearButton = js.Browser.window.document.createElement("button");
    clearButton.innerHTML = "Clear all videos";
    clearButton.addEventListener("click", function(){
      this.clearAllVideos();
    });

    var text = js.Browser.window.document.createElement("p");
    text.innerHTML = "Add video by video id:";
    var input = cast(js.Browser.window.document.createElement("input"), js.html.InputElement);
    var okButton = js.Browser.window.document.createElement("button");
    okButton.innerHTML = "ok";
    okButton.addEventListener('click', function(){
      this.addVideoByID(input.value);
    });

    this.element.appendChild(clearButton);
    this.element.appendChild(text);
    this.element.appendChild(input);
    this.element.appendChild(okButton);
  }

  public function currentVideoIndex():Int {
    var currentVideoId = YoutubeAPI.shared.currentVideoId;
    return this.videos.indexSatisfingCondition(function(video:Video) {
      return video.videoID == currentVideoId;
    });
  }

  public function currentVideo():Video {
    return this.videos[this.currentVideoIndex()];
  }

  public function toJSON() {
    return this.videos;
  }
}