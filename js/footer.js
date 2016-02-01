import React from 'react';

export default class Header extends React.Component {
  static get defaultProps() {
    return {
      sources : [],
      notes : {}
    };
  }
  render() {
    var sourceLabel = (this.props.sources.substr || this.props.sources.length === 1) ? "Source" : "Sources";
    var sources = this.props.sources.substr ? this.props.sources : this.props.sources.join('; ');

    return (
      <div className='interactive-footer'>
        <div className="notes">
          {this.props.notes}
        </div>
        <div className="source">{sourceLabel}: {sources}</div>
      </div>
    );
  }
}
