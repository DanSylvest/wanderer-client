import SubscriptionProvider from "../base/subscriptionProvider";
import {ShipStore} from "../../../store/modules/characters/charactersStore";
import store from "../../../store";
import api from "../../../api";

export default class Ship extends SubscriptionProvider {
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