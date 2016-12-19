$(document).ready(function(){ 
  var mapData = [];
  var markers = [];
  var bounds = new google.maps.LatLngBounds();

  var icon = {
    url:'./1000px-Reddot-small.png',
    scaledSize: new google.maps.Size(10, 10), // scaled size
    origin: new google.maps.Point(0,0), // origin
    anchor: new google.maps.Point(5,5) // anchor
  };

  window.map = new google.maps.Map($('#map')[0], {
    center: center
  });

  //rawData is defined in pct-data.js
  rawData.forEach(function(elem){
    mapData.push({mile: elem[0], lat: elem[1], lng: elem[2]});
    var marker = new google.maps.Marker({
      position: {lat: elem[1], lng: elem[2]},
      map: window.map,
      title: 'Mile ' + elem[0],
      icon: icon
    });
    markers.push(marker);
    loc = new google.maps.LatLng(marker.position.lat(), marker.position.lng());
    bounds.extend(loc);
  })

  var centerMarker = markers[Math.floor(markers.length/2)];
  var center = {lat:centerMarker.getPosition().lat(),lng:centerMarker.getPosition().lng()};
  window.map.fitBounds(bounds);
});