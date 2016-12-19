(function() {
  "use strict";
  var app = angular.module("app");

  app.factory('MapFactory', function($q, $rootScope) {
    var factory = {};

    //function to intitialize the map
    factory.init = function () {
      var deferred = $q.defer();//used for being able to have a .then callback to make sure map marker data loads before used in controller (see the promise returned at the end of this function)
      
      //array to be filled with marker data (mile, lat, lng) easy-to-access in Angular controller
      var ngMarkers = [];
      //array to be filled with google maps marker objects; angular controller should sync up any changes in ngMarkers to update gMarkers
      var gMarkers = [];

      var bounds = new google.maps.LatLngBounds();


      window.map = new google.maps.Map($('#map')[0], {});
      //rawData is defined in pct-data.js
      $rootScope.getInitialData().then(function(data){
        var icon = data.icon
        var rawData = data.rawData

        rawData.forEach(function(elem){
        ngMarkers.push({mile: elem[0], lat: elem[1], lng: elem[2]});
       
        var gMarker = new google.maps.Marker({
          position: {lat: elem[1], lng: elem[2]},
          map: window.map,
          title: 'Mile ' + elem[0],
          icon: data.icon
        });
        gMarkers.push(gMarker);
        //extend bounds for auto-zoom with each added marker
        var loc = new google.maps.LatLng(gMarker.position.lat(), gMarker.position.lng());
        bounds.extend(loc);
        })
      });
      
      window.map.fitBounds(bounds);//auto-zoom
      deferred.resolve({ngMarkers:ngMarkers, gMarkers:gMarkers});
      return deferred.promise;
    };

    return factory;
  });

  app.service('MapService', function(MapFactory) {
    //this service is intended to make available any functions provided by the MapFactory (like MapFactory.init to initiate the map)
    this.init = function(){
      return MapFactory.init();
    };
    
  });
  
}());