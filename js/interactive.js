import Im from 'immutable';
import events from 'events';
let EventEmitter = events.EventEmitter;

// the idea of a store is that it'll listen to a dispatcher and react
// to events on it with whatever thing its creator decides
export class Store extends EventEmitter {
  constructor(dispatcher, callbacks, initialValues, ...args) {
    super(...args);

    this._dispatcher = dispatcher;
    this._callbacks = Im.Set();

    for(let key in callbacks) {
      this._callbacks = this._callbacks.add(Im.Map({
        key : key, callback : callbacks[key], store : this
      }));
    }

    this.values = Im.Map(initialValues);
  }
  get callbacks() {
    return this._callbacks;
  }
  get(key) {
    return this.values.get(key);
  }
  set(key, value) {
    this.values = this.values.set(key, value);
    this.emit('change', this);
  }
  setMany(inserts) {
    this.values.merge(inserts);
    this.emit('change', this);
  }
  delete(key) {
    this.values = this.values.delete(key);
    this.emit('change', this);
  }
}

export class InteractiveManager {
  constructor() {
    this._stores = Im.Map();
  }
  get stores() {
    return this._stores.toJS();
  }
  get callbacks() {
    return this._stores.reduce((memo, store) => {
      return memo.union(store.callbacks);
    }, Im.Set());
  }
  action(key, ...args) {
    var triggers = this.callbacks.filter(i => i.get('key') === key);
    triggers.map((trigger) => {
      trigger.get('callback').apply(trigger.get('store'), args);
    });
  }

  // this overwrites stores that exist
  createStore(key, opts, initialValues = {}) {
    this._stores = this._stores.set(key, new Store(this, opts, initialValues));
  }
}

let interactive = new InteractiveManager();

window.interactive = interactive;

export default interactive;
