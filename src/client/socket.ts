interface Socket {
  id : string;
  on(event: string, listener: Function): Socket;
  emit(name, ...arguments: any[]): Socket;
};

declare var io: (url?:string)=> Socket;
declare var Control : {
  playlist : Playlist
}

interface Playlist {
  videos : Array<Video>;
  importVideos(videoIDs: Array<string>):void;
  clearAllVideos():void;
}

interface Video {
  videoID : string;
}

module SocketManager {

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
    }

    requestPlaylist():void {
      this.io.emit('wantPlaylist');
      this.io.on('replyPlaylist', (p)=>this.updatePlaylist(p));
    }

    updatePlaylist (videoIDs:Array<string>):void {
      Control.playlist.importVideos(videoIDs);
    }

    updateOthersPlaylist (playlist:Playlist):void {
      this.io.emit('updatePlaylist', playlist);
    }
  }
}

var updateOthersPlaylist;
(()=>{
  var client;
  window.addEventListener('load', ()=>{
    client = new SocketManager.Client('ws://' + window.location.hostname + ':8000/');
    client.requestPlaylist();
  });

  updateOthersPlaylist = ()=> {
    client.updateOthersPlaylist(Control.playlist);
  }
})();