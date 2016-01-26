import React from 'react';

/**
 * A tooltip
 *
 * @prop {boolean} show - whether the tooltip should be shown
 * @prop {function} template - how to format the data point given to
 *       the tooltip into a display. Takes `this.props` as an argument
 */
export default class Tooltip extends React.Component {
  static get defaultProps() {
    return {
      template : () => {
        return (<span>Hark! a tooltip.</span>);
      },
      show : false,
      bottomAnchor : false,
      mouseX : 10,
      mouseY : 10,
      fullWidth : 595
    }
  }
  render() {
    var x = this.props.mouseX;
    var rightAlign = x > this.props.fullWidth / 2;
    var verticalAnchor = this.props.bottomAnchor ? 'bottom' : 'top';

    var tooltipProps = {
      style : {
        left : rightAlign ? '' : x,
        right : rightAlign ? this.props.fullWidth - x : '',
        top : this.props.mouseY
      },
      className : ['tooltip-outer', this.props.show ? null : 'tooltip-hidden']
        .filter((n => n != null)).join(' ')
    };
    // tooltipProps.style[verticalAnchor] = this.props.mouseY;
    // console.log(this.props.bottomAnchor, verticalAnchor);

    var innerDivStyle = {
      left : rightAlign ? '' : 0,
      right : rightAlign ? 0 : ''
    };
    innerDivStyle[verticalAnchor] = 0;

    var innerDiv = (<div className='tooltip' style={innerDivStyle}>{this.props.template(this.props)}</div>);

    return(<div {...tooltipProps}>{this.props.template(this.props)}</div>);
  }
}
