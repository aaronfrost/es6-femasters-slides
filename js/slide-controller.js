(function(window) {

var ORIGIN = location.protocol + '//' + location.host;

function SlideController(slideDeck) {
  this.deck_ = slideDeck;
  this.win_ = null;

  window.addEventListener('message', this.onMessage_.bind(this), false);

  // Close popups if we reload the main window.
  window.addEventListener('beforeunload', function(e) {
    this.win_.close()
  }.bind(this), false);

  // Only open one new popup. The recursion popup opening!
  if (!window.opener) {
    this.win_ = window.open(location.href, 'mywindow');
  }
}

SlideController.MOVE_LEFT = -1;
SlideController.MOVE_RIGHT = 1;

SlideController.prototype.onMessage_ = function(e) {
  var data = e.data;

  // Restrict messages to being from this origin. Allow local developmet
  // from file:// though.
  // TODO: It would be dope if FF implemented location.origin!
  if (e.origin != ORIGIN && ORIGIN != 'file://') {
    alert('Someone tried to postMessage from an unknown origin');
    return;
  }

  // if (e.source.location.hostname != 'localhost') {
  //   alert('Someone tried to postMessage from an unknown origin');
  //   return;
  // }

  if ('keyCode' in data) {
    var evt = document.createEvent('Event');
    evt.initEvent('keydown', true, true);
    evt.keyCode = data.keyCode;
    document.dispatchEvent(evt);
  }
};

SlideController.prototype.sendMsg = function(msg) {
  // // Send message to popup window.
  // if (this.win_) {
  //   this.win_.postMessage(msg, ORIGIN);
  // }

  // Send message to main window.
  if (window.opener) {
    // TODO: It would be dope if FF implemented location.origin.
    window.opener.postMessage(msg, '*');
  }
};

window.SlideController = SlideController;

})(window);

