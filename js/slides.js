// Function.bind polyfill for Safari < 5.1.4 and iOS.
// From https://developer.mozilla.org/en/JavaScript/Reference/Global_Objects/Function/bind
Function.prototype.bind||(Function.prototype.bind=function(c){if("function"!==typeof this)throw new TypeError("Function.prototype.bind - binding an object that is not callable");var d=Array.prototype.slice.call(arguments,1),e=this,a=function(){},b=function(){return e.apply(this instanceof a?this:c||window,d.concat(Array.prototype.slice.call(arguments)))};a.prototype=this.prototype;b.prototype=new a;return b});


/**
 * @constructor
 */
function SlideDeck() {
  this.curSlide_ = 0;
  this.prevSlide_ = 0;
  this.slides = [];
  this.config_ = null;

  this.getCurrentSlideFromHash_();

  /*document.addEventListener('DOMContentLoaded',
                              this.onDomLoaded_.bind(this), false);*/
  // Introducing yepnopejs causes DOMContentLoaded before the deck is setup.
  this.onDomLoaded_.bind(this)();
}

/**
 * @const
 * @private
 */
SlideDeck.prototype.SLIDE_CLASSES_ = [
  'far-past', 'past', 'current', 'next', 'far-next'];

/**
 * @const
 * @private
 */
SlideDeck.prototype.CSS_DIR_ = 'theme/css/';

/**
 * @private
 */
SlideDeck.prototype.getCurrentSlideFromHash_ = function() {
  var slideNo = parseInt(document.location.hash.substr(1));

  if (slideNo) {
    this.curSlide_ = slideNo - 1;
  } else {
    this.curSlide_ = 0;
  }
};

/**
 * @private
 */
SlideDeck.prototype.onDomLoaded_ = function(e) {
  this.slides_ = document.querySelectorAll('slide:not([hidden]):not(.backdrop)');

  // If we're on a smartphone device, load phone.css.
  if (window.matchMedia('only screen and (max-device-width: 480px)').matches) {
    // var style = document.createElement('link');
    // style.rel = 'stylesheet';
    // style.type = 'text/css';
    // style.href = this.CSS_DIR_ + 'phone.css';
    // document.querySelector('head').appendChild(style);

    // Remove widescreen if it's applied.
    document.querySelector('slides').classList.remove('layout-widescreen');
  }

  // Load config.
  this.loadConfig_(SLIDE_CONFIG);
  this.addEventListeners_();
  this.updateSlides_();

  // Add slide numbers and total slide count metadata to each slide.
  for (var i = 0, slide; slide = this.slides_[i]; ++i) {
    slide.dataset.slideNum = i + 1;
    slide.dataset.totalSlides = this.slides_.length;
  }

  // This is an app! Make all links open in a new tab.
  [].forEach.call(document.querySelectorAll('a'), function(a) {
    a.target = '_blank';
  });
};

/**
 * @private
 */
SlideDeck.prototype.addEventListeners_ = function() {
  document.addEventListener('keydown', this.onBodyKeyDown_.bind(this), false);
  window.addEventListener('popstate', this.onPopState_.bind(this), false);
};

/**
 * @private
 * @param {Event} e The pop event.
 */
SlideDeck.prototype.onPopState_ = function(e) {
  if (e.state != null) {
    this.curSlide_ = e.state;
    this.updateSlides_(true);
  }
};

/**
 * @param {Event} e
 */
SlideDeck.prototype.onBodyKeyDown_ = function(e) {
  if (/^(input|textarea)$/i.test(e.target.nodeName) ||
      e.target.isContentEditable) {
    return;
  }

  switch (e.keyCode) {
    case 39: // right arrow
    case 32: // space
    case 34: // PgDn
      this.nextSlide();
      e.preventDefault();
      break;

    case 37: // left arrow
    case 8: // Backspace
    case 33: // PgUp
      this.prevSlide();
      e.preventDefault();
      break;

    case 40: // down arrow
      //if (this.isChromeVoxActive()) {
      //  speakNextItem();
      //} else {
        this.nextSlide();
      //}
      e.preventDefault();
      break;

    case 38: // up arrow
      //if (this.isChromeVoxActive()) {
      //  speakPrevItem();
      //} else {
        this.prevSlide();
      //}
      e.preventDefault();
      break;

    case 72: // H
      document.body.classList.toggle('highlight-code');
      break;

    case 78: // N
      // If this slide contains notes, toggle them.
      if (this.slides_[this.curSlide_].querySelector('.note')) {
        document.body.classList.toggle('with-notes');
      }
      break;

    case 27: // ESC
      document.body.classList.remove('with-notes');
      break;

    //case 13: // Enter
    case 70: // F
       // Only respect 'f'/enter on body. Don't want to capture keys from <input>
      if (e.target == document.body) {
        if (e.keyCode != 13 && !document.webkitIsFullScreen) {
          document.body.webkitRequestFullScreen(Element.ALLOW_KEYBOARD_INPUT);
        } else {
          document.webkitCancelFullScreen();
        }
      }
      break;
  }
};

/**
 * @private
 */
SlideDeck.prototype.loadConfig_ = function(config) {
  if (!config) {
    return;
  }

  this.config_ = config;

  var settings = this.config_.settings;

  this.loadTheme_(settings.theme || []);

  if (settings.favIcon) {
    this.addFavIcon_(settings.favIcon);
  }

  // Prettyprint. Default to on.
  if (!!!('usePrettify' in settings) || settings.usePrettify) {
    prettyPrint();
  }

  if (settings.analytics) {
    this.loadAnalytics_();
  }

  if (settings.fonts) {
    this.addFonts_(settings.fonts);
  }

  // Builds. Default to on.
  if (!!!('useBuilds' in settings) || settings.useBuilds) {
    this.makeBuildLists_();
  }

  if (settings.title) {
    document.title = settings.title.replace(/<br\/?>/, ' ') + ' - Google IO 2012';
    document.querySelector('[data-config-title]').innerHTML = settings.title;
  }

  if (settings.subtitle) {
    document.querySelector('[data-config-subtitle]').innerHTML = settings.subtitle;
  }

  if (this.config_.presenters) {
    var presenters = this.config_.presenters;

    var html = [];
    if (presenters.length == 1) {
      var p = presenters[0]

      html = [p.name, p.company].join('<br>');

      var gplus = p.gplus ? '<span>g+</span><a href="' + p.gplus +
                            '">' + p.gplus.replace('http://', '') + '</a>' : '';

      var twitter = p.twitter ? '<span>twitter</span>' +
          '<a href="http://twitter.com/' + p.twitter + '">' +
          p.twitter + '</a>' : '';

     var www = p.www ? '<span>www</span><a href="' + p.www +
                       '">' + p.www.replace('http://', '') + '</a>' : '';

      var html2 = [gplus, twitter, www].join('<br>');

      document.querySelector('[data-config-contact]').innerHTML = html2;
    } else {
      for (var i = 0, p; p = presenters[i]; ++i) {
        html.push(p.name + ' - ' + p.company);
      }
      html = html.join('<br>');
    }

    document.querySelector('[data-config-presenter]').innerHTML = html;
  }

  var slides = document.querySelector('slides');

  /* Left/Right tap areas. Default to including. */
  if (!!!('enableSideAreas' in settings) || settings.enableSideAreas) {
    var el = document.createElement('div');
    el.classList.add('slide-area');
    el.id = 'prev-slide-area';
    el.addEventListener('click', this.prevSlide.bind(this), false);
    slides.appendChild(el);

    var el = document.createElement('div');
    el.classList.add('slide-area');
    el.id = 'next-slide-area';
    el.addEventListener('click', this.nextSlide.bind(this), false);
    slides.appendChild(el);
  }

  if (!!!('enableTouch' in settings) || settings.enableTouch) {
    var self = this;

    var hammer = new Hammer(slides);
    hammer.ondragend = function(e) {
      if (e.direction == 'right' || e.direction == 'down') {
        self.prevSlide();
      } else if (e.direction == 'left' || e.direction == 'up') {
        self.nextSlide();
      }
    };
  }
};

/**
 * @private
 * @param {Array.<string>} fonts
 */
SlideDeck.prototype.addFonts_ = function(fonts) {
  var el = document.createElement('link');
  el.rel = 'stylesheet';
  el.href = 'http://fonts.googleapis.com/css?family=' + fonts.join('|') + '&v2';
  document.querySelector('head').appendChild(el);

};

/**
 * @private
 */
SlideDeck.prototype.buildNextItem_ = function() {
  var slide = this.slides_[this.curSlide_];
  var toBuild = slide.querySelector('.to-build');
  var built = slide.querySelector('.build-current');

  if (built) {
    built.classList.remove('build-current');
    if (built.classList.contains('fade')) {
      built.classList.add('build-fade');
    }
  }

  if (!toBuild) {
    var items = slide.querySelectorAll('.build-fade');
    for (var j = 0, item; item = items[j]; j++) {
      item.classList.remove('build-fade');
    }
    return false;
  }

  toBuild.classList.remove('to-build');
  toBuild.classList.add('build-current');

  /*if (isChromeVoxActive()) {
    speakAndSyncToNode(toBuild);
  }*/

  return true;
};

/**
 * @param {boolean=} opt_dontPush
 */
SlideDeck.prototype.prevSlide = function(opt_dontPush) {
  if (this.curSlide_ > 0) {
    // Toggle off speaker notes and/or highlighted code if they're showing.
    var bodyClassList = document.body.classList;
    bodyClassList.remove('with-notes');
    bodyClassList.remove('highlight-code');

    this.prevSlide_ = this.curSlide_;
    this.curSlide_--;

    this.updateSlides_(opt_dontPush);
  }
};

/**
 * @param {boolean=} opt_dontPush
 */
SlideDeck.prototype.nextSlide = function(opt_dontPush) {

  if (this.buildNextItem_()) {
    return;
  }

  if (this.curSlide_ < this.slides_.length - 1) {
    // Toggle off speaker notes and/or highlighted code if they're showing.
    var bodyClassList = document.body.classList;
    bodyClassList.remove('with-notes');
    bodyClassList.remove('highlight-code');

    this.prevSlide_ = this.curSlide_;
    this.curSlide_++;

    this.updateSlides_(opt_dontPush);
  }
};

/* Slide events */

/**
 * Triggered when a slide enter/leave event should be dispatched.
 *
 * @param {string} type The type of event to trigger
 *     (e.g. 'slideenter', 'slideleave').
 * @param {number} slideNo The index of the slide that is being left.
 */
SlideDeck.prototype.triggerSlideEvent = function(type, slideNo) {
  var el = this.getSlideEl_(slideNo);
  if (!el) {
    return;
  }

  // Call onslideenter/onslideleave if the attribute is defined on this slide.
  var func = el.getAttribute(type);
  if (func) {
    new Function(func).call(el); // TODO: Don't use new Function() :(
  }

  // Dispatch event to listeners setup using addEventListener.
  var evt = document.createEvent('Event');
  evt.initEvent(type, true, true);
  evt.slideNumber = slideNo + 1; // Make it readable
  evt.slide = el;

  el.dispatchEvent(evt);
};

/**
 * @private
 */
SlideDeck.prototype.updateSlides_ = function(opt_dontPush) {
  var dontPush = opt_dontPush || false;

  var curSlide = this.curSlide_;
  for (var i = 0; i < this.slides_.length; ++i) {
    switch (i) {
      case curSlide - 2:
        this.updateSlideClass_(i, 'far-past');
        break;
      case curSlide - 1:
        this.updateSlideClass_(i, 'past');
        break;
      case curSlide:
        this.updateSlideClass_(i, 'current');
        break;
      case curSlide + 1:
        this.updateSlideClass_(i, 'next');
        break;
      case curSlide + 2:
        this.updateSlideClass_(i, 'far-next');
        break;
      default:
        this.updateSlideClass_(i);
        break;
    }
  };

  this.triggerSlideEvent('slideleave', this.prevSlide_);
  this.triggerSlideEvent('slideenter', curSlide);

  window.setTimeout(this.disableSlideFrames_.bind(this, curSlide - 2), 301);

  this.enableSlideFrames_(curSlide - 1);
  this.enableSlideFrames_(curSlide + 1);
  this.enableSlideFrames_(curSlide + 2);

  /*if (isChromeVoxActive()) {
    speakAndSyncToNode(slideEls[curSlide]);
  }*/

  this.updateHash_(dontPush);
};

/**
 * @private
 * @param {number} slideNo
 */
SlideDeck.prototype.enableSlideFrames_ = function(slideNo) {
  var el = this.slides_[slideNo - 1];
  if (!el) {
    return;
  }

  var frames = el.querySelectorAll('iframe');
  for (var i = 0, frame; frame = frames[i]; i++) {
    this.enableFrame_(frame);
  }
};

/**
 * @private
 * @param {number} slideNo
 */
SlideDeck.prototype.enableFrame_ = function(frame) {
  var src = frame.dataset.src;
  if (src && frame.src != src) {
    frame.src = src;
  }
};

/**
 * @private
 * @param {number} slideNo
 */
SlideDeck.prototype.disableSlideFrames_ = function(slideNo) {
  var el = this.slides_[slideNo - 1];
  if (!el) {
    return;
  }

  var frames = el.querySelectorAll('iframe');
  for (var i = 0, frame; frame = frames[i]; i++) {
    this.disableFrame_(frame);
  }
};

/**
 * @private
 * @param {Node} frame
 */
SlideDeck.prototype.disableFrame_ = function(frame) {
  frame.src = 'about:blank';
};

/**
 * @private
 * @param {number} slideNo
 */
SlideDeck.prototype.getSlideEl_ = function(no) {
  if ((no < 0) || (no >= this.slides_.length)) {
    return null;
  } else {
    return this.slides_[no];
  }
};

/**
 * @private
 * @param {number} slideNo
 * @param {string} className
 */
SlideDeck.prototype.updateSlideClass_ = function(slideNo, className) {
  var el = this.getSlideEl_(slideNo);

  if (!el) {
    return;
  }

  if (className) {
    el.classList.add(className);
  }

  for (var i = 0, slideClass; slideClass = this.SLIDE_CLASSES_[i]; ++i) {
    if (className != slideClass) {
      el.classList.remove(slideClass);
    }
  }
};

/**
 * @private
 */
SlideDeck.prototype.makeBuildLists_ = function () {
  for (var i = this.curSlide_, slide; slide = this.slides_[i]; ++i) {
    var items = slide.querySelectorAll('.build > *');
    for (var j = 0, item; item = items[j]; ++j) {
      if (item.classList) {
        item.classList.add('to-build');
        if (item.parentNode.classList.contains('fade')) {
          item.classList.add('fade');
        }
      }
    }
  }
};

/**
 * @private
 * @param {boolean} dontPush
 */
SlideDeck.prototype.updateHash_ = function(dontPush) {
  if (!dontPush) {
    var slideNo = this.curSlide_ + 1;
    var hash = '#' + slideNo;
    if (window.history.pushState) {
      window.history.pushState(this.curSlide_, 'Slide ' + slideNo, hash);
    } else {
      window.location.replace(hash);
    }

    window['_gaq'] && window['_gaq'].push(['_trackPageview',
                                          document.location.href]);
  }
};


/**
 * @private
 * @param {string} favIcon
 */
SlideDeck.prototype.addFavIcon_ = function(favIcon) {
  var el = document.createElement('link');
  el.rel = 'icon';
  el.type = 'image/png';
  el.href = favIcon;
  document.querySelector('head').appendChild(el);
};

/**
 * @private
 * @param {string} theme
 */
SlideDeck.prototype.loadTheme_ = function(theme) {
  var styles = [];
  if (theme.constructor.name === 'String') {
    styles.push(theme);
  } else {
    styles = theme;
  }

  for (var i = 0, style; themeUrl = styles[i]; i++) {
    var style = document.createElement('link');
    style.rel = 'stylesheet';
    style.type = 'text/css';
    if (themeUrl.indexOf('http') == -1) {
      style.href = this.CSS_DIR_ + themeUrl + '.css';
    } else {
      style.href = themeUrl;
    }
    document.querySelector('head').appendChild(style);
  }
  // TODO(ericbidelman): Removed this.
  // var viewportMeta = document.createElement('meta');
  // viewportMeta.name = 'viewport';
  // viewportMeta.content = 'width=1100,height=750';
  // document.querySelector('head').appendChild(viewportMeta);

  var appleMeta = document.createElement('meta');
  appleMeta.name = 'apple-mobile-web-app-capable';
  appleMeta.content = 'yes';
  document.querySelector('head').appendChild(appleMeta);
};

/**
 * @private
 */
SlideDeck.prototype.loadAnalytics_ = function() {
  var _gaq = window['_gaq'] || [];
  _gaq.push(['_setAccount', this.config_.settings.analytics]);
  //_gaq.push(['_setDomainName', '.bleedinghtml5.appspot.com']);
  _gaq.push(['_trackPageview']);

  (function() {
    var ga = document.createElement('script'); ga.type = 'text/javascript'; ga.async = true;
    ga.src = ('https:' == document.location.protocol ? 'https://ssl' : 'http://www') + '.google-analytics.com/ga.js';
    var s = document.getElementsByTagName('script')[0]; s.parentNode.insertBefore(ga, s);
  })();
};


// Polyfill missing APIs (if we need to), then create the slide deck.
// iOS < 5 needs all of these! #dislike
(function() {
  var body = document.body;

  yepnope({
    test: !!body.classList && !!body.dataset,
    nope: ['js/polyfills/classList.min.js', 'js/polyfills/dataset.min.js',
           'js/polyfills/matchMedia.js'],
    complete: function() {
      window.slidedeck = new SlideDeck();
    }
  });

})();
