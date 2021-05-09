import SubscriptionProvider from "../base/subscriptionProvider.js";
import store from "../../../store";
import api from "../../../api.js";
import ServerStatusStore from "../../../store/modules/server/status.js";

class ServerStatus extends SubscriptionProvider {
    constructor() {
        super();

        this._vuexModulePath = ["serverStatus"];
        this._vuexTemplate = ServerStatusStore;
        this._data = false;
    }

    _eventProcess(event) {
        this._data = event.isOnline;
        store.dispatch(`serverStatus/update`, event.isOnline);
    }

    _createSubscriber() {
        return api.eve.subscribeStatus();
    }

    _emulateEvent () {
        return {
            type: "bulk",
            data: this._data
        };
    }
}

export default ServerStatus;