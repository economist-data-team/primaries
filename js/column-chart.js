import d3 from 'd3';
import React from 'react';
import RFD from 'react-faux-dom';
import BoundedSVG from './bounded-svg.js';
import { Im, generateTranslateString } from './utilities.js';

class ColumnSeries extends BoundedSVG {
  static get defaultProps() {
    return Im.extend(super.defaultProps, {});
  }
  render() {
    var el = RFD.createElement('g');
    var sel = d3.select(el);

    var xScale = this.props.xScale, yScale = this.props.yScale;
    var xWidth = Math.abs(xScale.range()[1] - xScale.range()[0]);

    // spacing dropped here for the last column, which should flush to
    // the end
    // var colWidth = xScale(this.props.unitPair[1]) - xScale(this.props.unitPair[0]) - this.props.spacing - this.props.offset;
    var colWidth = xWidth/this.props.data.length - this.props.spacing - this.props.offset;

    var columnJoin = sel.selectAll('.chart-column')
      .data(this.props.data);
    columnJoin.enter()
      .append('svg:rect')
      .classed('chart-column', true);
    columnJoin.exit().remove();
    columnJoin
      .classed(`column-${this.props.name}`, true)
      .on('mouseenter', this.props.enterHandler)
      .on('mouseleave', this.props.leaveHandler)
      .each((d,idx) => {
        // cache positions
        d[`y-${this.props.name}`] = this.bottomBound - yScale(this.props.yAccessor(d) + this.props.priorAccessor(d)) + yScale(0);
        // d[`y-${this.props.name}`] = yScale(this.props.yAccessor(d)) - yScale(0) + y;
        d.x = xScale(this.props.xAccessor(d, idx)) + this.props.offset
      })
      .attr({
        height : d => yScale(this.props.yAccessor(d)) - yScale(0),
        y : d => {
          return this.bottomBound - yScale(this.props.yAccessor(d) + this.props.priorAccessor(d)) + yScale(0);
        },
        width: colWidth,
        x : (d, idx) => xScale(this.props.xAccessor(d, idx)) + this.props.offset
      });

    return el.toReact();
  }
}

class BarAxis extends BoundedSVG {
  static get defaultProps() {
    return {
      scale : d3.scale.linear(),
      tickFormat : v => v
    };
  }
  render() {
    var el = RFD.createElement('g');
    var sel = d3.select(el);

    var scale = this.props.scale.copy();

    var axis = d3.svg.axis()
      .scale(scale)
      .orient('bottom')
      .innerTickSize(6)
      .outerTickSize(1);

    sel
      .attr({
        transform : generateTranslateString(0, this.props.offset)
      })
      .call(axis)

    return el.toReact();
  }
}

export default class ColumnChart extends BoundedSVG {
  static get defaultProps() {
    return {
      height: 300,
      width: 595,
      xAccessor : (d,i) => i,
      arrangement: 'stacked',
      series : [
        { name : 'first', accessor : d => d.y },
        { name : 'second', accessor : d => d.y2 },
        { name : 'third', accessor : d => d.y3 },
      ],
      data : [
        {x:0, y:10, y2:80, y3:50},
        {x:1, y:30, y2:50, y3:50},
        {x:2, y:90, y2:30, y3:50},
        {x:3, y:40, y2:60, y3:50}
      ],
      margin : 10,
      spacing : 10,
      xScale : d3.scale.linear().domain([0,4]),
      yScale : d3.scale.linear().domain([0,300]),
      enterHandler : d => null,
      leaveHandler : d => null,
      backgroundColour : '#e6e6e6'
    };
  }
  render() {
    var el = RFD.createElement('g');
    var sel = d3.select(el);

    var xScale = this.props.xScale.copy().range([this.leftBound, this.rightBound + this.props.spacing]);
    var yScale = this.props.yScale.copy().range([this.topBound, this.bottomBound]);

    var columns = this.props.series.map((series, idx) => {
      var props = {
        key : series.name,
        name : series.name,
        xScale : xScale, yScale : yScale,
        data : this.props.data,
        xAccessor : this.props.xAccessor,
        yAccessor : series.accessor,
        priorAccessor : d => this.props.series.slice(0,idx).reduce((memo, s) => { return memo + s.accessor(d); }, 0),
        spacing : this.props.spacing,
        margin : this.props.margin,
        enterHandler : this.props.enterHandler,
        leaveHandler : this.props.leaveHandler,
        index : idx,
        offset : 0 // placeholder: to handle adjacent series
      };
      return (<ColumnSeries {...props} />);
    });

    var axisProps = {
      scale : xScale,
      offset : this.bottomBound
    };

    return(
      <g height={this.props.height} width={this.props.width}>
        <polygon fill={this.props.backgroundColour} points={this.boundingPolygonPoints}></polygon>
        {columns}
      </g>
    );
  }
}
