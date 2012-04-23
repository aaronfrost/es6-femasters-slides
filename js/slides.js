/**
 * ADD stuff here
 */
(function() {
  var scs = ['modernizr.custom.45394.js', 'prettify/prettify.js', 'hammer.js',
      'slide-controller.js', 'slide-deck.js'];
  var b = document.getElementsByTagName('script')[0];
  for (var i = 0, s; s = scs[i]; i++) {
    var sc = document.createElement('script');
    sc.type = 'text/javascript';
    sc.async = true;
    sc.src = 'js/' + s;
    b.parentNode.insertBefore(sc, b);
  }
})();
