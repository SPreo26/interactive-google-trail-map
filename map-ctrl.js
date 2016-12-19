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

  //custom filters for that elements that start and end the page
  app.filter('pageStart', function() {
    return function(input, start) {
      start = +start;//parse as int
      if (input!==undefined){
        return input.slice(start);
      }
      else {
        return []
      }
    }
  });

  app.filter('pageEnd', function() {
    return function(input, end) {
      end = +end;//parse as int
      if (input!==undefined){
        return input.slice(0,end);
      }
      else {
        return []
      }
    }
  });

}());