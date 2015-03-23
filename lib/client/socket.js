;
var SocketManager;
(function (SocketManager) {
    var Client = (function () {
        function Client(url) {
            this.io = io(url);
            this.setupEventListener(this.io);
        }
        Client.prototype.setupEventListener = function (io) {
            var _this = this;
            io.on('connect', function () {
                var paths = window.location.pathname.split("/");
                var last = paths[paths.length - 1];
                io.emit('join', { room: last });
            });
            io.on('wantPlaylist', function (target) {
                console.log('reply now');
                io.emit('replyPlaylist', {
                    target: target,
                    playlist: Control.playlist
                });
            });
            io.on('updatePlaylist', function (p) { return _this.updatePlaylist(p); });
        };
        Client.prototype.requestPlaylist = function () {
            var _this = this;
            this.io.emit('wantPlaylist');
            this.io.on('replyPlaylist', function (p) { return _this.updatePlaylist(p); });
        };
        Client.prototype.updatePlaylist = function (videoIDs) {
            Control.playlist.importVideos(videoIDs);
        };
        Client.prototype.updateOthersPlaylist = function (playlist) {
            this.io.emit('updatePlaylist', playlist);
        };
        return Client;
    })();
    SocketManager.Client = Client;
})(SocketManager || (SocketManager = {}));
var updateOthersPlaylist;
(function () {
    var client;
    window.addEventListener('load', function () {
        client = new SocketManager.Client('ws://' + window.location.hostname + ':8000/');
        client.requestPlaylist();
    });
    updateOthersPlaylist = function () {
        client.updateOthersPlaylist(Control.playlist);
    };
})();
