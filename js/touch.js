/* Touch events */
(function(exports) {
var PM_TOUCH_SENSITIVITY = 15;
var touchDX;
var touchDY;
var touchStartX;
var touchStartY;

function TouchManager(deck) {
  this.deck_ = deck;

  /* Add swiping */
  document.body.addEventListener('touchstart', this.handleTouchStart.bind(this), false);
  document.body.addEventListener('touchmove', this.handleTouchMove.bind(this), false);
  document.body.addEventListener('touchend', this.handleTouchEnd.bind(this), false);
}

TouchManager.prototype.handleTouchStart = function(e) {
  if (e.touches.length == 1) {
    touchDX = 0;
    touchDY = 0;

    touchStartX = e.touches[0].pageX;
    touchStartY = e.touches[0].pageY;

  }
};

TouchManager.prototype.handleTouchMove = function(e) {
  if (e.touches.length > 1) {
    //this.cancelTouch();
  } else {
    touchDX = e.touches[0].pageX - touchStartX;
    touchDY = e.touches[0].pageY - touchStartY;
  }
};

TouchManager.prototype.handleTouchEnd = function(e) {
  var dx = Math.abs(touchDX);
  var dy = Math.abs(touchDY);

  if ((dx > PM_TOUCH_SENSITIVITY) && (dy < (dx * 2 / 3))) {
    if (touchDX > 0) {
      this.deck_.prevSlide();
    } else {
      this.deck_.nextSlide();
    }
  }

  //this.cancelTouch();
};

// TouchManager.prototype.cancelTouch = function() {
// console.log(touchDX)
//   document.body.removeEventListener('touchmove', this.handleTouchMove.bind(this), false);
//   document.body.removeEventListener('touchend', this.handleTouchMove.bind(this), false);
// };

exports.TouchManager = TouchManager;

})(window);
