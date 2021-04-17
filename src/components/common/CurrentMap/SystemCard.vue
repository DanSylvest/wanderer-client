<template>
    <div class="wd-system-card">
        <div v-show="!loadedSolarSystem" >
            <md-progress-spinner class="md-accent" :md-stroke="2" :md-diameter="30" md-mode="indeterminate"></md-progress-spinner>
        </div>
        <div v-show="loadedSolarSystem">
            <div v-if="loadedSolarSystem">
            <div class="wd-system-card__header">
                <div :class="getTypeNameClasses">{{getTypeName}}</div>
                <div class="solar-system-name">{{info.solarSystemName}}</div>
                <div class="solar-system-effect wd-color-primary-2" v-if="hasEffect">
                    [<span :class="getEffectClass">{{info.effectName}}</span>]
                </div>
                <div class="constellation-name">{{info.constellationName}}</div>
                <div class="region-name">{{info.regionName}}</div>
                <div class="solar-system-effect wd-color-primary-2" v-if="lExistsOnMap && status !== 0">
                    (<span :class="statusClass">{{statusName}}</span>)
                </div>
            </div>
            <!-- Offline part -->
            <template v-if="lExistsOnMap">
                <div class="wd-system-card__divider" v-show="onlineCount > 0"></div>
                <div class="wd-system-card__content" v-show="onlineCount > 0">
                    <local :map-id="mapId" :solar-system-id="solarSystemId" />
                </div>
            </template>
            </div>
        </div>
    </div>
</template>

<script>
    import environment from "../../../js/core/map/environment";
    import Local from "./SolarSystem/Local.vue";
    import SolarSystemMixin from "../../mixins/solarSystem.js";

    export default {
        name: "SystemCard",
        mixins: [SolarSystemMixin],
        components: {Local},
        props: {
            isLoadCharData: {
                type: Boolean,
                default: true
            },
            existsOnMap: {
                type: Boolean,
                default: false
            }
        },
        data: function () {
            return {
                lExistsOnMap: this.existsOnMap,
                isLoadDynamicSSData: this.lExistsOnMap,
                characters: []
            }
        },
        computed : {
            statusClass () {
                let status = this.$store.state.maps[this.mapId].solarSystems[this.solarSystemId].status;
                if(!status)
                    return "";

                return `eve-system-status-color-${environment.statuses[status].id}`
            },
            statusName () {
                let status = this.$store.state.maps[this.mapId].solarSystems[this.solarSystemId].status;
                if(!status)
                    return "";

                return environment.statuses[status].name;
            },
            status () {
                return this.$store.state.maps[this.mapId].solarSystems[this.solarSystemId].status;
            },
            onlineCount () {
                return this.$store.state.maps[this.mapId].solarSystems[this.solarSystemId].onlineCount;
            },
            info () {
                return this.$store.state.solarSystems[this.solarSystemId];
            },
            getTypeName () {
                switch (this.info.systemType) {
                    case 0: // high-sec
                    case 1: // low-sec
                    case 2: // null-sec
                        return this.info.security;
                    case 3: // WH
                    case 4: // Thera
                        return this.info.typeName;
                    case 5: // abyss
                    case 6: // penalty?
                    case 7: // Pochven?
                        return this.info.security;
                }
                return "";
            },
            getTypeNameClasses () {
                switch (this.info.systemType) {
                    case 0: // high-sec
                    case 1: // low-sec
                    case 2: // null-sec
                        return environment.securityForegroundClasses[this.info.security];
                    case 3: // WH
                    case 4: // Thera
                        return environment.typeClasses[this.info.typeName];
                    case 5: // abyss
                    case 6: // penalty?
                    case 7: // Pochven?
                        return environment.kindClassed[this.info.systemType];
                }
                return "";
            },
            getEffectClass () {
                return environment.effects[this.info.effectType];
            },
            hasEffect() {
                return this.info.effectName !== "";
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
            }
        }
    }
</style>