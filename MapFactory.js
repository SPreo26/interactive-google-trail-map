(function() {
  "use strict";
  var app = angular.module("app");

  app.factory('MapFactory', function($q, $rootScope) {
    var factory = {};

    //load the map without any data (should be done only on page refresh)
    factory.loadMap = function() {
      var deferred = $q.defer();//defer for .then chaining of processes that need to wait on the map object returned here
      var map = new google.maps.Map($('#map')[0], {});
        //make sure map is loaded before doing the afterNewMapObjLoaded() code below
      deferred.resolve(map);
      return deferred.promise;
    }

    //remove each marker from the map view
    factory.clearMapMarkers = function(gMarkers){
      gMarkers.forEach(function(gMarker){
        gMarker.setMap(null);
      })
    }

    //load markers onto map and return packaged data
    factory.loadInitialData = function(map){
      var deferred = $q.defer();//defer for .then chaining of code that need to wait on the data returned here

      //getInitialData is defined in pct-data.js
      return $rootScope.getInitialData().then(
        function(data){
          var icon = data.icon;//marker icon object
          var rawData = data.rawData;//raw marker data

          //initialize bounds to be extended after each marker is added
          var bounds = new google.maps.LatLngBounds();

          //array to be filled with marker data (mile, lat, lng) easy-to-access in Angular controller
          var ngMarkers = [];
          //array to be filled with google maps marker objects; angular controller should sync up any changes in ngMarkers to update gMarkers
          var gMarkers = [];

          //populate gMarkers and ngMarkers
          rawData.forEach(function(elem){
            ngMarkers.push({mile: elem[0], lat: elem[1], lng: elem[2]});
           
            var gMarker = new google.maps.Marker({
              position: {lat: elem[1], lng: elem[2]},
              map: map,
              title: 'Mile ' + elem[0],
              icon: icon
            });

            gMarkers.push(gMarker);

            //extend bounds for auto-zoom with each added marker
            var loc = new google.maps.LatLng(gMarker.position.lat(), gMarker.position.lng());
            bounds.extend(loc);
          })

          //auto-zoom now that bounds are known with all markers being on map
          window.map.fitBounds(bounds);

          deferred.resolve({ngMarkers:ngMarkers,gMarkers:gMarkers});
          return deferred.promise;
        },
        
        function(error){
          alert("Failed to retrieve initial marker data - see browser console for error");
          console.log(error);
        }
      );
    };

    //update google map marker object array as a result of UI manipulation on markers (edit,add,delete)
    factory.updateGMarkers = function(ngMarkers,gMarkers) {
      gMarkers.forEach(function(gMarker){
        gMarker.setMap(null);//remove each marker from the map
      })
      //empty gMarker array and repopulate it with new ngMarker data
      gMarkers=[];
      ngMarkers.forEach(function(ngMarker){
                var gMarker = new google.maps.Marker({
                position: {lat: ngMarker[1], lng: ngMarker[2]},
                map: window.map,
                title: 'Mile ' + ngMarker[0],
                icon: $rootScope.icon
              });
              gMarkers.push(gMarker);
              //extend bounds for auto-zoom with each added marker
              var loc = new google.maps.LatLng(gMarker.position.lat(), gMarker.position.lng());
              bounds.extend(loc);
      })
      window.map.fitBounds(bounds);//auto-zoom
      return {ngMarkers:ngMarkers, gMarkers:gMarkers};
    }

    factory.addGMarker = function(gMarkers,gMarker) {
      //TBD
    }

    factory.updateNgMarkers = function(ngMarkers,gMarkers){
      //TBD
    }

    return factory;
  });
  
}());