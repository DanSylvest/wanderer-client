import Emitter from "../../../env/tools/emitter.js";
import Observer from "../../../env/observer.js";
import store from "../../../store";
import log from "../../../utils/log.js";

const LIFE_TIME = 1000 * 10;

class BaseProvider extends Emitter {
    constructor() {
        super();

        this._vuexModulePath = [];
        this._vuexTemplate = null;

        this.observer = new Observer(LIFE_TIME);
        this.observer.on("started", this._onObserverStarted.bind(this));
        this.observer.on("stopped", this._onObserverStopped.bind(this));
        this.observer.on("unsubscribed", this._onObserverUnsubscribed.bind(this));
    }

    _onObserverStarted() {
        this.emit("registered");
        !this._hasModule() && this._registerModule();
    }

    _onObserverStopped() {
        this._hasModule() && this._unregisterModule();
        this.emit("unregistered");
    }

    _onObserverUnsubscribed () {
        this.emit("unsubscribed");
    }

    _hasModule() {
        return store.hasModule(this._vuexModulePath);
    }

    _registerModule() {
        if (!this._hasModule()) {
            store.registerModule(this._vuexModulePath, this._vuexTemplate);
            log(log.WARN, this._vuexModulePath.join("/"), "has registered");
        }
    }

    _unregisterModule() {
        if (this._hasModule()) {
            store.unregisterModule(this._vuexModulePath);
            log(log.WARN, this._vuexModulePath.join("/"), "has unregistered");
        }
    }
}

export default BaseProvider;