(function () {
    var componentId = "ui/components/currentMap/controller/mapController";

    var deps = [
        "env/tools/class",
        "ui/components/currentMap/controller/link",
        "ui/components/currentMap/controller/system",
        "env/tools/emitter"
    ];

    define(componentId, deps, function () {
        var classCreator  = require("env/tools/class");
        var Emitter       = require("env/tools/emitter");
        var Link          = require("ui/components/currentMap/controller/link");
        var SolarSystem   = require("ui/components/currentMap/controller/system");

        var MapController = classCreator("MapController", Emitter, {
            constructor: function (_map, _mapId) {
                Emitter.prototype.constructor.call(this);

                this.map = _map;
                this.mapId = _mapId;

                this.systems = Object.create(null);
                this.links = Object.create(null);

                this._inited = false;
            },
            init: function () {
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
                this.map.clear();

                this._systemsSubscription.subscribe().then(function () {
                    this._linksSubscription.subscribe();
                }.bind(this))

                this._inited = true;
            },
            deinit: function () {
                this._inited = false;
                this.map = null;

                this._systemsSubscription.unsubscribe();
                this._linksSubscription.unsubscribe();

                for (var systemId in this.systems)
                    this.systems[systemId].deinit();

                for (var links in this.links)
                    this.links[links].deinit();

                this.systems = Object.create(null);
                this.links = Object.create(null);
            },
            setSelection: function (_leftTop, _rightBottom) {
                this.map.deselectAll();
                var lt = this.map.getVirtualBy(_leftTop);
                var rb = this.map.getVirtualBy(_rightBottom);

                var result = this.map.getMarkersAndLinksByArea(lt, rb);
                for (var a = 0; a < result.length; a++) {
                    this.map.setSelectMarker(result[a], true);
                }
            },
            _onSystemSubscriptionChange: function (_data) {
                var onlineCharacters;

                if(!this._inited)
                    return;

                switch (_data.type) {
                    case "systemUpdatedList":
                        _data.list.map(function (_event) {
                            this._onSystemSubscriptionChange(_event)
                        }.bind(this));
                        break;
                    case "bulk":
                        for (var a = 0; a < _data.list.length; a++) {
                            this.systems[_data.list[a].id] = new SolarSystem(this, this.map, this.mapId, _data.list[a].id);
                            this.systems[_data.list[a].id].updateInfo(_data.list[a]);
                            this.systems[_data.list[a].id].init();
                        }
                        break;
                    case "add":
                        this.systems[_data.systemInfo.id] = new SolarSystem(this, this.map, this.mapId, _data.systemInfo.id);
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
                        for (var a = 0; a < _data.systemsPosition.length; a++) {
                            var systemPosition = _data.systemsPosition[a];
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
            },
            _onLinksSubscriptionChange: function (_data) {
                if (!this._inited)
                    return;

                switch (_data.type) {
                    case "bulk":
                        api.eve.map.linkInfo(this.mapId, _data.list).then(function (_result) {
                            for (var a = 0; a < _result.length; a++) {
                                this.links[_result[a].id] = new Link(this, this.map, this.mapId, _result[a].id);
                                this.links[_result[a].id].updateInfo(_result[a]);
                                this.links[_result[a].id].init();
                            }
                        }.bind(this), function (_err) {
                            debugger;
                        }.bind(this));
                        break;
                    case "add":
                        api.eve.map.linkInfo(this.mapId, [_data.linkId]).then(function (_result) {
                            this.links[_data.linkId] = new Link(this, this.map, this.mapId, _data.linkId);
                            this.links[_data.linkId].updateInfo(_result[0]);
                            this.links[_data.linkId].init();
                        }.bind(this), function () {
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
            },
            _onLinkContextMenu: function (_linkId, _event) {
                this.emit("linkContextMenu", _linkId, _event)
            },
            _onSystemContextMenu: function (_systemId, _event) {
                var selectedSystems = this.map.selected();

                if(selectedSystems.indexOf(_systemId) === -1) {
                    this.map.deselectAll();
                    selectedSystems = [];
                }

                if(selectedSystems.length > 1) {
                    this.emit("systemsContextMenu", selectedSystems, _event);
                } else {
                    this.emit("systemContextMenu", _systemId, _event);
                }

            },
            onMarkerClicked: function (_systemId, _event) {
                this.emit("systemOpenInfo", _systemId, this.systems[_systemId].info);
            },
            getSystem: function (_systemId) {
                return this.systems[_systemId]
            }
        });

        return MapController;
    });
})(window);

