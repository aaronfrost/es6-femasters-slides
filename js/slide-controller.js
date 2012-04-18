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

  // It would be dope if FF implemented location.origin.
  if (e.origin != location.protocol + '//' + location.host) {
    alert('Someone tried to postMessage from an unknown origin');
    return;
  }

  if (e.source.location.hostname != 'localhost') {
    alert('Someone tried to postMessage from an unknown origin');
    return;
  }

  if ('slideDirection' in data) {
    if (data.slideDirection == SlideController.MOVE_LEFT) {
      this.deck_.prevSlide();
    } else {
      this.deck_.nextSlide();
    }
  }
};

SlideController.prototype.sendMsg = function(msg) {
  // // Send message to popup window.
  // if (this.win_) {
  //   this.win_.postMessage(msg, location.protocol + '//' + location.host);
  // }
  // Send message to main window.
  if (window.opener) {
    // It would be dope if FF implemented location.origin.
    window.opener.postMessage(msg, location.protocol + '//' + location.host);
  }
};
