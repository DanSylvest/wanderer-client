import Emitter from "../../../../js/env/tools/emitter";
import api from "../../../../js/api";
import Link from "./link";
import System from "./system";
import exists from "../../../../js/env/tools/exists";
import CustomPromise from "../../../../js/env/promise.js";
import helper from "../../../../js/utils/helper.js";

class MapController extends Emitter {
    constructor (_map, _mapId) {
        super();

        this.map = _map;
        this.mapId = _mapId;

        this.systems = Object.create(null);
        this.links = Object.create(null);

        this._inited = false;
    }
    init () {
        // we must subscribe on map systems and links
        this._systemsSubscription = api.eve.map.solarSystem.subscribeSolarSystems(this.mapId);
        this._systemsSubscription.on("change", this._onSystemSubscriptionChange.bind(this));

        // we must subscribe on map systems and links
        this._linksSubscription = api.eve.map.link.subscribeLinks(this.mapId);
        this._linksSubscription.on("change", this._onLinksSubscriptionChange.bind(this));

        // we must subscribe on map systems and links
        this._existenceSubscription = api.eve.map.subscribeMapExistence(this.mapId);
        this._existenceSubscription.on("change", this._onExistenceSubscriptionChange.bind(this));

        this.map.on("linkContextMenu", this._onLinkContextMenu.bind(this));
        this.map.on("systemContextMenu", this._onSystemContextMenu.bind(this));
        this.map.on("markerClicked", this.onMarkerClicked.bind(this));
        this.map.on("dragStarted", this.emit.bind(this, "dragStarted"));
        this.map.on("mapClicked", this.emit.bind(this, "mapClicked"));
        this.map.on("offsetChanged", this.emit.bind(this, "offsetChanged"));
        this.map.on("markerIn", this.emit.bind(this, "markerIn"));
        this.map.on("markerOut", this.emit.bind(this, "markerOut"));
        this.map.on("newChain", this.onNewChain.bind(this));
        this.map.clear();

        let initPromise = new CustomPromise();

        this._existenceSubscription.subscribe()
            .then(() => this._systemsSubscription.subscribe())
            .then(() => this._linksSubscription.subscribe())
            .then(() => {initPromise.resolve();})
            .catch(() => initPromise.reject());

        this._inited = true;
        return initPromise.native;
    }
    deinit () {
        this._inited = false;
        this.map = null;

        this._systemsSubscription.unsubscribe();
        this._linksSubscription.unsubscribe();
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
    convertPosition (x,y) {
        return this.map.getVirtualBy({x:x,y:y})
    }
    setOffset (x,y) {
        this.map.setOffset(x,y);
    }
    // eslint-disable-next-line no-unused-vars
    _onExistenceSubscriptionChange (data) {

        if(!data) {
            // eslint-disable-next-line no-debugger
            // debugger;
            this.emit("removed");
        }

    }
    _onSystemSubscriptionChange (_data) {
        let onlineCharacters;

        if(!this._inited)
            return;

        switch (_data.type) {
            case "systemUpdatedList":
                _data.list.map(function (_event) {
                    this._onSystemSubscriptionChange(_event)
                }.bind(this));
                break;
            case "bulk":
                for (let a = 0; a < _data.list.length; a++) {
                    this.systems[_data.list[a].id] = new System(this, this.map, this.mapId, _data.list[a].id);
                    this.systems[_data.list[a].id].updateInfo(_data.list[a]);
                    this.systems[_data.list[a].id].init();
                }
                break;
            case "add":
                this.systems[_data.systemInfo.id] = new System(this, this.map, this.mapId, _data.systemInfo.id);
                this.systems[_data.systemInfo.id].updateInfo(_data.systemInfo);
                this.systems[_data.systemInfo.id].init();
                break;
            case "removed":
                if(this.systems[_data.systemId]) {
                    this.systems[_data.systemId].deinit();
                    delete this.systems[_data.systemId];
                }
                break;
            case "updatedSystemsPosition":
                for (let a = 0; a < _data.systemsPosition.length; a++) {
                    let systemPosition = _data.systemsPosition[a];
                    if(this.systems[systemPosition.id]) {
                        this.systems[systemPosition.id].updatePosition(systemPosition);
                    }
                }
                break;
            case "systemUpdated":
                if(this.systems[_data.systemId]) {
                    this.systems[_data.systemId].updateInfo(_data.data);
                }
                break;
            case "onlineUpdate":
                if(this.systems[_data.systemId]) {
                    this.systems[_data.systemId].updateInfo({
                        onlineCount: _data.onlineCount
                    });
                }
                break;
            case "userJoin":
                onlineCharacters = this.systems[_data.systemId].info.onlineCharacters;
                if(onlineCharacters) {
                    this.systems[_data.systemId].info.onlineCharacters.push(_data.characterId);
                    this.systems[_data.systemId].updateInfo({
                        onlineCharacters: this.systems[_data.systemId].info.onlineCharacters
                    });
                }
                break;
            case "userLeave":
                onlineCharacters = this.systems[_data.systemId].info.onlineCharacters;
                if(onlineCharacters) {
                    onlineCharacters.removeByIndex(onlineCharacters.indexOf(_data.characterId));
                    this.systems[_data.systemId].updateInfo({
                        onlineCharacters: onlineCharacters
                    });
                }
                break;
        }

        this.emit("systemChange", _data);
    }
    _onLinksSubscriptionChange (_data) {
        if (!this._inited)
            return;

        switch (_data.type) {
            case "bulk":
                api.eve.map.link.info(this.mapId, _data.list)
                    .then(
                        data => {
                            for (let a = 0; a < data.length; a++) {
                                this.links[data[a].id] = new Link(this, this.map, this.mapId, data[a].id);
                                this.links[data[a].id].updateInfo(data[a]);
                                this.links[data[a].id].init();
                            }
                        },
                        err => {
                            this.emit("error", {
                                message: "Error on load links info",
                                err: err
                            });
                        }
                    );
                break;
            case "add":
                api.eve.map.link.info(this.mapId, [_data.linkId])
                    .then(
                        data => {
                            this.links[_data.linkId] = new Link(this, this.map, this.mapId, _data.linkId);
                            this.links[_data.linkId].updateInfo(data[0]);
                            this.links[_data.linkId].init();
                        },
                        err => {
                            this.emit("error", {
                                message: "Error on load links info",
                                err: err
                            });
                        }
                    );
                break;
            case "removed":
                if (this.links[_data.linkId]) {
                    this.links[_data.linkId].deinit();
                    delete this.links[_data.linkId];
                }
                break;
            case "linkUpdated":
                if(this.links[_data.linkId]) {
                    this.links[_data.linkId].updateInfo(_data.data);
                }
                break;
        }

        this.emit("linkChanged", _data);
    }
    _onLinkContextMenu (_linkId, _event) {
        this.emit("linkContextMenu", _linkId, _event)
    }
    _onSystemContextMenu (_systemId, _event) {
        let selectedSystems = this.map.selected();

        if(selectedSystems.indexOf(_systemId) === -1) {
            this.map.deselectAll();
            selectedSystems = [];
        }

        if(selectedSystems.length > 1) {
            this.emit("systemsContextMenu", selectedSystems, _event);
        } else {
            this.emit("systemContextMenu", _systemId, _event);
        }

    }
    onMarkerClicked (_systemId, _event) {
        if(_event.shiftKey) {
            let markerId = this.systems[_systemId].markerId;
            this.map.setSelectMarker(markerId, !this.map.isMarkerSelected(markerId));
        } else {
            this.emit("systemOpenInfo", _systemId, this.systems[_systemId].info);
        }
    }
    onNewChain (sourceSolarSystemId, targetSolarSystemId) {
        api.eve.map.addChain(this.mapId, sourceSolarSystemId, targetSolarSystemId)
            .then(
                helper.dummy,
                err => {
                    this.emit("error", {
                        message: "Error on load links info",
                        err: err
                    });
                }
            )
    }
    setSystemActive (systemId) {
        if(this.systems[systemId]) {
            this.offSystemActive();
            this.map.setMarkerActive(this.systems[systemId].markerId, true);
            this._lastSystemActive = systemId;
        }
    }
    offSystemActive () {
        if(exists(this._lastSystemActive && this.systems[this._lastSystemActive])) {
            this.map.setMarkerActive(this.systems[this._lastSystemActive].markerId, false);
            delete this._lastSystemActive;
        }
    }
    getSystem (_systemId) {
        return this.systems[_systemId]
    }
    getLink (linkId) {
        return this.links[linkId]
    }

    highlightRoute (route) {
        this.map.shadeAll(true);

        let filteredSystems = route.filter(x => this.systems[x] !== undefined);

        if(route.length > 1) {
            let links = [];
            for (let a = 1; a < filteredSystems.length; a++) {
                let origin = route[a - 1];
                let dest = route[a];
                links.push(this.getLinkBySystems(origin, dest));
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

        for(let linkId in this.links) {
            let link = this.links[linkId];

            if(
                origin === link.info.solarSystemSource && destination === link.info.solarSystemTarget
                || destination === link.info.solarSystemSource && origin === link.info.solarSystemTarget
            ) {
                return link.uiLinkId;
            }
        }
    }
}

export default MapController;