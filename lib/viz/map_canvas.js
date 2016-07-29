// Author: lixun910 at gmail.com

var _getColorPalette = function(config) {
  var gradientConfig = { 0.25: "rgb(0,0,255)", 0.55: "rgb(0,255,0)", 0.85: "yellow", 1.0: "rgb(255,0,0)"};
  var paletteCanvas = document.createElement('canvas');
  var paletteCtx = paletteCanvas.getContext('2d');

  paletteCanvas.width = 256;
  paletteCanvas.height = 1;

  var gradient = paletteCtx.createLinearGradient(0, 0, 256, 1);
  for (var key in gradientConfig) {
    gradient.addColorStop(key, gradientConfig[key]);
  }

  paletteCtx.fillStyle = gradient;
  paletteCtx.fillRect(0, 0, 256, 1);

  return paletteCtx.getImageData(0, 0, 256, 1).data;
};

var _getPointTemplate = function(radius, blurFactor) {
  radius = 30;
  blurFactor = 0.45;
  var tplCanvas = document.createElement('canvas');
  var tplCtx = tplCanvas.getContext('2d');
  var x = radius;
  var y = radius;
  tplCanvas.width = tplCanvas.height = radius*2;

  if (blurFactor == 1) {
    tplCtx.beginPath();
    tplCtx.arc(x, y, radius, 0, 2 * Math.PI, false);
    tplCtx.fillStyle = 'rgba(0,0,0,1)';
    tplCtx.fill();
  } else {
    var gradient = tplCtx.createRadialGradient(x, y, radius*blurFactor, x, y, radius);
    gradient.addColorStop(0, 'rgba(0,0,0,1)');
    gradient.addColorStop(1, 'rgba(0,0,0,0)');
    tplCtx.fillStyle = gradient;
    tplCtx.fillRect(0, 0, 2*radius, 2*radius);
  }
  return tplCanvas;
};

var Canvas2dRenderer = function(canvas) {
  var shadowCanvas = this.shadowCanvas = document.createElement('canvas');
  var renderBoundaries = this._renderBoundaries = [10000, 10000, 0, 0];

  this._width = canvas.width;
  this._height = canvas.height;
  shadowCanvas.width = this._width;
  shadowCanvas.height = this._height;

  this.shadowCtx = shadowCanvas.getContext('2d');
  this.ctx = canvas.getContext('2d');

  this._palette = _getColorPalette();
  this._templates = {};

    this._blur = 0.25;
    this._opacity = 0.1;
    this._maxOpacity = 0.5;
    this._minOpacity = 0;
    this._useGradientOpacity = true;
};

Canvas2dRenderer.prototype = {
  renderPartial: function(data) {
    this._drawAlpha(data);
    this._colorize();
  },
  renderAll: function(data) {
    // reset render boundaries
    this._clear();
    this.data = data; //
    this._drawAlpha(data);
    this._colorize();
  },
  setDimensions: function(width, height) {
    this._width = width;
    this._height = height;
    this.canvas.width = this.shadowCanvas.width = width;
    this.canvas.height = this.shadowCanvas.height = height;
  },
  _clear: function() {
    this.shadowCtx.clearRect(0, 0, this._width, this._height);
    this.ctx.clearRect(0, 0, this._width, this._height);
  },
  _drawAlpha: function(data) {
    var min = this._min = 0;//data.min;
    var max = this._max = 1;//data.max;

    var dataLen = data.length;

    // on a point basis?
    var blur = 1 - this._blur;

    while(dataLen--) {

      var point = data[dataLen];

      var x = point[0];
      var y = point[1];
      var radius = 20;//point.radius;
      // if value is bigger than max
      // use max as value
      var value = 1;//Math.min(value, max);
      var rectX = x - radius;
      var rectY = y - radius;
      var shadowCtx = this.shadowCtx;

      var tpl;
      if (!this._templates[radius]) {
        this._templates[radius] = tpl = _getPointTemplate(radius, blur);
      } else {
        tpl = this._templates[radius];
      }
      // value from minimum / value range
      // => [0, 1]
      shadowCtx.globalAlpha = 0.04;//(value-min)/(max-min);

      shadowCtx.drawImage(tpl, rectX, rectY);

      // update renderBoundaries
      if (rectX < this._renderBoundaries[0]) {
          this._renderBoundaries[0] = rectX;
        }
        if (rectY < this._renderBoundaries[1]) {
          this._renderBoundaries[1] = rectY;
        }
        if (rectX + 2*radius > this._renderBoundaries[2]) {
          this._renderBoundaries[2] = rectX + 2*radius;
        }
        if (rectY + 2*radius > this._renderBoundaries[3]) {
          this._renderBoundaries[3] = rectY + 2*radius;
        }

    }
  },
  _colorize: function() {
    var x = this._renderBoundaries[0];
    var y = this._renderBoundaries[1];
    var width = this._renderBoundaries[2] - x;
    var height = this._renderBoundaries[3] - y;
    var maxWidth = this._width;
    var maxHeight = this._height;
    var opacity = this._opacity;
    var maxOpacity = this._maxOpacity;
    var minOpacity = this._minOpacity;
    var useGradientOpacity = this._useGradientOpacity;

    if (x < 0) {
      x = 0;
    }
    if (y < 0) {
      y = 0;
    }
    if (x + width > maxWidth) {
      width = maxWidth - x;
    }
    if (y + height > maxHeight) {
      height = maxHeight - y;
    }

    var img = this.shadowCtx.getImageData(x, y, width, height);
    var imgData = img.data;
    var len = imgData.length;
    var palette = this._palette;


    for (var i = 3; i < len; i+= 4) {
      var alpha = imgData[i];
      var offset = alpha * 4;

      if (!offset) {
        continue;
      }

      var finalAlpha;
      if (opacity > 0) {
        finalAlpha = opacity;
      } else {
        if (alpha < maxOpacity) {
          if (alpha < minOpacity) {
            finalAlpha = minOpacity;
          } else {
            finalAlpha = alpha;
          }
        } else {
          finalAlpha = maxOpacity;
        }
      }

      imgData[i-3] = palette[offset];
      imgData[i-2] = palette[offset + 1];
      imgData[i-1] = palette[offset + 2];
      imgData[i] = useGradientOpacity ? palette[offset + 3] : finalAlpha;

    }

    img.data = imgData;
    this.ctx.putImageData(img, x, y);

    this._renderBoundaries = [1000, 1000, 0, 0];

  },
  getValueAt: function(point) {
    var value;
    var shadowCtx = this.shadowCtx;
    var img = shadowCtx.getImageData(point[0], point[1], 1, 1);
    var data = img.data[3];
    var max = this._max;
    var min = this._min;

    value = (Math.abs(max-min) * (data/255)) >> 0;

    return value;
  },
  getDataURL: function() {
    return this.canvas.toDataURL();
  }
};







var GRect = function( x0, y0, x1, y1 ) {
  this.x0 = x0 <= x1 ? x0 : x1;
  this.y0 = y0 <= y1 ? y0 : y1;
  this.x1 = x0 > x1 ? x0 : x1;
  this.y1 = y0 > y1 ? y0 : y1;
};

GRect.prototype = {
  Contains: function( x, y) {
    var flag = x >= this.x0 && x <= this.x1 &&
           y >= this.y0 && y <= this.y1;
    return flag;
  },
  GetW: function() {
    return this.x1 - this.x0;
  },
  GetH: function() {
    return this.y1 - this.y0;
  },
  Move: function(offsetX, offsetY) {
    this.x0 += offsetX;
    this.x1 += offsetX;
    this.y0 += offsetY;
    this.y1 += offsetY;
  },
};








/**
 * @class BaseCanvas
 *
 * @property canvas a HTML5 canvas represent the HTML object
 * @property buffer a in-memory buffer for drawing
 */
var BaseCanvas = function(canvas, params) {

  // properties
  this.canvas = canvas;

  // color scheme
  this.color_theme = undefined;
  // alpha: draw the map with transparency
  this.ALPHA = 0.8;
  // highlight alpha: when highlight, the alpha of background map
  this.HL_ALPHA = 0.4;
  // stroke width
  this.STROKE_WIDTH = 0.6;
  // stroke color
  this.STROKE_CLR = '#FFFFFF';
  // fill color
  this.FILL_CLR = '#006400';
  // hratio: horizontal ratio of map width / screen width
  this.hratio = 0.8;
  // vratio: verticle ratio of map height / screen height
  this.vratio = 0.8;
  // noForeground: don't draw the map , only for highlight
  this.noForeground = false;
  //this.heatmap = false;
  // canvas of the first?
  // should we create canvas and hlcanvas inside this class?
  this.canvas = canvas;
  //
  this.width = this.canvas.clientWidth;
  this.canvas.width = this.width;
  //
  this.height = this.canvas.clientHeight;
  this.canvas.height = this.height;
  //
  this.margin_left = this.width * (1-this.hratio)/2.0;
  //
  this.margin_top = this.height * (1-this.vratio)/2.0;
  //
  this.buffer = this._createBuffer();
};

BaseCanvas.prototype = {

  // create buffer canvas
  _createBuffer: function() {
    var _buffer = document.createElement("canvas");
    _buffer.width = this.width;
    _buffer.height = this.height;
    return _buffer;
  },

  // draw in-memory buffer content to screen (HTML5 Canvas)
  _buffer2Screen: function() {
    var ctx = this.canvas.getContext("2d");
    ctx.imageSmoothingEnabled= false;
    ctx.clearRect(0, 0, this.width, this.height);
    ctx.drawImage(this.buffer, 0, 0);
    return ctx;
  },

  // clear what's been drawn on this canvas
  _clear: function() {
    var ctx = this.canvas.getContext("2d");
    ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
  } ,

  // fade current canvas with a given alpha value (transparency)
  _fade: function(alpha) {
    if (alpha === undefined)
      alpha = 0.6;
    var ctx = this.canvas.getContext("2d");
    ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    ctx.globalAlpha = alpha;
    ctx.drawImage( this.buffer, 0, 0);
    ctx.globalAlpha = 1;
  },

  _resetDraw: function(e) {
      var ctx = this.canvas.getContext("2d");
      ctx.lineWidth = this.STROKE_WIDTH;
      ctx.imageSmoothingEnabled = false;
      ctx.globalAlpha = 1;
      ctx.clearRect(0, 0, this.width, this.height);
      if ( !this.noForeground) {
        ctx.drawImage( this.buffer, 0, 0);
      }
  },

  /**
   * @method DrawPolygons Public method for drawing polygon objects in buffer
   * @param ploygons Geojson formated polygons
   * @param colors A dictionary for color:[polygon_ids]
   */
  drawPolygons: function(ctx, polygons, colors) {
    if ( polygons == undefined || polygons.length == 0) {
      return;
    }
    if ( colors == undefined ) {
      for ( var i=0, n=polygons.length; i<n; i++ ) {
        var obj = polygons[i];
        if ( Array.isArray(obj[0][0])) {
          // multi parts
          for ( var j=0, nParts=obj.length; j<nParts; j++ ) {
            ctx.beginPath();
            ctx.moveTo(obj[j][0][0], obj[j][0][1]);
            for ( var k=1, nPoints=obj[j].length; k<nPoints; k++) {
              var x = obj[j][k][0],
                  y = obj[j][k][1];
              ctx.lineTo(x, y);
            }
            ctx.fill();
            ctx.stroke();
          }
        } else {
          ctx.beginPath();
          ctx.moveTo(obj[0][0], obj[0][1]);
          for ( var k=1, nPoints=obj.length; k<nPoints; k++) {
            var x = obj[k][0],
                y = obj[k][1];
            ctx.lineTo(x, y);
          }
          ctx.fill();
          ctx.stroke();
        }
      }
    } else {
      for ( var c in colors ) {
        if (c === "#ffffff")  {
          // don't draw any "White" polygons,
          continue;
        }
        var ids = colors[c];
        if (c != "dummy") {
          ctx.fillStyle = c;
        }
        for ( var i=0, n=ids.length; i< n; ++i) {
          var obj = polygons[ids[i]];
          if ( obj[0][0] && Array.isArray(obj[0][0])) {
            // multi parts
            for ( var j=0, nParts=obj.length; j<nParts; j++ ) {
              ctx.beginPath();
              ctx.moveTo(obj[j][0][0], obj[j][0][1]);
              for ( var k=1, nPoints=obj[j].length; k<nPoints; k++) {
                var x = obj[j][k][0],
                    y = obj[j][k][1];
                ctx.lineTo(x, y);
              }
              ctx.fill();
              ctx.stroke();
            }
          } else {
            ctx.beginPath();
            ctx.moveTo(obj[0][0], obj[0][1]);
            for ( var k=1, nPoints=obj.length; k<nPoints; k++) {
              var x = obj[k][0],
                  y = obj[k][1];
              ctx.lineTo(x, y);
            }
            ctx.fill();
            ctx.stroke();
          }
        }
      }
    }
  },

  drawLines: function( ctx, lines, colors ) {
    if ( lines == undefined || lines.length == 0 )
      return;
    if ( colors == undefined ) {
      ctx.beginPath();
      for ( var i=0, n=lines.length; i<n; i++ ) {
        var obj = lines[i];
        if ( Array.isArray(obj[0][0]) ) {
          // multi parts
          for ( var j=0, nParts=obj.length; j<nParts; j++ ) {
            ctx.moveTo(obj[j][0][0], obj[j][0][1]);
            for ( var k=1, nPoints=obj[j].length; k<nPoints; k++) {
              var x = obj[j][k][0], y = obj[j][k][1];
              ctx.lineTo(x, y);
            }
          }
        } else {
          ctx.moveTo(obj[0][0], obj[0][1]);
          for ( var k=1, nPoints=obj.length; k<nPoints; k++) {
            var x = obj[k][0], y = obj[k][1];
            ctx.lineTo(x, y);
          }
        }
      }
      ctx.stroke();
    } else {
      for ( var c in colors ) {
        if (c === "#ffffff") continue;
        var ids = colors[c];
        ctx.strokeStyle = c;
        for ( var i=0, n=ids.length; i< n; ++i) {
          ctx.beginPath();
          var obj = lines[ids[i]];
          if ( Array.isArray(obj[0][0]) ) {
            // multi parts
            for ( var j=0, nParts=obj.length; j<nParts; j++ ) {
              ctx.moveTo(obj[j][0][0], obj[j][0][1]);
              for ( var k=1, nPoints=obj[j].length; k<nPoints; k++) {
                var x = obj[j][k][0], y = obj[j][k][1];
                ctx.lineTo(x, y);
              }
            }
          } else {
            ctx.moveTo(obj[0][0], obj[0][1]);
            for ( var k=1, nPoints=obj.length; k<nPoints; k++) {
              var x = obj[k][0], y = obj[k][1];
              ctx.lineTo(x, y);
            }
          }
          ctx.stroke();
        }
      }
    }
  },

  drawPoints: function( ctx, points, colors ) {
    var end = 2*Math.PI,
        draw_dict = {},
        part, pt;

    if ( colors == undefined ) {
      for ( var i=0, n=points.length; i<n; i++ ) {
        pt = points[i];
        //ctx.fillRect(pt[0], pt[1], 3, 3);
        if (draw_dict[pt] === undefined) {
          ctx.beginPath();
          ctx.arc(pt[0], pt[1], 2, 0, end, true);
          ctx.stroke();
          ctx.fill();
          draw_dict[pt] = null;
        }
      }
    } else {
      for ( var c in colors ) {
        if (c === "#ffffff") continue;
        ctx.fillStyle = c;
        var ids = colors[c];
        for ( var i=0, n=ids.length; i< n; ++i) {
          pt = points[ids[i]];
          if (draw_dict[pt] === undefined) {
            //ctx.fillRect(pt[0], pt[1], 3, 3);
            ctx.beginPath();
            ctx.arc(pt[0], pt[1], 2, 0, end, true);
            ctx.stroke();
            ctx.fill();
            draw_dict[pt] = null;
          }
        }
      }
    }

  },

  // draw map to a canvas with colors/fillColor/strokeColor/lineWidth
  draw: function(map,  colors, fillColor, strokeColor, lineWidth) {
    fillColor = fillColor ? fillColor : this.FILL_CLR;
    lineWidth = lineWidth ? lineWidth: this.STROKE_WIDTH;
    strokeColor =  strokeColor ? strokeColor : this.STROKE_CLR;

    var shpType = map.shpType.toUpperCase(),
        ctx = this.buffer.getContext("2d");

    ctx.imageSmoothingEnabled= false;
    ctx.lineWidth = this.STROKE_WIDTH;
    ctx.globalAlpha = this.ALPHA;

    if (shpType === "POLYLINE" || shpType === "LINESTRING" || shpType === "LINE") {
      ctx.strokeStyle = fillColor;
      ctx.lineWidth = lineWidth;
      this.drawLines( ctx, map.screenObjects, colors) ;

    } else if (shpType === "POLYGON" || shpType === "MULTIPOLYGON") {
      ctx.strokeStyle = strokeColor;
      ctx.fillStyle = fillColor;
      this.drawPolygons( ctx, map.screenObjects, colors) ;

    } else if (shpType === "POINT" || shpType === "MULTIPOINT") {
      ctx.strokeStyle = strokeColor;
      ctx.fillStyle = fillColor;

      /*
      if ( this.heatmap == true) {
        // test heatmap
        var hm = new Canvas2dRenderer(this.buffer);
        hm.renderAll(map.screenObjects);
        //this.heatmap = false;
      }
      */

      this.drawPoints( ctx, map.screenObjects, colors) ;
    }
    // reset globalAlpha
    ctx.globalAlpha = 1;
  },
};

/**
 * @class MapCanvas: BaseCanvas
 *
 * @param map An instance of mapdata e.g. ShpMap or JsonMap
 * screenToMap() mapToScreen() getBBox() fitScreen()
 */
MapCanvas = function(map, canvas, params) {
  BaseCanvas.call(this, canvas);

  this.updateParameters(params);

  // draw map on MapCanvas
  this.map = map;
  this.shpType = this.map.shpType.toUpperCase();
  this.map.fitScreen(this.width, this.height, this.margin_left, this.margin_top);

  this.draw(this.map, this.color_theme);

  if ( !this.noForeground ) {
    this._buffer2Screen();
  }
};
MapCanvas.prototype = Object.create(BaseCanvas.prototype);
MapCanvas.prototype.constructor = MapCanvas;

MapCanvas.prototype.GetMap = function() { return this.map; };

MapCanvas.prototype.updateParameters = function(params) {
  if (params == undefined)
    return;
  // color_theme  --  {'#CCCC':[ids], ...}
  if ('color_theme' in params) this.color_theme = params['color_theme'];

  if ('transparency' in params) this.ALPHA = params['transparency'];
  else if ('alpha' in params) this.ALPHA = params['alpha'];

  if ('stroke_width' in params) this.STROKE_WIDTH= params['stroke_width'];

  if ('stroke_color' in params) this.STROKE_CLR = params['stroke_color'];
  else if ('stroke_clr' in params) this.STROKE_CLR = params['stroke_clr'];

  if ('fill_color' in params) this.FILL_CLR = params['fill_color'];
  else if ('fill_clr' in params) this.FILL_CLR = params['fill_clr'];

  if ('horizontal_ratio' in params) this.hratio = params['horizontal_ratio'];
  if ('vertical_ratio' in params) this.vratio = params['vertical_ratio'];
  if ('noForeground' in params) this.ALPHA = params['noForeground'];

  if ('offsetX' in params) this.offsetX = params.offsetX;
  if ('offsetY' in params) this.offsetY = params.offsetY;

  if ('heatmap' in params) {
    if (this.heatmap == true) this.heatmap = false;
    else if (this.heatmap == false) this.heatmap = true;
  }
};

MapCanvas.prototype.updateExtent = function(map) {
  this.map.updateExtent(map);
  this.update();
};

MapCanvas.prototype.update = function(params, bForceUpdate) {
  if (bForceUpdate!=undefined) {
    this.map.screenWidth = null;
    this.map.screenHeight = null;
  }
  this.updateParameters(params);

  var newWidth = this.canvas.parentNode.clientWidth,
      newHeight = this.canvas.parentNode.clientHeight;
  this.canvas.width = newWidth;
  this.canvas.height = newHeight;

  this._clear();

  this.margin_left = newWidth * (1-this.hratio)/2.0;
  this.margin_top = newHeight * (1-this.vratio)/2.0;

  this.map.fitScreen(newWidth, newHeight, this.margin_left, this.margin_top, this.offsetX, this.offsetY);

  this.buffer = null; // gc
  this.buffer = this._createBuffer();

  this.draw(this.map, this.color_theme);

  if ( !this.noForeground ) {
    this._buffer2Screen();
  }
  this.offsetX = 0;
  this.offsetY = 0;
};

MapCanvas.prototype.updateColor = function() {
  this.field = _field;
  this.bins = _bins;
  this.colors = _colors;
  this.legend_txts = _legend_txts;

  if ( !this.noForeground ) {
    this.color_theme  = color_theme;
    this.buffer = this._createBuffer();
    this.draw(this.map, this.color_theme);
    if ( !this.noForeground ) {
      this._buffer2Screen();
    }
  }
};

MapCanvas.prototype.move = function(offsetX, offsetY) {
  var ctx = this.canvas.getContext("2d");
  ctx.imageSmoothingEnabled= false;
  ctx.clearRect(0, 0, this.width, this.height);
  ctx.drawImage(this.buffer, offsetX, offsetY);
};


MapCanvas.prototype.clean = function() {
  // called when zoom/move leafletmap
  this._clear();
};


/**
 * @class HighlightCanvas : BaseCanvas
 *
 * @param
 */
HighlightCanvas = function(canvas, params) {
  BaseCanvas.call(this, canvas);

  // highlight stroke color
  this.HL_STROKE_CLR = '#CCCCCC';
  // highlight fill color
  this.HL_FILL_CLR = '#FFFF00';

  this.selected = [];
  this.brushRect = undefined; //GRect object
  this.isBrushing = false;
  this.startX = -1;
  this.startY = -1;
  this.currentX = -1;
  this.currentY = -1;
  this.startPX = undefined;
  this.startPY = undefined;
  this.isMouseDown = false;
  this.isMouseUp = false;
  this.isMouseMove = false;
  this.isKeyDown = false;

  this.map = null;
  this.mapCanvas = null;

  this.init();
};

HighlightCanvas.prototype = Object.create(BaseCanvas.prototype);
HighlightCanvas.prototype.constructor = HighlightCanvas;


HighlightCanvas.prototype.UpdateMap = function(mapCanvas) {
  this.map = mapCanvas.GetMap();
  this.mapCanvas = mapCanvas;
};

HighlightCanvas.prototype.CheckBrush = function(x, y) {
  if (this.brushRect == undefined ||
      (this.brushRect && !this.brushRect.Contains(x, y)) ) {
    this.brushRect = undefined;
    this.isBrushing = false;
  }
  if (this.brushRect && this.brushRect.Contains(x, y) ) {
    this.isBrushing = true;
  }
};

HighlightCanvas.prototype.triggerLink = function(select_ids, highlight_range) {
  // trigger to brush/link
  if (this.map == null)
    return;

  var hl = {};
  if ( localStorage["HL_IDS"] ){
    hl = JSON.parse(localStorage["HL_IDS"]);
  }
  hl[this.map.name] = select_ids;//this.selected;
  localStorage["HL_IDS"] = JSON.stringify(hl);

  var hl_map = {};
  if ( localStorage["HL_MAP"] ){
    hl_map = JSON.parse(localStorage["HL_MAP"]);
  }
  hl_map[this.uuid] = highlight_range;
  localStorage["HL_MAP"] = JSON.stringify(hl_map);
};

HighlightCanvas.prototype.drawSelect = function(ids, ctx, color_theme, fill_color, stroke_color) {
  if (this.map == null)
    return;

  var color_dict = {};

  if ( color_theme ) {
    // filter: remove dup ids
    var ids_dict = {};
    for ( var i=0, n=ids.length; i<n; i++ ) {
      ids_dict[ids[i]] = 1;
    }
    for ( var c in color_theme ) {
      var orig_ids = color_theme[c];
      var new_ids = [];
      for (var i in orig_ids ) {
        var oid = orig_ids[i];
        if ( ids_dict[oid] == 1) {
          new_ids.push(oid);
        }
      }
      color_dict[c] = new_ids;
    }
  } else {
    // draw all ids using default uniform fill color
    fill_color = fill_color === undefined ? this.FILL_CLR : fill_color;
    color_dict[fill_color] = ids;
  }
  var screenObjs = this.map.screenObjects;
  var shpType = this.map.shpType.toUpperCase();

  if (shpType == "POLYGON" || shpType == "MULTIPOLYGON") {
    this.drawPolygons( ctx, screenObjs, color_dict);
  } else if (shpType == "POINT" || shpType == "MULTIPOINT") {
    this.drawPoints( ctx, screenObjs, color_dict );
  } else if (shpType == "LINESTRING" || shpType == "LINE") {
    this.drawLines( ctx, screenObjs, color_dict );
  }
};

HighlightCanvas.prototype.highlight = function(ids, ctx, nolinking) {
  if ( ids == undefined )
    return;

  if ( ctx == undefined) {
    ctx = this.canvas.getContext("2d");
    ctx.lineWidth = this.STROKE_WIDTH;
    ctx.imageSmoothingEnabled = false;
    ctx.clearRect(0, 0, this.width, this.height);
    if (!this.noForeground) {
      if ( ids && ids.length > 0 ) {
        ctx.globalAlpha = this.HL_ALPHA;
      }
      ctx.drawImage( this.buffer, 0, 0);
      ctx.globalAlpha = 1;
    }
  }

  if (ids.length > 0) {
    ctx.lineWidth = this.STROKE_WIDTH;
    ctx.strokeStyle = this.STROKE_CLR;
    this.drawSelect( ids, ctx, this.mapCanvas.color_theme, this.mapCanvas.FILL_CLR);

    this.selected = ids;
    if ( nolinking == false) {
      this.triggerLink(ids);
    }
  }
  return ctx;
};

HighlightCanvas.prototype.highlightExt = function(ids, extent, linking) {
  if (this.map == null)
    return;

  if ( ids.length == 0 && extent == undefined )
    return;

  var x0 = extent[0],
      y0 = extent[1],
      x1 = extent[2],
      y1 = extent[3];
  var pt0 = this.map.mapToScreen(x0, y0),
      pt1 = this.map.mapToScreen(x1, y1);
  var startX = pt0[0],
      startY = pt0[1],
      w = pt1[0] - startX,
      h = pt1[1] - startY;
  if (w == 0 && h == 0)
    return;
  this.selected = [];

  var hdraw = [],
      ddraw = [];
  var minPX = Math.min( pt0[0], pt1[0]),
      maxPX = Math.max( pt0[0], pt1[0]),
      minPY = Math.min( pt0[1], pt1[1]),
      maxPY = Math.max( pt0[1], pt1[1]);

  for ( var i=0, n=this.map.centroids.length; i<n; ++i) {
    var pt = this.map.centroids[i],
        inside = false;
    if ( pt[0] >= x0 && pt[0] <= x1
         && pt[1] >= y0 && pt[1] <= y1 ) {
      this.selected.push(i);
      inside = true;
    }

    if (this.shpType != "POINT" && this.shpType != "MULTIPOINT") {
      // fine polygons on border of rect
      var bx = this.map.bbox[i];
      if (bx === undefined) continue;
      if (bx[0] > x1 || bx[1] < x0 || bx[2] > y1 || bx[3] < y0) {

      } else if (x0 < bx[0] && bx[1] < x1 && y0 < bx[2] && bx[3] < y1) {

      } else {
        if (inside) {
          // draw it with highligh
          hdraw.push(i);
        } else {
          // erase draw
          ddraw.push(i);
        }
      }
    }
  }
  var ctx = this.canvas.getContext("2d");
  ctx.clearRect(0, 0, this.width, this.height);

  if ( this.selected.length > 0 ) {
    // fade the current canvas-es
    this.mapCanvas._fade();
    // highlight ext area
    ctx.globalAlpha = 1;
    ctx.save(); // save for clipping
    ctx.beginPath(); // specify area for clipping
    ctx.rect( startX, startY, w, h);
    ctx.closePath();
    ctx.clip(); // do clipping
    // draw the main map canvas in this clipping area
    ctx.drawImage( this.mapCanvas.buffer, 0, 0);
    ctx.restore(); // restore from clipping, and draw reset

    if (this.map.shpType != "POINT" && this.map.shpType != "MULTIPOINT") {
      // for polygons and lines
      if ( hdraw.length + ddraw.length == 0)
        return false;
      // erase those out of highlight area
      ctx.lineWidth = this.STROKE_WIDTH;
      ctx.fillStyle = "rgba(0,0,0,1)";
      ctx.globalCompositeOperation = "destination-out";
      this.drawSelect(ddraw, ctx);
      this.drawSelect(hdraw, ctx);

      // draw those not completed objects again
      ctx.globalCompositeOperation = "source-over";
      ctx.globalAlpha = this.mapCanvas.ALPHA;
      ctx.strokeStyle = this.mapCanvas.STROKE_CLR;
      ctx.fillStyle = this.mapCanvas.FILL_CLR;
      this.drawSelect(hdraw, ctx, this.mapCanvas.color_theme, this.mapCanvas.FILL_CLR);
    }
  } else {
    ctx.drawImage( this.buffer, 0, 0);
  }
  // draw selection rectangle
  ctx.beginPath();
  ctx.strokeStyle = "#000000";
  ctx.rect(startX, startY, w, h);
  ctx.stroke();
  ctx.closePath();
  // restore stroke color
  ctx.strokeStyle = this.STROKE_CLR;

  if (linking) {
    var hl_range = [x0, y0, x1, y1];
    this.triggerLink(this.selected, hl_range);
  }
  return true;
},

HighlightCanvas.prototype.init = function () {
  var self = this;

  function OnMouseDown(evt) {
    var obj = evt.target; // canvasObj
    //var x = evt.pageX, y = evt.pageY;
    var x, y;
    if (evt.type.indexOf("touch")>=0) {
      if (evt.touches.length === 1) {
        x = evt.targetTouches[0].pageX;
        y = evt.targetTouches[0].pageY - 48;
      } else {
        return;
      }
    } else {
      x = evt.offsetX;
      y = evt.offsetY;
    }
    self.isMouseDown = true;
    self.startX = x;
    self.startY = y;
    self.CheckBrush(x,y);
  }

  function OnMouseMove(evt) {
    var obj = evt.target;
    if ( self.isMouseDown == true ) {
      if (evt.type.indexOf("touch")>=0) {
        if (evt.touches.length === 1) {
          self.currentX = evt.targetTouches[0].pageX;
          self.currentY = evt.targetTouches[0].pageY -48;
        } else {
          return;
        }
      } else {
        self.currentX = evt.offsetX;
        self.currentY = evt.offsetY;
      }

      var startX = self.startX,
          startY = self.startY,
          currentX = self.currentX,
          currentY = self.currentY;

      var x0 = startX >= currentX ? currentX : startX;
      var x1 = startX < currentX ? currentX : startX;
      var y0 = startY >= currentY ? currentY : startY;
      var y1 = startY < currentY ? currentY : startY;

      if ( self.isBrushing == true ) {
        var offsetX = self.currentX - startX,
            offsetY = self.currentY - startY;
        x0 = self.brushRect.x0 + offsetX;
        x1 = self.brushRect.x1 + offsetX;
        y0 = self.brushRect.y0 + offsetY;
        y1 = self.brushRect.y1 + offsetY;
      }
      var pt0 = self.map.screenToMap(x0, y0),
          pt1 = self.map.screenToMap(x1, y1);

      x0 = pt0[0] <= pt1[0] ? pt0[0] : pt1[0];
      x1 = pt0[0] > pt1[0] ? pt0[0] : pt1[0];
      y0 = pt0[1] <= pt1[1] ? pt0[1] : pt1[1];
      y1 = pt0[1] > pt1[1] ? pt0[1] : pt1[1];

      self.highlightExt([], [x0,y0,x1,y1], true);
    }
    evt.preventDefault();
  }

  function OnMouseUp(evt) {
    var obj = evt.target;
    if ( self.isMouseDown == true) {
      var x, y;
      if (evt.type.indexOf("touch")>=0) {
        x = self.currentX;
        y = self.currentY;
      } else {
        x = evt.offsetX;
        y = evt.offsetY;
      }
      if ( self.startX == x && self.startY == y ) {
        // point select
        self._clear(); // clear it self
        var pt = self.map.screenToMap(x, y);
        x = pt[0];
        y = pt[1];
        for ( var i=0, n=self.map.bbox.length; i<n; i++ ) {
          var box = self.map.bbox[i];
          if ( x > box[0] && x < box[1] &&
               y > box[2] && y < box[3] ) {
            self.isKeyDown = false;
            self.isBrushing = false;
            self.brushRect = undefined;
            self.highlight([i]);
            self.isMouseDown = false;
            return;
          }
        }
        self.mapCanvas._resetDraw();
        self.triggerLink([], undefined);

      } else if ( self.isBrushing == false) {
        // setup brushing box
        self.brushRect = new GRect(self.startX, self.startY, x, y);
      }
    }
    self.isMouseDown = false;
    evt.preventDefault();
  }

  this.canvas.addEventListener('touchmove', OnMouseMove, false);
  this.canvas.addEventListener('touchstart', OnMouseDown, false);
  this.canvas.addEventListener('touchend', OnMouseUp, false);

  this.canvas.addEventListener('mousemove', OnMouseMove, false);
  this.canvas.addEventListener('mousedown', OnMouseDown, false);
  this.canvas.addEventListener('mouseup', OnMouseUp, false);
};

module.exports = {
  MapCanvas : MapCanvas,
  HighlightCanvas : HighlightCanvas
};
