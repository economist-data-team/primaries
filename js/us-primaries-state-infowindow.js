import d3 from 'd3';
import React from 'react';
import RFD from 'react-faux-dom';
import colours from './econ_colours.js';
import { Im, generateTranslateString, generateRectPolygonString,
  addDOMProperty } from './utilities.js';
import { DEMOCRAT, REPUBLICAN } from './us-primary.js';

addDOMProperty('strokeWeight', 'stroke-weight');

var stateInfoDate = d3.time.format('%B %e');
var stateInfoMonth = d3.time.format('%b');
var tau = Math.PI * 2;

export default class StateInfobox extends React.Component {
  static get defaultProps() {
    return {
      squareSize : 41,
      arc2012radius : 46,
      delegateHeight : 54,
      state : null
    };
  }
  get pie2012() {
    if(this.props.state.state === 'SPD') {
      return null;
    }

    var radius = this.props.arc2012radius;

    var el = RFD.createElement('g')
    var sel = d3.select(el);

    var group = sel.append('svg:g')
      .attr('transform', generateTranslateString(radius, radius + 0));

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

    if(obamaShare === 0 && romneyShare === 0) {
      var texts = ['Does not','hold presidential', 'elections, only', 'party primaries'];
      var disclaimer = sel.append('svg:text')
        .attr({
          fontSize : 12,
          textAnchor : 'middle',
          y : this.props.arc2012radius - texts.length * 6 - 4
        });
      texts.forEach(text => {
          disclaimer.append('svg:tspan')
          .text(text)
          .attr({ x : this.props.arc2012radius, dy : 12 });
        });
    } else {
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
    }

    return (<svg height={radius * 2} width={radius * 2}>
      {el.toReact()}
      <text x={1 * radius/2} y="15" className="outside-label" fill="black" textAnchor="middle">Obama</text>
      <text x={3 * radius/2} y="15" className="outside-label" fill="black" textAnchor="middle">Romney</text>
    </svg>);
  }
  get delegateCount() {
    var rectWidth = this.props.arc2012radius * 2 - 2;
    var rectHeight = this.props.delegateHeight;

    var innerHeight = rectHeight - 14;
    var largeFontSize = innerHeight * 0.67;

    var header = this.props.state.state === "SPD" ? 'Superdelegates' : 'Delegates';

    var contents = this.props.state.state === "SPD" ? (<g transform="translate(0,14)" key="superdelContents">
      <text x={rectWidth / 2} y={innerHeight - 8} textAnchor='middle' fontSize={innerHeight * 0.95} className="delegate-count">{this.props.state.unpledged}</text>
    </g>) :
      (<g transform="translate(0, 14)" key="fullContents">
          <text x="3" y={largeFontSize * 0.8} fontSize="12">
            <tspan className="delegate-count" fontSize={largeFontSize}>{this.props.state.pledged}</tspan>
            <tspan> </tspan>
            <tspan className="delegate-label" y="12">Pledged*</tspan>
          </text>
          <text x={rectWidth - 4} y={innerHeight - 3} fontSize="12" textAnchor="end">
            <tspan className="delegate-label">{this.props.state.party === DEMOCRAT ? 'Superdel.' : 'Unpledged'}</tspan>
            <tspan> </tspan>
            <tspan fontSize={largeFontSize} className="delegate-count">{this.props.state.unpledged}</tspan>
          </text>
          <path stroke="black" strokeWeight="0.5" fill="none"
          d={`M 0 ${innerHeight * 0.63}
            C ${rectWidth * 0.25} ${innerHeight * 0.63} ${rectWidth * 0.3} ${innerHeight * 0.63} ${rectWidth * 0.5} ${innerHeight * 0.5}
            C ${rectWidth * 0.7} ${innerHeight * 0.37} ${rectWidth * 0.75} ${innerHeight * 0.37} ${rectWidth} ${innerHeight * 0.37}`} />
        </g>);

    return (<svg height={rectHeight + 2} width={rectWidth + 2}>
      <g transform="translate(1,1)">
        <rect height={rectHeight} width={rectWidth} fill="white" />
        <rect height="14" width={rectWidth} fill={colours.grey[5]} />
        <rect height={rectHeight} width={rectWidth} fill="none" stroke="black" strokeWeight="0.5" />
        <text x="3" y="11.5" fontSize="12" fill="white" className="box-label">{header}</text>

        {contents}
      </g>
    </svg>);
    // L ${rectWidth * 0.35} ${rectHeight - 14}
    // L ${rectWidth * 0.65} 31
    // L ${rectWidth} 31
  }
  get calendarPage() {
    if(this.props.state.state === 'SPD') { return null; }
    var squareSize = this.props.squareSize;
    var date = new Date(this.props.state.date);

    return (<svg height={squareSize + 2} width={squareSize + 2} className="state-info-calendar-page">
      <g transform="translate(1,1)">
        <rect height={squareSize} width={squareSize} fill="white"/>
        <rect height="14" width={squareSize} fill={colours.red[1]} />
        <rect height={squareSize} width={squareSize} fill="none" stroke="black" strokeWeight="0.5"/>
        <text x={squareSize/2} y="11.5" fontSize="12" textAnchor="middle" className="calendar-month-label box-label">{stateInfoMonth(date)}</text>
        <text x={squareSize/2} y={squareSize * 0.9} fontSize={squareSize * 0.67} textAnchor="middle" className="calendar-day-label">{date.getDate()}</text>
      </g>
    </svg>);
  }
  get resultsChart() {
    var stateCandidates = this.props.candidates.map(c => Im.extend(c, {
      state_pct : this.props.state[`${c.key}_pct`],
      state_del : this.props.state[`${c.key}_del`]
    }))
      .filter(c => c.state_pct !== "")
      .sort((a,b) => b.state_pct - a.state_pct);

    // if there are no results, stop here and show nothing
    if(stateCandidates.length === 0) { return null; }

    // results! Let's make a chart.

    // we can use stateCandidates[0] since we already sorted them here
    var scale = d3.scale.linear()
      .domain([0, stateCandidates[0].state_pct])
      .nice() // no ending on 60.3!
      .range([0, 100]);

    // only show the top 4...
    var topCandidates = stateCandidates.slice(0,4);
    var barHeight = 16;
    var bars = topCandidates
      .map((c, idx) => {
        var groupProps = {
          transform : generateTranslateString(0, idx * (barHeight + 2) + 15)
        };

        var barLength = scale(c.state_pct);

        var barProps = {
          x : 50,
          width : barLength,
          height : barHeight,
          fill : c.colour
        };
        var labelProps = {
          x : 48, y : 12,
          fontSize : 14,
          textAnchor : 'end',
          className : 'delegate-bar-label'
        };
        var delegateBgProps = {
          x : 160, y: 1, height : barHeight - 2, width : 24,
          stroke : 'black',
          strokeWidth : 0.5,
          fill : 'white'
        };
        var percentOverBar = barLength > 40;
        var percentProps = {
          x : 50 + (percentOverBar ? barLength - 2 : barLength + 2),
          y : 12,
          fontSize: 13,
          textAnchor : percentOverBar ? 'end' : 'start',
          fill : percentOverBar ? 'white' : c.colour,
          className : 'candidate-bar-percent'
        }
        var countProps = {
          // -1 here is because of the way italics render...
          x : 172 - 1, y : 13,
          fontSize: 14,
          className : 'candidate-delegate-count',
          fill : c.colour,
          textAnchor : 'middle'
        };

        return (<g {...groupProps}>
          <rect {...barProps} />
          <rect {...delegateBgProps} />
          <text {...labelProps}>{c.displaySurname}</text>
          <text {...percentProps}>{`${c.state_pct}%`}</text>
          <text {...countProps}>{c.state_del}</text>
        </g>);
      });

    var el = RFD.createElement('g');
    var sel = d3.select(el)
      .classed('candidate-bar-axis', true)
      .attr('transform', generateTranslateString(50,15));

    var axis = d3.svg.axis()
      .scale(scale)
      .ticks(4)
      .outerTickSize(0)
      .innerTickSize(-50)
      .orient('top');

    sel.call(axis);

    return (<svg width="200" height={topCandidates.length * (barHeight + 2) + 15}>
      {bars}
      <text x="185" y="12" fontSize="13" textAnchor="end" className="candidate-delegate-label">Delegates won</text>
    </svg>)
  }
  render() {
    if(!this.props.state) {
      // nothing to see here...
      return(<div></div>);
    }

    var state = this.props.state;
    state.date = new Date(state.date);
    var width = Math.max(this.props.squareSize * 2, this.arc2012radius);

    var containerStyle = {
      width : width
    };


    var textBlock = state.text ? (<p className="state-info-text">{state.text}</p>) : null;
    return(<div className="state-info" style={containerStyle}>
      <div className="state-info-left">
        <h4>{state.state_full_name}</h4>
        {this.resultsChart}
        {textBlock}
      </div>
      <div className="state-info-box">
        <div className="side-boxes">
          {this.calendarPage}
        </div>
        {this.delegateCount}
        {this.pie2012}
      </div>
    </div>);
  }
}
