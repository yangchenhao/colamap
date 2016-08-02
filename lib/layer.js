// Author: lixun910 at gmail.com

/**
 * This is the LayerControl class,
 *
 * @class LayerControl
 * @constructor
 *
 * @param {string} source: id The id of a div
 */
var LayerControl = L.Control.extend({
  options: {
      position: 'topright'
  },

  initialize : function(mapList) {
    this.mapList = mapList;
  },

  onAdd: function (map) {
    var self = this;

    // create the control container with a particular class name
    var container = L.DomUtil.create('div', 'my-custom-control');

    // ... initialize other DOM elements, add listeners, etc.
    container.setAttribute('style', 'width:200px;height:200px;background:red;')

    // mouse events
    container.onclick = function(e) {
      self.mapList;
      alert("ho");
    };
    return container;
  }
});
