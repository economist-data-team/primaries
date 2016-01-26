import React from 'react';
import BoundedSVG from './bounded-svg.js';
import { Im, generateTranslateString } from './utilities.js';

function textFunc(_words, characters) {
  var _texts = [];

  while(_words.join(' ').length > characters) {
    let nextLine = [];
    while(nextLine.join(' ').length < characters) {
      nextLine.push(_words.shift());
    }
    if(nextLine.join(' ').length > characters) {
      _words.unshift(nextLine.pop());
    }
    _texts.push(nextLine);
  }

  _texts.push(_words);
  return _texts;
}

export default class ChartLabel extends BoundedSVG {
  static get defaultProps() {
    return Im.extend(super.defaultProps, {
      fontSize : 14,
      width : 110,
      text : 'Chart label',
      subtitle: ''
    });
  }
  get textElements() {
    // we're just going to make a guess here:
    var characters = this.props.width * 2 / this.props.fontSize;
    var words = this.props.text.split(' ');
    var wordssub = this.props.subtitle.split(' ');

    var texts = textFunc(words, characters);
    var subtitles = textFunc(wordssub, characters);

    return texts.map((line, idx) => {
      return (<text x="5" y={(idx + 1) * (this.props.fontSize * 1.2) + 3} fontSize={this.props.fontSize}>{line.join(' ')}</text>);
    }).concat(subtitles.map((line, idx) => {
      return (<text x="5" className="label-group-subtitle" y={(idx + (texts.length + 1)) * (this.props.fontSize * 1.2) + 3} fontSize={this.props.fontSize}>{line.join(' ')}</text>)
    }));
  }

  render() {
    var textTransform = generateTranslateString(this.leftBound, this.topBound);

    return(<g transform={textTransform} className="label-group">
      <rect width={this.props.width} height="3" fill="red" ></rect>
      {this.textElements}
    </g>)
  }
}
