(function() {
  "use strict";

  var app = angular.module("app");

  app.controller("mapCtrl", function($scope, MapService){

    $scope.setup = function(){
      $scope.currentPage = 0;
      $scope.pageSize = 10;
      $scope.numberOfPages = function(){return 1};//before marker data is loaded, assume 1 page
    };

    $scope.mapInit = function(){

      MapService.init().then(
        function(data){
          data.ngMarkers=$scope.sortNgMarkersByMile(data.ngMarkers);
          $scope.data = data;
          $scope.numberOfPages=function(){
          return Math.ceil($scope.data.ngMarkers.length/$scope.pageSize);
          };
          $scope.contentLoadedOnce = true;
        },
        function(error){
          alert("Failed to package initial marker data - see browser console for error");
          console.log(error);
        } 
      );
    };

    angular.element(document).ready(function() {
      $scope.mapInit();
    });

    $scope.mapReload = function(){

      MapService.reload($scope.data.gMarkers).then(
        function(data){
          data.ngMarkers = $scope.sortNgMarkersByMile(data.ngMarkers); 
          $scope.data = data;
        },
        function(error){
          alert("Failed to package reloaded marker data - see browser console for error");
          console.log(error);
        } 
      );
    };

    $scope.revertUnsavedChanges = function(){//clear any edits (update ngMarkers from gMarkers)
      $scope.deselectAllMarkers();
      //repopulate data in table with data from map
      MapService.updateNgMarkers($scope.data.ngMarkers,$scope.data.gMarkers);
    };  

    //propogate edits/deletions to both ngMarkers and gMarkers
    $scope.updateGMarkers = function(){
      $scope.data=MapService.updateGMarkers($scope.data.ngMarkers,$scope.data.gMarkers);
      $scope.data.ngMarkers = $scope.sortNgMarkersByMile($scope.data.ngMarkers);
    };

    $scope.addMarker = function(){
      //use service to add one marker on map
      $scope.data.ngMarkers = $scope.sortNgMarkersByMile();
    };

    $scope.changePage = function(directionSign){
      $scope.revertUnsavedChanges()//clear any edits after page is switched
      $scope.currentPage=$scope.currentPage+directionSign;//page buttons are automatically disabled in html to prevent going out of bounds
    };

    $scope.deselectAllMarkers = function(){
      $scope.data.ngMarkers.forEach(function(marker){
        marker.selected = false;
      })
    }

    $scope.sortNgMarkersByMile = function(ngMarkers){      
      function compareByMile(a,b) {
      if (a.mile < b.mile)
        return -1;
      if (a.mile > b.mile)
        return 1;
      return 0;
      }
      return ngMarkers.sort(compareByMile);
    }

    window.$scope = $scope;

  });

}());