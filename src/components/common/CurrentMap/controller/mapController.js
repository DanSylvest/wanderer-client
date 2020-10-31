import Emitter from "../../../../js/env/tools/emitter";
import api from "../../../../js/api";
import Link from "./link";
import System from "./system";

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
        this._systemsSubscription = api.eve.map.subscribeMapSystems(this.mapId);
        this._systemsSubscription.on("change", this._onSystemSubscriptionChange.bind(this));

        // we must subscribe on map systems and links
        this._linksSubscription = api.eve.map.subscribeMapLinks(this.mapId);
        this._linksSubscription.on("change", this._onLinksSubscriptionChange.bind(this));

        this.map.on("linkContextMenu", this._onLinkContextMenu.bind(this));
        this.map.on("systemContextMenu", this._onSystemContextMenu.bind(this));
        this.map.on("markerClicked", this.onMarkerClicked.bind(this));
        this.map.on("dragStarted", this.emit.bind(this, "dragStarted"));
        this.map.on("mapClicked", this.emit.bind(this, "mapClicked"));
        this.map.on("offsetChanged", this.emit.bind(this, "offsetChanged"));
        this.map.on("markerIn", this.emit.bind(this, "markerIn"));
        this.map.on("markerOut", this.emit.bind(this, "markerOut"));
        this.map.clear();

        this._systemsSubscription.subscribe().then(function () {
            this._linksSubscription.subscribe();
        }.bind(this))

        this._inited = true;
    }
    deinit () {
        this._inited = false;
        this.map = null;

        this._systemsSubscription.unsubscribe();
        this._linksSubscription.unsubscribe();

        for (let systemId in this.systems)
            this.systems[systemId].deinit();

        for (let links in this.links)
            this.links[links].deinit();

        this.systems = Object.create(null);
        this.links = Object.create(null);
    }
    setSelection (_leftTop, _rightBottom) {
        this.map.deselectAll();
        let lt = this.map.getVirtualBy(_leftTop);
        let rb = this.map.getVirtualBy(_rightBottom);

        let result = this.map.getMarkersAndLinksByArea(lt, rb);
        for (let a = 0; a < result.length; a++) {
            this.map.setSelectMarker(result[a], true);
        }
    }
    setOffset (x,y) {
        this.map.setOffset(x,y);
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
                api.eve.map.linkInfo(this.mapId, _data.list).then(function (_result) {
                    for (let a = 0; a < _result.length; a++) {
                        this.links[_result[a].id] = new Link(this, this.map, this.mapId, _result[a].id);
                        this.links[_result[a].id].updateInfo(_result[a]);
                        this.links[_result[a].id].init();
                    }
                    // eslint-disable-next-line no-unused-vars
                }.bind(this), function (_err) {
                    // eslint-disable-next-line no-debugger
                    debugger;
                }.bind(this));
                break;
            case "add":
                api.eve.map.linkInfo(this.mapId, [_data.linkId]).then(function (_result) {
                    this.links[_data.linkId] = new Link(this, this.map, this.mapId, _data.linkId);
                    this.links[_data.linkId].updateInfo(_result[0]);
                    this.links[_data.linkId].init();
                }.bind(this), function () {
                    // eslint-disable-next-line no-debugger
                    debugger;
                }.bind(this));
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
    onMarkerClicked (_systemId/*, _event*/) {
        this.emit("systemOpenInfo", _systemId, this.systems[_systemId].info);
    }
    getSystem (_systemId) {
        return this.systems[_systemId]
    }
}

export default MapController;