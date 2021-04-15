import Emitter from "../../../../js/env/tools/emitter";
import extend from "../../../../js/env/tools/extend";
import exists from "../../../../js/env/tools/exists";
import cache from "../../../../js/cache/cache.js";

class Chain extends Emitter {
    constructor(controller, _map, _mapId, _id) {
        super();

        this.controller = controller;
        this.map = _map;
        this.mapId = _mapId;
        this.id = _id;
        this.uiLinkId = null;
        this._handlerDynamicDataChanged = null;
        this._data = Object.create(null);
    }

    init() {
        this.initProviders();
    }

    deinit() {
        if (exists(this.uiLinkId)) {
            this.map.removeLink(this.uiLinkId);
        }

        this.uiLinkId = null;
        this.map = null;
        this.deinitProviders();
    }

    initProviders() {
        let mapChain = this._getMapChainProvider();
        this._unsubscribeMapChain = mapChain.subscribe();
        this._handlerDynamicDataChanged = mapChain.on("changedEvent", this._onDynamicDataChanged.bind(this));
    }

    deinitProviders() {
        let mapChain = this._getMapChainProvider();
        if (exists(this._handlerDynamicDataChanged)) {
            mapChain.off(this._handlerDynamicDataChanged)
            delete this._handlerDynamicDataChanged;
        }

        if (exists(this._unsubscribeMapChain)) {
            this._unsubscribeMapChain();
            delete this._unsubscribeMapChain;
        }
    }

    _onDynamicDataChanged(/*data*/) {
        this._data = extend(this._data, this._getMapChainProvider().data());

        if (!exists(this.uiLinkId)) {
            let sourceMarkerId = this.controller.systems[this._data.solarSystemSource].markerId;
            let targetMarkerId = this.controller.systems[this._data.solarSystemTarget].markerId;
            this.uiLinkId = this.map.createLink(this.id, sourceMarkerId, targetMarkerId);
        }

        this.map.updateLink(this.uiLinkId, this._data);
    }

    data() {
        return this._data;
    }

    _getMapChainProvider() {
        return cache.maps.list.get(this.mapId).chains.list.get(this.id);
    }
}

export default Chain;
