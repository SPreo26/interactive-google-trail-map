(function() {
  "use strict";

  var app = angular.module("app", []);

  app.run(function($q, $rootScope) {
    $rootScope.getIcon = function(){
      return $rootScope.icon = {
      url:'./1000px-Reddot-small.png',
      scaledSize: new google.maps.Size(10, 10),
      origin: new google.maps.Point(0,0), 
      anchor: new google.maps.Point(5,5)
    };
  }});

  //custom filters for page start and page end
  app.filter('pageStart', function() {
    return function(input, start) {
      start = +start;//parse as int
      if (input!==undefined){
        return input.slice(start);
      }
      else {
        return [];
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
        return [];
      }
    }
  });
  
}());