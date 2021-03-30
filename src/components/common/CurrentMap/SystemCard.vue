<template>
    <div class="wd-system-card">
        <div v-show="!loaded" >
            <md-progress-spinner class="md-accent" :md-stroke="2" :md-diameter="30" md-mode="indeterminate"></md-progress-spinner>
        </div>
        <div v-show="loaded">
            <div class="wd-system-card__header">
                <div :class="getTypeNameClasses()">{{getTypeName()}}</div>
                <div class="solar-system-name">{{info().solarSystemName}}</div>
                <div class="solar-system-effect wd-color-primary-2" v-if="hasEffect()">
                    [<span :class="getEffectClass()">{{info().effectName}}</span>]
                </div>
                <div class="constellation-name">{{info().constellationName}}</div>
                <div class="region-name">{{info().regionName}}</div>
                <div class="solar-system-effect wd-color-primary-2" v-if="status !== 0">
                    (<span :class="statusClass">{{statusName}}</span>)
                </div>
            </div>
            <div class="wd-system-card__divider" v-show="onlineCount > 0"></div>
            <div class="wd-system-card__content" v-show="onlineCount > 0">
                <local :map-id="mapId" :solar-system-id="solarSystemId" />
            </div>
        </div>
    </div>
</template>

<script>
    import api from "../../../js/api";
    import environment from "../../../js/core/map/environment";
    import extend from "../../../js/env/tools/extend.js";
    import helper from "../../../js/utils/helper.js";
    import cache from "../../../js/cache/cache.js";
    import Local from "./SolarSystem/Local.vue";

    export default {
        name: "SystemCard",
        components: {Local},
        props: {
            cSolarSystemId: {
                type: String,
                default: null
            },
            cMapId: {
                type: String,
                default: null
            },
            data: {
                type: Object,
                default: null
            },
            isLoadCharData: {
                type: Boolean,
                default: true
            }
        },
        data: function () {
            return {
                loaded: false,
                solarSystemId: this.cSolarSystemId,
                mapId: this.cMapId,
                characters: [],
                localData: this.data,
                localIsLoadCharData: this.isLoadCharData,
            }
        },
        mounted: function () {

        },
        beforeDestroy() {
            this.solarSystemInfo && this.solarSystemInfo.unsubscribe();
            this.solarSystemInfo = null;

            this._mapSolarSystem && this._mapSolarSystem.unsubscribe();
            delete this._mapSolarSystem;

            this._map && this._map.unsubscribe();
            delete this._map;
        },
        beforeMount() {
            this.solarSystemInfo = cache.solarSystems.touch(this.solarSystemId);

            this._map = cache.maps.touch(this.mapId);
            this._mapSolarSystem = this._map.item.solarSystems.touch(this.solarSystemId);

            Promise.all([
                this.solarSystemInfo.item.readyPromise(),
                this._mapSolarSystem.item.readyPromise(),
            ])
                .then(this._onLoaded.bind(this));
        },
        computed : {
            statusClass () {
                let status = this.$store.state.maps[this.mapId].solarSystems[this.solarSystemId].status;
                return `eve-system-status-color-${environment.statuses[status].id}`
            },
            statusName () {
                let status = this.$store.state.maps[this.mapId].solarSystems[this.solarSystemId].status;
                return environment.statuses[status].name;
            },
            status () {
                return this.$store.state.maps[this.mapId].solarSystems[this.solarSystemId].status;
            },
            onlineCount () {
                return this.$store.state.maps[this.mapId].solarSystems[this.solarSystemId].onlineCount;
            }
        },
        methods: {
            _onLoaded () {
                this.loaded = true;

                // eslint-disable-next-line no-unused-vars
                // let dynamicData = this._mapSolarSystem.item.data()
                // eslint-disable-next-line no-debugger
              // debugger
            },
            setData (_data) {
                _data.systemData && extend(_data, _data.systemData)
                this.systemData = _data;

                this.loaded = true;

                if(this.localIsLoadCharData) {
                    Promise.all(_data.onlineCharacters.map(x => api.eve.character.info(x)))
                        .then(
                            data => this.characters = data,
                            err => helper.errorHandler(this, err)
                        );
                }
            },

            // API
            refresh: function () {

            },

            info () {
                return this.$store.state.solarSystems[this.solarSystemId];
            },

            getTypeName () {
                switch (this.info().systemType) {
                    case 0: // high-sec
                    case 1: // low-sec
                    case 2: // null-sec
                        return this.info().security;
                    case 3: // WH
                    case 4: // Thera
                        return this.info().typeName;
                    case 5: // abyss
                    case 6: // penalty?
                    case 7: // Pochven?
                        return this.info().security;
                }
            },
            getTypeNameClasses () {
                switch (this.info().systemType) {
                    case 0: // high-sec
                    case 1: // low-sec
                    case 2: // null-sec
                        return environment.securityForegroundClasses[this.info().security];
                    case 3: // WH
                    case 4: // Thera
                        return environment.typeClasses[this.info().typeName];
                    case 5: // abyss
                    case 6: // penalty?
                    case 7: // Pochven?
                        return environment.kindClassed[this.info().systemType];
                }
            },
            getEffectClass () {
                return environment.effects[this.info().effectType];
            },
            hasEffect() {
                return this.info().effectName !== "";
            },

        }
    }
</script>

<style lang="scss">
    @import "/src/css/variables";
    @import "~vue-material/dist/theme/engine";
    $character-color-1: md-get-palette-color(orange, 500);

    .wd-system-card {
        background-color: $bg-secondary;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        padding: 5px 10px;
        box-sizing: border-box;
        min-width: 100px;

        & {
            &__header {
                display: flex;
                justify-content: flex-start;
                white-space: nowrap;

                & > div:not(:last-child) {
                    margin-right: 5px;
                }

                & > div {
                    font-family: sans-serif;
                    font-size: 11px;
                }

                & > .solar-system-security,
                & > .solar-system-effect,
                & > .solar-system-name {
                    font-weight: bold;
                }

                & > .constellation-name {
                    color: $fg-primary-2;
                }

                & > .region-name {
                    color: $fg-primary-2;
                }
            }
            &__divider {
                border-bottom: 1px solid $border-color-primary-4;
            }
            &__content {
                transition: all 200ms;

                padding-top: 5px;
                padding-bottom: 5px;
                box-sizing: border-box;

                & > div {
                    line-height: 14px;
                    /*font-weight: bold;*/
                    font-family: sans-serif;
                    color: #848484;
                    font-size: 11px;
                }

                .solar-system-local {
                    .solar-system-local-name {
                        font-weight: bold;
                        color: #006890;
                    }
                    .solar-system-local-name.solar-system-local-name-own {
                        color: $character-color-1;
                    }
                    .solar-system-local-ship {
                        font-weight: bold;
                    }
                }
            }
        }
    }
</style>