import Emitter from '../../../../js/env/tools/emitter';
import api from '../../../../js/api';
import Chain from './chain';
import System from './system';
import exists from '../../../../js/env/tools/exists';
import CustomPromise from '../../../../js/env/promise.js';
import helper from '../../../../js/utils/helper.js';
import cache from '../../../../js/cache/cache.js';

class MapController extends Emitter{
  systemsWithOwn = {};

  constructor (_map, _mapId) {
    super();

    this.map = _map;
    this.mapId = _mapId;

    this.systems = Object.create(null);
    this.links = Object.create(null);

    this.allowedCharacters = [];
    this.hubs = [];

    this._unsubscribeMSSId = null;
  }

  init () {
    let mapProvider = cache.maps.list.get(this.mapId);
    this._unsubscribeSolarSystems = mapProvider.solarSystems.existence.subscribe();
    this._unsubscribeChains = mapProvider.chains.existence.subscribe();
    this._unsubscribeHubs = mapProvider.hubs.subscribe();
    this._unsubscribeOnlineCharacters = mapProvider.onlineCharacters.subscribe();


    // TODO это что за дела!? Надо переписать это
    // subscribe on map existence
    this._existenceSubscription = api.eve.map.subscribeMapExistence(this.mapId);
    this._existenceSubscription.on('change', this._onExistenceSubscriptionChange.bind(this));

    this.map.on('linkContextMenu', this._onLinkContextMenu.bind(this));
    this.map.on('systemContextMenu', this._onSystemContextMenu.bind(this));
    this.map.on('markerClicked', this.onMarkerClicked.bind(this));
    this.map.on('dragStarted', this.emit.bind(this, 'dragStarted'));
    this.map.on('mapClicked', this.emit.bind(this, 'mapClicked'));
    this.map.on('offsetChanged', this.emit.bind(this, 'offsetChanged'));
    this.map.on('markerIn', this.emit.bind(this, 'markerIn'));
    this.map.on('markerOut', this.emit.bind(this, 'markerOut'));
    this.map.on('markerDragged', this.emit.bind(this, 'markerDragged'));
    this.map.on('newChain', this.onNewChain.bind(this));
    this.map.clear();

    let initPromise = new CustomPromise();

    this._existenceSubscription.subscribe()
      .then(() => mapProvider.solarSystems.existence.readyPromise())
      .then(() => mapProvider.chains.existence.readyPromise())
      .then(() => mapProvider.hubs.readyPromise())
      .then(() => {
        this._loaded();
        initPromise.resolve();
      })
      .catch(() => initPromise.reject());

    return initPromise.native;
  }

  deinit () {
    this.map = null;

    let mapProvider = cache.maps.list.get(this.mapId);

    if (exists(this._unsubscribeMSSId)) {
      mapProvider.solarSystems.existence.off(this._unsubscribeMSSId);
      delete this._unsubscribeMSSId;
    }

    if (exists(this._unsubscribeMChainsId)) {
      mapProvider.chains.existence.off(this._unsubscribeMChainsId);
      delete this._unsubscribeMChainsId;
    }

    if (exists(this._unsubscribeMHubsId)) {
      mapProvider.hubs.off(this._unsubscribeMHubsId);
      delete this._unsubscribeMHubsId;
    }

    if (exists(this._unsubscribeMOnlineCharactersId)) {
      mapProvider.hubs.off(this._unsubscribeMOnlineCharactersId);
      delete this._unsubscribeMOnlineCharactersId;
    }

    if (exists(this._unsubscribeSolarSystems)) {
      this._unsubscribeSolarSystems();
      delete this._unsubscribeSolarSystems;
    }
    if (exists(this._unsubscribeChains)) {
      this._unsubscribeChains();
      delete this._unsubscribeChains;
    }
    if (exists(this._unsubscribeHubs)) {
      this._unsubscribeHubs();
      delete this._unsubscribeHubs;
    }
    if (exists(this._unsubscribeOnlineCharacters)) {
      this._unsubscribeOnlineCharacters();
      delete this._unsubscribeOnlineCharacters;
    }

    this._existenceSubscription.unsubscribe();

    for (let systemId in this.systems)
      this.systems[systemId].deinit();

    for (let links in this.links)
      this.links[links].deinit();

    this.systems = Object.create(null);
    this.links = Object.create(null);
  }

  setSelection (_leftTop, _rightBottom) {
    let lt = this.map.getVirtualBy(_leftTop);
    let rb = this.map.getVirtualBy(_rightBottom);

    let result = this.map.getMarkersAndLinksByArea(lt, rb);
    for (let a = 0; a < result.length; a++) {
      this.map.setSelectMarker(result[a], true);
    }
  }

  convertPosition (x, y) {
    return this.map.getVirtualBy({ x, y });
  }

  setOffset (x, y) {
    this.map.setOffset(x, y);
  }

  _onExistenceSubscriptionChange (data) {
    if (!data) {
      this.emit('removed');
    }
  }

  _loaded () {
    let mapProvider = cache.maps.list.get(this.mapId);
    this._unsubscribeMHubsId = mapProvider.hubs.on('changedEvent', this._onHubsSubscriptionChange.bind(this));

    this._unsubscribeMOnlineCharactersId =
      mapProvider.onlineCharacters.on('changedEvent', this._onOnlineCharactersSubscriptionChange.bind(this));

    this._unsubscribeMSSId =
      mapProvider.solarSystems.existence.on('changedEvent', this._onSystemSubscriptionChange.bind(this));

    this._unsubscribeMChainsId =
      mapProvider.chains.existence.on('changedEvent', this._onChainsSubscriptionChange.bind(this));
  }

  // eslint-disable-next-line no-unused-vars
  _onOnlineCharactersSubscriptionChange (data) {
    // eslint-disable-next-line no-debugger
    // debugger
  }

  _onSystemSubscriptionChange (_data) {
    switch (_data.type) {
      case 'bulk': {
        this.map.enableForce(false);
        let prarr = [];
        for (let a = 0; a < _data.list.length; a++) {
          const systemId = _data.list[a];
          this.systems[systemId] = new System(this.map, this.mapId, systemId);
          this.systems[systemId].setIsHub(this.hubs.includes(systemId));

          if (exists(this.systemsWithOwn[systemId])) {
            this.systems[systemId].setHasOwn(this.systemsWithOwn[systemId]);
          }

          prarr.push(this.systems[systemId].init());
        }
        Promise.all(prarr).then(() => this.map.enableForce(true));
        break;
      }
      case 'add':
        this.systems[_data.solarSystemId] = new System(this.map, this.mapId, _data.solarSystemId);
        this.systems[_data.solarSystemId].init();
        this.systems[_data.solarSystemId].setIsHub(this.hubs.includes(_data.solarSystemId));

        if (exists(this.systemsWithOwn[_data.solarSystemId])) {
          this.systems[_data.solarSystemId].setHasOwn(this.systemsWithOwn[_data.solarSystemId]);
        }
        break;
      case 'removed':
        if (this.systems[_data.solarSystemId]) {
          this.systems[_data.solarSystemId].deinit();
          delete this.systems[_data.solarSystemId];
        }
        break;
    }

    this.emit('systemChange', _data);
  }

  _onChainsSubscriptionChange (data) {
    switch (data.type) {
      case 'bulk':
        for (let a = 0; a < data.list.length; a++) {
          this.links[data.list[a]] = new Chain(this, this.map, this.mapId, data.list[a]);
          this.links[data.list[a]].init();
        }
        break;
      case 'add':
        this.links[data.chainId] = new Chain(this, this.map, this.mapId, data.chainId);
        this.links[data.chainId].init();
        break;
      case 'removed':
        if (this.links[data.chainId]) {
          this.links[data.chainId].deinit();
          delete this.links[data.chainId];
        }
        break;
    }

    this.emit('linkChanged', data);
  }

  _onHubsSubscriptionChange (event) {
    switch (event.type) {
      case 'bulk':
        this.hubs = event.list.slice(0);
        this.hubs.map(x => exists(this.systems[x]) && this.systems[x].setIsHub(true));
        break;
      case 'add':
        this.hubs.push(event.hubId);
        exists(this.systems[event.hubId]) && this.systems[event.hubId].setIsHub(true);
        break;
      case 'removed':
        this.hubs.removeByValue(event.hubId);
        exists(this.systems[event.hubId]) && this.systems[event.hubId].setIsHub(false);
        break;
    }
  }

  _onLinkContextMenu (_linkId, _event) {
    this.emit('linkContextMenu', _linkId, _event);
  }

  _onSystemContextMenu (_systemId, _event) {
    let selectedSystems = this.map.selected();

    if (selectedSystems.indexOf(_systemId) === -1) {
      this.map.deselectAll();
      selectedSystems = [];
    }

    if (selectedSystems.length > 1) {
      this.emit('systemsContextMenu', selectedSystems, _event);
    } else {
      this.emit('systemContextMenu', _systemId, _event);
    }

  }

  onMarkerClicked (_systemId, _event) {
    if (_event.shiftKey) {
      let markerId = this.systems[_systemId].markerId;
      this.map.setSelectMarker(markerId, !this.map.isMarkerSelected(markerId));
    } else {
      this.emit('systemOpenInfo', _systemId, this.systems[_systemId].info);
    }
  }

  onNewChain (sourceSolarSystemId, targetSolarSystemId) {
    if (sourceSolarSystemId !== targetSolarSystemId) {
      api.eve.map.addChain(this.mapId, sourceSolarSystemId, targetSolarSystemId)
        .then(
          helper.dummy,
          err => {
            this.emit('error', {
              message: 'Error on load links info',
              err: err,
            });
          },
        );
    }
  }

  setSystemActive (systemId) {
    if (this.systems[systemId]) {
      this.offSystemActive();
      this.map.setMarkerActive(this.systems[systemId].markerId, true);
      this._lastSystemActive = systemId;
    }
  }

  offSystemActive () {
    if (exists(this._lastSystemActive && this.systems[this._lastSystemActive])) {
      this.map.setMarkerActive(this.systems[this._lastSystemActive].markerId, false);
      delete this._lastSystemActive;
    }
  }

  getSystem (_systemId) {
    return this.systems[_systemId];
  }

  getLink (linkId) {
    return this.links[linkId];
  }

  highlightRoute (route) {
    this.map.shadeAll(true);

    let filteredSystems = route.filter(x => this.systems[x] !== undefined);

    if (route.length > 1) {
      let links = [];
      for (let a = 1; a < filteredSystems.length; a++) {
        let origin = filteredSystems[a - 1];
        let dest = filteredSystems[a];
        console.log('CHAIN %s(%s) => %s(%s)', this.systems[origin].data().solarSystemName, origin, this.systems[dest].data().solarSystemName, dest);

        let chain = this.getLinkBySystems(origin, dest);
        exists(chain) && links.push(chain);
      }

      links.map(x => this.map.shadeLink(x, false));
    }

    filteredSystems.map(x => this.map.shadeMarker(this.systems[x].markerId, false));
  }

  offAllShade () {
    this.map.shadeAll(false);
  }

  getLinkBySystems (origin, destination) {
    origin = origin.toString();
    destination = destination.toString();

    let chain = this.links[`${ origin }_${ destination }`] || this.links[`${ destination }_${ origin }`];
    if (chain) {
      return chain.uiLinkId;
    }
  }

  updateUserCharactersInfo (data) {
    const systemsWithOwn = data.onlineCharactersList
      .filter(x => data.userCharactersList.some(y => y.charId === x.characterId)) // left only own chars
      .map(x => x.locationId);

    Object.keys(this.systems).map(systemId => {
      const system = this.systems[systemId];
      system.setHasOwn(systemsWithOwn.includes(systemId));
    });

    this.systemsWithOwn = Object.keys(this.systems)
      .reduce((acc, systemId) => ({
        ...acc,
        [systemId]: systemsWithOwn.includes(systemId),
      }), {});
  }

  moveCameraAtSolarSystem (solarSystemId, { offsetRight = 0 }) {
    const system = this.getSystem(solarSystemId);
    if (!system) {
      return;
    }

    this.map.moveCameraAtSolarSystemAnim(system.markerId, { offsetRight });
    this.map.shadeAll(true);
    this.map.shadeMarker(system.markerId, false);
  }
}

export default MapController;