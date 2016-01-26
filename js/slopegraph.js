import d3 from 'd3';
import React from 'react';
import SVGComponent from './svg-component.js';
import { Im, addDOMProperty } from './utilities.js';

class Slopeline extends SVGComponent {
  static get defaultProps() {
    return {
      x1 : 40, x2 : 260,
      radius : 3
    };
  }
  render() {
    var x1 = this.props.x1, x2 = this.props.x2;
    var midX = (x2 + x1) / 2;
    var midY = (this.props.y2 + this.props.y1) / 2;
    var width = x2 - x1;
    var rise = this.props.y2 - this.props.y1;
    var textRotation = Math.PI * 18 * Math.atan(rise/width);

    var transform = `rotate(${textRotation} ${midX} ${midY})`;

    var handlers = {};
    for(let key in this.props.lineHandlers) {
      let h = this.props.lineHandlers[key];
      handlers[key] = (evt) => {
        h(this.props, evt);
      }
    }

    var centreLabel = this.props.active ?
      (<text className="centre-label" x={midX} y={midY - 3} textAnchor="middle" transform={transform}>{this.props.name}</text>) :
      null;

    var lineAttrs = {
      x1 : x1, x2 : x2, y1 : this.props.y1, y2 : this.props.y2
    };

    var classes = ['slopeline'];
    if(this.props.active) { classes.push('slopeline-active'); }

    return (
      <g className={classes.join(' ')} {...handlers}>
        {centreLabel}
        <line {...lineAttrs} stroke="black" />
        <circle r={this.props.radius} cx={x1} cy={this.props.y1}></circle>
        <circle r={this.props.radius} cx={x2} cy={this.props.y2}></circle>
        <line className="hoverline" {...lineAttrs} stroke="transparent" strokeWidth="6" />
      </g>
    );
  }
}

/**
 * Slopegraph component
 *
 * A slopegraph, with a basic scale on either side
 *
 * @prop {scale} leftScale - a d3 scale for the left side
 * @prop {scale} rightScale - a d3 scale for the right side
 * @prop {function} leftAccessor - a function that takes in a data point
 *       and returns a value for the left side of the slope graph
 * @prop {function} rightAccessor - as with the leftAccessor
 *
 * @prop {number} width - the width of the slopegraph (px)
 * @prop {number} padding - padding (axes to width)
 */
export default class Slopegraph extends SVGComponent {
  static get defaultProps() {
    return {
      leftScale : d3.scale.linear().domain([0,80]),
      rightScale : d3.scale.linear().domain([0,80]),
      data : [
        {a : 10, b : 30, name : 'one'},
        {a : 20, b : 45, name : 'two'},
        {a : 60, b : 15, name : 'three'}
      ],
      width: 500,
      padding : 40,
      lineHandlers : {
        onMouseEnter : (d) => { console.log(d); }
      },
      active : null,
      leftAccessor : d => d.a,
      rightAccessor : d => d.b,
      transform : null
    };
  }
  render() {
    this.props.leftScale.range([250, 50]);
    this.props.rightScale.range([250, 50]);

    var slopelines = this.props.data.map((d) => {
      var key = d.key ? d.key : d.name;
      var attrs = Im.extend(d, {
        key, _key : key,
        x1 : this.props.padding,
        x2 : this.props.width - this.props.padding,
        y1 : this.props.leftScale(this.props.leftAccessor(d)),
        y2 : this.props.rightScale(this.props.rightAccessor(d)),
        lineHandlers : this.props.lineHandlers,
        active : key === this.props.active
      });
      return (<Slopeline {...attrs} />);
    });

    return (
      <g width={this.props.width} height="300" transform={this.props.transform}>
        {slopelines}
      </g>
    );
  }
}
