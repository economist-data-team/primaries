import Im from 'immutable';
import events from 'events';
let EventEmitter = events.EventEmitter;

export class Store extends EventEmitter {
  constructor(dispatcher, ...args) {
    super(...args);

    this.values = Im.Map();
  }
  set(key, value) {
    this.values = this.values.set(key, value);
    this.trigger('change');
  }
  delete(key) {
    this.values = this.values.delete(key);
    this.trigger('delete');
  }
}
