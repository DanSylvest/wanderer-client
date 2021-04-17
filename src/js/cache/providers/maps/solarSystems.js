import extend from "../../../env/tools/extend.js";
import api from "../../../api.js";
import store from "../../../store";
import MultipleProvider from "../base/multipleProvider.js";
import ListProvider from "../base/listProvider.js";
import SubscriptionProvider from "../base/subscriptionProvider.js";
import {SolarSystemStore, SolarSystemsStore, SolarSystemsExistenceStore} from "../../../store/modules/maps/solarSystems.js";

/**
 * @property {String} $isLocked
 * @property {String} $name
 * @property {String} $description
 * @property {String} $tag
 * @property {String} $status
 * @property {String} $signatures
 * @property {String} $position
 * @property {String} $onlineCount
 * @property {String} $onlineCharacters
 */
class SolarSystem extends SubscriptionProvider {
    constructor(mapId, id) {
        super();

        this.mapId = mapId;
        this._id = id;
        this._vuexModulePath = ["maps", mapId, "solarSystems", this._id];
        this._vuexTemplate = SolarSystemStore;
        this._data = Object.create(null);

        this._addAccessData("isLocked");
        this._addAccessData("name");
        this._addAccessData("description");
        this._addAccessData("tag");
        this._addAccessData("status");
        this._addAccessData("signatures");
        this._addAccessData("position");
        this._addAccessData("onlineCount");
        this._addAccessData("onlineCharacters");

        this._markedAsRemoved = false;
    }

    destructor() {
        delete this.mapId;
        super.destructor();
    }

    _eventProcess(event) {
        let data = event.data;

        switch (event.type) {
            case "multipleEvents":
                event.list.map(this._eventProcess.bind(this));
                break;
            case "bulk":
            case "systemUpdated":
            case "updatedSystemsPosition":
            case "onlineUpdate":
                this._data = extend(this._data, event.data);
                break;
            case "userJoin":
                this._data.onlineCharacters.push(event.data.characterId);
                data = {onlineCharacters: this._data.onlineCharacters};
                break;
            case "userLeave":
                this._data.onlineCharacters.removeByValue(event.data.characterId);
                data = {onlineCharacters: this._data.onlineCharacters};
                break;
        }

        store.dispatch(`maps/${this.mapId}/solarSystems/${this._id}/update`, data);
    }

    _createSubscriber() {
        return api.eve.map.solarSystem.subscribeData(this.mapId, this._id);
    }

    _emulateEvent() {
        return {
            type: "bulk",
            list: extend({}, this._data)
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

class SolarSystemsListProvider extends ListProvider {
    constructor(mapId) {
        super();
        this.mapId = mapId;
    }

    destructor() {
        delete this.mapId;
        super.destructor();
    }

    _createModel(id) {
        return new SolarSystem(this.mapId, id);
    }

    /**
     *
     * @param id
     * @returns {SolarSystem}
     */
    get(id) {
        return super.get(id);
    }

    markAsRemoved (id) {
        this.has(id) && this.get(id).markAsRemoved();
    }
}

class SolarSystemExistenceProvider extends SubscriptionProvider {
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