'use strict';

import d3 from 'd3';
import React from 'react';
import { Im, parseNumerics, connectMap }
  from './utilities.js';

import colours from './econ_colours.js';

import Header from './header.js';
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

var USPrimaries = connectMap({
  data : 'data',
  party : 'party'
})(USPrimariesRaw);
var ToggleBar = connectMap({
  value : 'party'
})(ToggleBarRaw);

class Chart extends ChartContainer {
  render() {
    var toggleProps = {
      items : [
        { title : 'Democrats', key : DEMOCRAT, value : DEMOCRAT },
        { title : 'Republicans', key : REPUBLICAN, value : REPUBLICAN }
      ],
      action : v => store.dispatch(updateParty(v))
    };
    var primaryProps = {
      primaryEvents : {
        onMouseEnter : d => store.dispatch(focusPrimary(d)),
        onMouseLeave : d => store.dispatch(clearFocusPrimary())
      }
    };

    return(
      <div className='chart-container'>
        <Header title="To come" subtitle="Also to come"/>
          <div className="party-toggle-container">
            <ToggleBar {...toggleProps} />
          </div>
        <svg width="595" height="550">
          <USPrimaries {...primaryProps} />
        </svg>
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
    return Im.extend(d, {
      date : dateParser.parse(d.date)
    });
  });
  data = data.map(parseNumerics);
  store.dispatch(updateData(data));
});
