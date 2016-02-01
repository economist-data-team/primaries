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
import USPrimariesRaw, { DEMOCRAT, REPUBLICAN } from './us-primary.js';

import chroma from 'chroma-js';

import { createStore, compose } from 'redux';
import { connect, Provider } from 'react-redux';

import {
  updateData, updateParty, focusPrimary, clearFocusPrimary
} from './actions.js';
import updateState from './reducers.js'

// var store = createStore(updateState);
const DEBUGCREATESTORE = compose(
  window.devToolsExtension && window.devToolsExtension() || (f => f)
)(createStore);
var store = DEBUGCREATESTORE(updateState);
window.store = store;

var stateInfoDate = d3.time.format('%d %B');
class StateInfoWindowRaw extends React.Component {
  static get defaultProps() {
    return {
      state : null
    };
  }
  render() {
    if(!this.props.state) {
      // nothing to see here...
      return(<div></div>);
    }
    var state = this.props.state;
    var date = state.state === 'SPD' ? null : (<div>
      <dt>Date of {state.type}:</dt>
      <dd>{stateInfoDate(state.date)}</dd>
    </div>);
    return(<div className="state-info">
      <h4>{state.state_full_name}</h4>
      <dl>
        {date}
      </dl>
      <p className="state-info-text">{state.text}</p>
    </div>);
  }
}


var USPrimaries = connectMap({
  data : 'data',
  party : 'party',
  focusPrimary : 'focusPrimary'
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
      showPrimaryGraph : false,
      primaryEvents : {
        onMouseEnter : d => store.dispatch(focusPrimary(d)),
        onMouseLeave : d => store.dispatch(clearFocusPrimary())
      }
    };
    var primariesHeight = primaryProps.showPrimaryGraph ? 400 : 550;
    primaryProps.height = primariesHeight;

    return(
      <div className='chart-container'>
        <Header title="To come" subtitle="Also to come"/>
        <div className="party-toggle-container">
          <ToggleBar {...toggleProps} />
        </div>
        <div className="intro-text">
          <p>Beginning with Iowa on February 1st, use this calendar to follow
          the Democratic and Republican primaries and caucasus and track each
          party’s candidate of choice for the presidency state-by-state.</p>
          <p>We’ll update the delegate count after each election as results
          are declared, through “Super Tuesday” on March 1st and beyond to the
          final Democratic nomination in Washington, DC, on June 14th.</p>
        </div>
        <svg width="595" height={primariesHeight}>
          <USPrimaries {...primaryProps} />
        </svg>
        <StateInfoWindow />
        <Footer sources={['Real Clear Politics', 'The Green Papers', 'Ballotpedia']} />
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
  data = data.map((d) => {
    var text = d.text ? d.text :
      // this is not especially efficient, but it works so we'll
      // stick with it...
      //
      // we find both primaries for this state
      data.filter(d2 => d2.state === d.state)
        // strip down to just the texts
        .map(s => s.text)
        // and grab the first populated text field we find
        .reduce((memo, s) => memo ? memo : s, "");
    return Im.extend(d, {
      date : dateParser.parse(d.date),
      text : text
    });
  });
  data = data.map(parseNumerics);
  store.dispatch(updateData(data));
});
