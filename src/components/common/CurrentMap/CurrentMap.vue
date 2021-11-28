<template>
  <div class="wd-current-map">
    <AppToolbar>
      <div class="wd-map-toolbar">
        <transition name="fade">
          <user-characters v-show="!loadingMap" :map-id="selectedMap" />
        </transition>
      </div>
    </AppToolbar>

    <div class="wd wd-current-map__content f-width relative box-sizing padding-primary">

      <div v-if="isLoaded" class="wd fs relative padding-primary">
        <div v-if="!showMapEmpty" class="wd fs relative">

          <transition name="fade">
            <div v-show="!loadingMap" class="wd fs relative">
              <div id="mapContainer" class="wd fs relative" @contextmenu="onMapContainerContext" />
            </div>
          </transition>

          <transition name="fade2">
            <div v-if="showMapLoader" class="wd fs relative wd-map-loader">
              <md-progress-spinner
                class="md-accent"
                :md-stroke="2"
                :md-diameter="100"
                md-mode="indeterminate"
              ></md-progress-spinner>
              <md-empty-state
                md-label="Loading..."
                :md-description="getRandomAdvice()"
              />
            </div>
          </transition>

          <div style="height: 0; width: 150px; top: 0;" class="wd absolute md-layout-item">
            <md-field>
              <label>Select a map...</label>
              <md-select
                :disabled="loadingMap"
                v-model="selectedMap"
                name="selectedMap"
                id="selectedMap"
                md-dense
                @md-selected="onMapSelected($event)"
              >
                <md-option v-for="item in allowedMaps" :value="item.id" :key="item.id">{{ item.name }}</md-option>
              </md-select>
            </md-field>
          </div>

          <transition name="fade">
            <md-speed-dial
              class="md-bottom-left"
              md-direction="top"
              style="margin-left: -20px; margin-bottom: -25px"
              v-if="!loadingMap"
            >
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
          <md-button class="md-primary md-raised" @click="showCreateSimpleDialog = true">
            <div class="wd f-c-sb">
              <md-icon>library_add</md-icon>
              <div style="width: 5px;" />
              <span>Add map</span>
            </div>
          </md-button>
        </md-empty-state>
      </div>

      <div style="height: 0">
        <!-- CHAIN CONTEXT MENU -->
        <chain-context-menu
          :show.sync="linkCMActive"
          :map-id="selectedMap"
          :chain-id="currentChainId"
          :offset="currentChainOffset"
        />

        <!-- SOLAR SYSTEM CONTEXT MENU -->
        <solar-system-context-menu
          :show.sync="systemCMActive"
          :data="solarSystemContextData"
          @contextActivated="onSolarSystemContextActivated"
        />

        <!-- SOLAR SYSTEMS CONTEXT MENU -->
        <context-menu
          :c-activated.sync="systemsCMActive"
          :c-offset-x="systemsCMOffsetX"
          :c-offset-y="systemsCMOffsetY"
          @c-closed="onClosedSystemsContext"
        >
          <context-menu-item c-title="Remove systems" c-icon="delete" @click="onSystemsContextMenuRemove" />
        </context-menu>

        <!-- ROOT CONTAINER CONTEXT MENU -->
        <context-menu
          :c-activated.sync="rootCMActive"
          :c-offset-x="rootCMOffsetX"
          :c-offset-y="rootCMOffsetY"
          @c-closed="onRootCMClosed"
        >
          <context-menu-item c-title="Add system" c-icon="add_circle_outline" @click="onRootCMAddSystem" />
        </context-menu>

        <tooltip
          v-for="{x, y, systemId, mapId} in systemsTooltipDisplayed"
          :offset-x="x"
          :offset-y="y"
          :activated="true"
          :key="systemId"
          class="wd-layout-secondary"
        >
          <system-card :solar-system-id="systemId" :map-id="mapId" :exists-on-map="true" />
        </tooltip>

        <system-add-dialog :activated.sync="isActiveSystemAddDialog" @system-selected="onSystemAdd"></system-add-dialog>
      </div>
      <system-panel
        :show.sync="systemPanelShow"
        :map-id="systemPanelMapId"
        :solar-system-id="systemPanelSolarSystemId"
        @highlight-route="onHighlightRoute"
        @closed="onSystemInfoPanelClosed"
      />
      <area-selection @selection-completed="onSelectionCompleted" @selection-started="onSelectionStarted" />
    </div>

    <map-create-simple-dialog :show.sync="showCreateSimpleDialog" />
  </div>

</template>

<script>
  import CustomPromise from '../../../js/env/promise';
  import cookie from '../../../js/env/cookie';
  import query from '../../../js/env/query';
  import api from '../../../js/api';
  import MapController from './controller/mapController';
  import Map from '../../../js/core/map/map';
  import exists from '../../../js/env/tools/exists';
  import environment from '../../../js/core/map/environment.js';
  import SolarSystemContextMenu from './ContextMenu/SolarSystemContextMenu.vue';

  import ContextMenu from '../../ui/ContextMenu/ContextMenu';
  import ContextMenuItem from '../../ui/ContextMenu/ContextMenuItem';
  import AreaSelection from '../../ui/AreaSelection';
  import SystemPanel from './SystemPanel/SystemPanel';
  import Tooltip from '../../ui/Tooltip';
  import SystemCard from './SystemCard';
  import SystemAddDialog from './SystemAddDialog.vue';
  import copyToClipboard from '../../../js/env/copyToClipboard.js';
  import helper from '../../../js/utils/helper.js';
  import ChainContextMenu from './ContextMenu/ChainContextMenu.vue';
  import AppToolbar from '../../ui/App/AppToolbar.vue';
  import eveHelper from '../../../js/eveHelper.js';
  import UserCharacters from './UserCharacters/UserCharacters';
  import MapCreateSimpleDialog from '../Maps/MapCreateSimpleDialog/MapCreateSimpleDialog';

  export default {
    name: 'CurrentMap',
    components: {
      MapCreateSimpleDialog,
      UserCharacters,
      ContextMenu,
      ContextMenuItem,
      AreaSelection,
      SystemPanel,
      Tooltip,
      SystemCard,
      SystemAddDialog,
      SolarSystemContextMenu,
      ChainContextMenu,
      AppToolbar,
    },
    props: [],
    data: function () {
      return {
        systemPanelShow: false,
        systemPanelMapId: '',
        systemPanelSolarSystemId: '',

        currentChainId: null,
        currentChainOffset: { x: 0, y: 0 },

        solarSystemContextData: {
          offset: { x: 0, y: 0 },
          tag: '',
          status: -1,
          isSystemInKSpace: false,
          markAsHub: false,
          isLocked: false,
          mapId: '',
          solarSystemId: '',
        },

        selectedMap: null,
        allowedMaps: [],
        isLoaded: false,
        systemContextMenuLockedItem: false,
        systemContextMenuMarkAsHub: true,
        isAutoAlignment: false,
        characters: [],

        rootCMActive: false,
        rootCMOffsetX: 0,
        rootCMOffsetY: 0,

        linkCMActive: false,
        systemCMActive: false,

        systemsCMActive: false,
        systemsCMOffsetX: 0,
        systemsCMOffsetY: 0,

        systemsTooltipDisplayed: [],

        isActiveSystemAddDialog: false,
        loadingMap: true,
        showMapLoader: false,
        showCreateSimpleDialog: false,
      };
    },
    mounted: function () {
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
            helper.errorHandler(this, err);
          },
        );
    },
    beforeDestroy: function () {
      this.initMapTid !== -1 && clearTimeout(this.initMapTid);

      if (this.__tid) {
        clearTimeout(this.__tid);
        delete this.__tid;
      }

      if (this.selectedMap !== null) {
        api.eve.map.updateWatchStatus({ mapId: this.selectedMap, status: false })
          .then(
            helper.dummy,
            error => helper.errorHandler(this, error),
          );
      }

      this._destroyMap();

      if (this._mapsSubscriber) {
        this._mapsSubscriber.unsubscribe();
        this._mapsSubscriber.destructor();
        this._mapsSubscriber = null;
      }

      this.hideSystemPanel();
    },
    computed: {
      showMapEmpty () {
        return this.allowedMaps.length === 0;
      },
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
        prarr.push(this.subscribeOnMaps());
        Promise.all(prarr)
          .then(
            () => {
              this.isLoaded = true;
              pr.resolve();
            },
            pr.reject,
          );

        return pr.native;
      },
      _initMap: function (_mapId) {
        let queryData = query.searchObject();
        queryData.id = _mapId;
        window.history.replaceState(null, null, `?${ query.toString(queryData) }`);


        this.initMapTid !== -1 && clearTimeout(this.initMapTid);
        this.initMapTid = setTimeout(() => {
          this.initMapTid = -1;
          this._destroyMap();

          let bounds = this.$el.getBoundingClientRect();

          this.mapController = new MapController(new Map({
            container: document.querySelector('#mapContainer'),
            width: bounds.width,
            height: bounds.height,
          }), _mapId);

          this.mapController.on('linkContextMenu', this._onLinkContextMenu.bind(this));
          this.mapController.on('systemContextMenu', this._onSystemContextMenu.bind(this));
          this.mapController.on('systemsContextMenu', this._onSystemsContextMenu.bind(this));
          this.mapController.on('systemOpenInfo', this._onSystemOpenInfo.bind(this));
          this.mapController.on('systemChange', this._onSystemChange.bind(this));
          this.mapController.on('linkChanged', this._onLinkChanged.bind(this));
          this.mapController.on('dragStarted', this._onDragStarted.bind(this));
          this.mapController.on('mapClicked', this._onMapClicked.bind(this));
          this.mapController.on('offsetChanged', this._onMapOffsetChanged.bind(this));
          this.mapController.on('markerIn', this._onMapMarkerIn.bind(this));
          this.mapController.on('markerOut', this._onMapMarkerOut.bind(this));
          this.mapController.on('removed', this._onMapRemoved.bind(this));
          this.mapController.on('error', this._onMapError.bind(this));

          let offset = cookie.get(`offset_${ _mapId }`);
          if (offset) {
            let pointArr = offset.split(',');
            this.mapController.setOffset(parseFloat(pointArr[0]), parseFloat(pointArr[1]));
          }

          this.mapController.init()
            .then(() => {
              this.loadingMap = false;
              this.showMapLoader = false;
            });

        }, 2500);

        this.showMapLoader = true;

        this.hideSystemPanel();

        this.loadingMap = true;
      },
      /**
       * Will remove current map if it initialized
       * @private
       */
      _destroyMap: function () {
        if (this.mapController) {
          let map = this.mapController.map;
          this.mapController && this.mapController.deinit();
          map && map.destructor();
          this.mapController = null;
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
      _onSystemOpenInfo: function (_systemId) {
        this._offContexts();
        this.mapController.map.deselectAll();
        this.mapController.offSystemActive();

        if (this._currentOpenSystem === _systemId) {
          this.hideSystemPanel();

          this._currentOpenSystem = null;
          return;
        }

        this.mapController.setSystemActive(_systemId);
        this._currentOpenSystem = _systemId;
        this.showSystemPanel();
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
        cookie.set(`offset_${ this.mapController.mapId }`, `${ _offset.x },${ _offset.y }`, {
          expires: 60 * 60 * 24 * 365 * 1000,
        });
      },
      _onMapMarkerIn: function (_systemId, _event) {
        this.systemsTooltipDisplayed.push({ mapId: this.selectedMap, systemId: _systemId, x: _event.x, y: _event.y });
      },
      _onMapMarkerOut: function (_systemId/*, _event*/) {
        this.systemsTooltipDisplayed.eraseByObjectKey('systemId', _systemId);
      },
      _onMapRemoved: function () {
        this.allowedMaps.eraseByObjectKey('id', this.selectedMap);
        this._destroyMap();
        this.selectMapOnStart();
      },
      _onMapError (errData) {
        helper.errorHandler(this, errData);
      },
      _onSystemChange (_data) {
        switch (_data.type) {
          case 'removed':
            if (_data.systemId === this._currentOpenSystem) {
              this.hideSystemPanel();
            }

            this.mapController.offAllShade();
            break;
          case 'add':
            this.mapController.offAllShade();
            break;
        }
      },
      _onLinkChanged (_data) {
        switch (_data.type) {
          case 'removed':
          case 'linkUpdated':
          case 'add':
            this.mapController.offAllShade();
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
        let systemInfo = this.mapController.getSystem(solarSystemId).data();

        this.solarSystemContextData = {
          offset: { x: x + 10, y: y + 10 },
          tag: systemInfo.tag,
          status: systemInfo.status,
          isSystemInKSpace: eveHelper.isKnownSpace(systemInfo.systemClass),
          markAsHub: this.mapController.hubs.indexOf(this._currentContextSystem) === -1,
          isLocked: systemInfo.isLocked,
          mapId: this.mapController.mapId,
          solarSystemId: solarSystemId,
        };
      },
      onSolarSystemContextActivated (event) {
        let systemInfo = this.mapController.getSystem(this._currentContextSystem).data();
        switch (event.type) {
          case 'tag':
            systemInfo.tag = event.data;
            api.eve.map.solarSystem.update(this.selectedMap, this._currentContextSystem, { tag: event.data })
              .then(
                helper.dummy,
                err => helper.errorHandler(this, err),
              );
            break;
          case 'status':
            api.eve.map.solarSystem.update(this.selectedMap, this._currentContextSystem, { status: event.data });
            systemInfo.status = event.data;
            break;
          case 'copyName':
            copyToClipboard(systemInfo.name);
            break;
          case 'markAsHub':
            if (event.data) {
              api.eve.map.routes.addHub(this.selectedMap, this._currentContextSystem)
                .then(
                  helper.dummy,
                  error => helper.errorHandler(this, error),
                );
            } else {
              api.eve.map.routes.removeHub(this.selectedMap, this._currentContextSystem)
                .then(
                  helper.dummy,
                  err => helper.errorHandler(this, err),
                );
            }
            break;
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
        this._offContexts();

        this.currentChainId = linkId;
        this.currentChainOffset = { x: x + 10, y: y + 10 };
        this.linkCMActive = true;
      },
      selectMapOnStart (needUpdate) {
        let currentMapId = null;
        let queryMapId = query.searchObject().id;
        let cookieMapId = cookie.get('selectedMap');

        if (exists(queryMapId)) {
          currentMapId = queryMapId;
        } else if (exists(cookieMapId)) {
          currentMapId = cookieMapId;
        } else if (!this.showMapEmpty) {
          currentMapId = this.allowedMaps[0].id;
        }

        let isSetMap = true;
        if (!this.allowedMaps.searchByObjectKey('id', currentMapId)) {
          if (this.allowedMaps.length > 0) {
            currentMapId = this.allowedMaps[0].id;
          } else {
            isSetMap = false;
            cookie.remove('selectedMap');
          }
        }

        if (isSetMap) {
          this.selectedMap = currentMapId;
          needUpdate && this.onMapSelected(currentMapId);
        }
      },
      subscribeOnMaps () {
        let pr = new CustomPromise();
        // we must subscribe on map systems and links
        this._mapsSubscriber = api.eve.map.subscribeAllowedMaps(this.mapId);
        this._mapsSubscriber.one('change', (data) => {
          if (data.type === 'add' && data.maps.length > 0) {
            Promise.all(data.maps.map(mapId => api.eve.map.info(mapId)))
              .then(
                arr => {
                  data.maps.forEach((mapId, i) => arr[i].id = mapId);

                  this.allowedMaps = arr;
                  this._mapsSubscriber.on('change', this._onMapsListChanged.bind(this));
                  pr.resolve();
                },
                err => pr.reject(err),
              );
          } else {
            this.allowedMaps = [];
            this._mapsSubscriber.on('change', this._onMapsListChanged.bind(this));
            pr.resolve();
          }
        });

        this._mapsSubscriber.subscribe();

        return pr.native;
      },
      _onMapsListChanged (data) {
        switch (data.type) {
          case 'added':
            Promise.all(data.maps.map(mapId => api.eve.map.info(mapId)))
              .then(
                arr => {
                  data.maps.map((mapId, i) => arr[i].id = mapId);

                  let hasMapsBefore = this.allowedMaps.length > 0;
                  arr.map(x => this.allowedMaps.push(x));

                  if (!hasMapsBefore) {
                    this.selectMapOnStart(true);
                  }
                },
              );
            break;
          case 'removed':
            var isUpdate = false;
            data.maps.map(mapId => {
              this.allowedMaps.eraseByObjectKey('id', mapId);

              if (!isUpdate && mapId === this.selectedMap) {
                isUpdate = true;
              }
            });

            if (isUpdate) {
              this._destroyMap();
              this.selectMapOnStart();
            }
        }

      },
      /** *************************** **/
      /** ****** PUBLIC METHODS ***** **/


      /** ********* HANDLERS ******** **/
      /** *************************** **/
      onSystemAdd (solarSystemId) {
        api.eve.map.solarSystem.addManual(this.mapController.mapId, solarSystemId, this.tempCoord.x, this.tempCoord.y)
          .then(
            () => this.isActiveSystemAddDialog = false,
            err => helper.errorHandler(this, err),
          );
      },
      onSelectionCompleted: function (_event) {
        this.mapController.setSelection(_event.leftTop, _event.rightBottom);
      },
      onSelectionStarted: function () {
        this._offContexts();
      },
      onMapSelected: function (_mapId) {
        cookie.set('selectedMap', _mapId);

        api.eve.map.updateWatchStatus({ mapId: _mapId, status: true })
          .then(
            () => this._initMap(_mapId),
            error => helper.errorHandler(this, error),
          );
      },
      // // this handler enable auto alignment
      // onAAClick: function () {
      //     this.isAutoAlignment = !this.isAutoAlignment;
      //
      //     this.mapController.map.enableForce(this.isAutoAlignment);
      // },

      // this handler will save solar system positions
      onSaveClick: function () {
        let positions = this.mapController.map.collectPositions();
        api.eve.map.solarSystem.updatePositions(this.selectedMap, positions)
          .then(
            helper.dummy,
            err => helper.errorHandler(this, err),
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
      onClosedSystemsContext: function () {
        this._currentSelectedSystems = [];
      },
      onSystemsContextMenuRemove: function () {
        api.eve.map.solarSystem.remove(this.selectedMap, this._currentSelectedSystems)
          .then(
            helper.dummy,
            err => helper.errorHandler(this, err),
          );
      },
      onHighlightRoute (route) {
        this.mapController.highlightRoute(route);
      },
      onRootCMClosed: function () {

      },
      onRootCMAddSystem: function (event) {
        this.tempCoord = this.mapController.convertPosition(event.x, event.y);
        this.isActiveSystemAddDialog = true;
      },
      getRandomAdvice () {
        return environment.advices[Number.randomInt(0, environment.advices.length - 1)].description;
      },
      showSystemPanel () {
        this.systemPanelShow = true;
        this.systemPanelMapId = this.mapController.mapId;
        this.systemPanelSolarSystemId = this._currentOpenSystem;
      },
      hideSystemPanel () {
        this.systemPanelShow = false;
      },
    },
  };
</script>

<style lang="scss">
  @import "../../../css/variables";

  .wd-map-loader {
    display: flex;
    justify-content: center;
    align-items: center;
    flex-direction: column;
  }

  .wd-current-map {
    display: flex;
    flex-direction: column;
    height: 100%;

    .wd-current-map__content {
      height: calc(100% - 49px);

      & > div:first-child {
        border-width: 1px;
        border-style: dashed;
        border-color: $border-color-primary-5;
        border-radius: 5px;

        /*background-color: #222;*/
        /*background-image: linear-gradient(rgba(80, 80, 80, .12) 1px, transparent 0.5px), linear-gradient(90deg, rgba(80, 80, 80, .12) 1px, transparent 1px);*/
        /*background-size: 16px 16px;*/
      }
    }
  }


  .wd-map-toolbar {
    width: 100%;
    height: 100%;
    display: flex;
    justify-content: flex-start;
    align-items: center;
    padding: 5px 5px;
    box-sizing: border-box;
    color: $fg-primary;
  }

  .wd-characters-icons {
    transition: border-color 250ms, opacity 250ms;

    width: 35px;
    height: 35px;
    border-radius: 50%;
    border-width: 2px;
    border-style: solid;
    border-color: $border-color-primary-4;
    background-color: $bg-transparent;
    cursor: pointer;
    opacity: 0.6;

    &.character-online {
      border-color: $color-online;
      opacity: 1;
    }

    &:hover {
      opacity: 1;
      border-color: $fg-theme-primary-solid;
    }
  }

</style>