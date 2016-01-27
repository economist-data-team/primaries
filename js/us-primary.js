import d3 from 'd3';
import React from 'react';
import RFD from 'react-faux-dom';
import { Im, generateTranslateString } from './utilities.js';

import BoundedSVG from './bounded-svg.js';

export const DEMOCRAT = 'DEM';
export const REPUBLICAN = 'GOP';

class USPrimaryElement extends React.Component {
  static get defaultProps() {
    return {
      dim : 10,
      position : [0,0],
      colour : '#cccccc',
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
      fill : this.props.colour
    };
    var circProps = {
      r : this.props.dim/2,
      fill : this.props.colour
    };
    var textProps = {
      fontSize : 14,
      fontWeight : 'bold',
      y : this.props.dim / 3,
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

export default class USPrimaries extends BoundedSVG {
  static get defaultProps() {
    return Im.extend(super.defaultProps, {
      rectSize : 20,
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

    var scale = this.props.scale.copy().range([this.leftBound, this.rightBound]);

    var dateNester = d3.nest()
      .key(d => d.date);
    var grouped = dateNester.map(data);

    var stateElements = [];
    for(let date in grouped) {
      let states = grouped[date];

      let elements = states.map((d,i) => {
        var props = Im.extend(d, {
          dim : this.props.rectSize,
          position : [scale(d.date), i * (this.props.rectSize + 2) + this.margins.top]
        });
        return (<USPrimaryElement {...props} />);
      });

      stateElements = stateElements.concat(elements);
    }

    console.log(stateElements);

    return(<g>
      {stateElements}
    </g>);
  }
}
