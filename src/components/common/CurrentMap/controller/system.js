import Emitter from "../../../../js/env/tools/emitter";
import cache from "../../../../js/cache/cache.js";
import exists from "../../../../js/env/tools/exists";
import extend from "../../../../js/env/tools/extend.js";

class System extends Emitter {
    constructor (_map, _mapId, id) {
        super();

        this.map = _map;
        this.mapId = _mapId;
        this.id = id;
        this.position = null;
        this.markerId = this.map.createMarker(this.id, {});
        this._data = Object.create(null);
        this._handlerStaticDataChanged = null;
        this._handlerDynamicDataChanged = null;
    }
    init () {
        this.initProviders();

        return Promise.all([
            this._staticSolarSystem.item.readyPromise(),
            this._mapSolarSystem.item.readyPromise(),
        ])
    }
    deinit () {
        this._data = Object.create(null);
        if(exists(this.markerId)) {
            this.map.removeMarker(this.markerId);
        }

        this.markerId = null;
        this.map = null;
        this.deinitProviders();
    }

    initProviders () {
        this._staticSolarSystem = cache.solarSystems.touch(this.id);
        this._handlerStaticDataChanged = this._staticSolarSystem.item.on("changed", this._onStaticDataChanged.bind(this));

        this._map = cache.maps.touch(this.mapId);
        this._mapSolarSystem = this._map.item.solarSystems.touch(this.id);

        this._handlerDynamicDataChanged = this._mapSolarSystem.item.on("changed", this._onDynamicDataChanged.bind(this));
    }

    deinitProviders () {
        if(this._staticSolarSystem)  {
            this._mapSolarSystem.item.off(this._handlerStaticDataChanged);
            this._staticSolarSystem.unsubscribe();
            this._staticSolarSystem = null;
        }

        if(this._mapSolarSystem) {
            this._mapSolarSystem.item.off(this._handlerDynamicDataChanged);
            this._mapSolarSystem.unsubscribe();
            delete this._mapSolarSystem;
        }

        this._map && this._map.unsubscribe();
        delete this._map;
    }

    _onDynamicDataChanged (data) {
        this._data = extend(this._data, data);

        if(exists(this.markerId))
            this.map.updateMarker(this.markerId, this._data);
    }

    _onStaticDataChanged (data) {
        this._data = extend(this._data, data);

        if(exists(this.markerId))
            this.map.updateMarker(this.markerId, this._data);
    }
    data () {
        return this._data;
    }
}

export default System;