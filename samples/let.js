// Options: --annotations --array-comprehension --async-functions --block-binding --exponentiation --generator-comprehension --symbols --types
"use strict";


function *myGen(x){
  var x = yield x *2;
  return x;
}

var gen = myGen(100);
console.log(gen.next().value);
console.log(gen.next().value);
