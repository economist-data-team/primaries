import d3 from 'd3';
import React from 'react';
import RFD from 'react-faux-dom';
import colours from './econ_colours.js';
import { generateTranslateString } from './utilities.js';

var stateInfoDate = d3.time.format('%B %e');
var tau = Math.PI * 2;

export default class StateInfobox extends React.Component {
  static get defaultProps() {
    return {
      arc2012radius : 25,
      state : null
    };
  }
  get pie2012() {
    var radius = this.props.arc2012radius;

    var el = RFD.createElement('svg')
    var sel = d3.select(el);
    sel.attr({ height : radius * 2, width : radius * 2});

    var group = sel.append('svg:g')
      .attr('transform', generateTranslateString(radius, radius));

    console.log(this.props.state);

    var arc = d3.svg.arc()
      .innerRadius(radius * 0.4)
      .outerRadius(radius)
      .startAngle(0);

    var backgroundArc = group.append('svg:path')
      .attr({
        d : arc({endAngle : tau}),
        fill : colours.grey[8]
      });

    var obamaArc = group.append('svg:path')
      .attr({
        d : arc({endAngle : tau * -1 * this.props.state.obama2012 / 100}),
        fill : colours.usParty.dem
      });

    var romneyArc = group.append('svg:path')
      .attr({
        d : arc({endAngle : tau * this.props.state.romney2012 / 100}),
        fill : colours.usParty.gop
      })

    return el.toReact();
  }
  render() {
    if(!this.props.state) {
      // nothing to see here...
      return(<div></div>);
    }

    var state = this.props.state;
    var block = state.state === 'SPD' ? null : (<div>
      <div>Date of {state.type}: {stateInfoDate(state.date)}</div>
      <div>Delegates determined by election: {state.pledged}</div>
    </div>);
    var textBlock = state.text ? (<p className="state-info-text">{state.text}</p>) : null;
    return(<div className="state-info">
      <h4>{state.state_full_name}</h4>
      {this.pie2012}
      {block}
      {textBlock}
    </div>);
  }
}
