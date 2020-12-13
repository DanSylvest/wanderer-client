<template>
    <div class="wd-system-overview wd off-user-select" :class="{'wd-show-effect': showEffect}">
        <div class="wd-info-block wd" :class="{'margin-bottom-primary': showEffect}">

            <md-card class="wd-info-block__card-info" >
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

            <md-card class="wd-info-block__card-effect" v-if="showEffect">
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
        </div>

        <md-card class="wd-system-overview__card-description">
            <md-card-header>
                <div class="wd-system-overview__card-header">
                    <div>Description</div>
                </div>
            </md-card-header>

            <md-card-content>

            </md-card-content>
        </md-card>

    </div>
</template>

<script>
    import exists from "../../../../js/env/tools/exists";
    import environment from "../../../../js/core/map/environment";
    // import SizeObserver from "../../../../js/env/sizeObserver";

    export default {
        name: "Overview",
        props: [

        ],
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
                solarSystemLink: ""
            }
        },
        mounted: function () {
            // this._so = new SizeObserver(this.$el, this._onResize.bind(this));

        },
        beforeDestroy: function () {
            // this._so.destructor();
            // delete this._so;
        },
        updated() {
            this.$emit("cupdated")
        },
        methods: {
            getStaticClassColor: function (_staticClass) {
                return environment.typeClasses[_staticClass];
            },

            _onResize: function () {
                // eslint-disable-next-line no-debugger
                debugger;
            },
            refresh: function () {

            },
            update: function (_data) {
                this.systemName = _data.name;
                this.regionName = _data.regionName;
                this.constellationName = _data.constellationName;
                this.security = _data.security;
                this.statics = _data.systemData.statics || [];
                this.securityClass = environment.securityClasses[_data.security];
                this.kind = _data.systemData.typeDescription;

                switch (_data.systemType) {
                    case 0: // high-sec
                        this.kindClass = environment.kindClassed[_data.systemType];
                        this.solarSystemLink = "https://evemaps.dotlan.net/system/";
                        this.type = null;
                        break;
                    case 1: // low-sec
                        this.kindClass = environment.kindClassed[_data.systemType];
                        this.type = null;
                        this.solarSystemLink = "https://evemaps.dotlan.net/system/";
                        break;
                    case 2: // null-sec
                        this.kindClass = environment.kindClassed[_data.systemType];
                        this.type = null;
                        this.solarSystemLink = "https://evemaps.dotlan.net/system/";
                        break;
                    case 3: // WH
                    case 4: // Thera
                        this.kindClass = environment.kindClassed[_data.systemType];
                        this.type = _data.systemData.typeName;
                        this.typeClass = environment.typeClasses[_data.systemData.typeName];
                        this.solarSystemLink = "http://anoik.is/systems/";
                        break;
                    case 5: // abyss
                        this.kindClass = environment.kindClassed[_data.systemType];
                        this.type = _data.systemData.typeName;
                        this.solarSystemLink = "";
                        break;
                    case 6: // penalty?
                    case 7: // Pochven?
                        this.kindClass = environment.kindClassed[_data.systemType];
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

                // debugger;
            }
        }
    }

</script>

<style lang="scss">
    @import "/src/css/variables";

    .wd-system-overview {
        color: $fg-primary;

        .wd-info-block {
            display: flex;
        }

        .md-card-header {
            padding-bottom: 5px;
        }

        & {
            &__card-header {
                border-bottom: 1px solid $border-color-primary-4;
                padding-bottom: 5px;
            }
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
                /*color: #848484;*/
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


    .wd-system-panel-size-compact {
        &.wd-system-overview {
            display: flex;
            flex-wrap: wrap;

            .wd-info-block {
                width: 100%;
                margin-bottom: 10px;

                &__card-info {
                    width: 100%;
                }
            }

            .wd-system-overview__card-description {
                width: 100%;
            }
        }

        &.wd-system-overview.wd-show-effect {
            display: initial;

            .wd-info-block {
                flex-wrap: wrap;

                & {
                    &__card-info {
                        width: 100%;
                        margin-bottom: 10px;
                    }

                    &__card-effect {
                        width: 100%;
                    }
                }
            }

            .wd-system-overview__card-description {
                width: initial;
            }
        }
    }

    .wd-system-panel-size-full {

        &.wd-system-overview {
            display: flex;

            .wd-info-block {
                flex-wrap: initial;
                width: 400px;
                margin-right: 10px;

                & {
                    &__card-info {
                        width: 100%;
                    }

                    &__card-effect {
                        width: initial;
                    }
                }
            }

            .wd-system-overview__card-description {
                width: 70%;
            }
        }

        &.wd-system-overview.wd-show-effect {
            display: initial;

            .wd-info-block {
                width: initial;
                margin-right: initial;

                & {
                    &__card-info {
                        width: 400px;
                        margin-right: 10px;
                    }

                    &__card-effect {
                        width: 70%;
                    }

                    &__card-description {
                        width: 100%;
                    }
                }
            }

            .wd-system-overview__card-description {
                width: initial;
            }
        }
    }
</style>