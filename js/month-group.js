import React from 'react';
import BoundedSVG from './bounded-svg.js';
import colours from './econ_colours.js';
import { mapToObject, Im } from './utilities.js';

export const months = [ 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
               'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec' ];


class MonthBar extends React.Component {
  static get defaultProps() {
    return {
      specialColour : colours.grey[5],
      duration : 150,
      rectColour : colours.aquamarine[1]
    };
  }
  constructor(props, ...args) {
    super(props, ...args);
    this.state = mapToObject(this.transitionableProps, props);
    this.animationStep = this.animationStep.bind(this);
  }
  componentWillReceiveProps(newProps) {
    d3.timer(this.animationStep);
    this.interpolators = mapToObject(this.transitionableProps, k => d3.interpolate(this.state[k], newProps[k]));
  }
  animationStep(ms) {
    var progress = Math.min(1, ms / this.props.duration);
    this.setState(mapToObject(this.transitionableProps, k => this.interpolators[k](progress)));
    // if we're done, end the animation
    if(progress === 1) { return true; }
    return false;
  }
  render() {
    // 'special' is a bye for superdelegates, which are assigned to the
    // 1st of January
    var special = this.props.label === 'JAN';
    var rectProps = {
      fill : special ? this.props.specialColour : this.props.rectColour,
      height : this.state.height,
      width : this.state.width,
      x : this.state.x,
      y : this.state.y
    };
    var textProps = {
      className : 'month-label',
      x : this.state.x + this.state.width / 2,
      y : 24,
      textAnchor : 'middle'
    };

    var textEl = special ? null :
      (<text {...textProps}>{this.props.label}</text>);

    return (<g>
      <rect {...rectProps}/>
      {textEl}
    </g>);
  }
}
MonthBar.prototype.transitionableProps = ['width', 'height', 'x', 'y'];

export default class MonthGroup extends BoundedSVG {
  static get defaultProps() {
    return Im.extend(super.defaultProps, {
      duration : 300
    });
  }
  render() {
    var scale = this.props.scale;
    var cumulative = scale(-0.5);
    var monthElements = this.props.monthSections.map((d,idx) => {
      var width = scale(d) - scale(0);
      var monthProps = {
        duration : this.props.duration,
        height : 15,
        width : width - 2,
        x : cumulative,
        y : this.topBound,
        key : months[idx].toUpperCase(),
        label : months[idx].toUpperCase()
      }
      cumulative += width;
      return (<MonthBar {...monthProps} />);
    });

    return (<g>
      {monthElements}
    </g>);
  }
}
