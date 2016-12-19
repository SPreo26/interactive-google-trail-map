(function() {
  "use strict";

  var app = angular.module("app");

  app.controller("mapCtrl", function($scope, MapService){

    $scope.setup = function(){
      $scope.currentPage = 0;
      $scope.pageSize = 50;
      $scope.numberOfPages = 1;
    };

    angular.element(document).ready(function () {
      MapService.init().then(function(data){
        $scope.data = data;
        $scope.numberOfPages=function(){
        console.log('numpg')
        return Math.ceil($scope.data.map.length/$scope.pageSize);
        };
      });
      //$scope.$apply();
    });
    window.$scope = $scope;
  });

}());