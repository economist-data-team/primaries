import React from 'react';

export default class Header extends React.Component {
  static get defaultProps() {
    return {
      sources : [],
      sourceItal : [],
      notes : {}
    };
  }
  render() {
    var sourceLabel = (this.props.sources.substr || this.props.sources.length === 1) ? "Source" : "Sources";
    var sources = this.props.sources.substr ? [this.props.sources] : this.props.sources;

    var sourceElements = sources.map((s,idx) => {
      var style = { fontStyle : this.props.sourceItal[idx] ? 'italic' : null };
      return (<span className="source-element" style={style}>{s}</span>);
    });

    return (
      <div className='interactive-footer'>
        <div className="notes">
          {this.props.notes}
        </div>
        <div className="source">{sourceLabel}: {sourceElements}</div>
      </div>
    );
  }
}
