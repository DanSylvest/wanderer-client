import SubscriptionProvider from "../base/subscriptionProvider";
import {OnlineStore} from "../../../store/modules/characters/charactersStore";
import store from "../../../store";
import api from "../../../api";

export default class Online extends SubscriptionProvider {
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