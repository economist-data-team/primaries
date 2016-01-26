import React from 'react';
import Chart from './chart.js';
import { generateTranslateString } from './utilities.js';

import Axis from './axis.js'

export default class BarChart extends Chart {
  update(props) {
    // can't do anything without data
    if(!props.data) { return; }

    // TODO: automate these
    props.xScale.range([60, 500]);
    props.yScale.range([40, props.height - 40]);

    var gutter = 20;
    var unitWidth = props.xScale(1) - props.xScale(0) - gutter;

    var container = d3.select(React.findDOMNode(this.refs.container));

    var join = container.selectAll('.bar')
      .data(props.data);

    join.enter().append('svg:rect')
      .classed('bar', true);
    join.exit().remove();
    join.attr({
      x : function(d,i) { return props.xScale(i) + gutter/2; },
      y : function(d) { return props.yScale.range()[1] - props.yScale(d); },
      width: unitWidth,
      height: function(d) { return props.yScale(d); },
      value : function(d) { return d; }
    });
  }
  render() {
    var xAxis = {
      type : 'x-axis', scale : this.props.xScale, orient : 'bottom',
      transform : generateTranslateString(0, this.props.height - 40)
    };
    var yAxis = {
      type : 'y-axis', scale : this.props.yScale, orient : 'right',
      transform : generateTranslateString(500, 0)
    }
    return(
      <svg width="100%" height={this.props.height}>
        <Axis {...xAxis} />
        <Axis {...yAxis} />
        <g className="data-items" ref="container"></g>
      </svg>
    );
  }
}
