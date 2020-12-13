<template>
    <div class="wd-system-card">
        <div v-show="!loaded" >
            <md-progress-spinner class="md-accent" :md-stroke="2" :md-diameter="30" md-mode="indeterminate"></md-progress-spinner>
        </div>
        <div v-show="loaded">
            <div class="wd-system-card__header">
                <div :class="securityClass + ' solar-system-security'">{{securityStatus}}</div>
                <div class="solar-system-name">{{solarSystemName}}</div>
                <div class="solar-system-effect wd-color-primary-2" v-if="showEffect">
                    [<span :class="effectClass">{{effectName}}</span>]
                </div>
                <div class="constellation-name">{{constellationName}}</div>
                <div class="region-name">{{regionName}}</div>
            </div>
            <div class="wd-system-card__divider" v-show="characters.length > 0"></div>
            <div class="wd-system-card__content" v-show="characters.length > 0">
                <div class="solar-system-local">
                    <div class="solar-system-local-character" v-for="item in characters" :key="item.name">
                        <span :class="{'solar-system-local-name':true, 'solar-system-local-name-own': item.isOwn}">{{item.name}}</span>
                        -
                        (<span class="eve-card-local-ship">{{item.ship}}</span>)
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
    import api from "../../../js/api";
    import environment from "../../../js/core/map/environment";
    import exists from "../../../js/env/tools/exists";

    export default {
        name: "SystemCard",
        props: {
            cSolarSystemId: {
                type: String,
                default: null
            },
            cMapId: {
                type: String,
                default: null
            }
        },
        data: function () {
            return {
                loaded: false,
                solarSystemId: this.cSolarSystemId,
                mapId: this.cMapId,
                solarSystemName: "",
                constellationName: "",
                regionName: "",
                securityStatus: "",
                characters: [],
                securityClass: "",
                showEffect: false,
                effectClass: "",
                effectName: ""
            }
        },
        mounted: function () {

            api.eve.map.solarSystem.info(this.mapId, this.solarSystemId).then(function(_data){
                this.loaded = true;
                this.solarSystemName = _data.name;
                this.constellationName = _data.constellationName;
                this.regionName = _data.regionName;
                this.securityStatus = _data.security;
                this.securityClass = environment.securityClasses[_data.security];

                if(/*_data.systemType === 3 && */exists(_data.systemData.effectType)) {
                    this.showEffect = true;
                    this.effectClass = environment.effects[_data.systemData.effectType];
                    this.effectName = _data.systemData.effectName;
                } else {
                    this.showEffect = false;
                }

                return Promise.all(_data.onlineCharacters.map(function (_characterId) {
                    return api.eve.character.info(_characterId, "all")
                }.bind(this)));

            }.bind(this)).then(function(_characters){
                this.characters = _characters;
                // eslint-disable-next-line no-unused-vars
            }.bind(this)).catch(function(_err){
                // eslint-disable-next-line no-debugger
                debugger
            }.bind(this))
        },
        beforeDestroy: function () {


        },
        methods: {
            // API
            refresh: function () {

            }
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