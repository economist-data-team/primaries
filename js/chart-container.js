import React from 'react';

export default class ChartContainer extends React.Component {
  componentDidMount(props) {
    this.update(props);
  }
  componentWillReceiveProps(props) {
    this.update(props);
  }
  update(props) {
    // stub
  }
  render() {
    return (<div>
      The render method should have been overwritten.
    </div>);
  }
}
