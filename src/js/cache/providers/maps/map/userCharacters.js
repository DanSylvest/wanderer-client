import SubscriptionProvider from "../../base/subscriptionProvider";
import api from "../../../../api";
import extend from "../../../../env/tools/extend";
import store from "../../../../store";
import SingleValueStore from "../../../../store/base/singleValueStore";

/**
 * @param a {{charId: string, online: boolean}}
 * @param b {{charId: string, online: boolean}}
 * @returns {number}
 */
const sortAllowedCharacters = (a, b) => {
    if (a.online > b.online)
        return -1;
    else if (a.online < b.online)
        return 1;
    else {
        if (a.charId > b.charId)
            return -1;
        else if (a.charId < b.charId)
            return 1;
        else
            return 0;
    }
}

/**
 * @property {Array} &list
 * */
export default class UserCharacters extends SubscriptionProvider {
    constructor(mapId) {
        super();

        this.mapId = mapId;
        this._vuexModulePath = ["maps", mapId, "userCharacters"];
        this._vuexTemplate = SingleValueStore.create();
        this._addAccessData("list");
    }

    _createSubscriber() {
        return api.eve.map.subscribeAllowedCharacters(this.mapId);
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
            case "addedToAvailable":
                this._data.push(event.data);
                break;
            case "removedFromAvailable":
                this._data.eraseByObjectKey("charId", event.data);
                break;
            case "onlineChanged":
                var obj = this._data.searchByObjectKey("charId", event.data.charId);
                obj.online = event.data.online;
                break;
        }

        this._data = this._data.sort(sortAllowedCharacters);

        store.dispatch(`maps/${this.mapId}/userCharacters/update`, this._data);
    }
}