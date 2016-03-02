import _ from 'lodash';
import d3 from 'd3';
import React from 'react';
import RFD from 'react-faux-dom';
import { Im, generateTranslateString, addDOMProperty } from './utilities.js';
import colours from './econ_colours.js';

import PrimariesKey from './primaries-key.js';
import DateLabel from './date-label.js';
import MonthGroup from './month-group.js';
import PrimaryGraph from './us-primary-graph.js';
import USPrimaryElement from './us-primary-element.js';
import StateInfoWindow from './us-primaries-state-infowindow.js';

import BoundedSVG from './bounded-svg.js';

addDOMProperty('fontWeight', 'font-weight');

// for when to switch to white text based on darkness of background
const LUMINANCE_THRESHOLD = 0.38;
const ENDED_COLOUR = colours.grey[6];

export const DEMOCRAT = 'DEM';
export const REPUBLICAN = 'GOP';

const FADEBACK_COLOUR = colours.grey[9];

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
  { party : DEMOCRAT, key : 'omalley', displaySurname : 'O’Malley', name : 'Martin O’Malley', ended : true },
  { party : DEMOCRAT, key : 'sanders', displaySurname : 'Sanders', name : 'Bernie Sanders' },

  { party : REPUBLICAN, key : 'bush', displaySurname : 'Bush', name : 'Jeb Bush', ended : true },
  { party : REPUBLICAN, key : 'carson', displaySurname : 'Carson', name : 'Ben Carson' },
  { party : REPUBLICAN, key : 'christie', displaySurname : 'Christie', name : 'Chris Christie', ended : true },
  { party : REPUBLICAN, key : 'cruz', displaySurname : 'Cruz', name : 'Ted Cruz' },
  { party : REPUBLICAN, key : 'fiorina', displaySurname : 'Fiorina', name : 'Carly Fiorina', ended : true },
  { party : REPUBLICAN, key : 'gilmore', displaySurname : 'Gilmore', name : 'Jim Gilmore', ended : true },
  { party : REPUBLICAN, key : 'huckabee', displaySurname : 'Huckabee', name : 'Mike Huckabee', ended : true },
  { party : REPUBLICAN, key : 'kasich', displaySurname : 'Kasich', name : 'John Kasich' },
  { party : REPUBLICAN, key : 'paul', displaySurname : 'Paul', name : 'Rand Paul', ended : true },
  { party : REPUBLICAN, key : 'rubio', displaySurname : 'Rubio', name : 'Marco Rubio' },
  { party : REPUBLICAN, key : 'santorum', displaySurname : 'Santorum', name : 'Rick Santorum', ended : true },
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

export const PRIMARIES = {
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

export default class USPrimaries extends BoundedSVG {
  static get defaultProps() {
    return Im.extend(super.defaultProps, {
      graphHandlers : {},
      focusCandidate : null,
      highlight : [],
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
    ).map((d,idx) => Im.extend(d, {
      colour : this.props.focusCandidate &&
        this.props.focusCandidate.key !== d.key ? FADEBACK_COLOUR :
        (d.ended ? ENDED_COLOUR : primary.colours[idx])
    }));

    var stateElements = [];
    for(let date in grouped) {
      let states = grouped[date];

      let elements = states.map((d,i) => {
        var dateIndex = primaryDateComparisons.indexOf(d.date.getTime());
        var winner = candidateTallies.reduce((memo, c) => {
          var pct_key = `${c.key}_pct`;
          var pct = d[pct_key];
          if(!pct) { return memo; }
          return memo.pct > pct ? memo : { candidate : c, pct : pct };
        }, { candidate : null, pct : 0 }).candidate;
        var props = Im.extend(d, {
          starPath : STAR_PATH,
          luminanceThreshold : LUMINANCE_THRESHOLD,
          primaryEvents : this.props.primaryEvents,
          winner : winner,
          colour : winner ? winner.colour : undefined,
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

    // we also need to know how far to go...
    var maximumDelegates = 0;
    var lastEnteredElection = null;
    // we're making a key assumption here: that the total number
    // of allocated delegates can only go up over time
    primaryDates.map((d,idx) => {
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
      lastEnteredElection = lastEnteredElection !== null ?
        lastEnteredElection :
        (n === lastCount ? idx : null);
      // the reduction isn't actually something we care about, so...
      return 0;
    }, 0);

    // we want to work out if there's enough delegates to merit
    // showing the "win line". This done if anyone is at 30% of total
    // delegates (i.e. 60% of the delegates they need to win).
    var winLine = null;
    if(maximumDelegates > primary.fullDelegateCount * 0.30) {
      maximumDelegates = Math.max(primary.fullDelegateCount / 2, maximumDelegates);
      winLine = Math.ceil((primary.fullDelegateCount + 0.1) / 2);
    }

    maximumDelegates = Math.min(maximumDelegates * 1.1, primary.fullDelegateCount);

    var primaryGraphProps = {
      xScale : scale,
      yScale : d3.scale.linear().domain([0, maximumDelegates]),
      duration : this.props.duration,
      height : primaryGraphHeight,
      candidates : candidateTallies,
      lastEnteredElection : lastEnteredElection,
      numPrimaries : numPrimaries,
      handlers : this.props.graphHandlers,
      winLine : winLine,
      focusCandidate : this.props.focusCandidate,
      // January is (very imperfect) code for superdelegates
      superdelegates : primaryDates.length > 0 && primaryDates[0].getMonth() === 0
    };

    var dateLabelProps = {
      date : this.props.focusPrimary ? new Date(this.props.focusPrimary.date) : null,
      position: this.props.focusPrimary ?
        [
          scale(primaryDateComparisons.indexOf(new Date(this.props.focusPrimary.date).getTime())),
          this.props.showPrimaryGraph ? 160 : 10
        ] : [0,0]
    };

    var primaryGraph = this.props.showPrimaryGraph ?
      (<PrimaryGraph {...primaryGraphProps} />) :
      null;

    var stateInfoWindowProps = {
      candidates : candidateTallies,
      state : this.props.focusPrimary
    };

    var groupTransform = `translate(0, ${primaryGraphHeight})`;
    return(<div>
      <svg width="595" height={this.props.height}>
        <g>
          {primaryGraph}
          <g transform={groupTransform} className="primary-calendar">
            <MonthGroup {...monthGroupProps} />
            {stateElements}
          </g>
          <DateLabel {...dateLabelProps} />
          <PrimariesKey dim={this.props.rectSize} fullHeight={this.props.height} starPath={STAR_PATH} />
        </g>
      </svg>
      <StateInfoWindow {...stateInfoWindowProps} />
    </div>);
  }
}
