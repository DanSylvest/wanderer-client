import DataProvider from "./dataProvider.js";

class SubscriptionProvider extends DataProvider {
    constructor() {
        super();
    }

    _initRequest() {
        this._dataSubscriber = this._createSubscriber();
        this._dataSubscriber.on("change", this._eventHandler.bind(this));
        this._dataSubscriber.subscribe();
    }

    _createSubscriber() {
        throw `Error - _createSubscriber should be overrides`;
    }

    _unsubscribe () {
        this._dataSubscriber.unsubscribe();
        this._dataSubscriber = null;
    }

    _onObserverStopped() {
        this._unsubscribe();

        super._onObserverStopped();
    }

    _eventHandler(event) {
        super._eventHandler(event);

        if (event.type === "bulk")
            this._readyPromise.resolve();

        this.emit("changedEvent", event);
        this.emit("changed", this.data());
    }
}

export default SubscriptionProvider;