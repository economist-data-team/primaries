import React from 'react';

export default class Header extends React.Component {
  render() {
    return (
      <div className='interactive-header'>
        <h1>{this.props.title}</h1>
        <h2>{this.props.subtitle}</h2>
      </div>
    );
  }
}
