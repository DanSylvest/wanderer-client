import SubscriptionProvider from "../../../base/subscriptionProvider";
import {SolarSystemStore} from "../../../../../store/modules/maps/solarSystems";
import extend from "../../../../../env/tools/extend";
import store from "../../../../../store";
import api from "../../../../../api";

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
export default class SolarSystem extends SubscriptionProvider {
    constructor(mapId, id) {
        super();

        this.mapId = mapId;
        this._id = id;
        this._vuexModulePath = ["maps", mapId, "solarSystems", this._id];
        this._vuexTemplate = SolarSystemStore;
        this._data = Object.create(null);

        this._addAccessData("isLocked");
        this._addAccessData("name");
        this._addAccessData("userName");
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

        if (event.type !== 'multipleEvents') {
            store.dispatch(`maps/${this.mapId}/solarSystems/${this._id}/update`, data);
        }
    }

    _createSubscriber() {
        return api.eve.map.solarSystem.subscribeData(this.mapId, this._id);
    }

    _emulateEvent() {
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