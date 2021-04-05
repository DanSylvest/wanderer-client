import Emitter from "../../../../js/env/tools/emitter";
import extend from "../../../../js/env/tools/extend";
import exists from "../../../../js/env/tools/exists";
import cache from "../../../../js/cache/cache.js";

class Chain extends Emitter {
    constructor (controller, _map, _mapId, _id) {
        super();

        this.controller = controller;
        this.map = _map;
        this.mapId = _mapId;
        this.id = _id;
        this.uiLinkId = null;
        this._handlerDynamicDataChanged = null;
        this._data = Object.create(null);
    }
    init () {
        this.initProviders();
    }
    deinit () {
        if(exists(this.uiLinkId)) {
            this.map.removeLink(this.uiLinkId);
        }

        this.uiLinkId = null;
        this.map = null;
        this.deinitProviders();
    }

    initProviders () {
        this._map = cache.maps.touch(this.mapId);
        this._mapChains = this._map.item.chains.touch(this.id);
        this._handlerDynamicDataChanged = this._mapChains.item.on("changed", this._onDynamicDataChanged.bind(this));
    }

    deinitProviders () {
        if(this._mapChains) {
            this._mapChains.item.off(this._handlerDynamicDataChanged);
            this._mapChains.unsubscribe();
            delete this._mapChains;
        }

        this._map && this._map.unsubscribe();
        delete this._map;
    }

    _onDynamicDataChanged (data) {
        this._data = extend(this._data, data);

        if(!exists(this.uiLinkId)) {
            let sourceMarkerId = this.controller.systems[this._data.solarSystemSource].markerId;
            let targetMarkerId = this.controller.systems[this._data.solarSystemTarget].markerId;
            this.uiLinkId = this.map.createLink(this.id, sourceMarkerId, targetMarkerId);
        }

        this.map.updateLink(this.uiLinkId, this._data);
    }

    data () {
        return this._data;
    }

}

export default Chain;
