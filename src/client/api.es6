class YoutubeAPI {

  static get shared() {
    return YoutubeAPI._shared || (YoutubeAPI._shared = new YoutubeAPI());
  }

  constructor() {
    this.playerPromise = new Promise((resolve, reject) => {
      this.playerResolve = resolve;
      this.playerReject = reject;
    });
    this.currentVideoId = null;
  }

  apiReady() {
    this.playerResolve(new YT.Player('player-div', {
      height: '390',
      width: '640'
    }));
  }

  elementToInsert() {
    return this.element || (this.element = this.createElement());
  }

  createElement() {
    let element = document.createElement("div");
    element.className = "youtube player";
    element.id = "player-div"
    return element;
  }

  loadVideo(videoId) {
    this.currentVideoId = videoId;
    return new Promise((resolve, reject)=>{
      let changed = (event)=> {
        console.log("changed ",event.data);
      };
      this.playerPromise.then(p=>{
        p.loadVideoById(videoId);
        p.addEventListener('onStateChange', changed);
      });
    });
  }

  play(videoId) {
    if (!videoId) {
      this.playerPromise.then(p => p.playVideo())
    } else {
      this.loadVideo(videoId).then(()=>this.play())
    }
  }

  pause() {
    this.playerPromise.then(p => p.pauseVideo())
  }

  stop() {
    this.playerPromise.then(p => p.stopVideo())
  }

  rewind() {
    this.playerPromise.then(p=> {
      let second = p.getCurrentTime();
      p.seekTo(second - 2);
    });
  }

  fastForward() {
    this.playerPromise.then(p=> {
      let second = p.getCurrentTime();
      p.seekTo(second + 2);
    });
  }

  mute() {
    this.playerPromise.then(p=> p.mute());
  }

  unmute() {
    this.playerPromise.then(p=> p.unMute());
  }
}

window.addEventListener('load', ()=>{
  let tag = document.createElement('script');
  tag.src = "https://www.youtube.com/iframe_api";
  let firstScriptTag = document.getElementsByTagName('script')[0];
  firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
});

let onYouTubeIframeAPIReady = ()=> {
  YoutubeAPI.shared.apiReady();
}