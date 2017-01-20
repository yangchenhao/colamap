// Author: lixun910 at gmail.com

/**
 * This is the PanControl class,
 *
 * @class PanControl
 * @constructor
 *
 * @param {string} source: id The id of a div
 */
var MapButtons = L.Control.extend({
  options: {
    position: 'topleft',
    title : 'pan map'
  },

  initialize : function(mapList, hlCanvasEl, containerEl) {
    this.mapList = mapList;
    this.hlCanvasEl = hlCanvasEl;
    this.containerEl = containerEl;
  },

  isPan : false,

  onAdd: function (leafletMap) {
    var self = this;

    // create the control container with a particular class name
		var container = L.DomUtil.create('div', 'leaflet-bar');
		var wrapper = document.createElement('div');
		container.appendChild(wrapper);
		var link = L.DomUtil.create('a', '', wrapper);
		link.href = '#';
		link.style.width = '26px';
		link.style.height = '26px';
		link.style.backgroundImage = 'url(' + this._icon_pan + ')';
		link.style.backgroundSize = '18px 18px';
		link.style.backgroundRepeat = 'no-repeat';
    link.style.filter = "opacity(50%)";
    link.style.WebkitFilter = "opacity(50%)";
		link.title = this.options.title;

    this._link = link;

    // mouse events
    container.onclick = function(e) {
      if (self.isPan) {
        leafletMap.dragging.disable();
        self.hlCanvasEl.style.pointerEvents = 'auto';
        self.containerEl.style.cursor =  'default';
        self.isPan = false;
        self._link.style.filter = "opacity(50%)";
        self._link.style.WebkitFilter = "opacity(50%)";

      } else {
        leafletMap.dragging.enable();
        self.hlCanvasEl.style.pointerEvents = 'none';
        self.containerEl.style.cursor =  'move';
        self.isPan = true;
        self._link.style.filter = "opacity(100%)";
        self._link.style.WebkitFilter = "opacity(100%)";
      }
      //leafletMap.touchZoom.enable();
      //leafletMap.doubleClickZoom.enable();
      //leafletMap.scrollWheelZoom.enable();
      //leafletMap.boxZoom.enable();
      //leafletMap.keyboard.enable();
      //if (leafletMap.tap) leafletMap.tap.enable();
    };

    return container;
  },

  _icon_pan : "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABoAAAAaCAYAAACpSkzOAAAABGdBTUEAALGPC/xhBQAAACBjSFJNAAB6JgAAgIQAAPoAAACA6AAAdTAAAOpgAAA6mAAAF3CculE8AAAACXBIWXMAAAsTAAALEwEAmpwYAAAB1WlUWHRYTUw6Y29tLmFkb2JlLnhtcAAAAAAAPHg6eG1wbWV0YSB4bWxuczp4PSJhZG9iZTpuczptZXRhLyIgeDp4bXB0az0iWE1QIENvcmUgNS40LjAiPgogICA8cmRmOlJERiB4bWxuczpyZGY9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkvMDIvMjItcmRmLXN5bnRheC1ucyMiPgogICAgICA8cmRmOkRlc2NyaXB0aW9uIHJkZjphYm91dD0iIgogICAgICAgICAgICB4bWxuczp0aWZmPSJodHRwOi8vbnMuYWRvYmUuY29tL3RpZmYvMS4wLyI+CiAgICAgICAgIDx0aWZmOkNvbXByZXNzaW9uPjE8L3RpZmY6Q29tcHJlc3Npb24+CiAgICAgICAgIDx0aWZmOk9yaWVudGF0aW9uPjE8L3RpZmY6T3JpZW50YXRpb24+CiAgICAgICAgIDx0aWZmOlBob3RvbWV0cmljSW50ZXJwcmV0YXRpb24+MjwvdGlmZjpQaG90b21ldHJpY0ludGVycHJldGF0aW9uPgogICAgICA8L3JkZjpEZXNjcmlwdGlvbj4KICAgPC9yZGY6UkRGPgo8L3g6eG1wbWV0YT4KAtiABQAAAqpJREFUSA2llTlrVVEURp/GCYciRAQrK2cRRxRR/4uNhYUgIv4ACwtBjWBjKdpaKAiKlZ1DIQqiWFgYFRRxnse1kvtddm4SeIkb1tvn7LOHs889975er3+Z07iuQK9qxgP9h/fnObdxW4t+Dh9hV2PLWjOducqu15PCIn8bPqB3gzJ7TM38NwksMgIW+d7g2GLpLL6YpiezivstxiY+C0/gLQyDNjeQ5zejYrXQPpIdBRM9BJ/RQjgAhyFSY2KbUptsqp25czv6BEMwmRib59qudxPq8Keh7i5Ho85GYqu3zhjjf8O4YrWQCzosg6Xg+UcMVr6Bl+EnfAbFmIgxg7ActNf8THu97GoN4zdwB7Jz1xynw+2M90JEuz7p8CrjH7ATlORuW9yA8QW4q2PQFROmWNa6c+0HwRxemD2gtMe4kckI6HADNjXsQG+FRaCY2CB3nyILGG8GfbfAOrgE5noPKTba2qNmwXPXocsJbEq7M8Y5kiOMu/7OvzT2V+hBd+aDvQarwXfjAdyDJWDAPLgJivN0kgtyG9sV8OG75tfCb+I2UK7Du9FR83MGbaLHsLKxVWWSoL2Oq5+3Nl+Si3WhHscpFix2vziYsN66sjQ67K7ZvTnOF8cBj86W1b/gENh6Ws2uDRTlOAzBfieIdv0Ux5fBo/f2Kck9NuPXnU0lOitegJdgQospuRRjs/G/bc4kcNmHmw4yV2uzW0V/O/bSJNbLpE86nizHhC50tmBuVBJ4AxfDV8h7ZMH5YGfG6RtJnswnFGoXGKSINm+P79oWsJjfO/8M74KvhsVTTC19Sz2Ck0QZ/Axeg38TT0HbBYjUrmLrS7cPE+/TYGLxuXSLVF+Wpy81wTDhKVZfxvouTr9CiaiJ/O6dK2u5fcX0f8PaWTLVDcQ2qf4HbeuX7GYyfmkAAAAASUVORK5CYII="
});


module.exports = MapButtons;
