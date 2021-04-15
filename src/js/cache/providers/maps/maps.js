/**
 * Created by Aleksey Chichenkov <cublakhan257@gmail.com> on 3/21/21.
 */

import store from "../../../store";
import SolarSystems from "./solarSystems.js";
import Chains from "./chains.js";
import api from "../../../api.js";
import HubsStore from "../../../store/modules/maps/hubsStore.js";
import MultipleProvider from "../base/multipleProvider.js";
import MapStore from "../../../store/modules/maps/mapStore.js";
import ListProvider from "../base/listProvider.js";
import SubscriptionProvider from "../base/subscriptionProvider.js";

class Hubs extends SubscriptionProvider {
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

    _emulateEvent() {
        return {
            type: "bulk",
            list: this._data.slice(0)
        };
    }
}

/**
 * @property {SolarSystems} solarSystems
 * @property {Chains} chains
 * @property {Hubs} hubs
 */
class Map extends MultipleProvider {
    constructor(id) {
        super();

        this._id = id;
        this._vuexModulePath = ["maps", this._id];
        this._vuexTemplate = MapStore;

        this.addProvider("solarSystems", () => new SolarSystems(this._id));
        this.addProvider("chains", () => new Chains(this._id));
        this.addProvider("hubs", () => new Hubs(this._id));
    }
}

class MapsListProvider extends ListProvider {
    _createModel(id) {
        return new Map(id);
    }

    /**
     *
     * @param id
     * @returns {Map}
     */
    get(id) {
        return super.get(id);
    }
}


/**
 * @property {MapsListProvider} list
 */
class Maps extends MultipleProvider {
    constructor() {
        super();

        this._vuexModulePath = ["maps"];
        this._vuexTemplate = MapStore;

        this.addProvider("list", () => new MapsListProvider());
    }
}

export default Maps;