interface Socket {
  id : string;
  on(event: string, listener: Function): Socket;
  emit(name, ...arguments: any[]): Socket;
};

declare var io: (url?:string)=> Socket;
declare var playList: {};

module SocketManager {

  export class Server {
    io: Socket;
    constructor(url: string) {
      this.io = io(url);
      this.setupEventListener(this.io);
    }

    setupEventListener(io:Socket) {
      io.on('gotRequest', function(){
        io.emit('replyRequest', playList);
      });
    }

  }
}

var server;
document.addEventListener('load', function(){
  server = new SocketManager.Server('ws://' + window.location.hostname + ':8000/');
});