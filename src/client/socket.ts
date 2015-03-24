interface Socket {
  id : string;
  on(event: string, listener: Function): Socket;
  once(event: string, listener: Function): Socket;
  emit(name, ...arguments: any[]): Socket;
};

declare var io: (url?:string)=> Socket;
declare var Control : {
  playlist : Playlist
  applyCommand(command:string):void;
}

interface Playlist {
  videos : Array<Video>;
  importVideos(videoIDs: Array<Object>):void;
  clearAllVideos():void;
}

interface Video {
  videoID : string;
}

module SocketManager {
  export var client: Client;

  export class Client {
    io: Socket;
    constructor(url: string) {
      this.io = io(url);

      this.setupEventListener(this.io);
    }

    setupEventListener(io:Socket):void {

      io.on('connect', ()=>{
        var paths = window.location.pathname.split("/");
        var last = paths[paths.length-1];
        io.emit('join', {room:last});
      });

      io.on('wantPlaylist', (target:string)=>{
        console.log('reply now');
        io.emit('replyPlaylist', {
          target : target,
          playlist : Control.playlist
        });
      });

      io.on('updatePlaylist', (p)=>this.updatePlaylist(p));

      ['play','pause','stop','next','previous','rewind','fastforward','mute','unmute']
      .forEach (c=>io.on(c, ()=> Control.applyCommand(c)));
    }

    requestPlaylist():void {
      this.io.emit('wantPlaylist');
      this.io.on('replyPlaylist', (p)=>this.updatePlaylist(p));
      setTimeout((e=> this.readFromLocalStoage()), 5000);
    }

    readFromLocalStoage():void {
      var videos = localStorage['playlist'];
      if (videos == undefined) return;
      videos = JSON.parse(videos);
      this.updatePlaylist(videos);
    }

    saveToLocalStorage (playlist:Playlist):void {
      try{
        localStorage['playlist'] = JSON.stringify(playlist);
      } catch (e) {}
    }

    updatePlaylist (videos:Array<Object>):void {
      Control.playlist.importVideos(videos);
    }

    updateOthersPlaylist (playlist:Playlist):void {
      this.saveToLocalStorage(playlist);
      this.io.emit('updatePlaylist', playlist);
    }

    broadcastCommand (command:string, data?:any):void {
      this.io.emit(command, data);
    }

    getVideoTitle (videoID:string, callback:(title:string) => void):void {
      this.io.once('videoTitle', callback);
      this.io.emit('videoTitle', videoID);
    }
  }
}

var updateOthersPlaylist;
var client;
window.addEventListener('load', ()=>{
  client = new SocketManager.Client('ws://' + window.location.hostname + ':8000/');
  client.requestPlaylist();
  SocketManager.client = client;
});

updateOthersPlaylist = ()=> {
  client.updateOthersPlaylist(Control.playlist);
}