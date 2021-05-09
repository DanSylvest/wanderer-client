import store from "../../../store";
import {CharactersStore, CharacterStore, LocationStore, InfoStore, OnlineStore, ShipStore} from "../../../store/modules/characters/charactersStore.js";

import ListProvider from "../base/listProvider.js";
import MultipleProvider from "../base/multipleProvider.js";
import SubscriptionProvider from "../base/subscriptionProvider.js";
import RequestProvider from "../base/requestProvider.js";
import api from "../../../api.js";

class Online extends SubscriptionProvider {
    constructor(id) {
        super();

        this._id = id;
        this._vuexModulePath = ["characters", this._id, "online"];
        this._vuexTemplate = OnlineStore;
    }

    _eventProcess(event) {
        store.dispatch(`characters/${this._id}/online/update`, event.data);
        this._data = event.data;
    }

    _createSubscriber() {
        return api.eve.character.online(this._id);
    }
}

class Location extends SubscriptionProvider {
    constructor(id) {
        super();

        this._id = id;
        this._vuexModulePath = ["characters", this._id, "location"];
        this._vuexTemplate = LocationStore;
    }

    _eventProcess(event) {
        store.dispatch(`characters/${this._id}/location/update`, event.data);
        this._data = event.data;
    }

    _createSubscriber() {
        return api.eve.character.subscribeLocation(this._id);
    }
}

class Ship extends SubscriptionProvider {
    constructor(id) {
        super();

        this._id = id;
        this._vuexModulePath = ["characters", this._id, "ship"];
        this._vuexTemplate = ShipStore;
    }

    _eventProcess(event) {
        store.dispatch(`characters/${this._id}/ship/update`, event.data);
        this._data = event.data;
    }

    _createSubscriber() {
        return api.eve.character.subscribeShip(this._id);
    }
}

/**
 * @property {String} $name
 * @property {Date}   $addDate
 * @property {String} $corporation
 * @property {String} $corporationId
 * @property {String} $alliance
 * @property {String} $allianceId
 */
class Info extends RequestProvider {
    constructor(id) {
        super();

        this._id = id;
        this._vuexModulePath = ["characters", this._id, "info"];
        this._vuexTemplate = InfoStore;

        this._addAccessData("name");
        this._addAccessData("addDate");
        this._addAccessData("corporation");
        this._addAccessData("corporationId");
        this._addAccessData("alliance");
        this._addAccessData("allianceId");
    }

    _eventProcess(event) {
        store.dispatch(`characters/${this._id}/info/update`, event);
        this._data = event;
    }

    _createRequest() {
        return api.eve.character.protectedInfo(this._id);
    }
}


/**
 * @property {Online} online
 * @property {Location} location
 * @property {Ship} ship
 * @property {Info} info
 */
class Character extends MultipleProvider {
    constructor(id) {
        super();

        this._id = id;
        this._vuexModulePath = ["characters", this._id];
        this._vuexTemplate = CharacterStore;

        this.addProvider("online", () => new Online(this._id));
        this.addProvider("location", () => new Location(this._id));
        this.addProvider("ship", () => new Ship(this._id));
        this.addProvider("info", () => new Info(this._id));
    }
}

class CharactersListProvider extends ListProvider {
    _createModel(id) {
        return new Character(id);
    }

    /**
     *
     * @param id
     * @returns {Character}
     */
    get(id) {
        return super.get(id);
    }
}

/**
 * @property {CharactersListProvider} list
 */
class Characters extends MultipleProvider {
    constructor() {
        super();

        this._vuexModulePath = ["characters"];
        this._vuexTemplate = CharactersStore;

        this.addProvider("list", () => new CharactersListProvider());
    }
}

export default Characters;