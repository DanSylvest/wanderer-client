import SubscriptionProvider from "../../base/subscriptionProvider";
import HubsStore from "../../../../store/modules/maps/hubsStore";
import store from "../../../../store";
import api from "../../../../api";

export default class Hubs extends SubscriptionProvider {
    constructor(mapId) {
        super();

        this.mapId = mapId;
        this._vuexModulePath = ["maps", this.mapId, "hubs"];
        this._vuexTemplate = HubsStore;
        this._data = [];
    }

    destructor() {
        delete this.mapId;
        super.destructor();
    }

    _eventProcess(event) {
        switch (event.type) {
            case "bulk":
                this._data = this._data.concat(event.list);
                break;
            case "add":
                this._data.push(event.hubId);
                break;
            case "removed":
                this._data.removeByValue(event.hubId);
                break;
        }

        store.dispatch(`maps/${this.mapId}/hubs/update`, this._data);
    }

    _createSubscriber() {
        return api.eve.map.routes.subscribeHubs(this.mapId);
    }

    reset () {
        super.reset();
        this._data = [];
    }

    _emulateEvent() {
        return {
            type: "bulk",
            list: this._data.slice(0)
        };
    }
}
