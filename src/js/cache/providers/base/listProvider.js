import BaseProvider from "./provider.js";

class ListProvider extends BaseProvider {
    constructor() {
        super();

        this._items = Object.create(null);
    }

    destructor() {
        this.observer.destructor();

        super.destructor();
    }

    _onObserverStarted() {
        this.emit("registered");
    }

    _onObserverStopped() {
        this.emit("unregistered");
    }

    get(id) {
        if (!this._items[id]) {
            this._items[id] = {
                instance: this._createModel(id),
                subscriberId: null
            };
            this._items[id].instance.on("registered", this._onItemRegistered.bind(this, id));
            this._items[id].instance.on("unregistered", this._onItemUnregistered.bind(this, id));
        }

        return this._items[id].instance;
    }

    has (id) {
        return !!this._items[id];
    }

    // eslint-disable-next-line no-unused-vars
    _createModel(id) {
        throw `Error - _createModel should be overlapped`;
    }

    _onItemRegistered(id) {
        this._items[id].subscriberId = this.observer.subscribe();
    }

    _onItemUnregistered(id) {
        this.observer.unsubscribe(this._items[id].subscriberId);
        this._items[id].subscriberId = null;
        this._items[id].instance.destructor();
        delete this._items[id];
    }
}

export default ListProvider;