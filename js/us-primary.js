import d3 from 'd3';
import React from 'react';
import RFD from 'react-faux-dom';
import { Im } from './utilities.js';

import BoundedSVG from './bounded-svg.js';

export default class USPrimaries extends BoundedSVG {
  static get defaultProps() {
    return Im.extend(super.defaultProps, {
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

    console.log(this.props.data);

    return(<g>
    </g>);
  }
}
