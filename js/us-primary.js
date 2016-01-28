import _ from 'lodash';
import d3 from 'd3';
import React from 'react';
import RFD from 'react-faux-dom';
import { Im, mapToObject, generateTranslateString,
  generateRectPolygonString, addDOMProperty } from './utilities.js';
import colours from './econ_colours.js';

import BoundedSVG from './bounded-svg.js';

addDOMProperty('fontWeight', 'font-weight');

export const DEMOCRAT = 'DEM';
export const REPUBLICAN = 'GOP';

var months = [ 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
               'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec' ];

class USPrimaryElement extends React.Component {
  static get defaultProps() {
    return {
      dim : 10,
      x : 0,
      y : 0,
      colour : '#cccccc',
      strokeColour : '#aaaaaa',
      state : undefined
    };
  }
  get position() {
    return [this.props.x, this.props.y];
  }
  render() {
    var translate = generateTranslateString(...this.position);

    var rectProps = {
      width : this.props.dim,
      height : this.props.dim,
      x : -this.props.dim / 2,
      y : -this.props.dim / 2,
      fill : this.props.colour,
      stroke : this.props.strokeColour,
      strokeWidth : 0.75
    };
    var circProps = {
      r : this.props.dim/2 + 1, // we add 1 just to make things look nicer
      fill : this.props.colour,
      stroke : this.props.strokeColour,
      strokeWidth : 0.75
    };
    var fontSize = 14;
    var textProps = {
      fontSize : fontSize,
      fontWeight : 'bold',
      y : fontSize / 2.75,
      textAnchor : 'middle'
    };

    var geomElement = this.props.type === 'primary' ?
      (<rect {...rectProps} />) :
      (<circle {...circProps} />);

    return (<g transform={translate}>
      {geomElement}
      <text {...textProps}>{this.props.state}</text>
    </g>);
  }
}

class MonthBar extends React.Component {
  static get defaultProps() {
    return {
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
    console.log(this.props, newProps);
    this.interpolators = mapToObject(this.transitionableProps, k => d3.interpolate(this.props[k], newProps[k]));
  }
  animationStep(ms) {
    var progress = Math.min(1, ms / this.props.duration);
    this.setState(mapToObject(this.transitionableProps, k => this.interpolators[k](progress)));
    // if we're done, end the animation
    if(progress === 1) { return true; }
    return false;
  }
  render() {
    var rectProps = {
      fill : this.props.rectColour,
      height : this.state.height,
      width : this.state.width,
      x : this.state.x,
      y : this.state.y
    };
    var textProps = {
      className : 'month-label',
      x : this.state.x + this.state.width / 2,
      y : 22,
      textAnchor : 'middle'
    };

    return (<g>
      <rect {...rectProps}/>
      <text {...textProps}>{this.props.label}</text>
    </g>);
  }
}
MonthBar.prototype.transitionableProps = ['width', 'height', 'x', 'y'];

class MonthGroup extends BoundedSVG {
  static get defaultProps() {
    return Im.extend(super.defaultProps, {

    });
  }
  render() {
    var scale = this.props.scale;
    var cumulative = this.leftBound - 2;
    var monthElements = this.props.monthSections.map((d,idx) => {
      var width = scale(d) - scale(0);
      var monthProps = {
        height : 15,
        width : width - 2,
        x : cumulative,
        y : this.topBound,
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

export default class USPrimaries extends BoundedSVG {
  static get defaultProps() {
    return Im.extend(super.defaultProps, {
      rectSize : 22,
      party : DEMOCRAT,
      scale : d3.time.scale().range([10,585]).domain([
        new Date('01/30/2016'), new Date('06/10/2016')
      ])
    });
  }
  render() {
    // var el = RFD.createElement('g');
    // var sel = d3.select(el);
    //
    // return el.toReact();

    // sort out the party we want to show
    var data = this.props.data.filter(d => d.party === this.props.party);

    // var scale = this.props.scale.copy().range([this.leftBound, this.rightBound]);

    var scale = d3.scale.linear().range([
      this.leftBound + this.props.rectSize / 2,
      this.rightBound +  this.props.rectSize / 2
    ]);

    var primaryDateComparisons = _.uniq(data.map(d => d.date.getTime())).sort((a, b) => a - b);
    scale.domain([0, primaryDateComparisons.length]);

    // this is super inefficient, but unfortunately necessary
    var primaryDates = primaryDateComparisons.map(d => new Date(d));
    var primaryMonths = primaryDates.map(d => d.getMonth());

    var primaryMonthSections = primaryMonths.reduce((memo, n) => {
      if(!memo[n]) { memo[n] = 0; }
      memo[n] += 1;
      return memo;
    }, []);

    var dateNester = d3.nest()
      .key(d => d.date);
    var grouped = dateNester.map(data);

    var stateElements = [];
    for(let date in grouped) {
      let states = grouped[date];

      let elements = states.map((d,i) => {
        var dateIndex = primaryDateComparisons.indexOf(d.date.getTime());
        var props = Im.extend(d, {
          dim : this.props.rectSize,
          x : scale(dateIndex),
          y: i * (this.props.rectSize + 3) +
            this.margins.top + this.props.rectSize / 2 + 20
          // position : [i * -(this.props.rectSize + 2) + 200, scale(d.date)]
        });
        return (<USPrimaryElement {...props} />);
      });

      stateElements = stateElements.concat(elements);
    }

    var monthGroupProps = {
      scale : scale,
      monthSections : primaryMonthSections,
      height: 30
    };

    return(<g>
      <MonthGroup {...monthGroupProps} />
      {stateElements}
    </g>);
  }
}
