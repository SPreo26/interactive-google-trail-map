(function() {
  "use strict";

  var app = angular.module("app", []);

  //custom filters for that elements that start and end the page
  app.filter('pageStart', function() {
    return function(input, start) {
      start = +start;//parse as int
      if (input!==undefined){
        return input.slice(start);
      }
      else {
        return []
      }
    }
  });

  app.filter('pageEnd', function() {
    return function(input, end) {
      end = +end;//parse as int
      if (input!==undefined){
        return input.slice(0,end);
      }
      else {
        return []
      }
    }
  });
  
}());