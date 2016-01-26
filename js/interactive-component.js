import Im from 'immutable';
import React from 'react';
import interactive from './interactive.js'

export default class InteractiveComponent extends React.Component {
  constructor(props) {
    super(...arguments);

    this._callbacks = Im.Map();

    this._storeBindings = props && props.storeBindings;
  }
  componentDidMount() {
    if(this._storeBindings) {
      for(let s of this._storeBindings) {
        let store = s[0];
        let callback = s[1];

        this._callbacks = this._callbacks.set(callback, callback.bind(this));

        store.on('change', this._callbacks.get(callback));
      }
    }
  }
  componentWillUnmount() {
    if(this._storeBindings) {
      for(let s of this._storeBindings) {
        let store = s[0];
        let callback = s[1];

        store.off('change', this._callbacks.get(callback));
      }
    }
  }
  // get interactive() {
  //   return this.props.interactive;
  // }
  // get actions() {
  //   return this.props.interactive.actions;
  // }
  render() {
    return (<div>This function should be overwritten.</div>);
  }
}
