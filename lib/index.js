// Author: lixun910 at gmail.com

var L = require('leaflet');

/**
 * This is the MapCola class,
 *
 * @class MapCola
 * @constructor
 *
 * @param {string} id The id of a div
 * @param {object} options The dictionary of map configuration.
 * E.g. { crs : L.CRS.EPSG3857, center : LatLng, zoom : Number, ..}
 *
 * @property {Object} leafletMap The object of a leaflet map object created by L.map()
 * @property {String} leafletMapID The id of leafletMap = "leaflet_" + id
 */
var MapCola = function(source, options) {

  // properties
  this.id = "";
  this.leafletMap = null;
  this.hlCanvasEl = null;
  this.containerEl = null;

  // different constructors
  if (typeof source === 'string') {
    this._initFromEmpty(source, options);
  } else if (typeof source === 'object') {
    this._initFromLeafletMap(source, options);
  }

  this.leafletMap.dragging.disable();
  this.containerEl.style.cursor =  'default';
};

MapCola.GeoJSON = require("./io/geojson.js");
MapCola.ShpReader = require("./io/shapefile.js");

MapCola.JsonMap = require("./map/geojson_map.js");
MapCola.ShpMap = require("./map/shapefile_map.js");

MapCola.MapCanvas= require("./viz/map_canvas.js");

/**
* My method description.  Like other pieces of your comment blocks,
* this can span multiple lines.
*
* @method methodName
* @param {String} foo Argument 1
* @param {Object} config A config object
* @param {String} config.name The name on the config object
* @param {Function} config.callback A callback function on the config object
* @param {Boolean} [extra=false] Do extra, optional work
* @return {Boolean} Returns true on success
*/
MapCola.prototype = {

  print : function() {
    return "foo";
  },

  /**
   * @param {Object} lmap The object of LeafletMap map
   */
  _initFromLeafletMap : function(lmap, options) {
    this.leafletMap = lmap;
    this.containerEl =  lmap.getContainer();
    this.id = this.containerEl.id;
    this._addHighlightCanvas();
  },

  /**
   * @param {String} id The identification of DIV container
   */
  _initFromEmpty : function(id, options) {
    // check and set L configuration
    if (L.Icon.Default.imagePath) {
      L.Icon.Default.imagePath = '//cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.3/images';
    }
    var leaflet_css_exist = false;
    var stylesheets = document.styleSheets;
    for (var i=0; i< stylesheets.length; i++ ) {
      if (stylesheets[i].indexOf('leaflet.css') >=0) {
        leaflet_css_exist = true;
        break;
      }
    }
    if ( !leaflet_css_exist ) {
      var mapStyle = document.createElement('link');
      mapStyle.setAttribute('rel','stylesheet');
      mapStyle.setAttribute('href','//cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.3/leaflet.css');
      document.body.appendChild(mapStyle);
    }
    this.id = id;
    this.containerEl = document.getElementById(id);

    // for layout & overlays see http://jsfiddle.net/benjaminthomas/h5bjt69s/3/
    // for testing purpose, if no div, create one
    if (!this.containerEl) {
      //document.documentElement.style.height = '100%';
      //document.body.style.height = '100%';
      //document.body.style.margin = '0';
      this.containerEl = document.createElement('div');
      this.containerEl.id = id;
      this.containerEl.setAttribute('style','width:100%;height:100%;position:relative;border: 2px solid green;');
      if (options.width) this.containerEl.style.width = options.width;
      if (options.height) this.containerEl.style.height = options.height;
      document.body.appendChild(this.containerEl);
    }

    // add LeafletMap
    this.leafletMap = L.map(this.containerEl);
    this.leafletMap.dragging.disable();
    this.containerEl.style.cursor =  'default';

    if (options.tileLayer) {
      L.tileLayer(options.tileLayer).addTo(this.leafletMap);
    }

    this._addHighlightCanvas();
  },

  _addHighlightCanvas : function() {
    // Note: all AddLayer() will be inserted before clear div & highlight canvas
    this.clearDiv = document.createElement("div");
    this.clearDiv.setAttribute('style', 'clear: both;');
    this.containerEl.appendChild(this.clearDiv);

    // add highlight HTML5 canvas,
    this.hlCanvasEl = document.createElement("Canvas");
    this.hlCanvasEl.setAttribute('style', 'position:relative;top:0;left:0;width:100%;height:100%;');
    this.containerEl.appendChild(this.hlCanvasEl);
  },

  AddLayer : function(datasource, options) {
    if (typeof datasource === 'string') {
      this.AddLayerFromURL(datasource, options);
    } else if (typeof datasource === '') {
      this.AddLayerFromDragDrop(datasource, options);
    }
  },

  AddLayerFromURL : function(datasource, options) {
    var self = this;
    var xhr = new XMLHttpRequest();
    xhr.open("GET", datasource, true);
    xhr.responseType = 'arraybuffer';
    xhr.onload = function(evt) {
      var content = xhr.response;
      var prj = null;
      var shp_reader = new MapCola.ShpReader(content);
      var shp_map = new MapCola.ShpMap("pubhsg", shp_reader, L, self.leafletMap);
      var canvasEl = document.createElement("Canvas");
      canvasEl.id = datasource; // url as id
      canvasEl.setAttribute('style', 'position:absolute;top:0;left:0;width:100%;height:100%;pointer-events:none');
      self.containerEl.insertBefore(canvasEl, self.clearDiv);

      var mapCanvasEl = new MapCola.MapCanvas(shp_map, canvasEl, self.hlCanvasEl, options);
    };
    xhr.send(null);
  },

  AddLayerFromDragDrop : function(datasource, options) {
  },
}


module.exports = MapCola;
