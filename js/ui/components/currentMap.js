(function () {
    var componentId = "ui/components/currentMap";

    var deps = [
        "core/map",
        "env/promise",
        "ui/components/currentMap/controller/mapController",

        "ui/components/cContextMenu",
        "ui/components/cAreaSelection",
        "ui/components/currentMap/systemPanel",
    ];

    define(componentId, deps, function () {
        var Map           = require("core/map");
        var CustomPromise = require("env/promise");
        var MapController = require("ui/components/currentMap/controller/mapController");

        var template = `

<div class="fs relative" style="height: calc(100% - 7px)">
    <div v-if="isLoaded" class="fs relative">
        <div v-if="!showMapEmpty" class="fs relative">            
            <div id="mapContainer" class="fs relative" @contextmenu="onMapContainerContext">
                
            </div>
            
            <div style="height: 0; width: 150px; top: 0px;" class="absolute md-layout-item">
                <md-field>
                    <label for="selectedMap">Select a map...</label>
                    <md-select v-model="selectedMap" name="selectedMap" id="selectedMap" md-dense @md-selected="onMapSelected($event)">
                        <md-option v-for="item in allowedMaps" :value="item.id">{{item.name}}</md-option>
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
    <div style="height: 0px">
        <c-system-panel ref="systemPanel"></c-system-panel>
        
        <c-context-menu :c-activated.sync="linkCMActive" :c-offset-x="linkCMOffsetX" :c-offset-y="linkCMOffsetY" @c-closed="onClosedLinkContext">
            <md-content class="c-context-item md-hover" @click="onLinkContextMenuEdit">
                <span>Edit connection</span>
                <md-icon class="md-primary">edit</md-icon>
            </md-content>
            
            <md-content class="c-context-item md-hover" @click="onLinkContextMenuRemove">
                <span>Disconnect connection</span>
                <md-icon class="md-accent">delete</md-icon>
            </md-content>
        </c-context-menu>
        
        <c-context-menu :c-activated.sync="systemsCMActive" :c-offset-x="systemsCMOffsetX" :c-offset-y="systemsCMOffsetY" @c-closed="onClosedSystemsContext">
            <md-content class="c-context-item md-hover" @click="onSystemsContextMenuRemove">
                <span >Remove systems</span>
                <md-icon class="md-accent">delete</md-icon>
            </md-content>
        </c-context-menu> 
        
        <c-context-menu :c-activated.sync="systemCMActive" :c-offset-x="systemCMOffsetX" :c-offset-y="systemCMOffsetY" @c-closed="onClosedSystemContext">
            <md-content class="c-context-item md-hover" @click="onSystemContextMenuEdit">
                <span >Edit system</span>
                <md-icon class="md-primary">edit</md-icon>
            </md-content>
            
            <md-content class="c-context-item md-hover" v-if="!systemContextMenuLockedItem" @click="onSystemContextMenuLock">
                <span>Lock system</span>
                <md-icon class="md-accent">lock</md-icon>
            </md-content>
            
            <md-content class="c-context-item md-hover" v-if="systemContextMenuLockedItem" @click="onSystemContextMenuUnlock">
                <span >Unlock system</span>
                <md-icon class="md-primary">lock_open</md-icon>
            </md-content>
            
            <md-content class="c-context-item md-hover" v-if="!systemContextMenuLockedItem" @click="onSystemContextMenuRemove">
                <span >Remove system</span>
                <md-icon class="md-accent">delete</md-icon>
            </md-content>
        </c-context-menu> 
       
    </div>
    <c-area-selection v-on:c-selection-completed="onSelectionCompleted" @c-selection-started="onSelectionStarted"></c-area-selection>
</div>

        `;


        Vue.component("currentMap", {
            props: [

            ],
            data: function () {
                return {
                    selectedMap: null,
                    allowedMaps: [],
                    showMapEmpty: false,
                    isLoaded: false,
                    systemContextMenuLockedItem: false,
                    isAutoAlignment: false,

                    linkCMOffsetX: 0,
                    linkCMOffsetY: 0,
                    linkCMActive: false,

                    systemCMOffsetX: 0,
                    systemCMOffsetY: 0,
                    systemCMActive: false,

                    systemsCMActive: false,
                    systemsCMOffsetX: 0,
                    systemsCMOffsetY: 0,
                }
            },
            template: template,
            mounted: function () {
                this.$refs.systemPanel.$on("closed", this.onSystemInfoPanelClosed.bind(this));

                this._currentOpenSystem = null;

                // this.createMap();
                this.initialize().then(function() {
                    if(this.selectedMap !== null) {
                        this.onMapSelected(this.selectedMap);
                    }
                }.bind(this),function() {
                    debugger;
                }.bind(this));
            },
            methods: {
                // API
                close: function () {
                    if(this.mapController) {
                        var map = this.mapController.map;
                        this.mapController && this.mapController.deinit();
                        map && map.destructor();
                        this.mapController = null
                    }
                    this.$refs.systemPanel.hide();
                },
                refresh: function () {
                    this.mapController && this.mapController.map.refresh();
                },

                initialize: function () {
                    var pr = new CustomPromise();

                    var mapIds = [];
                    api.eve.map.allowedMaps().then(function (_mapIds) {
                        mapIds = _mapIds;
                        var prarr = [];

                        for (var a = 0; a < mapIds.length; a++) {
                            prarr.push(api.eve.map.info(mapIds[a]));
                        }

                        return Promise.all(prarr);
                    }.bind(this), function (_err) {
                        pr.reject(_err);
                    }.bind(this)).then(function (_arr) {
                        for (var a = 0; a < _arr.length; a++) {
                            _arr[a].id = mapIds[a];
                        }

                        this.allowedMaps = _arr;

                        this.isLoaded = true;
                        this.showMapEmpty = _arr.length === 0;

                        if(!this.showMapEmpty) {
                            this.selectedMap = _arr[0].id;
                        }
                        pr.resolve();
                    }.bind(this), function (_err) {
                        pr.reject(_err);
                    }.bind(this))

                    return pr.native;
                },

                onSelectionCompleted: function (_event) {
                    this.mapController.setSelection(_event.leftTop, _event.rightBottom);
                },
                onSelectionStarted: function () {
                    this._offContexts();
                },

                onMapSelected: function(_mapId) {
                    this.selectedMap = _mapId;
                    this._destroyMap();
                    this._initMap(_mapId);
                },

                onAAClick: function () {
                    this.isAutoAlignment = !this.isAutoAlignment;

                    this.mapController.map.enableForce(this.isAutoAlignment);
                },

                onSaveClick: function () {
                    var positions = this.mapController.map.collectPositions();
                    api.eve.map.updateSystemsPosition(this.selectedMap, positions);
                },

                /**
                 * Will remove current map if it initialized
                 * @private
                 */
                _destroyMap: function () {
                    if(this.mapController) {
                        var map = this.mapController.map;
                        this.mapController && this.mapController.deinit();
                        map && map.destructor();
                        this.mapController = null
                    }
                },

                _initMap: function (_mapId) {
                    var bounds = this.$el.getBoundingClientRect();

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
                    var systemInfo = this.mapController.getSystem(this._currentContextSystem).info;
                    this.systemContextMenuLockedItem = systemInfo.isLocked;
                    this.systemCMOffsetX = _event.x + 10;
                    this.systemCMOffsetY = _event.y + 10;
                },
                _onSystemsContextMenu: function (_systemIds, _event) {
                    this._offContexts();

                    this._currentSelectedSystems = _systemIds;
                    this.systemsCMActive = true;
                    this.systemsCMOffsetX = _event.x + 10;
                    this.systemsCMOffsetY = _event.y + 10;
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
                onSystemInfoPanelClosed: function () {
                    this._currentOpenSystem = null;
                },
                _onSystemOpenInfo: function (_systemId, _event) {
                    this._offContexts();
                    this.mapController.map.deselectAll();

                    if(this._currentOpenSystem === _systemId)
                        return;

                    this._currentOpenSystem = _systemId;
                    this.$refs.systemPanel.show(this.mapController.mapId, _systemId);

                    this.$nextTick(function () {
                        this.$refs.systemPanel.update(_event);
                    }.bind(this));
                },
                _onDragStarted: function () {
                    this._offContexts();
                },
                _onMapClicked: function () {
                    this.mapController.map.deselectAll();
                    this._offContexts();
                },
                onMapContainerContext: function (_event) {
                    _event.preventDefault();
                    _event.stopPropagation();
                },
                onLinkContextMenuEdit: function() {

                },
                onLinkContextMenuRemove: function () {
                    api.eve.map.linkRemove(this.selectedMap, this._currentContextLink);
                },
                onSystemContextMenuEdit: function() {

                },
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
        });
    });
})(window);

