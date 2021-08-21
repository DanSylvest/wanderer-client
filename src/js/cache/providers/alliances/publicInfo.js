import RequestProvider from "../base/requestProvider";
import {PublicInfoStore} from "../../../store/modules/alliances/alliancesStore";
import store from "../../../store";
import axios from "axios";
import extend from "../../../env/tools/extend";

export default class PublicInfo extends RequestProvider {
    constructor(id) {
        super();

        this._id = id;
        this._vuexModulePath = ["alliances", this._id, "publicInfo"];
        this._vuexTemplate = PublicInfoStore;
    }

    _emulateEvent() {
        return {
            type: "bulk",
            data: extend({}, this._data)
        };
    }

    /**
     *
     * @param event
     * @param event.creator_corporation_id {number}
     * @param event.creator_id {number}
     * @param event.date_founded {Date}
     * @param event.executor_corporation_id {number}
     * @param event.name {string}
     * @param event.ticker {string}
     * @private
     */
    _eventProcess(event) {
        const {
            creator_corporation_id: creatorCorporationId,
            creator_id: creatorId,
            date_founded: dateFounded,
            executor_corporation_id: executorCorporationId,
            name,
            ticker,
        } = event;

        const processed = {creatorCorporationId, creatorId, dateFounded, executorCorporationId, name, ticker}

        store.dispatch(`alliances/${this._id}/publicInfo/update`, processed);
        this._data = processed;
    }

    async _createRequest() {
        try {
            const res = await axios.get(`https://esi.evetech.net/latest/alliances/${this._id}/?datasource=tranquility`);
            return res.data;
        } catch (e) {
            console.error(e);
        }
    }
}
