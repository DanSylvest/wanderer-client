import SubscriptionProvider from "../../../base/subscriptionProvider";
import {ChainStore} from "../../../../../store/modules/maps/chains";
import store from "../../../../../store";
import api from "../../../../../api";
import extend from "../../../../../env/tools/extend";

/**
 * @property {String} $solarSystemSource
 * @property {String} $solarSystemTarget
 * @property {Number} $massStatus
 * @property {Number} $timeStatus
 * @property {Number} $shipSizeType
 * @property {Number} $wormholeType
 * @property {Number} $countOfPassage
 * @property {Date}   $created
 * @property {Date}   $updated
 */
export default class Chain extends SubscriptionProvider {
    constructor(mapId, id) {
        super();

        this.mapId = mapId;
        this._id = id;
        this._vuexModulePath = ["maps", this.mapId, "chains", this._id];
        this._vuexTemplate = ChainStore;
        this._data = Object.create(null);

        this._addAccessData("solarSystemSource");
        this._addAccessData("solarSystemTarget");
        this._addAccessData("massStatus");
        this._addAccessData("timeStatus");
        this._addAccessData("shipSizeType");
        this._addAccessData("wormholeType");
        this._addAccessData("countOfPassage");
        this._addAccessData("created");
        this._addAccessData("updated");
    }
    destructor() {
        delete this.mapId;
        super.destructor();
    }

    _eventProcess(event) {
        let data = event.data;

        switch (event.type) {
            case "multipleEvents":
                event.data.map(this._eventProcess.bind(this));
                break;
            case "bulk":
            case "updated":
                this._data = {...this._data, ...event.data};
                break;
        }

        store.dispatch(`maps/${this.mapId}/chains/${this._id}/update`, data);
    }

    _createSubscriber() {
        return api.eve.map.link.subscribeData(this.mapId, this._id);
    }

    _emulateEvent () {
        return {
            type: "bulk",
            data: extend({}, this._data)
        };
    }

    markAsRemoved () {
        this._markedAsRemoved = true;

        if(this.observer.count() === 0){
            this.observer.stop();
        }
    }

    _onObserverUnsubscribed () {
        if(this._markedAsRemoved && this.observer.count() === 0) {
            this.observer.stop();
        }
    }
}
