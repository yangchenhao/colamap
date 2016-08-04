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
    position: 'topleft',
    title : 'table'
  },

  initialize : function(mapList) {
    this.mapList = mapList;
  },

  onAdd: function (map) {
    var self = this;

    // create the control container with a particular class name
		var container = L.DomUtil.create('div', 'leaflet-bar');
		var wrapper = document.createElement('div');
		container.appendChild(wrapper);
		var link = L.DomUtil.create('a', '', wrapper);
		link.href = '#';
		link.style.width = '26px';
		link.style.height = '26px';
		link.style.backgroundImage = 'url(' + this._icon + ')';
		link.style.backgroundSize = '18px 18px';
		link.style.backgroundRepeat = 'no-repeat';
    //link.style.filter = "opacity(50%)";
    //link.style.WebkitFilter = "opacity(50%)";
		link.title = this.options.title;

    this._link = link;

    // mouse events
    container.onclick = function(e) {
      alert("ho");
    };

    return container;
  },

  OnRemove : function() {

  },

  Update : function(mapList) {

  },

  _icon : "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABQAAAAUCAYAAACNiR0NAAAABGdBTUEAALGPC/xhBQAAACBjSFJNAAB6JgAAgIQAAPoAAACA6AAAdTAAAOpgAAA6mAAAF3CculE8AAAACXBIWXMAAAsTAAALEwEAmpwYAAAB1WlUWHRYTUw6Y29tLmFkb2JlLnhtcAAAAAAAPHg6eG1wbWV0YSB4bWxuczp4PSJhZG9iZTpuczptZXRhLyIgeDp4bXB0az0iWE1QIENvcmUgNS40LjAiPgogICA8cmRmOlJERiB4bWxuczpyZGY9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkvMDIvMjItcmRmLXN5bnRheC1ucyMiPgogICAgICA8cmRmOkRlc2NyaXB0aW9uIHJkZjphYm91dD0iIgogICAgICAgICAgICB4bWxuczp0aWZmPSJodHRwOi8vbnMuYWRvYmUuY29tL3RpZmYvMS4wLyI+CiAgICAgICAgIDx0aWZmOkNvbXByZXNzaW9uPjE8L3RpZmY6Q29tcHJlc3Npb24+CiAgICAgICAgIDx0aWZmOk9yaWVudGF0aW9uPjE8L3RpZmY6T3JpZW50YXRpb24+CiAgICAgICAgIDx0aWZmOlBob3RvbWV0cmljSW50ZXJwcmV0YXRpb24+MjwvdGlmZjpQaG90b21ldHJpY0ludGVycHJldGF0aW9uPgogICAgICA8L3JkZjpEZXNjcmlwdGlvbj4KICAgPC9yZGY6UkRGPgo8L3g6eG1wbWV0YT4KAtiABQAAAhNJREFUOBGtlD1PlUEQRldRAUUhIFpgIjSKiSS0lBR2hsaQYGViY2JELWxpbGi0tvDfWFnwIyDRBBISo/FbUM/Ze5/XzQ1W+iSH3Z1378zszC6llHIM/pvi7DQeZ+EE/ALt3+EQRiG2g77d/drUcdiDXRc6ULfhFmzBGHyGqzABr+EMfIWLoP0VnIIfMAnjsAadHjO72a16kxsMDwdsc6w3B2ye5gXU5ExXeTSzUO043DMVj6jOwck6KyXfzFDVEsShUb5Vcylf+qNra6Zi89gGV9lveVLPWlA/arBearo31LX1VNrMbArMNnO/X4A0s2uKHb0LC3AWPoHFN4hH0okZ2ZQr8Bzaplimn9Bpndlqf+U1USvwpM7+1MuAz/q23BCD2pQh7W0NU4fUyIixJfrfbPqqikMXNka1YzvPt6Ns9Yf+aR2moxnNNNl6gZXfYsvot5yka4oFfwRLkKbMM7c+M9A2Rbtd9h7mpXg/E4BpKQ/gHtiQWdDBHXgK2i6Dz2sZbIDzS+B1ugYvoZ42nXLh4/YCb4PaAzPUtgPqDbxv0PYBzLTWNjW0BmaicplHmHss1T7HwadniaozN8aho5HVx95QI/uslBddvQOfn8rT22duQtVpjuyx7sMiGFGnXmJfiQU3a/fYoOuwAW1TzrOutyOp+iO7ZwCjmXH+EeRZudcfaTeA+5R738I2VMVp1v80/gbDnG5rsPZh3wAAAABJRU5ErkJggg=="
});

module.exports = TableControl;
