import React from 'react';

export default class ReSortToggle extends React.Component {
  constructor(...args) {
    super(...args);

    this.toggleSort = this.toggleSort.bind(this);
  }
  static get defaultProps(){
    return {
      dataKey : 'none',
      label : 'Measure',
      trigger : (v) => { console.log(v); },
      sortDirection : 0 // +1 or -1
    };
  }
  toggleSort() {
    this.props.trigger(this.props.dataKey);
  }
  render() {
    return (<div onClick={this.toggleSort}>{this.props.label}</div>);
  }
}
