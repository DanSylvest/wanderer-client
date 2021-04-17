import store from "../../../store";
import api from "../../../api.js";
import MultipleProvider from "../base/multipleProvider.js";
import ListProvider from "../base/listProvider.js";
import SubscriptionProvider from "../base/subscriptionProvider.js";
import {ChainsStore, ChainsExistenceStore, ChainStore} from "../../../store/modules/maps/chains.js";
import extend from "../../../env/tools/extend.js";

/**
 * @property {String} $solarSystemSource
 * @property {String} $solarSystemTarget
 * @property {Number} $massStatus
 * @property {Number} $timeStatus
 * @property {Number} $shipSizeType
 * @property {Number} $wormholeType
 * @property {Number} $countOfPassage
 * @property {Date}   $created
 * @property {Date}   $updated
 */
class Chain extends SubscriptionProvider {
    constructor(mapId, id) {
        super();

        this.mapId = mapId;
        this._id = id;
        this._vuexModulePath = ["maps", this.mapId, "chains", this._id];
        this._vuexTemplate = ChainStore;
        this._data = Object.create(null);

        this._addAccessData("solarSystemSource");
        this._addAccessData("solarSystemTarget");
        this._addAccessData("massStatus");
        this._addAccessData("timeStatus");
        this._addAccessData("shipSizeType");
        this._addAccessData("wormholeType");
        this._addAccessData("countOfPassage");
        this._addAccessData("created");
        this._addAccessData("updated");
    }
    destructor() {
        delete this.mapId;
        super.destructor();
    }

    _eventProcess(event) {
        let data = event.data;

        switch (event.type) {
            case "multipleEvents":
                event.data.map(this._eventProcess.bind(this));
                break;
            case "bulk":
            case "updated":
                this._data = {...this._data, ...event.data};
                break;
        }

        store.dispatch(`maps/${this.mapId}/chains/${this._id}/update`, data);
    }

    _createSubscriber() {
        return api.eve.map.link.subscribeData(this.mapId, this._id);
    }

    _emulateEvent () {
        return {
            type: "bulk",
            data: extend({}, this._data)
        };
    }

    markAsRemoved () {
        this._markedAsRemoved = true;

        if(this.observer.count() === 0){
            this.observer.stop();
        }
    }

    _onObserverUnsubscribed () {
        if(this._markedAsRemoved && this.observer.count() === 0) {
            this.observer.stop();
        }
    }
}

class ChainsListProvider extends ListProvider {
    constructor(mapId) {
        super();
        this.mapId = mapId;
    }
    destructor() {
        delete this.mapId;
        super.destructor();
    }

    _createModel(id) {
        return new Chain(this.mapId, id);
    }

    /**
     *
     * @param id
     * @returns {Chain}
     */
    get(id) {
        return super.get(id);
    }

    markAsRemoved (id) {
        this.has(id) && this.get(id).markAsRemoved();
    }
}

class ChainsExistenceProvider extends SubscriptionProvider {
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