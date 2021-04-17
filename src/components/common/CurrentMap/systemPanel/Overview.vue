<template>
    <div
        v-if="loadedSolarSystem"
        class="wd-system-overview wd off-user-select"
    >
        <div class="wd-content" :class="gridClass">
            <!--       solar system info         -->
            <div class="wd-content__module wd-module-solar-system">
                <md-card class="wd-module-card" >
                    <md-card-header>
                        <div class="wd-system-overview__card-header wd-system-overview__header">
                            <div :class="securityClass + ' solar-system-security'">{{info.security}}</div>
                            <div class="solar-system-name">
                                <a v-if="solarSystemLink !== ''" target="_blank" :href="solarSystemLink" >{{info.solarSystemName}}</a>
                                <span v-if="solarSystemLink === ''">{{info.solarSystemName}}</span>
                            </div>
                            <div class="constellation-name">{{info.constellationName}}</div>
                            <div class="region-name">{{info.regionName}}</div>
                        </div>
                    </md-card-header>

                    <md-card-content>
                        <div class="wd-system-overview-content wd flex flex-justify-sb">
                            <div class="wd-system-info wd f-width">
                                <div class="wd-system-info__system-item" >
                                    <span class="wd fg-contrast" >Type</span>
                                    <div class="wd fg-contrast" >
                                        <span :class="typeDescriptionClass">{{info.typeDescription}}</span> <span v-if="hasType">(<span :class="typeClass">{{typeName}}</span>)</span>
                                    </div>
                                </div>
                                <div class="wd-system-info__system-item" v-if="status !== 0" >
                                    <span class="wd fg-contrast" >Status</span>
                                    <div class="wd fg-contrast" >
                                        <span :class="statusClass">{{statusName}}</span>
                                    </div>
                                </div>
                                <div class="wd-system-info__system-item" v-if="info.statics.length > 0">
                                    <span class="wd fg-contrast">Statics</span>
                                    <div class="text-right wd fg-contrast">
                                        <div v-for="item in info.statics" :key="item.id">
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

            <!--       Effect   -->
            <div class="wd-content__module wd-module-effect">
                <md-card class="wd-module-card" v-if="hasEffect">
                <md-card-header>
                    <div class="wd-system-overview__card-header">
                        <div :class="effectClass">{{info.effectName}}</div>
                    </div>
                </md-card-header>

                <md-card-content>
                    <div class="effect-bonuses-list">
                        <div :class="item.positive ? 'wd-effect-positive' : 'wd-effect-negative'" v-for="item in effectData" :key="item.description">{{item.description}}</div>
                    </div>
                </md-card-content>
            </md-card>
            </div>

            <!--       routes      -->
            <div class="wd-content__module wd-module-routes">
                <routes
                    class="wd-module-card"
                    :map-id="lMapId"
                    :solar-system-id="lSolarSystemId"
                    @highlight-route="onHighlightRoute"
                />
            </div>

            <!--       description      -->
            <div class="wd-content__module wd-module-description">
                <md-card class="wd-module-card">
                    <md-card-content>
                        <md-field class="wd-overview-description">
                            <label>Description</label>
                            <md-textarea @input="onDescriptionChange" v-model="description"></md-textarea>
                            <span v-if="savingDescription" class="md-helper-text green">Saving delay ({{savingDelay}} seconds)... wait for save.</span>
                        </md-field>
                    </md-card-content>
                </md-card>
            </div>

        </div>
    </div>
</template>

<script>
    import environment from "../../../../js/core/map/environment";
    import SpamFilter from "../../../../js/env/spamFilter.js";
    import Routes from "./Overview/Routes.vue";
    import IntervalEmitter from "../../../../js/env/intervalEmitter.js";
    import cache from "../../../../js/cache/cache.js";
    import api from "../../../../js/api.js";
    import helper from "../../../../js/utils/helper.js";
    import SolarSystemMixin from "../../../mixins/solarSystem.js";

    export default {
        name: "Overview",
        mixins: [SolarSystemMixin],
        components : {Routes},
        props: {
            isCompact: {
                type: Boolean,
                default: false
            },
        },
        data: function () {
            return {
                savingDescription: false,
                description: "",
                lIsCompact: this.isCompact,
                savingDelay: 3
            }
        },
        watch: {
            isCompact: function (_newVal) {
                this.lIsCompact = _newVal;
            }
        },
        beforeDestroy() {
            this._descIE.stop();
        },
        mounted: function () {
            this._descIE = new IntervalEmitter(3000, 100);
            this._descIE.on("interval", delta => this.savingDelay = (delta / 1000).toFixed(1));

            this._sfInput = new SpamFilter(this._inputChanged.bind(this), 3000);
            this._descriptionIsNotSetted = true;
            this.needToSave = true;
        },
        updated() {
            this.$emit("cupdated")
        },
        computed : {
            statusClass () {
                let status = this.$store.state.maps[this.lMapId].solarSystems[this.lSolarSystemId].status;
                return `eve-system-status-color-${environment.statuses[status].id}`
            },
            statusName () {
                let status = this.$store.state.maps[this.lMapId].solarSystems[this.lSolarSystemId].status;
                return environment.statuses[status].name;
            },
            status () {
                return this.$store.state.maps[this.lMapId].solarSystems[this.lSolarSystemId].status;
            },
            info () {
                return this.$store.state.solarSystems[this.lSolarSystemId];
            },
            hasEffect() {
                return this.info.effectName !== "";
            },
            effectClass () {
                return environment.effects[this.info.effectType];
            },
            typeDescriptionClass () {
                return environment.kindClassed[this.info.systemType];
            },
            effectData () {
                // eslint-disable-next-line vue/no-side-effects-in-computed-properties
                return this.info.effectData.sort((x, y) => {
                    return (x.positive === y.positive) ? 0 : x.positive ? -1 : 1;
                });
            },
            securityClass () {
                return environment.securityForegroundClasses[this.info.security];
            },

            solarSystemLink () {
                switch (this.info.systemType) {
                    case 0: // high-sec
                    case 1: // low-sec
                    case 2: // null-sec
                        return "https://evemaps.dotlan.net/system/" + this.info.solarSystemName;
                    case 3: // WH
                    case 4: // Thera
                        return "http://anoik.is/systems/" + this.info.solarSystemName;
                    default:
                        return "";
                }
            },
            hasType () {
                switch (this.info.systemType) {
                    case 3: // WH
                    case 4: // Thera
                    case 5: // abyss
                        return true;
                    default:
                        return false;
                }
            },
            typeName () {
                switch (this.info.systemType) {
                    case 3: // WH
                    case 4: // Thera
                    case 5: // abyss
                        return this.info.typeName;
                    default:
                        return "";
                }
            },
            typeClass () {
                switch (this.info.systemType) {
                    case 3: // WH
                    case 4: // Thera
                        return environment.typeClasses[this.info.typeName];
                    default:
                        return "";
                }
            },

            gridClass () {
                let full = !this.lIsCompact;
                let effect = this.hasEffect;

                if(full && effect) {
                    return "wd-grid-1";
                } else if(!full && effect) {
                    return "wd-grid-2";
                } else if(full && !effect || !full && !effect) {
                    return "wd-grid-3";
                }

                return  "";
            }
        },
        methods: {
            watchAttrsUpdatedSolarSystem () {
                this._sfInput.stop();
                this._descIE.stop();
                this._descriptionIsNotSetted = false;
                this.savingDescription = false;
                this.needToSave = true;

                SolarSystemMixin.methods.watchAttrsUpdatedSolarSystem.call(this);
            },
            onLoadedSolarSystem () {
                SolarSystemMixin.methods.onLoadedSolarSystem.call(this);

                let mapSolarSystemProvider = cache.maps.list.get(this.lMapId).solarSystems.list.get(this.lSolarSystemId);
                mapSolarSystemProvider.on("changed", this._onSSDynamicChanged.bind(this));
            },
            _onSSDynamicChanged (data) {
                if(data.description !== this.description) {
                    this.description = data.description;
                }

                if(this._descriptionIsNotSetted) {
                    this._descriptionIsNotSetted = false;
                    this.needToSave = true;
                }
            },
            getStaticClassColor: function (_staticClass) {
                return environment.typeClasses[_staticClass];
            },

            onHighlightRoute (route) {
                this.$emit("highlight-route", route);
            },
            onDescriptionChange (event) {
                if(!this.needToSave) {
                    this.needToSave = true;
                    return;
                }

                this._descIE.start();
                this.savingDelay = 3;
                this.savingDescription = true;
                this._sfInput.call(event);
            },
            _inputChanged (description) {
                this.savingDescription = false;

                api.eve.map.solarSystem.update(this.lMapId, this.lSolarSystemId, {description})
                    .then(
                        helper.dummy,
                        err => helper.errorHandler(this, err)
                    );
            }
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
            transition: height 200ms;
            height: auto;
            width: 100%;
        }

        &.wd-grid-1 {
            & > .wd-content__module {
                transition: height 200ms;
                height: auto;
                width: 100%;

                &.wd-module-solar-system {
                    grid-column-start: 1;
                    grid-column-end: 3;
                    grid-row-start: 1;
                    grid-row-end: 2;
                }
                &.wd-module-effect {
                    grid-column-start: 3;
                    grid-column-end: 6;
                    grid-row-start: 1;
                    grid-row-end: 2;
                }
                &.wd-module-routes {
                    grid-column-start: 1;
                    grid-column-end: 6;
                    grid-row-start: 2;
                    grid-row-end: 3;
                }
                &.wd-module-description {
                    grid-column-start: 1;
                    grid-column-end: 6;
                    grid-row-start: 3;
                    grid-row-end: 4;
                }
            }
        }

        &.wd-grid-2 {
            & > .wd-content__module {
                transition: height 200ms;
                height: auto;
                width: 100%;

                &.wd-module-solar-system {
                    grid-column-start: 1;
                    grid-column-end: 2;
                    grid-row-start: 1;
                    grid-row-end: 2;
                }
                &.wd-module-effect {
                    grid-column-start: 1;
                    grid-column-end: 2;
                    grid-row-start: 3;
                    grid-row-end: 4;
                }
                &.wd-module-routes {
                    grid-column-start: 1;
                    grid-column-end: 2;
                    grid-row-start: 2;
                    grid-row-end: 3;
                }
                &.wd-module-description {
                    grid-column-start: 1;
                    grid-column-end: 2;
                    grid-row-start: 4;
                    grid-row-end: 5;
                }
            }
        }

        &.wd-grid-3 {
            & > .wd-content__module {
                transition: height 200ms;
                height: auto;
                width: 100%;

                &.wd-module-solar-system {
                    grid-column-start: 1;
                    grid-column-end: 2;
                    grid-row-start: 1;
                    grid-row-end: 2;
                }
                &.wd-module-effect {
                    display: none;
                }
                &.wd-module-routes {
                    grid-column-start: 1;
                    grid-column-end: 2;
                    grid-row-start: 2;
                    grid-row-end: 3;
                }
                &.wd-module-description {
                    grid-column-start: 1;
                    grid-column-end: 2;
                    grid-row-start: 3;
                    grid-row-end: 4;
                }
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


        height: 100%;
        overflow-y: auto;

        &::-webkit-scrollbar {
            width: 5px;
        }

        &::-webkit-scrollbar:hover {

        }

        &::-webkit-scrollbar-track {
            background: rgba(0, 0, 0, 0.0);
        }

        &::-webkit-scrollbar-thumb {
            transition: background-color 200ms;
            width: 6px;
            border-radius: 3px;
            background-color: rgba(158, 140, 140, 0.5);
            cursor: pointer;
        }

        &::-webkit-scrollbar-thumb:hover {
            background-color: rgba(205, 166, 87, 0.5);
        }
    }
</style>