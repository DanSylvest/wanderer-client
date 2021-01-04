<template>
    <div
        class="wd-system-overview wd off-user-select"
        :class="{
            'wd-show-effect': showEffect,
            'wd-system-panel-size-compact': localIsCompact,
            'wd-system-panel-size-full': !localIsCompact
        }"
    >
        <div class="wd-content" :class="{'is-compact':localIsCompact, 'without-effect': !showEffect}">
            <div class="wd-content__module">
                <!--       solar system info         -->
                <md-card class="wd-module-card" >
                    <md-card-header>
                        <div class="wd-system-overview__card-header wd-system-overview__header">
                            <div :class="securityClass + ' solar-system-security'">{{security}}</div>
                            <div class="solar-system-name">
                                <a v-if="solarSystemLink !== ''" target="_blank" :href="solarSystemLink + systemName" >{{systemName}}</a>
                                <span v-if="solarSystemLink === ''">{{systemName}}</span>
                            </div>
                            <div class="constellation-name">{{constellationName}}</div>
                            <div class="region-name">{{regionName}}</div>
                        </div>
                    </md-card-header>

                    <md-card-content>
                        <div class="wd-system-overview-content wd flex flex-justify-sb">
                            <div class="wd-system-info wd f-width">
                                <div class="wd-system-info__system-item" >
                                    <span class="wd fg-contrast" >Type</span>
                                    <div class="wd fg-contrast" >
                                        <span :class="kindClass">{{kind}}</span> <span v-if="type != null">(<span :class="typeClass">{{type}}</span>)</span>
                                    </div>
                                </div>
                                <div class="wd-system-info__system-item" v-if="status !== 0" >
                                    <span class="wd fg-contrast" >Status</span>
                                    <div class="wd fg-contrast" >
                                        <span :class="statusClass">{{statusName}}</span>
                                    </div>
                                </div>
                                <div class="wd-system-info__system-item" v-if="statics.length > 0">
                                    <span class="wd fg-contrast">Statics</span>
                                    <div class="text-right wd fg-contrast">
                                        <div v-for="item in statics" :key="item.id">
                                            <span>{{item.id}}</span>
                                            (<span :class="getStaticClassColor(item.type)">{{item.fullName}}</span>)
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </md-card-content>
                </md-card>
            </div>
            <div class="wd-content__module" v-if="localIsCompact || showEffect">
                <!--       Effect   (when full)      -->
                <md-card class="wd-module-card" v-if="!localIsCompact && showEffect">
                    <md-card-header>
                        <div class="wd-system-overview__card-header">
                            <div :class="' ' + effectColor">{{effectName}}</div>
                        </div>
                    </md-card-header>

                    <md-card-content>
                        <div class="effect-bonuses-list">
                            <div :class="item.positive ? 'wd-effect-positive' : 'wd-effect-negative'" v-for="item in effectData" :key="item.description">{{item.description}}</div>
                        </div>
                    </md-card-content>
                </md-card>

                <!--       routes  (when compact)      -->
                <routes
                    :key="routesUpdater"
                    class="wd-module-card"
                    :map-id="mapId"
                    :solar-system-id="solarSystemId"
                    v-if="localIsCompact"
                    @highlight-route="onHighlightRoute"
                    @hubs-updated="onHubsUpdated"
                />
            </div>
            <div class="wd-content__module" v-if="!localIsCompact || showEffect">
                <!--       Effect   (when compact)      -->
                <md-card class="wd-module-card" v-if="localIsCompact && showEffect">
                    <md-card-header>
                        <div class="wd-system-overview__card-header">
                            <div :class="' ' + effectColor">{{effectName}}</div>
                        </div>
                    </md-card-header>

                    <md-card-content>
                        <div class="effect-bonuses-list">
                            <div :class="item.positive ? 'wd-effect-positive' : 'wd-effect-negative'" v-for="item in effectData" :key="item.description">{{item.description}}</div>
                        </div>
                    </md-card-content>
                </md-card>

                <!--       routes  (when full)      -->
                <routes
                    :key="routesUpdater"
                    class="wd-module-card"
                    :map-id="mapId"
                    :solar-system-id="solarSystemId"
                    v-if="!localIsCompact"
                    @highlight-route="onHighlightRoute"
                    @hubs-updated="onHubsUpdated"
                />
            </div>
            <div class="wd-content__module">
                <!--       description      -->
                <md-card class="wd-module-card">
                    <md-card-content>
                        <md-field class="wd-overview-description">
                            <label>Description</label>
                            <md-textarea @input="onDescriptionChange" v-model="description"></md-textarea>
                            <span v-if="savingDescription" class="md-helper-text green">Saving delay (5 seconds)... wait for save.</span>
                        </md-field>
                    </md-card-content>
                </md-card>
            </div>
        </div>
    </div>
</template>

<script>
    import exists from "../../../../js/env/tools/exists";
    import environment from "../../../../js/core/map/environment";
    import SpamFilter from "../../../../js/env/spamFilter.js";
    import Routes from "./Overview/Routes.vue";

    export default {
        name: "Overview",
        components : {
            Routes
        },
        props: {
            isCompact: {
                type: Boolean,
                default: false
            }
        },
        data: function () {
            return {
                saveSigsDialogActive: false,
                signatures: [],
                selected: [],

                regionName: "",
                constellationName: "",
                systemName: "",
                kind: "",
                kindClass: "",
                type: null,
                typeClass: "",
                security: "",
                securityClass: "",
                statics: [],

                showEffect: false,
                effectColor: "",
                effectName: "",
                effectData: [],
                solarSystemLink: "",
                status: 0,
                statusName: "",
                statusClass: "",
                savingDescription: false,

                description: "",
                localIsCompact: this.isCompact,
                mapId: null,
                solarSystemId: null,

                routesUpdater: 0
            }
        },
        watch: {
            isCompact: function (_newVal) {
                this.localIsCompact = _newVal;
            }
        },
        mounted: function () {
            this._sfInput = new SpamFilter(this._inputChanged.bind(this), 5000);
            this._descriptionIsNotSetted = true;
            this.needToSave = true;
        },
        beforeDestroy: function () {

        },
        updated() {
            this.$emit("cupdated")
        },
        methods: {
            onHighlightRoute (route) {
                this.$emit("highlight-route", route);
            },
            onHubsUpdated (hubs) {
                this.$emit("hubs-updated", hubs);
            },
            getStaticClassColor: function (_staticClass) {
                return environment.typeClasses[_staticClass];
            },
            refresh: function () {

            },
            onDescriptionChange (event) {
                if(!this.needToSave) {
                    this.needToSave = true;
                    return;
                }

                this.savingDescription = true;
                this._sfInput.call(event);
            },
            _inputChanged (event) {
                this.savingDescription = false;
                this.$emit("changed", {
                    description: event
                });
            },
            update: function (mapId, _data) {
                this.mapId = mapId;
                this.solarSystemId = _data.id;
                this.systemName = _data.name;
                this.regionName = _data.regionName;
                this.constellationName = _data.constellationName;
                this.security = _data.security;
                this.statics = _data.systemData.statics || [];
                this.securityClass = environment.securityForegroundClasses[_data.security];
                this.kind = _data.systemData.typeDescription;
                this.kindClass = environment.kindClassed[_data.systemType];
                this.status = _data.status;
                this.statusName = environment.statuses[_data.status].name;
                this.statusClass = `eve-system-status-color-${environment.statuses[_data.status].id}`;
                this.updateDescription(_data.description, true);

                switch (_data.systemType) {
                    case 0: // high-sec
                        this.solarSystemLink = "https://evemaps.dotlan.net/system/";
                        this.type = null;
                        break;
                    case 1: // low-sec
                        this.type = null;
                        this.solarSystemLink = "https://evemaps.dotlan.net/system/";
                        break;
                    case 2: // null-sec
                        this.type = null;
                        this.solarSystemLink = "https://evemaps.dotlan.net/system/";
                        break;
                    case 3: // WH
                    case 4: // Thera
                        this.type = _data.systemData.typeName;
                        this.typeClass = environment.typeClasses[_data.systemData.typeName];
                        this.solarSystemLink = "http://anoik.is/systems/";
                        break;
                    case 5: // abyss
                        this.type = _data.systemData.typeName;
                        this.solarSystemLink = "";
                        break;
                    case 6: // penalty?
                    case 7: // Pochven?
                        this.type = null;
                        this.solarSystemLink = "";
                        break;
                }

                if(exists(_data.systemData.effectType)) {
                    this.showEffect = true;
                    this.effectColor = environment.effects[_data.systemData.effectType];
                    this.effectName = _data.systemData.effectName;

                    let sorted = _data.systemData.effectData.sort(function (x, y) {
                        return (x.positive === y.positive) ? 0 : x.positive ? -1 : 1;
                    });

                    this.effectData = sorted;
                } else {
                    this.showEffect = false;
                }
            },
            updateDescription (description, isUpdateModel) {
                if(isUpdateModel && !exists(description) || description.length === 0 || description === this.description) {
                    return;
                }

                if(isUpdateModel)
                    this.description = description;

                if(this._descriptionIsNotSetted) {
                    this._descriptionIsNotSetted = false;
                    this.needToSave = false;
                }
            },
            systemRemoved (/*data*/) {
                this.routesUpdater += 1;
            },
            systemAdded (/*data*/) {
                this.routesUpdater += 1;
            },
            linkRemoved (/*data*/) {
                this.routesUpdater += 1;
            },
            linkUpdated (/*data*/) {
                this.routesUpdater += 1;
            },
            linkAdded (/*data*/) {
                this.routesUpdater += 1;
            },
            addHub (/*solarSystemId*/) {
                this.routesUpdater += 1;
            },
            removeHub (/*solarSystemId*/) {
                this.routesUpdater += 1;
            },
        }
    }

</script>

<style lang="scss">
    @import "/src/css/variables";

    .md-card {
        height: 100%;
    }

    .wd-content {
        display: grid;
        grid-column-gap: 5px;
        grid-row-gap: 5px;

        & > .wd-content__module {
            width: 100%;
            grid-column-start: 1;
            grid-column-end: 3;
        }

        & > .wd-content__module:nth-child(1) {
            grid-column-start: 1;
            grid-column-end: 2;
        }

        & > .wd-content__module:nth-child(2) {
            grid-column-start: 2;
            grid-column-end: 3;
        }

        &.without-effect,
        &.is-compact {
            & > .wd-content__module:nth-child(1),
            & > .wd-content__module:nth-child(2) {
                grid-column-start: 1;
                grid-column-end: 3;
            }
        }
    }

    .wd-system-overview {
        color: $fg-primary;

        .wd-info-block {
            display: flex;
        }

        & > *:not(:last-child) {
            margin-bottom: 10px;
        }

        .md-card-header {
            padding-bottom: 5px;
        }

        .wd-system-overview__card-header {
            border-bottom: 1px solid $border-color-primary-4;
            padding-bottom: 5px;
        }

        .wd-system-overview__header {
            display: flex;
            justify-content: flex-start;
            white-space: nowrap;

            & > div:not(:last-child) {
                margin-right: 5px;
            }

            & > div {
                font-family: sans-serif;
                font-size: 13px;
            }

            & > .solar-system-security {
                font-weight: bold;
            }

            & > .solar-system-name {
                font-weight: bold;
            }

            & > .constellation-name {
                color: #aaaaaa;
            }

            & > .region-name {
                color: #aaaaaa;
            }
        }

        .wd-system-overview-content {

            & > .wd-system-info {
                padding: 0;

                .wd-system-info__system-item {
                    display: flex;
                    justify-content: space-between;
                }
            }

            & > .wd-system-manual-info {

            }
        }

        .wd-system-overview__effect-header {

        }

        .wd-system-overview__card-description {
            color: $fg-contrast;

            .wd-overview-description textarea {
                height: 150px;
            }
        }

        .effect-bonuses-list {
            & > div {
                font: $font-primary;
                color: $fg-contrast;
            }

            & > .wd-effect-positive {
                color: $fg-positive;
            }

            & > .wd-effect-negative {
                color: $fg-negative;
            }
        }
    }
</style>