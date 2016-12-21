//this service is intended to use functions provided by the MapFactory (like MapFactory.loadMap to initiate the map)
app.service('MapService', function(MapFactory, $rootScope) {

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

    this.reload = function(gMarkers,gMarkerPair){

      if(gMarkerPair!==null){
        MapFactory.clearMapMarkers(gMarkerPair);
      }

      MapFactory.clearMapMarkers(gMarkers);
      return MapFactory.loadInitialData(window.map); //on success returns a promise
    }

    this.updateGMarkers = function(ngMarkers,gMarkers){
      return MapFactory.updateGMarkerValues(ngMarkers, gMarkers);
    };

    this.removeSelectedMarkers = function(ngMarkers,gMarkers){
      //revert possible unsaved edits any other ngMarkers before deletion of selected ones; this way no unsaved edit carries over to gMarkers on map a side-effect of deletion
      ngMarkers = MapFactory.updateNgMarkerValues(ngMarkers,gMarkers);
      ngMarkers = MapFactory.removeSelectedNgMarkers(ngMarkers);

      return MapFactory.updateGMarkerValues(ngMarkers,gMarkers);
    }

    this.addMarker = function(gMarkers,ngMarkers,ngMarker){
      ngMarkers.push(ngMarker);
      ngMarkers=MapFactory.sortMarkersByMile(ngMarkers);
      gMarkers=MapFactory.addGMarker(gMarkers,ngMarker,$rootScope.icon);
      gMarkers=MapFactory.sortMarkersByMile(gMarkers);
      return {ngMarkers:ngMarkers, gMarkers:gMarkers};
    };

    this.updateNgMarkers = function(ngMarkers,gMarkers){
      MapFactory.updateNgMarkerValues(ngMarkers,gMarkers);
    };

    this.showClosestMarker = function(lat,lng,gMarkerPair,ngMarkers){
      var newGMarkerPair=[];
      var inputNgMarker = {lat:lat,lng:lng};

      if (gMarkerPair!==undefined){
        gMarkerPair.forEach(function(gMarker){
          //erase any existing old closest pair
          if(gMarker!==undefined){
            gMarker.setMap(null);
          }
        });
      }
      MapFactory.addGMarker(newGMarkerPair,inputNgMarker,null)//null means use default Google Maps marker icon
      var closestNgMarker = MapFactory.findClosestMarker(lat,lng,ngMarkers)
      newGMarkerPair = MapFactory.addGMarker(newGMarkerPair,closestNgMarker,null)

      return newGMarkerPair;
    };

});
