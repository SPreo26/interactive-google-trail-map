(function() {
  "use strict";

  var app = angular.module("app");

  app.controller("mapCtrl", function($scope, MapService){
    $scope.setup = function(){
      $scope.currentPage = 0;
      $scope.pageSize = 10;
      $scope.numberOfPages = function(){return 1};//before marker data is loaded, assume 1 page
    };

    angular.element(document).ready(function () {
      MapService.init().then(function(data){
        $scope.data = data;
        $scope.numberOfPages=function(){
        return Math.ceil($scope.data.ngMarkers.length/$scope.pageSize);
        };
      });
    });

    $scope.changePage = function(directionSign){
      $scope.currentPage=$scope.currentPage+directionSign;//page buttons are automatically disabled in html to prevent going out of bounds
    }


    window.$scope = $scope;

  });

}());