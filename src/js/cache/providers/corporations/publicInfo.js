import RequestProvider from "../base/requestProvider";
import {PublicInfoStore} from "../../../store/modules/characters/charactersStore";
import store from "../../../store";
import axios from "axios";
import extend from "../../../env/tools/extend";

export default class PublicInfo extends RequestProvider {
    constructor(id) {
        super();

        this._id = id;
        this._vuexModulePath = ["corporations", this._id, "publicInfo"];
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
     * @param event.alliance_id {number | undefined}
     * @param event.ceo_id {number}
     * @param event.creator_id {number}
     * @param event.date_founded {Date}
     * @param event.description {string}
     * @param event.home_station_id {number}
     * @param event.member_count {number}
     * @param event.name {string}
     * @param event.shares {number}
     * @param event.tax_rate {number}
     * @param event.ticker {string}
     * @param event.url {string}
     * @param event.war_eligible {boolean}
     * @private
     */
    _eventProcess(event) {
        const {
            alliance_id: allianceId,
            ceo_id: ceoId,
            creator_id: creatorId,
            date_founded: dateFounded,
            description: description,
            home_station_id: home_stationId,
            member_count: memberCount,
            name,
            shares,
            tax_rate,
            ticker,
            url,
            war_eligible: warEligible,
        } = event;

        const processed = {
            allianceId,
            ceoId,
            creatorId,
            dateFounded,
            description,
            home_stationId,
            memberCount,
            name,
            shares,
            tax_rate,
            ticker,
            url,
            warEligible,
        }

        store.dispatch(`corporations/${this._id}/publicInfo/update`, processed);
        this._data = processed;
    }

    async _createRequest() {
        try {
            const res = await axios.get(`https://esi.evetech.net/latest/corporations/${this._id}/?datasource=tranquility`);
            return res.data;
        } catch (e) {
            console.error(e);
        }
    }
}
