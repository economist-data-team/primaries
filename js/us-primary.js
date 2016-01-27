import _ from 'lodash';
import d3 from 'd3';
import React from 'react';
import RFD from 'react-faux-dom';
import { Im, generateTranslateString, generateRectPolygonString, addDOMProperty } from './utilities.js';
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
      position : [0,0],
      colour : '#cccccc',
      strokeColour : '#aaaaaa',
      state : undefined
    };
  }
  render() {
    var translate = generateTranslateString(...this.props.position);

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

class MonthGroup extends BoundedSVG {
  static get defaultProps() {
    return Im.extend(super.defaultProps, {

    });
  }
  render() {
    var scale = this.props.scale;
    var cumulative = this.leftBound - 2;
    var rects = this.props.monthSections.map((d, idx) => {
      var width = scale(d) - scale(0);
      var rectProps = {
        fill : colours.aquamarine[1],
        height : 15,
        width : width - 2,
        x : cumulative,
        y : this.topBound
      };
      cumulative += width;
      return (<rect {...rectProps} />);
    });

    cumulative = this.leftBound - 2;
    var texts = this.props.monthSections.map((d, idx) => {
      var width = scale(d) - scale(0);
      var textProps = {
        fontSize : 13,
        fontWeight : 'bold',
        textAnchor : 'middle',
        x : cumulative + width / 2 - 1, // I have no idea why -1 works...
        y : 22
      };
      cumulative += width;
      return (<text {...textProps}>{months[idx].toUpperCase()}</text>);
    });

    return (<g>
      {rects}
      {texts}
    </g>);
  }
}

export default class USPrimaries extends BoundedSVG {
  static get defaultProps() {
    return Im.extend(super.defaultProps, {
      rectSize : 22,
      party : REPUBLICAN,
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
          position : [
            scale(dateIndex),
            i * (this.props.rectSize + 3) +
              this.margins.top + this.props.rectSize / 2 + 20
          ]
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
