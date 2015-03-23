using Control.ArrayExtension;

extern class YoutubeAPI {
  static var shared:YoutubeAPI;
  var currentVideoId: String;
  function elementToInsert(): js.html.Element;
  function play(?videoId:String): Void;
  function load(videoId:String): Void;
  function pause(): Void;
  function stop(): Void;
  function rewind(): Void;
  function fastForward(): Void;
  function mute(): Void;
  function unmute(): Void;
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

  static function main() {
    js.Browser.window.addEventListener('load', function(e:js.html.Event):Void {
      Control.init(untyped js.Browser.window);
    });
  }

  public static function init(global) {
    var playlist = Control.playlist;

    var buttons : Map<String, Button> = [
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
    global.buttons = buttons;

    var wrapper = js.Browser.window.document.getElementsByTagName("body")[0];
    wrapper.appendChild(YoutubeAPI.shared.elementToInsert());
    
    var buttonWrapper = js.Browser.window.document.createElement("div");
    buttonWrapper.className = "buttons";
    for (button in buttons) {
      buttonWrapper.appendChild(button.element);
    }
    wrapper.appendChild(buttonWrapper);
    wrapper.appendChild(playlist.element);
    playlist.reloadElement();
  }
}

class Button {
  public var element:js.html.Element;

  public function new() {
    this.element = js.Browser.window.document.createElement("div");
    this.element.addEventListener('click', this.clicked);
  }

  function setDisplayText(text:String):Void {
    this.element.innerHTML = text;
  }

  function clicked():Void {
    // override me
  }
}

class PlayButton extends Button {
  public function new() {
    super();
    this.setDisplayText("Play");
  }

  override function clicked():Void {
    YoutubeAPI.shared.play();
  }
}

class PauseButton extends Button {
  public function new() {
    super();
    this.setDisplayText("Pause");
  }

  override function clicked() {
    YoutubeAPI.shared.pause();
  }
}

class StopButton extends Button {
  public function new() {
    super();
    this.setDisplayText("Stop");
  }

  override function clicked():Void {
    YoutubeAPI.shared.stop();
    YoutubeAPI.shared.load(Control.playlist.videos[0].videoID);
  }
}

class PreviousButton extends Button {
  public function new() {
    super();
    this.setDisplayText("Previous");
  }

  override function clicked():Void {
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
  }

  override function clicked():Void {
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
  }

  override function clicked():Void {
    YoutubeAPI.shared.rewind();
  }
}

class FastForwardButton extends Button {
  public function new() {
    super();
    this.setDisplayText("Fast forward");
  }

  override function clicked():Void {
    YoutubeAPI.shared.fastForward();
  }
}

class MuteButton extends Button {
  public function new() {
    super();
    this.setDisplayText("Mute");
  }

  override function clicked():Void {
    YoutubeAPI.shared.mute();
  }
}
class UnmuteButton extends Button {
  public function new() {
    super();
    this.setDisplayText("Unmute");
  }

  override function clicked():Void {
    YoutubeAPI.shared.unmute();
  }
}

class Video {
  public var videoID (default, null) : String;
  public var name (default, null) : String;
  public var element (default, null) : js.html.Element;

  public function new(videoID:String, name:String) {
    this.videoID = videoID;
    this.name = name;
    this.element = js.Browser.window.document.createElement("div");
    this.element.innerHTML = '$name / $videoID';
    this.element.addEventListener('click', play);
  }

  function play():Void {
    YoutubeAPI.shared.play(videoID);
  }

  function toJSON() {
    return this.videoID;
  }
}

class PlayList {
  public var videos(default, null):Array<Video>;
  public var element(default, null):js.html.Element;

  public function new() {
    this.videos = [];
    this.element = js.Browser.window.document.createElement("div");
  }

  public function addVideoByID(videoID:String):Void {
    var newVideo = new Video(videoID, "title");
    this.addVideo(newVideo);
  }

  public function addVideo(newVideo:Video):Void {
    this.videos.push(newVideo);
    this.reloadElement();
    this.playlistUpdated();
  }

  public function importVideos(videoIDs:Array<String>) {
    this.videos = videoIDs.map(function(videoID){
      return new Video(videoID, "title");
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
    var input = cast(js.Browser.window.document.createElement("input"), js.html.InputElement);
    var okButton = js.Browser.window.document.createElement("button");
    okButton.innerHTML = "ok";
    okButton.addEventListener('click', function(){
      this.addVideoByID(input.value);
    });
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