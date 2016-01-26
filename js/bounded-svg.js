import React from 'react';
import SVGComponent from './svg-component.js';
import { parseMarginArray } from './utilities.js';

/**
 * a base component class that provides a bunch of utilities for
 * working with margins in an SVG
 */
export default class BoundedSVG extends SVGComponent {
  static get defaultProps() {
    return {
      margin : 10,
      height: 300,
      width: 595
    };
  }

  get margins() { return parseMarginArray(this.props.margin); }
  get leftBound() { return this.margins.left; }
  get rightBound() { return this.props.width - this.margins.right; }
  get topBound() { return this.margins.top; }
  get bottomBound() { return this.props.height - this.margins.bottom; }
  get widthSpan() { return this.props.width - this.margins.left - this.margins.right; }
  get heightSpan() { return this.props.height - this.margins.top - this.margins.bottom; }

  // mostly for debugging
  get boundingPolygonPoints() {
    return [
      [this.leftBound, this.topBound],
      [this.leftBound, this.bottomBound],
      [this.rightBound, this.bottomBound],
      [this.rightBound, this.topBound]
    ].map(point => point.join(',')).join(' ')
  }
}
