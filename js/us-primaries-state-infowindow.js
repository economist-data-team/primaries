import d3 from 'd3';
import React from 'react';

var stateInfoDate = d3.time.format('%B %e');

export default class StateInfobox extends React.Component {
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
    var block = state.state === 'SPD' ? null : (<div>
      <div>Date of {state.type}: {stateInfoDate(state.date)}</div>
      <div>Delegates determined by election: {state.pledged}</div>
    </div>);
    var textBlock = state.text ? (<p className="state-info-text">{state.text}</p>) : null;
    return(<div className="state-info">
      <h4>{state.state_full_name}</h4>
      {block}
      {textBlock}
    </div>);
  }
}
