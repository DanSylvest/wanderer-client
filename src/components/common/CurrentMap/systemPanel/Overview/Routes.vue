<template>
    <div>
        <md-card class="wd-module-card">
            <md-card-header>
                <div class="wd-system-overview__card-header wd flex flex-justify-sb flex-align-center">
                    <div>Routes</div>

                    <md-button class="md-icon-button md-dense" @click="onClickAddHubSystem">
                        <md-icon>add_circle_outline</md-icon>
                    </md-button>
                </div>
            </md-card-header>

            <md-card-content>
                <div class="wd-routes-container">
                    <div class="wd-loader" v-show="loading" >
                        <md-progress-spinner class="md-accent" :md-stroke="2" :md-diameter="50" md-mode="indeterminate"></md-progress-spinner>
                    </div>
                    <template v-if="routes.length === 0 && !loading">
                        <md-empty-state
                            class="md-primary"
                            md-label="No hubs or systems added"
                            md-description="Here may be your routes for navigating to hubs or systems.">
                        </md-empty-state>
                    </template>
                    <div class="wd-route" v-show="routes.length > 0 && !loading">
                        <template v-for="item in routes" @mouseover="onMouseOver">
                            <div class="wd-route__destination-type" :class="getSystemTypeClass(item.systems.last())" :key="item.id">
                                {{item.systems.last().typeName}}
                            </div>
                            <div class="wd-route__destination" :key="item.id">
                                {{item.systems.last().solarSystemName}}
                            </div>
                            <div class="wd-route__jumps" :key="item.id">
                                <template v-if="item.hasConnection">
                                    {{item.systems.length - 1}}
                                </template>
                            </div>
                            <div class="wd-route__systems" :key="item.id">
                                <template v-if="item.hasConnection">
                                    <div
                                        class="wd-route-system"
                                        :class="getBackgroundClass(routeSystem) + ' ' + getShapeClass(routeSystem)"
                                        v-for="routeSystem in item.systems"
                                        v-bind:key="routeSystem.id"
                                    >
                                        <md-tooltip md-direction="top" class="wd initial-line-height initial-height wd-layout-secondary md-elevation-2" >
                                            <system-card
                                                :c-map-id="localMapId"
                                                :c-solar-system-id="routeSystem.id"
                                                :is-load-char-data="false"
                                                :data="routeSystem"
                                                class="wd-layout-secondary"
                                            ></system-card>
                                        </md-tooltip>
                                    </div>
                                </template>
                                <template class="wd-route__systems" v-if="!item.hasConnection">
                                    No connection
                                </template>
                            </div>

                            <div :key="item.id" style="visibility: hidden;"></div>
                            <div :key="item.id">
                                <div class="wd-icon-button" @click="onHighlightRoute(item)">
                                    <md-tooltip>Highlight this route at map</md-tooltip>
                                    <md-icon>gps_fixed</md-icon>
                                </div>
                            </div>
                            <div :key="item.id">
                                <div class="wd-icon-button" @click="onRemoveRoute(item.destination)">
                                    <md-tooltip>Remove {{item.systems.last().solarSystemName}}</md-tooltip>
                                    <md-icon>delete_forever</md-icon>
                                </div>
                            </div>
                        </template>
                    </div>
                </div>

            </md-card-content>
        </md-card>

        <system-add-dialog :activated.sync="isSystemAddDialogActivated" @system-selected="onSystemSelected"></system-add-dialog>
    </div>
</template>

<script>
    import SystemAddDialog from "../../SystemAddDialog.vue";
    import api from "../../../../../js/api.js";
    import exists from "../../../../../js/env/tools/exists.js";
    import "../../../../../js/env/tools/standardTypeExtend.js";
    import environment from "../../../../../js/core/map/environment.js";
    import SystemCard from "../../SystemCard.vue";

    export default {
        name: "Routes",
        components: {
            SystemAddDialog,
            SystemCard
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
                localMapId: this.mapId,
                localSolarSystemId: this.solarSystemId,
                localData: this.data,
                routes: [],
                loading: true
            }
        },
        mounted() {
            this.isMounted = true;

            if(this.waitMount) {
                this.waitMount = false;
                this.$nextTick().then(this.loadRoutesData);
            } else {
                this.$nextTick().then(this.loadRoutesData);
            }
        },
        watch: {
            mapId (val) {
                this.localMapId = val;
                this.loadRoutesData();
            },
            solarSystemId (val) {
                this.localSolarSystemId = val;
                this.loadRoutesData();
            }
        },
        methods : {
            onMouseOver () {
                // eslint-disable-next-line no-debugger
                debugger
            },
            onClickAddHubSystem () {
                this.isSystemAddDialogActivated = true;
            },
            onSystemSelected (solarSystemId) {
                api.eve.map.routes.addHub(this.localMapId, solarSystemId).then(() => {
                    this.isSystemAddDialogActivated  = false;
                    this.loadRoutesData();
                }, errMsg => {
                    alert(errMsg);
                });
            },
            onRemoveRoute(destinationSolarSystemId) {
                api.eve.map.routes.removeHub(this.localMapId, destinationSolarSystemId).then (() => {
                    this.loadRoutesData();
                })
            },
            onHighlightRoute (route) {
                this.$emit("highlight-route", route.systems.map(x => x.solarSystemId))
            },
            updateRoutes (routes) {
                this.routes = routes;
                this.$emit("hubs-updated", routes.map(x => x.destination));
            },
            loadRoutesData() {
                this.loading = true;
                if(exists(this.localMapId) && exists(this.localSolarSystemId)) {
                    if(!this.isMounted) {
                        this.waitMount = true;
                        return;
                    }

                    api.eve.map.routes.list(this.localMapId, this.localSolarSystemId).then((routes) => {
                        this.loading = false;
                        this.updateRoutes(routes);
                    }, (errMsg) => {
                        alert(errMsg);
                    });

                }
            },
            // getSecurityClass (security){
            //     return environment.securityBackgroundClasses[security];
            // },
            //typeName systemType, security
            getSystemTypeClass (data){
                switch (data.systemType) {
                    case 0: // high-sec
                    case 1: // low-sec
                    case 2: // null-sec
                        return environment.securityForegroundClasses[data.security];
                    case 3: // WH
                    case 4: // Thera
                        return environment.typeClasses[data.typeName];
                    case 5: // abyss
                    case 6: // penalty?
                    case 7: // Pochven?
                        return environment.kindClassed[data.systemType];
                }
            },
            getBackgroundClass (data){
                switch (data.systemType) {
                    case 0: // high-sec
                    case 1: // low-sec
                    case 2: // null-sec
                        return environment.securityBackgroundClasses[data.security];
                    case 3: // WH
                    case 4: // Thera
                        return environment.typeBackgroundClasses[data.typeName];
                    case 5: // abyss
                    case 6: // penalty?
                    case 7: // Pochven?
                        return environment.kindBackgroundClasses[data.systemType];
                }
            },
            getShapeClass (data) {
                switch (data.systemType) {
                    case 0: // high-sec
                    case 1: // low-sec
                    case 2: // null-sec
                        switch (data.triglavianInvasionStatus) {
                            case "Normal":
                                return ""
                            case "Final":
                            case "Edencom":
                            case "Triglavian":
                                return "wd-route-system-shape-triangle";
                        }
                        return "";
                    case 3: // WH
                    case 4: // Thera
                        return "wd-route-system-shape-circle";
                    case 5: // abyss
                    case 6: // penalty?
                        return "";
                    case 7: // Pochven?
                        return "wd-route-system-shape-triangle";
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

    .wd-icon-button {
        cursor: pointer;
        /*width: 10px;*/
        /*height: 10px;*/

        i {
            color: $fg-primary-2 !important;
            width: 10px;
            height: 10px;
            min-width: 17px;
            font-size: 18px !important;

            &:hover {
                color: $fg-contrast-2 !important;
            }
        }
    }

    .wd-routes-container {
        .wd-route {
            display: grid;
            grid-column-gap: 5px;
            grid-row-gap: 5px;
            grid-template-columns: auto auto auto auto 1fr auto auto;
            line-height: initial;

            & > div {
                display: flex;
                align-items: center;

                font-size: $font-size-medium-small;
                font-family: sans-serif;
                color: $fg-primary;
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
                padding-left: 2px;
                padding-top: 2px;
                width: 100%;

                .wd-route-system {
                    width: 9px;
                    height: 9px;
                    margin-right: 2px;
                    margin-bottom: 2px;
                }
            }
        }
    }

</style>