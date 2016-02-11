import d3 from 'd3';
import React from 'react';
import RFD from 'react-faux-dom';
import colours from './econ_colours.js';
import { generateTranslateString } from './utilities.js';

var stateInfoDate = d3.time.format('%B %e');
var stateInfoMonth = d3.time.format('%b');
var tau = Math.PI * 2;

export default class StateInfobox extends React.Component {
  static get defaultProps() {
    return {
      squareSize : 40,
      arc2012radius : 45,
      state : null
    };
  }
  get pie2012() {
    var radius = this.props.arc2012radius;

    var el = RFD.createElement('svg')
    var sel = d3.select(el);
    sel.attr({ height : radius * 2 + 0, width : radius * 2});

    var group = sel.append('svg:g')
      .attr('transform', generateTranslateString(radius, radius + 0));

    console.log(this.props.state);

    var arc = d3.svg.arc()
      .innerRadius(radius * 0.33)
      .outerRadius(radius)
      .startAngle(0);

    var backgroundArc = group.append('svg:path')
      .attr({
        d : arc({endAngle : tau}),
        fill : colours.grey[8]
      });

    var obamaShare = this.props.state.obama2012 / 100;
    var romneyShare = this.props.state.romney2012 / 100;

    var obamaAngle = tau * -1 * obamaShare;
    var romneyAngle = tau * romneyShare;
    var pctFormat = d3.format('.2p');

    var obamaArc = group.append('svg:path')
      .attr({
        d : arc({endAngle : obamaAngle}),
        fill : colours.usParty.dem
      });
    var obamaLabel = group.append('svg:text')
      .text(pctFormat(obamaShare))
      .classed('state-info-wedge-label', true)
      .attr({
        textAnchor : 'middle',
        fontSize : 12,
        transform : generateTranslateString(arc.centroid({
          endAngle : obamaAngle
        }))
      });

    var romneyArc = group.append('svg:path')
      .attr({
        d : arc({endAngle : romneyAngle}),
        fill : colours.usParty.gop
      });
    var romneyLabel = group.append('svg:text')
      .text(pctFormat(romneyShare))
      .classed('state-info-wedge-label', true)
      .attr({
        textAnchor : 'middle',
        fontSize : 12,
        transform : generateTranslateString(arc.centroid({endAngle : romneyAngle}))
      });

    var title = group.append('svg:text')
      .text('2012')
      .classed('state-info-pie-label', true)
      .attr({
        textAnchor : 'middle',
        // x : radius,
        y : 4,
        fontSize : 12
      });

    return el.toReact();
  }
  get calendarPage() {
    if(this.props.state.state === 'SPD') { return null; }
    var squareSize = this.props.squareSize;
    var date = new Date(this.props.state.date);

    return (<svg height={squareSize + 2} width={squareSize + 2} className="state-info-calendar-page">
      <g transform="translate(1,1)">
        <rect height={squareSize} width={squareSize} fill="white"/>
        <rect height="14" width={squareSize} fill={colours.red[1]} />
        <rect height={squareSize} width={squareSize} fill="none" stroke={colours.grey[1]}/>
        <text x={squareSize/2} y="11" fontSize="12" textAnchor="middle" className="calendar-month-label">{stateInfoMonth(date)}</text>
        <text x={squareSize/2} y={squareSize * 0.9} fontSize={squareSize * 0.67} textAnchor="middle" className="calendar-day-label">{date.getDate()}</text>
      </g>
    </svg>);
  }
  render() {
    if(!this.props.state) {
      // nothing to see here...
      return(<div></div>);
    }

    var state = this.props.state;
    state.date = new Date(state.date);
    var block = state.state === 'SPD' ? null : (<div>
      <div>Date of {state.type}: {stateInfoDate(state.date)}</div>
      <div>Delegates determined by election: {state.pledged}</div>
    </div>);
    var textBlock = state.text ? (<p className="state-info-text">{state.text}</p>) : null;
    return(<div className="state-info">
      <div className="state-info-left">
        <h4>{state.state_full_name}</h4>
        {block}
        {textBlock}
      </div>
      <div class="state-info-box">
        {this.calendarPage}
        {this.pie2012}
      </div>
    </div>);
  }
}
