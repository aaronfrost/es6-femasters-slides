// Function.bind polyfill for Safari < 5.1.4 and iOS.
// From https://developer.mozilla.org/en/JavaScript/Reference/Global_Objects/Function/bind
Function.prototype.bind||(Function.prototype.bind=function(c){if("function"!==typeof this)throw new TypeError("Function.prototype.bind - binding an object that is not callable");var d=Array.prototype.slice.call(arguments,1),e=this,a=function(){},b=function(){return e.apply(this instanceof a?this:c||window,d.concat(Array.prototype.slice.call(arguments)))};a.prototype=this.prototype;b.prototype=new a;return b});
