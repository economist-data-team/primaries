import React from 'react';
import { generateTranslateString } from './utilities.js';

var dateLabelFormat = d3.time.format('%b %e');
// the null date is here to handle the superdelegates, which are assigned
// 1st January but this does not reflect a real date
var nullDate = new Date('01/01/2016').getTime();

export default class DateLabel extends React.Component {
  static get defaultProps() {
    return {
      date : null,
      position : [162,50]
    };
  }
  get formattedDate() {
    return this.props.date ? dateLabelFormat(this.props.date).toUpperCase() : '';
  }
  render() {
    if(this.props.date && this.props.date.getTime() === nullDate) {
      return (<text></text>);
    }
    var textProps = {
      className : 'date-label',
      transform : generateTranslateString(...this.props.position),
      textAnchor : 'middle'
    };

    return (<text {...textProps}>{this.formattedDate}</text>);
  }
}
