<template>

    <div class="wd fs relative box-sizing" style="height: calc(100% - 7px)">

        <div v-if="isLoaded" class="wd fs relative">
            <div v-if="!showMapEmpty" class="wd fs relative">

                <transition name="fade">
                    <div v-show="!loadingMap" class="wd fs relative">
                        <div id="mapContainer" class="wd fs relative" @contextmenu="onMapContainerContext">

                        </div>
                    </div>
                </transition>

                <transition name="fade2">
                    <div v-if="showMapLoader" class="wd fs relative wd-map-loader">
                        <md-progress-spinner class="md-accent" :md-stroke="2" :md-diameter="100" md-mode="indeterminate"></md-progress-spinner>
                        <md-empty-state
                            md-label="Loading..."
                            :md-description="getRandomAdvice()"
                        />
                    </div>
                </transition>

                <div style="height: 0; width: 150px; top: 0;" class="wd absolute md-layout-item">
                    <md-field >
                        <label>Select a map...</label>
                        <md-select :disabled="loadingMap" v-model="selectedMap" name="selectedMap" id="selectedMap" md-dense @md-selected="onMapSelected($event)">
                            <md-option v-for="item in allowedMaps" :value="item.id" :key="item.id">{{item.name}}</md-option>
                        </md-select>
                    </md-field>
                </div>

                <transition name="fade">
                    <md-speed-dial class="md-bottom-left" md-direction="top" style="margin-left: -20px; margin-bottom: -25px" v-if="!loadingMap">
                        <md-speed-dial-target class="md-hover">
                            <md-icon class="md-morph-initial">settings</md-icon>
                            <md-icon class="md-morph-final">edit</md-icon>
                        </md-speed-dial-target>

                        <md-speed-dial-content>
                            <md-button class="md-icon-button" @click="onResetCamera">
                                <md-icon>search_off</md-icon>
                                <md-tooltip md-direction="right">Reset camera</md-tooltip>
                            </md-button>

                            <md-button class="md-icon-button" @click="onSaveClick">
                                <md-icon>save</md-icon>
                                <md-tooltip md-direction="right">Save systems position</md-tooltip>
                            </md-button>

<!--                            <md-button class="md-icon-button" :class="{ 'md-accent': isAutoAlignment }" @click="onAAClick">-->
<!--                                <md-icon>scatter_plot</md-icon>-->
<!--                            </md-button>-->
                        </md-speed-dial-content>
                    </md-speed-dial>
                </transition>

            </div>

            <md-empty-state
                v-if="showMapEmpty"
                md-icon="map"
                md-label="Unfortunately, maps not found"
                md-description="But you can change it! Just do it... Use mapper functional for create maps, groups and attach your characters."
            >
                <md-button class="md-primary md-raised" @click="onClickCreateMap">Create map</md-button>
            </md-empty-state>
        </div>

        <div style="height: 0">
            <system-panel ref="systemPanel" @highlight-route="onHighlightRoute" @hubs-updated="onHubsUpdated" />

            <!-- CHAIN CONTEXT MENU -->
            <context-menu :c-activated.sync="linkCMActive" :c-offset-x="linkCMOffsetX" :c-offset-y="linkCMOffsetY" @c-closed="onClosedLinkContext">
                <context-menu-item c-title="Time state" c-icon="access_time" :c-is-submenu="true" >
                    <context-menu-item
                        :c-active="item.active"
                        :c-title="item.title.toString()"
                        v-for="item in timeStatuses"
                        :key="item.uid"
                        @click="onTimeStateChange(item.id)"
                    />
                </context-menu-item>
                <context-menu-item c-title="Mass state" c-icon="slow_motion_video" :c-is-submenu="true">
                    <context-menu-item
                        :c-active="item.active"
                        :c-title="item.title.toString()"
                        v-for="item in massStatuses"
                        :key="item.uid"
                        @click="onMassStateChange(item.id)"
                    />
                </context-menu-item>
                <context-menu-item c-title="Ship size" c-icon="slow_motion_video" :c-is-submenu="true">
                    <context-menu-item
                        :c-active="item.active"
                        :c-title="item.title.toString()"
                        v-for="item in shipSizeStatuses"
                        :key="item.uid"
                        @click="onShipSizeTypeChange(item.id)"
                    />
                </context-menu-item>
                <context-menu-item c-title="Disconnect chain" c-icon="delete" @click="onLinkContextMenuRemove" />
            </context-menu>

            <!-- SOLAR SYSTEM CONTEXT MENU -->
            <context-menu :c-activated.sync="systemCMActive" :c-offset-x="systemCMOffsetX" :c-offset-y="systemCMOffsetY" @c-closed="onClosedSystemContext">
                <context-menu-item c-title="Tag system" c-icon="spellcheck" :c-is-submenu="true">
                    <context-menu-item c-title="Clear" c-icon="block" @click="onClearTag"/>
                    <context-menu-item c-title="Letter" c-icon="edit" :c-is-submenu="true">
                        <context-menu-item
                            :c-active="item.active"
                            :c-title="item.tagName.toString()"
                            v-for="item in letters"
                            :key="item.uid"
                            @click="onLetterClick(item.tagName)"
                        />
                    </context-menu-item>
                    <context-menu-item c-title="Digit" c-icon="edit" :c-is-submenu="true">
                        <context-menu-item
                            :c-active="item.active"
                            :c-title="item.tagName.toString()"
                            v-for="item in digits"
                            :key="item.uid"
                            @click="onDigitClick(item.tagName)"
                        />
                    </context-menu-item>
                </context-menu-item>
                <context-menu-item c-title="Status" c-icon="report_problem" :c-is-submenu="true">
                    <context-menu-item
                        :c-active="item.active"
                        :c-title="item.name"
                        :c-icon="item.icon"
                        :c-icon-class="'eve-system-status-color-' + item.id"
                        v-for="(item, index) in statuses"
                        :key="item.uid"
                        @click="onStatusClick(index)"
                    />
                </context-menu-item>
                <context-menu-item c-title="Copy name" c-icon="content_copy" @click="onSystemCopyName" />
                <context-menu-item c-title="Waypoints" c-icon="call_split" :c-is-submenu="true" v-show="isSystemInKSpace">
                    <context-menu-item :c-title="item.name" :c-is-submenu="true" v-for="item in characters" :key="item.id">
                        <context-menu-item c-title="Set Destination" c-icon="near_me" @click="onSetDestination(item.id)"/>
                        <context-menu-item c-title="Add Waypoint Front" c-icon="call_missed" @click="onAddWaypointFront(item.id)" />
                        <context-menu-item c-title="Add Waypoint Back" c-icon="call_missed_outgoing" @click="onAddWaypointBack(item.id)" />
                    </context-menu-item>
                </context-menu-item>

                <context-menu-item c-title="Mark as hub" c-icon="near_me" v-show="systemContextMenuMarkAsHub" @click="onMarkAsHub(true)" />
                <context-menu-item c-title="Unmark as hub" c-icon="near_me_disabled" v-show="!systemContextMenuMarkAsHub" @click="onMarkAsHub(false)" />

                <context-menu-item c-title="Unlock system" c-icon="lock_open" v-show="systemContextMenuLockedItem" @click="onSystemContextMenuUnlock" />
                <context-menu-item c-title="Lock system" c-icon="lock" v-show="!systemContextMenuLockedItem" @click="onSystemContextMenuLock" />
                <context-menu-item c-title="Remove system" c-icon="delete" v-show="!systemContextMenuLockedItem" @click="onSystemContextMenuRemove" />
            </context-menu>

            <!-- SOLAR SYSTEMS CONTEXT MENU -->
            <context-menu :c-activated.sync="systemsCMActive" :c-offset-x="systemsCMOffsetX" :c-offset-y="systemsCMOffsetY" @c-closed="onClosedSystemsContext">
                <context-menu-item c-title="Remove systems" c-icon="delete" @click="onSystemsContextMenuRemove" />
            </context-menu>

            <!-- ROOT CONTAINER CONTEXT MENU -->
            <context-menu :c-activated.sync="rootCMActive" :c-offset-x="rootCMOffsetX" :c-offset-y="rootCMOffsetY" @c-closed="onRootCMClosed">
                <context-menu-item c-title="Add system" c-icon="add_circle_outline" @click="onRootCMAddSystem" />
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

            <system-add-dialog :activated.sync="isActiveSystemAddDialog" @system-selected="onSystemAdd"></system-add-dialog>
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
    import environment from "../../js/core/map/environment.js";

    import ContextMenu from "../ui/ContextMenu/ContextMenu";
    import ContextMenuItem from "../ui/ContextMenu/ContextMenuItem";
    import Tooltip from "../ui/Tooltip";
    import AreaSelection from "../ui/AreaSelection";
    import SystemPanel from "./CurrentMap/SystemPanel";
    import SystemCard from "./CurrentMap/SystemCard";
    import SystemAddDialog from "./CurrentMap/SystemAddDialog.vue";
    import copyToClipboard from "../../js/env/copyToClipboard.js";
    import helper from "../../js/utils/helper.js";

    export default {
        name: "CurrentMap",
        components: {
            ContextMenu,
            ContextMenuItem,
            Tooltip,
            AreaSelection,
            SystemPanel,
            SystemCard,
            SystemAddDialog
        },
        props: [

        ],
        data: function () {
            return {
                digits: [],
                letters: [],
                statuses: [],
                timeStatuses: [],
                massStatuses: [],
                shipSizeStatuses: [],
                uidCounter: 0, // this is need for correct updating statuses active item
                selectedMap: null,
                allowedMaps: [],
                showMapEmpty: false,
                isLoaded: false,
                systemContextMenuLockedItem: false,
                systemContextMenuMarkAsHub: true,
                isAutoAlignment: false,
                characters: [],

                rootCMActive: false,
                rootCMOffsetX: 0,
                rootCMOffsetY: 0,

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

                systemsTooltipDisplayed: [],

                isActiveSystemAddDialog: false,
                loadingMap: true,
                showMapLoader: false,
            }
        },
        mounted: function () {
            this.$refs.systemPanel.$on("closed", this.onSystemInfoPanelClosed.bind(this));

            this.initMapTid = -1;
            this._currentOpenSystem = null;

            this.initialize()
                .then(
                    () => {
                        this.__tid = setTimeout(() => {
                            delete this.__tid;
                            this.selectMapOnStart();
                        }, 250);
                    },
                    err => {
                        // todo may be we should show little bit more than notification
                        helper.errorHandler(this, err)
                    }
                );
        },
        beforeDestroy: function ( ){
            this.initMapTid !== -1 && clearTimeout(this.initMapTid);

            if(this.__tid) {
                clearTimeout(this.__tid);
                delete this.__tid;
            }

            if(this.selectedMap !== null) {
                api.eve.map.updateWatchStatus({mapId: this.selectedMap, status: false})
                    .then(
                        helper.dummy,
                        error => helper.errorHandler(this, error)
                    )
            }

            this._destroyMap();

            if(this._mapsSubscriber) {
                this._mapsSubscriber.unsubscribe();
                this._mapsSubscriber.destructor();
                this._mapsSubscriber = null;
            }

            this.$refs.systemPanel.hide();
        },
        methods: {
            refresh: function () {
                this.mapController && this.mapController.map.refresh();
            },

            /** ****** LOCAL METHODS ****** **/
            /** *************************** **/
            initialize: function () {
                let pr = new CustomPromise();

                let prarr = [];
                prarr.push(api.eve.character.list());
                prarr.push(this.subscribeOnMaps());
                Promise.all(prarr)
                    .then(
                         arr => {
                            this.characters = arr[0];
                            this.isLoaded = true;
                            this.showMapEmpty = this.allowedMaps.length === 0;
                            pr.resolve();
                        },
                        pr.reject
                    );

                return pr.native;
            },
            _initMap: function (_mapId) {
                this.initMapTid !== -1 && clearTimeout(this.initMapTid);
                this.initMapTid = setTimeout(() => {
                    this.initMapTid = -1;
                    this._destroyMap();

                    let bounds = this.$el.getBoundingClientRect();

                    this.mapController = new MapController(new Map({
                        container: document.querySelector("#mapContainer"),
                        width: bounds.width,
                        height: bounds.height
                    }), _mapId);

                    this.mapController.on("linkContextMenu", this._onLinkContextMenu.bind(this));
                    this.mapController.on("systemContextMenu", this._onSystemContextMenu.bind(this));
                    this.mapController.on("systemsContextMenu", this._onSystemsContextMenu.bind(this));
                    this.mapController.on("systemOpenInfo", this._onSystemOpenInfo.bind(this));
                    this.mapController.on("systemChange", this._onSystemChange.bind(this));
                    this.mapController.on("linkChanged", this._onLinkChanged.bind(this));
                    this.mapController.on("dragStarted", this._onDragStarted.bind(this));
                    this.mapController.on("mapClicked", this._onMapClicked.bind(this));
                    this.mapController.on("offsetChanged", this._onMapOffsetChanged.bind(this));
                    this.mapController.on("markerIn", this._onMapMarkerIn.bind(this));
                    this.mapController.on("markerOut", this._onMapMarkerOut.bind(this));
                    this.mapController.on("removed", this._onMapRemoved.bind(this));
                    this.mapController.on("error", this._onMapError.bind(this));

                    let offset = cookie.get(`offset_${_mapId}`);
                    if(offset) {
                        let pointArr = offset.split(",");
                        this.mapController.setOffset(parseFloat(pointArr[0]), parseFloat(pointArr[1]));
                    }

                    this.mapController.init()
                        .then(() => {
                            this.loadingMap = false;
                            this.showMapLoader = false;
                        });

                }, 2500);

                this.showMapLoader = true;

                this.$refs.systemPanel.hide();
                this.loadingMap = true;
            },
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
            _offContexts: function () {
                this.rootCMActive = false;
                this.systemsCMActive = false;
                this.systemCMActive = false;
                this.linkCMActive = false;
            },
            _onLinkContextMenu: function (_linkId, _event) {
                this.openLinkContextMenu(_linkId, _event.x, _event.y);
            },
            _onSystemContextMenu: function (_systemId, _event) {
                this.openSolarSystemContextMenu(_systemId, _event.x, _event.y);
            },
            _onSystemsContextMenu: function (_systemIds, _event) {
                this.openSolarSystemsContextMenu(_systemIds, _event.x, _event.y);
            },
            onSystemInfoPanelClosed: function () {
                this._currentOpenSystem = null;
                this.mapController.offSystemActive();
            },
            _onSystemOpenInfo: function (_systemId, _event) {
                this._offContexts();
                this.mapController.map.deselectAll();
                this.mapController.offSystemActive();

                if(this._currentOpenSystem === _systemId) {
                    this.$refs.systemPanel.hide();
                    this._currentOpenSystem = null;
                    return;
                }

                this.mapController.setSystemActive(_systemId);
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
                this.mapController.offAllShade();
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
            _onMapRemoved: function () {
                this.allowedMaps.eraseByObjectKey("id", this.selectedMap);
                this._destroyMap();
                this.selectMapOnStart();
            },
            _onMapError (errData) {
                helper.errorHandler(this, errData)
            },
            _onSystemChange (_data) {
                switch (_data.type) {
                    case "removed":
                        if(_data.systemId === this._currentOpenSystem)
                            this.$refs.systemPanel.hide();

                        this.mapController.offAllShade();
                        this.$refs.systemPanel.systemRemoved(_data.data);
                        break;
                    case "systemUpdated":
                        if(_data.systemId === this._currentOpenSystem)
                            this.$refs.systemPanel.update(_data.data);
                        break;
                    case "bulk":
                    case "updatedSystemsPosition":
                        break;
                    case "add":
                        this.mapController.offAllShade();
                        this.$refs.systemPanel.systemAdded(_data.data);
                        break;
                }
            },
            _onLinkChanged (_data) {
                switch (_data.type) {
                    case "removed":
                        this.mapController.offAllShade();
                        this.$refs.systemPanel.linkRemoved(_data.data);
                        break;
                    case "bulk":
                        break;
                    case "linkUpdated":
                        this.mapController.offAllShade();
                        this.$refs.systemPanel.linkUpdated(_data.data);
                        break;
                    case "add":
                        this.mapController.offAllShade();
                        this.$refs.systemPanel.linkAdded(_data.data);
                        break;
                }
            },
            /** *************************** **/
            /** ****** LOCAL METHODS ****** **/


            /** ****** PUBLIC METHODS ***** **/
            /** *************************** **/
            // Will open solar system context menu
            openSolarSystemContextMenu (solarSystemId, x, y) {
                // Disable all another contexts
                this._offContexts();

                this._currentContextSystem = solarSystemId;
                this.systemCMActive = true;
                let systemInfo = this.mapController.getSystem(this._currentContextSystem).info;
                this.systemContextMenuLockedItem = systemInfo.isLocked;
                this.systemCMOffsetX = x + 10;
                this.systemCMOffsetY = y + 10;

                this.statuses = environment.statuses.slice().map((x, i) => {
                    x.active = i === systemInfo.status;
                    x.uid = this.uidCounter++;
                    return x;
                });

                this.digits = environment.digits.map(x => ({
                    active: x.toString() === systemInfo.tag,
                    uid: this.uidCounter++,
                    tagName: x
                }));

                this.letters = environment.letters.map(x => ({
                    active: x.toString() === systemInfo.tag,
                    uid: this.uidCounter++,
                    tagName: x
                }));

                this.systemContextMenuMarkAsHub = this.hubs.indexOf(this._currentContextSystem) === -1;

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
            openSolarSystemsContextMenu (solarSystemsId, x, y) {
                this._offContexts();

                this._currentSelectedSystems = solarSystemsId;
                this.systemsCMActive = true;
                this.systemsCMOffsetX = x + 10;
                this.systemsCMOffsetY = y + 10;
            },
            openRootContainerContextMenu (x, y) {
                // Disable all another contexts
                this._offContexts();

                this.rootCMActive = true;
                this.rootCMOffsetX = x + 10;
                this.rootCMOffsetY = y + 10;
            },
            openLinkContextMenu (linkId, x, y) {
                this._currentContextLink = linkId;
                this.linkCMActive = true;
                this.linkCMOffsetX = x + 10;
                this.linkCMOffsetY = y + 10;

                let chainInfo = this.mapController.getLink(this._currentContextLink).info;

                this.timeStatuses = environment.timeStatuses.map(x => {
                    x.active = x.id === chainInfo.timeStatus;
                    x.uid = this.uidCounter++;
                    return x;
                });

                this.massStatuses = environment.massStatuses.map(x => {
                    x.active = x.id === chainInfo.massStatus;
                    x.uid = this.uidCounter++;
                    return x;
                });

                this.shipSizeStatuses = environment.shipSizeStatuses.map(x => {
                    x.active = x.id === chainInfo.shipSizeType;
                    x.uid = this.uidCounter++;
                    return x;
                });
            },
            selectMapOnStart: function () {
                this.showMapEmpty = this.allowedMaps.length === 0;

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
            subscribeOnMaps () {
                let pr = new CustomPromise();
                // we must subscribe on map systems and links
                this._mapsSubscriber = api.eve.map.subscribeAllowedMaps(this.mapId);
                this._mapsSubscriber.one("change", (data) =>  {
                    if(data.type === "add" && data.maps.length > 0) {
                        Promise.all(data.maps.map(mapId => api.eve.map.info(mapId)))
                            .then(
                                arr => {
                                    data.maps.map((mapId, index) => arr[index].id = mapId);

                                    this.allowedMaps = arr;
                                    this._mapsSubscriber.on("change", this._onMapsListChanged.bind(this));
                                    pr.resolve();
                                },
                                err => pr.reject(err)
                            );
                    } else {
                        this.allowedMaps = [];
                        this._mapsSubscriber.on("change", this._onMapsListChanged.bind(this));
                        pr.resolve();
                    }
                });

                this._mapsSubscriber.subscribe();

                return pr.native;
            },
            _onMapsListChanged (data) {
                switch (data.type) {
                    case "added":
                        Promise.all(data.maps.map(mapId => api.eve.map.info(mapId)))
                            .then(
                                arr => {
                                    data.maps.map((mapId, index) => arr[index].id = mapId);

                                    let hasMapsBefore = this.allowedMaps.length > 0;
                                    arr.map(x => this.allowedMaps.push(x));

                                    if(!hasMapsBefore) {
                                        this.selectMapOnStart();
                                    }
                                }
                            );
                        break;
                    case "removed":
                        var isUpdate = false;
                        data.maps.map(mapId => {
                            this.allowedMaps.eraseByObjectKey("id", mapId);

                            if(!isUpdate && mapId === this.selectedMap)
                                isUpdate = true;
                        });

                        if(isUpdate) {
                            this._destroyMap();
                            this.selectMapOnStart();
                        }
                }

            },
            /** *************************** **/
            /** ****** PUBLIC METHODS ***** **/


            /** ********* HANDLERS ******** **/
            /** *************************** **/
            onClickCreateMap () {
                this.$emit('change-page', 'maps')
            },
            onSystemAdd (solarSystemId) {
                api.eve.map.solarSystem.addManual(this.mapController.mapId, solarSystemId, this.tempCoord.x, this.tempCoord.y)
                    .then(
                        () => this.isActiveSystemAddDialog = false,
                        err => helper.errorHandler(this, err)
                    );
            },
            onSelectionCompleted: function (_event) {
                this.mapController.setSelection(_event.leftTop, _event.rightBottom);
            },
            onSelectionStarted: function () {
                this._offContexts();
            },
            onMapSelected: function(_mapId) {
                cookie.set("selectedMap", _mapId);

                api.eve.map.updateWatchStatus({mapId: _mapId, status: true})
                    .then(
                        () => api.eve.map.routes.hubs(_mapId),
                        error => helper.errorHandler(this, error)
                    )
                    .then(
                        hubs => {
                            this.hubs = hubs;
                            this._initMap(_mapId);
                        },
                        error => helper.errorHandler(this, error)
                    );
            },
            // this handler enable auto alignment
            onAAClick: function () {
                this.isAutoAlignment = !this.isAutoAlignment;

                this.mapController.map.enableForce(this.isAutoAlignment);
            },
            // this handler will save solar system positions
            onSaveClick: function () {
                let positions = this.mapController.map.collectPositions();
                api.eve.map.solarSystem.updatePositions(this.selectedMap, positions)
                    .then(
                        helper.dummy,
                        err => helper.errorHandler(this, err)
                    );
            },
            onResetCamera () {
                this.mapController.map.resetOffset();
            },
            onMapContainerContext: function (_event) {
                _event.preventDefault();
                _event.stopPropagation();
                this.openRootContainerContextMenu(_event.x, _event.y);
            },
            onClosedSystemsContext: function ( ){
                this._currentSelectedSystems = [];
            },
            onSystemsContextMenuRemove: function () {
                api.eve.map.solarSystem.remove(this.selectedMap, this._currentSelectedSystems)
                    .then(
                        helper.dummy,
                        err => helper.errorHandler(this, err)
                    )
            },
            /************ SOLAR SYSTEM CONTEXT MENU HANDLERS ************/
            /************ ********************************** ************/
            onClosedSystemContext: function () {
                this._currentContextSystem = null;
            },
            onClearTag: function () {
                let systemInfo = this.mapController.getSystem(this._currentContextSystem).info;
                systemInfo.tag = "";

                api.eve.map.solarSystem.update(this.selectedMap, this._currentContextSystem, {tag: ""})
                    .then(
                        helper.dummy,
                        err => helper.errorHandler(this, err)
                    );
            },
            onLetterClick: function (_letter) {
                let systemInfo = this.mapController.getSystem(this._currentContextSystem).info;
                systemInfo.tag = _letter;

                api.eve.map.solarSystem.update(this.selectedMap, this._currentContextSystem, {tag: _letter})
                    .then(
                        helper.dummy,
                        err => helper.errorHandler(this, err)
                    );
            },
            onDigitClick: function (_digit) {
                let systemInfo = this.mapController.getSystem(this._currentContextSystem).info;
                systemInfo.tag = _digit;

                api.eve.map.solarSystem.update(this.selectedMap, this._currentContextSystem, {tag: _digit})
                    .then(
                        helper.dummy,
                        err => helper.errorHandler(this, err)
                    );
            },
            onStatusClick (status) {
                api.eve.map.solarSystem.update(this.selectedMap, this._currentContextSystem, {
                    status: status
                });

                let systemInfo = this.mapController.getSystem(this._currentContextSystem).info;
                systemInfo.status = status;
            },
            onSystemCopyName: function () {
                let systemName = this.mapController.systems[this._currentContextSystem].info.name;
                copyToClipboard(systemName);
            },
            onSetDestination: function (_characterId) {
                api.eve.map.waypoint(_characterId, 0, this._currentContextSystem)
                    .then(
                        helper.dummy,
                        err => helper.errorHandler(this, err)
                    );
            },
            onAddWaypointFront: function (_characterId) {
                api.eve.map.waypoint(_characterId, 1, this._currentContextSystem)
                    .then(
                        helper.dummy,
                        err => helper.errorHandler(this, err)
                    );
            },
            onAddWaypointBack: function (_characterId) {
                api.eve.map.waypoint(_characterId, 2, this._currentContextSystem)
                    .then(
                        helper.dummy,
                        err => helper.errorHandler(this, err)
                    );
            },
            onMarkAsHub(bool) {
                if(bool) {
                    this.hubs.push(this._currentContextSystem);
                    api.eve.map.routes.addHub(this.selectedMap, this._currentContextSystem)
                        .then(
                            () => this.$refs.systemPanel.addHub(this._currentContextSystem),
                            error => helper.errorHandler(this, error)
                        );
                } else {
                    this.hubs.removeByValue(this._currentContextSystem);
                    api.eve.map.routes.removeHub(this.selectedMap, this._currentContextSystem)
                        .then (
                            () => this.$refs.systemPanel.removeHub(this._currentContextSystem),
                            err => helper.errorHandler(this, err)
                        );
                }
            },
            onSystemContextMenuLock: function () {
                api.eve.map.solarSystem.update(this.selectedMap, this._currentContextSystem, {isLocked: true})
                    .then(
                        helper.dummy,
                        err => helper.errorHandler(this, err)
                    );
            },
            onSystemContextMenuUnlock: function () {
                api.eve.map.solarSystem.update(this.selectedMap, this._currentContextSystem, {isLocked: false})
                    .then(
                        helper.dummy,
                        err => helper.errorHandler(this, err)
                    );
            },
            onSystemContextMenuRemove: function() {
                api.eve.map.solarSystem.remove(this.selectedMap, [this._currentContextSystem])
                    .then(
                        helper.dummy,
                        err => helper.errorHandler(this, err)
                    );
            },
            /************ ********************************** ************/
            /************ SOLAR SYSTEM CONTEXT MENU HANDLERS ************/


            /************ CHAIN CONTEXT MENU HANDLERS ************/
            /************ *************************** ************/
            onClosedLinkContext: function () {
                this._currentContextLink = null;
            },
            onTimeStateChange: function (_state) {
                api.eve.map.link.update(this.selectedMap, this._currentContextLink, {timeStatus: _state})
                    .then(
                        helper.dummy,
                        err => helper.errorHandler(this, err)
                    );
            },
            /**
             * 0 - whole
             * 1 - half
             * 2 - verge
             * @param {number} _state
             */
            onMassStateChange: function (_state) {
                api.eve.map.link.update(this.selectedMap, this._currentContextLink, {massStatus: _state})
                    .then(
                        helper.dummy,
                        err => helper.errorHandler(this, err)
                    );
            },
            /**
             * 0 - frig
             * 1 - M/L
             * 2 - Capital
             * @param {number} _state
             */
            onShipSizeTypeChange: function (_state) {
                api.eve.map.link.update(this.selectedMap, this._currentContextLink, {shipSizeType: _state})
                    .then(
                        helper.dummy,
                        err => helper.errorHandler(this, err)
                    );
            },
            onLinkContextMenuRemove: function () {
                api.eve.map.link.remove(this.selectedMap, this._currentContextLink)
                    .then(
                        helper.dummy,
                        err => helper.errorHandler(this, err)
                    );
            },
            /************ *************************** ************/
            /************ CHAIN CONTEXT MENU HANDLERS ************/

            onHighlightRoute (route) {
                this.mapController.highlightRoute(route);
            },
            onHubsUpdated (hubs) {
                this.hubs = hubs;
            },
            onRootCMClosed: function () {

            },
            onRootCMAddSystem: function (event) {
                this.tempCoord = this.mapController.convertPosition(event.x, event.y);
                this.isActiveSystemAddDialog = true;
            },
            getRandomAdvice() {
                return environment.advices[Number.randomInt(0, environment.advices.length - 1)].description;
            }
        }
    }
</script>

<style lang="scss">
    .wd-map-loader {
        display: flex;
        justify-content: center;
        align-items: center;
        flex-direction: column;
    }


    .fade {
        &-enter-active, &-leave-active {
            transition: opacity 300ms;
        }

        &-enter, &-leave-to {
            opacity: 0;
        }

        &-enter-to, &-leave {
            opacity: 1;
        }
    }

    .fade2 {
        &-enter-active, &-leave-active {
            transition: opacity 300ms;
        }

        &-enter, &-leave-to {
            opacity: 0;
        }

        &-enter-to, &-leave {
            opacity: 1;
        }
    }



</style>