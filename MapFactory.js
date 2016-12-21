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
      window.infowindow = new google.maps.InfoWindow();
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
      window.infowindow = infowindow;
      var deferred = $q.defer();//defer for .then chaining of code that need to wait on the data returned here

      //getInitialData is defined in pct-data.js
      return $rootScope.getInitialData().then(
        function(data){
          $rootScope.icon = data.icon;//marker icon object
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
            var title = 'Mile ' + elem[0];
            var gMarker = new google.maps.Marker({
              position: {lat: elem[1], lng: elem[2]},
              map: map,
              title: title,
              icon: $rootScope.icon,
              mile: elem[0]//custom property used to be able to revert edits made to miles
            });
            factory.setTooltip(gMarker,map,title);
            gMarkers.push(gMarker);

            //extend bounds for auto-zoom with each added marker
            var loc = new google.maps.LatLng(gMarker.position.lat(), gMarker.position.lng());
            bounds.extend(loc);
          })

          //auto-zoom now that bounds are known with all markers being on map
          window.map.fitBounds(bounds);
          factory.roundAllNgMarkerValues(ngMarkers);

          deferred.resolve({ngMarkers:ngMarkers,gMarkers:gMarkers});
          return deferred.promise;
        },

        function(error){
          alert("Failed to retrieve initial marker data - see browser console for error");
          console.log(error);
        }
      );
    };

    //remove markers selected via checkboxes only from ngMarkers (should be followed up by factory.updateGMarkerValues to sync up these changes with gMarkers and map)
    factory.removeSelectedNgMarkers = function(ngMarkers){
      return ngMarkers.filter(
        function(marker){
          return !(marker.selected);
        }
      );
    };

    //update google map marker object array as a result of UI manipulation on markers (edit,add,delete)
    factory.updateGMarkerValues = function(ngMarkers,gMarkers) {
      gMarkers.forEach(function(gMarker){
        gMarker.setMap(null);//remove each marker from the map (they are to be readded to new or the same locaions based on ngMarkers)
      })
      //empty gMarker array and repopulate it with new ngMarker data
      gMarkers=[];

      ngMarkers.forEach(function(ngMarker){       
        factory.addGMarker(gMarkers,ngMarker,$rootScope.icon);
      })

      factory.roundAllNgMarkerValues(ngMarkers)
      factory.sortMarkersByMile(ngMarkers);
      factory.sortMarkersByMile(gMarkers);
      return {ngMarkers:ngMarkers, gMarkers:gMarkers};
    }

    factory.addGMarker = function(gMarkers,ngMarker,icon) {
      var title;
        if (ngMarker.mile!==undefined){
          title = 'Mile ' + ngMarker.mile;
        }
        else{
          title = 'Chosen location';
        }
      var params = {
            position: {lat: parseFloat(ngMarker.lat), lng: parseFloat(ngMarker.lng)},
            map: window.map,
            title: title,
            mile: parseFloat(ngMarker.mile)
          };

      //if null passed as icon, use default icon     
      if(icon!==null){
        params.icon=icon;
      }

      var gMarker = new google.maps.Marker(params);
      factory.setTooltip(gMarker,window.map,title);

      gMarkers.push(gMarker);
      return gMarkers;
    }

    //used to revert unsaved changes
    factory.updateNgMarkerValues = function(ngMarkers,gMarkers){
      gMarkers.forEach(function(gMarker,index){
        ngMarkers[index].mile=gMarker.mile;
        ngMarkers[index].lat=gMarker.position.lat();
        ngMarkers[index].lng=gMarker.position.lng();
      })
      factory.sortMarkersByMile(ngMarkers);
      return factory.roundAllNgMarkerValues(ngMarkers);
    }

    factory.roundAllNgMarkerValues = function(ngMarkers){
      ngMarkers.forEach(function(ngMarker){
        ngMarker.mile=Math.round(ngMarker.mile*10)/10;
        ngMarker.lat=Math.round(ngMarker.lat*100000)/100000;
        ngMarker.lng=Math.round(ngMarker.lng*100000)/100000;
      });
      return ngMarkers;
    }

    factory.sortMarkersByMile = function(markers){      
      function compareByMile(a,b) {
      if (a.mile < b.mile)
        return -1;
      if (a.mile > b.mile)
        return 1;
      return 0;
      }
      return markers.sort(compareByMile);
    }

    factory.findClosestMarker = function(lat,lng,ngMarkers){
      var p1 = [lat,lng]
      var ngMarkerMin=ngMarkers[0];//this will hold final candidate, initialize with first marker
      var p2 = [ngMarkerMin.lat, ngMarkerMin.lng];//candidate marker points for minimum distance
      var minDist = factory.getDistanceFromLatLonInKm(p1, p2);//haversine distance in km
      var dist;

      //skip the first marker as it's the initial candidate
      ngMarkers.slice(1).forEach(function(ngMarker){
        p2 = [ngMarker.lat, ngMarker.lng];
        dist = factory.getDistanceFromLatLonInKm(p1, p2);
        if (dist<minDist){//neglecting the highly improbably chance of a tie, in that case the closest marker latest in the array (highest mile) will be picked
          minDist=dist;
          ngMarkerMin=ngMarker;
        }
      });

      //auto-zoom to show marker pair
      var bounds = new google.maps.LatLngBounds();
      bounds.extend(new google.maps.LatLng(lat, lng));
      bounds.extend(new google.maps.LatLng(ngMarkerMin.lat, ngMarkerMin.lng));
      window.map.fitBounds(bounds);

      return ngMarkerMin; 
    }

    //using more approximate ideal formula for haversine for now as ran into issues with google maps api formula, namely fetching the right libraries
    factory.getDistanceFromLatLonInKm=function(p1,p2){
      function deg2rad(deg) {
        return deg * (Math.PI/180)
      };
      var lat1=p1[0];
      var lon1=p1[1];
      var lat2=p2[0];
      var lon2=p2[1];
      var R = 6371; // Radius of the earth in km
      var dLat = deg2rad(lat2-lat1);  // deg2rad below
      var dLon = deg2rad(lon2-lon1); 
      var a = 
        Math.sin(dLat/2) * Math.sin(dLat/2) +
        Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) * 
        Math.sin(dLon/2) * Math.sin(dLon/2)
        ; 
      var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
      var d = R * c; // Distance in km
      return d;
    }

    factory.setTooltip=function(gMarker,map,title){
      google.maps.event.addListener(gMarker, 'click', (function(gMarker) {
        return function() {
          window.infowindow.setContent(title);
          window.infowindow.open(map, gMarker);
        }
      })(gMarker));
    }

    return factory;
  });
  
}());