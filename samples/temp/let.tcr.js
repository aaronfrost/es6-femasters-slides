"use strict";
var $__0 = $traceurRuntime.initGeneratorFunction(myGen);
function myGen(x) {
  var x;
  return $traceurRuntime.createGeneratorInstance(function($ctx) {
    while (true)
      switch ($ctx.state) {
        case 0:
          $ctx.state = 2;
          return x * 2;
        case 2:
          x = $ctx.sent;
          $ctx.state = 4;
          break;
        case 4:
          $ctx.returnValue = x;
          $ctx.state = -2;
          break;
        default:
          return $ctx.end();
      }
  }, $__0, this);
}
var gen = myGen(100);
console.log(gen.next().value);
console.log(gen.next().value);
