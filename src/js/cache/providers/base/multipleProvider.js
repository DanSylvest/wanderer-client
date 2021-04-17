import BaseProvider from "./provider.js";

class MultipleProvider extends BaseProvider {
    constructor() {
        super();

        this._subProviders = Object.create(null);
    }

    addProvider(id, instanceCbk) {
        this._subProviders[id] = {
            instance: instanceCbk(),
            subscriberId: null
        };
        this._subProviders[id].instance.on("registered", this._onSubProviderRegistered.bind(this, id));
        this._subProviders[id].instance.on("unregistered", this._onSubProviderUnregistered.bind(this, id));

        Object.defineProperty(this, id, {
            get() {
                return this._subProviders[id].instance;
            }
        });
    }

    _onSubProviderRegistered(id) {
        this._subProviders[id].unsubscriber = this.observer.subscribe();
    }

    _onSubProviderUnregistered(id) {
        if (this._subProviders[id].unsubscriber) {
            this.observer.unsubscribe(this._subProviders[id].subscriberId);
            this._subProviders[id].subscriberId = null;
        }
    }
}

export default MultipleProvider;