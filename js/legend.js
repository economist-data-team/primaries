import React from 'react';
import BoundedSVG from './bounded-svg.js';
import { Im, generateTranslateString } from './utilities.js';
import colours from './econ_colours.js';

export default class ChartLegend extends BoundedSVG {
  static get defaultProps() {
    return Im.extend(super.defaultProps, {
      rectWidth : 15,
      rectHeight : 15,
      gap: 20,
      fontSize : 14,
      legendLabel : "The label",
      legendItems : [
        { colour : 'red', label : 'One' },
        { colour : 'blue', label : 'Two' }
      ]
    });
  }

  get legendheader() {
    var characters = this.props.width * 2 / this.props.fontSize;
    var words = this.props.legendLabel.split(' ');
    var texts = [];

    while(words.join(' ').length > characters) {
      let nextLine = [];
      while(nextLine.join(' ').length < characters) {
        nextLine.push(words.shift());
      }
      if(nextLine.join(' ').length > characters) {
        words.unshift(nextLine.pop());
      }
      texts.push(nextLine);
    }

    texts.push(words);

   return texts.map((line, idx) => {
    return (<text className="label-group" x={this.leftBound} y={(idx + 1) * (this.props.fontSize * 1.2) + this.topBound} fontSize={this.props.fontSize}>{line.join(' ')}</text>);
       });
  }

  render() {
    var items = this.props.legendItems.map((d, idx) => {
      var transform = generateTranslateString(0, this.topBound + (idx + 1) * this.props.gap + 5);

      var rectProps = {
        x : this.leftBound,
        // y : this.topBound + (idx + 1) * this.props.gap,
        width : this.props.rectWidth,
        height : this.props.rectHeight,
        fill : d.colour
      };
      var textProps = {
        x : this.leftBound + this.props.rectWidth + 5,
        y : this.props.fontSize * 0.85,
        fontSize : this.props.fontSize
      };

      return (<g transform={transform}>
        <rect {...rectProps}></rect>
        <text {...textProps}>{d.label}</text>
      </g>);
    });

    return(<g>
      {this.legendheader}
      {items}
     </g>
    )
  }
}
