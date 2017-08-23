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
/*if (args.lat) 
  console.log("lat=" + args.lat);
if (args.lng) 
  console.log("lng=" + args.lng);*/

if (args.lng & args.lat){
  var map = L.map('map').setView([args.lat, args.lng], 15);
}
else{
  var map = L.map('map').setView([22.9980919,120.193303], 15);
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

/* Initialize the SVG layer */
map._initPathRoot();
//L.svg().addTo(map);
/* We simply pick up the SVG from the map object */
var svg = d3.select("#map").select("svg");
g = svg.append("g");

//var zapperData = "zapper_data.json";
var bucketList = "location.json";//"https://s3-ap-northeast-1.amazonaws.com/dengue-report-dest/bucket-list.json";
var bucketRecord = "0809-0816.json";//"bucket_record_717_721.json";
var eventRecord = "http://140.116.247.113:12130/api/mcc?start=2017-07-17&end=2017-07-26";
//var bucketRecord = "http://report.denguefever.tw/bucket-record/?start=2017-07-17&end=2017-07-21&county=台南";

queue()
  .defer(d3.json, bucketList)
  .defer(d3.json, bucketRecord)
  .await(makeMyMap);

function makeMyMap(error, list, record) {
  var radius = 25;

  //var color = ["83D7FF", "88E893", "FFFD88", "E8BF77", "FF9F8D"];
  //var color = ["62FF6A", "DBE86E", "FFE288", "E8A877", "FF8581"];
  var color = ["65FF29", "E8DF2E", "FFC440", "E8732E", "FF3333"];
  var count = [0, 20, 40, 60, 80];
  //console.log(list);
  //console.log(record['bucket-record']);
  var feature = g.selectAll("circle")
    .data(record['bucket-record'])
    .enter()
    .append("circle")
    .filter(function(d) { return d.investigate_date == "2017-08-11" })
    .style("opacity", .6)
    .style("fill", function(d) {
      //console.log(d.egg_count);
      if(d.egg_count >= count[0] && d.egg_count < count[1]) {
          d.color = color[0];//"65FF29";
      }
      else if(d.egg_count >= count[1] && d.egg_count < count[2]) {
          d.color = color[1];//"E8DF2E";
      }
      else if(d.egg_count >= count[2] && d.egg_count < count[3]) {
          d.color = color[2];//"FFC440";
      }
      else if(d.egg_count >= count[3] && d.egg_count < count[4]) {
          d.color = color[3];//"E8732E";
      }
      else if(d.egg_count >= count[4]) {
          d.color = color[4];//"FF3333";
      }
      else{
          d.color = color[0];//"65FF29";
      }
      //console.log(d.color);
      return d.color;
    })
    //.style("stroke", function(d) {
    //  return d.color
    //})
    //.attr("stroke-width", 20)
    /*.attr("transform",function(d) {
      //console.log(d.bucket_id);
      //console.log(list[d.bucket_id]['bucket_lng']);
      //console.log(list[d.bucket_id]['bucket_lat']);
      d.LatLng = new L.LatLng(list[d.bucket_id]['bucket_lng'], list[d.bucket_id]['bucket_lat']);
      //console.log(d.LatLng);
      return "translate(" +
        map.latLngToLayerPoint(d.LatLng).x + "," +
        map.latLngToLayerPoint(d.LatLng).y + ")";

    })*/
    //.attr("r", radius)
    .attr("r", function(d) {
      //return 5;
      if (d.size == "1" || d.size == "2")
        return 30;
      else if (d.size == "-1" || d.size == "-2")
        return 15;
      else
        return 25;
    })
    .attr('id', function(d) {
      return d.bucket_id;
    })
    .each(pulse);

  map.on("viewreset", update);
  update();

  function update() {
    feature.attr("transform",
      function(d) {
        //console.log(d.bucket_id)
        //console.log(list[d.bucket_id]);
        d.LatLng = new L.LatLng(list[d.bucket_id]['lat'], list[d.bucket_id]['lng']);
        
        //console.log(d.LatLng);
        return "translate(" +
          map.latLngToLayerPoint(d.LatLng).x + "," +
          map.latLngToLayerPoint(d.LatLng).y + ")";

      }
    )
  }

  function pulse() {
    var circle = d3.select(this);
    circle = circle.transition()
      .duration(1000)
      //.attr("stroke-width", 20)
      .attr("r", function(d) {
        //return 5;
        if (d.size == "1" || d.size == "2")
          return 30;
        else if (d.size == "-1" || d.size == "-2")
          return 15;
        else
          return 25;
      })
      .ease('sine');
  }

  repeat();

  function repeat() {
    setInterval(function() {
      var circle = d3.selectAll("circle");
      var color = ["65FF29", "E8DF2E", "FFC440", "E8732E", "FF3333"];
      var count = [0, 20, 40, 60, 80];
      circle = circle.transition()
        .duration(1000)
        //.attr("stroke-width", 20)
        /*.attr("r", function(d) {
          return Math.floor((Math.random() * 10) + 5)
        })*/
        .attr("r", function(d) {
        //return 5;
        if (d.size == "1" || d.size == "2")
          return 30;
        else if (d.size == "-1" || d.size == "-2")
          return 15;
        else
          return 25;
        })
        .ease('sine');
    }, 3000);
  }
}

/*d3.json( bucketList , function(collection) {
  console.log(collection);
  /*collection.forEach(function(d) {
    console.log(d.bucket_lat);
  });*/
  /*console.log('collection');
  console.log(collection);
  console.log(typeof collection);

  for (x in collection) {
    console.log(x);
    console.log(typeof x);
    console.log(collection[x]);
    console.log(typeof collection[x]);

    for (y in collection[x]) {
      console.log(y);
      console.log(typeof y);
      console.log('collection[x][y]')
      console.log(collection[x][y]);
      console.log(typeof collection[x][y]);
      break;
    }
    console.log(collection[x]['bucket_lat']);
    console.log(collection[x]['bucket_lng']);
    //var LatLng = new L.LatLng(collection[x]['bucket_lng'], collection[x]['bucket_lat'])
    break;

  }
  //console.log(collection)
  //console.log(typeof collection)
  //console.log(collection['bucket-record'][0])
  //console.log(typeof collection['bucket-record'][0])
  //console.log(collection['1707PPCL907'])
  //console.log(typeof collection['1707PPCL907'])
});

d3.json( bucketRecord , function(collection) {
  
  collection['bucket-record'].forEach(function(d) {
    //console.log(d.bucket_id);
    //d.LatLng = new L.LatLng(d.lng, d.lat)

    /*switch (d.status) {
      case 1:
        d.color = "65FF29";
        break;
      case 2:
        d.color = "E8DF2E";
        break;
      case 3:
        d.color = "FFC440";
        break;
      case 4:
        d.color = "E8732E";
        break;
      case 5:
        d.color = "FF3333";
        break;
      default:
        d.color = "FFC440";
        break;
    }

  });

  var radius = 15;
  var color = "FFC440";

  var feature = g.selectAll("circle")
    .data(collection['bucket-record'])
    .enter().append("circle")
    //.style("stroke", function(d) {
    //  return d.color
    //})
    .style("opacity", .6)
    .style("fill", function(d) {
      //console.log(d.egg_count);
      if(d.egg_count >= 0 && d.egg_count < 15) {
          d.color = "65FF29";
      }
      else if(d.egg_count >= 10 && d.egg_count < 30) {
          d.color = "E8DF2E";
      }
      else if(d.egg_count >= 30 && d.egg_count < 50) {
          d.color = "FFC440";
      }
      else if(d.egg_count >= 50 && d.egg_count < 100) {
          d.color = "E8732E";
      }
      else if(d.egg_count >= 100) {
          d.color = "FF3333";
      }
      else{
          d.color = "65FF29";
      }
      return d.color;
    })
    //.attr("stroke-width", 20)
    /*.attr("transform",function(d) {
      //d.LatLng = new L.LatLng(collection[x]['bucket_lng'], collection[x]['bucket_lat']);
      return "translate(" +
        map.latLngToLayerPoint(d.LatLng).x + "," +
        map.latLngToLayerPoint(d.LatLng).y + ")";

    })
    .attr("r", radius)
    .attr('id', function(d) {
      return "z" + d.zapper_id
    })
    .each(pulse);

  map.on("viewreset", update);
  update();



  function update() {
    feature.attr("transform",
      function(d) {
        d.LatLng = new L.LatLng(d.lng, d.lat)
        return "translate(" +
          map.latLngToLayerPoint(d.LatLng).x + "," +
          map.latLngToLayerPoint(d.LatLng).y + ")";

      }
    )
  }

  function pulse() {
    var circle = d3.select(this);
    circle = circle.transition()
      .duration(1000)
      //.attr("stroke-width", 20)
      .attr("r", function(d) {
        if (d.u_or_d == "up")
          return 30;
        else if (d.u_or_d == "down")
          return 15;
        else
          return 25;
      })
      .ease('sine');
  }

  repeat();

  function repeat() {
    setInterval(function() {
      var circle = d3.selectAll("circle");
      circle = circle.transition()
        .duration(1000)
        //.attr("stroke-width", 20)
        .attr("r", function(d) {
          return Math.floor((Math.random() * 20) + 11)
        })
        .ease('sine');
    }, 3000);
  }
});*/
/*
var svg_event = d3.select(map.getPanes().overlayPane).append("svg");
var g_event = svg_event.append("g").attr("class", "leaflet-zoom-hide");

var svg2 = d3.select(map.getPanes().overlayPane).append("svg"),
  g2 = svg2.append("g").attr("class", "leaflet-zoom-hide");
var svg3 = d3.select(map.getPanes().overlayPane).append("svg"),
  g3 = svg3.append("g").attr("class", "leaflet-zoom-hide");
var svg4 = d3.select(map.getPanes().overlayPane).append("svg"),
  g4 = svg4.append("g").attr("class", "leaflet-zoom-hide");

var trend_data = ['trend_data_0.json', 'trend_data_1.json', 'trend_data_2.json'];

repeat_trend();
setInterval(function() {
  svg2 = d3.select(map.getPanes().overlayPane).append("svg");
  g2 = svg2.append("g").attr("class", "leaflet-zoom-hide");
  svg3 = d3.select(map.getPanes().overlayPane).append("svg");
  g3 = svg3.append("g").attr("class", "leaflet-zoom-hide");
  svg4 = d3.select(map.getPanes().overlayPane).append("svg");
  g4 = svg4.append("g").attr("class", "leaflet-zoom-hide");
  repeat_trend();
}, 16000);

function repeat_trend() {
  var eventIndex = 0;
  setTimeout(function() {
    d3.json(trend_data[0], function(collection) {
      var idCounter = 1;

      currentEventNum += collection.features.length;
      if (currentEventNum > MAX_EVENT_NUM) {
        $('#list ol').empty();
        currentEventNum = 0;
      }

      var events = collection.features.slice();
      events.forEach(function(event) {
        var id = event.properties.id
        addEventListItem(id, '', EVENT_COLOR_HEX[eventIndex > 5 ? 5 : eventIndex]);
        eventIndex++;
      });
      //  create a d3.geo.path to convert GeoJSON to SVG
      var transform = d3.geo.transform({ point: projectPoint }),
        path = d3.geo.path().projection(transform);

      // create path elements for each of the features
      d3_features = g3.selectAll("path")
        .data(collection.features)
        .enter().append("path");

      map.on("viewreset", reset);

      reset();

      // fit the SVG element to leaflet's map layer
      function reset() {

        bounds = path.bounds(collection);

        var topLeft = bounds[0],
          bottomRight = bounds[1];

        svg3.attr("width", bottomRight[0] - topLeft[0])
          .attr("height", bottomRight[1] - topLeft[1])
          .style("left", topLeft[0] + "px")
          .style("top", topLeft[1] + "px");

        g3.attr("transform", "translate(" + -topLeft[0] + "," + -topLeft[1] + ")");

        // initialize the path data 
        d3_features.attr("d", path)
          .style("stroke", "red")
          .attr("stroke-width", 3)
          .attr('fill', 'none');
      }

      // Use Leaflet to implement a D3 geometric transformation.
      function projectPoint(x, y) {
        var point = map.latLngToLayerPoint(new L.LatLng(y, x));
        this.stream.point(point.x, point.y);
      }
    });
  }, 3000);
  setTimeout(function() {
    d3.json(trend_data[1], function(collection) {
      var idCounter = 1;


      currentEventNum += collection.features.length;
      if (currentEventNum > MAX_EVENT_NUM) {
        $('#list ol').empty();
        currentEventNum = 0;
      }

      var events = collection.features.slice();
      events.forEach(function(event) {
        var id = event.properties.id

        addEventListItem(id, '', EVENT_COLOR_HEX[eventIndex > 5 ? 5 : eventIndex]);
        eventIndex++;
      });
      //  create a d3.geo.path to convert GeoJSON to SVG
      var transform = d3.geo.transform({ point: projectPoint }),
        path = d3.geo.path().projection(transform);

      // create path elements for each of the features
      d3_features = g2.selectAll("path")
        .data(collection.features)
        .enter().append("path");

      map.on("viewreset", reset);

      reset();

      // fit the SVG element to leaflet's map layer
      function reset() {

        bounds = path.bounds(collection);

        var topLeft = bounds[0],
          bottomRight = bounds[1];

        svg2.attr("width", bottomRight[0] - topLeft[0])
          .attr("height", bottomRight[1] - topLeft[1])
          .style("left", topLeft[0] + "px")
          .style("top", topLeft[1] + "px");

        g2.attr("transform", "translate(" + -topLeft[0] + "," + -topLeft[1] + ")");

        // initialize the path data 
        d3_features.attr("d", path)
          .style("stroke", "red")
          .attr("stroke-width", 3)
          .attr('fill', 'none');
      }

      // Use Leaflet to implement a D3 geometric transformation.
      function projectPoint(x, y) {
        var point = map.latLngToLayerPoint(new L.LatLng(y, x));
        this.stream.point(point.x, point.y);
      }
    });
  }, 6000);
  setTimeout(function() {
    d3.json(trend_data[2], function(collection) {
      var idCounter = 1;


      currentEventNum += collection.features.length;
      if (currentEventNum > MAX_EVENT_NUM) {
        $('#list ol').empty();
        currentEventNum = 0;
      }

      var events = collection.features.slice();
      events.forEach(function(event) {
        var id = event.properties.id;
        addEventListItem(id);
        eventIndex++;
      });

      //  create a d3.geo.path to convert GeoJSON to SVG
      var transform = d3.geo.transform({ point: projectPoint }),
        path = d3.geo.path().projection(transform);

      // create path elements for each of the features
      d3_features = g4.selectAll("path")
        .data(collection.features)
        .enter().append("path");

      map.on("viewreset", reset);

      reset();

      // fit the SVG element to leaflet's map layer
      function reset() {

        bounds = path.bounds(collection);

        var topLeft = bounds[0],
          bottomRight = bounds[1];

        svg4.attr("width", bottomRight[0] - topLeft[0])
          .attr("height", bottomRight[1] - topLeft[1])
          .style("left", topLeft[0] + "px")
          .style("top", topLeft[1] + "px");

        g4.attr("transform", "translate(" + -topLeft[0] + "," + -topLeft[1] + ")");

        // initialize the path data 
        d3_features.attr("d", path)
          .style("stroke", "red")
          .attr("stroke-width", 3)
          .attr('fill', 'none');
      }

      // Use Leaflet to implement a D3 geometric transformation.
      function projectPoint(x, y) {
        var point = map.latLngToLayerPoint(new L.LatLng(y, x));
        this.stream.point(point.x, point.y);
      }
    });
  }, 9000);
  setTimeout(function() {
    svg3.selectAll("*").remove();
  }, 9000);
  setTimeout(function() {
    svg2.selectAll("*").remove();
  }, 12000);
  setTimeout(function() {
    svg4.selectAll("*").remove();
  }, 15000);
}

function addEventListItem(zapperId) {
  var colorHex;
  var zapperName = ["大學","虎尾","六甲","仁愛","億載"];
  var zapperRange = ["10","5","7","10","7"];
  var zapperInfo = ["5日內，蚊媒指數上升2倍，輕微風險","3日內，蚊媒指數上升5倍，警戒風險","5日內，蚊媒指數上升10倍，高度風險"];


  if ((zapperId+1) > eventItems.length || eventItems.length===0) {
    // console.log('push',zapperId, eventItems)
    var infoNum = Math.floor((Math.random() * 3))
    colorHex = EVENT_COLOR_HEX[infoNum];
    //var html = '<li style="background-color:' + colorHex + '"> no.' + zapperId + ' event, 1 times</li>';
    var html = '<li style="background-color:' + colorHex + '"> ' + zapperName[zapperId] + '里，' + zapperRange[zapperId] + '公里範圍於' + zapperInfo[infoNum] + ' </li>';
    var item = $(html);
    // item.data('id',zapperId).data('time', 1);
    $('#list ol').prepend(item);
    eventItems.push({ tag: item, time: 1 });
  } else {
    // console.log('repalce',zapperId, eventItems)
    var infoNum = Math.floor((Math.random() * 3))
    colorHex = EVENT_COLOR_HEX[infoNum];
    //console.log('hi',infoNum)
    //var html = '<li style="background-color:' + colorHex + '">no.' + zapperId + ' event, ' + (eventItems[zapperId].time+1) + ' times</li>';
    var html = '<li style="background-color:' + colorHex + '"> ' + zapperName[zapperId] + '里，' + zapperRange[zapperId] + '公里範圍於' + zapperInfo[infoNum] + ' </li>';
    var item = $(html).css('top',eventItems[zapperId].tag.css('top'));
    // item.data('id',zapperId).data('time', eventItems[zapperId].time+1);
    eventItems[zapperId].tag.after(item);
    eventItems[zapperId].tag.fadeOut().remove();
    eventItems[zapperId] = { tag: item, time: eventItems[zapperId].time + 1 };
  }
  sortlist();
}

function sortlist(){
  var seq = [];
  eventItems.forEach(function(d, i){
    var dom = d.tag;
    var time = d.time;
    var id = i;
    seq.push([i, time]);
  });

  seq.sort(function(a,b){
    if( a[1] === b[1] )
      return b[0]- a[0]
    else
      return b[1] - a[1];
  });

  seq.forEach(function(d, i){
    //console.log(eventItems[d[0]].tag)
    eventItems[d[0]].tag.css('top',(i*LI_DIST+LI_PADDING)+'px');
  })
}*/
