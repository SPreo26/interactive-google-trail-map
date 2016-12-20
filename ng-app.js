(function() {
  "use strict";

  var app = angular.module("app", []);

  //this service is intended to use functions provided by the MapFactory (like MapFactory.loadMap to initiate the map)
  app.service('MapService', function(MapFactory) {
    
    this.init = function(){

      //on success returns a promise returned inside .then
      return MapFactory.loadMap().then(
        function(map){
          window.map=map;//attached map to window to make it global (also useful for debugging)
          return MapFactory.loadInitialData(map); //on success returns a promise
        },
        function(error){
          alert("Failed to load Google Maps - see browser console for error");
          console.log(error);
        }
      );
    };

    this.reload = function(gMarkers){
      MapFactory.clearMapMarkers(gMarkers);
      return MapFactory.loadInitialData(window.map); //on success returns a promise
    }

    this.updateGMarkers = function(ngMarkers,gMarkers){
      MapFactory.removeSelectedMarkers(ngMarkers,gMarkers);
      MapFactory.updateGMarkerValues(ngMarkers,gMarkers);
    };

    this.addMarker = function(gMarkers,gMarker){
      MapFactory.addMarker(gMarkers,gMarker)
    };

    this.updateNgMarkers = function(ngMarkers,gMarkers){
      MapFactory.updateNgMarkerValues(ngMarkers,gMarkers);
    };

  });

  //custom filters for page start and page end
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