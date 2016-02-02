import React from 'react';
import { generateTranslateString } from './utilities.js';

export default class PrimariesKey extends React.Component {
  static get defaultProps() {
    return {
      dim : 10,
      x : 0,
      y : 0,
      colour : '#cccccc',
      strokeColour : '#aaaaaa',
      strokeWidth : 0.75,
      starPath : `M 0.000 6.000
                  L 9.405 12.944
                  L 5.706 1.854
                  L 15.217 -4.944
                  L 3.527 -4.854
                  L 0.000 -16.000
                  L -3.527 -4.854
                  L -15.217 -4.944
                  L -5.706 1.854
                  L -9.405 12.944
                  L 0.000 6.000`
    };
  }
  render() {
    var groupProps =  {
      className : 'primaries-legend',
      transform : generateTranslateString(245, this.props.fullHeight - 20)
    };
    var rectProps = {
      width : this.props.dim,
      height : this.props.dim,
      x : -this.props.dim / 2,
      y : -this.props.dim / 2,
      fill : this.props.colour,
      stroke : this.props.strokeColour,
      strokeWidth : this.props.strokeWidth,
      transform : generateTranslateString(0, 0)
    };
    var circProps = {
      r : this.props.dim/2 + 1, // we add 1 just to make things look nicer
      fill : this.props.colour,
      stroke : this.props.strokeColour,
      strokeWidth : this.props.strokeWidth,
      transform : generateTranslateString(100, 0)
    };
    var starProps = {
      fill : this.props.colour,
      stroke: this.props.strokeColour,
      strokeWidth : this.props.strokeWidth,
      d : this.props.starPath,
      transform : generateTranslateString(200, 0)
    };

    return (<g {...groupProps}>
      <rect {...rectProps} />
      <text  x="18" y="5">Primary</text>
      <circle {...circProps} />
      <text x="118" y="5">Caucus</text>
      <path {...starProps} />
      <text x="218" y="5">Convention/other</text>
    </g>);
  }
}
