<template>

    <div class="wd fs relative box-sizing" style="height: calc(100% - 7px)">
        <div v-if="isLoaded" class="wd fs relative">
            <div v-if="!showMapEmpty" class="wd fs relative">
                <div id="mapContainer" class="wd fs relative" @contextmenu="onMapContainerContext">

                </div>

                <div style="height: 0; width: 150px; top: 0;" class="wd absolute md-layout-item">
                    <md-field>
                        <label>Select a map...</label>
                        <md-select v-model="selectedMap" name="selectedMap" id="selectedMap" md-dense @md-selected="onMapSelected($event)">
                            <md-option v-for="item in allowedMaps" :value="item.id" :key="item.id">{{item.name}}</md-option>
                        </md-select>
                    </md-field>
                </div>

                <md-speed-dial class="md-bottom-left" md-direction="top" style="margin-left: -20px; margin-bottom: -25px">
                    <md-speed-dial-target class="md-hover">
                        <md-icon class="md-morph-initial">settings</md-icon>
                        <md-icon class="md-morph-final">edit</md-icon>
                    </md-speed-dial-target>

                    <md-speed-dial-content>
                        <md-button class="md-icon-button" @click="onSaveClick">
                            <md-icon>save</md-icon>
                        </md-button>

                        <md-button class="md-icon-button" :class="{ 'md-accent': isAutoAlignment }" @click="onAAClick">
                            <md-icon>scatter_plot</md-icon>
                        </md-button>
                    </md-speed-dial-content>

                </md-speed-dial>

            </div>

            <md-empty-state
                    v-if="showMapEmpty"
                    md-icon="map"
                    md-label="Unfortunately, maps not found"
                    md-description="But you can change it! Just do it... Use mapper functional for create maps, groups and attach your characters."
            >
                <md-button class="md-primary md-raised" href="?page=home&item=maps">Create map</md-button>
            </md-empty-state>
        </div>
        <div style="height: 0">
            <system-panel ref="systemPanel" />

            <context-menu :c-activated.sync="linkCMActive" :c-offset-x="linkCMOffsetX" :c-offset-y="linkCMOffsetY" @c-closed="onClosedLinkContext">
                <context-menu-item c-title="Time state" c-icon="access_time" :c-is-submenu="true" >
                    <context-menu-item c-title="Not yet begun" c-icon="done_all" @click="onTimeStateChange(0)"/>
                    <context-menu-item c-title="End of life" c-icon="error_outline" @click="onTimeStateChange(1)"/>
                </context-menu-item>
                <context-menu-item c-title="Mass state" c-icon="slow_motion_video" :c-is-submenu="true">
                    <context-menu-item c-title="Whole" c-icon="done" @click="onMassStateChange(0)" />
                    <context-menu-item c-title="Less than half" c-icon="trending_down" @click="onMassStateChange(1)" />
                    <context-menu-item c-title="Verge of collapse" c-icon="error_outline" @click="onMassStateChange(2)" />
                </context-menu-item>
                <context-menu-item c-title="Ship size" c-icon="slow_motion_video" :c-is-submenu="true">
                    <context-menu-item c-title="Frigate (S)" c-icon="done" @click="onShipSizeTypeChange(0)" />
                    <context-menu-item c-title="Normal (M/L)" c-icon="trending_down" @click="onShipSizeTypeChange(1)" />
                    <context-menu-item c-title="Capital (XL)" c-icon="error_outline" @click="onShipSizeTypeChange(2)" />
                </context-menu-item>
                <context-menu-item c-title="Disconnect chain" c-icon="delete" @click="onLinkContextMenuRemove" />
            </context-menu>

            <context-menu :c-activated.sync="systemsCMActive" :c-offset-x="systemsCMOffsetX" :c-offset-y="systemsCMOffsetY" @c-closed="onClosedSystemsContext">
                <context-menu-item c-title="Remove systems" c-icon="delete" @click="onSystemsContextMenuRemove" />
            </context-menu>

            <context-menu :c-activated.sync="systemCMActive" :c-offset-x="systemCMOffsetX" :c-offset-y="systemCMOffsetY" @c-closed="onClosedSystemContext">
                <context-menu-item c-title="Tag system" c-icon="spellcheck" :c-is-submenu="true">
                    <context-menu-item c-title="Clear" c-icon="block" @click="onClearTag"/>
                    <context-menu-item c-title="Letter" c-icon="edit" :c-is-submenu="true">
                        <context-menu-item :c-title="item.toString()" v-for="item in letters" :key="item" @click="onLetterClick(item)" />
                    </context-menu-item>
                    <context-menu-item c-title="Digit" c-icon="edit" :c-is-submenu="true">
                        <context-menu-item :c-title="item.toString()" v-for="item in digits" :key="item" @click="onDigitClick(item)" />
                    </context-menu-item>
                </context-menu-item>
                <context-menu-item c-title="Copy name" c-icon="content_copy" @click="onSystemCopyName" />
                <context-menu-item c-title="Waypoints" c-icon="call_split" :c-is-submenu="true" v-show="isSystemInKSpace">
                    <context-menu-item :c-title="item.name" :c-is-submenu="true" v-for="item in characters" :key="item.id">
                        <context-menu-item c-title="Set Destination" c-icon="near_me" @click="onSetDestination(item.id)"/>
                        <context-menu-item c-title="Add Waypoint Front" c-icon="call_missed" @click="onAddWaypointFront(item.id)" />
                        <context-menu-item c-title="Add Waypoint Back" c-icon="call_missed_outgoing" @click="onAddWaypointBack(item.id)" />
                    </context-menu-item>
                </context-menu-item>
                <context-menu-item c-title="Unlock system" c-icon="lock_open" v-show="systemContextMenuLockedItem" @click="onSystemContextMenuUnlock" />
                <context-menu-item c-title="Lock system" c-icon="lock" v-show="!systemContextMenuLockedItem" @click="onSystemContextMenuLock" />
                <context-menu-item c-title="Remove system" c-icon="delete" v-show="!systemContextMenuLockedItem" @click="onSystemContextMenuRemove" />
            </context-menu>

            <tooltip
                :c-offset-x="item.x"
                :c-offset-y="item.y"
                :c-activated="true"
                :key="item.systemId"
                v-for="item in systemsTooltipDisplayed"
                class="wd-layout-secondary"
            >
                <system-card :c-solar-system-id="item.systemId" :c-map-id="item.mapId" />
            </tooltip>
        </div>

        <area-selection @selection-completed="onSelectionCompleted" @selection-started="onSelectionStarted" />
    </div>
</template>

<script>
    import CustomPromise from "../../js/env/promise";
    import cookie from "../../js/env/cookie";
    import query from "../../js/env/query";
    import api from "../../js/api";
    import MapController from "./CurrentMap/controller/mapController";
    import Map from "../../js/core/map/map";
    import exists from "../../js/env/tools/exists";

    import ContextMenu from "../ui/ContextMenu/ContextMenu";
    import ContextMenuItem from "../ui/ContextMenu/ContextMenuItem";
    import Tooltip from "../ui/Tooltip";
    import AreaSelection from "../ui/AreaSelection";
    import SystemPanel from "./CurrentMap/SystemPanel"
    import SystemCard from "./CurrentMap/SystemCard"

    export default {
        name: "CurrentMap",
        components: {
            ContextMenu,
            ContextMenuItem,
            Tooltip,
            AreaSelection,
            SystemPanel,
            SystemCard
        },
        props: [

        ],
        data: function () {
            return {
                digits: [
                    0, 1, 2, 3, 4, 5, 6, 7, 8, 9
                ],
                letters: [
                    "A","B","C","D","E","F","X","Y","Z",
                ],
                selectedMap: null,
                allowedMaps: [],
                showMapEmpty: false,
                isLoaded: false,
                systemContextMenuLockedItem: false,
                isAutoAlignment: false,
                characters: [],

                linkCMOffsetX: 0,
                linkCMOffsetY: 0,
                linkCMActive: false,

                systemCMOffsetX: 0,
                systemCMOffsetY: 0,
                systemCMActive: false,
                isSystemInKSpace: false,

                systemsCMActive: false,
                systemsCMOffsetX: 0,
                systemsCMOffsetY: 0,

                systemsTooltipDisplayed: []
            }
        },
        mounted: function () {
            this.$refs.systemPanel.$on("closed", this.onSystemInfoPanelClosed.bind(this));

            this._currentOpenSystem = null;

            this.initialize().then(function() {
                this.__tid = setTimeout(() => {
                    delete this.__tid;
                    this.selectMapOnStart();
                }, 250);
            }.bind(this),function() {
                // eslint-disable-next-line no-debugger
                debugger;
            }.bind(this));
        },
        beforeDestroy: function ( ){
            if(this.__tid) {
                clearTimeout(this.__tid);
                delete this.__tid;
            }

            if(this.mapController) {
                let map = this.mapController.map;
                this.mapController && this.mapController.deinit();
                map && map.destructor();
                this.mapController = null
            }
            this.$refs.systemPanel.hide();
        },
        methods: {
            refresh: function () {
                this.mapController && this.mapController.map.refresh();
            },
            selectMapOnStart: function () {
                let currentMapId = null;
                let queryMapId = query.searchObject().mapId;
                let cookieMapId = cookie.get("selectedMap");

                if(exists(queryMapId)) {
                    currentMapId = queryMapId;
                } else if(exists(cookieMapId)) {
                    currentMapId = cookieMapId;
                } else if(!this.showMapEmpty) {
                    currentMapId = this.allowedMaps[0].id;
                }

                let isSetMap = true;
                if(!this.allowedMaps.searchByObjectKey("id", currentMapId)) {
                    if(this.allowedMaps.length > 0) {
                        currentMapId = this.allowedMaps[0].id;
                    } else {
                        isSetMap = false;
                        cookie.remove("selectedMap");
                    }
                }

                if(isSetMap)
                    this.selectedMap = currentMapId;
            },
            initialize: function () {
                let pr = new CustomPromise();

                let mapIds = [];
                api.eve.character.list().then(function(_characters){
                    this.characters = _characters;

                    return api.eve.map.allowedMaps();
                }.bind(this)).then(function (_mapIds) {
                    mapIds = _mapIds;
                    let prarr = [];

                    for (let a = 0; a < mapIds.length; a++) {
                        prarr.push(api.eve.map.info(mapIds[a]));
                    }

                    return Promise.all(prarr);
                }.bind(this)).then(function (_arr) {
                    for (let a = 0; a < _arr.length; a++) {
                        _arr[a].id = mapIds[a];
                    }

                    this.allowedMaps = _arr;

                    this.isLoaded = true;
                    this.showMapEmpty = _arr.length === 0;

                    pr.resolve();
                }.bind(this)).catch(function (_err) {
                    pr.reject(_err);
                });

                return pr.native;
            },

            // API

            // HANDLERS

            onSystemCopyName: function () {
                let systemName = this.mapController.systems[this._currentContextSystem].info.name;
                copyToClipboard(systemName);
            },

            onSelectionCompleted: function (_event) {
                this.mapController.setSelection(_event.leftTop, _event.rightBottom);
            },
            onSelectionStarted: function () {
                this._offContexts();
            },

            onLetterClick: function (_letter) {
                this.selectedDigit = null;
                this.selectedLetter = _letter;

                api.eve.map.updateSystem(this.selectedMap, this._currentContextSystem, {
                    tag: _letter
                });
            },
            onDigitClick: function (_digit) {
                this.selectedLetter = null;
                this.selectedDigit = _digit;

                api.eve.map.updateSystem(this.selectedMap, this._currentContextSystem, {
                    tag: _digit
                });
            },
            onClearTag: function () {
                this.selectedDigit = null;
                this.selectedLetter = null;
                api.eve.map.updateSystem(this.selectedMap, this._currentContextSystem, {
                    tag: ""
                });
            },
            onMapSelected: function(_mapId) {
                cookie.set("selectedMap", _mapId);

                this._destroyMap();
                api.eve.map.userWatchMapStatus({mapId: _mapId, status: true}).then(function(){
                    this._initMap(_mapId);
                    // eslint-disable-next-line no-unused-vars
                }.bind(this), function(_err){
                    // eslint-disable-next-line no-debugger
                    debugger;
                }.bind(this));
            },
            onAAClick: function () {
                this.isAutoAlignment = !this.isAutoAlignment;

                this.mapController.map.enableForce(this.isAutoAlignment);
            },
            onSaveClick: function () {
                let positions = this.mapController.map.collectPositions();
                api.eve.map.updateSystemsPosition(this.selectedMap, positions);
            },
            onTimeStateChange: function (_state) {
                api.eve.map.updateLink(this.selectedMap, this._currentContextLink, {
                    timeStatus: _state
                });
            },
            /**
             * 0 - whole
             * 1 - half
             * 2 - verge
             * @param {number} _state
             */
            onMassStateChange: function (_state) {
                api.eve.map.updateLink(this.selectedMap, this._currentContextLink, {
                    massStatus: _state
                });
            },
            /**
             * 0 - frig
             * 1 - M/L
             * 2 - Capital
             * @param {number} _state
             */
            onShipSizeTypeChange: function (_state) {
                api.eve.map.updateLink(this.selectedMap, this._currentContextLink, {
                    shipSizeType: _state
                });
            },
            onMapContainerContext: function (_event) {
                _event.preventDefault();
                _event.stopPropagation();
            },
            // onLinkContextMenuEdit: function() {
            //
            // },
            onLinkContextMenuRemove: function () {
                api.eve.map.linkRemove(this.selectedMap, this._currentContextLink);
            },
            // onSystemContextMenuEdit: function() {
            //
            // },
            onSystemContextMenuRemove: function() {
                api.eve.map.systemRemove(this.selectedMap, this._currentContextSystem);
            },
            onSystemContextMenuLock: function () {
                api.eve.map.updateSystem(this.selectedMap, this._currentContextSystem, {
                    isLocked: true
                });
            },
            onSystemContextMenuUnlock: function () {
                api.eve.map.updateSystem(this.selectedMap, this._currentContextSystem, {
                    isLocked: false
                });
            },
            onClosedSystemsContext: function ( ){
                this._currentSelectedSystems = [];
            },
            onSystemsContextMenuRemove: function () {
                api.eve.map.systemsRemove(this.selectedMap, this._currentSelectedSystems);
            },
            onClosedSystemContext: function () {
                this._currentContextSystem = null;
            },
            onClosedLinkContext: function () {
                this._currentContextLink = null;
            },
            onSetDestination: function (_characterId) {
                api.eve.map.waypoint(_characterId, 0, this._currentContextSystem);
            },
            onAddWaypointFront: function (_characterId) {
                api.eve.map.waypoint(_characterId, 1, this._currentContextSystem);
            },
            onAddWaypointBack: function (_characterId) {
                api.eve.map.waypoint(_characterId, 2, this._currentContextSystem);
            },
            // HANDLERS


            /**
             * Will remove current map if it initialized
             * @private
             */
            _destroyMap: function () {
                if(this.mapController) {
                    let map = this.mapController.map;
                    this.mapController && this.mapController.deinit();
                    map && map.destructor();
                    this.mapController = null
                }
            },
            _initMap: function (_mapId) {
                // eslint-disable-next-line no-debugger
                // debugger
                let bounds = this.$el.getBoundingClientRect();

                this.mapController = new MapController(new Map({
                    container: document.querySelector("#mapContainer"),
                    width: bounds.width,
                    height: bounds.height
                }), _mapId);

                this.mapController.init();

                this.mapController.on("linkContextMenu", this._onLinkContextMenu.bind(this));
                this.mapController.on("systemContextMenu", this._onSystemContextMenu.bind(this));
                this.mapController.on("systemsContextMenu", this._onSystemsContextMenu.bind(this));
                this.mapController.on("systemOpenInfo", this._onSystemOpenInfo.bind(this));
                this.mapController.on("systemChange", this._onSystemChange.bind(this));
                this.mapController.on("dragStarted", this._onDragStarted.bind(this));
                this.mapController.on("mapClicked", this._onMapClicked.bind(this));
                this.mapController.on("offsetChanged", this._onMapOffsetChanged.bind(this));
                this.mapController.on("markerIn", this._onMapMarkerIn.bind(this));
                this.mapController.on("markerOut", this._onMapMarkerOut.bind(this));

                let offset = cookie.get(`offset_${_mapId}`);
                if(offset) {
                    let pointArr = offset.split(",");
                    this.mapController.setOffset(parseFloat(pointArr[0]), parseFloat(pointArr[1]));
                }
            },
            _offContexts: function () {
                this.systemsCMActive = false;
                this.systemCMActive = false;
                this.linkCMActive = false;
            },
            _onLinkContextMenu: function (_linkId, _event) {
                this._offContexts();

                this._currentContextLink = _linkId;
                this.linkCMActive = true;
                this.linkCMOffsetX = _event.x + 10;
                this.linkCMOffsetY = _event.y + 10;
            },
            _onSystemContextMenu: function (_systemId, _event) {
                this._offContexts();

                this._currentContextSystem = _systemId;
                this.systemCMActive = true;
                let systemInfo = this.mapController.getSystem(this._currentContextSystem).info;
                this.systemContextMenuLockedItem = systemInfo.isLocked;
                this.systemCMOffsetX = _event.x + 10;
                this.systemCMOffsetY = _event.y + 10;

                switch (systemInfo.systemType) {
                    case 0:
                    case 1:
                    case 2:
                        this.isSystemInKSpace = true;
                        break;
                    default:
                        this.isSystemInKSpace = false;
                }
            },
            _onSystemsContextMenu: function (_systemIds, _event) {
                this._offContexts();

                this._currentSelectedSystems = _systemIds;
                this.systemsCMActive = true;
                this.systemsCMOffsetX = _event.x + 10;
                this.systemsCMOffsetY = _event.y + 10;
            },
            onSystemInfoPanelClosed: function () {
                this._currentOpenSystem = null;
                this.mapController.offSystemActive();
            },
            _onSystemOpenInfo: function (_systemId, _event) {
                this._offContexts();
                this.mapController.map.deselectAll();
                this.mapController.offSystemActive();
                this.mapController.setSystemActive(_systemId);

                if(this._currentOpenSystem === _systemId)
                    return;

                // todo
                // Я полагаю что надо не закрывтаь, а потом открывать, а показывать загрузчик
                // а потом перезагружать... Но только после того как разберус, какого хрена ничего не обновляется...
                if(this._currentOpenSystem !== null) {
                    this.$refs.systemPanel.hide();
                    this.$nextTick(function () {
                        this._currentOpenSystem = _systemId;
                        this.$refs.systemPanel.show(this.mapController.mapId, _systemId);

                        this.$nextTick(function () {
                            this.$refs.systemPanel.reload(_event);
                        }.bind(this));
                    }.bind(this))
                } else {
                    this._currentOpenSystem = _systemId;
                    this.$refs.systemPanel.show(this.mapController.mapId, _systemId);

                    this.$nextTick(function () {
                        this.$refs.systemPanel.reload(_event);
                    }.bind(this));
                }

            },
            _onDragStarted: function () {
                this._offContexts();
            },
            _onMapClicked: function () {
                this.mapController.map.deselectAll();
                this._offContexts();
            },
            _onMapOffsetChanged: function (_offset) {
                cookie.set(`offset_${this.mapController.mapId}`, `${_offset.x},${_offset.y}`, {expires: 60 * 60 * 24 * 365 * 1000});
            },
            _onMapMarkerIn: function (_systemId, _event) {
                this.systemsTooltipDisplayed.push({mapId: this.selectedMap, systemId: _systemId, x: _event.x, y: _event.y});
            },
            _onMapMarkerOut: function (_systemId/*, _event*/) {
                this.systemsTooltipDisplayed.eraseByObjectKey("systemId", _systemId);
            },
            _onSystemChange: function (_data) {
                switch (_data.type) {
                    case "removed":
                        if(_data.systemId === this._currentOpenSystem)
                            this.$refs.systemPanel.hide();

                        break;
                    case "systemUpdated":
                        if(_data.systemId === this._currentOpenSystem)
                            this.$refs.systemPanel.update(_data.data);
                        break;
                    case "bulk":
                    case "updatedSystemsPosition":
                    case "add":
                        break;
                }
            }
        }
    }

    const copyToClipboard = str => {
        const el = document.createElement('textarea');
        el.value = str;
        document.body.appendChild(el);
        el.select();
        document.execCommand('copy');
        document.body.removeChild(el);
    };
</script>

<style>

</style>