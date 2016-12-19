(function() {
  "use strict";
  var app = angular.module("app");

  app.factory('MapFactory', function($q) {
    var factory = {};

    //function to intitialize the map
    factory.init = function () {
      var deferred = $q.defer();
      var mapData = [];
      var markers = [];
      var bounds = new google.maps.LatLngBounds();

      var icon = {
        url:'./1000px-Reddot-small.png',
        scaledSize: new google.maps.Size(10, 10), // scaled size
        origin: new google.maps.Point(0,0), // origin
        anchor: new google.maps.Point(5,5) // anchor
      };

      window.map = new google.maps.Map($('#map')[0], {});

      //rawData is defined in pct-data.js
      rawData.forEach(function(elem){
        mapData.push({mile: elem[0], lat: elem[1], lng: elem[2]});
        var marker = new google.maps.Marker({
          position: {lat: elem[1], lng: elem[2]},
          map: window.map,
          title: 'Mile ' + elem[0],
          icon: icon
        });
        markers.push(marker);
        //extend bounds for auto-zoom with each added marker
        var loc = new google.maps.LatLng(marker.position.lat(), marker.position.lng());
        bounds.extend(loc);
      })

      window.map.fitBounds(bounds);
      deferred.resolve({map:mapData,markers:markers});
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