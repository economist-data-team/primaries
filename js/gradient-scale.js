import React from 'react';
import BoundedSVG from './bounded-svg.js';
import { Im, generateTranslateString } from './utilities.js';
import d3 from 'd3';

import chroma from 'chroma-js';

class Tag extends React.Component {
  static get defaultProps() {
    return {
      point : 2,
      label : 'Hello'
    };
  }
  render() {
    return (<g transform={generateTranslateString(this.props.point, 22)}>
      <polygon points="0 0, 4 4, -4 4" fill="black"/>
      <text textAnchor="middle" y="15" fontSize="12">{this.props.label}</text>
    </g>);
  }
}

/**
 * this is a basic scale for a color gradient
 *
 * @prop {Chroma scale} scale - the gradient scale
 * @prop {function} formatter - a formatter for ticks on the scale
 * @prop {array} tag - points on the scale to highlight.
 * @prop {string|optional} mod - if you need to modify the scale (e.g.
 *       use a logarithmic scale)
 * @prop {array|Optional} modDomain - an alternate domain, in case the
 *       modified scale requires a different domain (e.g. a log scale
 *       can't contain zero)
 */
export default class GradientScale extends BoundedSVG {
  static get defaultProps() {
    return Im.extend(super.defaultProps, {
      scale : chroma.scale(['#FFF', '#f00', '#000']).domain([0,40,200]),
      formatter : v => v,
      mod : null,
      modDomain : null
    });
  }
  render() {
    var domain = this.props.scale.domain();
    var scaleType = 'linear';
    switch(this.props.mod) {
      case 'log':
        scaleType = 'log';
        break;
    }
    var converter = d3.scale[scaleType]().domain(this.props.modDomain || domain).range([0, 100]);
    // console.log(domain, converter.invert(5));

    var stops = d3.range(5,100,5);

    var tag = this.props.tag || domain;

    stops = stops.concat(tag.map(t => converter(t)))
      // stops must be in order
      .sort((a,b) => { return a - b; })
      // stops ought to be unique, just because...
      .filter((item, pos, ary) => !pos || item != ary[pos - 1]);

    console.log(stops, stops.map(converter.invert));

    var stopElements = stops.map(s => {
      return (<stop offset={s + '%'} stopColor={this.props.scale(converter.invert(s))} />);
    });

    var tags = tag.map(t => {
      return(<Tag point={converter(t) * 2} label={this.props.formatter(t)} />);
    });

    return (<g transform={generateTranslateString(this.leftBound, this.topBound)}>
      <linearGradient id="gradient-scale-gradient">
        {stopElements}
      </linearGradient>
      <rect fill="url(#gradient-scale-gradient)" x="0" y="5" width="200" height="15"></rect>
      {tags}
    </g>);
  }
}
