import d3 from 'd3';
import React from 'react';
import { parseMarginArray } from './utilities.js';

// TODO: a standard way to swap between the parent element being
// <svg> and <g>
export default class SVGComponent extends React.Component {
  constructor() {
    super(...arguments);
    this.selectRef = this.selectRef.bind(this);
  }
  // this won't work, you can't do <{containerElement}>
  get containerElement() {
    return this.props.inSVG ? 'g' : 'svg';
  }
  get margin() { return parseMarginArray(this.props.margin); }
  selectRef(refName) {
    if(Object.keys(this.refs).indexOf(refName) === -1) { return; }
    return d3.select(React.findDOMNode(this.refs[refName]));
  }
  render() {
    return(<div>This function should be overwritten.</div>);
  }
  componentDidMount() {
    this.d3render();
  }
  componentDidUpdate() {
    this.d3render();
  }
  d3render() {
    // extend this function
  }
}
