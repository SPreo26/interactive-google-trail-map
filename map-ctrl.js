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
          $scope.data = data; 
          $scope.$apply//tell digest to re-check for ng-disable now that button disabling is up to angular again
        },
        function(error){
          alert("Failed to package reloaded marker data - see browser console for error");
          console.log(error);
        } 
      );
    };

    $scope.revertCurrentPage= function(){//clear any edits (update ngMarkers from gMarkers)
      MapService.updateNgMarkers($scope.data.ngMarkers,$scope.data.gMarkers);
    };  

    //propogate edits/deletions to google maps marker objects
    $scope.updateGMarkers = function(){
      MapService.updateGMarkers($scope.data.ngMarkers,$scope.data.gMarkers);
    };

    $scope.addMarker = function(){
      //use service to add one marker on map
    };

    $scope.changePage = function(directionSign){
      $scope.revertCurrentPage()//clear any edits after page is switched
      $scope.currentPage=$scope.currentPage+directionSign;//page buttons are automatically disabled in html to prevent going out of bounds
    };

    window.$scope = $scope;

  });

}());