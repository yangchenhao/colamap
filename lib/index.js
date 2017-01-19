// Author: lixun910 at gmail.com

var L = require('leaflet');

var GeoJSON = require("./io/geojson.js");
var ShpReader = require("./io/shapefile.js");

var JsonMap = require("./map/geojson_map.js");
var ShpMap = require("./map/shapefile_map.js");

var MapCanvas= require("./viz/map_canvas.js").MapCanvas;
var HighlightCanvas = require("./viz/map_canvas.js").HighlightCanvas;

var TableControl = require("./table.js");
var LayerControl = require("./layer.js");
var MapButtons = require("./mapbtns.js");


/**
 * This is the MapCola class,
 *
 * @class MapCola
 * @constructor
 *
 * @param {string} source: id The id of a div
 * @param {object} options: The dictionary of map configuration.
 * E.g. { crs : L.CRS.EPSG3857, center : LatLng, zoom : Number, ..}
 *
 * @property {Object} leafletMap The object of a leaflet map object created by L.map()
 * @property {String} leafletMapID The id of leafletMap = "leaflet_" + id
 */
var MapCola = function(source, options) {

  // properties
  this.id = "";

  // assign null value (initialized), will be created in constructors
  this.leafletMap = null;

  // the HTML DIV element contains MapCola
  this.containerEl = null;

  // the Array of map instances @class MapCanvas
  this.mapList = [];

  // the Array of HTML5 Canvas  of maps
  this.canvasList = [];

  // each MapCola has only one hlCanvas object,
  // represents the instance of @class HighlightCanvas
  this.hlCanvas = null;

  // the HTML Canvas element represents HighlightCanvas
  // the hlCanvasEl will be created at the end of constructors
  this.hlCanvasEl = null;

  // different constructors
  if (typeof source === 'string') {
    this._initFromEmpty(source, options);
  } else if (typeof source === 'object') {
    this._initFromLeafletMap(source, options);
  }

  // setup leaflet mouse events
  this._setupLeafletMapEvents();

  // setup leaflet environment
  this.leafletMap.dragging.disable();
  this.leafletMap.touchZoom.disable();
  this.leafletMap.doubleClickZoom.disable();
  this.leafletMap.scrollWheelZoom.disable();
  this.leafletMap.boxZoom.disable();
  this.leafletMap.keyboard.disable();
  if (this.leafletMap.tap) this.leafletMap.tap.disable();

  this.containerEl.style.cursor =  'default';
};

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
    this._addHighlightCanvasEl();
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
    this.leafletMap.setView([0,0],1);

    this.containerEl.style.cursor =  'default';

    if (options.tileLayer) {
      L.tileLayer(options.tileLayer).addTo(this.leafletMap);
    }

    if (options.scale && options.scale == true) {
      L.control.scale().addTo(this.leafletMap);
    }

    // add highlight canvas element
    this._addHighlightCanvasEl();

    // add Layer controller to LeafletMap
    this.leafletMap.addControl(new LayerControl(this.mapList));

    // add map buttons as controller to LeaftletMap
    this.leafletMap.addControl(new MapButtons(this.hlCanvasEl, this.containerEl));

    // add table controller to LeafletMap
    this.tableCtrl = new TableControl(this.mapList);
    this.leafletMap.addControl(this.tableCtrl);
  },

  _addHighlightCanvasEl : function() {
    // Note: all AddLayer() will be inserted before clear div & highlight canvas
    this.clearDiv = document.createElement("div");
    this.clearDiv.setAttribute('style', 'clear: both;');
    this.containerEl.appendChild(this.clearDiv);

    // add highlight HTML5 canvas,
    this.hlCanvasEl = document.createElement("Canvas");
    this.hlCanvasEl.setAttribute('style', 'position:relative;top:0;left:0;width:100%;height:100%;');
    this.containerEl.appendChild(this.hlCanvasEl);

    // init HighlightCanvas() instance,
    if (this.hlCanvas == null) {
      this.hlCanvas = new HighlightCanvas(this.hlCanvasEl);
    }
  },

  _addLayerController : function() {
    // layer control
    var className = 'leaflet-control-layers-toggle';
    var x = document.getElementsByClassName("example");

  },

  _setupLeafletMapEvents : function() {
    var self = this;

    this.leafletMap.on('zoomstart',  function() {
      // clean maps
      self.Clean();
    });

    this.leafletMap.on('zoomend',  function() {
      // already taken care by moveend
    });

    this.leafletMap.on('movestart',   function (e) {
      try {
        self.lmap_start = e.target._getTopLeftPoint();

      // clean maps
      self.Clean();
      } catch (err) {}
    });

    this.leafletMap.on('move',   function(e) {
      self.lmap_move = e.target._getTopLeftPoint();
      if ( self.lmap_start == undefined) {
        self.lmap_start = e.target.getPixelOrigin();
        // clean maps
        self.Clean();
        return;
      }
      var offsetX = self.lmap_move.x - self.lmap_start.x,
          offsetY = self.lmap_move.y - self.lmap_start.y;

      if (Math.abs(offsetX) > 0 && Math.abs(offsetY) > 0) {
        // pan map (-offsetX, -offsetY)
        self.Pan(-offsetX, -offsetY);
      }
    });

    this.leafletMap.on('moveend',   function(e) {
      self.lmap_end = e.target._getTopLeftPoint();
      var offsetX = self.lmap_end.x - self.lmap_start.x,
          offsetY = self.lmap_end.y - self.lmap_start.y;

      if (Math.abs(offsetX) > 0 || Math.abs(offsetY) > 0) {
        if (self.gOffsetX != offsetX || self.gOffsetY != offsetY) {
          self.gOffsetX = offsetX;
          self.gOffsetY = offsetY;
          //UpdateMaps();
          self.Update();
        }
      }
    });
  },

  Clean : function () {
    for (var i=0, n=this.mapList.length; i<n; i++) {
      this.mapList[i].clean();
    }
  },

  Pan : function(offsetX, offsetY) {
    for (var i=0, n=this.mapList.length; i<n; i++) {
      this.mapList[i].move(offsetX, offsetY);
    }
  },

  Update : function(params) {
    for (var i=0, n=this.mapList.length; i<n; i++) {
      this.mapList[i].update(params, true);
    }
  },

  AddLayer : function(datasource, options, OnDone) {
    if (typeof datasource === 'string') {
      if (datasource.endsWith("json")) {
        this.AddJsonLayerFromURL(datasource, options, OnDone);
      } else if (datasource.endsWith("shp")) {
        this.AddShpLayerFromURL(datasource, options, OnDone);
      }
    } else if (typeof datasource === '') {
      this.AddLayerFromDragDrop(datasource, options, OnDone);
    }
  },

  AddJsonLayerFromURL : function(datasource, options, OnDone) {
    var self = this;
    var xhr = new XMLHttpRequest();
    xhr.open("GET", datasource, true);
    xhr.responseType = 'json';
    xhr.onload = function(evt) {
      // create HTML canvas element
      var canvasEl = document.createElement("Canvas");
      canvasEl.id = datasource; // url as id
      canvasEl.setAttribute('style', 'position:absolute;top:0;left:0;width:100%;height:100%;pointer-events:none');

      self.containerEl.insertBefore(canvasEl, self.clearDiv);

      self.canvasList.push(canvasEl);

      // read geojson
      var prj = null;
      var content = xhr.response;
      var json_reader = new GeoJSON("pubhsg",content, prj)
      var json_map = new JsonMap(json_reader, L, self.leafletMap);

      // create new MapCanvas instance
      var mapCanvas = new MapCanvas(json_map, canvasEl, options);
      self.mapList.push(mapCanvas);

      OnDone(json_map, content, mapCanvas);

      // update highlightCanvas instance
      self.hlCanvas.UpdateMap(mapCanvas);

      // update table controller
      //self.tableCtrl.Update(self.mapList);
    };
    xhr.send(null);
  },

  AddShpLayerFromURL : function(datasource, options, OnDone) {
    var self = this;
    var xhr = new XMLHttpRequest();
    xhr.open("GET", datasource, true);
    xhr.responseType = 'arraybuffer';
    xhr.onload = function(evt) {
      // create HTML canvas element
      var canvasEl = document.createElement("Canvas");
      canvasEl.id = datasource; // url as id
      canvasEl.setAttribute('style', 'position:absolute;top:0;left:0;width:100%;height:100%;pointer-events:none');

      self.containerEl.insertBefore(canvasEl, self.clearDiv);

      self.canvasList.push(canvasEl);

      // read shapefile
      var content = xhr.response;
      var prj = null;
      var shp_reader = new ShpReader(content);
      var shp_map = new ShpMap("pubhsg", shp_reader, L, self.leafletMap);

      // create new MapCanvas instance
      var mapCanvas = new MapCanvas(shp_map, canvasEl, options);
      self.mapList.push(mapCanvas);

      //OnDone(shp_map, table, mapCanvas);

      // update highlightCanvas instance
      self.hlCanvas.UpdateMap(mapCanvas);

      // update table controller
      //self.tableCtrl.Update(self.mapList);
    };
    xhr.send(null);
  },

  AddLayerFromDragDrop : function(datasource, options) {
  },



}


module.exports = MapCola;
