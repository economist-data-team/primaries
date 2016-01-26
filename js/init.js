'use strict';

import d3 from 'd3';
import React from 'react';
import { Im, parseNumerics, connectMap }
  from './utilities.js';

import colours from './econ_colours.js';

import Header from './header.js';
import ToggleBarRaw from './toggle-bar.js';
import ChartContainer from './chart-container.js';

import chroma from 'chroma-js';

import { createStore } from 'redux';
import { connect, Provider } from 'react-redux';

import { updateData } from './actions.js';
import updateState from './reducers.js'

var store = createStore(updateState);

class Chart extends ChartContainer {
  render() {
    return(
      <div className='chart-container'>
        <Header title="To come" subtitle="Also to come"/>
      </div>
    );
  }
}
var props = {
  height : 320
};

var chart = React.render(
  <Provider store={store}>
    {() => <Chart {...props} />}
  </Provider>, document.getElementById('interactive'));
