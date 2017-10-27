var today = new Date();
var dd = today.getDate();
var mm = today.getMonth()+1; //January is 0!
var yyyy = today.getFullYear();

if(dd<10) {
    dd = '0'+dd
} 

if(mm<10) {
    mm = '0'+mm
} 

today = yyyy + '-' + mm + '-' + dd ;

function getArgs() { 
  var args = new Object(); 
  var query = location.search.substring(1);
  var pairs = query.split("&"); 
  for(var i=0;i<pairs.length;i++) { 
    var pos = pairs[i].indexOf("="); 
    if (pos == -1) continue; 
    var argname = pairs[i].substring(0,pos); 
    var value = pairs[i].substring(pos+1); 
    args[argname] = decodeURIComponent(value); 
  } 
  return args; 
}

var args = getArgs();
var winSize = 17;
if (args.lng & args.lat){
  var map = L.map('map').setView([args.lat, args.lng], winSize);
}
else{
  var map = L.map('map').setView([22.9990919,120.220303], winSize);
}
mapLink = '<a href="http://openstreetmap.org">OpenStreetMap</a>';

var EVENT_COLOR_HEX = ['#c0a09c','#c07167','#BD3F32'];
var currentEventNum = 0;
var MAX_EVENT_NUM = 50;
var eventItems = [];

var LI_DIST = 68;
var LI_PADDING = 12;

L.tileLayer('https://api.mapbox.com/styles/v1/mapbox/dark-v9/tiles/256/{z}/{x}/{y}?access_token={accessToken}', {
  attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, <a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="http://mapbox.com">Mapbox</a>',
  maxZoom: 18,
  id: 'your.mapbox.project.id',
  accessToken: 'pk.eyJ1IjoiY2hpbmc1NiIsImEiOiJjaXNiZmYydGMwMTN1MnpwbnNqNWVqM2plIn0.k7h-PUGX7Tl5xLwDH3Qpsg'
}).addTo(map);

map._initPathRoot();

var svg = d3.select("#map").select("svg");
g = svg.append("g");

d3.queue()
  .defer(d3.json, lampLoc)
  .defer(d3.json, lampCnt)
  .await(makeMyMap);

function makeMyMap(error, list, record) {
  var radius = 25;

  var color = ["808080", "00e600", "FFFF00", "FFCC00", "FF9900", "FF6600"];
  var count = [0, 1, 6, 20, 50, 100];

  var todayData = record[today];
  var todayArr = [];


  Object.keys(todayData).forEach(function(e) {
    var that = this;
    todayArr.push(todayData[e]);
  }, {})


  var feature = g.selectAll("circle")
    .data(list)
    .enter()
    .append("circle")
    .attr('id', function(d) {
      return d.lamp_id;
    })
    .style("opacity", .5)
    .style("fill", function(d) {
      var loc = todayArr.find(function(l){return l.lamp_id == d.lamp_id;});
      if( loc == undefined ){
      	var sum = 0;
      }else{
      	var sum = parseInt(loc.sum);
      }
      console.log(sum);
      if(sum >= count[0] && sum < count[1]) {
          d.color = color[0];
      }
      else if(sum >= count[1] && sum < count[2]) {
          d.color = color[1];
      }
      else if(sum >= count[2] && sum < count[3]) {
          d.color = color[2];
      }
      else if(sum >= count[3] && sum < count[4]) {
          d.color = color[3];
      }
      else if(sum >= count[4] && sum < count[5]) {
          d.color = color[4];
      }
      else if(sum >= count[5]) {
          d.color = color[5];
      }
      else{
          d.color = color[0];
      }
      return d.color;
    })
    .attr("r", function(d) {
      var loc = todayArr.find(function(l){return l.lamp_id == d.lamp_id;});
      if( loc == undefined ){
      	var radius = 20;
      }else if( loc.size == undefined){
        var radius = 20;
      }else{
        var radius = (20+ parseInt(loc.size)*5);
  	  }
  	  return radius;
    })
    .attr('id', function(d) {
      return d.lamp_id;
    })
    .attr("transform",
      function(d) {
        d.LatLng = new L.LatLng(d.lamp_location[1],d.lamp_location[0]);
        
        return "translate(" +
          map.latLngToLayerPoint(d.LatLng).x + "," +
          map.latLngToLayerPoint(d.LatLng).y + ")";

      }
    );
    //.each(pulse);

  map.on("viewreset", update);
  update();

  function update() {
    feature.attr("transform",
      function(d) {
        d.LatLng = new L.LatLng(d.lamp_location[1],d.lamp_location[0]);        
        return "translate(" +
          map.latLngToLayerPoint(d.LatLng).x + "," +
          map.latLngToLayerPoint(d.LatLng).y + ")";

      }
    )
  }
  //   circle = circle.transition()
  //     .duration(1000)
  //     //.attr("stroke-width", 20)
  //     .attr("r", function(d) {
   //      var loc = todayArr.find(function(l){return l.lamp_id == d.lamp_id;});
   //      if( loc == undefined ){
   //       var radius = 20;
   //      }else if( loc.size == undefined){
   //        var radius = 20;
   //      }else{
   //        var radius = (20+ parseInt(loc.size)*5);
   //     }
   //     return radius;
   //    })
  //     .ease('sine');
  // }

  /*repeat();

  function repeat() {
    setInterval(function() {
      var circle = d3.selectAll("circle");
      var color = ["65FF29", "E8DF2E", "FFC440", "E8732E", "FF3333"];
      var count = [0, 20, 40, 60, 80];
      circle = circle.transition()
        .duration(1000)
        .attr("r", function(d) {
          var loc = todayArr.find(function(l){return l.lamp_id == d.lamp_id;});
          if( loc == undefined ){
            var radius = 20;
          }else if( loc.size == undefined){
            var radius = 20;
          }else{
            var radius = (20+ parseInt(loc.size)*5);
          }
          return radius;
        })
        .ease('sine');
    }, 3000);
  }*/
  // function pulse() {
  //   var circle = d3.select(this);

}
