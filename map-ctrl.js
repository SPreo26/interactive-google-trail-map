(function() {
  "use strict";

  var app = angular.module("app");

  app.controller("mapCtrl", function($scope, MapService){

    $scope.setup = function(){
      $scope.currentPage = 1;
      $scope.pageSize = 10;
      $scope.numberOfPages = function(){return 1};//before marker data is loaded, assume 1 page
    };

    $scope.mapInit = function(){

      MapService.init().then(
        function(data){
          $scope.data = data;
          //data contains two arrays of objects:
          //- ngMarkers which is the model for marker data displayed in list,
          //- gMarkers which is the model for markers displayed on map
          // these models are separate, but are synced up in either direction when needed

          //initialize searchFilteredMarkers set of ngMarkers as full set (used to figure out number of pages, depending on search bar filtering)
          $scope.searchFilteredMarkers=data.ngMarkers
          $scope.numberOfPages=function(){
          return Math.ceil($scope.searchFilteredMarkers.length/$scope.pageSize);
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

    //reload original map data
    $scope.mapReload = function(){

      //clear the pair of markers used for closest marker search
      var gMarkerPair;
      if ($scope.locate==undefined || $scope.locate.gMarkerPair==undefined){
        gMarkerPair=null;
      }
      else{
        gMarkerPair=$scope.locate.gMarkerPair
      }

      MapService.reload($scope.data.gMarkers,gMarkerPair).then(
        function(data){
          $scope.data = data;
          //go back to first page and reset search, if there was one
          if ($scope.search && $scope.search.mile.length>0){
            $scope.currentPage=1;
            $scope.search.mile="";
          }
          //reset searchFilteredMarkers set of ngMarkers as full set (used to figure out number of pages, depending on search bar filtering)
          $scope.searchFilteredMarkers=data.ngMarkers  
          $scope.makeSurePageNotOutOfBounds();  
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

    //propogate edits of ngMarkers to gMarkers
    $scope.updateGMarkers = function(){
      $scope.deselectAllMarkers();
      $scope.data = MapService.updateGMarkers($scope.data.ngMarkers,$scope.data.gMarkers);
      //go back to first page and reset search, if there was one
      if ($scope.search && $scope.search.mile.length>0){
        $scope.currentPage=1;
        $scope.search.mile="";
      }      
    };

    $scope.removeSelectedMarkers = function(){
      var markersSelected = false;
      $scope.data.ngMarkers.forEach(function(marker){
        if(marker.selected){
          markersSelected=true;
        }
      })

      if (markersSelected){
        if (confirm("Delete selected markers: Are you sure?")){
          $scope.data=MapService.removeSelectedMarkers($scope.data.ngMarkers,$scope.data.gMarkers);
          $scope.searchFilteredMarkers=$scope.data.ngMarkers;
          $scope.makeSurePageNotOutOfBounds();
        }
      }
      else{
        alert("Please select at least one marker to delete.")
      }      
    }

    $scope.addMarker = function(){
      $scope.revertUnsavedChanges();
      var ngMarker=$scope.newMarker;
      var invalid = $scope.invalidNgMarker (ngMarker);
      if (invalid){
        alert("Please enter a valid mile number, lattitude and longitude.")
      }
      else{
        $scope.data=MapService.addMarker($scope.data.gMarkers,$scope.data.ngMarkers,ngMarker)

        if ($scope.search){
          $scope.search.mile="";
        }

        //set current page to page that contains the marker (search by mile)
        //(this assumes only markers with unique mile numbers are entered - otherwise ngMarkers is sorted so derived page should still be fairly accurate)
        var i;//will have the index of the marker we search for
        for(i = 0; i < $scope.data.ngMarkers.length; i++) {
          if($scope.data.ngMarkers[i].mile === parseFloat($scope.newMarker.mile)) {
            break;
          }
        }
        $scope.currentPage=Math.ceil((i+1)/$scope.pageSize);
        $scope.newMarker=null;
      }
    };

    $scope.changePage = function(directionSign){
      $scope.deselectAllMarkers();
      $scope.revertUnsavedChanges()//clear any edits after page is switched
      $scope.currentPage=+$scope.currentPage+directionSign;//page buttons are automatically disabled in html to prevent going out of bounds
    };

    //in case reloading/searching caused number of pages to shrink, and one was on a page now out of bounds, set page to current last page
    //also used to prevent user from entering pages out of bounds
    $scope.makeSurePageNotOutOfBounds = function(){   
      if (+$scope.currentPage>$scope.numberOfPages()){
        $scope.currentPage=$scope.numberOfPages();
      }
      if ($scope.currentPage!=""&&+$scope.currentPage<1){
        $scope.currentPage=1;
      }
    }

    $scope.deselectAllMarkers = function(){
      $scope.data.ngMarkers.forEach(function(marker){
        marker.selected = false;
      })
    }

    $scope.showClosestMarker = function(){
      if ($scope.locate && $scope.locate.lat && $scope.locate.lng){
        //find and display input marker and closest trail marker
        $scope.locate.gMarkerPair = MapService.showClosestMarker($scope.locate.lat,$scope.locate.lng,$scope.locate.gMarkerPair,$scope.data.ngMarkers);
      }
      else{
        alert("Please enter both lattitude and longitude above Closest Marker button.")
      }
    }

    $scope.invalidNgMarker = function(ngMarker){
      if(ngMarker===undefined || ngMarker===null){
        return true;
      }
      var latInvalid = ngMarker.lat===undefined||ngMarker.lat===""||parseFloat(ngMarker.lat)>=90||parseFloat(ngMarker.lat)<=-90;
      var lngInvalid = ngMarker.lng===undefined||ngMarker.lng===""||parseFloat(ngMarker.lng)>180||parseFloat(ngMarker.lng)<-180;
      var mileInvalid = ngMarker.mile===undefined||ngMarker.mile===""||parseFloat(ngMarker.mile)<0;
      return latInvalid||lngInvalid||mileInvalid;
    }
    //filter comparator to get results starting with search string (e.g. start of mile string must match search)
    $scope.startsWith = function (actual, expected) {
      var lowerStr = (actual + "").toLowerCase();
      return lowerStr.indexOf(expected.toLowerCase()) === 0;
    }

    window.$scope = $scope;

  });

}());