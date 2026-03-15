/** Stub for node:events in renderer */
export default class EventEmitter {
  on() {
    return this;
  }
  emit() {
    return false;
  }
  removeListener() {
    return this;
  }
}
