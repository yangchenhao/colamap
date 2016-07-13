// Author: lixun910 at gmail.com

var assert = require('chai').assert,
    should = require('chai').should(),
    expect = require('chai').expect,
    fs = require('fs'),
    path = require('path'),
    L = require('leaflet'),
    LeafletMap = require('leaflet-map'),
    MapCola = require('../lib/index.js').MapCola;


var mapCola = new MapCola();

describe("#MapCola function test", function() {
  it('MapCola print()', function(){
    mapCola.print().should.equal('foo');
  });
});

describe("#MapCola.GeoJSON", function() {
  it('Read into geojson file ( data/nat.json )', function(done){
    assert.doesNotThrow (function() {
      fs.readFile(path.join(__dirname, "./data/nat.json"),
        function(err, data) {
          data = JSON.parse(data);
          var map_data = new MapCola.GeoJSON("NAT", data);

          map_data.name.should.equal('NAT');
          map_data.n.should.equal(3085);

          done();
        });
    });
  });

  it('Read into ESRI Shapefile ( data/nat.shp )', function(done){
    assert.doesNotThrow (function() {
      fs.readFile(path.join(__dirname, "./data/nat.shp"),
        function(err, stream) {
          var shp_reader = new MapCola.ShpReader(stream);
          expect(shp_reader.getCounts().shapeCount).equal(3085);
          done();
        });
    });
  });
});
