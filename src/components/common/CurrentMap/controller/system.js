import Emitter from '../../../../js/env/tools/emitter';
import cache from '../../../../js/cache/cache.js';
import exists from '../../../../js/env/tools/exists';
import extend from '../../../../js/env/tools/extend.js';

class System extends Emitter{
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
      this._getStaticSolarSystemProvider().readyPromise(),
      mapSolarSystem.readyPromise(),
    ]);
  }

  deinit () {
    this._data = Object.create(null);
    if (exists(this.markerId)) {
      this.map.removeMarker(this.markerId);
    }

    this.markerId = null;
    this.map = null;
    this.deinitProviders();
  }

  initProviders () {
    this._staticDataUnsubscribe = this._getStaticSolarSystemProvider().subscribe();
    this._handlerStaticDataChanged = this._getStaticSolarSystemProvider().on('changedEvent', this._onStaticDataChanged.bind(this));

    let mapSolarSystem = this._getMapSolarSystemProvider();
    this._unsubscribeMapSolarSystem = mapSolarSystem.subscribe();
    this._handlerDynamicDataChanged = mapSolarSystem.on('changedEvent', this._onDynamicDataChanged.bind(this));
  }

  deinitProviders () {
    if (exists(this._handlerStaticDataChanged)) {
      this._getStaticSolarSystemProvider().off(this._handlerStaticDataChanged);
      delete this._handlerStaticDataChanged;
    }

    if (exists(this._staticDataUnsubscribe)) {
      this._staticDataUnsubscribe();
      delete this._staticDataUnsubscribe;
    }

    let mapSolarSystem = this._getMapSolarSystemProvider();
    if (exists(this._handlerDynamicDataChanged)) {
      mapSolarSystem.off(this._handlerDynamicDataChanged);
      delete this._handlerDynamicDataChanged;
    }

    if (exists(this._unsubscribeMapSolarSystem)) {
      this._unsubscribeMapSolarSystem();
      delete this._unsubscribeMapSolarSystem;
    }
  }

  _onDynamicDataChanged (event) {
    this._data = extend(this._data, this._getMapSolarSystemProvider().data());

    if (event.type === 'multipleEvents') {
      event.list.map(e => this._onDynamicDataChanged(e));
      return;
    }

    if (exists(this.markerId))
      this.map.updateMarker(this.markerId, event ? event.data : this._data);
  }

  _onStaticDataChanged (/*event*/) {
    this._data = extend(this._data, this._getStaticSolarSystemProvider().data());

    if (exists(this.markerId)) {
      this.map.updateMarker(this.markerId, this._data);
    }
  }

  setIsHub (isHub) {
    this._data = extend(this._data, { isHub });
    this._onDynamicDataChanged({ data: { isHub } });
  }

  data () {
    return this._data;
  }

  _getMapSolarSystemProvider () {
    return cache.maps.list.get(this.mapId).solarSystems.list.get(this.id);
  }

  _getStaticSolarSystemProvider () {
    return cache.solarSystems.list.get(this.id);
  }
}

export default System;