import React from 'react';
import chroma from 'chroma-js';
import { Im, mapValues, mapToObject, generateTranslateString } from './utilities.js';

export default class USPrimaryElement extends React.Component {
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
  static get defaultProps() {
    return {
      dim : 10,
      x : 0,
      y : 0,
      colour : '#cccccc',
      strokeColour : '#aaaaaa',
      strokeWidth : 0.75,
      state : undefined,
      duration: 300
    };
  }
  get position() {
    return [this.state.x, this.state.y];
  }
  render() {
    const STAR_PATH = this.props.starPath;
    const LUMINANCE_THRESHOLD = this.props.luminanceThreshold;

    var translate = generateTranslateString(...this.position);

    var fillLuminance = chroma(this.props.colour).luminance();

    var primaryEvents = mapValues(this.props.primaryEvents, fn => {
      var props = this.props;
      return function() { fn(props); }
    });

    var rectProps = {
      width : this.props.dim,
      height : this.props.dim,
      x : -this.props.dim / 2,
      y : -this.props.dim / 2,
      fill : this.props.colour,
      stroke : this.props.strokeColour,
      strokeWidth : this.props.strokeWidth
    };
    var circProps = {
      r : this.props.dim/2 + 1, // we add 1 just to make things look nicer
      fill : this.props.colour,
      stroke : this.props.strokeColour,
      strokeWidth : this.props.strokeWidth
    };
    var starProps = {
      fill : this.props.colour,
      stroke: this.props.strokeColour,
      strokeWidth : this.props.strokeWidth,
      d : STAR_PATH
    };
    var fontSize = 14;
    var textProps = {
      fill : fillLuminance > LUMINANCE_THRESHOLD ? 'black' : 'white',
      fontSize : fontSize,
      fontWeight : 'bold',
      y : fontSize / 2.75,
      textAnchor : 'middle'
    };

    var geomElement;
    switch(this.props.type) {
      case 'primary':
        geomElement = (<rect {...rectProps} />);
        break;
      case 'caucus':
        geomElement = (<circle {...circProps} />);
        break;
      default:
        // convention, probably
        geomElement = (<path {...starProps} />);
    }

    var groupProps = Im.extend({
      transform : translate
    }, primaryEvents);

    return (<g {...groupProps}>
      {geomElement}
      <text {...textProps}>{this.props.state}</text>
    </g>);
  }
}
USPrimaryElement.prototype.transitionableProps = ['x', 'y'];
