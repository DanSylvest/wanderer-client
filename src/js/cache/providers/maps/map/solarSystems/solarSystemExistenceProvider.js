import SubscriptionProvider from "../../../base/subscriptionProvider";
import {SolarSystemsExistenceStore} from "../../../../../store/modules/maps/solarSystems";
import store from "../../../../../store";
import api from "../../../../../api";

export default class SolarSystemExistenceProvider extends SubscriptionProvider {
    constructor(mapId) {
        super();

        this.mapId = mapId;
        this._data = [];

        this._vuexModulePath = ["maps", mapId, "solarSystems", "existence"];
        this._vuexTemplate = SolarSystemsExistenceStore;
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
                this._data.push(event.solarSystemId);
                break;
            case "removed":
                this._data.removeByValue(event.solarSystemId);
                break;
        }

        store.dispatch(`maps/${this.mapId}/solarSystems/existence/update`, this._data);
    }

    _createSubscriber() {
        return api.eve.map.solarSystem.subscribeSolarSystems(this.mapId);
    }

    _emulateEvent() {
        return {
            type: "bulk",
            list: this._data.slice(0)
        };
    }
}