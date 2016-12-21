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
      gMarkers=MapFactory.addGMarker(gMarkers,ngMarker);
      gMarkers=MapFactory.sortMarkersByMile(gMarkers);
      return {ngMarkers:ngMarkers, gMarkers:gMarkers};
    };

    this.updateNgMarkers = function(ngMarkers,gMarkers){
      MapFactory.updateNgMarkerValues(ngMarkers,gMarkers);
    };

});
