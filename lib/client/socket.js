;
var SocketManager;
(function (SocketManager) {
    var Server = (function () {
        function Server(url) {
            this.io = io(url);
            this.setupEventListener(this.io);
        }
        Server.prototype.setupEventListener = function (io) {
            io.on('gotRequest', function () {
                io.emit('replyRequest', playList);
            });
        };
        return Server;
    })();
    SocketManager.Server = Server;
})(SocketManager || (SocketManager = {}));
var server;
document.addEventListener('load', function () {
    server = new SocketManager.Server('ws://' + window.location.hostname + ':8000/');
});
