import d3 from 'd3';
import React from 'react';
import RFD from 'react-faux-dom';
import BoundedSVG from './bounded-svg.js';

import { Im, generateTranslateString } from './utilities.js';

export default class Treemap extends BoundedSVG {
  static get defaultProps() {
    return Im.extend(super.defaultProps, {
      data : [],
      dataProcessor : data => data,
      valueFn : d => d.value,
      colourScale : d => 'red',
      dataSort : (a,b) => 0,
      spacing : 1,
      valueFormat : v => v,
      enterFn : d => d,
      leaveFn : d => d
    });
  }
  render() {
    var el = RFD.createElement('g');
    var sel = d3.select(el);

    sel.attr('transform', generateTranslateString(this.margins.left, this.margins.top));

    var treemap = d3.layout.treemap()
      .value(this.props.valueFn)
      .size([this.widthSpan, this.heightSpan])
      .sort(this.props.dataSort);

    // extend copies the array first
    var data = this.props.dataProcessor(this.props.data);

    var nodes = sel.datum(data).selectAll('.node')
      .data(treemap.nodes);
    var nodeEnter = nodes.enter().append('g')
      .classed('node', true)
      .on('mouseenter', this.props.enterFn)
      .on('mouseleave', this.props.leaveFn)
      .on('touchstart', this.props.enterFn)
      .attr({
        transform : d => generateTranslateString(d.x, d.y)
      });

    var self = this;
    nodeEnter.each(function(d) {
      var sel = d3.select(this);
      sel.append('rect')
        .attr({
          fill : self.props.colourScale,
          width : d => Math.max(0, d.dx - self.props.spacing),
          height : d => Math.max(0, d.dy - self.props.spacing)
        });
      if(d.applicants && d.hideText !== true && d.dx > 50 && d.dy > 30) {
        var txt = sel.append('text')
          .classed('node-label', true)
          .attr({
            'font-size' : 14,
            x : d.dx / 2,
            y : d.dy / 2 - 3,
            'text-anchor' : 'middle'
          });
        txt.append('tspan')
          .classed('node-country-name', true)
          .text(d.countryName);
        txt.append('tspan')
          .classed('node-country-value', true)
          .text(self.props.valueFormat(d.applicants))
          .attr({
            x : d.dx / 2, dy: 16
          });
        }
    });

    return el.toReact();
  }
}
