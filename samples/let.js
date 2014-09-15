"use strict";

var dog = {
  bark: function(){
    console.log(this == dog);
    console.log("ARF");
  }
};
dog.bark();

