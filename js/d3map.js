import d3 from 'd3';
import React from 'react';
import RFD from 'react-faux-dom';
import SVGComponent from './svg-component.js';

import '../node_modules/d3-geo-projection/d3.geo.projection.js';

import topojson from 'topojson';

class MapLayer extends SVGComponent {
  static get defaultProps() {
    return {
      elementClass : 'item'
    };
  }
  render() {
    var el = RFD.createElement('g');
    var sel = d3.select(el);

    var pathFn = d3.geo.path()
      .projection(this.props.projection);

    var join = sel.selectAll(`.${this.props.elementClass}`)
      .data(this.props.data);
    join.enter().append('svg:path')
      .classed(this.props.elementClass, true);
    join.exit().remove();

    join.attr(this.props.attrs);
    join.on(this.props.handlers);

    var alter = this.props.duration ? join.transition().duration(this.props.duration) : join;
    alter.attr('d', pathFn);

    return el.toReact();
  }
}

/**
 * D3Map component
 *
 * A basic d3 map, meant to work with topojson data
 *
 * @prop {array} layers - the geodata; array should be structured as:
 *       { name : STRING, data : TOPOJSON ARRAY }
 * @prop {object} layerAttrs - a keyed list of attributes for each
 *       layer; layers should be referenced with their name as the key
 * @prop {object} layerHandlers - a keyed list of event handlers for
 *       each layer; layers referenced with their name as the key
 * @prop {number|boolean} - duration broken for now...
 */
export default class D3Map extends SVGComponent {
  static get defaultProps() {
    return {
      duration : null,
      projection : d3.geo.robinson().scale(100),
      layerAttrs : {},
      layerHandlers : {}
    };
  }
  render() {
    var layers = this.props.layers;
    var projection = this.props.projection.translate([595/2,this.props.height/2]);

    var layerElements = layers.map((layer) => {
      var name = layer.name;
      var props = {
        elementClass : name,
        duration : this.props.duration,
        projection : projection,
        data : layer.data,
        attrs : this.props.layerAttrs[name] || {},
        handlers : this.props.layerHandlers[name] || {},
        key : name
      };

      return (<MapLayer {...props} />);
    });

    return(<g>
      {layerElements}
    </g>)
  }
}
