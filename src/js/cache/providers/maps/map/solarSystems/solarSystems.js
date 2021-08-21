import MultipleProvider from "../../../base/multipleProvider.js";
import { SolarSystemsStore } from "../../../../../store/modules/maps/solarSystems.js";
import SolarSystemsListProvider from "./solarSystemsListProvider";
import SolarSystemExistenceProvider from "./solarSystemExistenceProvider";

/**
 * @property {SolarSystemExistenceProvider} existence
 * @property {SolarSystemsListProvider} list
 */
class SolarSystems extends MultipleProvider {
    constructor(mapId) {
        super();

        this._vuexModulePath = ["maps", mapId, "solarSystems"];
        this._vuexTemplate = SolarSystemsStore;

        this.addProvider("existence", () => new SolarSystemExistenceProvider(mapId));
        this.addProvider("list", () => new SolarSystemsListProvider(mapId));

        // придется сделать прерывание...
        setTimeout(() => this.watchingForRemove(), 0);
    }

    watchingForRemove () {
        this._unsubscribeExistence = this.existence.subscribe();
        this.existence.on("changedEvent", this._onChanged.bind(this));
        this.list.on("unsubscribed", this._onListUnsubscribed.bind(this))
    }

    _onChanged (event) {
        if(event.type === "removed") {
            this.list.markAsRemoved(event.solarSystemId);
        }
    }

    _onListUnsubscribed () {
        if(this.existence.observer.count() === 1) {
            this._unsubscribeExistence();
            delete this._unsubscribeExistence;
        }
    }

}

export default SolarSystems;