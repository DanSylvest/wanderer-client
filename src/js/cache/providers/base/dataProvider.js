import BaseProvider from "./provider.js";
import CustomPromise from "../../../env/promise.js";

class DataProvider extends BaseProvider {
    constructor() {
        super();

        this._needLoadData = true;
        this._dataLoaded = false;
        this._data = null;

        this._readyPromise = new CustomPromise();
    }

    destructor() {
        this.reset();

        super.destructor();
    }

    reset () {
        this._needLoadData = true;
        this._dataLoaded = false;
        this._data = null;
    }

    _addAccessData (id) {
        Object.defineProperty(this, "$" + id, {
            get: () => this._data[id]
        })
    }

    _onObserverStarted() {
        this._readyPromise = new CustomPromise();
        super._onObserverStarted();

        if (this._needLoadData) {
            this._needLoadData = false;
            this._initRequest();
        } else {
            // eslint-disable-next-line no-debugger
            debugger;
        }
    }

    _onObserverStopped() {
        this.reset();
        this._readyPromise.native.cancel();
        super._onObserverStopped();
    }

    _initRequest() {

    }

    // eslint-disable-next-line no-unused-vars
    _eventHandler(event) {
        if (!this._dataLoaded)
            this._dataLoaded = true;

        this._eventProcess(event);
    }

    // eslint-disable-next-line no-unused-vars
    _eventProcess(event) {
        throw `Error - _createSubscriber should be overrides`;
    }

    readyPromise() {
        return this._readyPromise.native;
    }

    on(_type, _func, isOne) {
        let id = super.on(_type, _func, isOne);

        if (!this._needLoadData && this._dataLoaded && _type === "changedEvent") {
            _func.call(null, this._emulateEvent());
        }

        return id;
    }

    _emulateEvent () {
        return this._data;
    }

    subscribe() {
        let sid = this.observer.subscribe();
        return () => this.observer.unsubscribe(sid);
    }

    data() {
        return this._data;
    }
}

export default DataProvider;