// Author: lixun910 at gmail.com

// 1. simplest MapCola Example
//var react = require('react');
//var rbt = require('react-bootstrap-table');
var $ = global.jQuery = require('jquery');

require('bootstrap/dist/js/bootstrap.min.js');
//require('bootstrap-table');
var bootstrapTable = require('bootstrap-table/dist/bootstrap-table.js')


var MapCola = require('../lib/index.js');

var cmap = new MapCola("mymap", {
  //tileLayer : "http://{s}.tile.osm.org/{z}/{x}/{y}.png",
  width : "800px",
  height : "600px",
  showScale : true,
  showTable : true
  });

cmap.AddLayer("test/data/nat.json", {'fill_color':'red'}
  , function(map, data) {
    console.log(map, data);

    // using data (json) create a table (boostrap)
    //create_table(data, "div", "classname");
      var mymap = document.getElementById("mymap");
      var table = document.createElement('table'); 
      table.setAttribute("id", "table");  
      mymap.appendChild(table); 
      

      $('#table').bootstrapTable({
        columns: [{
            field: 'id',
            title: 'Item ID'
        }, {
            field: 'name',
            title: 'Item Name'
        }, {
            field: 'price',
            title: 'Item Price'
        }],
        data: [{
            id: 1,
            name: 'Item 1',
            price: '$1'
        }, {
            id: 2,
            name: 'Item 2',
            price: '$2'
        }]
    });

  // do spatial analysis here
  // clr_schema = geoda.quantile(data.income, k=5, colors=colorbrew.gry);

  // create a result map
  // map_canvas.update({colorSchema: clr_schema})

  // * share the map  on canvas not via code
});
//cmap.AddLayer("test/data/nat.json", {'fill_color':'green'});



// 2. MapCola works with existing LeafletMap project
var L = require('leaflet'),
    LeafletMap = require('leaflet-map');

var lmap = LeafletMap().setView([0,0],4);


L.tileLayer('http://{s}.tile.osm.org/{z}/{x}/{y}.png')
  .addTo(lmap);

var cmap2 = new MapCola(lmap);
cmap2.AddLayer("test/data/nat.shp", {'fill_color':'blue'});
