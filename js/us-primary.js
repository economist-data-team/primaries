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
      position : [0,0]
    };
  }
  render() {
    var translate = generateTranslateString(this.props.position);

    var rectProps = {
      width : this.props.dim,
      height : this.props.dim,
      x : -this.props.dim / 2,
      y : -this.props.dim / 2
    }

    return (<g transform={translate}>
      <rect {...rectProps} />
    </g>);
  }
}

export default class USPrimaries extends BoundedSVG {
  static get defaultProps() {
    return Im.extend(super.defaultProps, {
      party : REPUBLICAN,
      scale : d3.time.scale().domain([10,585]).range([
        new Date('01/20/2016'), new Date('06/30/2016')
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

    var dateNester = d3.nest()
      .key(d => d.date);

    console.log(dateNester.map(data));

    return(<g>
    </g>);
  }
}
