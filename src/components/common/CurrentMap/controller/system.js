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

        let mapSolarSystem = this._getMapSolarSystemProvider();

        return Promise.all([
            this._staticSolarSystem.item.readyPromise(),
            mapSolarSystem.readyPromise(),
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

        let mapSolarSystem = this._getMapSolarSystemProvider();
        this._unsubscribeMapSolarSystem = mapSolarSystem.subscribe();
        this._handlerDynamicDataChanged = mapSolarSystem.on("changedEvent", this._onDynamicDataChanged.bind(this));

        // this._map = cache.maps.touch(this.mapId);
        // this._mapSolarSystem = this._map.item.solarSystems.touch(this.id);
        //
        // this._handlerDynamicDataChanged = this._mapSolarSystem.item.on("changed", this._onDynamicDataChanged.bind(this));
    }

    deinitProviders () {
        if(this._staticSolarSystem)  {
            this._staticSolarSystem.item.off(this._handlerStaticDataChanged);
            this._staticSolarSystem.unsubscribe();
            this._staticSolarSystem = null;
        }

        let mapSolarSystem = this._getMapSolarSystemProvider();
        if(exists(this._handlerDynamicDataChanged)) {
            mapSolarSystem.off(this._handlerDynamicDataChanged)
            delete this._handlerDynamicDataChanged;
        }

        if(exists(this._unsubscribeMapSolarSystem)) {
            this._unsubscribeMapSolarSystem();
            delete this._unsubscribeMapSolarSystem;
        }

        // this._map && this._map.unsubscribe();
        // delete this._map;
    }

    _onDynamicDataChanged (/*data*/) {
        this._data = extend(this._data, this._getMapSolarSystemProvider().data());

        // this._data.onlineCount = Number.randomInt(1, 255); // for tests

        if(exists(this.markerId))
            this.map.updateMarker(this.markerId, this._data);
    }

    _onStaticDataChanged (event) {
        this._data = extend(this._data, event);

        // this._data = extend(this._data, newData);

        if(exists(this.markerId))
            this.map.updateMarker(this.markerId, this._data);
    }

    setIsHub (isHub) {
        this._data = extend(this._data, {isHub});
        this._onDynamicDataChanged()
    }

    data () {
        return this._data;
    }

    _getMapSolarSystemProvider () {
        return cache.maps.list.get(this.mapId).solarSystems.list.get(this.id);
    }
}

export default System;