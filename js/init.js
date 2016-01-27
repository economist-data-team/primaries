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

import { updateData } from './actions.js';
import updateState from './reducers.js'

// var store = createStore(updateState);
const DEBUGCREATESTORE = compose(
  window.devToolsExtension() || (f => f)
)(createStore);
var store = DEBUGCREATESTORE(updateState);
window.store = store;

var USPrimaries = connectMap({
  data : 'data'
})(USPrimariesRaw);

class Chart extends ChartContainer {
  render() {
    return(
      <div className='chart-container'>
        <Header title="To come" subtitle="Also to come"/>
        <svg width="595" height="400">
          <USPrimaries />
        </svg>
      </div>
    );
  }
}
var props = {
  height : 320
};

// const DEMOCRAT = 'DEM';
// const REPUBLICAN = 'GOP';

var dateParser = d3.time.format('%d/%m/%Y');

var candidates = [
  { party : DEMOCRAT, 'key' : 'clinton', name : 'Hillary Clinton' },
  { party : DEMOCRAT, 'key' : 'omalley', name : 'Martin O’Malley' },
  { party : DEMOCRAT, 'key' : 'sanders', name : 'Bernie Sanders' },

  { party : REPUBLICAN, 'key' : 'bush', name : 'Jeb Bush' },
  { party : REPUBLICAN, 'key' : 'carson', name : 'Ben Carson' },
  { party : REPUBLICAN, 'key' : 'christie', name : 'Chris Christie' },
  { party : REPUBLICAN, 'key' : 'cruz', name : 'Ted Cruz' },
  { party : REPUBLICAN, 'key' : 'fiorina', name : 'Carly Fiorina' },
  { party : REPUBLICAN, 'key' : 'gilmore', name : 'Jim Gilmore' },
  { party : REPUBLICAN, 'key' : 'huckabee', name : 'Mike Huckabee' },
  { party : REPUBLICAN, 'key' : 'kasich', name : 'John Kasich' },
  { party : REPUBLICAN, 'key' : 'paul', name : 'Rand Paul' },
  { party : REPUBLICAN, 'key' : 'rubio', name : 'Marco Rubio' },
  { party : REPUBLICAN, 'key' : 'santorum', name : 'Rick Santorum' },
  { party : REPUBLICAN, 'key' : 'trump', name : 'Donald Trump' }
];

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
