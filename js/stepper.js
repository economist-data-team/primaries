import React from 'react';
import { Im } from './utilities.js';
import Option from './toggle-option.js';

export class Step {
  constructor(key, text, title) {
    this.key = key;
    this.text = text;
    this.title = title || key;
    this.value = key;
  }
}

export default class Stepper extends React.Component {
  constructor(...args) {
    super(...args);
    this.switchPrevious = this.switchPrevious.bind(this);
    this.switchNext = this.switchNext.bind(this);
  }
  static get defaultProps() {
    var items = [
      new Step('foo', 'Lorem ipsum foo bar baz'),
      new Step('bar', 'Lorem ipsum bar baz biz')
    ];
    return {
      items : items,
      action : (v) => { console.log(v); },
      value : items[0].value
    }
  }
  get activeItem() {
    return this.props.items.find(item => item.value === this.props.value);
  }
  get nextItem() {
    var idx = this.props.items.indexOf(this.activeItem);
    if(idx === this.props.items.length) { return null; }
    return this.props.items[idx + 1];
  }
  get prevItem() {
    var idx = this.props.items.indexOf(this.activeItem);
    if(idx === 0) { return null; }
    return this.props.items[idx - 1];
  }
  get itemElements() {
    return this.props.items.map((item) => {
      item = Im.extend(item, {
        key : item.value,
        action : this.props.action,
        active : item.value === this.props.value
      });

      return (<Option {...item} />)
    });
  }

  switchPrevious() {
    if(!this.prevItem) { return; }
    this.props.action(this.prevItem.value);
  }
  switchNext() {
    if(!this.nextItem) { return; }
    this.props.action(this.nextItem.value);
  }
  render() {
    var prevClass = ['advancer'], nextClass = ['advancer'];
    if(!this.prevItem) { prevClass.push('disabled'); }
    if(!this.nextItem) { nextClass.push('disabled'); }
          // <Option title="Prev" classNames={prevClass} action={this.switchPrevious} />
    return(
      <div className='stepper'>
        <div className='stepper-text'>{this.activeItem.text}</div>
        <ul className="tab-bar stepper-tabs">
          {this.itemElements}
          <Option title="Next" classNames={nextClass} action={this.switchNext} />
        </ul>
      </div>
    );
  }
}
