import RequestProvider from "../base/requestProvider";
import {InfoStore} from "../../../store/modules/characters/charactersStore";
import store from "../../../store";
import api from "../../../api";

/**
 * @property {String} $name
 * @property {Date}   $addDate
 * @property {String} $corporation
 * @property {String} $corporationId
 * @property {String} $alliance
 * @property {String} $allianceId
 */
export default class Info extends RequestProvider {
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

    async _createRequest() {
        // const res = await axios.get(`https://esi.evetech.net/latest/characters/${this._id}/?datasource=tranquility`);
        // debugger;
        return api.eve.character.protectedInfo(this._id);
    }
}
