import SubscriptionProvider from "../../base/subscriptionProvider";
import api from "../../../../api";
import extend from "../../../../env/tools/extend";
import store from "../../../../store";
import SingleValueStore from "../../../../store/base/singleValueStore";

/**
 * @property {Array} &list
 * */
export default class OnlineCharacters extends SubscriptionProvider {
    constructor(mapId) {
        super();

        this._data = [];
        this.mapId = mapId;
        this._vuexModulePath = ["maps", mapId, "onlineCharacters"];
        this._vuexTemplate = SingleValueStore.create();
        this._addAccessData("list");
    }

    _createSubscriber() {
        return api.eve.map.subscribeOnlineCharacters(this.mapId);
    }

    _emulateEvent() {
        return {
            type: "bulk",
            data: extend([], this._data)
        };
    }

    _eventProcess(event) {
        switch (event.type) {
            case "bulk":
                this._data = event.data;
                break;
            case "updatedLocation": {
                const {characterId, locationId} = event.data;
                this._data.update('characterId', characterId, {locationId});
            }
                break;
            case "updatedShipType": {
                const {characterId, shipTypeId} = event.data;
                this._data.update('characterId', characterId, {shipTypeId});
            }
                break;
            case "added":
                this._data.push(event.data);
                break;
            case "removed":
                this._data.eraseByObjectKey('characterId', event.data.characterId);
                break;
        }

        if (event.type !== 'multipleEvents') {
            store.dispatch(`maps/${this.mapId}/onlineCharacters/update`, this._data);
        }
    }

}