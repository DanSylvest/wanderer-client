import SubscriptionProvider from "../base/subscriptionProvider";
import {LocationStore} from "../../../store/modules/characters/charactersStore";
import store from "../../../store";
import api from "../../../api";

export default class Location extends SubscriptionProvider {
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