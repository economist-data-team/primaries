'use strict';

import d3 from 'd3';
import React from 'react';
import { Im, parseNumerics, connectMap }
  from './utilities.js';

import colours from './econ_colours.js';

import Header from './header.js';
import Footer from './footer.js';
import ToggleBarRaw from './toggle-bar.js';
import ChartContainer from './chart-container.js';
import StateInfoWindowRaw from './us-primaries-state-infowindow.js';
import USPrimariesRaw, { DEMOCRAT, REPUBLICAN } from './us-primary.js';

import chroma from 'chroma-js';

import { createStore, compose } from 'redux';
import { connect, Provider } from 'react-redux';

import {
  updateData, updateParty, focusPrimary, clearFocusPrimary,
  focusCandidate, clearFocusCandidate
} from './actions.js';
import updateState from './reducers.js'

// var store = createStore(updateState);
const DEBUGCREATESTORE = compose(
  window.devToolsExtension && window.devToolsExtension() || (f => f)
)(createStore);
var store = DEBUGCREATESTORE(updateState);
window.store = store;

// var USPrimaries = connectMap({
//   data : 'data',
//   party : 'party',
//   focusPrimary : 'focusPrimary'
// })(USPrimariesRaw);
var USPrimaries = connect(function(state) {
  return {
    focusCandidate : state.focusCandidate,
    focusPrimary : state.focusPrimary,
    party : state.party,
    data : state.data.map(d => Im.extend(d, {
      date : new Date(d.date)
    })),
    graphHandlers : {
      mouseenter : d => store.dispatch(focusCandidate(d)),
      mouseleave : d => store.dispatch(clearFocusCandidate())
    }
  };
})(USPrimariesRaw);
var ToggleBar = connectMap({
  value : 'party'
})(ToggleBarRaw);
var StateInfoWindow = connectMap({
  state : 'focusPrimary'
})(StateInfoWindowRaw);

class Chart extends ChartContainer {
  render() {
    var toggleProps = {
      items : [
        { title : 'Democrats', key : DEMOCRAT, value : DEMOCRAT, classNames : ['democrat'] },
        { title : 'Republicans', key : REPUBLICAN, value : REPUBLICAN }
      ],
      action : v => store.dispatch(updateParty(v))
    };
    var primaryProps = {
      // showPrimaryGraph : false,
      primaryEvents : {
        onMouseEnter : d => store.dispatch(focusPrimary(d)),
        onMouseLeave : d => store.dispatch(clearFocusPrimary())
      }
    };
    var primariesHeight = 550;
    primaryProps.height = primariesHeight;

    var notes = [<span className="note">*Bound by primary result</span>];

    // <div className="intro-text">
    //   <p>Beginning with Iowa on February 1st, use this calendar to follow
    //   the Democratic and Republican primaries and caucasus and track each
    //   party’s candidate of choice for the presidency state-by-state.</p>
    //   <p>We’ll update the delegate count after each election as results
    //   are declared, through “Super Tuesday” on March 1st and beyond to the
    //   final Democratic nomination in Washington, DC, on June 14th.</p>
    // </div>

    return(
      <div className='chart-container'>
        <Header title="2016 US primary-elections calendar" subtitle="Delegate support, to date"/>
        <div className="party-toggle-container">
          <ToggleBar {...toggleProps} />
        </div>
        <USPrimaries {...primaryProps} />
        <Footer sources={['RealClearPolitics', 'The Green Papers', 'Ballotpedia', 'Associated Press']}
          notes={notes}/>
      </div>
    );
  }
}
var props = {
  height : 320
};

var dateParser = d3.time.format('%d/%m/%Y');

var chart = React.render(
  <Provider store={store}>
    {() => <Chart {...props} />}
  </Provider>, document.getElementById('interactive'));

d3.csv('./data/results.csv', (data) => {
  var fillMissingData = (d, attrName) => {
    var ret = d[attrName] ? d[attrName] :
    // this is not especially efficient, but it works so we'll
    // stick with it...
    //
    // we find both primaries for this state
    data.filter(d2 => d2.state === d.state)
      // strip down to just the texts
      .map(s => s[attrName])
      // and grab the first populated text field we find
      .reduce((memo, s) => memo ? memo : s, "");
    return ret;
  };

  data = data.map((d) => {
    return Im.extend(d, {
      date : dateParser.parse(d.date),
      text : fillMissingData(d, 'text'),
      obama2012 : fillMissingData(d, 'obama2012'),
      romney2012 : fillMissingData(d, 'romney2012')
    });
  });
  data = data.map(parseNumerics);
  store.dispatch(updateData(data));
});
