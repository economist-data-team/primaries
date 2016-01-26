import React from 'react';
import { parseNumerics } from './utilities.js';

export default class Chart extends React.Component {
  componentDidMount() { this.update(this.props); }
  componentWillReceiveProps(props) { this.update(props); }
  update(props) {
    // stub
  }
  render() {
    return(<div>This function should be overwritten.</div>);
  }
}
