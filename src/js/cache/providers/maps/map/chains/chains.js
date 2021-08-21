import MultipleProvider from "../../../base/multipleProvider.js";
import {ChainsStore} from "../../../../../store/modules/maps/chains.js";
import ChainsListProvider from "./chainsListProvider";
import ChainsExistenceProvider from "./chainsExistenceProvider";


/**
 * @property {ChainsListProvider} list
 * @property {ChainsExistenceProvider} existence
 */
class Chains extends MultipleProvider {
    constructor(mapId) {
        super();

        this._vuexModulePath = ["maps", mapId, "chains"];
        this._vuexTemplate = ChainsStore;

        this.addProvider("list", () => new ChainsListProvider(mapId));
        this.addProvider("existence", () => new ChainsExistenceProvider(mapId));

        setTimeout(() => this.watchingForRemove(), 0);
    }

    watchingForRemove () {
        this._unsubscribeExistence = this.existence.subscribe();
        this.existence.on("changedEvent", this._onChanged.bind(this));
        this.list.on("unsubscribed", this._onListUnsubscribed.bind(this))
    }

    _onChanged (event) {
        if(event.type === "removed") {
            this.list.markAsRemoved(event.chainId);
        }
    }

    _onListUnsubscribed () {
        if(this.existence.observer.count() === 1) {
            this._unsubscribeExistence();
            delete this._unsubscribeExistence;
        }
    }
}

export default Chains;