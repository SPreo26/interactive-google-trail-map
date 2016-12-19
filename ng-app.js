(function() {
  "use strict";

  var app = angular.module("app", []);

  //this service is intended to make available any functions provided by the MapFactory (like MapFactory.init to initiate the map)
  app.service('MapService', function(MapFactory) {
    
    this.init = function(){
      return MapFactory.init();
    };

    this.updateGMarkers = function(ngMarkers){
      MapFactory.updateGMarkers(ngMarkers,gMarkers);
    };

    this.addMarker = function(gMarkers,gMarker){
      MapFactory.addMarker(gMarkers,gMarker)
    };

    this.updateNgMarkers = function(ngMarkers,gMarkers){
      MapFactory.updateNgMarkers(ngMarkers,gMarkers);
    };

  });

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