<template>
    <div class="wd-route">
        <md-card class="wd-module-card">
            <div class="wd-loader" v-show="loading" >
                <md-progress-spinner class="md-accent" :md-stroke="2" :md-diameter="50" md-mode="indeterminate"></md-progress-spinner>
            </div>

            <wd-table
                :rows="processedRoutes"
                :enable-borders="true"
                v-if="!loading"
                sort-col="jumps"
                sort-order="ascend"
                class="no-cell-hover"
            >
                <template v-slot:toolbar>
                    <div class="md-toolbar-section-start">
                        <div>Routes</div>
                    </div>

                    <div class="md-toolbar-section-end wd-list-margins-x1">
                        <div class="wd-icon-button-x1" @click="reload">
                            <md-tooltip>Refresh</md-tooltip>
                            <md-icon>refresh</md-icon>
                        </div>

                        <div class="wd-icon-button-x1" @click="onClickRoutesSettings">
                            <md-tooltip>Settings</md-tooltip>
                            <md-icon>construction</md-icon>
                        </div>

                        <div class="wd-icon-button-x1" @click="onClickAddHubSystem">
                            <md-tooltip>Add hub</md-tooltip>
                            <md-icon>add_circle_outline</md-icon>
                        </div>

<!--                        <md-button class="md-icon-button md-dense" @click="reload">-->
<!--                            <md-icon>refresh</md-icon>-->
<!--                            <md-tooltip>Refresh</md-tooltip>-->
<!--                        </md-button>-->

<!--                        <md-button class="md-icon-button md-dense" @click="onClickRoutesSettings">-->
<!--                            <md-icon>construction</md-icon>-->
<!--                            <md-tooltip>Settings</md-tooltip>-->
<!--                        </md-button>-->

<!--                        <md-button class="md-icon-button md-dense" @click="onClickAddHubSystem">-->
<!--                            <md-icon>add_circle_outline</md-icon>-->
<!--                            <md-tooltip>Add hub</md-tooltip>-->
<!--                        </md-button>-->
                    </div>
                </template>

                <template v-slot:header>
                    <table-header-cell sortable id="name">name</table-header-cell>
                    <table-header-cell sortable id="jumps" width-policy="55px">jumps</table-header-cell>
                    <table-header-cell id="path" width-policy="1fr">path</table-header-cell>
                    <table-header-cell id="buttonbar" width-policy="55px"></table-header-cell>
                </template>

                <template v-slot:row="{row}">
                    <table-cell id="name">
                        <div class="wd-gl-2c">
                            <div class="wd-route__destination-type" :class="row.statusClass">
                                {{row.status}}
                            </div>
                            <div class="wd-route__destination" >
                                {{row.name}}
                            </div>
                        </div>
                    </table-cell>
                    <table-cell id="jumps">
                        <div class="wd-route__jumps">
                            <template v-if="row.hasConnection">
                                {{row.jumps}}
                            </template>
                        </div>
                    </table-cell>
                    <table-cell id="path" >
                        <div class="wd-route__systems">
                            <template v-if="row.hasConnection">
                                <div
                                    class="wd-route-system"
                                    :class="getBackgroundClass(routeSystem) + ' ' + getShapeClass(routeSystem)"
                                    v-for="routeSystem in row.systems"
                                    v-bind:key="routeSystem.solarSystemId"
                                >
                                    <tooltip placement="top" :customPosition="false" class="wd initial-line-height initial-height wd-layout-secondary md-elevation-2" >
                                        <system-card
                                            :map-id="lMapId"
                                            :solar-system-id="routeSystem.solarSystemId.toString()"
                                            :is-load-char-data="false"
                                            class="wd-layout-secondary"
                                            :show-info="true"
                                        ></system-card>
                                    </tooltip>
                                </div>
                            </template>
                            <template v-else>
                                No connection
                            </template>
                        </div>
                    </table-cell>
                    <table-cell id="buttonbar" class="wd-list-margins wd padding-horizontal-primary wd-route-actions">
                        <div class="wd-icon-button" @click="onHighlightRoute(row.systems)">
                            <md-tooltip>Highlight this route at map</md-tooltip>
                            <md-icon>gps_fixed</md-icon>
                        </div>

                        <div class="wd-icon-button" @click="onRemoveRoute(row.destination)">
                            <md-tooltip>Remove {{row.name}}</md-tooltip>
                            <md-icon>delete_forever</md-icon>
                        </div>
                    </table-cell>
                </template>

                <template v-slot:empty-state>
                    <md-empty-state
                        class="md-primary"
                        md-label="No hubs or systems added"
                        md-description="Here may be your routes for navigating to hubs or systems.">
                    </md-empty-state>
                </template>
            </wd-table>
        </md-card>
        <system-add-dialog :activated.sync="isSystemAddDialogActivated" @system-selected="onSystemSelected" />
        <routes-settings :activated.sync="isSettingsDialogActivated" :settings="routeSettings" @edited="onRoutesEdited"/>
    </div>
</template>

<script>
    import SystemAddDialog from "../../SystemAddDialog.vue";
    import api from "../../../../../js/api.js";
    import exists from "../../../../../js/env/tools/exists.js";
    import "../../../../../js/env/tools/standardTypeExtend.js";
    import environment from "../../../../../js/core/map/environment.js";
    import SystemCard from "../../SystemCard.vue";
    import helper from "../../../../../js/utils/helper.js";
    import SpamFilter from "../../../../../js/env/spamFilter.js";
    import Tooltip from "../../../../ui/Tooltip.vue";
    import cache from "../../../../../js/cache/cache.js";
    import WdTable from "../../../../ui/Table/WdTable.vue";
    import TableHeaderCell from "../../../../ui/Table/TableHeaderCell.vue";
    import TableCell from "../../../../ui/Table/TableCell.vue";
    import CustomPromise from "../../../../../js/env/promise.js";
    import extend from "../../../../../js/env/tools/extend.js";
    import RoutesSettings from "./Routes/RoutesSettings.vue";
    import cookie from "../../../../../js/env/cookie.js";
    import eveHelper from "../../../../../js/eveHelper.js";

    export default {
        name: "Routes",
        components: {
            Tooltip,
            SystemAddDialog,
            SystemCard,
            WdTable,
            TableHeaderCell,
            TableCell,
            RoutesSettings,
        },
        props : {
            mapId: {
                type: String,
                default: null
            },
            solarSystemId: {
                type: String,
                default: null
            }
        },
        data: function () {
            return {
                isSystemAddDialogActivated: false,
                isSettingsDialogActivated: false,
                lMapId: this.mapId,
                lSolarSystemId: this.solarSystemId,
                routes: [],
                loading: true,
                subscribed: false,
                routeSettings: {...environment.defaultRouteSettings},

                pathType: "shortest"
            }
        },
        mounted() {
            this._attrUpdatedSF = new SpamFilter(this._watchAttrsUpdated.bind(this), 10);
            this.isValidAttrs() && this._attrUpdatedSF.call();
        },
        beforeDestroy() {
            this._attrUpdatedSF.stop();
            this._attrUpdatedSF = null;

            this.unsubscribeAll();
        },
        watch: {
            mapId (val) {
                this.lMapId = val;
                this._attrUpdatedSF.call();
            },
            solarSystemId (val) {
                this.lSolarSystemId = val;
                this._attrUpdatedSF.call();
            }
        },
        computed : {
            processedRoutes () {
                return this.routes.map(row => ({
                    status: row.systems.last().classTitle,
                    statusClass: this.getSystemTypeClass(row.systems.last()),
                    name: row.systems.last().solarSystemName,
                    hasConnection: row.hasConnection,
                    jumps: row.hasConnection ? row.systems.length - 1 : Infinity,
                    systems: row.systems,
                    destination: row.destination
                }))
            }
        },
        methods : {
            _watchAttrsUpdated () {
                if(this.isValidAttrs()) {
                    this.unsubscribeAll();
                    this.subscribeAll();
                    this.loadRoutesSettings();
                }
            },
            subscribeAll() {
                this.subscribed = false;

                let mapProvider = cache.maps.list.get(this.mapId);
                this._unsubscribeSolarSystems = mapProvider.solarSystems.existence.subscribe();
                this._unsubscribeChains = mapProvider.chains.existence.subscribe();
                this._unsubscribeHubs = mapProvider.hubs.subscribe();

                Promise.all([
                    mapProvider.solarSystems.existence.readyPromise(),
                    mapProvider.chains.existence.readyPromise(),
                    mapProvider.hubs.readyPromise(),
                ])
                    .then(this._onSubscribedAll.bind(this))
            },
            unsubscribeAll() {
                this.subscribed = false;

                let mapProvider = cache.maps.list.get(this.mapId);

                if(exists(this._unsubscribeMSSId)) {
                    mapProvider.solarSystems.existence.off(this._unsubscribeMSSId);
                    delete this._unsubscribeMSSId;
                }

                if(exists(this._unsubscribeMChainsId)) {
                    mapProvider.chains.existence.off(this._unsubscribeMChainsId);
                    delete this._unsubscribeMChainsId;
                }

                if(exists(this._unsubscribeMHubsId)) {
                    mapProvider.hubs.off(this._unsubscribeMHubsId);
                    delete this._unsubscribeMHubsId;
                }

                if(exists(this._unsubscribeSolarSystems)){
                    this._unsubscribeSolarSystems();
                    delete this._unsubscribeSolarSystems;
                }
                if(exists(this._unsubscribeChains)){
                    this._unsubscribeChains();
                    delete this._unsubscribeChains;
                }
                if(exists(this._unsubscribeHubs)){
                    this._unsubscribeHubs();
                    delete this._unsubscribeHubs;
                }
            },
            _onSubscribedAll () {
                this.subscribed = true;

                let mapProvider = cache.maps.list.get(this.mapId);
                this._unsubscribeMHubsId = mapProvider.hubs.on("changedEvent", this._onHubsSubscriptionChange.bind(this));
                this._unsubscribeMSSId = mapProvider.solarSystems.existence.on("changedEvent", this._onSystemSubscriptionChange.bind(this));
                this._unsubscribeMChainsId = mapProvider.chains.existence.on("changedEvent", this._onChainsSubscriptionChange.bind(this));
            },
            _onSystemSubscriptionChange () {
                this.reload();
            },
            _onChainsSubscriptionChange () {
                this.reload();
            },
            _onHubsSubscriptionChange (event) {
                switch (event.type) {
                    case "bulk":
                        this.loading = false;
                        this.reload();
                        break;
                    case "add":
                        this._loadRoutes([event.hubId]);
                        break;
                    case "removed":
                        this._removeRoute(event.hubId);
                        break;
                }
            },
            _loadRoutes (hubs) {
                let pr = new CustomPromise();
                api.eve.map.routes.getRoutes(this.lMapId, this.lSolarSystemId, hubs, this.routeSettings)
                    .then(
                        event => {
                            this.updateRoutes(event);
                            pr.resolve();
                        },
                        err => helper.errorHandler(this, err)
                    );

                return pr.native;
            },
            _removeRoute (routeId) {
                this.routes.eraseByObjectKey("destination", routeId);
            },
            reload() {
                if(!this.loading) {
                    this.loading = true;
                    this._loadRoutes(cache.maps.list.get(this.mapId).hubs.data())
                        .then(
                            () => this.loading = false
                        )
                }
            },
            updateRoutes (routes) {
                let newArr = [];

                routes.map(x => {
                    let obj = this.routes.searchByObjectKey("destination", x.destination);
                    if(obj)
                        newArr.push(extend(extend({}, obj), x));
                    else
                        newArr.push(x);
                });

                let out = [];
                this.routes.map(x => {
                    let obj = newArr.searchByObjectKey("destination", x.destination);
                    out.push(obj ? obj : x)
                })

                newArr.map(x => {
                    let obj = out.searchByObjectKey("destination", x.destination);
                    !obj && out.push(x);
                });

                this.routes = out;
            },
            isValidAttrs () {
                return exists(this.lMapId) && exists(this.lSolarSystemId);
            },
            onClickAddHubSystem () {
                this.isSystemAddDialogActivated = true;
            },
            onClickRoutesSettings () {
                this.isSettingsDialogActivated = true;
            },
            onSystemSelected (solarSystemId) {
                api.eve.map.routes.addHub(this.lMapId, solarSystemId)
                    .then(
                        () => this.isSystemAddDialogActivated  = false,
                        err => helper.errorHandler(this, err)
                    );
            },
            onRoutesEdited (data) {
                cookie.set(`routes_settings_${this.lMapId}`, JSON.stringify(data), {expires: 60 * 60 * 24 * 365 * 1000});

                this.routeSettings = data;
                this.isSettingsDialogActivated = false;
                this.reload();
            },
            loadRoutesSettings () {
                let savedFilter = cookie.get(`routes_settings_${this.lMapId}`);
                if(savedFilter) {
                    this.routeSettings = JSON.parse(savedFilter);
                }
            },
            onRemoveRoute(destinationSolarSystemId) {
                api.eve.map.routes.removeHub(this.lMapId, destinationSolarSystemId)
                    .then (
                        helper.dummy,
                        err => helper.errorHandler(this, err)
                    )
            },
            onHighlightRoute (systems) {
                this.$emit("highlight-route", systems.map(x => x.solarSystemId))
            },

            getSystemTypeClass (data) {
                if (eveHelper.isKnownSpace(data.systemClass)) {
                    return environment.securityForegroundClasses[data.security];
                } else if (eveHelper.isWormholeSpace(data.systemClass)) {
                    return environment.wormholeClassStyles[data.systemClass];
                } else {
                    return environment.systemClassStyles[data.systemClass];
                }
            },
            getBackgroundClass (data){
                if(eveHelper.isZarzakhSpace(data.systemClass)) {
                    return environment.systemClassBackgroundStyles[data.systemClass];
                } else if (eveHelper.isKnownSpace(data.systemClass)) {
                    return environment.securityBackgroundClasses[data.security];
                } else if (eveHelper.isWormholeSpace(data.systemClass)) {
                    return environment.wormholeClassBackgroundStyles[data.systemClass];
                } else {
                    return environment.systemClassBackgroundStyles[data.systemClass];
                }
            },
            getShapeClass (data) {
                if(eveHelper.isPochvenSpace(data.systemClass) || (eveHelper.isKnownSpace(data.systemClass) && eveHelper.isTriglavianInvasion(data.triglavianInvasionStatus))) {
                    return "wd-route-system-shape-triangle";
                }

                if(eveHelper.isWormholeSpace(data.systemClass)) {
                    return "wd-route-system-shape-circle";
                }

                return "";
            }
        }
    }
</script>

<style lang="scss">
    @import "src/css/variables";

    .wd-loader {
        display: flex;
        justify-content: center;
        align-items: center;
        box-sizing: border-box;
        padding: 20px;
    }

    .wd-route-actions {
        min-width: 40px;
    }

    .wd-route {
        line-height: initial;

        .wd-table {
            .wd-table-content {
                & > .wd-table-cell,
                & > .wd-table-header-cell {
                    min-height: 30px !important;
                }

                @for $i from 1 through 30 {
                    &.wd-table-borders.wd-table-cols-#{$i} > .wd-table-header-cell:not(:nth-child(#{$i})),
                    &.wd-table-borders.wd-table-cols-#{$i} > .wd-table-cell:not(:nth-child(#{$i}n+#{$i * 2})),
                    {
                        border-right: 1px solid $border-color-primary-5;
                    }

                    &.wd-table-borders.wd-table-cols-#{$i} > .wd-table-cell:nth-last-child(n + #{$i + 1}),
                    {
                        border-bottom: 1px solid $border-color-primary-5;
                    }
                }

                &.wd-table-borders > .wd-table-header-cell {
                    border-bottom: 1px solid $border-color-primary-5;
                }

                &.wd-table-borders > .wd-table-header-cell:hover {
                    border-bottom: 1px solid $border-color-primary-2;
                }

            }
        }

        .wd-module-card {
            padding: 10px 5px;
        }

        .wd-route__destination-type {
            min-width: 10px;
            font-weight: bold;
        }

        .wd-route__destination {
            min-width: 60px;
            font-weight: bold;
            color: $fg-contrast;
        }

        .wd-route__jumps {
            min-width: 10px;
        }

        .wd-route__systems {
            display: flex;
            flex-wrap: wrap;
            align-items: center;
            justify-content: flex-start;
            width: 100%;
            padding: 2px 5px;
            box-sizing: border-box;

            .wd-route-system {
                width: 9px;
                height: 9px;
                margin-right: 2px;
                margin-bottom: 2px;
            }
        }
    }

</style>