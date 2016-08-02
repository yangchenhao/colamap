// Author: lixun910 at gmail.com

/**
 * This is the PanControl class,
 *
 * @class PanControl
 * @constructor
 *
 * @param {string} source: id The id of a div
 */
var TableControl = L.Control.extend({
  options: {
    position: 'bottomright'
  },

  initialize : function(mapList) {
    this.mapList = mapList;
  },

  onAdd: function (map) {
    var self = this;

    // create the control container with a particular class name
    var container = L.DomUtil.create('div', 'my-custom-control');

    // ... initialize other DOM elements, add listeners, etc.
    container.setAttribute('style', 'padding-left: 2px; width:24px;height:24px;background:blue;background: url(https://cdn3.iconfinder.com/data/icons/gis/pan.png) no-repeat center;')

    // mouse events
    container.onclick = function(e) {
      alert("ho");
    };

    return container;
  },

  OnRemove : function() {

  },

  Update : function(mapList) {

  }
});

module.exports = TableControl;
