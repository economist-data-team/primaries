import React from 'react';
import Option from './toggle-option.js';
import { Im } from './utilities.js';

/**
 * ToggleBar is a simple component for letting the user switch between
 * several views on the same interactive.
 *
 * @prop {array} items - the items to display in the toggle bar; this
 *       should be an array of objects formed like:
 *         { title : DISPLAY NAME, key : SLUG, value : SLUG }
 * @prop {function} action - function to run on pressing the toggle
 *       item. this should generally be dispatching an action to the
 *       store
 * @prop {string} value - the slug/key for the currently active item
 *       this should be bound to something on the store
 */
export default class ToggleBar extends React.Component {
  constructor(props) {
    super(...arguments);
  }
  static get defaultProps() {
    return {
      items : [
        { title : 'Foo', key : 'foo', value : 'foo' },
        { title : 'Bar', key : 'bar', value : 'bar' }
      ],
      action : (v) => { console.log(v); }
    };
  }
  get itemElements () {
    return this.props.items.map((item) => {
      item = Im.extend(item, {
        key : item.value,
        action : this.props.action,
        active : item.value === this.props.value
      });
      return (<Option {...item} />);
    });
  }
  render() {
    return (<ul className='toggle-bar tab-bar'>{this.itemElements}</ul>);
  }
}
