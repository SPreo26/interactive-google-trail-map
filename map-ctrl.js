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
      //repopulate data in table with data from map
      MapService.updateNgMarkers($scope.data.ngMarkers,$scope.data.gMarkers);
    };  

    //propogate edits/deletions to both ngMarkers and gMarkers
    $scope.updateGMarkers = function(){
      $scope.deselectAllMarkers();
      $scope.data = MapService.updateGMarkers($scope.data.ngMarkers,$scope.data.gMarkers);
      $scope.data.ngMarkers = $scope.sortNgMarkersByMile($scope.data.ngMarkers);
    };

    $scope.removeSelectedMarkers = function(){
      var areAnySelected = false;
      $scope.data.ngMarkers.forEach(function(marker){
        if(marker.selected){
          areAnySelected=true;
        }
      })

      if (areAnySelected){
        if (confirm("Delete selected markers: Are you sure?")){
          $scope.data=MapService.removeSelectedMarkers($scope.data.ngMarkers,$scope.data.gMarkers);
        }
      }
      else{
        alert("Please select at least one marker to delete.")
      }
      
    }

    $scope.addMarker = function(){
      $scope.revertUnsavedChanges();
      //use service to add one marker on map
      $scope.data.ngMarkers = $scope.sortNgMarkersByMile($scope.data.ngMarkers);
    };

    $scope.changePage = function(directionSign){
      $scope.deselectAllMarkers();
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

    //filter comparator to get results starting with search string (e.g. start of mile string must match search)
    $scope.startsWith = function (actual, expected) {
      var lowerStr = (actual + "").toLowerCase();
      return lowerStr.indexOf(expected.toLowerCase()) === 0;
    }

    window.$scope = $scope;

  });

}());