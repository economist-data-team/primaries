import _ from 'lodash';
import d3 from 'd3';
import React from 'react';
import RFD from 'react-faux-dom';
import { Im, mapToObject, mapValues, generateTranslateString,
  generateRectPolygonString, addDOMProperty, bindValueToRange } from './utilities.js';
import colours from './econ_colours.js';

import BoundedSVG from './bounded-svg.js';

addDOMProperty('fontWeight', 'font-weight');

function guarantee(parent, classSelector, type) {
  var sel = d3.select(parent)
  var out = sel.select(`.${classSelector}`);
  // console.log(out[0][0]);
  // why it's [0][0] I have no idea
  return out[0][0] ? out : sel.append(type)
    .classed(classSelector, true);
}

export const DEMOCRAT = 'DEM';
export const REPUBLICAN = 'GOP';

const STAR_PATH = `M 0.000 6.000
                   L 9.405 12.944
                   L 5.706 1.854
                   L 15.217 -4.944
                   L 3.527 -4.854
                   L 0.000 -16.000
                   L -3.527 -4.854
                   L -15.217 -4.944
                   L -5.706 1.854
                   L -9.405 12.944
                   L 0.000 6.000`;

// const is not a real thing here but w/e
export const CANDIDATES = [
  { party : DEMOCRAT, key : 'clinton', displaySurname : 'Clinton', name : 'Hillary Clinton' },
  { party : DEMOCRAT, key : 'omalley', displaySurname : 'O’Malley', name : 'Martin O’Malley' },
  { party : DEMOCRAT, key : 'sanders', displaySurname : 'Sanders', name : 'Bernie Sanders' },

  { party : REPUBLICAN, key : 'bush', displaySurname : 'Bush', name : 'Jeb Bush' },
  { party : REPUBLICAN, key : 'carson', displaySurname : 'Carson', name : 'Ben Carson' },
  { party : REPUBLICAN, key : 'christie', displaySurname : 'Christie', name : 'Chris Christie' },
  { party : REPUBLICAN, key : 'cruz', displaySurname : 'Cruz', name : 'Ted Cruz' },
  { party : REPUBLICAN, key : 'fiorina', displaySurname : 'Fiorina', name : 'Carly Fiorina' },
  { party : REPUBLICAN, key : 'gilmore', displaySurname : 'Gilmore', name : 'Jim Gilmore' },
  { party : REPUBLICAN, key : 'huckabee', displaySurname : 'Huckabee', name : 'Mike Huckabee' },
  { party : REPUBLICAN, key : 'kasich', displaySurname : 'Kasich', name : 'John Kasich' },
  { party : REPUBLICAN, key : 'paul', displaySurname : 'Paul', name : 'Rand Paul' },
  { party : REPUBLICAN, key : 'rubio', displaySurname : 'Rubio', name : 'Marco Rubio' },
  { party : REPUBLICAN, key : 'santorum', displaySurname : 'Santorum', name : 'Rick Santorum' },
  { party : REPUBLICAN, key : 'trump', displaySurname : 'Trump', name : 'Donald Trump' }
];

// oh god, this is an absurd, but the only way of getting these widths right
var canvas = document.createElement('canvas');
var ctx = canvas.getContext('2d');
ctx.font = 'bold 13px Officina, Calibri, Arial, sans-serif, Lucida Grande, Arial Unicode MS'
// told you const is not a thing here
CANDIDATES.forEach(d => {
  d.displaySurnameWidth = ctx.measureText(d.displaySurname.toUpperCase()).width
});

// console.log(CANDIDATES);

const PRIMARIES = {
  DEM : {
    fullDelegateCount : 4764,
    colours : ['#005994','#2eb6bc','#7199ad']
  },
  GOP : {
    fullDelegateCount : 2472,
    colours : ['#e30613','#ed5755','#f49a99','#ce96a1','#a25e7f','#941247',
               '#866b67','#ccaf88','#fed700','#f0ae00','#cd881d','#ea5f10']
  }
}

var months = [ 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
               'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec' ];

var dateLabelFormat = d3.time.format('%b %e');
// the null date is here to handle the superdelegates, which are assigned
// 1st January but this does not reflect a real date
var nullDate = new Date('01/01/2016').getTime();
class DateLabel extends React.Component {
  static get defaultProps() {
    return {
      date : null,
      position : [162,50]
    };
  }
  get formattedDate() {
    return this.props.date ? dateLabelFormat(this.props.date).toUpperCase() : '';
  }
  render() {
    if(this.props.date && this.props.date.getTime() === nullDate) {
      return (<text></text>);
    }
    var textProps = {
      className : 'date-label',
      transform : generateTranslateString(...this.props.position),
      textAnchor : 'middle'
    };

    return (<text {...textProps}>{this.formattedDate}</text>);
  }
}

class USPrimaryElement extends React.Component {
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
    var translate = generateTranslateString(...this.position);

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

class MonthGroup extends BoundedSVG {
  static get defaultProps() {
    return Im.extend(super.defaultProps, {
      duration : 300
    });
  }
  render() {
    var scale = this.props.scale;
    var cumulative = this.leftBound - 2;
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

class PrimaryTrace extends React.Component {
  render() {
    var el = RFD.createElement('g');
    var sel = d3.select(el);

    var pathFn = d3.svg.line()
      .x((d,idx) => this.props.xScale(idx))
      .y((d,idx) => this.props.yScale(d.delegates[idx]))
      .interpolate('step-after');

    return el.toReact();
  }
}
var primaryGraphPadding = 5;
class PrimaryGraph extends BoundedSVG {
  constructor(...args) {
    super(...args);
    this.el = RFD.createElement('g');
  }
  static get defaultProps() {
    return Im.extend(super.defaultProps, {
      candidates : []
    });
  }
  d3render() {
    // this is a postfix for the label widths
    var sel = this.selectRef('main');
    var padding = primaryGraphPadding;

    var labelContainers = sel.selectAll('.trace-label-container');
    labelContainers.each(function() {
      var sel = d3.select(this);
      var textWidth = sel.select('text').node().getBoundingClientRect().width;
      sel.select('rect').attr({
        width : textWidth + padding * 2
      })
    });
  }
  render() {
    var el = this.el;
    var sel = d3.select(el);
    sel.attr({ ref : 'main' });

    var lastEnteredElection = this.props.lastEnteredElection;
    var numPrimaries = this.props.numPrimaries;

    var xScale = this.props.xScale;
    var yScale = this.props.yScale.copy().range([
      this.bottomBound, this.topBound
    ]);

    var pathFn = d3.svg.line()
      .x((d,idx) => xScale(idx))
      .y((d,idx) => yScale(d))
      .interpolate('step');

    var traceJoin = sel.selectAll('.trace')
      .data(this.props.candidates);

    traceJoin.enter().append('svg:path')
      .classed('trace', true);

    traceJoin.exit().remove();

    traceJoin.attr({
      fill : 'none',
      stroke : d => d.colour,
      strokeWidth: 2,
      d : d => pathFn(
        d.delegates.slice(0, this.props.lastEnteredElection + 1)
      )
    });

    var padding = primaryGraphPadding;

    // we'll aim to show the first six, because let's not go mad
    var cutoffCandidate = this.props.candidates.slice(0,6).pop();
    var countTarget = cutoffCandidate.delegates[numPrimaries - 1];
    // var labeledCandidates = this.props.candidates.slice(0,6);
    var labeledCandidates = this.props.candidates.filter(
      c => c.delegates[numPrimaries - 1] >= countTarget
    );

    var nodes = labeledCandidates.map((d, idx) => ({
      anchor : true,
      candidate : d,
      startX : xScale(lastEnteredElection) + 5,
      startY : yScale(d.delegates[numPrimaries - 1]),
      x : xScale(lastEnteredElection) + 5,
      // the idx just gives them a little nudge
      y : yScale(d.delegates[numPrimaries - 1]) + idx
    }));
    var candidateCount = nodes.length;
    var links = nodes.map((d, idx) => ({
      source : idx,
      target : idx + candidateCount,
      value : 1
    }));
    nodes = nodes.concat(nodes.map(d => Im.extend(d, { anchor : false })));

    var force = d3.layout.force()
      .linkDistance(0)
      .linkStrength(1)
      .gravity(0)
      .chargeDistance(40)
      .charge(d => d.anchor ? 0 : -90)
      .friction(0.8);

    force.nodes(nodes).links(links).start();
    force.on('tick', d => {
      nodes.forEach(n => {
        n.x = n.startX,
        n.y = n.anchor ? n.startY : bindValueToRange(n.y, 10, 140)
      });
    });
    for(let i=0;i<2000;++i) { force.tick(); }
    force.stop();

    var labelJoin = sel.selectAll('.trace-label-container')
      .data(nodes.filter(d => !d.anchor));

    labelJoin.enter().append('svg:g')
      .classed('trace-label-container', true);
    labelJoin.exit().remove();
    labelJoin
      .attr('transform', d => generateTranslateString(d.x, d.y))
      .each(function(d) {
        var label = `${d.candidate.displaySurname} ${d.candidate.delegates[lastEnteredElection]}`;
        var rect = guarantee(this, 'trace-bg', 'svg:rect')
          .attr({
            fill : d.candidate.colour,
            width : ctx.measureText(label.toUpperCase()).width + padding * 2,
            height : 18,
            y : -9
          });
        var text = guarantee(this, 'trace-label', 'svg:text')
          .text(label)
          .attr({
            y : 4,
            x : padding
          });
      });

    return el.toReact();

    // var traces = this.props.candidates.map(d => {
    //   console.log(d);
    //   var traceProps = {
    //     key : d.key,
    //     xScale : xScale,
    //     yScale : yScale,
    //     data : d
    //   };
    //
    //   return (<PrimaryTrace {...traceProps} />);
    // });
    //
    // return (<g>
    //   {traces}
    // </g>);
  }
}

class PrimariesKey extends React.Component {
  static get defaultProps() {
    return {
      dim : 10,
      x : 0,
      y : 0,
      colour : '#cccccc',
      strokeColour : '#aaaaaa',
      strokeWidth : 0.75
    };
  }
  render() {
    var groupProps =  {
      className : 'primaries-legend',
      transform : generateTranslateString(245, this.props.fullHeight - 20)
    };
    var rectProps = {
      width : this.props.dim,
      height : this.props.dim,
      x : -this.props.dim / 2,
      y : -this.props.dim / 2,
      fill : this.props.colour,
      stroke : this.props.strokeColour,
      strokeWidth : this.props.strokeWidth,
      transform : generateTranslateString(0, 0)
    };
    var circProps = {
      r : this.props.dim/2 + 1, // we add 1 just to make things look nicer
      fill : this.props.colour,
      stroke : this.props.strokeColour,
      strokeWidth : this.props.strokeWidth,
      transform : generateTranslateString(100, 0)
    };
    var starProps = {
      fill : this.props.colour,
      stroke: this.props.strokeColour,
      strokeWidth : this.props.strokeWidth,
      d : STAR_PATH,
      transform : generateTranslateString(200, 0)
    };

    return (<g {...groupProps}>
      <rect {...rectProps} />
      <text  x="18" y="5">Primary</text>
      <circle {...circProps} />
      <text x="118" y="5">Caucus</text>
      <path {...starProps} />
      <text x="218" y="5">Convention/other</text>
    </g>);
  }
}

export default class USPrimaries extends BoundedSVG {
  static get defaultProps() {
    return Im.extend(super.defaultProps, {
      showPrimaryGraph : true,
      duration : 250,
      rectSize : 22,
      party : DEMOCRAT,
      scale : d3.time.scale().range([10,585]).domain([
        new Date('01/30/2016'), new Date('06/10/2016')
      ])
    });
  }
  render() {
    // sort out the party we want to show
    var data = this.props.data.filter(d => d.party === this.props.party);

    var primaryGraphHeight = this.props.showPrimaryGraph ? 150 : 0;

    var candidates = CANDIDATES.filter(d => d.party === this.props.party);

    var primary = PRIMARIES[this.props.party];

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
          primaryEvents : this.props.primaryEvents,
          key : d.state,
          duration : this.props.duration,
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
      margin : [12, 10, 10],
      scale : scale,
      duration : this.props.duration,
      monthSections : primaryMonthSections,
      height: 30
    };

    // now let's work out their delegate tallies
    var numPrimaries = primaryDates.length;
    var candidateTallies = candidates.map(d => {
      var dateTallies = primaryDates.map(date => {
        var individualPrimaries = grouped[date];
        // the || is just to make sure we don't end up with strings
        return individualPrimaries.reduce(
          (memo, p) => memo + (p[`${d.key}_del`] || 0), 0
        )
      });
      return Im.extend(d, {
        delegates : dateTallies.map(
          (dT,idx) => dateTallies.slice(0, idx+1).reduce(
            (memo,n) => memo + n, 0
          )
        )
      });
    }).sort(
      (a,b) => b.delegates[numPrimaries - 1] - a.delegates[numPrimaries - 1]
    ).map((d,idx) => Im.extend(d, { colour : primary.colours[idx] }));

    // we also need to know how far to go...
    var maximumDelegates = 0;
    // we're making a key assumption here: that the total number
    // of allocated delegates can only go up over time
    var lastEnteredElection = primaryDates.map((d,idx) => {
      // this gives us the sum of delegates allocated at each step
      return candidateTallies.map(c => c.delegates[idx]).reduce(
        (memo, n) => {
          maximumDelegates = Math.max(maximumDelegates, n);
          return memo + n;
        }, 0
      );
    }).reduce((memo, n, idx, ary) => {
      // slightly annoying to grab this every time, but DOWN WITH
      // PREMATURE OPTIMIZATION, I SAY!
      var lastCount = ary[ary.length - 1];
      // note that the memo lags the index by one here, which means
      // the final output of the reduce is going to be one less than
      // the number we actually want
      return n === lastCount ? memo : idx;
    }, 0) + 1;

    maximumDelegates = Math.min(maximumDelegates * 1.1, primary.fullDelegateCount);

    var primaryGraphProps = {
      xScale : scale,
      yScale : d3.scale.linear().domain([0, maximumDelegates]),
      duration : this.props.duration,
      height : primaryGraphHeight,
      candidates : candidateTallies,
      lastEnteredElection : lastEnteredElection,
      numPrimaries : numPrimaries
    };

    var dateLabelProps = {
      date : this.props.focusPrimary ? this.props.focusPrimary.date : null,
      position: this.props.focusPrimary ?
        [
          scale(primaryDateComparisons.indexOf(this.props.focusPrimary.date.getTime())),
          this.props.showPrimaryGraph ? 160 : 10
        ] : [0,0]
    };

    var primaryGraph = this.props.showPrimaryGraph ?
      (<PrimaryGraph {...primaryGraphProps} />) :
      null;

    var groupTransform = `translate(0, ${primaryGraphHeight})`;
    return(<g>
      {primaryGraph}
      <g transform={groupTransform} className="primary-calendar">
        <MonthGroup {...monthGroupProps} />
        {stateElements}
      </g>
      <DateLabel {...dateLabelProps} />
      <PrimariesKey dim={this.props.rectSize} fullHeight={this.props.height} />
    </g>);
  }
}
