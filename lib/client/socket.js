;
var SocketManager;
(function (SocketManager) {
    SocketManager.client;
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
            ['play', 'pause', 'stop', 'next', 'previous', 'rewind', 'fastforward', 'mute', 'unmute'].forEach(function (c) { return io.on(c, function (data) { return Control.applyCommand(c, data); }); });
        };
        Client.prototype.requestPlaylist = function () {
            var _this = this;
            this.io.emit('wantPlaylist');
            this.io.on('replyPlaylist', function (p) { return _this.updatePlaylist(p); });
            setTimeout((function (e) { return _this.readFromLocalStoage(); }), 5000);
        };
        Client.prototype.readFromLocalStoage = function () {
            var videos = localStorage['playlist'];
            if (videos == undefined)
                return;
            videos = JSON.parse(videos);
            this.updatePlaylist(videos);
        };
        Client.prototype.saveToLocalStorage = function (playlist) {
            try {
                localStorage['playlist'] = JSON.stringify(playlist);
            }
            catch (e) {
            }
        };
        Client.prototype.updatePlaylist = function (videos) {
            Control.playlist.importVideos(videos);
        };
        Client.prototype.updateOthersPlaylist = function (playlist) {
            this.saveToLocalStorage(playlist);
            this.io.emit('updatePlaylist', playlist);
        };
        Client.prototype.broadcastCommand = function (command, data) {
            this.io.emit(command, data);
        };
        Client.prototype.getVideoTitle = function (videoID, callback) {
            this.io.once('videoTitle', callback);
            this.io.emit('videoTitle', videoID);
        };
        return Client;
    })();
    SocketManager.Client = Client;
})(SocketManager || (SocketManager = {}));
var updateOthersPlaylist;
var client;
window.addEventListener('load', function () {
    client = new SocketManager.Client('ws://' + window.location.hostname + ':8000/');
    client.requestPlaylist();
    SocketManager.client = client;
});
updateOthersPlaylist = function () {
    client.updateOthersPlaylist(Control.playlist);
};
