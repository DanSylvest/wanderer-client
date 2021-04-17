import store from "../../../store";
import api from "../../../api.js";
import MultipleProvider from "../base/multipleProvider.js";
import ListProvider from "../base/listProvider.js";
import RequestProvider from "../base/requestProvider.js";
import {SolarSystemsStore, SolarSystemStore} from "../../../store/modules/universe/solarSystems.js";

/**
 * @property {String} $systemClass
 * @property {String} $security
 * @property {String} $solarSystemId
 * @property {String} $constellationId
 * @property {String} $regionId
 * @property {String} $solarSystemName
 * @property {String} $constellationName
 * @property {String} $regionName
 * @property {String} $systemType
 * @property {String} $typeDescription
 * @property {String} $typeName
 * @property {String} $isShattered
 * @property {String} $effectType
 * @property {String} $effectName
 * @property {String} $effectData
 * @property {String} $statics
 * @property {String} $solarSystemNameLC
 * @property {String} $triglavianInvasionStatus

 */
class SolarSystem extends RequestProvider {
    constructor(id) {
        super();

        this._id = id;
        this._vuexModulePath = ["solarSystems", this._id];
        this._vuexTemplate = SolarSystemStore;

        this._addAccessData("systemClass");
        this._addAccessData("security");
        this._addAccessData("solarSystemId");
        this._addAccessData("constellationId");
        this._addAccessData("regionId");
        this._addAccessData("solarSystemName");
        this._addAccessData("constellationName");
        this._addAccessData("regionName");
        this._addAccessData("systemType");
        this._addAccessData("typeDescription");
        this._addAccessData("typeName");
        this._addAccessData("isShattered");
        this._addAccessData("effectType");
        this._addAccessData("effectName");
        this._addAccessData("effectData");
        this._addAccessData("statics");
        this._addAccessData("solarSystemNameLC");
        this._addAccessData("triglavianInvasionStatus");
    }

    _eventProcess(event) {
        store.dispatch(`solarSystems/${this._id}/update`, event);
        this._data = event;
    }

    _createRequest() {
        return api.eve.universe.solarSystemInfo(this._id);
    }
}


class SolarSystemsListProvider extends ListProvider {
    _createModel(id) {
        return new SolarSystem(id);
    }

    /**
     *
     * @param id
     * @returns {SolarSystem}
     */
    get(id) {
        return super.get(id);
    }
}


/**
 * @property {SolarSystemsListProvider} list
 */
class SolarSystems extends MultipleProvider {
    constructor() {
        super();

        this._vuexModulePath = ["solarSystems"];
        this._vuexTemplate = SolarSystemsStore;

        this.addProvider("list", () => new SolarSystemsListProvider());
    }
}


export default SolarSystems;