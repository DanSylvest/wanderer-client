import SubscriptionProvider from "../../../base/subscriptionProvider";
import {ChainsExistenceStore} from "../../../../../store/modules/maps/chains";
import store from "../../../../../store";
import api from "../../../../../api";

export default class ChainsExistenceProvider extends SubscriptionProvider {
    constructor(mapId) {
        super();

        this.mapId = mapId;
        this._data = [];

        this._vuexModulePath = ["maps", mapId, "chains", "existence"];
        this._vuexTemplate = ChainsExistenceStore;
    }

    destructor() {
        delete this.mapId;
        super.destructor();
    }

    reset () {
        super.reset();
        this._data = [];
    }

    _eventProcess(event) {
        switch (event.type) {
            case "bulk":
                this._data = this._data.concat(event.list);
                break;
            case "add":
                this._data.push(event.chainId);
                break;
            case "removed":
                this._data.removeByValue(event.chainId);
                break;
        }

        store.dispatch(`maps/${this.mapId}/chains/existence/update`, this._data);
    }

    _createSubscriber() {
        return api.eve.map.link.subscribeLinks(this.mapId);
    }

    _emulateEvent () {
        return {
            type: "bulk",
            list: this._data.slice(0)
        };
    }
}