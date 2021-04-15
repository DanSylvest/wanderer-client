import MultipleProvider from "../base/multipleProvider.js";
import {ShipStore, ShipsStore, InfoStore} from "../../../store/modules/universe/ships.js";
import ListProvider from "../base/listProvider.js";
import RequestProvider from "../base/requestProvider.js";
import store from "../../../store";
import api from "../../../api.js";

/**
 * @property {String} $typeName
 * @property {Date}   $volume
 * @property {String} $description
 * @property {String} $mass
 * @property {String} $capacity
 * @property {String} $groupName
 */
class Info extends RequestProvider {
    constructor(id) {
        super();

        this._id = id;
        this._vuexModulePath = ["ships", this._id, "info"];
        this._vuexTemplate = InfoStore;

        this._addAccessData("typeName");
        this._addAccessData("volume");
        this._addAccessData("description");
        this._addAccessData("mass");
        this._addAccessData("capacity");
        this._addAccessData("groupName");
    }

    _eventProcess(event) {
        store.dispatch(`ships/${this._id}/info/update`, event);
        this._data = event;
    }

    _createRequest() {
        return api.eve.universe.shipInfo(this._id);
    }
}

/**
 * @property {Info} info
 */
class Ship extends MultipleProvider {
    constructor(id) {
        super();

        this._id = id;
        this._vuexModulePath = ["ships", this._id];
        this._vuexTemplate = ShipStore;

        this.addProvider("info", () => new Info(this._id));
    }
}

class ShipsListProvider extends ListProvider {
    _createModel(id) {
        return new Ship(id);
    }

    /**
     *
     * @param id
     * @returns {Ship}
     */
    get(id) {
        return super.get(id);
    }
}

/**
 * @property {ShipsListProvider} list
 */
class Ships extends MultipleProvider {
    constructor() {
        super();

        this._vuexModulePath = ["ships"];
        this._vuexTemplate = ShipsStore;

        this.addProvider("list", () => new ShipsListProvider());
    }
}

export default Ships;