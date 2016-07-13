// Author: lixun910 at gmail.com



exports.MapCola = function() {
};

exports.MapCola.GeoJSON = require("./io/geojson.js");
exports.MapCola.ShpReader = require("./io/shapefile.js");

exports.MapCola.JsonMap = require("./map/geojson_map.js");
exports.MapCola.ShpMap = require("./map/shapefile_map.js");

exports.MapCola.MapCanvas= require("./viz/map_canvas.js");

exports.MapCola.prototype.print = function() {
  return "foo";
};
