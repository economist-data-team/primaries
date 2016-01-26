import React from 'react';
import interactive from './interactive.js';
import InteractiveComponent from './interactive-component.js';

class LineGroup extends InteractiveComponent {
  render() {
    var colourBlocks = this.props.colours.map((c) => {
      var lineAttrs = {
        stroke : c,
        strokeWidth : 2,
        fill : 'transparent',
        x1: 0, y1: 0,
        x2: '100%', y2: '100%'
      }
      return (<svg className='colour-block'>
        <line {...lineAttrs}></line>
      </svg>)
    })

    return (<span className='colour-group'>
      {colourBlocks}
      <span className='colour-block-label'>{this.props.label}</span>
    </span>);
  }
}

export default class LineLegend extends InteractiveComponent {
  render() {
    var colours = this.props.colours.map((c) => {
      return(<LineGroup {...c} />);
    });

    var groupLabelElement = this.props.label ?
      (<span className='colour-group-label'>{this.props.label}</span>) : null;

    return(<div className='colour-legend'>
      {groupLabelElement}
      {colours}
    </div>);
  }
}
