import React from 'react';
import interactive from './interactive.js';
import InteractiveComponent from './interactive-component.js';

class ColourGroup extends InteractiveComponent {
  render() {
    var colourBlocks = this.props.colours.map((c) => {
      var colour, label;
      if(c.colour && c.label) {
        colour = c.colour;
        label = c.label;
      } else {
        colour = c;
      }
      var style = {
        backgroundColor : colour
      };
      var labelElement = label ? (<span className='colour-block-label'>{label}</span>) : null;
      return (<span>
        <span className='colour-block' style={style}></span>
        {labelElement}
      </span>)
    })

    var groupLabelElement = this.props.label ?
      (<span className='colour-group-label'>{this.props.label}</span>) : null;
    return (<span className='colour-group'>
      {groupLabelElement}
      {colourBlocks}
    </span>);
  }
}

export default class ColourLegend extends InteractiveComponent {
  constructor(props) {
    super(...arguments);
    this.state = {
      colours : props.colours
    };
  }
  static get defaultProps() {
    return {
      name : 'main'
    };
  }
  render() {
    var colours = this.state.colours.map((c) => {
      return(<ColourGroup {...c} />);
    });
    return(<div className='colour-legend'>
      {colours}
    </div>);
  }
}
