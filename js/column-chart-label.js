import React from 'react';
import BoundedSVG from './bounded-svg.js';
import { Im, generateTranslateString } from './utilities.js';

export default class ColumnChartLabel extends BoundedSVG {
  static get defaultProps() {
    return Im.extend(super.defaultProps, {
      text : 'Hello',
      position : [300, 50],
      lineLength : -50,
      verticalOffset : 0
    });
  }
  render() {
    var transform = generateTranslateString(...this.props.position);

    var fontSize = 16;

    // approximate
    var textLength = this.props.text.length * fontSize/2;
    var textRight = this.props.lineLength > 0;
    var lineLength = this.props.lineLength;

    var edge = this.props.position[0] + this.props.lineLength + textLength * (textRight ? 1 : -1);
    if(edge > this.rightBound || edge < this.leftBound) {
      lineLength = lineLength * -1;
    }

    // re-setting in case it changed
    textRight = lineLength > 0;
    var textOffset = lineLength + (textRight ? 5 : -5);
    var textAnchor = textRight ? 'start' : 'end';

    return (<g transform={transform}>
      <line x1="0" x2={lineLength} y1="0" y2={this.props.verticalOffset} stroke="black"></line>
      <text x={textOffset} y={this.props.verticalOffset + 5} fontSize={fontSize} textAnchor={textAnchor} className="column-chart-label">
      {this.props.text}
      </text>
    </g>);
  }
}
